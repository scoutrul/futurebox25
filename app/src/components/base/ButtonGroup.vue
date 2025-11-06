<template>
  <div class="button-group">
    <button
      v-for="option in options"
      :key="option.value"
      :class="['button-group-item', { 'button-group-item-active': modelValue === option.value }]"
      @click="handleClick(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  /**
   * Выбранное значение (v-model)
   */
  modelValue: {
    type: [String, Number],
    default: null
  },
  /**
   * Опции для выбора
   * @example [{ label: '1', value: 1 }, { label: '2', value: 2 }]
   */
  options: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(item => Object.hasOwn(item, 'label') && Object.hasOwn(item, 'value'))
    }
  }
})

const emit = defineEmits(['update:modelValue'])

const handleClick = (value) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
/* Mobile-first: базовые стили */
.button-group {
  @apply flex items-start overflow-hidden rounded-lg w-full;
}

.button-group-item {
  @apply flex-1 flex items-center justify-center gap-2 p-4 
         bg-white border-r border-border-light
         font-sans font-medium text-[15px] leading-[1.6] tracking-[-0.45px]
         text-neutral-space whitespace-nowrap
         transition-all duration-200 cursor-pointer;
}

.button-group-item:last-child {
  @apply border-r-0;
}

.button-group-item:hover:not(.button-group-item-active) {
  @apply bg-neutral-light;
}

.button-group-item-active {
  @apply bg-primary text-white;
}
</style>

