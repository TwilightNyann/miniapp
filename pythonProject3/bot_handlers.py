from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo
from aiogram import F
from config import API_TOKEN, ADMIN_IDS, WEBAPP_URL, logger
from database import SessionLocal
from models import PhotoSession

bot = Bot(token=API_TOKEN)
dp = Dispatcher()


def is_admin(user_id: int) -> bool:
    return user_id in ADMIN_IDS


@dp.message(Command(commands=['start', 'help']))
async def send_welcome(message: types.Message):
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
        [types.InlineKeyboardButton(
            text="Забронювати фотосесію",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])
    await message.reply(
        "Привіт! Натисни кнопу нижче для бронювання фотосесії.",
        reply_markup=keyboard
    )


@dp.message(Command(commands=['admin']))
async def admin_menu(message: types.Message):
    if not is_admin(message.from_user.id):
        await message.reply("Відсутній доступ.")
        return

    keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
        [types.InlineKeyboardButton(text="📋 Показать всі записи", callback_data="show_all")],
        [types.InlineKeyboardButton(text="🗑 Видалити запис", callback_data="delete_menu")]
    ])
    await message.reply("Панель адміністратор:", reply_markup=keyboard)


@dp.callback_query(F.data == "show_all")
async def show_all_records(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Доступ заборонено")
        return

    try:
        await callback.answer()

        with SessionLocal() as db:
            records = db.query(PhotoSession).order_by(PhotoSession.date.desc()).all()

            if not records:
                await callback.message.answer("База данних порожня")
                return

            for record in records:
                keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
                    [types.InlineKeyboardButton(
                        text="🗑 Видалити",
                        callback_data=f"delete_{record.id}"
                    )]
                ])

                text = (
                    f"📝 Запис #{record.id}\n"
                    f"👤 Ім'я: {record.name}\n"
                    f"📧 Email: {record.email}\n"
                    f"📱 Телефон: {record.phone}\n"
                    f"📅 Дата: {record.date}\n"
                    f"📝 Опис: {record.description}"
                )
                await callback.message.answer(text, reply_markup=keyboard)

    except Exception as e:
        logger.error(f"Error in show_all_records: {e}")
        await callback.message.answer("Ми отримали помилку, спробуйте пізніше.")


@dp.callback_query(F.data == "delete_menu")
async def delete_menu(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Доступ заборонено")
        return

    try:
        await callback.answer()

        with SessionLocal() as db:
            records = db.query(PhotoSession).order_by(PhotoSession.date.desc()).all()

            if not records:
                await callback.message.answer("База данних порожня")
                return

            keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
                [types.InlineKeyboardButton(
                    text=f"#{record.id} - {record.name} ({record.date})",
                    callback_data=f"delete_{record.id}"
                )] for record in records
            ])

            await callback.message.answer(
                "Виберіть запис для видалення:",
                reply_markup=keyboard
            )

    except Exception as e:
        logger.error(f"Error in delete_menu: {e}")
        await callback.message.answer("Ми отримали помилку, спробуйте пізніше.")


@dp.callback_query(lambda c: c.data and c.data.startswith('delete_'))
async def delete_record(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Доступ заборонено")
        return

    try:
        record_id = int(callback.data.split('_')[1])

        with SessionLocal() as db:
            record = db.query(PhotoSession).filter(PhotoSession.id == record_id).first()

            if not record:
                await callback.answer("Запис не знайдено")
                return

            # Создаем клавиатуру для подтверждения
            keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
                [
                    types.InlineKeyboardButton(text="✅ Так", callback_data=f"confirm_delete_{record_id}"),
                    types.InlineKeyboardButton(text="❌ Ні", callback_data="cancel_delete")
                ]
            ])

            await callback.message.answer(
                f"Ви впевнені, що хочете видалити запис #{record_id}?\n"
                f"Ім'я: {record.name}\n"
                f"Дата: {record.date}",
                reply_markup=keyboard
            )
            await callback.answer()

    except Exception as e:
        logger.error(f"Error in delete_record: {e}")
        await callback.message.answer("Ми отримали помилку, спробуйте пізніше.")


@dp.callback_query(lambda c: c.data and c.data.startswith('confirm_delete_'))
async def confirm_delete(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Доступ заборонено")
        return

    try:
        record_id = int(callback.data.split('_')[2])

        with SessionLocal() as db:
            record = db.query(PhotoSession).filter(PhotoSession.id == record_id).first()

            if not record:
                await callback.answer("Запис не знайдено")
                return

            db.delete(record)
            db.commit()

            await callback.message.answer(f"✅ Запис #{record_id} видалений")
            await callback.answer()

    except Exception as e:
        logger.error(f"Error in confirm_delete: {e}")
        await callback.message.answer("Ми отримали помилку, спробуйте пізніше.")


@dp.callback_query(F.data == "cancel_delete")
async def cancel_delete(callback: types.CallbackQuery):
    await callback.message.answer("❌ Видалення відмінено")
    await callback.answer()