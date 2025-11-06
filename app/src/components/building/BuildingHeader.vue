<template>
  <div class="building-header">
    <!-- Фоновая картинка с градиентом -->
    <div class="header-background">
      <img 
        :src="building.imageSrc" 
        :alt="building.title"
        class="header-image"
      >
      <div class="header-gradient" />
    </div>
    
    <!-- Контент -->
    <div class="header-content">
      <!-- Заголовок -->
      <div class="header-title-block">
        <BaseText 
          tag="h2"
          variant="heading-3"
          color="white"
          custom-class="font-medium tracking-[-0.72px]"
        >
          {{ building.title }}
        </BaseText>
        <BaseText 
          variant="body"
          color="white"
          custom-class="opacity-70 tracking-[-0.45px]"
        >
          {{ building.developer }}
        </BaseText>
      </div>
      
      <!-- Badges информации и метро -->
      <div class="header-badges">
        <div class="info-badges">
          <BaseBadge 
            v-for="(info, index) in building.info"
            :key="index"
            variant="default"
            size="sm"
          >
            {{ info }}
          </BaseBadge>
          
          <!-- Badge метро -->
          <MetroBadge
            v-if="building.metro"
            :station-name="building.metro.station"
            :metro-line-color="building.metro.lineColor"
            :walk-time="building.metro.walkTime"
            size="sm"
          />
        </div>
        
        <!-- Badges удобств (зеленые) -->
        <div class="amenities-badges">
          <BaseBadge
            v-for="(amenity, index) in building.amenities"
            :key="index"
            variant="primary"
            size="sm"
          >
            {{ amenity }}
          </BaseBadge>
        </div>
      </div>
      
      <!-- CTA секция -->
      <div class="header-cta">
        <!-- Кнопка -->
        <BaseButton 
          variant="primary"
          :block="true"
          @click="$emit('call-request')"
        >
          Заказать звонок
        </BaseButton>
        
        <!-- Контакты -->
        <div class="header-contacts">
          <BaseText 
            variant="body-sm"
            color="white"
            custom-class="tracking-[-0.39px]"
          >
            {{ building.phone }}
          </BaseText>
          <div class="contact-divider" />
          <BaseText 
            variant="body-sm"
            color="white"
            custom-class="tracking-[-0.39px]"
          >
            {{ building.email }}
          </BaseText>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BaseText, BaseBadge, BaseButton, MetroBadge } from '../base'

defineProps({
  /**
   * Данные здания
   */
  building: {
    type: Object,
    required: true
  }
})

defineEmits(['call-request'])

</script>

<style scoped>
.building-header {
  @apply relative flex flex-col items-start overflow-hidden h-[414px] w-full;
}

.header-background {
  @apply absolute inset-0 w-full h-[352px];
}

.header-image {
  @apply absolute w-full h-full object-cover opacity-60 left-0 top-0;
}

.header-gradient {
  @apply absolute w-full h-full bg-gradient-to-b from-transparent to-neutral-space;
}

.header-content {
  @apply relative flex flex-col gap-4 h-full items-start justify-end px-5 py-4 w-full z-10;
}

.header-title-block {
  @apply flex flex-col gap-1 items-start w-full;
}

.header-badges {
  @apply flex flex-col gap-4 items-start w-full;
}

.info-badges {
  @apply flex flex-wrap gap-2 items-start w-full;
}

.amenities-badges {
  @apply flex flex-wrap gap-2 items-start w-full;
}

.header-cta {
  @apply flex flex-col gap-3 items-center w-full;
}

.header-contacts {
  @apply flex gap-2 items-center justify-center w-full;
}

.contact-divider {
  @apply w-[5px] h-[5px] rounded-full bg-white opacity-20;
}


</style>

