import random
from datetime import date, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Project, Site, AnalyticsData
from app.schemas.schemas import SiteCreate, SiteResponse, AnalyticsDataResponse
from app.services.auth_service import get_current_user
from app.services.geo_service import calculate_geojson_metrics

router = APIRouter(prefix="/sites", tags=["Sites"])

@router.get("/geojson")
def get_sites_geojson(db: Session = Depends(get_db)):
    '''
    Returns all sites as a standard GeoJSON FeatureCollection for Mapbox GL JS.
    '''
    sites = db.query(Site).all()
    features = []
    for s in sites:
        features.append({
            "type": "Feature",
            "id": s.id,
            "geometry": s.geometry,
            "properties": {
                "id": s.id,
                "name": s.name,
                "project_id": s.project_id,
                "project_name": s.project.name if s.project else "",
                "project_type": s.project.project_type if s.project else "carbon",
                "area_hectares": s.area_hectares,
                "region": s.region or "Global",
                "centroid_lat": s.centroid_lat,
                "centroid_lng": s.centroid_lng,
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.post("/project/{project_id}", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
def create_site_for_project(
    project_id: str,
    site_in: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        area_ha, cent_lat, cent_lng = calculate_geojson_metrics(site_in.geometry)
    except Exception as e:
        area_ha, cent_lat, cent_lng = 100.0, 0.0, 0.0

    site = Site(
        name=site_in.name,
        project_id=project_id,
        geometry=site_in.geometry,
        area_hectares=area_ha,
        centroid_lat=cent_lat,
        centroid_lng=cent_lng,
        region=site_in.region or "Monitored Zone"
    )
    db.add(site)
    db.commit()
    db.refresh(site)

    # Seed 12 months of baseline analytics for the newly created site
    base_carbon = round(random.uniform(300.0, 800.0) * (area_ha / 50.0), 2)
    today = date.today()
    for i in range(12, -1, -1):
        month_date = (today.replace(day=1) - timedelta(days=i*30)).replace(day=1)
        growth_factor = 1.0 + (12 - i) * 0.03
        ndvi_val = round(min(0.95, max(0.45, 0.65 + (random.uniform(-0.06, 0.08)))), 2)
        carbon_val = round(base_carbon * growth_factor + random.uniform(-10, 25), 1)
        bio_val = round(min(9.8, max(4.0, 6.5 + (12 - i) * 0.2 + random.uniform(-0.3, 0.3))), 1)

        ad = AnalyticsData(
            site_id=site.id,
            recorded_date=month_date,
            ndvi=ndvi_val,
            carbon_stock_tonnes=carbon_val,
            carbon_sequestered=round(carbon_val * 0.12, 1),
            biodiversity_index=bio_val,
            tree_cover_pct=round(min(95.0, 60.0 + (12 - i) * 1.5), 1),
            temperature_avg=round(random.uniform(22.0, 29.5), 1),
            rainfall_mm=round(random.uniform(80.0, 240.0), 1)
        )
        db.add(ad)
    db.commit()

    return {
        "id": site.id,
        "name": site.name,
        "project_id": site.project_id,
        "geometry": site.geometry,
        "area_hectares": site.area_hectares,
        "centroid_lat": site.centroid_lat,
        "centroid_lng": site.centroid_lng,
        "region": site.region,
        "created_at": site.created_at,
        "analytics_count": 13
    }

@router.get("/{site_id}", response_model=SiteResponse)
def get_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return {
        "id": site.id,
        "name": site.name,
        "project_id": site.project_id,
        "geometry": site.geometry,
        "area_hectares": site.area_hectares,
        "centroid_lat": site.centroid_lat,
        "centroid_lng": site.centroid_lng,
        "region": site.region,
        "created_at": site.created_at,
        "analytics_count": len(site.analytics)
    }

@router.get("/{site_id}/analytics", response_model=List[AnalyticsDataResponse])
def get_site_analytics(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    data = (
        db.query(AnalyticsData)
        .filter(AnalyticsData.site_id == site_id)
        .order_by(AnalyticsData.recorded_date.asc())
        .all()
    )
    return data

@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    db.delete(site)
    db.commit()
    return None
