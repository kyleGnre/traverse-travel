// main.js
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMjRkNjFiNC1jZmUyLTQ3YTktOGZhOC05YmE1M2U4MWFmZGUiLCJpZCI6Mjk5MDYzLCJpYXQiOjE3NDYyMDczMjF9.EuXeBmVDDme_uVh2Kp-1QcZdOz_SvZi9qMicU1Akfhc';
const openTripMapKey = '5ae2e3f221c38a28845f05b642abbda4c7239d08269646692cabad49';

let viewer;
let poiEntities = [];
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.background = 'rgba(0, 0, 0, 0.75)';
tooltip.style.color = 'white';
tooltip.style.padding = '4px 8px';
tooltip.style.borderRadius = '4px';
tooltip.style.pointerEvents = 'none';
tooltip.style.display = 'none';
tooltip.style.fontSize = '13px';
document.body.appendChild(tooltip);

initCesium();
setupTripEvents();

async function initCesium() {
  viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: await Cesium.createWorldTerrainAsync(),
    baseLayerPicker: false,
    shouldAnimate: true,
  });

  const bingProvider = await Cesium.IonImageryProvider.fromAssetId(3);
  const imageryLayer = await Cesium.ImageryLayer.fromProviderAsync(bingProvider);
  viewer.imageryLayers.add(imageryLayer);

  // Hover tooltip
  viewer.screenSpaceEventHandler.setInputAction((movement) => {
  const pickedObject = viewer.scene.pick(movement.endPosition);
  if (pickedObject?.id?.properties?.name) {
    tooltip.innerText = pickedObject.id.properties.name;
    tooltip.style.display = 'block';
    tooltip.style.left = `${movement.endPosition.x + 10}px`;
    tooltip.style.top = `${movement.endPosition.y + 10}px`;
  } else {
    tooltip.style.display = 'none';
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


  // Handle city click
  viewer.screenSpaceEventHandler.setInputAction(async (click) => {
    const ray = viewer.camera.getPickRay(click.position);
    const intersection = viewer.scene.globe.pick(ray, viewer.scene);

    const picked = viewer.scene.pick(click.position);
    if (picked?.id?.properties?.name) return; // Don't trigger city search if a POI is clicked

    const city = prompt("Enter city name:");
    if (!city) return;

    const cityRes = await fetch(`https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(city)}&apikey=${openTripMapKey}`);
    const cityData = await cityRes.json();
    if (!cityData.lat || !cityData.lon) return alert('City not found');

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(cityData.lon, cityData.lat, 15000),
    });

    const category = prompt("Enter POI category (e.g. interesting_places, restaurants):");
    if (!category) return;

    const poiRes = await fetch(`https://api.opentripmap.com/0.1/en/places/radius?lat=${cityData.lat}&lon=${cityData.lon}&radius=5000&kinds=${encodeURIComponent(category)}&format=geojson&apikey=${openTripMapKey}`);
    const poiData = await poiRes.json();

    clearPOIs();
    addPOIs(poiData.features);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function clearPOIs() {
  poiEntities.forEach(entity => viewer.entities.remove(entity));
  poiEntities = [];
}

function addPOIs(pois) {
  pois.forEach(poi => {
    if (poi.geometry?.coordinates?.length === 2) {
      const [lon, lat] = poi.geometry.coordinates;
      const name = poi.properties.name || 'Unknown';
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        billboard: {
          image: 'https://static.vecteezy.com/system/resources/thumbnails/044/280/373/small/graphics-large-blue-pin-png.png',
          width: 24,
          height: 24,
        },
        properties: {
          name,
          lat,
          lon
        }
      });

      poiEntities.push(entity);
    }
  });

  viewer.screenSpaceEventHandler.setInputAction(async (click) => {
  const picked = viewer.scene.pick(click.position);
  if (picked?.id?.properties?.name) {
    const name = picked.id.properties.name;
    const lat = picked.id.properties.lat;
    const lon = picked.id.properties.lon;

    const confirmAdd = confirm(`Add "${name}" to trip notes?`);
    if (confirmAdd) {
      const noteDiv = document.getElementById('note');

      const link = document.createElement('a');
      link.href = `https://www.google.com/search?q=${encodeURIComponent(name)}`;
      link.target = "_blank";
      link.innerText = name;

      noteDiv.appendChild(link);
      noteDiv.appendChild(document.createTextNode(' ')); // space after link
    }
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

// Trip logic
function setupTripEvents() {
  document.getElementById('saveTrip').addEventListener('click', () => {
    const name = document.getElementById('tripName').value;
    const city = document.getElementById('cityName').value;
    const notes = document.getElementById('note').innerHTML;

    if (!name || !city) {
      alert('Please fill in both trip name and city.');
      return;
    }

    const trip = { name, city, notes };
    saveTripToStorage(trip);

    document.getElementById('tripName').value = '';
    document.getElementById('cityName').value = '';
    document.getElementById('note').innerHTML = '';
  });

  renderTrips();
}

function saveTripToStorage(trip) {
  let trips = JSON.parse(localStorage.getItem('trips')) || [];
  trips.push(trip);
  localStorage.setItem('trips', JSON.stringify(trips));
  renderTrips();
}

function deleteTrip(index) {
  let trips = JSON.parse(localStorage.getItem('trips')) || [];
  trips.splice(index, 1);
  localStorage.setItem('trips', JSON.stringify(trips));
  renderTrips();
}

function renderTrips() {
  const tripList = document.getElementById('tripList');
  tripList.innerHTML = '';

  const trips = JSON.parse(localStorage.getItem('trips')) || [];
  trips.forEach((trip, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${trip.name}</strong><br>
      ${trip.city}<br>
      <div>${trip.notes}</div>
      <button data-index="${index}" class="deleteTripBtn" style="background:red;color:white;margin-top:5px;">Delete</button>
    `;
    tripList.appendChild(li);
  });

  document.querySelectorAll('.deleteTripBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.getAttribute('data-index');
      deleteTrip(parseInt(idx));
    });
  });
}



















