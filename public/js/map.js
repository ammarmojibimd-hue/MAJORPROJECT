mapboxgl.accessToken = mapToken;

// 1. Safe coordinates prepare karein
let validCoordinates = [85.1376, 25.5941]; // Default Patna fallback

// EJS variable ko backend se check karke assign karein
const rawCoordinates = typeof listing !== 'undefined' && listing.geometry ? listing.geometry.coordinates : null;

if (Array.isArray(rawCoordinates) && rawCoordinates.length === 2) {
    validCoordinates = [Number(rawCoordinates[0]), Number(rawCoordinates[1])];
}

// 2. Map initialize karein
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: validCoordinates, // ❌ listing.geometry.validCoordinates nahi hoga
    zoom: 9,
});

// 3. Marker add karein
new mapboxgl.Marker({ color: 'red' })
    .setLngLat(validCoordinates) // ❌ listing.geometry.validCoordinates nahi hoga
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h4>${typeof listing !== 'undefined' ? listing.location : ''}</h4><p>Exact location will be provided after booking</p>`
    ))
    .addTo(map);