/**
 * Mock данные для панели фильтров
 */

/**
 * Диапазоны значений для фильтров
 */
export const filterRanges = {
  // Цена в рублях
  price: {
    min: 12420000,  // 12.42 млн
    max: 26420000   // 26.42 млн
  },
  
  // Площадь в м²
  area: {
    min: 34,
    max: 193
  },
  
  // Этажность
  floor: {
    min: 1,
    max: 25
  }
}

/**
 * Опции для выбора количества комнат
 */
export const roomsOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 }
]

/**
 * Опции особенностей квартир
 */
export const featuresOptions = [
  { label: 'White-box', value: 'white-box' },
  { label: 'Готовая отделка', value: 'turnkey' },
  { label: 'Раздельный санузел', value: 'separate-bathroom' },
  { label: 'Терраса', value: 'terrace' },
  { label: 'Резиденция', value: 'residence' },
  { label: 'Гардеробная', value: 'wardrobe' }
]

/**
 * Дефолтные значения фильтров
 */
export const defaultFilters = {
  rooms: 1,
  price: [filterRanges.price.min, filterRanges.price.max],
  area: [filterRanges.area.min, filterRanges.area.max],
  floor: [filterRanges.floor.min, filterRanges.floor.max],
  features: []
}

/**
 * Примеры различных пресетов фильтров
 */
export const filterPresets = {
  // Бюджетные однокомнатные
  budget: {
    rooms: 1,
    price: [12420000, 15000000],
    area: [34, 50],
    floor: [1, 10],
    features: ['white-box']
  },
  
  // Премиум двухкомнатные
  premium: {
    rooms: 2,
    price: [20000000, 26420000],
    area: [70, 100],
    floor: [15, 25],
    features: ['turnkey', 'separate-bathroom', 'wardrobe']
  },
  
  // Семейные трехкомнатные
  family: {
    rooms: 3,
    price: [18000000, 24000000],
    area: [90, 130],
    floor: [5, 20],
    features: ['turnkey', 'separate-bathroom', 'terrace', 'wardrobe']
  },
  
  // Элитные четырехкомнатные
  elite: {
    rooms: 4,
    price: [24000000, 26420000],
    area: [120, 193],
    floor: [20, 25],
    features: ['turnkey', 'separate-bathroom', 'terrace', 'residence', 'wardrobe']
  }
}

