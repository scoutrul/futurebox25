import { ref } from 'vue'

/**
 * Composable для управления модалкой 3D плана
 * Глобальное состояние для показа 3D планов квартир
 */

// Глобальное состояние (singleton)
const isModalVisible = ref(false)
const modal3DUrl = ref('')

export function useModal3D() {
  /**
   * Открыть модалку с 3D планом
   * @param {string} url - URL для отображения в iframe
   */
  const openModal = (url) => {
    if (!url) {
      console.warn('useModal3D: URL не указан')
      return
    }
    modal3DUrl.value = url
    isModalVisible.value = true
  }

  /**
   * Закрыть модалку
   */
  const closeModal = () => {
    isModalVisible.value = false
    // Задержка перед очисткой URL для плавного закрытия
    setTimeout(() => {
      modal3DUrl.value = ''
    }, 300)
  }

  return {
    isModalVisible,
    modal3DUrl,
    openModal,
    closeModal
  }
}

