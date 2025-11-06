/**
 * Mock данные для здания и квартир
 */

// Картинка здания (placeholder)
const buildingImagePlaceholder = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'

// Картинка плана квартиры (placeholder)
const apartmentPlanPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect fill="%23f5f5f5" width="80" height="80"/%3E%3Cpath d="M10 10 L70 10 L70 70 L10 70 Z M10 40 L30 40 M50 40 L70 40" stroke="%23999" stroke-width="2" fill="none"/%3E%3C/svg%3E'

/**
 * Данные здания
 */
export const buildingMockData = {
  id: 'future-residence-1',
  title: 'Future Residence',
  developer: 'Futurebox Development',
  imageSrc: buildingImagePlaceholder,
  
  // Основная информация (badges)
  info: [
    'от 12,5 млн',
    'III кв. 2027',
    '199 квартир'
  ],
  
  // Метро
  metro: {
    station: 'Фрунзенская',
    lineColor: '#fc574d', // Красная линия
    walkTime: 15
  },
  
  // Удобства (amenities)
  amenities: [
    'Паркинг',
    'Фитнес',
    'Детская площадка',
    'Консьерж'
  ],
  
  // Контакты
  phone: '+7727123-45-67',
  email: 'sales@fb.kz'
}

/**
 * Данные квартир
 */
export const apartmentsMockData = [
  // Однокомнатные
  {
    id: 'apt-1-1',
    rooms: 1,
    area: 52,
    description: '1 спальня, гостиная-кухня, санузел',
    imageSrc: apartmentPlanPlaceholder,
    features: [
      { label: '3Д-план', highlighted: true },
      { label: 'Панорамные окна', highlighted: false },
      { label: 'Балкон', highlighted: false }
    ]
  },
  {
    id: 'apt-1-2',
    rooms: 1,
    area: 48,
    description: '1 спальня, гостиная-кухня, санузел',
    imageSrc: apartmentPlanPlaceholder,
    features: [
      { label: '3Д-план', highlighted: true },
      { label: 'Панорамные окна', highlighted: false },
      { label: 'Встроенная кухня', highlighted: false }
    ]
  },
  {
    id: 'apt-1-3',
    rooms: 1,
    area: 55,
    description: '1 спальня, гостиная-кухня, санузел',
    imageSrc: apartmentPlanPlaceholder,
    features: [
      { label: '3Д-план', highlighted: true },
      { label: 'Балкон', highlighted: false },
      { label: 'Встроенная кухня', highlighted: false }
    ]
  },
  
  // Двухкомнатные
  {
    id: 'apt-2-1',
    rooms: 2,
    area: 72,
    description: '2 спальни, гостиная-кухня, санузел',
    imageSrc: apartmentPlanPlaceholder,
    features: [
      { label: '3Д-план', highlighted: true },
      { label: 'Панорамные окна', highlighted: false },
      { label: 'Балкон', highlighted: false },
      { label: 'Встроенная кухня', highlighted: false }
    ]
  },
  {
    id: 'apt-2-2',
    rooms: 2,
    area: 68,
    description: '2 спальни, гостиная-кухня, 2 санузла',
    imageSrc: apartmentPlanPlaceholder,
    features: [
      { label: '3Д-план', highlighted: true },
      { label: 'Панорамные окна', highlighted: false },
      { label: 'Встроенная кухня', highlighted: false }
    ]
  },
  
  // Трехкомнатные
  {
    id: 'apt-3-1',
    rooms: 3,
    area: 95,
    description: '3 спальни, гостиная-кухня, 2 санузла',
    imageSrc: apartmentPlanPlaceholder,
    features: [
      { label: '3Д-план', highlighted: true },
      { label: 'Панорамные окна', highlighted: false },
      { label: 'Балкон', highlighted: false },
      { label: 'Встроенная кухня', highlighted: false },
      { label: 'Гардеробная', highlighted: false }
    ]
  },
  {
    id: 'apt-3-2',
    rooms: 3,
    area: 102,
    description: '3 спальни, гостиная-кухня, 2 санузла, кладовая',
    imageSrc: apartmentPlanPlaceholder,
    features: [
      { label: '3Д-план', highlighted: true },
      { label: 'Панорамные окна', highlighted: false },
      { label: '2 балкона', highlighted: false },
      { label: 'Встроенная кухня', highlighted: false }
    ]
  },
  
  // Четырехкомнатные
  {
    id: 'apt-4-1',
    rooms: 4,
    area: 125,
    description: '4 спальни, гостиная-кухня, 3 санузла',
    imageSrc: apartmentPlanPlaceholder,
    features: [
      { label: '3Д-план', highlighted: true },
      { label: 'Панорамные окна', highlighted: false },
      { label: 'Балкон', highlighted: false },
      { label: 'Встроенная кухня', highlighted: false },
      { label: 'Гардеробная', highlighted: false },
      { label: 'Кладовая', highlighted: false }
    ]
  },
  {
    id: 'apt-4-2',
    rooms: 4,
    area: 135,
    description: '4 спальни, гостиная-кухня, 3 санузла, кабинет',
    imageSrc: apartmentPlanPlaceholder,
    features: [
      { label: '3Д-план', highlighted: true },
      { label: 'Панорамные окна', highlighted: false },
      { label: '2 балкона', highlighted: false },
      { label: 'Встроенная кухня', highlighted: false },
      { label: 'Гардеробная', highlighted: false }
    ]
  }
]

/**
 * Дополнительные данные зданий для расширения
 */
export const additionalBuildings = [
  {
    id: 'green-park-2',
    title: 'Green Park',
    developer: 'Futurebox Development',
    imageSrc: buildingImagePlaceholder,
    info: ['от 15 млн', 'IV кв. 2026', '250 квартир'],
    metro: {
      station: 'Алмалы',
      lineColor: '#0067a4',
      walkTime: 10
    },
    amenities: ['Паркинг', 'СПА-центр', 'Бассейн', 'Детская площадка'],
    phone: '+7727123-45-68',
    email: 'sales@fb.kz'
  },
  {
    id: 'sky-tower-3',
    title: 'Sky Tower',
    developer: 'Futurebox Development',
    imageSrc: buildingImagePlaceholder,
    info: ['от 20 млн', 'II кв. 2028', '180 квартир'],
    metro: {
      station: 'Байконур',
      lineColor: '#6fc13e',
      walkTime: 5
    },
    amenities: ['Паркинг', 'Фитнес', 'Консьерж', 'Коворкинг'],
    phone: '+7727123-45-69',
    email: 'sales@fb.kz'
  }
]

