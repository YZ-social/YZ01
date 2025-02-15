import L from 'leaflet';

export class RegionMap {
    constructor(regionManager) {
        this.regionManager = regionManager;
        this.map = null;
        this.regionLayers = {};
        this.activeRegion = null;
        this.defaultZIndex = 100;  // Base z-index for regions
    }

    initialize(containerId) {
        // Initialize the map
        this.map = L.map(containerId).setView([20, 0], 2);
        
        // Add base tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add region polygons
        this.addRegionPolygons();
    }

    addRegionPolygons() {
        Object.entries(this.regionManager.regionBoundaries).forEach(([regionName, region]) => {
            const bounds = region.bounds;
            
            // Create points for the polygon, handling date line crossing
            let points = [];
            if (bounds.minLng > bounds.maxLng) {
                // Region crosses the date line - create two polygons
                const poly1 = [
                    [bounds.maxLat, bounds.minLng],
                    [bounds.maxLat, 180],
                    [bounds.minLat, 180],
                    [bounds.minLat, bounds.minLng]
                ];
                const poly2 = [
                    [bounds.maxLat, -180],
                    [bounds.maxLat, bounds.maxLng],
                    [bounds.minLat, bounds.maxLng],
                    [bounds.minLat, -180]
                ];
                points = [poly1, poly2];
            } else {
                points = [[
                    [bounds.maxLat, bounds.minLng],
                    [bounds.maxLat, bounds.maxLng],
                    [bounds.minLat, bounds.maxLng],
                    [bounds.minLat, bounds.minLng]
                ]];
            }

            // Create polygon(s) for the region
            points.forEach(polyPoints => {
                const polygon = L.polygon(polyPoints, {
                    color: this.getRegionColor(regionName),
                    fillOpacity: 0.3,
                    weight: 1,
                    className: 'region-polygon',
                    zIndexOffset: this.getRegionZIndex(regionName)
                });

                // Add hover effects
                polygon.on('mouseover', () => {
                    if (this.activeRegion !== regionName) {
                        polygon.setStyle({ 
                            fillOpacity: 0.5
                        });
                    }
                });

                polygon.on('mouseout', () => {
                    if (this.activeRegion !== regionName) {
                        polygon.setStyle({ 
                            fillOpacity: 0.3
                        });
                    }
                });

                polygon.on('click', () => this.onRegionClick(regionName, region.code));
                polygon.bindTooltip(this.formatRegionName(regionName));
                
                if (!this.regionLayers[regionName]) {
                    this.regionLayers[regionName] = [];
                }
                this.regionLayers[regionName].push(polygon);
                polygon.addTo(this.map);
            });
        });
    }

    getRegionColor(regionName) {
        const colors = {
            'POLAR': '#ffffff',
            'NORTH_AMERICA': '#ff6b6b',
            'EUROPE': '#4ecdc4',
            'ASIA': '#45b7d1',
            'OCEANIA': '#96ceb4',
            'AFRICA': '#ffeead',
            'SOUTH_AMERICA': '#d4a5a5',
            'PACIFIC': 'rgba(162, 213, 242, 0.5)',    // More transparent
            'ATLANTIC': 'rgba(135, 206, 235, 0.5)',   // More transparent
            'INDIAN': 'rgba(126, 192, 238, 0.5)'      // More transparent
        };

        const region = regionName.split('.')[0];
        return colors[region] || '#888888';
    }

    formatRegionName(regionName) {
        return regionName.split('.').join(' > ');
    }

    getRegionZIndex(regionName) {
        // Calculate area of the region
        const region = this.regionManager.regionBoundaries[regionName];
        const width = Math.abs(region.bounds.maxLng - region.bounds.minLng);
        const height = Math.abs(region.bounds.maxLat - region.bounds.minLat);
        const area = width * height;

        // Strictly inverse relationship with area
        // Smaller regions get much higher z-index values
        // Using a large multiplier (10000) to ensure clear separation
        return Math.round(10000 / area);
    }

    setActiveRegion(regionCode) {
        // Reset previous active region
        if (this.activeRegion) {
            const layers = this.regionLayers[this.activeRegion];
            if (layers) {
                layers.forEach(layer => {
                    layer.setStyle({ 
                        fillOpacity: 0.3, 
                        weight: 1,
                        color: this.getRegionColor(this.activeRegion)
                    });
                });
            }
        }

        // Find and highlight new active region
        const regionName = Object.entries(this.regionManager.regionBoundaries)
            .find(([_, region]) => region.code === regionCode)?.[0];

        if (regionName) {
            const layers = this.regionLayers[regionName];
            if (layers) {
                layers.forEach(layer => {
                    layer.setStyle({ 
                        fillOpacity: 0.5, 
                        weight: 2,
                        color: '#0000FF'
                    });
                });
                this.activeRegion = regionName;
            }
        }
    }

    onRegionClick(regionName, regionCode) {
        this.setActiveRegion(regionCode);
        // Dispatch custom event for region selection
        const event = new CustomEvent('regionSelected', {
            detail: { regionName, regionCode }
        });
        window.dispatchEvent(event);
    }
} 