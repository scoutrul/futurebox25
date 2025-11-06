# Компоненты Futurebox

## Структура

```
components/
├── base/                    # Базовые компоненты дизайн-системы
│   ├── BaseCard.vue        # Карточка с glassmorphism
│   ├── BaseText.vue        # Типографика
│   ├── BaseButton.vue      # Кнопки
│   ├── BaseContainer.vue   # Контейнер-лейаут
│   ├── BaseBadge.vue       # Badge компонент
│   ├── MetroBadge.vue      # Badge для метро
│   ├── ButtonGroup.vue     # Группа кнопок
│   ├── RangeSlider.vue     # Ползунок диапазона
│   └── FilterSection.vue   # Секция фильтра
├── building/               # Компоненты здания
│   ├── BuildingPanel.vue   # Панель здания (главный компонент)
│   ├── BuildingHeader.vue  # Заголовок здания с информацией
│   └── BuildingMap.vue     # Карта здания
├── apartments/             # Компоненты квартир
│   ├── ApartmentCard.vue   # Карточка квартиры
│   └── ApartmentTabs.vue   # Табы фильтрации квартир
├── layout/                 # Компоненты интерфейса и разметки
│   └── TopBarGuest.vue     # Шапка сайта
├── filters/                # Компоненты фильтров
│   └── FiltersPanel.vue    # Панель фильтров
└── README.md               # Документация
```

## Примеры использования

### BuildingPanel

Главный компонент для отображения информации о здании и списка квартир.

```vue
<template>
  <BuildingPanel
    :building="buildingData"
    :apartments="apartmentsData"
    @call-request="handleCallRequest"
    @view-all="handleViewAll"
  />
</template>

<script setup>
import BuildingPanel from '@/components/building/BuildingPanel.vue'
import { buildingMockData, apartmentsMockData } from '@/mocks/buildingData'

const buildingData = buildingMockData
const apartmentsData = apartmentsMockData

const handleCallRequest = (building) => {
  console.log('Заказать звонок:', building)
}

const handleViewAll = (building) => {
  console.log('Показать все квартиры:', building)
}
</script>
```

### BaseBadge

Универсальный компонент badge с разными вариантами.

```vue
<template>
  <!-- Обычный badge (glass dark) -->
  <BaseBadge variant="default">от 12,5 млн</BaseBadge>
  
  <!-- Зеленый badge (удобства) -->
  <BaseBadge variant="primary">Паркинг</BaseBadge>
  
  <!-- Серый badge -->
  <BaseBadge variant="secondary">Балкон</BaseBadge>
  
  <!-- Светло-зеленый badge -->
  <BaseBadge variant="success">3Д-план</BaseBadge>
</template>
```

**Варианты:**
- `default` - полупрозрачный темный (для информации о здании)
- `primary` - зеленый полупрозрачный (для удобств)
- `secondary` - светло-серый (для features квартир)
- `success` - светло-зеленый (для highlighted features)
- `metro` - для MetroBadge

### MetroBadge

Специализированный badge для отображения станции метро.

```vue
<template>
  <MetroBadge
    station-name="Фрунзенская"
    metro-line-color="#fc574d"
    :walk-time="15"
  />
</template>
```

### ApartmentCard

Карточка квартиры с изображением и характеристиками.

```vue
<template>
  <ApartmentCard :apartment="apartmentData" />
</template>

<script setup>
const apartmentData = {
  id: 'apt-1',
  rooms: 1,
  area: 52,
  description: '1 спальня, гостиная-кухня, санузел',
  imageSrc: '/path/to/image.jpg',
  features: [
    { label: '3Д-план', highlighted: true },
    { label: 'Панорамные окна', highlighted: false },
    { label: 'Балкон', highlighted: false }
  ]
}
</script>
```

### ApartmentTabs

Табы для фильтрации квартир по количеству комнат.

```vue
<template>
  <ApartmentTabs
    v-model="selectedRooms"
    :room-types="[1, 2, 3, 4]"
    @view-all="handleViewAll"
  />
</template>

<script setup>
import { ref } from 'vue'

const selectedRooms = ref(1)

const handleViewAll = () => {
  console.log('Показать все квартиры')
}
</script>
```

### BuildingHeader

Заголовок панели здания с фоном, информацией и CTA.

```vue
<template>
  <BuildingHeader
    :building="buildingData"
    @call-request="handleCallRequest"
  />
</template>
```

## Структура данных

### Building Object

```javascript
{
  id: 'unique-id',
  title: 'Название ЖК',
  developer: 'Застройщик',
  imageSrc: '/path/to/image.jpg',
  info: ['от 12,5 млн', 'III кв. 2027', '199 квартир'],
  metro: {
    station: 'Фрунзенская',
    lineColor: '#fc574d',
    walkTime: 15
  },
  amenities: ['Паркинг', 'Фитнес', 'Детская площадка'],
  phone: '+7727123-45-67',
  email: 'sales@fb.kz'
}
```

### Apartment Object

```javascript
{
  id: 'unique-id',
  rooms: 1,                    // Количество комнат
  area: 52,                    // Площадь в м²
  description: 'Описание',     // Планировка
  imageSrc: '/path/to/plan.jpg',
  features: [
    { 
      label: '3Д-план', 
      highlighted: true        // Зеленый badge если true
    },
    { 
      label: 'Балкон', 
      highlighted: false       // Серый badge если false
    }
  ]
}
```

## Mock данные

Mock данные доступны в `@/mocks/buildingData.js`:

```javascript
import { buildingMockData, apartmentsMockData } from '@/mocks/buildingData'
```

## Адаптивность

Все компоненты следуют **mobile-first** подходу:

- 📱 **< 768px**: Мобильная версия (базовые стили)
- 💻 **768px - 1199px**: Планшеты (средние стили)
- 🖥 **≥ 1200px**: Десктоп (большие стили)

## Цветовая палитра

Обновленная палитра в `tailwind.config.js`:

- `accent-red`: `#fc574d` - Цвет линии метро
- `accent-green-light`: `#c1f9d0` - Светло-зеленый для badges
- `neutral-black`: `#151515` - Черный текст
- `neutral-dark-gray`: `#727272` - Темно-серый текст
- `neutral-gray`: `#a7a7a7` - Серый текст
- `neutral-light`: `#f2f2f2` - Светло-серый фон
- `surface-glass-dark`: `rgba(255, 255, 255, 0.1)` - Темное стекло
- `surface-glass-green`: `rgba(42, 150, 72, 0.5)` - Зеленое стекло

