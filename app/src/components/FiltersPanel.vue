<template>
  <div class="filters-panel">
    <!-- Комнаты -->
    <FilterSection title="Комнат">
      <ButtonGroup
        v-model="filters.rooms"
        :options="roomsOptions"
      />
    </FilterSection>
    
    <!-- Стоимость -->
    <FilterSection title="Стоимость, млн ₽">
      <RangeSlider
        v-model="filters.price"
        :min="priceRange.min"
        :max="priceRange.max"
        :step="100000"
        min-prefix="от "
        max-prefix="до "
        suffix=""
      />
    </FilterSection>
    
    <!-- Площадь -->
    <FilterSection title="Площадь, м²">
      <RangeSlider
        v-model="filters.area"
        :min="areaRange.min"
        :max="areaRange.max"
        :step="1"
        min-prefix="от "
        max-prefix="до "
        suffix=""
      />
    </FilterSection>
    
    <!-- Этаж -->
    <FilterSection title="Этаж">
      <RangeSlider
        v-model="filters.floor"
        :min="floorRange.min"
        :max="floorRange.max"
        :step="1"
        min-prefix="от "
        max-prefix="до "
        suffix=""
      />
    </FilterSection>
    
    <!-- Особенности -->
    <FilterSection title="Особенности">
      <div class="features-grid">
        <BaseBadge
          v-for="feature in featuresOptions"
          :key="feature.value"
          :variant="filters.features.includes(feature.value) ? 'primary' : 'secondary'"
          size="md"
          custom-class="cursor-pointer"
          @click="toggleFeature(feature.value)"
        >
          {{ feature.label }}
        </BaseBadge>
      </div>
    </FilterSection>
    
    <!-- Сброс фильтров -->
    <div class="filters-reset">
      <button 
        class="reset-button"
        @click="resetFilters"
      >
        <BaseText
          variant="body"
          color="primary"
          custom-class="font-medium tracking-[-0.45px]"
        >
          Сбросить фильтры
        </BaseText>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { FilterSection, ButtonGroup, RangeSlider, BaseBadge, BaseText } from './base'

const props = defineProps({
  /**
   * Диапазон цен
   */
  priceRange: {
    type: Object,
    default: () => ({ min: 10000000, max: 30000000 })
  },
  /**
   * Диапазон площади
   */
  areaRange: {
    type: Object,
    default: () => ({ min: 30, max: 200 })
  },
  /**
   * Диапазон этажей
   */
  floorRange: {
    type: Object,
    default: () => ({ min: 1, max: 25 })
  },
  /**
   * Опции комнат
   */
  roomsOptions: {
    type: Array,
    default: () => [
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 }
    ]
  },
  /**
   * Опции особенностей
   */
  featuresOptions: {
    type: Array,
    default: () => [
      { label: 'White-box', value: 'white-box' },
      { label: 'Готовая отделка', value: 'turnkey' },
      { label: 'Раздельный санузел', value: 'separate-bathroom' },
      { label: 'Терраса', value: 'terrace' },
      { label: 'Резиденция', value: 'residence' },
      { label: 'Гардеробная', value: 'wardrobe' }
    ]
  }
})

const emit = defineEmits(['filter-change', 'reset'])

// Фильтры
const filters = ref({
  rooms: 1,
  price: [props.priceRange.min, props.priceRange.max],
  area: [props.areaRange.min, props.areaRange.max],
  floor: [props.floorRange.min, props.floorRange.max],
  features: []
})

// Переключение особенности
const toggleFeature = (value) => {
  const index = filters.value.features.indexOf(value)
  if (index > -1) {
    filters.value.features.splice(index, 1)
  } else {
    filters.value.features.push(value)
  }
}

// Сброс фильтров
const resetFilters = () => {
  filters.value = {
    rooms: 1,
    price: [props.priceRange.min, props.priceRange.max],
    area: [props.areaRange.min, props.areaRange.max],
    floor: [props.floorRange.min, props.floorRange.max],
    features: []
  }
  emit('reset')
}

// Отслеживание изменений
watch(filters, (newFilters) => {
  emit('filter-change', { ...newFilters })
}, { deep: true })
</script>

<style scoped>
.filters-panel {
  @apply flex flex-col items-start overflow-hidden rounded-xl 
         backdrop-blur-[30px] bg-surface-glass-light w-full pointer-events-auto;
}

.features-grid {
  @apply flex flex-wrap gap-2 items-start w-full;
}

.filters-reset {
  @apply flex items-center px-10 py-4 w-full;
}

.reset-button {
  @apply flex flex-1 items-center gap-2 px-0 py-[5px] cursor-pointer
         bg-transparent border-none transition-opacity duration-200;
}

.reset-button:hover {
  @apply opacity-70;
}

/* Адаптивность - mobile-first */
@media (min-width: 768px) {
  .filters-panel {
    @apply max-w-[480px];
  }
}
</style>

