from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base

engine = create_engine("sqlite:///./photo_sessions.db")
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(bind=engine)