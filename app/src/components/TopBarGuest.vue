<template>
  <BaseContainer>
    <BaseCard 
      :padding="cardPadding"
      custom-class="top-bar"
    >
      <div class="logo-section">
        <img 
          :src="logoSrc" 
          alt="Futurebox" 
          class="logo"
        >
        <BaseText 
          variant="tagline"
          :nowrap="isTablet || isDesktop"
        >
          Технологии будущего дома
        </BaseText>
      </div>
      
      <div class="actions">
        <BaseButton 
          variant="primary"
          :block="!isTablet && !isDesktop"
          @click="handleRequestClick"
        >
          Отправить запрос
        </BaseButton>
      </div>
    </BaseCard>
  </BaseContainer>
</template>

<script setup>
import { computed } from 'vue'
import { BaseCard, BaseText, BaseButton, BaseContainer } from './base'
import { useBreakpoints } from '@/composables/useBreakpoints'
import logoSrc from '../assets/logo.svg'

// Определение размера экрана через composable (mobile-first)
const { isTablet, isDesktop } = useBreakpoints()

// Адаптивный padding для карточки (mobile-first)
const cardPadding = computed(() => {
  if (isDesktop.value) return 'lg'
  if (isTablet.value) return 'md'
  return 'sm' // по умолчанию для мобильных
})

const handleRequestClick = () => {
  // Логика отправки запроса
  console.log('Запрос отправлен')
}
</script>

<style scoped>
/* Mobile-first: базовые стили для мобильных устройств */
.top-bar {
  @apply flex flex-col items-center justify-between gap-5 pointer-events-auto;
}

.logo-section {
  @apply flex flex-col items-center gap-3 w-full text-center;
}

.logo {
  @apply w-[120px] h-5;
}

.actions {
  @apply w-full;
}

/* Планшеты и выше (md: 768px+) */
@media (min-width: 768px) {
  .top-bar {
    @apply flex-row gap-8;
  }
  
  .logo-section {
    @apply flex-row text-left gap-8 flex-1;
  }
  
  .logo {
    @apply w-[140px] h-[22px] shrink-0;
  }
  
  .actions {
    @apply w-auto;
  }
}

/* Десктоп (xl: 1200px+) */
@media (min-width: 1200px) {
  .top-bar {
    @apply gap-16;
  }
  
  .logo-section {
    @apply gap-16;
  }
  
  .logo {
    @apply w-[158px] h-6;
  }
  
  .actions {
    @apply gap-10;
  }
}
</style>

