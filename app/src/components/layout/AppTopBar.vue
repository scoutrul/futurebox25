<template>
  <BaseTopBar>
    <!-- Left: Логотип + заголовок -->
    <template #left>
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
    </template>

    <!-- Right: Action кнопка -->
    <template #right>
      <BaseButton 
        variant="primary"
        :block="!isTablet && !isDesktop"
        @click="handleAction"
      >
        Отправить запрос
      </BaseButton>
    </template>
  </BaseTopBar>
</template>

<script setup>
import BaseTopBar from './BaseTopBar.vue'
import { BaseText, BaseButton } from '../base'
import { useBreakpoints } from '@/composables/useBreakpoints'
import logoSrc from '../../assets/logo.svg'

const emit = defineEmits(['action'])

const { isTablet, isDesktop } = useBreakpoints()

const handleAction = () => {
  emit('action')
}
</script>

<style scoped>
/* Адаптивные размеры логотипа */
.logo {
  @apply w-[120px] h-5;
}

@media (min-width: 768px) {
  .logo {
    @apply w-[140px] h-[22px] shrink-0;
  }
}

@media (min-width: 1200px) {
  .logo {
    @apply w-[158px] h-6;
  }
}
</style>

