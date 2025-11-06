<template>
  <BaseBadge
    variant="metro"
    :size="size"
    custom-class="gap-2"
  >
    <div 
      class="w-2 h-2 rounded-full shrink-0"
      :style="{ backgroundColor: metroLineColor }"
    />
    <span>{{ stationName }}</span>
    <span 
      v-if="walkTime"
      class="opacity-70"
    >
      {{ walkTime }} мин
    </span>
  </BaseBadge>
</template>

<script setup>
import BaseBadge from './BaseBadge.vue'

defineProps({
  /**
   * Название станции метро
   */
  stationName: {
    type: String,
    required: true
  },
  /**
   * Цвет линии метро (hex)
   */
  metroLineColor: {
    type: String,
    required: true
  },
  /**
   * Время пешком до метро (минуты)
   */
  walkTime: {
    type: [Number, String],
    default: null
  },
  /**
   * Размер badge
   * @values 'sm', 'md'
   */
  size: {
    type: String,
    default: 'sm'
  }
})
</script>

