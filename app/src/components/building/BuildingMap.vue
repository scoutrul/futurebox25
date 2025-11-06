<template>
  <div class="building-map">
    <!-- Контейнер для карты -->
    <div
      id="map"
      ref="mapContainer"
      class="map-container"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'

// Refs
const mapContainer = ref(null)

// Map variables
let map = null
let origin = [76.9153, 43.206573]

const initializeMap = () => {
  // Mapbox access token
  mapboxgl.accessToken = 'pk.eyJ1IjoidmlydXNyZWxvYWRlZCIsImEiOiJjaXJldTR1cWYwMDEwaWJtMzIwbTdoOHZ5In0.hzXJEVACTihdI_E84Td81w'

  // Initialize map
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/standard',
    center: origin,
    zoom: 16,
    pitch: 45,
    bearing: 0,
    antialias: true
  })

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl())

  // Configure map when style loads
  map.on('style.load', () => {
    console.log("Map style loaded")

    // Set map environment
    map.setConfigProperty('basemap', 'lightPreset', 'day')

    // Add fog effect for depth
    map.setFog({
      'color': 'rgb(186, 210, 235)',
      'high-color': 'rgb(36, 92, 223)',
      'horizon-blend': 0.02,
      'space-color': 'rgb(11, 11, 25)',
      'star-intensity': 0.6
    })

    // Add a marker at the building location
    new mapboxgl.Marker({
      color: "#FF6B35"
    })
    .setLngLat(origin)
    .addTo(map)
  })
}

// Lifecycle
onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped>
.building-map {
  @apply w-full h-full;
}

.map-container {
  @apply w-full h-full;
}
</style>