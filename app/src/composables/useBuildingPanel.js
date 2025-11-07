import { ref } from 'vue'

/**
 * Composable для управления показом панели здания
 * Общее состояние между Map.vue и App.vue
 */

// Глобальное состояние (singleton)
const isPanelVisible = ref(false)
const selectedBuilding = ref(null)

export function useBuildingPanel() {
  /**
   * Показать панель здания
   * @param {Object} building - данные здания
   */
  const showPanel = (building = null) => {
    selectedBuilding.value = building
    isPanelVisible.value = true
  }

  /**
   * Скрыть панель здания
   */
  const hidePanel = () => {
    isPanelVisible.value = false
    selectedBuilding.value = null
  }

  /**
   * Переключить видимость панели
   */
  const togglePanel = (building = null) => {
    if (isPanelVisible.value) {
      hidePanel()
    } else {
      showPanel(building)
    }
  }

  return {
    isPanelVisible,
    selectedBuilding,
    showPanel,
    hidePanel,
    togglePanel
  }
}

