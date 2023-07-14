// Zentrum Karte Objekt
let noeMitte = {
    lat: 47.57263991370453,
    lng: 12.575230341446556,
    title: "irgendwo"
};

// Karte initialisieren und Fullscreen Control 
let map = L.map("map", {
    fullscreenControl: true
}).setView([
    noeMitte.lat, noeMitte.lng
], 7);

// thematische Layer
let themaLayer = {
    innsbruckLipno: L.featureGroup(),
    muenchenVenedig: L.featureGroup(),
    surfparty: L.featureGroup(),
    forecast: L.featureGroup(),
};

// Hintergrundlayer 
let layerControl = L.control.layers({
    "Terrain": L.tileLayer.provider("Stamen.Terrain").addTo(map),
    "StamenB/W": L.tileLayer.provider("Stamen.TonerLite"),
    "CycleTrails": L.tileLayer.provider("CyclOSM"),
}, {
    "Innsbruck-Lipno": themaLayer.innsbruckLipno.addTo(map),
    "München-Venedig": themaLayer.muenchenVenedig.addTo(map),
    "Surfparty": themaLayer.surfparty,
    "Wettervorhersage MET Norway": themaLayer.forecast,
}).addTo(map);

// Layer beim Besuch auf der Seite ausklappen
layerControl.expand();

// Instanz Leaflet MiniMap
var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("Stamen.TonerLite"), {
    toggleDisplay: true,
}
).addTo(map);

//Geolocation
map.locate({
    setView: false,
    maxZoom: 16,
    watch: true,
});

let circle = L.circle([0, 0], 0).addTo(map);

map.on('locationfound', function (evt) {
    let radius = Math.round(evt.accuracy);
    L.circle(evt.latlng, radius).addTo(map);
    circle.setLatLng(evt.latlng);
    circle.setRadius(radius);
}
);

let errorDisplayed = false;

map.on('locationerror', function (evt) {
    if (!errorDisplayed) {
        alert(evt.message);
        errorDisplayed = true;
    }
});

// Wettervorhersage MET Norway
async function showForecast(url, latlng) {
    let response = await fetch(url);
    let jsondata = await response.json();

    let current = jsondata.properties.timeseries[0].data.instant.details;

    let timestamp = new Date(jsondata.properties.meta.updated_at).toLocaleString();

    let timeseries = jsondata.properties.timeseries;

    let markup = `
        <h4>Wetter für ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)} (${timestamp})</h4>
        <table>
            <tr><td>Lufttemperatur (C)</td><td>${current.air_temperature}</td></tr>
            <tr><td>Bewölkungsgrad (%)</td><td>${current.cloud_area_fraction}</td></tr>
            <tr><td>Luftfeuchtigkeit (%)</td><td>${current.relative_humidity}</td></tr>
            <tr><td>Windrichtung (°)</td><td>${current.wind_from_direction}</td></tr>
            <tr><td>Windgeschwindigkeit (m/s)</td><td>${current.wind_speed}</td></tr>
        </table>
    `;

    // Wettersymbole hinzufügen
    for (let i = 0; i <= 24; i += 3) {
        let icon = timeseries[i].data.next_1_hours.summary.symbol_code;
        let img = `icons/${icon}.svg`;
        markup += `<img src="${img}" style="width:32px;" title="${timeseries[i].time.toLocaleString()}">`
    }
    L.popup().setLatLng(latlng).setContent(markup).openOn(themaLayer.forecast);
}

// Wettervorhersage auf Kartenklick reagieren (Event via map.on)
map.on("click", function (evt) {
    console.log(evt);
    let url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${evt.latlng.lat}&lon=${evt.latlng.lng}`;
    showForecast(url, evt.latlng);
});

//GPX-Tracks
//Innsbruck-Gerlos
var gpx = './tracks/Innsbruck_Gerlos.gpx';
let kamp = new L.GPX(gpx, {
    polyline_options: {
        color: '#ff1493',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.innsbruckLipno);


// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
kamp.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "innsbruck-gerlos"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/Innsbruck_Gerlos.gpx")
});


//Gerlos-Neunbrunnen
var gpx = './tracks/Gerlos_Neunbrunnen.gpx';
let piesting = new L.GPX(gpx, {
    polyline_options: {
        color: '#8a2be2',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.innsbruckLipno);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
piesting.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/Gerlos_Neunbrunnen.gpx")
});

//Neunbrunnen-Lofer
var gpx = './tracks/Neunbrunnen_Lofer.gpx';
let lofer = new L.GPX(gpx, {
    polyline_options: {
        color: '#ff1493',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.innsbruckLipno);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
lofer.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/Neunbrunnen_Lofer.gpx")
});

//Lofer-Salzburg
var gpx = './tracks/Lofer_Salzburg.gpx';
let thaya = new L.GPX(gpx, {
    polyline_options: {
        color: '#8a2be2',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.innsbruckLipno);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
thaya.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/Lofer_Salzburg.gpx")
});

//Salzburg-Wolfgangsee
var gpx = './tracks/Salzburg_Wolfgangsee.gpx';
let traisen = new L.GPX(gpx, {
    polyline_options: {
        color: '#ff1493',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.innsbruckLipno);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
traisen.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/Salzburg_Wolfgangsee.gpx")
});

//Wolfgangsee-Traunsee
var gpx = './tracks/Wolfgangsee_Traunsee.gpx';
let triesting = new L.GPX(gpx, {
    polyline_options: {
        color: '#8a2be2',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.innsbruckLipno);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
triesting.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/Wolfgangsee_Traunsee.gpx")
});

//Traunsee-Linz
var gpx = './tracks/Traunsee_Linz.gpx';
let triestingau = new L.GPX(gpx, {
    polyline_options: {
        color: '#ff1493',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.innsbruckLipno);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
triestingau.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "triestingau"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/Traunsee_Linz.gpx")
});

//Linz-Lipno
var gpx = './tracks/Linz_Lipno.gpx';
let ybbs = new L.GPX(gpx, {
    polyline_options: {
        color: '#8a2be2',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.innsbruckLipno);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
ybbs.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/Linz_Lipno.gpx")
});

//München-Fall
var gpx = './tracks/muenchenFall.gpx';
let muenchen = new L.GPX(gpx, {
    polyline_options: {
        color: '#0000ee',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.muenchenVenedig);


// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
muenchen.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "muenchen-fall"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/muenchenFall.gpx")
});

//Fall-Innsbruck
var gpx = './tracks/fallInnsbruck.gpx';
let fall = new L.GPX(gpx, {
    polyline_options: {
        color: '#ff7f24',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.muenchenVenedig);


// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
fall.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "innsbruck-gerlos"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/fallInnsbruck.gpx")
});

//Innsbruck-Sterzing
var gpx = './tracks/innsbruckSterzing.gpx';
let innsbruck = new L.GPX(gpx, {
    polyline_options: {
        color: '#0000ee',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.muenchenVenedig);


// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
innsbruck.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "innsbruck-gerlos"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/innsbruckSterzing.gpx")
});


//Sterzing-Bruneck
var gpx = './tracks/sterzingBruneck.gpx';
let sterzing = new L.GPX(gpx, {
    polyline_options: {
        color: '#ff7f24',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.muenchenVenedig);


// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
kamp.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "innsbruck-gerlos"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/sterzingBruneck.gpx")
});

//Bruneck-Cortina
var gpx = './tracks/bruneckCortina.gpx';
let bruneck = new L.GPX(gpx, {
    polyline_options: {
        color: '#0000ee',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.muenchenVenedig);


// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
bruneck.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "innsbruck-gerlos"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/bruneckCortina.gpx")
});

//Cortina-Farra
var gpx = './tracks/cortinaFarra.gpx';
let cortina = new L.GPX(gpx, {
    polyline_options: {
        color: '#ff7f24',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.muenchenVenedig);


// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
cortina.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "innsbruck-gerlos"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/cortinaFarra.gpx")
});

//Farra-Treviso
var gpx = './tracks/farraTreviso.gpx';
let farra = new L.GPX(gpx, {
    polyline_options: {
        color: '#0000ee',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.muenchenVenedig);


// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
farra.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "innsbruck-gerlos"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/farraTreviso.gpx")
});

//Treviso-Venedig
var gpx = './tracks/trevisoVenezia.gpx';
let treviso = new L.GPX(gpx, {
    polyline_options: {
        color: '#ff7f24',
        opacity: 0.75,
        weight: 6
    },
    marker_options: {
        startIconUrl: false,
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.muenchenVenedig);


// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
treviso.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "innsbruck-gerlos"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./tracks/trevisoVenezia.gpx")
});



// Marker
const MARKER = [
    {
        title: "Bamberg",
        lat:49.891653663412995, 
        lng: 10.886823712904773,
    },
    {
        title: "Innsbruck",
        lat: 47.264046153921015, 
        lng: 11.383767501251285,
    }
]

for (let marker of MARKER) {
    L.marker([marker.lat, marker.lng])
        .addTo(map)
        .bindPopup(`<b>${marker.title}</b> <br>
    `)
};

// const STAEDTE = [
//     {
//         title: "St. Pölten, Niederösterreich",
//         lat: 48.18735,
//         lng: 15.64139,
//         wikipedia: "https://de.wikipedia.org/wiki/St._P%C3%B6lten"
//     },
//     {
//         title: "Tulln",
//         lat: 48.33001133291213,
//         lng: 16.060959034595086,
//         wikipedia: "https://de.wikipedia.org/wiki/Tulln_an_der_Donau"
//     },
//     {
//         title: "Krems a.d. Donau",
//         lat: 48.41022698533108,
//         lng: 15.60382006192799,
//         wikipedia: "https://de.wikipedia.org/wiki/Krems_an_der_Donau"
//     },
//     {
//         title: "Baden bei Wien",
//         lat: 48.0024595018188,
//         lng: 16.230795040395048,
//         wikipedia: "https://de.wikipedia.org/wiki/Baden_(Nieder%C3%B6sterreich)"
//     },
// ]

// for (let stadt of STAEDTE) {
//     L.marker([stadt.lat, stadt.lng])
//         .addTo(map)
//         .bindPopup(`<b>${stadt.title}</b> <br>
//         <a href="${stadt.wikipedia}">Wikipedia</a>
//     `)
// };

// //Badeseen
// const BADESEEN = [
//     {
//         title: "Ottensteiner Stausee",
//         lat: 48.61799121352252,
//         lng: 15.267483226467856,
//     },
//     {
//         title: "Bernhardsthaler Teich",
//         lat: 48.692857068868165,
//         lng: 16.88281412284728
//     },
//     {
//         title: "Naturbadeseen Traismauer",
//         lat: 48.3654889628816,
//         lng: 15.753145918954235
//     },
//     {
//         title: "Badeteich Kalte Kuchl",
//         lat: 47.888507360144025,
//         lng: 15.68338462871469
//     },
//     {
//         title: "Badeteich Persenbeug-Gottsdorf",
//         lat: 48.18540724140658,
//         lng: 15.103914278527622
//     }
// ];

// for (let badeseen of BADESEEN) {
//     L.marker([badeseen.lat, badeseen.lng], {
//         icon: L.icon({
//             iconUrl: `icons/swimming.png`,
//             popupAnchor: [0, -37],
//             iconAnchor: [16, 37],
//         })
//     })
//         .addTo(themaLayer.badeseen)
//         .bindPopup(`<b>${badeseen.title}</b> <br>
//     `)
// };

// //Eisdielen
// const EISDIELEN = [
//     {
//         title: "Muratti Gelateria",
//         lat: 47.92887177060042,
//         lng: 16.216587179951677,
//     },
//     {
//         title: "Eisdiele Papa Luigi",
//         lat: 48.05055989884008,
//         lng: 15.612404277191253,
//     },
//     {
//         title: "Eiscafé Venezia",
//         lat: 48.12287154575264,
//         lng: 14.872194820122328,
//     },
//     {
//         title: "Eissalon Daniel",
//         lat: 48.147208935083064,
//         lng: 16.940528019026875,
//     },
//     {
//         title: "Eissalon Mazzer Renzo",
//         lat: 48.41104791919906,
//         lng: 15.602391376465306,
//     }
// ];

// for (let eisdielen of EISDIELEN) {
//     L.marker([eisdielen.lat, eisdielen.lng], {
//         icon: L.icon({
//             iconUrl: `icons/icecream.png`,
//             popupAnchor: [0, -37],
//             iconAnchor: [16, 37],
//         })
//     })
//         .addTo(themaLayer.eisdielen)
//         .bindPopup(`<b>${eisdielen.title}</b> <br>
//     `)
// };


// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);