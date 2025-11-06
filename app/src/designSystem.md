# Дизайн-система Futurebox

## 🎨 Цветовая палитра

### Основные цвета
- **Primary (Акцентный)**: `#2a9648` - Фирменный зеленый цвет Futurebox
  - Dark: `#248a3f`
  - Light: `#34a854`

### Акцентные цвета
- **Green**: `#2a9648` - Основной зеленый
- **Green Light**: `#c1f9d0` - Светло-зеленый для badges
- **Red**: `#fc574d` - Красный (для линий метро)

### Нейтральные цвета
- **Space**: `#1D1D1D` - Самый темный
- **Black**: `#151515` - Черный текст
- **Dark**: `#444444` - Темно-серый
- **Dark Gray**: `#727272` - Серый текст
- **Gray**: `#a7a7a7` - Средне-серый
- **Medium**: `#666666` - Серый
- **Light**: `#f2f2f2` - Светло-серый фон
- **Lighter**: `#999999` - Светлый серый

### Поверхности
- **Glass**: `rgba(255, 255, 255, 0.6)` - Полупрозрачный светлый
- **Glass Dark**: `rgba(255, 255, 255, 0.1)` - Полупрозрачный темный
- **Glass Green**: `rgba(42, 150, 72, 0.5)` - Полупрозрачный зеленый
- **White**: `#FFFFFF`

## 📝 Типографика

Основной шрифт: **Inter** с fallback на системные шрифты.

### Размеры текста
- **body**: 16px / 1.6 / 400
- **body-sm**: 14px / 1.5 / 400
- **body-lg**: 18px / 1.6 / 400
- **heading-1**: 48px / 1.2 / 700
- **heading-2**: 36px / 1.3 / 600
- **heading-3**: 24px / 1.4 / 600
- **heading-4**: 20px / 1.5 / 600

## 🎯 Компоненты

### Базовые компоненты

#### BaseContainer
Адаптивный контейнер-лейаут с responsive отступами.

**Props:**
- `maxWidth` - максимальная ширина (full, screen-xl, screen-lg)
- `padding` - горизонтальные отступы (responsive по умолчанию)
- `paddingY` - вертикальные отступы
- `center` - центрирование контента

#### BaseCard
Карточка с glassmorphism эффектом (размытие 30px, полупрозрачный фон).

**Props:**
- `hoverable` - hover эффект с увеличенной тенью
- `padding` - размер отступов (none, sm, md, lg, xl)
- `customClass` - дополнительные классы

**Использование:**
\`\`\`vue
<BaseCard padding="lg" hoverable>
  Контент карточки
</BaseCard>
\`\`\`

### BaseText
Универсальный текстовый компонент.

**Props:**
- `tag` - HTML тег (p, span, div, h1-h6)
- `variant` - стиль текста (body, body-sm, body-lg, tagline, heading-1-4)
- `color` - цвет (default, primary, space, dark, medium, light, white)
- `align` - выравнивание (left, center, right, justify)
- `nowrap` - запретить перенос строк

**Использование:**
\`\`\`vue
<BaseText variant="heading-2" color="primary">
  Заголовок
</BaseText>

<BaseText variant="body" color="dark">
  Текст параграфа
</BaseText>
\`\`\`

### BaseButton
Кнопка с состояниями (hover, active, focus, loading, disabled).

**Props:**
- `variant` - стиль (primary, secondary, ghost)
- `type` - тип кнопки (button, submit, reset)
- `size` - размер (sm, md, lg)
- `loading` - состояние загрузки со спиннером
- `disabled` - отключить кнопку
- `block` - растянуть на всю ширину

**Использование:**
\`\`\`vue
<BaseButton 
  variant="primary" 
  size="md"
  @click="handleClick"
>
  Отправить запрос
</BaseButton>

<BaseButton 
  variant="secondary" 
  loading
  loading-text="Отправка..."
>
  Сохранить
</BaseButton>
\`\`\`

#### BaseBadge
Универсальный badge компонент для меток и тегов.

**Props:**
- `variant` - стиль (default, primary, secondary, success, metro)
- `size` - размер (sm, md)

**Варианты:**
- `default` - полупрозрачный темный (для информации)
- `primary` - зеленый полупрозрачный (для удобств)
- `secondary` - светло-серый (для features)
- `success` - светло-зеленый (для highlighted)

**Использование:**
\`\`\`vue
<BaseBadge variant="default">от 12,5 млн</BaseBadge>
<BaseBadge variant="primary">Паркинг</BaseBadge>
<BaseBadge variant="secondary">Балкон</BaseBadge>
<BaseBadge variant="success">3Д-план</BaseBadge>
\`\`\`

#### MetroBadge
Специализированный badge для станций метро с цветом линии.

**Props:**
- `stationName` - название станции
- `metroLineColor` - цвет линии метро (hex)
- `walkTime` - время пешком (минуты)
- `size` - размер (sm, md)

**Использование:**
\`\`\`vue
<MetroBadge
  station-name="Фрунзенская"
  metro-line-color="#fc574d"
  :walk-time="15"
/>
\`\`\`

### Комплексные компоненты

#### BuildingPanel
Главный компонент панели здания с информацией и списком квартир.

**Props:**
- `building` - данные здания (объект)
- `apartments` - массив квартир

**События:**
- `@call-request` - запрос звонка
- `@view-all` - показать все квартиры

**Использование:**
\`\`\`vue
<BuildingPanel
  :building="buildingData"
  :apartments="apartmentsData"
  @call-request="handleCallRequest"
  @view-all="handleViewAll"
/>
\`\`\`

#### ApartmentCard
Карточка квартиры с планом и характеристиками.

**Props:**
- `apartment` - данные квартиры (объект с rooms, area, description, features)

#### ApartmentTabs
Табы для фильтрации квартир по количеству комнат.

**Props:**
- `modelValue` - активный таб (v-model)
- `roomTypes` - массив типов комнат [1, 2, 3, 4]

**События:**
- `@update:modelValue` - изменение таба
- `@view-all` - показать все

## 🎭 Эффекты

### Glassmorphism
Эффект стеклянного размытия для карточек:
- Backdrop blur: 30px
- Background: rgba(255, 255, 255, 0.6)
- Border radius: 12px

### Тени
- **card**: Базовая тень карточки
- **card-hover**: Увеличенная тень при hover
- **button**: Тень кнопки
- **button-hover**: Увеличенная тень кнопки при hover

## 🔧 Использование Tailwind @apply

В дизайн-системе максимально используется `@apply` для переиспользования стилей:

\`\`\`css
/* В main.css */
.btn-primary {
  @apply btn bg-primary text-white
         hover:bg-primary-dark hover:-translate-y-px
         active:translate-y-0
         focus:outline-primary;
}
\`\`\`

## 📦 Импорт компонентов

\`\`\`javascript
// Импорт всех базовых компонентов
import { BaseCard, BaseText, BaseButton } from '@/components/base'

// Или по отдельности
import BaseCard from '@/components/base/BaseCard.vue'
\`\`\`

## 🚀 Быстрый старт

1. Все базовые компоненты находятся в `src/components/base/`
2. Токены дизайна настроены в `tailwind.config.js`
3. Глобальные стили с `@apply` в `src/assets/styles/main.css`
4. Используйте базовые компоненты вместо нативных HTML элементов

## 📋 Checklist для новых компонентов

- [ ] Использовать базовые компоненты (BaseCard, BaseText, BaseButton)
- [ ] Применять цвета из палитры (primary, neutral)
- [ ] Использовать типографические токены
- [ ] Добавить hover/active/focus состояния для интерактивных элементов
- [ ] Обеспечить адаптивность (mobile-first подход)
- [ ] Использовать `@apply` для переиспользования стилей

