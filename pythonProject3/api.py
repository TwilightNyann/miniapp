from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from config import WEBAPP_URL, logger
from database import SessionLocal
from models import PhotoSession, PhotoSessionCreate
from bot_handlers import bot, ADMIN_IDS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[WEBAPP_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/book_session")
async def book_session(session: PhotoSessionCreate):
    with SessionLocal() as db:
        try:
            session_date = date.fromisoformat(session.date)
            db_session = PhotoSession(
                name=session.name,
                email=session.email,
                phone=session.phone,
                description=session.description,
                date=session_date
            )
            db.add(db_session)
            db.commit()

            notification_errors = []
            for admin_id in ADMIN_IDS:
                try:
                    text = (
                        "🆕 Новая запись на фотосессию!\n\n"
                        f"👤 Имя: {session.name}\n"
                        f"📧 Email: {session.email}\n"
                        f"📱 Телефон: {session.phone}\n"
                        f"📅 Дата: {session.date}\n"
                        f"📝 Описание: {session.description}"
                    )
                    await bot.send_message(admin_id, text)
                except Exception as e:
                    notification_errors.append(f"Failed to send notification to admin {admin_id}: {e}")
                    logger.error(f"Failed to send notification to admin {admin_id}: {e}")

            if notification_errors:
                logger.warning("Some notifications failed to send: " + "; ".join(notification_errors))

            return {"message": "Фотосессия успешно забронирована", "id": db_session.id}

        except ValueError as e:
            logger.error(f"Invalid date format: {e}")
            db.rollback()
            raise HTTPException(status_code=400, detail="Неверный формат даты")
        except Exception as e:
            logger.error(f"Error booking session: {e}")
            db.rollback()
            raise HTTPException(status_code=500, detail="Ошибка при бронировании фотосессии")