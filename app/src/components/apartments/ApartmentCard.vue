<template>
  <div class="apartment-card">
    <div class="apartment-image">
      <img 
        :src="apartment.imageSrc" 
        :alt="`План ${apartment.rooms}-комнатной квартиры`"
        class="w-full h-full object-contain"
      >
    </div>
    
    <div class="apartment-content">
      <!-- Заголовок -->
      <div class="apartment-header">
        <BaseText 
          tag="span"
          variant="body"
          color="black"
          custom-class="font-medium"
        >
          {{ apartment.rooms }}-комн
        </BaseText>
        <BaseText 
          tag="span"
          variant="body"
          color="gray"
          custom-class="font-medium"
        >
          {{ apartment.area }} м²
        </BaseText>
      </div>
      
      <!-- Описание -->
      <BaseText 
        variant="body-sm"
        color="dark-gray"
        custom-class="apartment-description"
      >
        {{ apartment.description }}
      </BaseText>
      
      <!-- Badges удобств -->
      <div class="apartment-features">
        <BaseBadge
          v-for="(feature, index) in apartment.features"
          :key="index"
          :variant="feature.highlighted ? 'success' : 'secondary'"
          size="sm"
        >
          {{ feature.label }}
        </BaseBadge>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BaseText, BaseBadge } from '../base'

defineProps({
  /**
   * Данные квартиры
   */
  apartment: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.rooms && value.area && value.description && Array.isArray(value.features)
    }
  }
})
</script>

<style scoped>
.apartment-card {
  @apply flex gap-5 items-start px-2.5 py-[5px];
}

.apartment-image {
  @apply w-20 h-20 bg-white overflow-hidden shrink-0;
}

.apartment-content {
  @apply flex flex-col gap-1 flex-1 justify-center min-w-0;
}

.apartment-header {
  @apply flex gap-2 items-start w-full whitespace-nowrap;
}

.apartment-description {
  @apply truncate w-full;
}

.apartment-features {
  @apply flex flex-wrap gap-2 items-start w-full;
}

/* Адаптивность - mobile-first */
@media (min-width: 768px) {
  .apartment-description {
    @apply whitespace-normal;
  }
}
</style>

