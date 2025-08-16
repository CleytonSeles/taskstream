<template>
  <div :class="cardClasses">
    <!-- Header -->
    <div v-if="$slots.header || title || subtitle" :class="headerClasses">
      <slot name="header">
        <div v-if="title || subtitle">
          <h3 v-if="title" :class="titleClasses">{{ title }}</h3>
          <p v-if="subtitle" :class="subtitleClasses">{{ subtitle }}</p>
        </div>
      </slot>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <!-- Content -->
    <div :class="contentClasses">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" :class="footerClasses">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'elevated', 'outlined', 'ghost', 'gradient'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  padding: {
    type: String,
    default: 'default',
    validator: (value) => ['none', 'sm', 'default', 'lg'].includes(value)
  },
  rounded: {
    type: String,
    default: 'lg',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl', '2xl'].includes(value)
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const cardClasses = computed(() => {
  const baseClasses = [
    'relative',
    'transition-all',
    'duration-200',
    'overflow-hidden'
  ]

  // Variant classes
  const variantClasses = {
    default: [
      'bg-white',
      'border',
      'border-gray-200',
      'shadow-sm',
      'dark:bg-gray-800',
      'dark:border-gray-700'
    ],
    elevated: [
      'bg-white',
      'shadow-medium',
      'border-0',
      'dark:bg-gray-800'
    ],
    outlined: [
      'bg-transparent',
      'border-2',
      'border-gray-200',
      'shadow-none',
      'dark:border-gray-700'
    ],
    ghost: [
      'bg-gray-50/50',
      'border-0',
      'shadow-none',
      'dark:bg-gray-900/50'
    ],
    gradient: [
      'bg-gradient-to-br',
      'from-primary-50',
      'to-secondary-50',
      'border-0',
      'shadow-sm',
      'dark:from-primary-900/20',
      'dark:to-secondary-900/20'
    ]
  }

  // Rounded classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl'
  }

  // Interactive classes
  const interactiveClasses = []
  if (props.hoverable || props.clickable) {
    interactiveClasses.push(
      'hover:shadow-medium',
      'hover:-translate-y-1',
      'hover:scale-[1.02]'
    )
  }
  if (props.clickable) {
    interactiveClasses.push(
      'cursor-pointer',
      'active:scale-[0.98]',
      'focus-ring'
    )
  }

  // Loading classes
  const loadingClasses = props.loading ? ['animate-pulse-soft'] : []

  return [
    ...baseClasses,
    ...variantClasses[props.variant],
    roundedClasses[props.rounded],
    ...interactiveClasses,
    ...loadingClasses
  ].join(' ')
})

const headerClasses = computed(() => {
  const paddingClasses = {
    none: '',
    sm: 'px-3 py-2',
    default: 'px-4 py-3',
    lg: 'px-6 py-4'
  }

  return [
    'flex',
    'items-start',
    'justify-between',
    'border-b',
    'border-gray-200',
    'dark:border-gray-700',
    paddingClasses[props.padding]
  ].join(' ')
})

const contentClasses = computed(() => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6'
  }

  return paddingClasses[props.padding]
})

const footerClasses = computed(() => {
  const paddingClasses = {
    none: '',
    sm: 'px-3 py-2',
    default: 'px-4 py-3',
    lg: 'px-6 py-4'
  }

  return [
    'border-t',
    'border-gray-200',
    'dark:border-gray-700',
    'bg-gray-50',
    'dark:bg-gray-900/50',
    paddingClasses[props.padding]
  ].join(' ')
})

const titleClasses = computed(() => {
  const sizeClasses = {
    sm: 'text-sm font-medium',
    md: 'text-base font-semibold',
    lg: 'text-lg font-semibold',
    xl: 'text-xl font-bold'
  }

  return [
    sizeClasses[props.size],
    'text-gray-900',
    'dark:text-gray-100',
    'leading-tight'
  ].join(' ')
})

const subtitleClasses = computed(() => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm',
    xl: 'text-base'
  }

  return [
    sizeClasses[props.size],
    'text-gray-600',
    'dark:text-gray-400',
    'mt-1'
  ].join(' ')
})
</script>