const { RegionManager, REGION_CODES } = require('./regionManager');

describe('RegionManager', () => {
    let regionManager;

    beforeEach(() => {
        regionManager = new RegionManager();
    });

    test('should create valid node ID', () => {
        const publicKey = Buffer.from('test-key');
        const nodeId = regionManager.createNodeId(
            REGION_CODES.NORTH_AMERICA.CANADA.WEST,
            publicKey
        );
        expect(nodeId).toBeDefined();
        expect(nodeId.length).toBe(34); // 2 bytes region + 32 bytes hash
    });

    test('should find correct region for coordinates', async () => {
        const testCases = [
            {
                latitude: 51.0447,
                longitude: -114.0719,
                description: 'Calgary, Canada',
                expectedRegion: REGION_CODES.NORTH_AMERICA.CANADA.WEST
            },
            {
                latitude: 40.7128,
                longitude: -74.0060,
                description: 'New York City, USA',
                expectedRegion: REGION_CODES.NORTH_AMERICA.USA.NORTHEAST
            },
            {
                latitude: 35.6762,
                longitude: 139.6503,
                description: 'Tokyo, Japan',
                expectedRegion: REGION_CODES.ASIA.EAST.JAPAN
            }
        ];

        for (const testCase of testCases) {
            const region = await regionManager.getRegionFromLocation(
                testCase.latitude,
                testCase.longitude
            );
            
            console.log('\nTest Location:', testCase.description);
            console.log('Coordinates:', testCase.latitude, testCase.longitude);
            console.log('Found Region:', region);
            console.log('Expected Region:', testCase.expectedRegion);
            
            expect(region).toBe(testCase.expectedRegion);
        }
    });
}); 