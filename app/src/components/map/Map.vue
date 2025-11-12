<template>
  <div class="building-map">
    <!-- Контейнер для карты -->
    <div
      id="map"
      ref="mapContainer"
      class="map-container"
    />
    
    <!-- Лоадер на время загрузки модели -->
    <div
      v-if="isModelLoading"
      class="loader-spinner"
      :style="loaderPosition"
    >
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Threebox } from 'threebox-plugin'
import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import modelUrl from '@/assets/models/FutureboxNew.glb?url'
import environmentUrl from '@/assets/tex/environment.hdr?url'
import lefortovoImage from '@/assets/img/lefortovo.jpg'
import { useBuildingPanel } from '@/composables/useBuildingPanel'


// Props
const props = defineProps({
  building: {
    type: Object,
    default: () => ({})
  }
})

// Используем композицию для управления панелью
const { showPanel } = useBuildingPanel()

// Refs
const mapContainer = ref(null)
const accessToken = 'pk.eyJ1IjoidmlydXNyZWxvYWRlZCIsImEiOiJjaXJldTR1cWYwMDEwaWJtMzIwbTdoOHZ5In0.hzXJEVACTihdI_E84Td81w'

// Map variables
let mapBoxGl = null
let origin = [37.431054, 55.811968]
let threeBox = null // Threebox instance

let modelRotation = -278
let modelScale = 1
let model = null
let modelBottom = null // Reference to bottom collection
let modelTop = null // Reference to top collection
let environmentMap = null
let sunLight = null // Добавляем переменную для света

// Добавьте эти переменные в начало скрипта (после других переменных)
let animationFrameId = null
let lastRenderTime = 0
const targetFPS = 30 // Целевой FPS для оптимизации
const frameInterval = 1000 // targetFPS
// Переменные для обработчиков событий
let canvas = null
let mouseDownHandler = null
let mouseMoveHandler = null
let mouseUpHandler = null
let contextMenuHandler = null

// Loader state
const isModelLoading = ref(false)
const loaderPosition = ref({
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  opacity: 0
})

const loadEnvironmentMap = () => {
  return new Promise((resolve, reject) => {
    const rgbeLoader = new RGBELoader()
    
    console.log('🔄 Начинаем загрузку HDR environment map:', environmentUrl)
    
    rgbeLoader.load(
      environmentUrl,
      (texture) => {
        console.log('✓ HDR текстура загружена успешно')
        
        // Настраиваем текстуру для использования как environment map
        texture.mapping = THREE.EquirectangularReflectionMapping
        texture.colorSpace = THREE.SRGBColorSpace
        
        // Fix the rotation using offset
        // texture.offset.set(0.5, 0)  // 180° поворот
        
        // НОВОЕ: Уменьшаем масштаб отражения (делаем его более "далеким")
        // Значения больше 1 = отражение становится мельче (более далеким)
        // Значения меньше 1 = отражение становится крупнее (более близким)
        // texture.repeat.set(8, 8)  // Попробуйте разные значения: 1.5, 2, 3, 4
        
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.needsUpdate = true
        
        environmentMap = texture
        
        // ВАЖНО: Если модель уже загружена, обновляем её материалы
        if (model) {
          console.log('🔄 Обновляем материалы модели с новым environment map')
          updateModelMaterials(texture)
          
          // Обновляем сцену
          if (threeBox && threeBox.scene) {
            threeBox.scene.environment = texture
          }
          
          // Форсируем перерисовку
          if (mapBoxGl) {
            mapBoxGl.triggerRepaint()
          }
        }
        
        console.log('✓ HDR environment map настроена с offset:', texture.offset, 'и repeat:', texture.repeat)
        resolve(texture)
      },
      (progress) => {
        if (progress.lengthComputable) {
          const percentComplete = (progress.loaded / progress.total) * 100
          console.log(`📊 Загрузка HDR: ${percentComplete.toFixed(2)}%`)
        }
      },
      (error) => {
        console.error('✗ Ошибка загрузки HDR environment map:', error)
        reject(error)
      }
    )
  })
}
const findCollectionsByHierarchy = () => {
  if (!model) return
  
  const children = model.children
  if (children.length >= 2) {
    // Предполагаем, что первая коллекция - bottom, вторая - top
    modelBottom = children[0]
    modelTop = children[1]
    console.log('✓ Найдены коллекции по иерархии:', {
      bottom: modelBottom?.name,
      top: modelTop?.name
    })
  }
}

const updateModelMaterials = (envMap) => {
  if (!model) return
  
  console.log('🎨 Обновляем материалы модели с environment map')
  
  let updatedCount = 0
  
  model.traverse(child => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      
      materials.forEach(mat => {
        if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
          // Применяем envMap ко всем материалам
          mat.envMap = envMap
          mat.needsUpdate = true
          updatedCount++
          
          const matName = mat.name ? mat.name.toLowerCase() : ''
          
          // Настройки для стекла/окон
          if (matName.includes('glass') || matName.includes('window')) {
            mat.envMap = envMap
            mat.envMapIntensity = 1.0
            // mat.metalness = 0.1
            // mat.roughness = 0.02
          }
          // Настройки для металла
          else if (matName.includes('metal') || matName.includes('aluminum')) {
            mat.envMapIntensity = 1.0
            // mat.metalness = 0.8
            // mat.roughness = 0.2
          }
          // Настройки для остальных материалов
          else {
            mat.envMapIntensity = 0.5
          }
        }
      })
    }
  })
  
  console.log(`✓ Обновлено ${updatedCount} материалов с environment map`)
}
// Оптимизация материалов модели
const enhanceModelMaterials = (modelObject) => {
  if (!modelObject) return
  
  let meshCount = 0
  let materialCount = 0
  
  modelObject.traverse(child => {
    if (child.isMesh && child.material) {
      meshCount++
      
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      
      materials.forEach(material => {
        materialCount++
        
        // Включаем тени только для важных объектов
        // child.castShadow = true
        // child.receiveShadow = true
        
        // Оптимизация frustum culling
        child.frustumCulled = true
        
        // КРИТИЧЕСКИ ВАЖНО: Устанавливаем renderOrder для предотвращения мерцания
        child.renderOrder = 1
        
        if (!(material.isMeshStandardMaterial || material.isMeshPhysicalMaterial)) {
          const originalColor = material.color ? material.color.clone() : new THREE.Color(0xffffff)
          
          const newMaterial = new THREE.MeshStandardMaterial({
            color: originalColor,
            map: material.map,
            normalMap: material.normalMap,
            roughnessMap: material.roughnessMap,
            metalnessMap: material.metalnessMap,
            aoMap: material.aoMap,
            // Оптимизации материала
            flatShading: false,
            precision: 'highp', // Высокая точность для предотвращения z-fighting
            // КРИТИЧЕСКИ ВАЖНО: Настройки depth для предотвращения мерцания
            depthTest: true,
            depthWrite: true,
            // Polygon offset для предотвращения z-fighting
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
          })
          
          if (Array.isArray(child.material)) {
            const index = child.material.indexOf(material)
            child.material[index] = newMaterial
          } else {
            child.material = newMaterial
          }
          material = newMaterial
        } else {
          // КРИТИЧЕСКИ ВАЖНО: Настройки существующих материалов для предотвращения мерцания
          material.depthTest = true
          material.depthWrite = true
          material.precision = 'highp'
          
          // Polygon offset для предотвращения z-fighting
          material.polygonOffset = true
          material.polygonOffsetFactor = 1
          material.polygonOffsetUnits = 1
          
          // Для прозрачных материалов
          if (material.transparent || material.opacity < 1) {
            material.depthWrite = false
            material.side = THREE.DoubleSide
            // Увеличиваем polygonOffset для прозрачных материалов
            material.polygonOffsetFactor = 2
            material.polygonOffsetUnits = 2
          }
        }
        
        material.needsUpdate = true
      })
    }
  })
  
  console.log(`✓ Оптимизировано ${meshCount} мешей и ${materialCount} материалов`)
}
// Оптимизированная функция для добавления плоскости земли
const addGroundPlane = () => {
  if (!threeBox || !threeBox.world) return
  
  try {
    // Уменьшаем размер плоскости для оптимизации
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 1, 1) // Убрали сегментацию
    const groundMaterial = new THREE.ShadowMaterial({
      opacity: 0.8,
      color: 0x000000
    })
    
    const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial)
    groundPlane.rotation.x = -Math.PI / 2
    groundPlane.receiveShadow = true
    groundPlane.castShadow = false
    
    groundPlane.position.set(0, -0.5, 0)
    
    threeBox.world.add(groundPlane)
    
    console.log('✓ Добавлена оптимизированная плоскость земли')
  } catch (error) {
    console.warn('⚠ Не удалось добавить плоскость земли:', error.message)
  }
}
// Оптимизированная функция освещения
const addFallbackLightingWithSky = async () => {
  if (!threeBox) return
  
  const scene = threeBox.scene
  
  try {
    const hdrTexture = await loadEnvironmentMap()
    scene.environment = hdrTexture
    scene.background = null
    
    console.log('✓ HDR environment map применена к сцене')
  } catch (error) {
    console.warn('⚠ Не удалось загрузить HDR, используем fallback градиент')
    
    // Уменьшаем разрешение градиента для оптимизации
    const canvas = document.createElement('canvas')
    canvas.width = 1024 // Было 2048
    canvas.height = 512  // Было 1024
    const context = canvas.getContext('2d')
    
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#0d5e9e')
    gradient.addColorStop(0.3, '#4a9fd8')
    gradient.addColorStop(0.7, '#b8d8f0')
    gradient.addColorStop(0.85, '#e8f4f8')
    gradient.addColorStop(1, '#ffffff')
    
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
    
    const skyTexture = new THREE.CanvasTexture(canvas)
    skyTexture.mapping = THREE.EquirectangularReflectionMapping
    skyTexture.colorSpace = THREE.SRGBColorSpace
    
    scene.environment = skyTexture
    
    console.log('✓ Применено оптимизированное fallback освещение')
  }
  
  // Оптимизированные настройки света
  sunLight = new THREE.DirectionalLight(0xffffff, 1.0)
  sunLight.position.set(50, 100, 50)
  sunLight.castShadow = true
  
  // Уменьшаем разрешение теней для производительности
  sunLight.shadow.mapSize.width = 1024  // Было 8192
  sunLight.shadow.mapSize.height = 1024 // Было 8192
  sunLight.shadow.camera.near = 0.5
  sunLight.shadow.camera.far = 500
  
  const shadowSize = 150
  sunLight.shadow.camera.left = -shadowSize
  sunLight.shadow.camera.right = shadowSize
  sunLight.shadow.camera.top = shadowSize
  sunLight.shadow.camera.bottom = -shadowSize
  
  sunLight.shadow.bias = -0.001
  sunLight.shadow.normalBias = 0.005
  sunLight.shadow.radius = 2
  
  scene.add(sunLight)
  
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
  scene.add(ambientLight)
  
  console.log('✓ Добавлено оптимизированное освещение')
  
  if (threeBox.renderer) {
    threeBox.renderer.toneMapping = THREE.ACESFilmicToneMapping
    threeBox.renderer.toneMappingExposure = 1.2
    threeBox.renderer.outputColorSpace = THREE.SRGBColorSpace
    
    // Оптимизированные настройки теней
    threeBox.renderer.shadowMap.enabled = true
    threeBox.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    threeBox.renderer.shadowMap.autoUpdate = false // Отключаем автообновление
    
    // Дополнительные оптимизации рендерера
    threeBox.renderer.powerPreference = 'high-performance'
    threeBox.renderer.precision = 'mediump' // Средняя точность вместо высокой
    
    console.log('✓ Рендерер оптимизирован для производительности')
  }
}

// Оптимизированная функция обновления позиции света
const updateSunLightPosition = () => {
  if (!sunLight || !model || !mapBoxGl) return
  
  const modelWorldPosition = new THREE.Vector3()
  model.getWorldPosition(modelWorldPosition)
  
  const zoom = mapBoxGl.getZoom()
  const sceneScale = Math.pow(2, zoom - 16)
  
  const baseShadowSize = 150
  const baseLightDistance = 100
  
  const shadowSize = baseShadowSize * sceneScale
  const lightDistance = baseLightDistance * sceneScale
  
  sunLight.position.set(
    modelWorldPosition.x + lightDistance * 0.5,
    modelWorldPosition.y + lightDistance,
    modelWorldPosition.z + lightDistance * 0.5
  )
  
  if (!sunLight.target.parent) {
    threeBox.scene.add(sunLight.target)
  }
  sunLight.target.position.copy(modelWorldPosition)
  sunLight.target.updateMatrixWorld()
  
  sunLight.shadow.camera.left = -shadowSize
  sunLight.shadow.camera.right = shadowSize
  sunLight.shadow.camera.top = shadowSize
  sunLight.shadow.camera.bottom = -shadowSize
  
  const distanceToModel = sunLight.position.distanceTo(modelWorldPosition)
  
  sunLight.shadow.camera.near = Math.max(1, distanceToModel - shadowSize * 1.5)
  sunLight.shadow.camera.far = distanceToModel + shadowSize * 1.5
  
  sunLight.shadow.camera.updateProjectionMatrix()
  
  // Обновляем тени только при необходимости
  if (threeBox.renderer && threeBox.renderer.shadowMap.autoUpdate === false) {
    threeBox.renderer.shadowMap.needsUpdate = true
  }
}

// Обновление позиции лоадера
const updateLoaderPosition = () => {
  if (!mapBoxGl) return

  // Преобразуем географические координаты в пиксельные координаты экрана
  const point = mapBoxGl.project(origin)
  
  loaderPosition.value = {
    left: `${point.x}px`,
    top: `${point.y}px`,
    transform: 'translate(-50%, -50%)',
    opacity: 1
  }
}

// Функция очистки ресурсов
const cleanup = () => {
  console.log('🧹 Начинаем очистку ресурсов...')
  
  // Удаляем обработчики событий с canvas
  if (canvas) {
    if (mouseDownHandler) canvas.removeEventListener('mousedown', mouseDownHandler)
    if (mouseMoveHandler) canvas.removeEventListener('mousemove', mouseMoveHandler)
    if (mouseUpHandler) canvas.removeEventListener('mouseup', mouseUpHandler)
    if (contextMenuHandler) canvas.removeEventListener('contextmenu', contextMenuHandler)
  }
  
  // Удаляем обработчики событий карты
  if (mapBoxGl) {
    if (handleModelClick) mapBoxGl.off('click', handleModelClick)
    if (handleMouseMove) mapBoxGl.off('mousemove', handleMouseMove)
    mapBoxGl.off('move', updateLoaderPosition)
    mapBoxGl.off('zoom', updateLoaderPosition)
  }
  
  // Отменяем анимацию
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  
  // Очищаем Threebox
  if (threeBox) {
    try {
      threeBox.clear()
      threeBox.dispose()
    } catch (error) {
      console.warn('⚠ Ошибка при очистке Threebox:', error.message)
    }
    threeBox = null
  }
  
  // Удаляем карту
  if (mapBoxGl) {
    try {
      mapBoxGl.remove()
    } catch (error) {
      console.warn('⚠ Ошибка при удалении карты:', error.message)
    }
    mapBoxGl = null
  }
  
  // Очищаем ссылки
  canvas = null
  model = null
  modelBottom = null
  modelTop = null
  environmentMap = null
  sunLight = null
  handleModelClick = null
  handleMouseMove = null
  mouseDownHandler = null
  mouseMoveHandler = null
  mouseUpHandler = null
  contextMenuHandler = null
  
  console.log('✓ Очистка ресурсов завершена')
}


// КРИТИЧЕСКИ ВАЖНО: Оптимизированная функция рендеринга без мерцания
const optimizedRender = (gl, matrix) => {
  if (!threeBox) return
  
  // ВАЖНО: Сохраняем состояние WebGL перед рендерингом Three.js
  const currentProgram = gl.getParameter(gl.CURRENT_PROGRAM)
  const currentBlend = gl.getParameter(gl.BLEND)
  const currentDepthTest = gl.getParameter(gl.DEPTH_TEST)
  const currentCullFace = gl.getParameter(gl.CULL_FACE)
  const currentDepthFunc = gl.getParameter(gl.DEPTH_FUNC)
  const currentBlendSrc = gl.getParameter(gl.BLEND_SRC_RGB)
  const currentBlendDst = gl.getParameter(gl.BLEND_DST_RGB)
  
  // Обновляем позицию света только при необходимости
  updateSunLightPosition()
  
  // Обновляем матрицы
  if (model) {
    model.updateMatrixWorld(true)
  }
  
  // КРИТИЧЕСКИ ВАЖНО: Настраиваем WebGL состояние для Three.js
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  
  // КРИТИЧЕСКИ ВАЖНО: Очищаем только depth buffer, не color buffer
  // Это предотвращает мерцание при взаимодействии с картой
  gl.clear(gl.DEPTH_BUFFER_BIT)
  
  // Рендерим сцену Three.js
  threeBox.update()
  
  // ВАЖНО: Восстанавливаем состояние WebGL для Mapbox
  // Это критично для предотвращения конфликтов рендеринга
  if (currentProgram) {
    gl.useProgram(currentProgram)
  }
  
  if (currentBlend) {
    gl.enable(gl.BLEND)
  } else {
    gl.disable(gl.BLEND)
  }
  
  if (currentDepthTest) {
    gl.enable(gl.DEPTH_TEST)
  } else {
    gl.disable(gl.DEPTH_TEST)
  }
  
  if (currentCullFace) {
    gl.enable(gl.CULL_FACE)
  } else {
    gl.disable(gl.CULL_FACE)
  }
  
  // Восстанавливаем функцию глубины
  if (currentDepthFunc) {
    gl.depthFunc(currentDepthFunc)
  }
  
  // Восстанавливаем blend функции
  if (currentBlendSrc && currentBlendDst) {
    gl.blendFunc(currentBlendSrc, currentBlendDst)
  }
}
// Загрузка и добавление 3D модели
const add3DModel = () => {
  console.log("Загрузка 3D модели по адресу:", origin)
  
  isModelLoading.value = true
  updateLoaderPosition()
  
  mapBoxGl.on('move', updateLoaderPosition)
  mapBoxGl.on('zoom', updateLoaderPosition)
  
  if (!THREE.Object3D.prototype.onBuild) {
    console.log('🔧 Добавляем метод onBuild в прототип THREE.Object3D')
    THREE.Object3D.prototype.onBuild = function() {}
  }
  
  threeBox = window.tb = new Threebox(
    mapBoxGl,
    mapBoxGl.getCanvas().getContext('webgl'),
    {
      defaultLights: false,
      enableSelectingObjects: false,
      enableDraggingObjects: true,
      enableRotatingObjects: true,
      enableTooltips: true
    }
  )
  
  // КРИТИЧЕСКИ ВАЖНО: Настройки renderer для предотвращения мерцания
  if (threeBox.renderer) {
    threeBox.renderer.autoClear = false
    threeBox.renderer.sortObjects = true // Включаем сортировку объектов
    
    // Настройки для предотвращения z-fighting
    const gl = threeBox.renderer.getContext()
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    
    // Настройки для правильной работы с прозрачностью
    threeBox.renderer.sortObjects = true
    threeBox.renderer.preserveDrawingBuffer = true
  }
  
  addFallbackLightingWithSky()
  
  console.log('Начинаем загрузку модели...', modelUrl)
  
  try {
    threeBox.loadObj({
      obj: modelUrl,
      type: 'gltf',
      scale: modelScale,
      units: 'meters',
      rotation: { x: 90, y: modelRotation, z: 0 },
      anchor: 'center',
      tooltip: false
    }, function (loadedModel) {
      console.log('Callback загрузки модели вызван', loadedModel ? 'успешно' : 'с ошибкой')
      
      if (loadedModel) {
        model = loadedModel
        
        console.log('✓ Модель загружена, начинаем оптимизацию...')
        
        model.userData.selectEnabled = false
        
        // Ищем и сохраняем ссылки на коллекции bottom и top
        model.traverse((child) => {
          const childName = child.name.toLowerCase()
          
          if (childName.includes('bottom') || 
              childName.includes('base') ||
              childName.includes('lower') ||
              childName === 'bottom') {
            modelBottom = child
            // console.log('✓ Найдена BOTTOM коллекция:', child.name)
          }
          
          if (childName.includes('top') || 
              childName.includes('upper') ||
              childName.includes('roof') ||
              childName === 'top') {
            modelTop = child
            // console.log('✓ Найдена TOP коллекция:', child.name)
          }
          
          // КРИТИЧЕСКИ ВАЖНО: Настройки для предотвращения мерцания
          if (child.isMesh) {
            // Устанавливаем правильный renderOrder
            child.renderOrder = 1
            
            child.castShadow = true
            child.receiveShadow = true
            child.frustumCulled = true
            
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material]
              
              materials.forEach(mat => {
                // КРИТИЧЕСКИ ВАЖНО: Настройки материала для предотвращения мерцания
                mat.depthTest = true
                mat.depthWrite = true
                mat.precision = 'highp' // Высокая точность для предотвращения z-fighting
                
                // Для прозрачных материалов
                if (mat.transparent || mat.opacity < 1) {
                  mat.depthWrite = false // Отключаем запись в буфер глубины для прозрачных
                  mat.side = THREE.DoubleSide
                }
                
                // Небольшой polygonOffset для предотвращения z-fighting
                mat.polygonOffset = true
                mat.polygonOffsetFactor = 1
                mat.polygonOffsetUnits = 1
                
                mat.needsUpdate = true
              })
            }
          }
        })
        
        if (!modelBottom || !modelTop) {
          console.warn('Коллекции не найдены по имени, пробуем поиск по иерархии...')
          findCollectionsByHierarchy()
        }
        
        if (modelBottom) {
          console.log('✓ Bottom коллекция готова:', modelBottom.name)
        } else {
          console.error('✗ Bottom коллекция не найдена!')
        }
        
        if (modelTop) {
          console.log('✓ Top коллекция готова:', modelTop.name)
        } else {
          console.error('✗ Top коллекция не найдена!')
        }
        
        if (environmentMap) {
          console.log('🎨 Применяем HDR environment map к материалам модели')
          updateModelMaterials(environmentMap)
        } else if (threeBox.scene.environment) {
          console.log('🎨 Применяем fallback environment map к материалам модели')
          updateModelMaterials(threeBox.scene.environment)
        }
        
        enhanceModelMaterials(model)
        
        console.log('➕ Добавляем модель в сцену...')
        threeBox.add(model)
        model.setCoords(origin)
        console.log('✓ Модель добавлена в сцену')
        
        model.addTooltip = function() {}
        model.userData.selectEnabled = true
        
        handleModelClick = onModelClick
        handleMouseMove = onModelHover
        
        mapBoxGl.on('click', handleModelClick)
        mapBoxGl.on('mousemove', handleMouseMove)

        setTimeout(() => {
          // addGroundPlane()
        }, 100)
        
        setTimeout(() => {
          isModelLoading.value = false
          mapBoxGl.off('move', updateLoaderPosition)
          mapBoxGl.off('zoom', updateLoaderPosition)
        }, 500)
        
        if (threeBox.renderer && threeBox.renderer.shadowMap) {
          threeBox.renderer.shadowMap.needsUpdate = true
        }
        
        mapBoxGl.triggerRepaint()
        
        console.log('✓ Модель успешно загружена и оптимизирована')
      } else {
        console.error('✗ Не удалось загрузить модель')
        isModelLoading.value = false
        mapBoxGl.off('move', updateLoaderPosition)
        mapBoxGl.off('zoom', updateLoaderPosition)
      }
    })
  } catch (error) {
    console.error('✗ Ошибка при загрузке модели:', error)
    isModelLoading.value = false
    mapBoxGl.off('move', updateLoaderPosition)
    mapBoxGl.off('zoom', updateLoaderPosition)
  }
}

const initializeMap = () => {
  mapboxgl.accessToken = accessToken

  mapBoxGl = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/standard',
    center: origin,
    zoom: 16,
    pitch: 45,
    bearing: 0,
    antialias: true,
    scrollZoom: true,
    dragRotate: false
  })
  
  // Сохраняем ссылку на canvas
  canvas = mapBoxGl.getCanvas()
  
  // Реализуем собственное вращение правой кнопкой мыши
  const rotateSpeed = 0.5
  
  let isDragging = false
  let lastX = 0
  let lastY = 0
  
  // Создаём обработчики как именованные функции
  mouseDownHandler = (e) => {
    if (e.button === 2) {
      isDragging = true
      lastX = e.clientX
      lastY = e.clientY
      if (canvas) canvas.style.cursor = 'grab'
      e.preventDefault()
    }
  }
  
  mouseMoveHandler = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastX
      const deltaY = e.clientY - lastY
      
      const currentBearing = mapBoxGl.getBearing()
      const currentPitch = mapBoxGl.getPitch()
      
      mapBoxGl.setBearing(currentBearing + deltaX * rotateSpeed)
      
      const newPitch = currentPitch - deltaY * rotateSpeed
      mapBoxGl.setPitch(Math.max(0, Math.min(85, newPitch)))
      
      lastX = e.clientX
      lastY = e.clientY
    }
  }
  
  mouseUpHandler = (e) => {
    if (e.button === 2) {
      isDragging = false
      if (canvas) canvas.style.cursor = ''
    }
  }
  
  contextMenuHandler = (e) => {
    e.preventDefault()
  }
  
  // Добавляем обработчики
  if (canvas) {
    canvas.addEventListener('mousedown', mouseDownHandler)
    canvas.addEventListener('mousemove', mouseMoveHandler)
    canvas.addEventListener('mouseup', mouseUpHandler)
    canvas.addEventListener('contextmenu', contextMenuHandler)
  }
  
  // Обработчик загрузки карты
  mapBoxGl.on('load', () => {
    console.log('Карта загружена')
    
    const layers = mapBoxGl.getStyle().layers
    let firstSymbolId
    for (const layer of layers) {
      if (layer.type === 'symbol') {
        firstSymbolId = layer.id
        break
      }
    }
    
    if (!mapBoxGl.getLayer('custom-threebox-layer')) {
      mapBoxGl.addLayer({
        id: 'custom-threebox-layer',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function(map, gl) {
          add3DModel()
        },
        render: function(gl, matrix) {
          optimizedRender(gl, matrix)
        },
        onRemove: function() {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
          }
          if (threeBox) {
            threeBox.clear()
          }
        }
      }, firstSymbolId)   
      console.log('Custom 3D layer добавлен с оптимизацией производительности')
    }
  })
}

// Переменные для хранения обработчиков
let handleModelClick = null
let handleMouseMove = null

// Метод обработки клика по модели
const onModelClick = (e) => {
  if (!threeBox || !model) return
  
  // Получаем координаты клика на canvas
  const canvas = mapBoxGl.getCanvas()
  const rect = canvas.getBoundingClientRect()
  
  // Преобразуем координаты клика в normalized device coordinates (-1 to +1)
  const mouse = new THREE.Vector2()
  mouse.x = ((e.point.x - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.point.y - rect.top) / rect.height) * 2 + 1
  
  // Создаем raycaster для определения пересечения с моделью
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, threeBox.camera)
  
  // Проверяем пересечение с моделью
  const intersects = raycaster.intersectObject(model, true)
  
  if (intersects.length > 0) {
  // Создаем объект здания с локальным изображением
    const buildingWithImage = {
      ...props.building,
      imageSrc: lefortovoImage
    }
    // Показываем панель здания
    showPanel(props.building)
  }
}

// Метод обработки наведения на модель
const onModelHover = (e) => {
  if (!threeBox || !model) return
  
  // Получаем координаты курсора на canvas
  const canvas = mapBoxGl.getCanvas()
  const rect = canvas.getBoundingClientRect()
  
  // Преобразуем координаты в normalized device coordinates
  const mouse = new THREE.Vector2()
  mouse.x = ((e.point.x - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.point.y - rect.top) / rect.height) * 2 + 1
  
  // Создаем raycaster для определения пересечения с моделью
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, threeBox.camera)
  
  // Проверяем пересечение с моделью
  const intersects = raycaster.intersectObject(model, true)
  
  // Меняем курсор в зависимости от того, наведен ли он на модель
  if (intersects.length > 0) {
    canvas.style.cursor = 'pointer'
  } else {
    canvas.style.cursor = ''
  }
}

// Lifecycle hooks!!!
onMounted(() => {
  console.log('Map component mounted')
  initializeMap()
})

onBeforeUnmount(() => {
  console.log('Map component будет размонтирован')
  cleanup()
})

onUnmounted(() => {
  console.log('Map component размонтирован')
})
</script>

<style scoped>
.map-container {
  @apply w-full h-full relative;
}

/* Убеждаемся, что canvas контейнер не перекрывает модель */
.map-container :deep(.mapboxgl-canvas-container) {
  position: relative;
  z-index: 1;
}

.map-container :deep(.mapboxgl-canvas) {
  position: relative;
  z-index: 1;
}

/* Спиннер */
.loader-spinner {
  position: absolute;
  z-index: 1001;
  width: 60px;
  height: 60px;
  pointer-events: none;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #2a9648;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  border-top-color: #34a854;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  border-top-color: #c1f9d0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
