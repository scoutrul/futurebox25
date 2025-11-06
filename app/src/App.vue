<template>
  <div class="app-container">
    <!-- Карта как фон на весь экран -->
    <BuildingMap class="map-background" :building="buildingData" />
    
    <!-- Контент поверх карты -->
    <div class="content-overlay">
      <TopBarGuest />
      
      <!-- Демонстрация компонентов -->
      <BaseContainer custom-class="demo-section">
        <!-- Панель фильтров -->
        <FiltersPanel :price-range="filterRanges.price" :area-range="filterRanges.area"
        :floor-range="filterRanges.floor" :rooms-options="roomsOptions" :features-options="featuresOptions"
        @filter-change="handleFilterChange" @reset="handleFilterReset" />

        <!-- Панель здания -->
        <BuildingPanel :building="buildingData" :apartments="apartmentsData" @call-request="handleCallRequest"
        @view-all="handleViewAll" />
      </BaseContainer>
    </div>
  </div>
</template>

<script setup>
import TopBarGuest from './components/layout/TopBarGuest.vue'
import BuildingPanel from './components/building/BuildingPanel.vue'
import BuildingMap from './components/building/BuildingMap.vue'
import FiltersPanel from './components/filters/FiltersPanel.vue'
import { BaseContainer } from './components/base'
import { buildingMockData, apartmentsMockData } from './mocks/buildingData'
import { filterRanges, roomsOptions, featuresOptions } from './mocks/filtersData'

// Mock данные здания
const buildingData = buildingMockData
const apartmentsData = apartmentsMockData

// Обработчики событий здания
const handleCallRequest = (building) => {
  console.log('Заказать звонок для:', building.title)
  alert(`Заказ звонка для ${building.title}\nТелефон: ${building.phone}`)
}

const handleViewAll = (building) => {
  console.log('Смотреть все квартиры:', building.title)
  alert(`Показать все квартиры в ${building.title}`)
}

// Обработчики фильтров
const handleFilterChange = (filters) => {
  console.log('Фильтры изменены:', filters)
}

const handleFilterReset = () => {
  console.log('Фильтры сброшены')
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
}

.app-container {
  @apply relative w-full h-full;
}

/* Карта как фон на весь экран */
.map-background {
  @apply fixed inset-0;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 0;
}

/* Контент поверх карты */
.content-overlay {
  @apply relative flex flex-col gap-8 pb-8 overflow-y-auto;
  min-height: 100vh;
  z-index: 1;
  pointer-events: none;
}

.demo-section {
  @apply flex flex-col md:flex-row justify-center gap-8;
}
</style>
