import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, Date, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    project_type = Column(String(50), default="carbon") # carbon, biodiversity, mixed
    status = Column(String(50), default="active")
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="projects")
    sites = relationship("Site", back_populates="project", cascade="all, delete-orphan")

class Site(Base):
    __tablename__ = "sites"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    # GeoJSON geometry stored as structured JSON
    geometry = Column(JSON, nullable=False)
    area_hectares = Column(Float, default=0.0)
    centroid_lat = Column(Float, nullable=True)
    centroid_lng = Column(Float, nullable=True)
    region = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="sites")
    analytics = relationship("AnalyticsData", back_populates="site", cascade="all, delete-orphan")

class AnalyticsData(Base):
    __tablename__ = "analytics_data"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    site_id = Column(String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_date = Column(Date, nullable=False, index=True)
    ndvi = Column(Float, nullable=False) # 0.0 to 1.0 (vegetation health)
    carbon_stock_tonnes = Column(Float, nullable=False)
    carbon_sequestered = Column(Float, default=0.0)
    biodiversity_index = Column(Float, nullable=False) # 0.0 to 10.0
    tree_cover_pct = Column(Float, nullable=True) # 0 to 100%
    temperature_avg = Column(Float, nullable=True)
    rainfall_mm = Column(Float, nullable=True)

    site = relationship("Site", back_populates="analytics")
