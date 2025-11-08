<template>
  <BaseContainer :custom-class="containerClass">
    <BaseCard 
      :padding="cardPadding"
      custom-class="top-bar"
    >
      <!-- Left Section: слот для левого контента -->
      <div class="left-section">
        <slot name="left" />
      </div>
      
      <!-- Right Section: слот для правого контента -->
      <div v-if="$slots.right" class="right-section">
        <slot name="right" />
      </div>
    </BaseCard>
  </BaseContainer>
</template>

<script setup>
import { computed } from 'vue'
import { BaseCard, BaseContainer } from '../base'
import { useBreakpoints } from '@/composables/useBreakpoints'

defineProps({
  /**
   * Дополнительный класс для контейнера
   */
  containerClass: {
    type: String,
    default: ''
  }
})

// Определение размера экрана
const { isDesktop, isTablet } = useBreakpoints()

// Адаптивный padding для карточки
const cardPadding = computed(() => {
  if (isDesktop.value) return 'lg'
  if (isTablet.value) return 'md'
  return 'sm'
})
</script>

<style scoped>
/* Mobile-first: базовые стили для мобильных устройств */
.top-bar {
  @apply flex flex-col items-center justify-between gap-5 pointer-events-auto;
}

.left-section {
  @apply flex flex-col items-center gap-3 w-full text-center;
}

.right-section {
  @apply w-full;
}

/* Планшеты и выше (md: 768px+) */
@media (min-width: 768px) {
  .top-bar {
    @apply flex-row gap-8;
  }
  
  .left-section {
    @apply flex-row text-left gap-8 flex-1;
  }
  
  .right-section {
    @apply w-auto;
  }
}

/* Десктоп (xl: 1200px+) */
@media (min-width: 1200px) {
  .top-bar {
    @apply gap-16;
  }
  
  .left-section {
    @apply gap-16;
  }
}
</style>

