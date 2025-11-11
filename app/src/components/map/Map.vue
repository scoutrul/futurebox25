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
import { ref, onMounted, onUnmounted } from 'vue'
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

// Loader state
const isModelLoading = ref(false)
const loaderPosition = ref({
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  opacity: 0
})

// Альтернативный способ - поворот через offset (более простой)
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
        
        // Поворачиваем текстуру на 180 градусов через offset
        texture.offset.x = 0.5 // Сдвиг на половину = поворот на 180°
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.needsUpdate = true
        
        environmentMap = texture
        
        console.log('✓ HDR environment map повернута на 180° через offset')
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
  
  model.traverse(child => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      
      materials.forEach(mat => {
        if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
          const matName = mat.name ? mat.name.toLowerCase() : ''
          
          // Применяем envMap только к стеклу/окнам для отражений
          mat.envMap = envMap
          if (matName.includes('glass') || matName.includes('window')) {
            // mat.envMapIntensity = 0.5; // Set intensity to 0.5
            // mat.metalness = 0.1
            // mat.roughness = 0.02
            // mat.transparent = true
            // mat.opacity = 0.5
            // mat.color.setHex(0xDDEEFF)
          }
          // Металл/алюминий - тоже получает отражения
          // else if (matName.includes('metal') || matName.includes('aluminum')) {
          //   mat.envMap = envMap
          //   mat.metalness = 0.8
          //   mat.roughness = 0.2
          // }
          // Все остальные материалы - без envMap
          else {
            // mat.envMap = null
          }
          
          mat.needsUpdate = true
        }
      })
    }
  })
  
  console.log('Материалы обновлены с environment map')
}

const enhanceModelMaterials = (modelObject) => {
  if (!modelObject) return
  
  modelObject.traverse(child => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      
      materials.forEach(material => {
        // Включаем тени
        child.castShadow = true
        child.receiveShadow = true
        
        // Конвертируем в PBR материал если нужно
        if (!(material.isMeshStandardMaterial || material.isMeshPhysicalMaterial)) {
          const originalColor = material.color ? material.color.clone() : new THREE.Color(0xffffff)
          
          const newMaterial = new THREE.MeshStandardMaterial({
            color: originalColor,
            map: material.map,
            normalMap: material.normalMap,
            roughnessMap: material.roughnessMap,
            metalnessMap: material.metalnessMap,
            aoMap: material.aoMap
          })
          
          if (Array.isArray(child.material)) {
            const index = child.material.indexOf(material)
            child.material[index] = newMaterial
          } else {
            child.material = newMaterial
          }
          material = newMaterial
        }
        
        // Убираем эмиссивные свойства
        // material.emissive = new THREE.Color(0x000000)
        // material.emissiveIntensity = 0
        
        material.needsUpdate = true
      })
    }
  })
  
  console.log('Материалы модели улучшены')
}
// Опциональная функция для добавления плоскости земли (если нужны тени на земле)
const addGroundPlane = () => {
  if (!threeBox) return
  
  // Создаем невидимую плоскость для приема теней
  const groundGeometry = new THREE.PlaneGeometry(400, 400) // Увеличиваем размер
  const groundMaterial = new THREE.ShadowMaterial({
    opacity: 0.3,
    color: 0x000000
  })
  
  const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial)
  groundPlane.rotation.x = -Math.PI / 2
  groundPlane.receiveShadow = true
  groundPlane.castShadow = false
  
  // ВАЖНО: Используем Threebox Object3D для правильной синхронизации с картой
  const groundObject = threeBox.Object3D({
    obj: groundPlane,
    units: 'meters',
    anchor: 'center'
  })
  
  // Устанавливаем координаты (привязываем к карте)
  groundObject.setCoords(origin)
  
  // Добавляем в сцену через Threebox
  threeBox.add(groundObject)
  
  console.log('✓ Добавлена плоскость земли для теней')
}

// Обновленная функция создания fallback освещения
const addFallbackLightingWithSky = async () => {
  if (!threeBox) return
  
  const scene = threeBox.scene
  
  try {
    // Пытаемся загрузить HDR environment map
    const hdrTexture = await loadEnvironmentMap()
    
    // Применяем HDR текстуру как environment для сцены
    scene.environment = hdrTexture
    scene.background = null
    
    console.log('✓ HDR environment map применена к сцене')
  } catch (error) {
    console.warn('⚠ Не удалось загрузить HDR, используем fallback градиент')
    
    // ... existing gradient code ...
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
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
    
    console.log('✓ Применено fallback освещение с градиентом неба')
  }

  // Добавляем направленный свет для теней (солнце)
  sunLight = new THREE.DirectionalLight(0xffffff, 1.5)
  sunLight.position.set(50, 100, 50)
  sunLight.castShadow = true
  
  // Настройка теней для направленного света
  sunLight.shadow.mapSize.width = 4096
  sunLight.shadow.mapSize.height = 4096
  sunLight.shadow.camera.near = 0.5
  sunLight.shadow.camera.far = 500
  
  // Размер области теней
  const shadowSize = 150
  sunLight.shadow.camera.left = -shadowSize
  sunLight.shadow.camera.right = shadowSize
  sunLight.shadow.camera.top = shadowSize
  sunLight.shadow.camera.bottom = -shadowSize
  
  // Настройки качества теней
  sunLight.shadow.bias = -0.001
  sunLight.shadow.normalBias = 0.02
  
  scene.add(sunLight)
  
  console.log('✓ Добавлено освещение с тенями')
  
  // Настройки tone mapping для реалистичной экспозиции
  if (threeBox.renderer) {
    threeBox.renderer.toneMapping = THREE.ACESFilmicToneMapping
    threeBox.renderer.toneMappingExposure = 1
    threeBox.renderer.outputColorSpace = THREE.SRGBColorSpace
    
    // Включаем тени в рендерере
    threeBox.renderer.shadowMap.enabled = true
    threeBox.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    threeBox.renderer.shadowMap.autoUpdate = true
  }
  
  console.log('✓ Освещение и рендеринг настроены')
}

// Функция обновления позиции света относительно модели
const updateSunLightPosition = () => {
  if (!sunLight || !model || !mapBoxGl) return
  
  // Получаем мировую позицию модели
  const modelWorldPosition = new THREE.Vector3()
  model.getWorldPosition(modelWorldPosition)
  
  // Получаем текущий зум
  const zoom = mapBoxGl.getZoom()
  
  // Масштаб сцены Threebox зависит от зума
  // При зуме 16 масштаб = 1, при зуме 17 масштаб = 2, и т.д.
  const sceneScale = Math.pow(2, zoom - 16)
  
  // Базовые параметры (для зума 16)
  const baseShadowSize = 150
  const baseLightDistance = 100
  
  // Масштабируем параметры в зависимости от зума
  // При приближении (больший зум) все увеличивается пропорционально
  const shadowSize = baseShadowSize * sceneScale
  const lightDistance = baseLightDistance * sceneScale
  
  // Позиционируем свет относительно модели
  sunLight.position.set(
    modelWorldPosition.x + lightDistance * 0.5,
    modelWorldPosition.y + lightDistance,
    modelWorldPosition.z + lightDistance * 0.5
  )
  
  // Направляем свет на модель
  if (!sunLight.target.parent) {
    threeBox.scene.add(sunLight.target)
  }
  sunLight.target.position.copy(modelWorldPosition)
  sunLight.target.updateMatrixWorld()
  
  // Обновляем размеры камеры теней
  sunLight.shadow.camera.left = -shadowSize
  sunLight.shadow.camera.right = shadowSize
  sunLight.shadow.camera.top = shadowSize
  sunLight.shadow.camera.bottom = -shadowSize
  
  // Расстояние от света до модели
  const distanceToModel = sunLight.position.distanceTo(modelWorldPosition)
  
  // near и far должны охватывать всю область теней
  // near - начинается немного перед моделью
  // far - заканчивается за моделью с запасом
  sunLight.shadow.camera.near = Math.max(1, distanceToModel - shadowSize * 1.5)
  sunLight.shadow.camera.far = distanceToModel + shadowSize * 1.5
  
  // Обновляем камеру теней
  sunLight.shadow.camera.updateProjectionMatrix()
  
  // Для отладки
  console.log('Shadow camera update:', { 
    zoom: zoom.toFixed(2), 
    sceneScale: sceneScale.toFixed(2),
    shadowSize: shadowSize.toFixed(2), 
    lightDistance: lightDistance.toFixed(2),
    near: sunLight.shadow.camera.near.toFixed(2),
    far: sunLight.shadow.camera.far.toFixed(2),
    distanceToModel: distanceToModel.toFixed(2)
  })
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

// Загрузка и добавление 3D модели (из примера map.js)
const add3DModel = () => {
  console.log("Загрузка 3D модели по адресу:", origin)
  
  // Показываем лоадер
  isModelLoading.value = true
  updateLoaderPosition()
  
  // Обновляем позицию лоадера при движении карты
  mapBoxGl.on('move', updateLoaderPosition)
  mapBoxGl.on('zoom', updateLoaderPosition)
  
  // КРИТИЧЕСКИ ВАЖНО: Патчим THREE.Object3D ПЕРЕД инициализацией Threebox
  // Это гарантирует, что у всех объектов будет метод onBuild
  if (!THREE.Object3D.prototype.onBuild) {
    console.log('🔧 Добавляем метод onBuild в прототип THREE.Object3D')
    THREE.Object3D.prototype.onBuild = function() {
      // Пустая функция для совместимости с Threebox
    }
  }
  
  // Инициализируем Threebox
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
  
  // Настраиваем renderer для правильной работы с ресайзом
  if (threeBox.renderer) {
    threeBox.renderer.autoClear = false
  }
  
  // Добавляем environment map для отражений и освещения
  addFallbackLightingWithSky()
  
  console.log('Начинаем загрузку модели...', modelUrl)
  
  // Загружаем 3D модель
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
        
        console.log('✓ Модель загружена, onBuild уже есть у всех объектов через прототип')
        
        model.userData.selectEnabled = false
        
        // Ищем и сохраняем ссылки на коллекции bottom и top
        model.traverse((child) => {
          const childName = child.name.toLowerCase()
          
          // Проверка на bottom коллекцию
          if (childName.includes('bottom') || 
              childName.includes('base') ||
              childName.includes('lower') ||
              childName === 'bottom') {
            modelBottom = child
            console.log('✓ Найдена BOTTOM коллекция:', child.name)
          }
          
          // Проверка на top коллекцию
          if (childName.includes('top') || 
              childName.includes('upper') ||
              childName.includes('roof') ||
              childName === 'top') {
            modelTop = child
            console.log('✓ Найдена TOP коллекция:', child.name)
          }
          
          // Устанавливаем свойства рендеринга для всех мешей
          if (child.isMesh) {
            child.renderOrder = 999
            
            // Включаем тени
            child.castShadow = true
            child.receiveShadow = true
            
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  mat.depthTest = true
                  mat.depthWrite = true
                })
              } else {
                child.material.depthTest = true
                child.material.depthWrite = true
              }
            }
          }
        })
        
        // Если не найдены по имени, пробуем найти по иерархии
        if (!modelBottom || !modelTop) {
          console.warn('Коллекции не найдены по имени, пробуем поиск по иерархии...')
          findCollectionsByHierarchy()
        }
        
        // Финальная проверка
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
        
        // Применяем HDR environment map к материалам окон
        if (environmentMap) {
          console.log('🎨 Применяем HDR environment map к материалам модели')
          updateModelMaterials(environmentMap)
        } else if (threeBox.scene.environment) {
          console.log('🎨 Применяем fallback environment map к материалам модели')
          updateModelMaterials(threeBox.scene.environment)
        }
        
        // Улучшаем материалы
        enhanceModelMaterials(model)
        
        // Добавляем модель в сцену
        console.log('➕ Добавляем модель в сцену...')
        threeBox.add(model)
        model.setCoords(origin)
        console.log('✓ Модель добавлена в сцену')

        // Добавляем плоскость земли для теней (опционально)
        addGroundPlane()
        
        // Добавляем обработчик клика на модель
        model.addTooltip = function() {} // Отключаем стандартный тултип
        
        // Устанавливаем, что модель кликабельна
        model.userData.selectEnabled = true
        
        // Привязываем обработчики
        handleModelClick = onModelClick
        handleMouseMove = onModelHover
        
        // Добавляем обработчики на карту
        mapBoxGl.on('click', handleModelClick)
        mapBoxGl.on('mousemove', handleMouseMove)
        
        // Скрываем лоадер после загрузки
        setTimeout(() => {
          isModelLoading.value = false
          
          // Отключаем обновление позиции лоадера
          mapBoxGl.off('move', updateLoaderPosition)
          mapBoxGl.off('zoom', updateLoaderPosition)
        }, 500)
        
        mapBoxGl.triggerRepaint()
        
        console.log('✓ Модель успешно загружена и добавлена в сцену')
      } else {
        console.error('✗ Не удалось загрузить модель')
        isModelLoading.value = false
        
        // Отключаем обновление позиции лоадера
        mapBoxGl.off('move', updateLoaderPosition)
        mapBoxGl.off('zoom', updateLoaderPosition)
      }
    })
  } catch (error) {
    console.error('✗ Ошибка при загрузке модели:', error)
    isModelLoading.value = false
    
    // Отключаем обновление позиции лоадера
    mapBoxGl.off('move', updateLoaderPosition)
    mapBoxGl.off('zoom', updateLoaderPosition)
  }
}
const initializeMap = () => {
  // Mapbox access token
  mapboxgl.accessToken = accessToken

  // Initialize map
  mapBoxGl = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/standard',
    center: origin,
    zoom: 16,
    pitch: 45,
    bearing: 0,
    antialias: true,
    scrollZoom: true,
    dragRotate: false // Отключаем стандартное вращение
  })
  
  // Реализуем собственное вращение правой кнопкой мыши с замедленной скоростью
  const rotateSpeed = 0.5 // Коэффициент замедления (0.12 = очень медленное вращение)
  
  let isDragging = false
  let lastX = 0
  let lastY = 0
  
  mapBoxGl.getCanvas().addEventListener('mousedown', (e) => {
    if (e.button === 2) { // Правая кнопка мыши
      isDragging = true
      lastX = e.clientX
      lastY = e.clientY
      mapBoxGl.getCanvas().style.cursor = 'grab'
      e.preventDefault()
    }
  })
  
  mapBoxGl.getCanvas().addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastX
      const deltaY = e.clientY - lastY
      
      // Инвертированное вращение: мышь вправо = карта вправо, мышь вверх = карта вверх
      const bearing = mapBoxGl.getBearing() + (deltaX * rotateSpeed)
      const pitch = mapBoxGl.getPitch() - (deltaY * rotateSpeed * 0.3)
      
      mapBoxGl.setBearing(bearing)
      mapBoxGl.setPitch(Math.max(0, Math.min(85, pitch))) // Ограничиваем pitch
      
      lastX = e.clientX
      lastY = e.clientY
      e.preventDefault()
    }
  })
  
  mapBoxGl.getCanvas().addEventListener('mouseup', (e) => {
    if (e.button === 2) {
      isDragging = false
      mapBoxGl.getCanvas().style.cursor = ''
    }
  })
  
  // Отключаем контекстное меню при правой кнопке мыши
  mapBoxGl.getCanvas().addEventListener('contextmenu', (e) => {
    e.preventDefault()
  })
  
  // Обработчик ресайза для правильного обновления пропорций
  mapBoxGl.on('resize', () => {
    if (threeBox && threeBox.renderer) {
      const canvas = mapBoxGl.getCanvas()
      threeBox.renderer.setSize(canvas.width, canvas.height)
    }
  })

  // Configure map when style loads
  mapBoxGl.once('style.load', () => {
    console.log("Стиль карты загружен")

    // Set map environment
    mapBoxGl.setConfigProperty('basemap', 'lightPreset', 'day')

    // Add fog effect for depth
    mapBoxGl.setFog({
      'color': 'rgb(186, 210, 235)',
      'high-color': 'rgb(36, 92, 223)',
      'horizon-blend': 0.02,
      'space-color': 'rgb(11, 11, 25)',
      'star-intensity': 0.6
    })

    // Add sky layer with realistic atmosphere
    if (!mapBoxGl.getLayer('sky')) {
    mapBoxGl.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 85.0],
            'sky-atmosphere-sun-intensity': 10,
            'sky-atmosphere-color': 'rgba(135, 206, 235, 1)',
            'sky-atmosphere-halo-color': 'rgba(255, 255, 255, 0.5)',
            'sky-gradient-center': [0, 0],
            'sky-gradient-radius': 90,
            'sky-gradient': [
                'interpolate',
                ['linear'],
                ['sky-radial-progress'],
                0.8, 'rgba(135, 206, 235, 1)',
                1, 'rgba(255, 255, 255, 1)'
            ],
            'sky-opacity': [
                'interpolate',
                ['exponential', 0.1],
                ['zoom'],
                5, 0,
                6, 1
            ]
        }
    });
    }
    
    // Находим первый symbol layer для вставки 3D слоя перед ним
    const layers = mapBoxGl.getStyle().layers
    let firstSymbolId
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === 'symbol') {
        firstSymbolId = layers[i].id
        break
      }
    }
    
// Проверяем, не существует ли уже слой
if (!mapBoxGl.getLayer('custom-threebox-layer')) {
  // Добавляем custom 3D layer ПЕРЕД первым symbol layer
  mapBoxGl.addLayer({
    id: 'custom-threebox-layer',
    type: 'custom',
    renderingMode: '3d',
    onAdd: function(map, gl) {
      add3DModel()
    },
    render: function(gl, matrix) {
      if (threeBox) {
        // Обновляем позицию света перед рендером
        updateSunLightPosition()
        
        // Обновляем матрицы перед рендером
        if (model) {
          model.updateMatrixWorld(true)
        }
        
        // Сбрасываем состояние WebGL перед рендером
        if (threeBox.renderer) {
          threeBox.renderer.resetState()
        }
        
        threeBox.update()
        mapBoxGl.triggerRepaint()
      }
    },
    // Добавляем метод onRemove для правильной очистки
    onRemove: function() {
      if (threeBox) {
        threeBox.clear()
      }
    }
  }, firstSymbolId)   
  console.log('Custom 3D layer добавлен перед symbol layer:', firstSymbolId)
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

// Lifecycle
onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  // Удаляем обработчики событий
  if (mapBoxGl) {
    if (handleModelClick) {
      mapBoxGl.off('click', handleModelClick)
    }
    if (handleMouseMove) {
      mapBoxGl.off('mousemove', handleMouseMove)
    }
    // Удаляем обработчик ресайза
    mapBoxGl.off('resize')
  }
  
  if (threeBox) {
    threeBox = null
  }
  
  if (mapBoxGl) {
    mapBoxGl.remove()
  }
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
