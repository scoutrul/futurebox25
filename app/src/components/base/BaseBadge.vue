<template>
  <div :class="badgeClasses">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * Вариант badge
   * @values 'default', 'primary', 'secondary', 'success', 'metro'
   */
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'secondary', 'success', 'metro'].includes(value)
  },
  /**
   * Размер badge
   * @values 'sm', 'md'
   */
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['sm', 'md'].includes(value)
  },
  /**
   * Дополнительные классы
   */
  customClass: {
    type: String,
    default: ''
  }
})

const badgeClasses = computed(() => {
  const classes = [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'rounded-full',
    'backdrop-blur-[30px]',
    'font-sans',
    'font-normal',
    'tracking-[-0.39px]',
    'whitespace-nowrap',
    'transition-all',
    'duration-200'
  ]
  
  // Вариант (цвет и стиль)
  const variantMap = {
    'default': 'bg-surface-glass-dark text-white',
    'primary': 'bg-surface-glass-green text-white',
    'secondary': 'bg-neutral-light text-neutral-dark-gray',
    'success': 'bg-accent-green-light text-neutral-black',
    'metro': 'bg-surface-glass-dark text-white'
  }
  classes.push(variantMap[props.variant])
  
  // Размер
  const sizeMap = {
    'sm': 'px-2 py-1 text-[13px] leading-[1.6]',
    'md': 'px-3 py-1.5 text-[15px] leading-[1.6]'
  }
  classes.push(sizeMap[props.size])
  
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

