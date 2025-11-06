# Дизайн-система Futurebox

## 🎨 Цветовая палитра

### Основные цвета
- **Primary (Акцентный)**: `#2a9648` - Фирменный зеленый цвет Futurebox
  - Dark: `#248a3f`
  - Light: `#34a854`

### Нейтральные цвета
- **Space**: `#1D1D1D` - Самый темный
- **Dark**: `#444444` - Текст по умолчанию
- **Medium**: `#666666`
- **Light**: `#999999`

### Поверхности
- **Glass**: `rgba(255, 255, 255, 0.6)` - Полупрозрачный фон с glassmorphism
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

### BaseCard
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

