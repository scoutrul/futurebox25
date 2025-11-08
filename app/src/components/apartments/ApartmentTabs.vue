<template>
  <div class="apartment-tabs">
    <div class="tabs-container">
      <!-- Табы комнат -->
      <div class="tabs-list">
        <button
          v-for="room in roomTypes"
          :key="room"
          :class="['tab-button', { 'tab-button-active': modelValue === room }]"
          @click="handleTabClick(room)"
        >
          {{ room }}-комн
        </button>
      </div>
      
      <!-- Кнопка "Смотреть все" -->
      <button 
        v-if="false"
        class="view-all-button"
        @click="$emit('view-all')"
      >
        Смотреть все
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  /**
   * Активный таб (количество комнат)
   */
  modelValue: {
    type: Number,
    required: true
  },
  /**
   * Типы комнат для отображения
   */
  roomTypes: {
    type: Array,
    default: () => [1, 2, 3, 4]
  }
})

const emit = defineEmits(['update:modelValue', 'view-all'])

const handleTabClick = (room) => {
  emit('update:modelValue', room)
}
</script>

<style scoped>
.apartment-tabs {
  @apply bg-white w-full;
}

.tabs-container {
  @apply flex items-center px-2.5 py-1 gap-2;
}

.tabs-list {
  @apply flex flex-1 items-center gap-4 px-2.5 py-[5px];
}

.tab-button {
  @apply flex-col justify-center font-sans font-medium text-[15px] leading-[1.6] 
         tracking-[-0.45px] whitespace-nowrap transition-colors duration-200
         text-neutral-dark-gray;
}

.tab-button-active {
  @apply text-primary;
}

.tab-button:hover {
  @apply text-primary opacity-80;
}

.view-all-button {
  @apply flex gap-2 items-center font-sans font-medium text-[15px] leading-[1.6] 
         tracking-[-0.45px] whitespace-nowrap text-primary transition-opacity duration-200;
}

.view-all-button:hover {
  @apply opacity-80;
}

/* Адаптивность - mobile-first */
@media (min-width: 768px) {
  .tabs-list {
    @apply gap-6;
  }
}
</style>

