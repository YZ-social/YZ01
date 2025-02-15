const majorAirports = [
    // North American Airports
    { code: 'RDU', name: 'Raleigh-Durham International', lat: 35.8801, lng: -78.7880 },
    { code: 'ATL', name: 'Hartsfield-Jackson Atlanta', lat: 33.6407, lng: -84.4277 },
    { code: 'JFK', name: 'John F. Kennedy International', lat: 40.6413, lng: -73.7781 },
    { code: 'LAX', name: 'Los Angeles International', lat: 33.9416, lng: -118.4085 },
    { code: 'ORD', name: 'Chicago O\'Hare International', lat: 41.9742, lng: -87.9073 },
    { code: 'DFW', name: 'Dallas/Fort Worth International', lat: 32.8998, lng: -97.0403 },
    { code: 'DEN', name: 'Denver International', lat: 39.8561, lng: -104.6737 },
    { code: 'CLT', name: 'Charlotte Douglas International', lat: 35.2144, lng: -80.9473 },

    // International Hubs
    { code: 'LHR', name: 'London Heathrow', lat: 51.4700, lng: -0.4543 },
    { code: 'CDG', name: 'Paris Charles de Gaulle', lat: 49.0097, lng: 2.5479 },
    { code: 'HND', name: 'Tokyo Haneda', lat: 35.5494, lng: 139.7798 },
    { code: 'PEK', name: 'Beijing Capital', lat: 40.0799, lng: 116.6031 },
    { code: 'DXB', name: 'Dubai International', lat: 25.2532, lng: 55.3657 },
    { code: 'SYD', name: 'Sydney Kingsford Smith', lat: -33.9399, lng: 151.1753 },
    { code: 'GRU', name: 'São Paulo Guarulhos', lat: -23.4356, lng: -46.4731 },
    { code: 'JNB', name: 'Johannesburg O.R. Tambo', lat: -26.1367, lng: 28.2425 },
    // Add more major airports as needed
];

export function findNearestAirport(lat, lng) {
    let nearest = majorAirports[0];
    let minDist = getDistance(lat, lng, nearest.lat, nearest.lng);

    majorAirports.forEach(airport => {
        const dist = getDistance(lat, lng, airport.lat, airport.lng);
        if (dist < minDist) {
            minDist = dist;
            nearest = airport;
        }
    });

    return nearest;
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI/180);
} 