import L from 'leaflet';

export class RegionGridMap {
    constructor(regionGrid) {
        this.regionGrid = regionGrid;
        this.map = null;
        this.regionLayers = {};
        this.activeRegion = null;
    }

    initialize(containerId) {
        // Initialize the map centered on Greenwich meridian and equator
        this.map = L.map(containerId, {
            center: [0, 0],
            zoom: 2,
            worldCopyJump: true,  // Enables smooth scrolling across dateline
            maxBounds: [[-90, -180], [90, 180]]  // Restrict panning to one world copy
        });
        
        // Add base tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            noWrap: true  // Prevents multiple world copies
        }).addTo(this.map);

        // Add grid overlay
        this.addGridOverlay();

        // Add grid-based regions
        this.addRegions();
    }

    addRegions() {
        Object.entries(this.regionGrid.regions).forEach(([regionName, region]) => {
            const polygons = this.cellsToPolygons(region.cells);
            const color = this.getRegionColor(regionName);

            // Create a feature group for the region's polygons
            const featureGroup = L.featureGroup();
            
            polygons.forEach(points => {
                const polygon = L.polygon(points, {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.3,
                    weight: 1
                });

                // Add hover effects
                polygon.on('mouseover', () => {
                    if (this.activeRegion !== regionName) {
                        featureGroup.setStyle({ fillOpacity: 0.5 });
                    }
                });

                polygon.on('mouseout', () => {
                    if (this.activeRegion !== regionName) {
                        featureGroup.setStyle({ fillOpacity: 0.3 });
                    }
                });

                featureGroup.addLayer(polygon);
            });

            // Add click handler to the feature group
            featureGroup.on('click', () => this.onRegionClick(regionName, region.code));
            
            // Add tooltip
            featureGroup.bindTooltip(this.formatRegionName(regionName));
            
            this.regionLayers[regionName] = featureGroup;
            featureGroup.addTo(this.map);
        });
    }

    cellsToPolygons(cells) {
        // Group cells that cross the date line
        const normalCells = [];
        const datelineCells = [];
        
        cells.forEach(([row, col]) => {
            if (col === 0 || col === this.regionGrid.COLS - 1) {
                datelineCells.push([row, col]);
            } else {
                normalCells.push([row, col]);
            }
        });

        // Convert cells to lat/lng coordinates
        const polygons = [];
        
        if (normalCells.length > 0) {
            const points = normalCells.map(([row, col]) => {
                const lat = 90 - (row * this.regionGrid.CELL_HEIGHT);
                const lng = -180 + (col * this.regionGrid.CELL_WIDTH);
                return [
                    [lat, lng],
                    [lat, lng + this.regionGrid.CELL_WIDTH],
                    [lat - this.regionGrid.CELL_HEIGHT, lng + this.regionGrid.CELL_WIDTH],
                    [lat - this.regionGrid.CELL_HEIGHT, lng]
                ];
            });
            polygons.push(this.mergePoints(points));
        }

        // Handle dateline crossing cells separately
        if (datelineCells.length > 0) {
            const westPoints = [];
            const eastPoints = [];
            datelineCells.forEach(([row, col]) => {
                const lat = 90 - (row * this.regionGrid.CELL_HEIGHT);
                if (col === 0) {
                    westPoints.push([
                        [lat, -180],
                        [lat, -180 + this.regionGrid.CELL_WIDTH],
                        [lat - this.regionGrid.CELL_HEIGHT, -180 + this.regionGrid.CELL_WIDTH],
                        [lat - this.regionGrid.CELL_HEIGHT, -180]
                    ]);
                } else {
                    eastPoints.push([
                        [lat, 180 - this.regionGrid.CELL_WIDTH],
                        [lat, 180],
                        [lat - this.regionGrid.CELL_HEIGHT, 180],
                        [lat - this.regionGrid.CELL_HEIGHT, 180 - this.regionGrid.CELL_WIDTH]
                    ]);
                }
            });
            if (westPoints.length > 0) polygons.push(this.mergePoints(westPoints));
            if (eastPoints.length > 0) polygons.push(this.mergePoints(eastPoints));
        }

        return polygons;
    }

    mergePoints(pointArrays) {
        if (pointArrays.length === 0) return [];
        
        // First, organize cells by rows
        const cellsByRow = {};
        pointArrays.forEach(points => {
            const topLat = points[0][0];  // Get latitude of top edge
            if (!cellsByRow[topLat]) {
                cellsByRow[topLat] = [];
            }
            cellsByRow[topLat].push(points);
        });

        // For each row, merge adjacent cells
        const mergedPolygons = [];
        Object.entries(cellsByRow).forEach(([topLat, rowCells]) => {
            // Sort cells by longitude
            rowCells.sort((a, b) => a[0][1] - b[0][1]);
            
            let currentStrip = [rowCells[0]];
            
            // Merge cells that share longitude boundaries
            for (let i = 1; i < rowCells.length; i++) {
                const prevCell = rowCells[i-1];
                const currentCell = rowCells[i];
                
                if (prevCell[1][1] === currentCell[0][1]) {  // Cells are adjacent
                    currentStrip.push(currentCell);
                } else {
                    // Create merged polygon for current strip
                    mergedPolygons.push(this.mergeStrip(currentStrip));
                    currentStrip = [currentCell];
                }
            }
            
            // Merge remaining strip
            if (currentStrip.length > 0) {
                mergedPolygons.push(this.mergeStrip(currentStrip));
            }
        });

        return mergedPolygons;
    }

    mergeStrip(cells) {
        // Create a polygon from a horizontal strip of cells
        const topPoints = cells.map(cell => [cell[0][0], cell[0][1]]);
        const bottomPoints = cells.map(cell => [cell[3][0], cell[3][1]]).reverse();
        
        // Add the rightmost top-to-bottom edge
        const rightEdge = [
            [cells[cells.length-1][1][0], cells[cells.length-1][1][1]],
            [cells[cells.length-1][2][0], cells[cells.length-1][2][1]]
        ];
        
        // Add the leftmost bottom-to-top edge
        const leftEdge = [
            [cells[0][3][0], cells[0][3][1]],
            [cells[0][0][0], cells[0][0][1]]
        ];
        
        return [...topPoints, ...rightEdge, ...bottomPoints, ...leftEdge];
    }

    getRegionColor(regionName) {
        const colors = {
            'PACIFIC': '#a2d5f2',
            'NORTH_AMERICA': '#ff6b6b',
            'EUROPE': '#4ecdc4',
            'ASIA': '#45b7d1',
            'AFRICA': '#ffeead',
            'SOUTH_AMERICA': '#d4a5a5',
            'ATLANTIC': '#87ceeb',
            'INDIAN': '#7ec0ee',
            'SOUTHERN': '#b0e0e6'
        };

        const mainRegion = regionName.split('.')[0];
        return colors[mainRegion] || '#888888';
    }

    formatRegionName(regionName) {
        return regionName.split('.').join(' > ');
    }

    setActiveRegion(regionCode) {
        // Reset previous active region
        if (this.activeRegion) {
            const layer = this.regionLayers[this.activeRegion];
            if (layer) {
                layer.setStyle({
                    fillOpacity: 0.3,
                    weight: 1,
                    color: this.getRegionColor(this.activeRegion)
                });
            }
        }

        // Find and highlight new active region
        const regionName = Object.entries(this.regionGrid.regions)
            .find(([_, region]) => region.code === regionCode)?.[0];

        if (regionName) {
            const layer = this.regionLayers[regionName];
            if (layer) {
                layer.setStyle({
                    fillOpacity: 0.5,
                    weight: 2,
                    color: '#0000FF'
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

    addGridOverlay() {
        // Add latitude lines (horizontal)
        for (let row = 0; row < this.regionGrid.ROWS; row++) {
            const lat = 90 - (row * this.regionGrid.CELL_HEIGHT);
            const style = {
                color: lat === 0 ? '#FF0000' : '#666',  // Red for equator
                weight: lat === 0 ? 2 : 0.5,
                opacity: lat === 0 ? 0.8 : 0.5,
                dashArray: lat === 0 ? null : '5,5'
            };
            L.polyline([[lat, -180], [lat, 180]], style).addTo(this.map);
        }
        
        // Add longitude lines (vertical), starting from dateline
        for (let col = 0; col < this.regionGrid.COLS; col++) {
            const lng = -180 + (col * this.regionGrid.CELL_WIDTH);
            const style = {
                color: lng === -180 || lng === 180 ? '#FF0000' : '#666',  // Red for dateline
                weight: lng === -180 || lng === 180 ? 2 : 0.5,
                opacity: lng === -180 || lng === 180 ? 0.8 : 0.5,
                dashArray: lng === -180 || lng === 180 ? null : '5,5'
            };
            L.polyline([[-90, lng], [90, lng]], style).addTo(this.map);
        }

        // Add grid coordinates with dateline-centered reference
        for (let row = 0; row < this.regionGrid.ROWS; row++) {
            for (let col = 0; col < this.regionGrid.COLS; col++) {
                const lat = 90 - (row * this.regionGrid.CELL_HEIGHT) - (this.regionGrid.CELL_HEIGHT / 2);
                const lng = -180 + (col * this.regionGrid.CELL_WIDTH) + (this.regionGrid.CELL_WIDTH / 2);
                
                // Calculate grid coordinates relative to dateline
                const gridCol = col;
                const gridRow = row;
                
                L.marker([lat, lng], {
                    icon: L.divIcon({
                        html: `${gridRow},${gridCol}`,
                        className: 'grid-label'
                    })
                }).addTo(this.map);
            }
        }
    }
} 