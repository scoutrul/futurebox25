<template>
  <div class="app-container">
    <TopBarGuest />
    
    <!-- Демонстрация BuildingPanel -->
    <BaseContainer custom-class="demo-section">
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
import { BaseContainer } from './components/base'
import { buildingMockData, apartmentsMockData } from './mocks/buildingData'

// Mock данные
const buildingData = buildingMockData
const apartmentsData = apartmentsMockData

// Обработчики событий
const handleCallRequest = (building) => {
  console.log('Заказать звонок для:', building.title)
  alert(`Заказ звонка для ${building.title}\nТелефон: ${building.phone}`)
}

const handleViewAll = (building) => {
  console.log('Смотреть все квартиры:', building.title)
  alert(`Показать все квартиры в ${building.title}`)
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
  @apply flex justify-center;
}
</style>
