from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel

Base = declarative_base()

class PhotoSession(Base):
    __tablename__ = "photo_sessions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String)
    description = Column(String)
    date = Column(Date)

class PhotoSessionCreate(BaseModel):
    name: str
    email: str
    phone: str
    description: str
    date: str

    class Config:
        from_attributes = True