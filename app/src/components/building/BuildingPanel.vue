<template>
  <div class="building-panel">
    <!-- Головная часть с информацией о здании -->
    <BuildingHeader 
      :building="building"
      @call-request="handleCallRequest"
    />
    
    <!-- Табы фильтрации квартир -->
    <ApartmentTabs
      v-model="selectedRoomType"
      :room-types="availableRoomTypes"
      @view-all="handleViewAll"
    />
    
    <!-- Список квартир -->
    <div class="apartments-list">
      <ApartmentCard
        v-for="apartment in filteredApartments"
        :key="apartment.id"
        :apartment="apartment"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BuildingHeader from './BuildingHeader.vue'
import ApartmentTabs from '../apartments/ApartmentTabs.vue'
import ApartmentCard from '../apartments/ApartmentCard.vue'

const props = defineProps({
  /**
   * Данные здания
   */
  building: {
    type: Object,
    required: true
  },
  /**
   * Список квартир
   */
  apartments: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['call-request', 'view-all'])

// Выбранный тип комнат (по умолчанию 1-комнатные)
const selectedRoomType = ref(1)

// Доступные типы комнат на основе квартир
const availableRoomTypes = computed(() => {
  const types = [...new Set(props.apartments.map(apt => apt.rooms))]
  return types.sort((a, b) => a - b)
})

// Фильтрованные квартиры по типу
const filteredApartments = computed(() => {
  return props.apartments.filter(apt => apt.rooms === selectedRoomType.value)
})

const handleCallRequest = () => {
  emit('call-request', props.building)
}

const handleViewAll = () => {
  emit('view-all', props.building)
}
</script>

<style scoped>
.building-panel {
  @apply flex flex-col items-start overflow-hidden rounded-xl 
         shadow-[0px_12px_24px_0px_rgba(0,0,0,0.15)] bg-neutral-space w-full max-h-[fit-content] pointer-events-auto;
}

.apartments-list {
  @apply bg-white w-full divide-y divide-neutral-light;
}

/* Адаптивность - mobile-first */
@media (min-width: 768px) {
  .building-panel {
    @apply max-w-[480px];
  }
}
</style>

