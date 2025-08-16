<template>
  <span :class="badgeClasses">
    <component v-if="iconLeft" :is="iconLeft" :class="iconClasses" />
    <slot />
    <component v-if="iconRight" :is="iconRight" :class="iconClasses" />
    <button
      v-if="removable"
      type="button"
      :class="removeButtonClasses"
      @click="handleRemove"
      :aria-label="`Remover ${$slots.default?.[0]?.children || 'item'}`"
    >
      <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => [
      'default', 'primary', 'secondary', 'success', 'warning', 'danger', 
      'info', 'light', 'dark', 'outline'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
  },
  rounded: {
    type: String,
    default: 'full',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'full'].includes(value)
  },
  removable: {
    type: Boolean,
    default: false
  },
  iconLeft: {
    type: [String, Object],
    default: null
  },
  iconRight: {
    type: [String, Object],
    default: null
  },
  clickable: {
    type: Boolean,
    default: false
  },
  pulse: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['remove', 'click'])

const badgeClasses = computed(() => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'gap-1',
    'font-medium',
    'transition-all',
    'duration-200',
    'whitespace-nowrap'
  ]

  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm'
  }

  // Variant classes
  const variantClasses = {
    default: [
      'bg-gray-100',
      'text-gray-800',
      'dark:bg-gray-700',
      'dark:text-gray-200'
    ],
    primary: [
      'bg-primary-100',
      'text-primary-800',
      'dark:bg-primary-900/30',
      'dark:text-primary-200'
    ],
    secondary: [
      'bg-secondary-100',
      'text-secondary-800',
      'dark:bg-secondary-900/30',
      'dark:text-secondary-200'
    ],
    success: [
      'bg-green-100',
      'text-green-800',
      'dark:bg-green-900/30',
      'dark:text-green-200'
    ],
    warning: [
      'bg-amber-100',
      'text-amber-800',
      'dark:bg-amber-900/30',
      'dark:text-amber-200'
    ],
    danger: [
      'bg-red-100',
      'text-red-800',
      'dark:bg-red-900/30',
      'dark:text-red-200'
    ],
    info: [
      'bg-blue-100',
      'text-blue-800',
      'dark:bg-blue-900/30',
      'dark:text-blue-200'
    ],
    light: [
      'bg-white',
      'text-gray-800',
      'border',
      'border-gray-200',
      'dark:bg-gray-800',
      'dark:text-gray-200',
      'dark:border-gray-600'
    ],
    dark: [
      'bg-gray-800',
      'text-white',
      'dark:bg-gray-200',
      'dark:text-gray-800'
    ],
    outline: [
      'bg-transparent',
      'text-gray-700',
      'border',
      'border-gray-300',
      'dark:text-gray-300',
      'dark:border-gray-600'
    ]
  }

  // Rounded classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  // Interactive classes
  const interactiveClasses = []
  if (props.clickable) {
    interactiveClasses.push(
      'cursor-pointer',
      'hover:scale-105',
      'active:scale-95',
      'focus-ring'
    )
  }

  // Animation classes
  const animationClasses = props.pulse ? ['animate-pulse-soft'] : []

  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...variantClasses[props.variant],
    roundedClasses[props.rounded],
    ...interactiveClasses,
    ...animationClasses
  ].join(' ')
})

const iconClasses = computed(() => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4'
  }
  return sizeClasses[props.size]
})

const removeButtonClasses = computed(() => {
  const baseClasses = [
    'ml-1',
    'flex-shrink-0',
    'rounded-full',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-1'
  ]

  const sizeClasses = {
    xs: 'p-0.5',
    sm: 'p-0.5',
    md: 'p-1',
    lg: 'p-1'
  }

  // Variant-specific hover colors
  const variantHoverClasses = {
    default: [
      'hover:bg-gray-200',
      'focus:ring-gray-300',
      'dark:hover:bg-gray-600',
      'dark:focus:ring-gray-500'
    ],
    primary: [
      'hover:bg-primary-200',
      'focus:ring-primary-300',
      'dark:hover:bg-primary-800',
      'dark:focus:ring-primary-600'
    ],
    secondary: [
      'hover:bg-secondary-200',
      'focus:ring-secondary-300',
      'dark:hover:bg-secondary-800',
      'dark:focus:ring-secondary-600'
    ],
    success: [
      'hover:bg-green-200',
      'focus:ring-green-300',
      'dark:hover:bg-green-800',
      'dark:focus:ring-green-600'
    ],
    warning: [
      'hover:bg-amber-200',
      'focus:ring-amber-300',
      'dark:hover:bg-amber-800',
      'dark:focus:ring-amber-600'
    ],
    danger: [
      'hover:bg-red-200',
      'focus:ring-red-300',
      'dark:hover:bg-red-800',
      'dark:focus:ring-red-600'
    ],
    info: [
      'hover:bg-blue-200',
      'focus:ring-blue-300',
      'dark:hover:bg-blue-800',
      'dark:focus:ring-blue-600'
    ],
    light: [
      'hover:bg-gray-100',
      'focus:ring-gray-200',
      'dark:hover:bg-gray-700',
      'dark:focus:ring-gray-600'
    ],
    dark: [
      'hover:bg-gray-700',
      'focus:ring-gray-600',
      'dark:hover:bg-gray-300',
      'dark:focus:ring-gray-400'
    ],
    outline: [
      'hover:bg-gray-100',
      'focus:ring-gray-200',
      'dark:hover:bg-gray-800',
      'dark:focus:ring-gray-600'
    ]
  }

  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...variantHoverClasses[props.variant]
  ].join(' ')
})

const handleRemove = (event) => {
  event.stopPropagation()
  emit('remove')
}

const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>