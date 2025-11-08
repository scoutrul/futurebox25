<template>
  <!-- Backdrop -->
  <Transition name="modal-fade">
    <div 
      v-if="isVisible"
      class="modal-backdrop"
      @click="handleBackdropClick"
    >
      <!-- Modal Content -->
      <div class="modal-content" @click.stop>
        <!-- Header для модалки -->
        <div class="modal-body">
          <ModalTopBar 
            title="3D План квартиры"
            container-class="modal-header-container"
            @back="handleClose"
          />

          <!-- Iframe контейнер -->
          <iframe 
            v-if="url"
            ref="iframeRef"
            :src="url"
            class="modal-iframe"
            frameborder="0"
            allowfullscreen
            title="3D План квартиры"
            @load="handleIframeLoad"
          />
          <div v-else class="modal-empty">
            <BaseText variant="body" color="gray">
              URL не указан
            </BaseText>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { BaseText } from './index'
import ModalTopBar from '../layout/ModalTopBar.vue'

defineProps({
  /**
   * Видимость модалки
   */
  isVisible: {
    type: Boolean,
    default: false
  },
  /**
   * URL для отображения в iframe
   */
  url: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

// Ref для iframe
const iframeRef = ref(null)

/**
 * Инъекция стилей в iframe после загрузки
 */
const handleIframeLoad = () => {
  try {
    const iframe = iframeRef.value
    if (!iframe || !iframe.contentDocument) return

    // Создаём style элемент
    const style = iframe.contentDocument.createElement('style')
    style.textContent = `
      #legal-hint {
        display: none !important;
      }
    `
    
    // Добавляем в head iframe
    iframe.contentDocument.head.appendChild(style)
    
    console.log('Стили успешно инъектированы в iframe')
  } catch (error) {
    // Ошибка может возникнуть если iframe с другого домена (CORS)
    console.warn('Не удалось применить стили к iframe (возможно, другой домен):', error.message)
  }
}

/**
 * Закрыть модалку
 */
const handleClose = () => {
  emit('close')
}

/**
 * Закрыть при клике на backdrop
 */
const handleBackdropClick = () => {
  handleClose()
}
</script>

<style scoped>

/* Backdrop на весь экран */
.modal-backdrop {
  @apply fixed inset-0 z-50;
  @apply flex items-center justify-center;
  backdrop-filter: blur(4px);
}

/* Modal Content */
.modal-content {
  @apply relative w-full h-full;
  @apply flex flex-col;
}

/* Header Container - убираем нижний padding */
:deep(.modal-header-container) {
  @apply pb-0;
  @apply bg-white;
  @apply z-50 relative;
}

/* Body */
.modal-body {
  @apply flex-1 relative;
  @apply bg-white;
}

/* Iframe */
.modal-iframe {
  @apply w-full h-full;
  @apply z-10 relative top-[-30px];
}

/* Empty state */
.modal-empty {
  @apply flex items-center justify-center h-full;
}

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

