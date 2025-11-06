<template>
  <div 
    :class="cardClasses"
    class="card-glass"
  >
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * Включить hover эффект
   */
  hoverable: {
    type: Boolean,
    default: false
  },
  /**
   * Паддинг карточки
   * @values 'none', 'sm', 'md', 'lg', 'xl'
   */
  padding: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  /**
   * Дополнительные классы
   */
  customClass: {
    type: String,
    default: ''
  }
})

const cardClasses = computed(() => {
  const classes = []
  
  // Hover эффект
  if (props.hoverable) {
    classes.push('card-glass-hover')
  }
  
  // Паддинг
  const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'px-16 py-6',
    lg: 'px-20 py-8',
    xl: 'px-24 py-10'
  }
  classes.push(paddingMap[props.padding])
  
  // Кастомные классы
  if (props.customClass) {
    classes.push(props.customClass)
  }
  
  return classes.join(' ')
})
</script>

<style scoped>
/* Дополнительные стили если нужны */
</style>

