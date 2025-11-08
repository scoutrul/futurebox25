<template>
  <button 
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span 
      v-if="loading" 
      class="loading-spinner"
      aria-hidden="true"
    />
    <slot v-if="!loading" />
    <span v-if="loading">{{ loadingText }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * Вариант кнопки
   * @values 'primary', 'secondary', 'ghost'
   */
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost'].includes(value)
  },
  /**
   * Тип кнопки
   * @values 'button', 'submit', 'reset'
   */
  type: {
    type: String,
    default: 'button'
  },
  /**
   * Размер кнопки
   * @values 'sm', 'md', 'lg'
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  /**
   * Состояние загрузки
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * Текст при загрузке
   */
  loadingText: {
    type: String,
    default: 'Загрузка...'
  },
  /**
   * Отключить кнопку
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * Растянуть на всю ширину
   */
  block: {
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

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  const classes = []
  
  // Вариант
  const variantMap = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost'
  }
  classes.push(variantMap[props.variant])
  
  // Размер (из макета Figma)
  const sizeMap = {
    sm: 'text-[16px] leading-[1.6] px-[20px] py-[12px]',
    md: 'text-[16px] leading-[1.6] px-[20px] py-[12px]',
    lg: 'text-[18px] leading-[1.6] px-6 py-4'
  }
  classes.push(sizeMap[props.size])
  
  // Block
  if (props.block) {
    classes.push('w-full')
  }
  
  // Disabled
  if (props.disabled) {
    classes.push('opacity-50 cursor-not-allowed')
  }
  
  // Loading
  if (props.loading) {
    classes.push('opacity-80 cursor-wait')
  }
  
  // Кастомные классы
  if (props.customClass) {
    classes.push(props.customClass)
  }
  
  return classes.join(' ')
})

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* Спиннер загрузки */
.loading-spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-rotate 0.6s linear infinite;
}

@keyframes spinner-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

