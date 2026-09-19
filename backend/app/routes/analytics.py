from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import Project, Site, AnalyticsData

router = APIRouter(prefix="/analytics", tags=["Global Analytics"])

@router.get("/summary")
def get_global_summary(db: Session = Depends(get_db)):
    total_projects = db.query(func.count(Project.id)).scalar() or 0
    total_sites = db.query(func.count(Site.id)).scalar() or 0
    total_area = db.query(func.sum(Site.area_hectares)).scalar() or 0.0

    # Calculate latest total carbon stock across all sites
    sites = db.query(Site).all()
    total_carbon = 0.0
    avg_ndvi = 0.0
    avg_bio = 0.0
    count = 0

    for s in sites:
        latest = (
            db.query(AnalyticsData)
            .filter(AnalyticsData.site_id == s.id)
            .order_by(AnalyticsData.recorded_date.desc())
            .first()
        )
        if latest:
            total_carbon += latest.carbon_stock_tonnes
            avg_ndvi += latest.ndvi
            avg_bio += latest.biodiversity_index
            count += 1

    return {
        "total_projects": total_projects,
        "total_sites": total_sites,
        "total_area_hectares": round(total_area, 2),
        "total_carbon_stock_tonnes": round(total_carbon, 2),
        "average_ndvi": round(avg_ndvi / count, 2) if count > 0 else 0.74,
        "average_biodiversity_index": round(avg_bio / count, 1) if count > 0 else 8.2,
    }
