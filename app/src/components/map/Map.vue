<template>
  <div class="building-map">
    <!-- Контейнер для карты -->
    <div
      id="map"
      ref="mapContainer"
      class="map-container"
    />
    <!-- Кастомный маркер поверх карты -->
    <div
      ref="customMarker"
      class="custom-marker"
      :style="markerPosition"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'

// Refs
const mapContainer = ref(null)
const customMarker = ref(null)

// Map variables
let map = null
let origin = [37.427354, 55.812668]
const markerPosition = ref({
  left: '0px',
  top: '0px',
  transform: 'translate(-50%, -50%)',
  opacity: 0
})

// Функция для обновления позиции маркера
const updateMarkerPosition = () => {
  if (!map || !customMarker.value) return

  // Преобразуем географические координаты в пиксельные координаты экрана
  const point = map.project(origin)
  
  // Получаем размеры контейнера карты
  const container = mapContainer.value
  const rect = container.getBoundingClientRect()
  
  // Вычисляем позицию относительно контейнера
  markerPosition.value = {
    left: `${point.x}px`,
    top: `${point.y}px`,
    transform: 'translate(-50%, -50%)',
    opacity: 1
  }
}

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
    antialias: true,
    scrollZoom: false
  })

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

    // Обновляем позицию маркера после загрузки стиля
    setTimeout(() => {
      updateMarkerPosition()
    }, 100)
  })

  // Обновляем позицию маркера при движении карты
  map.on('move', updateMarkerPosition)
  map.on('zoom', updateMarkerPosition)
  map.on('rotate', updateMarkerPosition)
  map.on('pitch', updateMarkerPosition)
  map.on('resize', updateMarkerPosition)
  
  // Также обновляем при загрузке карты
  map.on('load', () => {
    setTimeout(() => {
      updateMarkerPosition()
    }, 100)
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
  @apply w-full h-full relative;
}

.map-container {
  @apply w-full h-full relative;
}

/* Кастомный маркер поверх карты */
.custom-marker {
  position: absolute;
  width: 40px;
  height: 40px;
  background-color: #FF6B35;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  pointer-events: none;
  /* Центрируем маркер относительно точки */
  transform-origin: center center;
}

/* Альтернативный вариант маркера с иконкой */
.custom-marker::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
}

/* Убеждаемся, что canvas контейнер не перекрывает маркер */
.map-container :deep(.mapboxgl-canvas-container) {
  position: relative;
  z-index: 1;
}

.map-container :deep(.mapboxgl-canvas) {
  position: relative;
  z-index: 1;
}
</style>