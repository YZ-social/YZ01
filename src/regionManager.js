import crypto from 'crypto-browserify';
import { Buffer } from 'buffer/';

const REGION_CODES = {
    // North America (1000-1999)
    NORTH_AMERICA: {
        CANADA: {
            WEST: 1010,
            CENTRAL: 1020,
            EAST: 1030,
        },
        USA: {
            NORTHEAST: 1110,
            SOUTHEAST: 1120,
            MIDWEST: 1130,
            SOUTHWEST: 1140,
            WEST: 1150,
            PACIFIC: 1160,
            ALASKA: 1170,
            HAWAII: 1180,
        },
        MEXICO: {
            NORTH: 1210,
            CENTRAL: 1220,
            SOUTH: 1230,
        },
    },

    // Europe (2000-2999)
    EUROPE: {
        WESTERN: {
            UK: 2010,
            FRANCE: 2020,
            GERMANY: 2030,
            BENELUX: 2040,
        },
        NORTHERN: {
            SCANDINAVIA: 2110,
            BALTICS: 2120,
        },
        SOUTHERN: {
            IBERIA: 2210,
            ITALY: 2220,
            BALKANS: 2230,
        },
        EASTERN: {
            CENTRAL: 2310,
            EASTERN: 2320,
        },
    },

    // Asia (3000-3999)
    ASIA: {
        EAST: {
            JAPAN: 3010,
            KOREA: 3020,
            CHINA_NORTH: 3030,
            CHINA_SOUTH: 3040,
            TAIWAN: 3050,
        },
        SOUTHEAST: {
            VIETNAM: 3110,
            THAILAND: 3120,
            PHILIPPINES: 3130,
            INDONESIA: 3140,
            MALAYSIA: 3150,
        },
        SOUTH: {
            INDIA_NORTH: 3210,
            INDIA_SOUTH: 3220,
            PAKISTAN: 3230,
            BANGLADESH: 3240,
        },
    },

    // Oceania (4000-4999)
    OCEANIA: {
        AUSTRALIA: {
            EAST: 4010,
            WEST: 4020,
        },
        NEW_ZEALAND: 4110,
        PACIFIC_ISLANDS: 4210,
    },

    // Africa (5000-5999)
    AFRICA: {
        NORTH: 5010,
        WEST: 5020,
        EAST: 5030,
        CENTRAL: 5040,
        SOUTHERN: 5050,
    },

    // South America (6000-6999)
    SOUTH_AMERICA: {
        BRAZIL: {
            NORTH: 6010,
            SOUTH: 6020,
        },
        ANDES: 6110,
        SOUTHERN_CONE: 6120,
    },

    // Special Regions (9000-9999)
    SPECIAL: {
        ANONYMOUS: 9000,      // For users who want privacy
        SATELLITE: 9100,      // For satellite internet users
        MOBILE: 9200,         // For highly mobile users
        CUSTOM: 9900,         // For user-defined regions
    }
};

class RegionManager {
    constructor() {
        this.regions = REGION_CODES;
        this.regionBoundaries = {
            // North America
            'NORTH_AMERICA.CANADA.WEST': {
                bounds: { minLat: 49, maxLat: 70, minLng: -140, maxLng: -110 },
                code: REGION_CODES.NORTH_AMERICA.CANADA.WEST
            },
            'NORTH_AMERICA.CANADA.CENTRAL': {
                bounds: { minLat: 49, maxLat: 70, minLng: -110, maxLng: -90 },
                code: REGION_CODES.NORTH_AMERICA.CANADA.CENTRAL
            },
            'NORTH_AMERICA.CANADA.EAST': {
                bounds: { minLat: 45, maxLat: 70, minLng: -90, maxLng: -50 },
                code: REGION_CODES.NORTH_AMERICA.CANADA.EAST
            },
            'NORTH_AMERICA.USA.NORTHEAST': {
                bounds: { minLat: 40, maxLat: 47, minLng: -80, maxLng: -67 },
                code: REGION_CODES.NORTH_AMERICA.USA.NORTHEAST
            },
            'NORTH_AMERICA.USA.SOUTHEAST': {
                bounds: { minLat: 25, maxLat: 40, minLng: -90, maxLng: -75 },
                code: REGION_CODES.NORTH_AMERICA.USA.SOUTHEAST
            },
            'NORTH_AMERICA.USA.MIDWEST': {
                bounds: { minLat: 36, maxLat: 49, minLng: -104, maxLng: -80 },
                code: REGION_CODES.NORTH_AMERICA.USA.MIDWEST
            },
            'NORTH_AMERICA.USA.SOUTHWEST': {
                bounds: { minLat: 26, maxLat: 37, minLng: -114, maxLng: -94 },
                code: REGION_CODES.NORTH_AMERICA.USA.SOUTHWEST
            },
            'NORTH_AMERICA.USA.WEST': {
                bounds: { minLat: 35, maxLat: 49, minLng: -125, maxLng: -114 },
                code: REGION_CODES.NORTH_AMERICA.USA.WEST
            },
            'NORTH_AMERICA.USA.PACIFIC': {
                bounds: { minLat: 32, maxLat: 49, minLng: -125, maxLng: -114 },
                code: REGION_CODES.NORTH_AMERICA.USA.PACIFIC
            },
            'NORTH_AMERICA.USA.ALASKA': {
                bounds: { minLat: 51, maxLat: 72, minLng: -169, maxLng: -130 },
                code: REGION_CODES.NORTH_AMERICA.USA.ALASKA
            },
            'NORTH_AMERICA.USA.HAWAII': {
                bounds: { minLat: 18, maxLat: 23, minLng: -161, maxLng: -154 },
                code: REGION_CODES.NORTH_AMERICA.USA.HAWAII
            },
            'NORTH_AMERICA.MEXICO.NORTH': {
                bounds: { minLat: 23, maxLat: 32, minLng: -117, maxLng: -97 },
                code: REGION_CODES.NORTH_AMERICA.MEXICO.NORTH
            },
            'NORTH_AMERICA.MEXICO.CENTRAL': {
                bounds: { minLat: 18, maxLat: 23, minLng: -105, maxLng: -95 },
                code: REGION_CODES.NORTH_AMERICA.MEXICO.CENTRAL
            },
            'NORTH_AMERICA.MEXICO.SOUTH': {
                bounds: { minLat: 14, maxLat: 18, minLng: -98, maxLng: -86 },
                code: REGION_CODES.NORTH_AMERICA.MEXICO.SOUTH
            },

            // Europe
            'EUROPE.WESTERN.UK': {
                bounds: { minLat: 49, maxLat: 59, minLng: -8, maxLng: 2 },
                code: REGION_CODES.EUROPE.WESTERN.UK
            },
            'EUROPE.WESTERN.FRANCE': {
                bounds: { minLat: 42, maxLat: 51, minLng: -5, maxLng: 8 },
                code: REGION_CODES.EUROPE.WESTERN.FRANCE
            },
            'EUROPE.WESTERN.GERMANY': {
                bounds: { minLat: 47, maxLat: 55, minLng: 5, maxLng: 15 },
                code: REGION_CODES.EUROPE.WESTERN.GERMANY
            },
            'EUROPE.WESTERN.BENELUX': {
                bounds: { minLat: 49, maxLat: 54, minLng: 2, maxLng: 7 },
                code: REGION_CODES.EUROPE.WESTERN.BENELUX
            },
            'EUROPE.NORTHERN.SCANDINAVIA': {
                bounds: { minLat: 55, maxLat: 71, minLng: 4, maxLng: 32 },
                code: REGION_CODES.EUROPE.NORTHERN.SCANDINAVIA
            },
            'EUROPE.NORTHERN.BALTICS': {
                bounds: { minLat: 53, maxLat: 59, minLng: 20, maxLng: 29 },
                code: REGION_CODES.EUROPE.NORTHERN.BALTICS
            },
            'EUROPE.SOUTHERN.IBERIA': {
                bounds: { minLat: 36, maxLat: 44, minLng: -10, maxLng: 3 },
                code: REGION_CODES.EUROPE.SOUTHERN.IBERIA
            },
            'EUROPE.SOUTHERN.ITALY': {
                bounds: { minLat: 36, maxLat: 47, minLng: 7, maxLng: 19 },
                code: REGION_CODES.EUROPE.SOUTHERN.ITALY
            },
            'EUROPE.SOUTHERN.BALKANS': {
                bounds: { minLat: 39, maxLat: 47, minLng: 19, maxLng: 29 },
                code: REGION_CODES.EUROPE.SOUTHERN.BALKANS
            },
            'EUROPE.EASTERN.CENTRAL': {
                bounds: { minLat: 45, maxLat: 55, minLng: 15, maxLng: 25 },
                code: REGION_CODES.EUROPE.EASTERN.CENTRAL
            },
            'EUROPE.EASTERN.EASTERN': {
                bounds: { minLat: 45, maxLat: 60, minLng: 25, maxLng: 40 },
                code: REGION_CODES.EUROPE.EASTERN.EASTERN
            },

            // Asia
            'ASIA.EAST.JAPAN': {
                bounds: { minLat: 30, maxLat: 46, minLng: 129, maxLng: 146 },
                code: REGION_CODES.ASIA.EAST.JAPAN
            },
            'ASIA.EAST.KOREA': {
                bounds: { minLat: 33, maxLat: 43, minLng: 124, maxLng: 131 },
                code: REGION_CODES.ASIA.EAST.KOREA
            },
            'ASIA.EAST.CHINA_NORTH': {
                bounds: { minLat: 35, maxLat: 53, minLng: 73, maxLng: 135 },
                code: REGION_CODES.ASIA.EAST.CHINA_NORTH
            },
            'ASIA.EAST.CHINA_SOUTH': {
                bounds: { minLat: 20, maxLat: 35, minLng: 100, maxLng: 125 },
                code: REGION_CODES.ASIA.EAST.CHINA_SOUTH
            },
            'ASIA.EAST.TAIWAN': {
                bounds: { minLat: 21, maxLat: 25, minLng: 120, maxLng: 122 },
                code: REGION_CODES.ASIA.EAST.TAIWAN
            },

            // Southeast Asia
            'ASIA.SOUTHEAST.VIETNAM': {
                bounds: { minLat: 8, maxLat: 23, minLng: 102, maxLng: 110 },
                code: REGION_CODES.ASIA.SOUTHEAST.VIETNAM
            },
            'ASIA.SOUTHEAST.THAILAND': {
                bounds: { minLat: 5, maxLat: 21, minLng: 97, maxLng: 106 },
                code: REGION_CODES.ASIA.SOUTHEAST.THAILAND
            },
            'ASIA.SOUTHEAST.PHILIPPINES': {
                bounds: { minLat: 4, maxLat: 21, minLng: 116, maxLng: 127 },
                code: REGION_CODES.ASIA.SOUTHEAST.PHILIPPINES
            },
            'ASIA.SOUTHEAST.INDONESIA': {
                bounds: { minLat: -11, maxLat: 6, minLng: 95, maxLng: 141 },
                code: REGION_CODES.ASIA.SOUTHEAST.INDONESIA
            },
            'ASIA.SOUTHEAST.MALAYSIA': {
                bounds: { minLat: -4, maxLat: 7, minLng: 100, maxLng: 119 },
                code: REGION_CODES.ASIA.SOUTHEAST.MALAYSIA
            },

            // South Asia
            'ASIA.SOUTH.INDIA_NORTH': {
                bounds: { minLat: 20, maxLat: 35, minLng: 68, maxLng: 97 },
                code: REGION_CODES.ASIA.SOUTH.INDIA_NORTH
            },
            'ASIA.SOUTH.INDIA_SOUTH': {
                bounds: { minLat: 8, maxLat: 20, minLng: 72, maxLng: 87 },
                code: REGION_CODES.ASIA.SOUTH.INDIA_SOUTH
            },
            'ASIA.SOUTH.PAKISTAN': {
                bounds: { minLat: 23, maxLat: 37, minLng: 61, maxLng: 76 },
                code: REGION_CODES.ASIA.SOUTH.PAKISTAN
            },
            'ASIA.SOUTH.BANGLADESH': {
                bounds: { minLat: 20, maxLat: 27, minLng: 88, maxLng: 93 },
                code: REGION_CODES.ASIA.SOUTH.BANGLADESH
            },

            // Oceania
            'OCEANIA.AUSTRALIA.EAST': {
                bounds: { minLat: -44, maxLat: -10, minLng: 138, maxLng: 154 },
                code: REGION_CODES.OCEANIA.AUSTRALIA.EAST
            },
            'OCEANIA.AUSTRALIA.WEST': {
                bounds: { minLat: -35, maxLat: -12, minLng: 112, maxLng: 138 },
                code: REGION_CODES.OCEANIA.AUSTRALIA.WEST
            },
            'OCEANIA.NEW_ZEALAND': {
                bounds: { minLat: -47, maxLat: -34, minLng: 166, maxLng: 179 },
                code: REGION_CODES.OCEANIA.NEW_ZEALAND
            },
            'OCEANIA.PACIFIC_ISLANDS': {
                bounds: { minLat: -23, maxLat: 20, minLng: 157, maxLng: -157 },
                code: REGION_CODES.OCEANIA.PACIFIC_ISLANDS
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
                bounds: { minLat: -5, maxLat: 5, minLng: -70, maxLng: -35 },
                code: REGION_CODES.SOUTH_AMERICA.BRAZIL.NORTH
            },
            'SOUTH_AMERICA.BRAZIL.SOUTH': {
                bounds: { minLat: -33, maxLat: -5, minLng: -58, maxLng: -35 },
                code: REGION_CODES.SOUTH_AMERICA.BRAZIL.SOUTH
            },
            'SOUTH_AMERICA.ANDES': {
                bounds: { minLat: -23, maxLat: 12, minLng: -81, maxLng: -65 },
                code: REGION_CODES.SOUTH_AMERICA.ANDES
            },
            'SOUTH_AMERICA.SOUTHERN_CONE': {
                bounds: { minLat: -56, maxLat: -23, minLng: -76, maxLng: -53 },
                code: REGION_CODES.SOUTH_AMERICA.SOUTHERN_CONE
            }
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