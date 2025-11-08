<template>
  <BaseTopBar :container-class="containerClass">
    <!-- Left: Кнопка назад + заголовок -->
    <template #left>
      <BaseButton 
        variant="secondary"
        :size="buttonSize"
        @click="handleBack"
      >
        Назад
      </BaseButton>
      <BaseText 
        variant="tagline"
        :nowrap="isTablet || isDesktop"
      >
        {{ title }}
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
import { computed } from 'vue'
import BaseTopBar from './BaseTopBar.vue'
import { BaseText, BaseButton } from '../base'
import { useBreakpoints } from '@/composables/useBreakpoints'

defineProps({
  /**
   * Заголовок
   */
  title: {
    type: String,
    default: '3D План квартиры'
  },
  /**
   * Дополнительный класс для контейнера
   */
  containerClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['back'])

const { isTablet, isDesktop } = useBreakpoints()

// Адаптивный размер кнопки
const buttonSize = computed(() => {
  if (isDesktop.value) return 'md'
  return 'sm'
})

const handleBack = () => {
  emit('back')
}

const handleAction = () => {
  emit('action')
}
</script>

