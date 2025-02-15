import { loadCountryBoundaries } from './countryBoundaries';

export class RegionGrid {
    constructor() {
        this.boundaries = null;
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            this.boundaries = await loadCountryBoundaries();
            this.initialized = true;
        }
    }

    getCountryCode(lat, lng) {
        if (!this.boundaries) return null;

        // Normalize longitude to -180 to 180
        lng = ((lng + 180) % 360) - 180;
        
        const point = [lng, lat];
        
        // First try exact point in polygon
        for (const feature of this.boundaries.features) {
            if (this.pointInPolygon(point, feature.geometry)) {
                // Special handling for USA and Canada
                if (feature.id === 'USA') {
                    if (lng < -115) return '13';      // Western US
                    if (lng < -98) return '14';       // Midwest US
                    return '15';                      // Eastern US
                }
                if (feature.id === 'CAN') {
                    if (lng < -100) return '12';      // Western Canada
                    return '11';                      // Eastern Canada
                }
                return feature.id;
            }
        }

        // If not in any polygon, check if within any country's bounding box
        for (const feature of this.boundaries.features) {
            if (this.pointInBoundingBox(point, feature.geometry)) {
                if (feature.id === 'USA') {
                    if (lng < -115) return '13';
                    if (lng < -98) return '14';
                    return '15';
                }
                if (feature.id === 'CAN') {
                    if (lng < -100) return '12';
                    return '11';
                }
                return feature.id;
            }
        }

        return null;
    }

    pointInPolygon(point, geometry) {
        if (geometry.type === "Polygon") {
            return this.pointInSinglePolygon(point, geometry.coordinates[0]);
        } else if (geometry.type === "MultiPolygon") {
            return geometry.coordinates.some(polygon => 
                this.pointInSinglePolygon(point, polygon[0])
            );
        }
        return false;
    }

    pointInSinglePolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];
            
            const intersect = ((yi > point[1]) !== (yj > point[1])) 
                && (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    pointInBoundingBox(point, geometry) {
        let coords;
        if (geometry.type === "Polygon") {
            coords = geometry.coordinates[0];
        } else if (geometry.type === "MultiPolygon") {
            // For MultiPolygon, we need to check all polygons
            coords = geometry.coordinates.reduce((allCoords, polygon) => {
                return allCoords.concat(polygon[0]);
            }, []);
        } else {
            return false;
        }

        // Calculate bounding box
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        for (const coord of coords) {
            minX = Math.min(minX, coord[0]);
            maxX = Math.max(maxX, coord[0]);
            minY = Math.min(minY, coord[1]);
            maxY = Math.max(maxY, coord[1]);
        }

        // Check if point is within bounding box
        return point[0] >= minX && point[0] <= maxX && 
               point[1] >= minY && point[1] <= maxY;
    }

    findNearestCode(lat, lng) {
        const points = [
            [45, -120, 13],    // Western US
            [45, -100, 14],    // Mid-western US
            [45, -80, 15],     // Eastern US
            [55, -120, 12],    // Western Canada
            [55, -80, 11],     // Eastern Canada
            [40, -3, 34],      // Spain
            [48, 2, 33],       // France
            [51, -1, 44],      // UK
            [52, 13, 49],      // Germany
            [41, 12, 39],      // Italy
            [35, 105, 86],     // China
            [36, 138, 81],     // Japan
            [20, 77, 91],      // India
            [-15, -55, 55],    // Brazil
            [-35, -65, 54],    // Argentina
            [25, 45, 966],     // Saudi Arabia
            [0, 20, 234],      // Africa
            [-25, 135, 61]     // Australia
        ];

        let minDist = Infinity;
        let nearestCode = null;

        points.forEach(([plat, plng, code]) => {
            const dist = Math.sqrt(
                Math.pow(lat - plat, 2) + 
                Math.pow(((lng - plng + 180) % 360) - 180, 2)
            );
            if (dist < minDist) {
                minDist = dist;
                nearestCode = code;
            }
        });

        return nearestCode;
    }
} 