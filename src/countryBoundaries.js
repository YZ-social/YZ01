import worldBoundaries from './data/world-boundaries.geojson';

export const countryBoundaries = worldBoundaries;

// Remove the getCountryCode function as it's no longer needed 

export async function loadCountryBoundaries() {
    const response = await fetch('/assets/countries.geo.json');
    const data = await response.json();
    
    // Filter out any bounding box features
    data.features = data.features.filter(feature => {
        // Keep only the actual country polygons
        return feature.geometry.type === "MultiPolygon" || 
               (feature.geometry.type === "Polygon" && !isBoundingBox(feature.geometry.coordinates[0]));
    });
    
    return data;
}

function isBoundingBox(coords) {
    // A bounding box is typically a rectangle with 5 points (last one same as first)
    if (coords.length !== 5) return false;
    
    // Check if it forms a perfect rectangle
    const [minX, minY] = coords[0];
    const [maxX, maxY] = coords[2];
    
    return coords.every(point => 
        point[0] === minX || point[0] === maxX || 
        point[1] === minY || point[1] === maxY
    );
}

export function getCountryByCode(data, code) {
    return data.features.find(feature => feature.id === code);
}

export function getCountryByPoint(data, lat, lng) {
    for (const feature of data.features) {
        if (pointInPolygon([lng, lat], feature.geometry)) {
            return feature;
        }
    }
    return null;
} 