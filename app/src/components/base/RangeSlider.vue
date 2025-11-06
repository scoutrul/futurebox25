<template>
  <div class="range-slider-container">
    <!-- Значения -->
    <div class="range-values">
      <BaseText
        tag="p"
        color="space"
        custom-class="text-[20px] leading-[1.4] font-medium tracking-[-0.6px]"
      >
        {{ minPrefix }}{{ formatNumber(modelValue[0]) }}{{ suffix }}
      </BaseText>
      <BaseText
        tag="p"
        color="space"
        custom-class="text-[20px] leading-[1.4] font-medium tracking-[-0.6px] text-right"
      >
        {{ maxPrefix }}{{ formatNumber(modelValue[1]) }}{{ suffix }}
      </BaseText>
    </div>
    
    <!-- Слайдер -->
    <div 
      ref="sliderRef"
      class="range-slider"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
    >
      <!-- Трек -->
      <div class="range-track" />
      
      <!-- Активная область -->
      <div 
        class="range-track-active"
        :style="activeTrackStyle"
      />
      
      <!-- Handle минимум -->
      <div
        ref="minHandleRef"
        class="range-handle"
        :style="{ left: `calc(${minPosition}% + 10.5px)` }"
        @mousedown.stop="startDrag('min', $event)"
        @touchstart.stop="startDrag('min', $event)"
      />
      
      <!-- Handle максимум -->
      <div
        ref="maxHandleRef"
        class="range-handle"
        :style="{ left: `calc(${maxPosition}% - 10.5px)` }"
        @mousedown.stop="startDrag('max', $event)"
        @touchstart.stop="startDrag('max', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseText from './BaseText.vue'

const props = defineProps({
  /**
   * Значение [min, max] (v-model)
   */
  modelValue: {
    type: Array,
    required: true,
    validator: (value) => value.length === 2 && value[0] <= value[1]
  },
  /**
   * Минимальное значение
   */
  min: {
    type: Number,
    required: true
  },
  /**
   * Максимальное значение
   */
  max: {
    type: Number,
    required: true
  },
  /**
   * Шаг
   */
  step: {
    type: Number,
    default: 1
  },
  /**
   * Префикс для минимального значения (например, "от ")
   */
  minPrefix: {
    type: String,
    default: ''
  },
  /**
   * Префикс для максимального значения (например, "до ")
   */
  maxPrefix: {
    type: String,
    default: ''
  },
  /**
   * Суффикс значения (например, " млн")
   */
  suffix: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const sliderRef = ref(null)
const minHandleRef = ref(null)
const maxHandleRef = ref(null)
const dragging = ref(null)

// Форматирование числа с пробелами между тысячами
const formatNumber = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Позиции handles в процентах
const minPosition = computed(() => {
  return ((props.modelValue[0] - props.min) / (props.max - props.min)) * 100
})

const maxPosition = computed(() => {
  return ((props.modelValue[1] - props.min) / (props.max - props.min)) * 100
})

// Стиль активного трека
const activeTrackStyle = computed(() => {
  return {
    left: minPosition.value + '%',
    width: (maxPosition.value - minPosition.value) + '%'
  }
})

const startDrag = (handle, event) => {
  event.preventDefault()
  dragging.value = handle
  
  const moveHandler = (e) => {
    if (!dragging.value) return
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
    updateValue(clientX)
  }
  
  const endHandler = () => {
    dragging.value = null
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', endHandler)
    document.removeEventListener('touchmove', moveHandler)
    document.removeEventListener('touchend', endHandler)
  }
  
  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('mouseup', endHandler)
  document.addEventListener('touchmove', moveHandler)
  document.addEventListener('touchend', endHandler)
}

const updateValue = (clientX) => {
  if (!sliderRef.value) return
  
  const rect = sliderRef.value.getBoundingClientRect()
  const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
  const value = Math.round((percent / 100) * (props.max - props.min) / props.step) * props.step + props.min
  
  const newValue = [...props.modelValue]
  
  if (dragging.value === 'min') {
    newValue[0] = Math.min(value, newValue[1])
  } else {
    newValue[1] = Math.max(value, newValue[0])
  }
  
  emit('update:modelValue', newValue)
}

const handleMouseDown = (event) => {
  // Клик по треку - перемещаем ближайший handle
  if (event.target === sliderRef.value || event.target.classList.contains('range-track')) {
    const rect = sliderRef.value.getBoundingClientRect()
    const percent = ((event.clientX - rect.left) / rect.width) * 100
    
    const distToMin = Math.abs(percent - minPosition.value)
    const distToMax = Math.abs(percent - maxPosition.value)
    
    dragging.value = distToMin < distToMax ? 'min' : 'max'
    updateValue(event.clientX)
  }
}

const handleTouchStart = (event) => {
  if (event.target === sliderRef.value || event.target.classList.contains('range-track')) {
    const rect = sliderRef.value.getBoundingClientRect()
    const percent = ((event.touches[0].clientX - rect.left) / rect.width) * 100
    
    const distToMin = Math.abs(percent - minPosition.value)
    const distToMax = Math.abs(percent - maxPosition.value)
    
    dragging.value = distToMin < distToMax ? 'min' : 'max'
    updateValue(event.touches[0].clientX)
  }
}
</script>

<style scoped>
.range-slider-container {
  @apply flex flex-col gap-2 w-full;
}

.range-values {
  @apply flex items-start w-full;
}

.range-values > * {
  @apply flex-1 min-w-0;
}

.range-slider {
  @apply relative flex items-center justify-between w-full h-8 cursor-pointer;
}

.range-track {
  @apply absolute left-0 right-0 h-0.5 bg-neutral-light rounded;
  top: 50%;
  transform: translateY(-50%);
}

.range-track-active {
  @apply absolute h-0.5 bg-primary rounded z-10;
  top: 50%;
  transform: translateY(-50%);
}

.range-handle {
  @apply absolute w-[21px] h-[21px] bg-primary rounded-full cursor-grab z-20;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: transform 0.1s ease;
}

.range-handle:hover {
/* */
}

.range-handle:active {
  @apply cursor-grabbing;
}
</style>

