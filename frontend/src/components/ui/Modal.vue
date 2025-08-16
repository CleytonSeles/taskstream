<template>
  <Teleport to="body">
    <Transition
      name="modal"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="modelValue"
        :class="overlayClasses"
        @click="handleOverlayClick"
        @keydown.esc="handleEscape"
        tabindex="-1"
      >
        <div
          ref="modalRef"
          :class="modalClasses"
          @click.stop
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId"
        >
          <!-- Header -->
          <div v-if="$slots.header || title || closable" :class="headerClasses">
            <slot name="header">
              <div v-if="title">
                <h3 :id="titleId" :class="titleClasses">
                  {{ title }}
                </h3>
                <p v-if="subtitle" :id="descriptionId" :class="subtitleClasses">
                  {{ subtitle }}
                </p>
              </div>
            </slot>
            
            <button
              v-if="closable"
              type="button"
              :class="closeButtonClasses"
              @click="handleClose"
              aria-label="Fechar modal"
            >
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  closeOnEscape: {
    type: Boolean,
    default: true
  },
  persistent: {
    type: Boolean,
    default: false
  },
  centered: {
    type: Boolean,
    default: true
  },
  scrollable: {
    type: Boolean,
    default: false
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  blurBackground: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'open', 'escape'])

const modalRef = ref(null)
const previousActiveElement = ref(null)

const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`)
const descriptionId = computed(() => `modal-description-${Math.random().toString(36).substr(2, 9)}`)

const overlayClasses = computed(() => {
  const baseClasses = [
    'fixed',
    'inset-0',
    'z-50',
    'flex',
    'transition-all',
    'duration-300'
  ]

  const alignmentClasses = props.centered ? [
    'items-center',
    'justify-center'
  ] : [
    'items-start',
    'justify-center',
    'pt-16'
  ]

  const backgroundClasses = [
    'bg-black/50',
    props.blurBackground ? 'backdrop-blur-sm' : ''
  ].filter(Boolean)

  const scrollClasses = props.scrollable ? ['overflow-y-auto'] : ['overflow-hidden']

  return [
    ...baseClasses,
    ...alignmentClasses,
    ...backgroundClasses,
    ...scrollClasses,
    'p-4'
  ].join(' ')
})

const modalClasses = computed(() => {
  const baseClasses = [
    'relative',
    'bg-white',
    'dark:bg-gray-800',
    'rounded-xl',
    'shadow-2xl',
    'transition-all',
    'duration-300',
    'max-h-full',
    'flex',
    'flex-col'
  ]

  // Size classes
  const sizeClasses = {
    xs: 'max-w-xs w-full',
    sm: 'max-w-sm w-full',
    md: 'max-w-md w-full',
    lg: 'max-w-lg w-full',
    xl: 'max-w-xl w-full',
    '2xl': 'max-w-2xl w-full',
    full: 'max-w-full w-full h-full rounded-none'
  }

  const fullscreenClasses = props.fullscreen ? [
    'max-w-full',
    'w-full',
    'h-full',
    'rounded-none'
  ] : []

  return [
    ...baseClasses,
    props.fullscreen ? '' : sizeClasses[props.size],
    ...fullscreenClasses
  ].filter(Boolean).join(' ')
})

const headerClasses = computed(() => {
  return [
    'flex',
    'items-start',
    'justify-between',
    'p-6',
    'border-b',
    'border-gray-200',
    'dark:border-gray-700',
    'flex-shrink-0'
  ].join(' ')
})

const titleClasses = computed(() => {
  return [
    'text-lg',
    'font-semibold',
    'text-gray-900',
    'dark:text-gray-100',
    'leading-6'
  ].join(' ')
})

const subtitleClasses = computed(() => {
  return [
    'mt-1',
    'text-sm',
    'text-gray-600',
    'dark:text-gray-400'
  ].join(' ')
})

const closeButtonClasses = computed(() => {
  return [
    'ml-4',
    'flex-shrink-0',
    'p-2',
    'text-gray-400',
    'hover:text-gray-600',
    'dark:text-gray-500',
    'dark:hover:text-gray-300',
    'transition-colors',
    'duration-200',
    'rounded-lg',
    'hover:bg-gray-100',
    'dark:hover:bg-gray-700',
    'focus-ring'
  ].join(' ')
})

const contentClasses = computed(() => {
  return [
    'flex-1',
    'p-6',
    props.scrollable ? 'overflow-y-auto' : 'overflow-hidden'
  ].join(' ')
})

const footerClasses = computed(() => {
  return [
    'flex',
    'items-center',
    'justify-end',
    'gap-3',
    'p-6',
    'border-t',
    'border-gray-200',
    'dark:border-gray-700',
    'bg-gray-50',
    'dark:bg-gray-900/50',
    'rounded-b-xl',
    'flex-shrink-0'
  ].join(' ')
})

const handleClose = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay && !props.persistent) {
    handleClose()
  }
}

const handleEscape = () => {
  if (props.closeOnEscape && !props.persistent) {
    emit('escape')
    handleClose()
  }
}

const onEnter = () => {
  // Store the currently focused element
  previousActiveElement.value = document.activeElement
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden'
  
  emit('open')
}

const onAfterEnter = () => {
  // Focus the modal for accessibility
  nextTick(() => {
    modalRef.value?.focus()
  })
}

const onLeave = () => {
  // Restore body scroll
  document.body.style.overflow = ''
}

const onAfterLeave = () => {
  // Restore focus to the previously focused element
  if (previousActiveElement.value) {
    previousActiveElement.value.focus()
    previousActiveElement.value = null
  }
}

// Handle escape key globally when modal is open
const handleGlobalKeydown = (event) => {
  if (event.key === 'Escape' && props.modelValue) {
    handleEscape()
  }
}

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleGlobalKeydown)
  } else {
    document.removeEventListener('keydown', handleGlobalKeydown)
  }
})

onMounted(() => {
  if (props.modelValue) {
    document.addEventListener('keydown', handleGlobalKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  // Restore body scroll if component is unmounted while modal is open
  if (props.modelValue) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(-20px);
}

.modal-enter-to .relative,
.modal-leave-from .relative {
  transform: scale(1) translateY(0);
}
</style>