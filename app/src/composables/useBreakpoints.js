import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Composable для определения размера экрана
 * @returns {Object} - объект с breakpoints и текущей шириной
 */
export function useBreakpoints() {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 0)

  // Breakpoints
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1200,
    '2xl': 1536
  }

  // Computed свойства для различных размеров экрана
  const isMobile = computed(() => windowWidth.value < breakpoints.md)
  const isTablet = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.xl)
  const isDesktop = computed(() => windowWidth.value >= breakpoints.xl)
  
  // Точечные проверки
  const isSmaller = (breakpoint) => computed(() => windowWidth.value < breakpoints[breakpoint])
  const isLarger = (breakpoint) => computed(() => windowWidth.value >= breakpoints[breakpoint])
  const isBetween = (min, max) => computed(() => 
    windowWidth.value >= breakpoints[min] && windowWidth.value < breakpoints[max]
  )

  // Обработчик изменения размера
  const handleResize = () => {
    windowWidth.value = window.innerWidth
  }

  // Lifecycle hooks
  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
    }
  })

  return {
    windowWidth,
    breakpoints,
    isMobile,
    isTablet,
    isDesktop,
    isSmaller,
    isLarger,
    isBetween
  }
}

