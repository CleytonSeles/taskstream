<template>
  <div :class="wrapperClasses">
    <!-- Label -->
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input Container -->
    <div :class="containerClasses">
      <!-- Left Icon -->
      <div v-if="iconLeft" :class="iconContainerClasses">
        <component :is="iconLeft" :class="iconClasses" />
      </div>

      <!-- Input Element -->
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :class="inputClasses"
        v-bind="$attrs"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />

      <!-- Right Icon/Action -->
      <div v-if="iconRight || clearable || loading" :class="iconContainerClasses">
        <!-- Loading Spinner -->
        <div v-if="loading" class="animate-spin">
          <svg class="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <!-- Clear Button -->
        <button
          v-else-if="clearable && modelValue && !disabled && !readonly"
          type="button"
          :class="clearButtonClasses"
          @click="handleClear"
        >
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <!-- Right Icon -->
        <component v-else-if="iconRight" :is="iconRight" :class="iconClasses" />
      </div>
    </div>

    <!-- Helper Text/Error -->
    <div v-if="helperText || errorMessage" :class="helperClasses">
      <span v-if="errorMessage" class="text-red-600 dark:text-red-400">
        {{ errorMessage }}
      </span>
      <span v-else-if="helperText" class="text-gray-600 dark:text-gray-400">
        {{ helperText }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'filled', 'outlined'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  clearable: {
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
  autocomplete: {
    type: String,
    default: 'off'
  },
  id: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear', 'keydown'])

const inputRef = ref(null)
const isFocused = ref(false)

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)

const hasError = computed(() => !!props.errorMessage)

const wrapperClasses = computed(() => {
  return 'flex flex-col gap-1.5'
})

const labelClasses = computed(() => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  }

  return [
    'block',
    'font-medium',
    'text-gray-700',
    'dark:text-gray-300',
    sizeClasses[props.size]
  ].join(' ')
})

const containerClasses = computed(() => {
  return 'relative flex items-center'
})

const inputClasses = computed(() => {
  const baseClasses = [
    'block',
    'w-full',
    'border',
    'transition-all',
    'duration-200',
    'focus-ring',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:bg-gray-50',
    'dark:disabled:bg-gray-800'
  ]

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  // Variant classes
  const variantClasses = {
    default: [
      'bg-white',
      'border-gray-300',
      'rounded-md',
      'focus:border-primary-500',
      'dark:bg-gray-800',
      'dark:border-gray-600',
      'dark:text-white',
      'dark:focus:border-primary-400'
    ],
    filled: [
      'bg-gray-50',
      'border-transparent',
      'rounded-md',
      'focus:bg-white',
      'focus:border-primary-500',
      'dark:bg-gray-700',
      'dark:text-white',
      'dark:focus:bg-gray-800',
      'dark:focus:border-primary-400'
    ],
    outlined: [
      'bg-transparent',
      'border-gray-300',
      'rounded-md',
      'focus:border-primary-500',
      'dark:border-gray-600',
      'dark:text-white',
      'dark:focus:border-primary-400'
    ]
  }

  // Error state
  const errorClasses = hasError.value ? [
    'border-red-500',
    'focus:border-red-500',
    'dark:border-red-400',
    'dark:focus:border-red-400'
  ] : []

  // Icon padding
  const iconPadding = []
  if (props.iconLeft) {
    iconPadding.push('pl-10')
  }
  if (props.iconRight || props.clearable || props.loading) {
    iconPadding.push('pr-10')
  }

  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...variantClasses[props.variant],
    ...errorClasses,
    ...iconPadding
  ].join(' ')
})

const iconContainerClasses = computed(() => {
  return [
    'absolute',
    'inset-y-0',
    'flex',
    'items-center',
    'px-3',
    'pointer-events-none'
  ].join(' ')
})

const iconClasses = computed(() => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5'
  }

  return [
    sizeClasses[props.size],
    'text-gray-400',
    'dark:text-gray-500'
  ].join(' ')
})

const clearButtonClasses = computed(() => {
  return [
    'absolute',
    'right-3',
    'p-1',
    'text-gray-400',
    'hover:text-gray-600',
    'dark:text-gray-500',
    'dark:hover:text-gray-300',
    'transition-colors',
    'duration-200',
    'pointer-events-auto',
    'rounded',
    'hover:bg-gray-100',
    'dark:hover:bg-gray-700'
  ].join(' ')
})

const helperClasses = computed(() => {
  return 'text-xs mt-1'
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  isFocused.value = false
  emit('blur', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleKeydown = (event) => {
  emit('keydown', event)
}

// Expose methods
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select()
})
</script>