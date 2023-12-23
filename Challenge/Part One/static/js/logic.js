// Store our API endpoint as queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create a global variable for myMap
let myMap;

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(earthquakeData) {
    //Send data.features object to the createFeatures function.
    console.log(earthquakeData);
    createFeatures(earthquakeData.features);
});

// Create markers whose size increases with magnitude and color with depth
function createMarker(feature, latlng) {
    return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        color: "white",
        weight: 0.8,
        opacity: 0.8,
        fillOpacity: 0.7
    });
}

function createFeatures(earthquakeData) {
    // Define function to run for each feature in the features array.
    // Give each feature a popup that describes the time and place of the earthquake.
    function onEachFeature(feature, layer) {
        // Assuming feature.properties.time is a timestamp in milliseconds
        const timestamp = feature.properties.time;
        const date = new Date(timestamp);
        const formattedDateTime = date.toLocaleString();

        layer.bindPopup(`
          <h3>Location:</h3> ${feature.properties.place}
          <h3>Magnitude:</h3> ${feature.properties.mag}
          <h3>Depth:</h3> ${feature.geometry.coordinates[2]}
          <h3>Time:</h3> ${formattedDateTime}
        `);
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createMarker
    });

    // Send earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Create the base layers
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create map
    myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [street, earthquakes]
    });

    // Define baseMaps and overlayMaps
    let baseMaps = {
        "Street Map": street
    };

    let overlayMaps = {
        "Earthquakes": earthquakes
    };

    // Pass in baseMaps and overlayMaps
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add legend to map
    createLegend();
}

function createLegend() {
    let legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 60, 90],
            legendInfo = "<h5>Magnitude</h5>";

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Add legend to map
    legend.addTo(myMap);
}

// Increase marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 5;
}

// Change marker color based on depth
function markerColor(depth) {
    return depth > 90 ? 'red' :
        depth > 70 ? 'lightcoral' :
        depth > 50 ? 'yellow' :
        depth > 30 ? 'greenyellow' :
        depth > 10 ? 'green' :
            'darkgreen';
}
