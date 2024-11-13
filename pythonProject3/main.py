import asyncio
import multiprocessing
import uvicorn
from config import logger
from bot_handlers import bot, dp


async def run_bot():
    logger.info("Starting bot...")
    await dp.start_polling(bot)


def run_api():
    logger.info("Starting API server...")
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    api_process = multiprocessing.Process(target=run_api)
    api_process.start()

    asyncio.run(run_bot())