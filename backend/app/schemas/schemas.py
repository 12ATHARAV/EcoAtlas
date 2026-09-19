from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime, date

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Analytics Schemas
class AnalyticsDataCreate(BaseModel):
    recorded_date: date
    ndvi: float
    carbon_stock_tonnes: float
    carbon_sequestered: float = 0.0
    biodiversity_index: float
    tree_cover_pct: Optional[float] = None
    temperature_avg: Optional[float] = None
    rainfall_mm: Optional[float] = None

class AnalyticsDataResponse(AnalyticsDataCreate):
    id: str
    site_id: str

    class Config:
        from_attributes = True

# Site Schemas
class SiteCreate(BaseModel):
    name: str
    geometry: dict # GeoJSON Polygon or MultiPolygon
    region: Optional[str] = None

class SiteResponse(BaseModel):
    id: str
    name: str
    project_id: str
    geometry: dict
    area_hectares: float
    centroid_lat: Optional[float] = None
    centroid_lng: Optional[float] = None
    region: Optional[str] = None
    created_at: datetime
    analytics_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Project Schemas
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    project_type: str = "carbon"

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    project_type: str
    status: str
    user_id: str
    created_at: datetime
    sites: List[SiteResponse] = []
    total_area_hectares: Optional[float] = 0.0
    total_carbon_stock: Optional[float] = 0.0

    class Config:
        from_attributes = True
