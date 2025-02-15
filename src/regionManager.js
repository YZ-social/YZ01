import crypto from 'crypto-browserify';
import { Buffer } from 'buffer/';

const REGION_CODES = {
    // Major Regions (1000-1999)
    MAJOR: {
        NORTH_PACIFIC: 1000,
        SOUTH_PACIFIC: 1001,
        NORTH_ATLANTIC: 1002,
        SOUTH_ATLANTIC: 1003,
        INDIAN_OCEAN: 1004,
        ARCTIC: 1005,
        ANTARCTIC: 1006,
    },

    // North America (2000-2999)
    NORTH_AMERICA: {
        CANADA_WEST: 2000,      // Western Canada + Alaska
        CANADA_EAST: 2001,      // Eastern Canada
        USA_WEST: 2010,         // Pacific Coast + Mountain states
        USA_CENTRAL: 2011,      // Central states
        USA_EAST: 2012,         // Eastern seaboard
        MEXICO: 2020,           // All of Mexico (~130M people)
    },

    // Asia (3000-3999)
    ASIA: {
        EAST_COAST: 3000,       // Coastal China + Korea + Japan (~600M)
        CHINA_INLAND: 3001,     // Inland China (~600M)
        SOUTH_EAST: 3010,       // Vietnam, Thailand, etc. (~600M)
        INDIA_NORTH: 3020,      // Northern India (~600M)
        INDIA_SOUTH: 3021,      // Southern India (~600M)
        CENTRAL: 3030,          // Stan countries + Mongolia
        MIDDLE_EAST: 3040,      // Middle East region
        RUSSIA_WEST: 3050,      // Western Russia
        RUSSIA_CENTRAL: 3051,   // Central Russia
        RUSSIA_EAST: 3052,      // Eastern Russia
    },

    // Europe (4000-4999)
    EUROPE: {
        WEST: 4000,             // UK, France, Benelux (~200M)
        CENTRAL: 4001,          // Germany, Poland, etc. (~200M)
        SOUTH: 4002,            // Italy, Spain, etc. (~200M)
        NORTH: 4003,            // Nordics + Baltics
        EAST: 4004,             // European Russia + Ukraine etc.
    },

    // Africa (5000-5999)
    AFRICA: {
        NORTH: 5000,            // Mediterranean coast
        WEST: 5001,            // West Africa
        EAST: 5002,            // East Africa
        CENTRAL: 5003,         // Central Africa
        SOUTH: 5004,           // Southern Africa
    },

    // South America (6000-6999)
    SOUTH_AMERICA: {
        BRAZIL: {
            NORTH: 6001,
            SOUTH: 6002,
            AMAZON: 6003,
        },
        ANDES: 6010,
        SOUTHERN_CONE: 6020,
        CENTRAL: 6030,
        CARIBBEAN: 6040,
    },

    // Special (9000-9999)
    SPECIAL: {
        ANONYMOUS: 9000,
        SATELLITE: 9001,
        MOBILE: 9002,
        // Ocean region codes
        PACIFIC_NORTHWEST: 9300,
        PACIFIC_NORTHEAST: 9301,
        PACIFIC_SOUTHWEST: 9302,
        PACIFIC_SOUTHEAST: 9303,
        ATLANTIC_NORTHWEST: 9310,
        ATLANTIC_NORTHEAST: 9311,
        ATLANTIC_SOUTHWEST: 9312,
        ATLANTIC_SOUTHEAST: 9313,
        INDIAN_NORTH: 9320,
        INDIAN_SOUTH: 9321,
        PACIFIC_SOUTHEAST_DEEP: 9305,  // South East Pacific (west of South America)
    }
};

class RegionManager {
    constructor() {
        this.regions = REGION_CODES;
        this.regionBoundaries = {
            // Major Regions (oceans and poles)
            'MAJOR.NORTH_PACIFIC': {
                bounds: { minLat: 0, maxLat: 66.5, minLng: 120, maxLng: -120 },
                code: REGION_CODES.MAJOR.NORTH_PACIFIC
            },
            'MAJOR.SOUTH_PACIFIC': {
                bounds: { minLat: -60, maxLat: 0, minLng: 120, maxLng: -120 },
                code: REGION_CODES.MAJOR.SOUTH_PACIFIC
            },
            'MAJOR.NORTH_ATLANTIC': {
                bounds: { minLat: 0, maxLat: 66.5, minLng: -70, maxLng: 20 },
                code: REGION_CODES.MAJOR.NORTH_ATLANTIC
            },
            'MAJOR.SOUTH_ATLANTIC': {
                bounds: { minLat: -60, maxLat: 0, minLng: -70, maxLng: 20 },
                code: REGION_CODES.MAJOR.SOUTH_ATLANTIC
            },
            'MAJOR.INDIAN_OCEAN': {
                bounds: { minLat: -60, maxLat: 30, minLng: 20, maxLng: 120 },
                code: REGION_CODES.MAJOR.INDIAN_OCEAN
            },
            'MAJOR.ARCTIC': {
                bounds: { minLat: 66.5, maxLat: 90, minLng: -180, maxLng: 180 },
                code: REGION_CODES.MAJOR.ARCTIC
            },
            'MAJOR.ANTARCTIC': {
                bounds: { minLat: -90, maxLat: -60, minLng: -180, maxLng: 180 },
                code: REGION_CODES.MAJOR.ANTARCTIC
            },

            // North America
            'NORTH_AMERICA.CANADA_WEST': {
                bounds: { minLat: 49, maxLat: 75, minLng: -140, maxLng: -100 },
                code: REGION_CODES.NORTH_AMERICA.CANADA_WEST
            },
            'NORTH_AMERICA.CANADA_EAST': {
                bounds: { minLat: 45, maxLat: 75, minLng: -100, maxLng: -50 },
                code: REGION_CODES.NORTH_AMERICA.CANADA_EAST
            },
            'NORTH_AMERICA.USA_WEST': {
                bounds: { minLat: 30, maxLat: 49, minLng: -125, maxLng: -105 },
                code: REGION_CODES.NORTH_AMERICA.USA_WEST
            },
            'NORTH_AMERICA.USA_CENTRAL': {
                bounds: { minLat: 25, maxLat: 49, minLng: -105, maxLng: -85 },
                code: REGION_CODES.NORTH_AMERICA.USA_CENTRAL
            },
            'NORTH_AMERICA.USA_EAST': {
                bounds: { minLat: 25, maxLat: 49, minLng: -85, maxLng: -65 },
                code: REGION_CODES.NORTH_AMERICA.USA_EAST
            },
            'NORTH_AMERICA.MEXICO': {
                bounds: { minLat: 14, maxLat: 32, minLng: -120, maxLng: -85 },
                code: REGION_CODES.NORTH_AMERICA.MEXICO
            },

            // Asia
            'ASIA.EAST_COAST': {
                bounds: { minLat: 20, maxLat: 46, minLng: 115, maxLng: 145 },
                code: REGION_CODES.ASIA.EAST_COAST
            },
            'ASIA.CHINA_INLAND': {
                bounds: { minLat: 20, maxLat: 45, minLng: 85, maxLng: 115 },
                code: REGION_CODES.ASIA.CHINA_INLAND
            },
            'ASIA.SOUTH_EAST': {
                bounds: { minLat: -10, maxLat: 23, minLng: 95, maxLng: 140 },
                code: REGION_CODES.ASIA.SOUTH_EAST
            },
            'ASIA.INDIA_NORTH': {
                bounds: { minLat: 20, maxLat: 35, minLng: 68, maxLng: 97 },
                code: REGION_CODES.ASIA.INDIA_NORTH
            },
            'ASIA.INDIA_SOUTH': {
                bounds: { minLat: 8, maxLat: 20, minLng: 72, maxLng: 87 },
                code: REGION_CODES.ASIA.INDIA_SOUTH
            },
            'ASIA.CENTRAL': {
                bounds: { minLat: 35, maxLat: 45, minLng: 50, maxLng: 90 },
                code: REGION_CODES.ASIA.CENTRAL
            },
            'ASIA.MIDDLE_EAST': {
                bounds: { minLat: 12, maxLat: 42, minLng: 35, maxLng: 65 },
                code: REGION_CODES.ASIA.MIDDLE_EAST
            },

            // Europe
            'EUROPE.WEST': {
                bounds: { minLat: 43, maxLat: 58, minLng: -10, maxLng: 5 },
                code: REGION_CODES.EUROPE.WEST
            },
            'EUROPE.CENTRAL': {
                bounds: { minLat: 45, maxLat: 55, minLng: 5, maxLng: 25 },
                code: REGION_CODES.EUROPE.CENTRAL
            },
            'EUROPE.SOUTH': {
                bounds: { minLat: 36, maxLat: 45, minLng: -10, maxLng: 25 },
                code: REGION_CODES.EUROPE.SOUTH
            },
            'EUROPE.NORTH': {
                bounds: { minLat: 55, maxLat: 71, minLng: 5, maxLng: 30 },
                code: REGION_CODES.EUROPE.NORTH
            },
            'EUROPE.EAST': {
                bounds: { minLat: 45, maxLat: 60, minLng: 25, maxLng: 40 },
                code: REGION_CODES.EUROPE.EAST
            },

            // Africa
            'AFRICA.NORTH': {
                bounds: { minLat: 20, maxLat: 37, minLng: -17, maxLng: 35 },
                code: REGION_CODES.AFRICA.NORTH
            },
            'AFRICA.WEST': {
                bounds: { minLat: 4, maxLat: 20, minLng: -17, maxLng: 10 },
                code: REGION_CODES.AFRICA.WEST
            },
            'AFRICA.EAST': {
                bounds: { minLat: -12, maxLat: 18, minLng: 30, maxLng: 52 },
                code: REGION_CODES.AFRICA.EAST
            },
            'AFRICA.CENTRAL': {
                bounds: { minLat: -5, maxLat: 15, minLng: 8, maxLng: 30 },
                code: REGION_CODES.AFRICA.CENTRAL
            },
            'AFRICA.SOUTHERN': {
                bounds: { minLat: -35, maxLat: -8, minLng: 10, maxLng: 41 },
                code: REGION_CODES.AFRICA.SOUTHERN
            },

            // South America
            'SOUTH_AMERICA.BRAZIL.NORTH': {
                bounds: { minLat: 0, maxLat: 5, minLng: -70, maxLng: -35 },
                code: REGION_CODES.SOUTH_AMERICA.BRAZIL.NORTH
            },
            'SOUTH_AMERICA.BRAZIL.SOUTH': {
                bounds: { minLat: -33, maxLat: -15, minLng: -58, maxLng: -35 },
                code: REGION_CODES.SOUTH_AMERICA.BRAZIL.SOUTH
            },
            'SOUTH_AMERICA.BRAZIL.AMAZON': {
                bounds: { minLat: -15, maxLat: 0, minLng: -70, maxLng: -45 },
                code: REGION_CODES.SOUTH_AMERICA.BRAZIL.AMAZON
            },
            'SOUTH_AMERICA.ANDES': {
                bounds: { minLat: -23, maxLat: 12, minLng: -82, maxLng: -65 },
                code: REGION_CODES.SOUTH_AMERICA.ANDES
            },
            'SOUTH_AMERICA.SOUTHERN_CONE': {
                bounds: { minLat: -56, maxLat: -23, minLng: -76, maxLng: -53 },
                code: REGION_CODES.SOUTH_AMERICA.SOUTHERN_CONE
            },
            'SOUTH_AMERICA.CENTRAL': {
                bounds: { minLat: -15, maxLat: 12, minLng: -65, maxLng: -45 },
                code: REGION_CODES.SOUTH_AMERICA.CENTRAL
            },
            'SOUTH_AMERICA.CARIBBEAN': {
                bounds: { minLat: 10, maxLat: 25, minLng: -85, maxLng: -60 },
                code: REGION_CODES.SOUTH_AMERICA.CARIBBEAN
            },

            // Add Pacific Ocean regions
            'PACIFIC.NORTH_WEST': {
                bounds: { minLat: 0, maxLat: 66.5, minLng: 140, maxLng: 180 },
                code: REGION_CODES.SPECIAL.PACIFIC_NORTHWEST
            },
            'PACIFIC.NORTH_EAST': {
                bounds: { minLat: 0, maxLat: 66.5, minLng: -180, maxLng: -120 },
                code: REGION_CODES.SPECIAL.PACIFIC_NORTHEAST
            },
            'PACIFIC.CENTRAL_WEST': {
                bounds: { minLat: -30, maxLat: 0, minLng: 150, maxLng: 180 },
                code: REGION_CODES.SPECIAL.PACIFIC_SOUTHWEST
            },
            'PACIFIC.CENTRAL_EAST': {
                bounds: { minLat: -30, maxLat: 0, minLng: -180, maxLng: -120 },
                code: REGION_CODES.SPECIAL.PACIFIC_SOUTHEAST
            },

            // Add Atlantic Ocean regions
            'ATLANTIC.NORTH_WEST': {
                bounds: { minLat: 0, maxLat: 66.5, minLng: -80, maxLng: -40 },
                code: REGION_CODES.SPECIAL.ATLANTIC_NORTHWEST
            },
            'ATLANTIC.NORTH_EAST': {
                bounds: { minLat: 0, maxLat: 66.5, minLng: -40, maxLng: 0 },
                code: REGION_CODES.SPECIAL.ATLANTIC_NORTHEAST
            },
            'ATLANTIC.SOUTH_WEST': {
                bounds: { minLat: -60, maxLat: 0, minLng: -70, maxLng: -20 },
                code: REGION_CODES.SPECIAL.ATLANTIC_SOUTHWEST
            },
            'ATLANTIC.SOUTH_EAST': {
                bounds: { minLat: -60, maxLat: 0, minLng: -20, maxLng: 20 },
                code: REGION_CODES.SPECIAL.ATLANTIC_SOUTHEAST
            },

            // Add Indian Ocean region
            'INDIAN.NORTH': {
                bounds: { minLat: 0, maxLat: 30, minLng: 55, maxLng: 100 },
                code: REGION_CODES.SPECIAL.INDIAN_NORTH
            },
            'INDIAN.SOUTH': {
                bounds: { minLat: -60, maxLat: 0, minLng: 20, maxLng: 110 },
                code: REGION_CODES.SPECIAL.INDIAN_SOUTH
            },

            // Add Russia regions
            'ASIA.RUSSIA_WEST': {
                bounds: { minLat: 45, maxLat: 66.5, minLng: 20, maxLng: 60 },
                code: REGION_CODES.ASIA.RUSSIA_WEST
            },
            'ASIA.RUSSIA_CENTRAL': {
                bounds: { minLat: 45, maxLat: 66.5, minLng: 60, maxLng: 120 },
                code: REGION_CODES.ASIA.RUSSIA_CENTRAL
            },
            'ASIA.RUSSIA_EAST': {
                bounds: { minLat: 45, maxLat: 66.5, minLng: 120, maxLng: 180 },
                code: REGION_CODES.ASIA.RUSSIA_EAST
            },

            // Add Central Asia
            'ASIA.MONGOLIA': {
                bounds: { minLat: 41.5, maxLat: 52, minLng: 87, maxLng: 120 },
                code: REGION_CODES.ASIA.MONGOLIA
            },
            'AFRICA.SAHARA': {
                bounds: { minLat: 15, maxLat: 35, minLng: -17, maxLng: 35 },
                code: REGION_CODES.AFRICA.SAHARA
            },

            // Add new region
            'PACIFIC.SOUTH_EAST_DEEP': {
                bounds: { minLat: -60, maxLat: 0, minLng: -120, maxLng: -70 },
                code: REGION_CODES.SPECIAL.PACIFIC_SOUTHEAST_DEEP
            },
        };
    }

    async getRegionFromLocation(latitude, longitude) {
        try {
            // First, try to find exact region match
            const exactRegion = this.findExactRegion(latitude, longitude);
            if (exactRegion) {
                return exactRegion;
            }

            // If no exact match, find nearest region
            return this.findNearestRegion(latitude, longitude);
        } catch (error) {
            console.error('Error determining region:', error);
            // Return anonymous region as fallback
            return REGION_CODES.SPECIAL.ANONYMOUS;
        }
    }

    findExactRegion(latitude, longitude) {
        for (const [regionName, region] of Object.entries(this.regionBoundaries)) {
            const bounds = region.bounds;
            if (this.isPointInBounds(latitude, longitude, bounds)) {
                return region.code;
            }
        }
        return null;
    }

    findNearestRegion(latitude, longitude) {
        let nearestRegion = null;
        let shortestDistance = Infinity;

        for (const [regionName, region] of Object.entries(this.regionBoundaries)) {
            const centerLat = (region.bounds.minLat + region.bounds.maxLat) / 2;
            const centerLng = (region.bounds.minLng + region.bounds.maxLng) / 2;
            
            const distance = this.calculateDistance(
                latitude, longitude,
                centerLat, centerLng
            );

            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestRegion = region.code;
            }
        }

        return nearestRegion || REGION_CODES.SPECIAL.ANONYMOUS;
    }

    isPointInBounds(lat, lng, bounds) {
        return (
            lat >= bounds.minLat &&
            lat <= bounds.maxLat &&
            lng >= bounds.minLng &&
            lng <= bounds.maxLng
        );
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula for calculating great-circle distance
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    toIdentifier(regionCode) {
        // Ensure the code fits in 16 bits
        return regionCode & 0xFFFF;
    }

    createNodeId(regionCode, publicKey) {
        const regionIdentifier = this.toIdentifier(regionCode);
        // Combine 16-bit region code with hash of public key
        return Buffer.concat([
            Buffer.from([regionIdentifier >> 8, regionIdentifier & 0xFF]),
            crypto.createHash('sha256').update(publicKey).digest()
        ]);
    }

    getNeighboringRegions(regionCode) {
        // Implementation to find adjacent region codes
        // Useful for optimizing routing
        return [];
    }

    estimateLatency(regionCode1, regionCode2) {
        // Basic latency estimation based on region proximity
        const distance = this.calculateRegionDistance(regionCode1, regionCode2);
        return Math.floor(distance * 0.1); // ms
    }
}

class LocationService {
    constructor() {
        this.currentPosition = null;
    }

    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    resolve(this.currentPosition);
                },
                (error) => {
                    reject(new Error(`Failed to get location: ${error.message}`));
                },
                options
            );
        });
    }
}

// Export the classes and constants
const RegionManagerExports = {
    RegionManager,
    LocationService,
    REGION_CODES
};

// For global access
window.RegionManagerModule = RegionManagerExports;

export default RegionManagerExports;