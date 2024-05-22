export const displayMap = (locations) => {
  var map = L.map('map', { zoomControl: false});  //to disable + - zoom
  // var map = L.map('map', { zoomControl: false }).setView([31.111745, -118.113491], );

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    crossOrigin: ""
  }).addTo(map);

  const points = [];
  locations.forEach((loc) => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);
    L.marker([loc.coordinates[1], loc.coordinates[0]])
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, { autoClose: false })
      .openPopup();
  });

  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);
}


// map.scrollWheelZoom.disable();  //to disable zoom by mouse wheel


/* eslint-disable */
// import keys from "../../config/keys";

// export const displayMap = locations => {
//   mapboxgl.accessToken = keys.mapBoxAccessToken;
//   var map = new mapboxgl.Map({
//     container: "map",
//     style: "mapbox://styles/rasedmia/ck3cmgrsx1qa61cpiuonp0dja",
//     scrollZoom: false
//     // center: [-118.113491, 34.111745],
//     // zoom: 10,
//     // interactive: false
//   });

//   const bounds = new mapboxgl.LngLatBounds();

//   locations.forEach(loc => {
//     // Create marker
//     const el = document.createElement("div");
//     el.className = "marker";

//     // Add marker
//     new mapboxgl.Marker({
//       element: el,
//       anchor: "bottom"
//     })
//       .setLngLat(loc.coordinates)
//       .addTo(map);

//     // Add popup
//     new mapboxgl.Popup({
//       offset: 30
//     })
//       .setLngLat(loc.coordinates)
//       .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
//       .addTo(map);

//     // Extend map bounds to include current location
//     bounds.extend(loc.coordinates);
//   });

//   map.fitBounds(bounds, {
//     padding: {
//       top: 200,
//       bottom: 150,
//       left: 100,
//       right: 100
//     }
//   });
// };