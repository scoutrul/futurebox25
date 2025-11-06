<template>
  <div class="filter-section">
    <BaseText
      variant="body"
      color="dark-gray"
      custom-class="font-medium tracking-[-0.45px]"
    >
      {{ title }}
    </BaseText>
    <slot />
  </div>
</template>

<script setup>
import BaseText from './BaseText.vue'

defineProps({
  /**
   * Заголовок секции
   */
  title: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.filter-section {
  @apply flex flex-col gap-2 items-start justify-center px-10 py-4 w-full;
}

/* Адаптивность - mobile-first */
@media (min-width: 768px) {
  .filter-section {
    @apply px-10;
  }
}
</style>

