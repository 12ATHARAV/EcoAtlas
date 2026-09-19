import uuid
from datetime import date, timedelta
import random
from app.database import SessionLocal, Base, engine
from app.models.models import User, Project, Site, AnalyticsData
from app.services.auth_service import get_password_hash
from app.services.geo_service import calculate_geojson_metrics

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing demo data
    db.query(AnalyticsData).delete()
    db.query(Site).delete()
    db.query(Project).delete()
    db.query(User).delete()
    db.commit()

    print("Cleared existing data.")

    # 1. Admin Users
    admin = User(
        email="admin@ecoatlas.earth",
        password_hash=get_password_hash("Admin123!"),
        full_name="Chief Conservation Officer"
    )
    admin_legacy = User(
        email="admin@darukaa.earth",
        password_hash=get_password_hash("Admin123!"),
        full_name="Chief Conservation Officer"
    )
    db.add(admin)
    db.add(admin_legacy)
    db.commit()
    db.refresh(admin)

    # 2. Projects & Sites Definition
    projects_data = [
        {
            "name": "Amazon Basin REDD+ Verified Reserve",
            "description": "Primary rainforest protection and avoided deforestation in the Brazilian Amazonas corridor, supporting indigenous canopy monitoring.",
            "project_type": "carbon",
            "sites": [
                {
                    "name": "Rio Negro Core Primary Canopy",
                    "region": "Amazonas, Brazil",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-60.520, -2.850],
                            [-60.380, -2.850],
                            [-60.380, -2.960],
                            [-60.520, -2.960],
                            [-60.520, -2.850]
                        ]]
                    },
                    "base_carbon": 4200.0,
                    "base_bio": 9.4,
                    "base_ndvi": 0.88
                },
                {
                    "name": "Jau National Park Buffer Zone",
                    "region": "Amazonas, Brazil",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-61.850, -1.900],
                            [-61.680, -1.900],
                            [-61.680, -2.050],
                            [-61.850, -2.050],
                            [-61.850, -1.900]
                        ]]
                    },
                    "base_carbon": 3600.0,
                    "base_bio": 9.1,
                    "base_ndvi": 0.84
                }
            ]
        },
        {
            "name": "Sundarbans Tidal Mangrove Blue Carbon",
            "description": "Tidal wetland restoration storing organic carbon up to 4x faster than terrestrial forests while providing storm barrier protection.",
            "project_type": "mixed",
            "sites": [
                {
                    "name": "Sajnekhali Mangrove Sanctuary",
                    "region": "West Bengal, India",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [88.750, 22.120],
                            [88.920, 22.120],
                            [88.920, 22.010],
                            [88.750, 22.010],
                            [88.750, 22.120]
                        ]]
                    },
                    "base_carbon": 2800.0,
                    "base_bio": 8.7,
                    "base_ndvi": 0.79
                },
                {
                    "name": "Satkhira Coastal Re-vegetation Zone",
                    "region": "Khulna, Bangladesh",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [89.150, 21.950],
                            [89.320, 21.950],
                            [89.320, 21.820],
                            [89.150, 21.820],
                            [89.150, 21.950]
                        ]]
                    },
                    "base_carbon": 2150.0,
                    "base_bio": 8.3,
                    "base_ndvi": 0.76
                }
            ]
        },
        {
            "name": "East African Great Rift Agroforestry & Corridors",
            "description": "Community-led agroforestry and wildlife movement corridors connecting Mount Kenya and Aberdare national parks.",
            "project_type": "biodiversity",
            "sites": [
                {
                    "name": "Mount Kenya Foothill Corridor",
                    "region": "Central Kenya",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [37.200, -0.220],
                            [37.380, -0.220],
                            [37.380, -0.360],
                            [37.200, -0.360],
                            [37.200, -0.220]
                        ]]
                    },
                    "base_carbon": 1950.0,
                    "base_bio": 8.9,
                    "base_ndvi": 0.81
                },
                {
                    "name": "Laikipia Plateau Acacia Savannah",
                    "region": "Rift Valley, Kenya",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [36.850, 0.280],
                            [37.050, 0.280],
                            [37.050, 0.120],
                            [36.850, 0.120],
                            [36.850, 0.280]
                        ]]
                    },
                    "base_carbon": 1400.0,
                    "base_bio": 9.2,
                    "base_ndvi": 0.68
                }
            ]
        },
        {
            "name": "Scandinavian Boreal Peatland Regeneration",
            "description": "Rewetting degraded boreal peat bogs in northern Sweden to permanently sequester atmospheric carbon dioxide in sub-arctic soil.",
            "project_type": "carbon",
            "sites": [
                {
                    "name": "Västerbotten Sphagnum Mire",
                    "region": "Västerbotten, Sweden",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [19.800, 64.300],
                            [20.050, 64.300],
                            [20.050, 64.180],
                            [19.800, 64.180],
                            [19.800, 64.300]
                        ]]
                    },
                    "base_carbon": 3100.0,
                    "base_bio": 7.8,
                    "base_ndvi": 0.72
                }
            ]
        }
    ]

    today = date.today()

    for p_info in projects_data:
        proj = Project(
            name=p_info["name"],
            description=p_info["description"],
            project_type=p_info["project_type"],
            user_id=admin.id
        )
        db.add(proj)
        db.commit()
        db.refresh(proj)

        for s_info in p_info["sites"]:
            area_ha, c_lat, c_lng = calculate_geojson_metrics(s_info["geometry"])
            site = Site(
                name=s_info["name"],
                project_id=proj.id,
                geometry=s_info["geometry"],
                area_hectares=area_ha,
                centroid_lat=c_lat,
                centroid_lng=c_lng,
                region=s_info["region"]
            )
            db.add(site)
            db.commit()
            db.refresh(site)

            # Generate 24 months of rich time-series data
            for m in range(24, -1, -1):
                m_date = (today.replace(day=1) - timedelta(days=m * 30)).replace(day=1)
                # Seasonality and upward trend
                season = math.sin((m % 12) / 12.0 * 2 * math.pi)
                progress = (24 - m) / 24.0

                ndvi = round(min(0.96, max(0.40, s_info["base_ndvi"] + season * 0.05 + progress * 0.08 + random.uniform(-0.02, 0.02))), 2)
                carbon_stock = round(s_info["base_carbon"] * (1.0 + progress * 0.22) + season * 40.0 + random.uniform(-15, 20), 1)
                carbon_seq = round((carbon_stock * 0.04) + random.uniform(5, 12), 1)
                bio_idx = round(min(9.9, max(4.0, s_info["base_bio"] + progress * 0.4 + random.uniform(-0.1, 0.1))), 1)
                tree_pct = round(min(98.0, 70.0 + progress * 15.0 + random.uniform(-2, 2)), 1)
                temp = round(24.0 + season * 4.0 + random.uniform(-1, 1), 1)
                rain = round(max(30.0, 140.0 + season * 60.0 + random.uniform(-20, 20)), 1)

                ad = AnalyticsData(
                    site_id=site.id,
                    recorded_date=m_date,
                    ndvi=ndvi,
                    carbon_stock_tonnes=carbon_stock,
                    carbon_sequestered=carbon_seq,
                    biodiversity_index=bio_idx,
                    tree_cover_pct=tree_pct,
                    temperature_avg=temp,
                    rainfall_mm=rain
                )
                db.add(ad)
        db.commit()

    print("Database successfully seeded with realistic carbon projects and 24 months of analytics!")
    db.close()

if __name__ == "__main__":
    import math
    seed()
