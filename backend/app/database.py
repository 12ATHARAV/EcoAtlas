from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

import os
from pathlib import Path

# Handle Postgres SSL / connection URLs
db_url = settings.DATABASE_URL
if not db_url:
    # Auto-detect ecoatlas.db location
    backend_db = Path(__file__).resolve().parent.parent / "ecoatlas.db"
    root_db = Path(__file__).resolve().parent.parent.parent / "ecoatlas.db"
    if backend_db.exists():
        db_url = f"sqlite:///{backend_db.as_posix()}"
    elif root_db.exists():
        db_url = f"sqlite:///{root_db.as_posix()}"
    else:
        db_url = f"sqlite:///{backend_db.as_posix()}"

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
