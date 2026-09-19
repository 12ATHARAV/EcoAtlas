# EcoAtlas - Geospatial Carbon & Biodiversity Analytics Platform

A production-grade full-stack geospatial platform for managing and visualizing carbon credit reserves and biodiversity corridors across global biomes.

## System Architecture

- **Frontend**: React 19, Vite, Mapbox GL JS (3D Globe & Satellite), Mapbox Draw (polygon creation), Chart.js (time-series analytics), Tailwind CSS (Forest Obsidian & Glowing Emerald theme).
- **Backend**: Python 3.12, FastAPI, PostGIS / GeoJSON integration, Shapely geodesic polygon metric calculation, JWT Authentication with Bcrypt.
- **Database**: PostgreSQL with PostGIS / SQLite zero-config fallback.
- **CI/CD**: GitHub Actions workflow running linting, Pytest, and Vite production builds on push/PR.
- **Pre-commit Hooks**: Husky and lint-staged with Prettier.

## Database Schema

- **users**: id (UUID), email (unique), password_hash, full_name, created_at
- **projects**: id (UUID), name, description, project_type (carbon, biodiversity, mixed), status, user_id (FK), created_at
- **sites**: id (UUID), name, project_id (FK), geometry (GeoJSON Polygon), area_hectares, centroid_lat, centroid_lng, region, created_at
- **analytics_data**: id (UUID), site_id (FK), recorded_date, ndvi, carbon_stock_tonnes, carbon_sequestered, biodiversity_index, tree_cover_pct, temperature_avg, rainfall_mm

## Quickstart & Local Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Seed realistic project data (Amazon, Sundarbans, East Africa, Scandinavia)
python -m app.seed.seed_data

# Run API server
uvicorn app.main:app --reload --port 8000
```
Docs available at: http://localhost:8000/docs

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 in your browser.

## Default Credentials
- **Email**: admin@ecoatlas.earth (or admin@darukaa.earth)
- **Password**: Admin123!

## Deployment Instructions

### Frontend (Vercel)
1. Push repository to GitHub.
2. In Vercel, set root directory to frontend.
3. Set environment variables:
   - VITE_API_URL: Your deployed backend URL + /api
   - VITE_MAPBOX_TOKEN: your_mapbox_token_here
4. Deploy!

### Backend (Render.com)
1. In Render, create a new Web Service connecting your GitHub repo.
2. Set root directory to backend.
3. Build Command: pip install -r requirements.txt
4. Start Command: uvicorn app.main:app --host 0.0.0.0 --port 
5. Set environment variable: DATABASE_URL

## Automated Testing
- Pytest suite: pytest backend/tests (6 passing unit tests)

