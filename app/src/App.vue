<template>
  <div class="app-container">
    <TopBarGuest />
    
    <!-- Демонстрация компонентов -->
    <BaseContainer custom-class="demo-section">
      <!-- Панель фильтров -->
      <FiltersPanel
        :price-range="filterRanges.price"
        :area-range="filterRanges.area"
        :floor-range="filterRanges.floor"
        :rooms-options="roomsOptions"
        :features-options="featuresOptions"
        @filter-change="handleFilterChange"
        @reset="handleFilterReset"
      />
      
      <!-- Панель здания -->
      <BuildingPanel
        :building="buildingData"
        :apartments="apartmentsData"
        @call-request="handleCallRequest"
        @view-all="handleViewAll"
      />
    </BaseContainer>
  </div>
</template>

<script setup>
import TopBarGuest from './components/TopBarGuest.vue'
import BuildingPanel from './components/BuildingPanel.vue'
import FiltersPanel from './components/FiltersPanel.vue'
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

#app {
  width: 100%;
}

.app-container {
  @apply flex flex-col gap-8 pb-8;
}

.demo-section {
  @apply flex flex-col md:flex-row justify-center gap-8;
}
</style>
