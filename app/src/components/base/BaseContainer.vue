<template>
  <div :class="containerClasses">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * Максимальная ширина контейнера
   * @values 'full', 'screen-2xl', 'screen-xl', 'screen-lg'
   */
  maxWidth: {
    type: String,
    default: 'full',
    validator: (value) => ['full', 'screen-2xl', 'screen-xl', 'screen-lg'].includes(value)
  },
  /**
   * Горизонтальные отступы
   * @values 'none', 'sm', 'md', 'lg', 'xl', 'responsive'
   */
  padding: {
    type: String,
    default: 'responsive',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl', 'responsive'].includes(value)
  },
  /**
   * Вертикальные отступы
   * @values 'none', 'sm', 'md', 'lg', 'xl', 'responsive'
   */
  paddingY: {
    type: String,
    default: 'responsive',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl', 'responsive'].includes(value)
  },
  /**
   * Центрировать контейнер
   */
  center: {
    type: Boolean,
    default: false
  },
  /**
   * Дополнительные классы
   */
  customClass: {
    type: String,
    default: ''
  }
})

const containerClasses = computed(() => {
  const classes = ['w-full']
  
  // Максимальная ширина
  const maxWidthMap = {
    'full': '',
    'screen-2xl': 'max-w-screen-2xl',
    'screen-xl': 'max-w-screen-xl',
    'screen-lg': 'max-w-screen-lg'
  }
  if (maxWidthMap[props.maxWidth]) {
    classes.push(maxWidthMap[props.maxWidth])
  }
  
  // Центрирование
  if (props.center) {
    classes.push('mx-auto')
  }
  
  // Горизонтальные отступы
  if (props.padding === 'responsive') {
    classes.push('px-5 md:px-8 lg:px-16')
  } else {
    const paddingMap = {
      none: '',
      sm: 'px-4',
      md: 'px-8',
      lg: 'px-16',
      xl: 'px-24'
    }
    if (paddingMap[props.padding]) {
      classes.push(paddingMap[props.padding])
    }
  }
  
  // Вертикальные отступы
  if (props.paddingY === 'responsive') {
    classes.push('py-4 md:py-6 lg:py-8')
  } else {
    const paddingYMap = {
      none: '',
      sm: 'py-4',
      md: 'py-6',
      lg: 'py-8',
      xl: 'py-12'
    }
    if (paddingYMap[props.paddingY]) {
      classes.push(paddingYMap[props.paddingY])
    }
  }
  
  // Кастомные классы
  if (props.customClass) {
    classes.push(props.customClass)
  }
  
  return classes.filter(Boolean).join(' ')
})
</script>

<style scoped>
/* Дополнительные стили если нужны */
</style>

