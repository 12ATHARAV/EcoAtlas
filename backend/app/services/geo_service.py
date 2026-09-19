import math
from typing import Dict, Any, Tuple
from shapely.geometry import shape

def calculate_geojson_metrics(geojson_geom: Dict[str, Any]) -> Tuple[float, float, float]:
    '''
    Calculates:
    - area_hectares: Approximate geodesic area in hectares
    - centroid_lat: Latitude of geometric centroid
    - centroid_lng: Longitude of geometric centroid
    '''
    geom = shape(geojson_geom)
    centroid = geom.centroid
    centroid_lng, centroid_lat = centroid.x, centroid.y

    # Approximate area in square meters using spherical Earth projection at centroid lat
    # 1 deg lat ~ 111,139 meters; 1 deg lng ~ 111,139 * cos(lat)
    lat_rad = math.radians(centroid_lat)
    cos_lat = math.cos(lat_rad)
    
    # planar area in degree^2 * (111139 meters/deg) * (111139 * cos_lat meters/deg)
    area_sq_meters = abs(geom.area) * 111139.0 * (111139.0 * cos_lat)
    area_hectares = round(area_sq_meters / 10000.0, 2)

    return area_hectares, round(centroid_lat, 6), round(centroid_lng, 6)
