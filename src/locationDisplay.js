class LocationDisplay {
    constructor() {
        // Check if RegionManager is available
        if (!window.RegionManagerModule) {
            throw new Error('RegionManager module not properly loaded');
        }
        
        // Create instances of the classes
        this.regionManager = new window.RegionManagerModule.RegionManager();
        this.locationService = new window.RegionManagerModule.LocationService();
        this.init();
    }

    async init() {
        try {
            // Get current position
            const position = await this.locationService.getCurrentPosition();
            
            // Update coordinates display
            const coordsElement = document.getElementById('coordinates');
            coordsElement.textContent = `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`;

            // Get and display region information
            const region = await this.regionManager.getRegionFromLocation(
                position.latitude,
                position.longitude
            );

            // Update region code display
            const regionCodeElement = document.getElementById('regionCode');
            regionCodeElement.textContent = region;

            // Update region name display
            const regionName = this.getRegionName(region);
            const regionNameElement = document.getElementById('regionName');
            regionNameElement.textContent = regionName;

            // Get nearest city and airport
            const nearestLocationInfo = await this.getNearestLocations(position.latitude, position.longitude);
            
            // Update nearest city display
            const nearestCityElement = document.getElementById('nearestCity');
            nearestCityElement.textContent = `${nearestLocationInfo.city} (${nearestLocationInfo.distance.toFixed(1)} km)`;

            // Update nearest airport display
            const nearestAirportElement = document.getElementById('nearestAirport');
            nearestAirportElement.textContent = 
                `${nearestLocationInfo.airport} (${nearestLocationInfo.airportCode}) - ${nearestLocationInfo.distance.toFixed(1)} km`;

        } catch (error) {
            this.showError(error.message);
        }
    }

    getRegionName(regionCode) {
        // Access REGION_CODES directly from window.RegionManagerModule
        const regions = window.RegionManagerModule.REGION_CODES;
        for (const [continentName, continent] of Object.entries(regions)) {
            for (const [countryName, country] of Object.entries(continent)) {
                if (typeof country === 'object') {
                    for (const [regionName, code] of Object.entries(country)) {
                        if (code === regionCode) {
                            return `${continentName} > ${countryName} > ${regionName}`;
                        }
                    }
                }
            }
        }
        return 'Unknown Region';
    }

    async getNearestLocations(latitude, longitude) {
        try {
            // Get nearest city using Nominatim
            const cityResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'RegionManager/1.0' // Required by Nominatim ToS
                    }
                }
            );
            const cityData = await cityResponse.json();

            // Get nearest airport using custom endpoint
            const airportResponse = await fetch(
                `https://raw.githubusercontent.com/mwgg/Airports/master/airports.json`
            );
            const airports = await airportResponse.json();

            // Find nearest airport
            const nearestAirport = this.findNearestAirport(latitude, longitude, airports);

            return {
                city: this.formatCityName(cityData),
                distance: this.calculateDistance(latitude, longitude, 
                    parseFloat(cityData.lat), parseFloat(cityData.lon)),
                airport: nearestAirport.name,
                airportCode: nearestAirport.iata || nearestAirport.icao
            };
        } catch (error) {
            console.error('Error fetching location data:', error);
            return {
                city: 'Error loading city data',
                distance: 0,
                airport: 'Error loading airport data',
                airportCode: 'ERR'
            };
        }
    }

    formatCityName(nominatimData) {
        const address = nominatimData.address;
        const city = address.city || address.town || address.village || address.suburb;
        const state = address.state;
        const country = address.country;
        
        return `${city}, ${state}, ${country}`;
    }

    findNearestAirport(lat, lon, airports) {
        let nearest = null;
        let shortestDistance = Infinity;

        console.log('Total airports to check:', Object.keys(airports).length);
        let majorAirportsCount = 0;
        let nearbyMajorAirports = [];

        for (const iata of Object.keys(airports)) {
            const airport = airports[iata];
            
            // Skip if missing coordinates or IATA code
            if (!airport.lat || !airport.lon || !airport.iata) continue;

            // Only include major airports
            if (!this.isMajorAirport(airport)) continue;
            
            majorAirportsCount++;

            const distance = this.calculateDistance(
                lat, lon,
                parseFloat(airport.lat),
                parseFloat(airport.lon)
            );

            // Keep track of all major airports within 200km
            if (distance < 200) {
                nearbyMajorAirports.push({
                    name: airport.name,
                    iata: airport.iata,
                    distance: distance
                });
            }

            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearest = {
                    ...airport,
                    distance: distance,
                    iata: airport.iata
                };
            }
        }

        console.log('Found major airports:', majorAirportsCount);
        console.log('Nearby major airports:', nearbyMajorAirports);
        if (nearest) {
            console.log('Nearest major airport:', nearest.name, nearest.iata, `(${nearest.distance.toFixed(1)}km)`);
        }

        return nearest || {
            name: 'No major airport found',
            iata: 'N/A',
            distance: 0
        };
    }

    isMajorAirport(airport) {
        // Log the first few airports to see their structure
        if (!this.hasLoggedAirport) {
            console.log('Sample airport data:', airport);
            this.hasLoggedAirport = true;
        }

        // Must have IATA code
        if (!airport.iata) return false;

        // Check if it's in the US
        const isUS = airport.country === 'United States' || airport.country === 'US';

        // Check name for indicators of major airport
        const nameLC = airport.name.toLowerCase();
        const isInternational = nameLC.includes('international') || nameLC.includes('intl');
        const isRegional = nameLC.includes('regional');
        const isMunicipal = nameLC.includes('municipal');
        const isSeaplane = nameLC.includes('seaplane');
        const isPrivate = nameLC.includes('private');

        // Exclude small or specialized airports
        if (isSeaplane || isPrivate || isMunicipal) return false;

        // Include if it's an international airport
        if (isInternational) return true;

        // Special handling for US airports
        if (isUS) {
            // Include major US airports that might not have "international" in name
            const majorUSAirports = [
                // East Coast
                'RDU', // Raleigh-Durham
                'LGA', // LaGuardia
                'JFK', // John F Kennedy
                'EWR', // Newark
                'BOS', // Boston Logan
                'PHL', // Philadelphia
                'BWI', // Baltimore/Washington
                'DCA', // Reagan National
                'IAD', // Dulles
                'CLT', // Charlotte
                'MIA', // Miami
                'FLL', // Fort Lauderdale
                'MCO', // Orlando
                'TPA', // Tampa

                // Midwest
                'ORD', // Chicago O'Hare
                'MDW', // Chicago Midway
                'DTW', // Detroit
                'MSP', // Minneapolis/St. Paul
                'CVG', // Cincinnati
                'IND', // Indianapolis
                'MCI', // Kansas City
                'STL', // St. Louis

                // South
                'ATL', // Atlanta
                'BNA', // Nashville
                'IAH', // Houston Bush
                'HOU', // Houston Hobby
                'DFW', // Dallas/Fort Worth
                'DAL', // Dallas Love Field
                'AUS', // Austin
                'SAT', // San Antonio
                'MSY', // New Orleans

                // Mountain/West
                'DEN', // Denver
                'SLC', // Salt Lake City
                'PHX', // Phoenix
                'LAS', // Las Vegas
                'PDX', // Portland
                'SEA', // Seattle-Tacoma
                'SFO', // San Francisco
                'OAK', // Oakland
                'SJC', // San Jose
                'LAX', // Los Angeles
                'SAN', // San Diego

                // Alaska/Hawaii
                'ANC', // Anchorage
                'HNL', // Honolulu
                'OGG'  // Kahului
            ];

            if (majorUSAirports.includes(airport.iata)) return true;

            // Include regional airports if they're significant
            if (isRegional && airport.iata.length === 3) return true;
        }

        return false;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
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

    showError(message) {
        const locationInfo = document.getElementById('locationInfo');
        locationInfo.innerHTML = `<div class="error">Error: ${message}</div>`;
    }
}

// Initialize when page loads and modules are ready
function initializeApp() {
    if (window.RegionManagerModule) {
        try {
            new LocationDisplay();
        } catch (error) {
            console.error('Failed to initialize LocationDisplay:', error);
            document.getElementById('locationInfo').innerHTML = 
                `<div class="error">Error: ${error.message}</div>`;
        }
    } else {
        // Wait a bit and try again
        setTimeout(initializeApp, 100);
    }
}

window.addEventListener('load', initializeApp);

export default LocationDisplay; 