<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :disabled="disabled || loading"
    v-bind="$attrs"
    @click="handleClick"
  >
    <div v-if="loading" class="flex items-center justify-center">
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span v-if="loadingText">{{ loadingText }}</span>
      <span v-else><slot /></span>
    </div>
    <div v-else class="flex items-center justify-center gap-2">
      <component v-if="iconLeft" :is="iconLeft" :class="iconClasses" />
      <slot />
      <component v-if="iconRight" :is="iconRight" :class="iconClasses" />
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger', 'success', 'warning'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  tag: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: ''
  },
  iconLeft: {
    type: [String, Object],
    default: null
  },
  iconRight: {
    type: [String, Object],
    default: null
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl', 'full'].includes(value)
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const buttonClasses = computed(() => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus-ring',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none'
  ]

  // Size classes
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  // Variant classes
  const variantClasses = {
    primary: [
      'bg-primary-600',
      'text-white',
      'border',
      'border-primary-600',
      'hover:bg-primary-700',
      'hover:border-primary-700',
      'active:bg-primary-800',
      'shadow-sm',
      'hover:shadow-md'
    ],
    secondary: [
      'bg-white',
      'text-gray-700',
      'border',
      'border-gray-300',
      'hover:bg-gray-50',
      'hover:border-gray-400',
      'active:bg-gray-100',
      'shadow-sm',
      'hover:shadow-md',
      'dark:bg-gray-800',
      'dark:text-gray-200',
      'dark:border-gray-600',
      'dark:hover:bg-gray-700',
      'dark:hover:border-gray-500'
    ],
    ghost: [
      'bg-transparent',
      'text-gray-700',
      'border',
      'border-transparent',
      'hover:bg-gray-100',
      'hover:text-gray-900',
      'active:bg-gray-200',
      'dark:text-gray-300',
      'dark:hover:bg-gray-800',
      'dark:hover:text-gray-100'
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'border',
      'border-red-600',
      'hover:bg-red-700',
      'hover:border-red-700',
      'active:bg-red-800',
      'shadow-sm',
      'hover:shadow-md'
    ],
    success: [
      'bg-secondary-600',
      'text-white',
      'border',
      'border-secondary-600',
      'hover:bg-secondary-700',
      'hover:border-secondary-700',
      'active:bg-secondary-800',
      'shadow-sm',
      'hover:shadow-md'
    ],
    warning: [
      'bg-amber-500',
      'text-white',
      'border',
      'border-amber-500',
      'hover:bg-amber-600',
      'hover:border-amber-600',
      'active:bg-amber-700',
      'shadow-sm',
      'hover:shadow-md'
    ]
  }

  // Rounded classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  }

  // Width classes
  const widthClasses = props.fullWidth ? ['w-full'] : []

  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...variantClasses[props.variant],
    roundedClasses[props.rounded],
    ...widthClasses
  ].join(' ')
})

const iconClasses = computed(() => {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }
  return sizeMap[props.size]
})
</script>