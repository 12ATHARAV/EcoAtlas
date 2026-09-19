from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Project, Site, AnalyticsData
from app.schemas.schemas import ProjectCreate, ProjectResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    results = []
    for p in projects:
        sites_list = p.sites
        total_area = sum(s.area_hectares or 0.0 for s in sites_list)
        total_carbon = 0.0
        for s in sites_list:
            latest_analytics = (
                db.query(AnalyticsData)
                .filter(AnalyticsData.site_id == s.id)
                .order_by(AnalyticsData.recorded_date.desc())
                .first()
            )
            if latest_analytics:
                total_carbon += latest_analytics.carbon_stock_tonnes

        proj_dict = {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "project_type": p.project_type,
            "status": p.status,
            "user_id": p.user_id,
            "created_at": p.created_at,
            "sites": [
                {
                    "id": s.id,
                    "name": s.name,
                    "project_id": s.project_id,
                    "geometry": s.geometry,
                    "area_hectares": s.area_hectares,
                    "centroid_lat": s.centroid_lat,
                    "centroid_lng": s.centroid_lng,
                    "region": s.region,
                    "created_at": s.created_at,
                    "analytics_count": len(s.analytics)
                } for s in sites_list
            ],
            "total_area_hectares": round(total_area, 2),
            "total_carbon_stock": round(total_carbon, 2)
        }
        results.append(proj_dict)
    return results

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = Project(
        name=project_in.name,
        description=project_in.description,
        project_type=project_in.project_type,
        user_id=current_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "project_type": project.project_type,
        "status": project.status,
        "user_id": project.user_id,
        "created_at": project.created_at,
        "sites": [],
        "total_area_hectares": 0.0,
        "total_carbon_stock": 0.0
    }

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sites_list = project.sites
    total_area = sum(s.area_hectares or 0.0 for s in sites_list)
    total_carbon = 0.0
    for s in sites_list:
        latest_analytics = (
            db.query(AnalyticsData)
            .filter(AnalyticsData.site_id == s.id)
            .order_by(AnalyticsData.recorded_date.desc())
            .first()
        )
        if latest_analytics:
            total_carbon += latest_analytics.carbon_stock_tonnes

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "project_type": project.project_type,
        "status": project.status,
        "user_id": project.user_id,
        "created_at": project.created_at,
        "sites": [
            {
                "id": s.id,
                "name": s.name,
                "project_id": s.project_id,
                "geometry": s.geometry,
                "area_hectares": s.area_hectares,
                "centroid_lat": s.centroid_lat,
                "centroid_lng": s.centroid_lng,
                "region": s.region,
                "created_at": s.created_at,
                "analytics_count": len(s.analytics)
            } for s in sites_list
        ],
        "total_area_hectares": round(total_area, 2),
        "total_carbon_stock": round(total_carbon, 2)
    }

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return None
