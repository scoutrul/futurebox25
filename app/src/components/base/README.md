# Базовые компоненты дизайн-системы Futurebox

## Структура

```
base/
├── index.js          # Точка входа для импорта всех компонентов
├── BaseContainer.vue # Адаптивный контейнер-лейаут
├── BaseCard.vue      # Карточка с glassmorphism
├── BaseText.vue      # Типографика
└── BaseButton.vue    # Кнопки с состояниями
```

## Быстрый старт

### Импорт

```javascript
// Импорт всех компонентов
import { BaseContainer, BaseCard, BaseText, BaseButton } from '@/components/base'

// Или по отдельности
import BaseContainer from '@/components/base/BaseContainer.vue'
```

### Примеры использования

#### BaseContainer

```vue
<!-- Адаптивный контейнер с автоматическими отступами -->
<BaseContainer>
  Контент страницы
</BaseContainer>

<!-- Контейнер с максимальной шириной и центрированием -->
<BaseContainer max-width="screen-xl" center>
  Центрированный контент
</BaseContainer>

<!-- Контейнер с кастомными отступами -->
<BaseContainer padding="lg" padding-y="xl">
  Контент с большими отступами
</BaseContainer>
```

#### BaseCard

```vue
<!-- Простая карточка -->
<BaseCard>
  Контент
</BaseCard>

<!-- С hover эффектом и кастомным паддингом -->
<BaseCard hoverable padding="xl">
  Контент с hover эффектом
</BaseCard>
```

#### BaseText

```vue
<!-- Заголовок -->
<BaseText tag="h1" variant="heading-1" color="primary">
  Главный заголовок
</BaseText>

<!-- Обычный текст -->
<BaseText variant="body" color="dark">
  Текст параграфа
</BaseText>

<!-- Текст без переноса -->
<BaseText variant="tagline" nowrap>
  Технологии будущего дома
</BaseText>
```

#### BaseButton

```vue
<!-- Основная кнопка -->
<BaseButton variant="primary" @click="handleClick">
  Отправить
</BaseButton>

<!-- Кнопка с загрузкой -->
<BaseButton 
  variant="primary" 
  :loading="isLoading"
  loading-text="Отправка..."
>
  Сохранить
</BaseButton>

<!-- Вторичная кнопка -->
<BaseButton variant="secondary">
  Отмена
</BaseButton>

<!-- Растянутая кнопка -->
<BaseButton variant="primary" block>
  Во всю ширину
</BaseButton>
```

## Props API

### BaseContainer

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `maxWidth` | String | `'full'` | Максимальная ширина: full, screen-2xl, screen-xl, screen-lg |
| `padding` | String | `'responsive'` | Горизонтальные отступы: none, sm, md, lg, xl, responsive |
| `paddingY` | String | `'responsive'` | Вертикальные отступы: none, sm, md, lg, xl, responsive |
| `center` | Boolean | `false` | Центрировать контейнер |
| `customClass` | String | `''` | Дополнительные CSS классы |

> **responsive** - автоматически адаптирует отступы: `px-5 md:px-8 lg:px-16` для padding и `py-4 md:py-6 lg:py-8` для paddingY

### BaseCard

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `hoverable` | Boolean | `false` | Hover эффект с тенью |
| `padding` | String | `'md'` | Размер отступов: none, sm, md, lg, xl |
| `customClass` | String | `''` | Дополнительные CSS классы |

### BaseText

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `tag` | String | `'p'` | HTML тег элемента |
| `variant` | String | `'body'` | Вариант текста: body, body-sm, body-lg, tagline, heading-1-4 |
| `color` | String | `'default'` | Цвет: default, primary, space, dark, medium, light, white |
| `align` | String | `'left'` | Выравнивание: left, center, right, justify |
| `nowrap` | Boolean | `false` | Запретить перенос строк |
| `customClass` | String | `''` | Дополнительные CSS классы |

### BaseButton

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `variant` | String | `'primary'` | Вариант: primary, secondary, ghost |
| `type` | String | `'button'` | Тип: button, submit, reset |
| `size` | String | `'md'` | Размер: sm, md, lg |
| `loading` | Boolean | `false` | Состояние загрузки |
| `loadingText` | String | `'Загрузка...'` | Текст при загрузке |
| `disabled` | Boolean | `false` | Отключить кнопку |
| `block` | Boolean | `false` | Растянуть на всю ширину |
| `customClass` | String | `''` | Дополнительные CSS классы |

#### События

| Событие | Описание |
|---------|----------|
| `@click` | Клик по кнопке (не срабатывает если disabled или loading) |

## Расширение компонентов

Все компоненты поддерживают `customClass` для добавления дополнительных стилей:

```vue
<BaseCard custom-class="my-custom-styles">
  Контент
</BaseCard>
```

## Использование с Tailwind @apply

В компонентах активно используется `@apply` для переиспользования стилей из `main.css`:

```vue
<style scoped>
.my-container {
  @apply flex items-center gap-4 p-4;
}
</style>
```

## Best Practices

1. ✅ Используйте базовые компоненты вместо нативных HTML элементов
2. ✅ Применяйте токены дизайна из `tailwind.config.js`
3. ✅ Используйте `@apply` для повторяющихся стилей
4. ✅ Добавляйте интерактивные состояния (hover, active, focus)
5. ✅ Обеспечивайте адаптивность (mobile-first)

```vue
<!-- ❌ Плохо -->
<div style="background: white; padding: 20px; border-radius: 12px;">
  <p style="color: #444;">Текст</p>
  <button style="background: #2a9648;">Кнопка</button>
</div>

<!-- ✅ Хорошо -->
<BaseCard padding="lg">
  <BaseText color="dark">Текст</BaseText>
  <BaseButton variant="primary">Кнопка</BaseButton>
</BaseCard>
```

