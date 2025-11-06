# Composables

Переиспользуемые композиционные функции для Vue 3 Composition API.

## useBreakpoints

Определение размера экрана и адаптивных breakpoints.

### Использование

```javascript
import { useBreakpoints } from '@/composables/useBreakpoints'

export default {
  setup() {
    const { isMobile, isTablet, isDesktop } = useBreakpoints()
    
    return {
      isMobile,
      isTablet,
      isDesktop
    }
  }
}
```

### API

#### Возвращаемые значения

| Свойство | Тип | Описание |
|----------|-----|----------|
| `windowWidth` | Ref\<Number\> | Текущая ширина окна |
| `breakpoints` | Object | Объект с breakpoints (sm: 640, md: 768, lg: 1024, xl: 1200, 2xl: 1536) |
| `isMobile` | ComputedRef\<Boolean\> | < 768px |
| `isTablet` | ComputedRef\<Boolean\> | >= 768px && < 1200px |
| `isDesktop` | ComputedRef\<Boolean\> | >= 1200px |
| `isSmaller(breakpoint)` | Function | Проверка меньше указанного breakpoint |
| `isLarger(breakpoint)` | Function | Проверка больше или равно breakpoint |
| `isBetween(min, max)` | Function | Проверка между двумя breakpoints |

### Примеры

#### Базовое использование

```vue
<template>
  <div>
    <div v-if="isMobile">Мобильная версия</div>
    <div v-else-if="isTablet">Планшет</div>
    <div v-else>Десктоп</div>
  </div>
</template>

<script setup>
import { useBreakpoints } from '@/composables/useBreakpoints'

const { isMobile, isTablet, isDesktop } = useBreakpoints()
</script>
```

#### Точечные проверки

```vue
<script setup>
import { computed } from 'vue'
import { useBreakpoints } from '@/composables/useBreakpoints'

const { isSmaller, isLarger, isBetween } = useBreakpoints()

// Меньше 1024px
const isSmallScreen = isSmaller('lg')

// Больше или равно 1200px
const isLargeScreen = isLarger('xl')

// Между 768px и 1200px
const isMediumScreen = isBetween('md', 'xl')
</script>
```

#### Адаптивные свойства компонента

```vue
<template>
  <BaseCard :padding="cardPadding">
    <BaseButton :block="isMobile">
      Кнопка
    </BaseButton>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import { useBreakpoints } from '@/composables/useBreakpoints'

const { isMobile, isTablet } = useBreakpoints()

const cardPadding = computed(() => {
  if (isMobile.value) return 'sm'
  if (isTablet.value) return 'md'
  return 'lg'
})
</script>
```

#### Текущая ширина экрана

```vue
<template>
  <div>
    Ширина экрана: {{ windowWidth }}px
  </div>
</template>

<script setup>
import { useBreakpoints } from '@/composables/useBreakpoints'

const { windowWidth } = useBreakpoints()
</script>
```

## Breakpoints

Значения breakpoints соответствуют Tailwind CSS:

- **sm**: 640px - Маленькие телефоны (landscape)
- **md**: 768px - Планшеты
- **lg**: 1024px - Маленькие ноутбуки
- **xl**: 1200px - Десктопы
- **2xl**: 1536px - Большие экраны

## Best Practices

1. ✅ Используйте composable вместо дублирования логики в компонентах
2. ✅ Деструктурируйте только нужные свойства для оптимизации
3. ✅ Используйте computed для динамических свойств на основе breakpoints
4. ❌ Не создавайте несколько экземпляров в одном компоненте

```javascript
// ✅ Хорошо
const { isMobile, isTablet } = useBreakpoints()

// ❌ Плохо (избыточно)
const breakpoints1 = useBreakpoints()
const breakpoints2 = useBreakpoints()
```

