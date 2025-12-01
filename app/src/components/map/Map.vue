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
import modelUrl from '@/assets/models/novator_5.1_V1.glb?url'
import environmentUrl from '@/assets/tex/environment.hdr?url'
import lefortovoImage from '@/assets/img/lefortovo.jpg'
import { useBuildingPanel } from '@/composables/useBuildingPanel'
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";


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

const DO_MERGE = true;
const clipEnabled = true;

// Map variables
let mapBoxGl = null
let origin = [56.028131, 54.760180]

let threeBox = null // Threebox instance

let modelRotation = 270
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
        // texture.repeat.set(16, 16)  // Попробуйте разные значения: 1.5, 2, 3, 4
        
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
            mat.envMapIntensity = 1.2
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
  sunLight.shadow.mapSize.width = 2048  // Было 8192
  sunLight.shadow.mapSize.height = 2048 // Было 8192
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
  
  // Обновляем позицию света только при необходимости
  updateSunLightPosition()
  
  // Рендерим сцену Three.js
  threeBox.update()
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

  let materialMap = new Map();
  let combinedCount = 0;

  function fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
  }

  // generates a unique hash for each material of type (MeshStandardMaterial or MeshPhysicalMaterial)
  // hashes will be equal if the materials are interchangeable in appearance (same map / color + same props)
  let getMaterialHash = (mat) => {
    if (!mat) return "null";

    const isStandard = mat.isMeshStandardMaterial;
    const isPhysical = mat.isMeshPhysicalMaterial;

    if (!isStandard && !isPhysical)
      throw new Error("Material type not supported");

    // serializers
    const sNum = v => (v ?? 0);
    const sColor = c => c ? `${c.r},${c.g},${c.b}` : "null";
    const sVec2 = v => v ? `${v.x},${v.y}` : "null";
    const sArr = a => a ? a.join(",") : "null";

    const sTexture = (t) => {
      if (!t) return "null";
      const img = t.image;
      const src = img && img.src ? img.src : "";
      return [
        src,
        sVec2(t.offset),
        sVec2(t.repeat),
        sNum(t.rotation),
        t.wrapS, t.wrapT,
        sNum(t.anisotropy)
      ].join("|");
    };

    // list of properties
    const commonScalarProps = [
      'roughness','metalness','emissiveIntensity','envMapIntensity',
      'aoMapIntensity','bumpScale','displacementScale','displacementBias',
      'lightMapIntensity','wireframeLinewidth','opacity','alphaTest',
      'polygonOffsetFactor','polygonOffsetUnits'
    ];

    const commonColorProps = [
      'color', 'emissive'
    ];

    const commonVec2Props = [
      'normalScale'
    ];

    const commonBoolEnumProps = [
      'side','flatShading','wireframe','transparent',
      'depthWrite','depthTest','colorWrite','fog','dithering',
      'polygonOffset','premultipliedAlpha','toneMapped','blending',
      'blendSrc','blendDst','blendEquation','blendSrcAlpha',
      'blendDstAlpha','blendEquationAlpha'
    ];

    const commonTextureProps = [
      'map','metalnessMap','roughnessMap','normalMap','aoMap','envMap',
      'bumpMap','displacementMap','alphaMap','emissiveMap','lightMap'
    ];

    const physicalScalarProps = [
      'clearcoat','clearcoatRoughness','sheen','sheenRoughness',
      'transmission','thickness','attenuationDistance','specularIntensity',
      'ior','reflectivity','iridescence','iridescenceIOR'
    ];

    const physicalColorProps = [
      'sheenColor','attenuationColor','specularColor'
    ];

    const physicalVec2Props = [
      'clearcoatNormalScale'
    ];

    const physicalTextureProps = [
      'clearcoatMap','clearcoatRoughnessMap','clearcoatNormalMap',
      'sheenColorMap','sheenRoughnessMap','transmissionMap','thicknessMap',
      'specularIntensityMap','specularColorMap','iridescenceMap',
      'iridescenceThicknessMap'
    ];

    // make single string
    const out = [];

    out.push(isPhysical ? "PHYSICAL" : "STANDARD");

    for (const p of commonScalarProps)
      out.push(`${p}:${sNum(mat[p])}`);

    for (const p of commonColorProps)
      out.push(`${p}:${sColor(mat[p])}`);

    for (const p of commonVec2Props)
      out.push(`${p}:${sVec2(mat[p])}`);

    for (const p of commonBoolEnumProps)
      out.push(`${p}:${mat[p]}`);

    for (const p of commonTextureProps)
      out.push(`${p}:${sTexture(mat[p])}`);

    // additional props for physical only
    if (isPhysical) {
      for (const p of physicalScalarProps)
        out.push(`${p}:${sNum(mat[p])}`);

      for (const p of physicalColorProps)
        out.push(`${p}:${sColor(mat[p])}`);

      for (const p of physicalVec2Props)
        out.push(`${p}:${sVec2(mat[p])}`);

      for (const p of physicalTextureProps)
        out.push(`${p}:${sTexture(mat[p])}`);

      // iridescenceThicknessRange is an array
      out.push(`iridescenceThicknessRange:${sArr(mat.iridescenceThicknessRange || [])}`);
    }

    // create combined hash
    const str = out.join(";");
    return fnv1a(str);
  };

  let hashTime = 0;
  
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

        model.updateMatrixWorld(true, true);

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
            child.frustumCulled = false
            
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material]

              let i = 0;
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

                // group all children / meshes in groups, based on whether their materials are interchangeable
                // -> make sure to combine materials, which are different material objects, but look the same (e.g. copies in blender)
                let hashStart = Date.now();
                let hash = getMaterialHash(mat);
                let hashEnd = Date.now();
                hashTime += hashEnd - hashStart;

                let meshGroup;
                if (materialMap.has(hash)) {
                  meshGroup = materialMap.get(hash);
                  combinedCount++;
                } else {
                  meshGroup = {
                    meshes: [],
                    material: child.material
                  };
                  materialMap.set(hash, meshGroup);
                }

                if (Array.isArray(child.material))
                  child.material[i] = meshGroup.material;
                else
                  child.material = meshGroup.material;

                meshGroup.meshes.push({
                  mesh: child,
                  transform: child.matrixWorld
                });

                i++;
              })
            }
          }
        })

        if (DO_MERGE) {
          let startMerge = Date.now();
          // combine non-unique meshes: merge their geometry into a single object to save on draw calls
          materialMap.forEach(meshGroup => {

            let geometries = [];
            meshGroup.meshes.forEach(meshData => {
              meshData.mesh.parent.remove(meshData.mesh);

              let geom = meshData.mesh.geometry.clone();
              geom.applyMatrix4(meshData.transform);

              geometries.push(geom);
            });

            // merge geometries
            const mergedGeometry = mergeGeometries(geometries, false);
            if (!mergedGeometry) return;

            let material = meshGroup.material;
            const mergedMesh = new THREE.Mesh(mergedGeometry, material);
            mergedMesh.name = `Merged_${material.name || material.uuid}`;

            // no transforms (they are already applied to the geometry of each object)
            mergedMesh.matrixAutoUpdate = true;
            mergedMesh.position.set(0, 0, 0);
            mergedMesh.rotation.set(0, 0, 0);
            mergedMesh.scale.set(1, 1, 1);

            mergedMesh.renderOrder = 1
            mergedMesh.castShadow = true
            mergedMesh.receiveShadow = true
            mergedMesh.frustumCulled = false

            // add back to model
            model.add(mergedMesh);

            mergedMesh.geometry.computeBoundingSphere();
            mergedMesh.geometry.computeBoundingBox();
          });

          let time = Date.now() - startMerge;

          console.log("Mesh Stats: ");
          console.log("Unique: ", materialMap.size);
          console.log("Combined: ", combinedCount);
          console.log("Hashing Took:", hashTime, "ms");
          console.log("Combining Took:", time, "ms");
        }

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
    zoom: 17.3,
    pitch: 45,
    bearing: -115,
    antialias: true,
    scrollZoom: true,
    dragRotate: false
  })
  
  // Сохраняем ссылку на canvas
  canvas = mapBoxGl.getCanvas()
  
  // DEBUG lars
  // mapBoxGl.showTileBoundaries = true;
  // mapBoxGl.showTerrainWireframe = true;
  // mapBoxGl.showOverdrawInspector = true;
  // mapBoxGl.showPaddingBounds = true;
  // mapBoxGl.showCollisionBoxes = true;

  setTimeout(() => {
  mapBoxGl.getStyle().layers
    .filter(l => l.type === 'symbol')
    .forEach(l => map.setLayoutProperty(l.id, 'visibility', 'none'));
    mapBoxGl.setTerrain(null);
    mapBoxGl.setPaintProperty('custom-threebox-layer', 'fill-extrusion-opacity', 0);
  }, 5000);
  
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

    // Set map environment
    mapBoxGl.setConfigProperty('basemap', 'lightPreset', 'dusk');
    
    const layers = mapBoxGl.getStyle().layers
    let firstSymbolId
    for (const layer of layers) {
      if (layer.type === 'symbol') {
        firstSymbolId = layer.id
        break
      }
    }

    if (clipEnabled) {
      mapBoxGl.addSource('clip-polygon-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [56.027, 54.759],  // Юго-западный угол
              [56.027, 54.762],  // Северо-западный угол
              [56.030, 54.762],  // Северо-восточный угол
              [56.030, 54.759],  // Юго-восточный угол
              [56.027, 54.759]   // Замыкаем полигон
            ]]
          }
        }
      });
  
      mapBoxGl.addLayer({
        id: 'clip-layer',
        type: 'clip',
        source: 'clip-polygon-source',
        layout: {
          'clip-layer-types': ['model', 'symbol']
        }
      });
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

          if (window.rTime) {
            let dTime = Date.now() - window.rTime;
            if (dTime < 300 && dTime > 0) {
              let fps = (1000 / dTime);
              window.cFPS = (window.cFPS * 0.95 + fps * 0.05) || fps;
              console.log("FPS:", fps.toFixed(0), "AVG: ", window.cFPS.toFixed(0));
              if (fps < 10) {
                console.log("Slow frame", {
                      isMoving: mapBoxGl.isMoving(),
                      isZooming: mapBoxGl.isZooming(),
                      isRotating: mapBoxGl.isRotating(),
                      center: mapBoxGl.getCenter(),
                      pitch: mapBoxGl.getPitch(),
                      bearing: mapBoxGl.getBearing()
                    });
              }
            }
          }
          window.rTime = Date.now();
          // console.log(threeBox.renderer.info)
          
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

// setTimeout(() => {
// function animate() {
//   mapBoxGl.triggerRepaint();
//   requestAnimationFrame(animate);
// }
// animate();
// }, 3000);

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
