import { RegionGrid } from './regionGrid';
import { getCountryName, getCountryPhoneCode } from './countryData';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'images/marker-icon-2x.png',
    iconUrl: 'images/marker-icon.png',
    shadowUrl: 'images/marker-shadow.png'
});

const grid = new RegionGrid();
let map = null;
let countryLayer = null;
let marker = null;

async function init() {
    await grid.initialize();

    // Initialize map
    map = L.map('map').setView([20, 0], 2);
    
    // Add base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add GeoJSON layer for countries
    countryLayer = L.geoJSON(grid.boundaries, {
        style: function(feature) {
            return {
                fillColor: '#3388ff',
                weight: 2,
                opacity: 1,
                color: '#2B65EC',
                fillOpacity: 0.2
            };
        },
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseover: function(e) {
                    const layer = e.target;
                    // Only change the fill opacity for highlighting
                    layer.setStyle({
                        fillOpacity: 0.4
                    });
                    layer.bindTooltip(feature.properties.name).openTooltip();
                },
                mouseout: function(e) {
                    const layer = e.target;
                    layer.setStyle({
                        fillOpacity: 0.2
                    });
                    layer.closeTooltip();
                },
                click: function(e) {
                    const coords = e.latlng;
                    const countryName = feature.properties.name;
                    console.log(`Clicked ${countryName} at ${coords.lat}, ${coords.lng}`);
                }
            });
        }
    }).addTo(map);

    // Add click handler for the map
    map.on('click', function(e) {
        const countryName = grid.getCountryCode(e.latlng.lat, e.latlng.lng);
        if (countryName) {
            console.log(`Clicked in ${countryName} at ${e.latlng.lat}, ${e.latlng.lng}`);
        }
    });

    // Debug: Check the data
    console.log('Boundaries:', grid.boundaries);

    // Get user's location
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Center map on user's location
                map.setView([lat, lng], 4);
                
                // Add marker
                if (marker) {
                    marker.remove();
                }
                marker = L.marker([lat, lng]).addTo(map);

                // Update display with user's location info
                updateLocationDisplay(lat, lng);
            },
            (error) => {
                console.warn("Error getting location:", error.message);
            }
        );
    }

    map.on('click', (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        if (marker) {
            marker.remove();
        }
        marker = L.marker([lat, lng]).addTo(map);

        updateLocationDisplay(lat, lng);
    });
}

function updateLocationDisplay(lat, lng) {
    const countryCode = grid.getCountryCode(lat, lng);
    
    document.getElementById('coordinates').textContent = 
        `Coordinates: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
    
    if (countryCode) {
        const countryName = getCountryName(countryCode);
        const phoneCode = getCountryPhoneCode(countryCode);

        document.getElementById('country').textContent = `Country: ${countryName}`;
        document.getElementById('countryCode').textContent = `Country Code: +${phoneCode || ''}`;
    } else {
        document.getElementById('country').textContent = 'Country: No country selected';
        document.getElementById('countryCode').textContent = 'Country Code: N/A';
    }
}

// Handle module initialization and disposal
if (module.hot) {
    module.hot.dispose(() => {
        if (map) {
            map.off();
            map.remove();
            map = null;
            // Clean up Leaflet's internal state
            delete L.DomUtil._leaflet_id;
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export function getRegionFromCoordinates(lat, lng) {
    return grid.getCountryCode(lat, lng);
} 