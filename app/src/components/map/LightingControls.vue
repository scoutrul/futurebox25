
<template>
  <BaseCard custom-class="lighting-controls" padding="lg">
    <div class="controls-header">
      <BaseText variant="heading-4" color="dark">Настройки освещения</BaseText>
      <button class="toggle-button" @click="isExpanded = !isExpanded">
        {{ isExpanded ? '−' : '+' }}
      </button>
    </div>

    <div v-show="isExpanded" class="controls-content">
      <!-- Directional Light -->
      <div class="control-section">
        <BaseText variant="body" color="dark" custom-class="section-title">
          Солнечный свет
        </BaseText>

        <div class="control-item">
          <label class="control-label">
            <BaseText variant="body-sm" color="medium">
              Интенсивность: {{ settings.sun.intensity.toFixed(2) }}
            </BaseText>
          </label>
          <input v-model.number="settings.sun.intensity" type="range" min="0" max="3" step="0.1" class="slider" />
        </div>

        <div class="control-item">
          <label class="control-label">
            <BaseText variant="body-sm" color="medium">Цвет</BaseText>
          </label>
          <input v-model="settings.sun.color" type="color" class="color-picker" />
        </div>

        <div class="control-item">
          <label class="control-label">
            <BaseText variant="body-sm" color="medium">
              Position X: {{ settings.sun.position.x.toFixed(0) }}
            </BaseText>
          </label>
          <input v-model.number="settings.sun.position.x" type="range" min="-200" max="200" step="1" class="slider" />
        </div>

        <div class="control-item">
          <label class="control-label">
            <BaseText variant="body-sm" color="medium">
              Position Y: {{ settings.sun.position.y.toFixed(0) }}
            </BaseText>
          </label>
          <input v-model.number="settings.sun.position.y" type="range" min="-200" max="200" step="1" class="slider" />
        </div>

        <div class="control-item">
          <label class="control-label">
            <BaseText variant="body-sm" color="medium">
              Position Z: {{ settings.sun.position.z.toFixed(0) }}
            </BaseText>
          </label>
          <input v-model.number="settings.sun.position.z" type="range" min="-200" max="200" step="1" class="slider" />
        </div>
      </div>

      <!-- Ambient Light -->
      <div class="control-section">
        <BaseText variant="body" color="dark" custom-class="section-title">
          Окружающий свет
        </BaseText>

        <div class="control-item">
          <label class="control-label">
            <BaseText variant="body-sm" color="medium">
              Интенсивность: {{ settings.ambient.intensity.toFixed(2) }}
            </BaseText>
          </label>
          <input v-model.number="settings.ambient.intensity" type="range" min="0" max="2" step="0.1" class="slider" />
        </div>

        <div class="control-item">
          <label class="control-label">
            <BaseText variant="body-sm" color="medium">Цвет</BaseText>
          </label>
          <input v-model="settings.ambient.color" type="color" class="color-picker" />
        </div>
      </div>

      <!-- Shadows -->
      <div class="control-section">
        <BaseText variant="body" color="dark" custom-class="section-title">
          Тени
        </BaseText>

        <div class="control-item">
          <label class="control-label">
            <BaseText variant="body-sm" color="medium">
              Shadow Bias: {{ settings.shadow.bias.toFixed(4) }}
            </BaseText>
          </label>
          <input v-model.number="settings.shadow.bias" type="range" min="-0.01" max="0.01" step="0.0001" class="slider" />
        </div>

        <div class="control-item">
          <label class="control-label">
            <BaseText variant="body-sm" color="medium">
              Normal Bias: {{ settings.shadow.normalBias.toFixed(4) }}
            </BaseText>
          </label>
          <input v-model.number="settings.shadow.normalBias" type="range" min="0" max="0.05" step="0.001" class="slider" />
        </div>

        <div class="control-item">
          <label class="control-label">
            <BaseText variant="body-sm" color="medium">
              Shadow Radius: {{ settings.shadow.radius.toFixed(1) }}
            </BaseText>
          </label>
          <input v-model.number="settings.shadow.radius" type="range" min="0" max="10" step="0.5" class="slider" />
        </div>
      </div>

      <!-- Renderer -->
      <div class="control-section">
        <BaseText variant="body" color="dark" custom-class="section-title">
          Рендерер
        </BaseText>

        <div class="control-item">
          <label class="control-label">
            <BaseText variant="body-sm" color="medium">
              Exposure: {{ settings.renderer.toneMappingExposure.toFixed(2) }}
            </BaseText>
          </label>
          <input v-model.number="settings.renderer.toneMappingExposure" type="range" min="0" max="3" step="0.1" class="slider" />
        </div>
      </div>

      <!-- Environment Map -->
      <div class="control-section">
        <BaseText variant="body" color="dark" custom-class="section-title">
          Environment Map
        </BaseText>

        <div class="control-item">
          <label class="control-label">
            <BaseText variant="body-sm" color="medium">
              Интенсивность: {{ settings.envMap.intensity.toFixed(2) }}
            </BaseText>
          </label>
          <input v-model.number="settings.envMap.intensity" type="range" min="0" max="3" step="0.1" class="slider" />
        </div>
      </div>

      <!-- Actions -->
      <div class="control-actions">
        <BaseButton variant="secondary" size="sm" @click="resetToDefaults">
          Сбросить
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="copySettings">
          Копировать
        </BaseButton>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseText from '@/components/base/BaseText.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const isExpanded = ref(true)

const settings = ref({
  sun: {
    intensity: props.modelValue.sun?.intensity || 1.0,
    color: props.modelValue.sun?.color || '#ffffff',
    position: {
      x: props.modelValue.sun?.position?.x || 50,
      y: props.modelValue.sun?.position?.y || 100,
      z: props.modelValue.sun?.position?.z || 50
    }
  },
  shadow: {
    bias: props.modelValue.shadow?.bias || -0.001,
    normalBias: props.modelValue.shadow?.normalBias || 0.005,
    radius: props.modelValue.shadow?.radius || 2
  },
  ambient: {
    intensity: props.modelValue.ambient?.intensity || 0.5,
    color: props.modelValue.ambient?.color || '#ffffff'
  },
  renderer: {
    toneMappingExposure: props.modelValue.renderer?.toneMappingExposure || 1.2
  },
  envMap: {
    intensity: props.modelValue.envMap?.intensity || 1.0
  }
})

watch(settings, (newSettings) => {
  emit('update:modelValue', newSettings)
}, { deep: true })

const defaultSettings = {
  sun: {
    intensity: 1.0,
    color: '#ffffff',
    position: { x: 50, y: 100, z: 50 }
  },
  shadow: {
    bias: -0.001,
    normalBias: 0.005,
    radius: 2
  },
  ambient: {
    intensity: 0.5,
    color: '#ffffff'
  },
  renderer: {
    toneMappingExposure: 1.2
  },
  envMap: {
    intensity: 1.0
  }
}

const resetToDefaults = () => {
  settings.value = JSON.parse(JSON.stringify(defaultSettings))
}

const copySettings = async () => {
  const json = JSON.stringify(settings.value, null, 2)
  try {
    await navigator.clipboard.writeText(json)
    alert('Настройки скопированы!')
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.lighting-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 350px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 100600;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toggle-button {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(42, 150, 72, 0.1);
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  color: #2a9648;
  transition: all 0.2s;
}

.toggle-button:hover {
  background: rgba(42, 150, 72, 0.2);
}

.controls-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e6e6e6;
}

.section-title {
  font-weight: 600;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  display: flex;
  justify-content: space-between;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e6e6e6;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2a9648;
  cursor: pointer;
}

.color-picker {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.control-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
}
.lighting-controls::-webkit-scrollbar {
  width: 6px;
}

.lighting-controls::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.lighting-controls::-webkit-scrollbar-thumb {
  background: rgba(42, 150, 72, 0.3);
  border-radius: 3px;
}

.lighting-controls::-webkit-scrollbar-thumb:hover {
  background: rgba(42, 150, 72, 0.5);
}

@media (max-width: 768px) {
  .lighting-controls {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    max-height: 70vh;
  }
}
</style>