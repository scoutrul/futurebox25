<template>
  <component 
    :is="tag"
    :class="textClasses"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * HTML тег элемента
   * @values 'p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
   */
  tag: {
    type: String,
    default: 'p'
  },
  /**
   * Вариант текста
   * @values 'body', 'body-sm', 'body-lg', 'tagline', 'heading-1', 'heading-2', 'heading-3', 'heading-4'
   */
  variant: {
    type: String,
    default: 'body',
    validator: (value) => [
      'body', 'body-sm', 'body-lg', 
      'tagline', 
      'heading-1', 'heading-2', 'heading-3', 'heading-4'
    ].includes(value)
  },
  /**
   * Цвет текста
   * @values 'default', 'primary', 'space', 'black', 'dark', 'dark-gray', 'gray', 'medium', 'light', 'white'
   */
  color: {
    type: String,
    default: 'default'
  },
  /**
   * Выравнивание текста
   * @values 'left', 'center', 'right', 'justify'
   */
  align: {
    type: String,
    default: 'left'
  },
  /**
   * Запретить перенос строк
   */
  nowrap: {
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

const textClasses = computed(() => {
  const classes = []
  
  // Вариант (размер и стиль)
  const variantMap = {
    'body': 'text-[16px] leading-[1.6] font-normal',
    'body-sm': 'text-[14px] leading-[1.5] font-normal',
    'body-lg': 'text-[18px] leading-[1.6] font-normal',
    'tagline': 'text-[16px] leading-[1.6] font-normal',
    'heading-1': 'text-[48px] leading-[1.2] font-bold',
    'heading-2': 'text-[36px] leading-[1.3] font-semibold',
    'heading-3': 'text-[24px] leading-[1.4] font-semibold',
    'heading-4': 'text-[20px] leading-[1.5] font-semibold',
  }
  classes.push(variantMap[props.variant])
  
  // Цвет
  const colorMap = {
    'default': 'text-neutral-dark',
    'primary': 'text-primary',
    'space': 'text-neutral-space',
    'black': 'text-neutral-black',
    'dark': 'text-neutral-dark',
    'dark-gray': 'text-neutral-dark-gray',
    'gray': 'text-neutral-gray',
    'medium': 'text-neutral-medium',
    'light': 'text-neutral-light',
    'white': 'text-white',
  }
  classes.push(colorMap[props.color])
  
  // Выравнивание
  const alignMap = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
    'justify': 'text-justify'
  }
  classes.push(alignMap[props.align])
  
  // No wrap
  if (props.nowrap) {
    classes.push('whitespace-nowrap')
  }
  
  // Кастомные классы
  if (props.customClass) {
    classes.push(props.customClass)
  }
  
  return classes.join(' ')
})
</script>

<style scoped>
/* Убираем дефолтный margin */
p, h1, h2, h3, h4, h5, h6 {
  margin: 0;
}
</style>

