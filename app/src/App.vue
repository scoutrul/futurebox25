<template>
    <!-- Контент поверх карты -->
    <div class="content-overlay">
      <AppTopBar @action="handleRequestAction" />
      
      <!-- Панель здания (показывается при клике на 3D модель) -->
      <BaseContainer custom-class="demo-section" v-if="isPanelVisible">
        <!-- Панель здания -->
        <BuildingPanel 
          :building="buildingData" 
          :apartments="apartmentsData" 
          @call-request="handleCallRequest"
          @view-all="handleViewAll" 
          @close="handleClose" 
        />
      </BaseContainer>
      <!-- Карта как фон на весь экран -->
    </div>
    <BuildingMap class="map-background" :building="buildingData" />

    <!-- Глобальная модалка для 3D планов -->
    <Modal3DViewer 
      :is-visible="isModalVisible"
      :url="modal3DUrl"
      @close="closeModal"
    />
</template>

<script setup>
import AppTopBar from './components/layout/AppTopBar.vue'
import BuildingPanel from './components/building/BuildingPanel.vue'
import BuildingMap from './components/map/Map.vue'
import { BaseContainer, Modal3DViewer } from './components/base'
import { buildingMockData, apartmentsMockData } from './mocks/buildingData'
import { useBuildingPanel } from './composables/useBuildingPanel'
import { useModal3D } from './composables/useModal3D'

// Используем композицию для управления панелью
const { isPanelVisible, hidePanel } = useBuildingPanel()

// Используем композицию для управления модалкой 3D планов
const { isModalVisible, modal3DUrl, closeModal } = useModal3D()

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

const handleClose = () => {
  console.log('App: handleClose вызван, закрываем панель')
  hidePanel()
}

const handleRequestAction = () => {
  console.log('Запрос отправлен')
  alert('Ваш запрос отправлен!')
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
  @apply flex flex-col md:flex-row gap-8;
  justify-content: flex-end;
  pointer-events: auto !important;
}
</style>
