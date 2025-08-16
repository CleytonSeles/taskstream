<template>
  <aside :class="sidebarClasses">
    <!-- Overlay for mobile -->
    <div
      v-if="isOpen && isMobile"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
      @click="closeSidebar"
    />

    <!-- Sidebar content -->
    <div :class="sidebarContentClasses">
      <!-- Header -->
      <div v-if="showHeader" :class="headerClasses">
        <div class="flex items-center gap-3">
          <div :class="logoClasses">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 v-if="!collapsed" :class="titleClasses">
            {{ title }}
          </h2>
        </div>
        
        <!-- Close button (mobile) -->
        <button
          v-if="isMobile"
          type="button"
          :class="closeButtonClasses"
          @click="closeSidebar"
          aria-label="Fechar menu"
        >
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav :class="navClasses">
        <!-- Main navigation -->
        <div v-if="navigationItems.length > 0" class="space-y-1">
          <h3 v-if="!collapsed" :class="sectionTitleClasses">
            Navegação
          </h3>
          <template v-for="item in navigationItems" :key="item.name">
            <!-- Regular nav item -->
            <router-link
              v-if="!item.children"
              :to="item.to"
              :class="getNavItemClasses(item)"
              :aria-current="isActiveRoute(item.to) ? 'page' : undefined"
            >
              <component v-if="item.icon" :is="item.icon" :class="iconClasses" />
              <span v-if="!collapsed" class="truncate">{{ item.name }}</span>
              <Badge
                v-if="item.badge && !collapsed"
                :variant="item.badge.variant || 'primary'"
                :size="'xs'"
              >
                {{ item.badge.text }}
              </Badge>
            </router-link>

            <!-- Nav item with children -->
            <div v-else>
              <button
                type="button"
                :class="getNavItemClasses(item, true)"
                @click="toggleSubmenu(item.name)"
                :aria-expanded="isSubmenuOpen(item.name)"
              >
                <component v-if="item.icon" :is="item.icon" :class="iconClasses" />
                <span v-if="!collapsed" class="flex-1 text-left truncate">{{ item.name }}</span>
                <svg
                  v-if="!collapsed"
                  :class="getChevronClasses(item.name)"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Submenu -->
              <Transition name="submenu">
                <div v-if="isSubmenuOpen(item.name) && !collapsed" class="ml-6 mt-1 space-y-1">
                  <router-link
                    v-for="child in item.children"
                    :key="child.name"
                    :to="child.to"
                    :class="getSubNavItemClasses(child)"
                  >
                    <component v-if="child.icon" :is="child.icon" class="w-4 h-4" />
                    <span class="truncate">{{ child.name }}</span>
                  </router-link>
                </div>
              </Transition>
            </div>
          </template>
        </div>

        <!-- Secondary navigation -->
        <div v-if="secondaryItems.length > 0" class="space-y-1">
          <h3 v-if="!collapsed" :class="sectionTitleClasses">
            Configurações
          </h3>
          <router-link
            v-for="item in secondaryItems"
            :key="item.name"
            :to="item.to"
            :class="getNavItemClasses(item)"
          >
            <component v-if="item.icon" :is="item.icon" :class="iconClasses" />
            <span v-if="!collapsed" class="truncate">{{ item.name }}</span>
          </router-link>
        </div>
      </nav>

      <!-- Footer -->
      <div v-if="showFooter" :class="footerClasses">
        <!-- Collapse toggle (desktop) -->
        <button
          v-if="!isMobile && showCollapseToggle"
          type="button"
          :class="collapseButtonClasses"
          @click="toggleCollapse"
          :aria-label="collapsed ? 'Expandir sidebar' : 'Recolher sidebar'"
        >
          <svg
            :class="collapseIconClasses"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        <!-- User info -->
        <div v-if="user && !collapsed" :class="userInfoClasses">
          <div class="flex items-center gap-3">
            <img
              v-if="user.avatar"
              :src="user.avatar"
              :alt="user.name"
              class="w-8 h-8 rounded-full object-cover"
            />
            <div v-else :class="avatarFallbackClasses">
              {{ getInitials(user.name) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {{ user.name }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400 truncate">
                {{ user.email }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Badge from '../ui/Badge.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'TaskStream'
  },
  user: {
    type: Object,
    default: null
  },
  navigationItems: {
    type: Array,
    default: () => []
  },
  secondaryItems: {
    type: Array,
    default: () => []
  },
  isOpen: {
    type: Boolean,
    default: false
  },
  collapsed: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'glass', 'minimal'].includes(value)
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showCollapseToggle: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'close',
  'toggle-collapse'
])

const route = useRoute()
const openSubmenus = ref(new Set())
const isMobile = ref(false)

// Computed properties
const sidebarClasses = computed(() => {
  return [
    'fixed',
    'inset-y-0',
    'left-0',
    'z-50',
    'lg:relative',
    'lg:z-auto'
  ].join(' ')
})

const sidebarContentClasses = computed(() => {
  const baseClasses = [
    'flex',
    'flex-col',
    'h-full',
    'transition-all',
    'duration-300',
    'ease-in-out'
  ]

  const widthClasses = props.collapsed && !isMobile.value
    ? ['w-16']
    : ['w-64']

  const visibilityClasses = isMobile.value
    ? props.isOpen
      ? ['translate-x-0']
      : ['-translate-x-full']
    : []

  const variantClasses = {
    default: [
      'bg-white',
      'dark:bg-gray-800',
      'border-r',
      'border-gray-200',
      'dark:border-gray-700',
      'shadow-sm'
    ],
    glass: [
      'glass',
      'border-r',
      'border-white/20'
    ],
    minimal: [
      'bg-gray-50',
      'dark:bg-gray-900',
      'border-r',
      'border-gray-200',
      'dark:border-gray-700'
    ]
  }

  return [
    ...baseClasses,
    ...widthClasses,
    ...visibilityClasses,
    ...variantClasses[props.variant]
  ].join(' ')
})

const headerClasses = computed(() => {
  return [
    'flex',
    'items-center',
    'justify-between',
    'p-4',
    'border-b',
    'border-gray-200',
    'dark:border-gray-700'
  ].join(' ')
})

const logoClasses = computed(() => {
  return [
    'text-primary-600',
    'dark:text-primary-400'
  ].join(' ')
})

const titleClasses = computed(() => {
  return [
    'text-lg',
    'font-bold',
    'text-gray-900',
    'dark:text-gray-100',
    'truncate'
  ].join(' ')
})

const closeButtonClasses = computed(() => {
  return [
    'p-1',
    'text-gray-500',
    'hover:text-gray-700',
    'dark:text-gray-400',
    'dark:hover:text-gray-200',
    'hover:bg-gray-100',
    'dark:hover:bg-gray-700',
    'rounded',
    'transition-colors',
    'duration-200'
  ].join(' ')
})

const navClasses = computed(() => {
  return [
    'flex-1',
    'px-4',
    'py-4',
    'space-y-6',
    'overflow-y-auto',
    'scrollbar-thin'
  ].join(' ')
})

const sectionTitleClasses = computed(() => {
  return [
    'text-xs',
    'font-semibold',
    'text-gray-500',
    'dark:text-gray-400',
    'uppercase',
    'tracking-wider',
    'mb-2'
  ].join(' ')
})

const iconClasses = computed(() => {
  return [
    'w-5',
    'h-5',
    'flex-shrink-0'
  ].join(' ')
})

const footerClasses = computed(() => {
  return [
    'p-4',
    'border-t',
    'border-gray-200',
    'dark:border-gray-700',
    'space-y-3'
  ].join(' ')
})

const collapseButtonClasses = computed(() => {
  return [
    'w-full',
    'p-2',
    'text-gray-500',
    'hover:text-gray-700',
    'dark:text-gray-400',
    'dark:hover:text-gray-200',
    'hover:bg-gray-100',
    'dark:hover:bg-gray-700',
    'rounded-lg',
    'transition-colors',
    'duration-200',
    'flex',
    'items-center',
    'justify-center'
  ].join(' ')
})

const collapseIconClasses = computed(() => {
  return [
    'w-5',
    'h-5',
    'transition-transform',
    'duration-200',
    props.collapsed ? 'rotate-180' : ''
  ].filter(Boolean).join(' ')
})

const userInfoClasses = computed(() => {
  return [
    'p-3',
    'bg-gray-50',
    'dark:bg-gray-700/50',
    'rounded-lg'
  ].join(' ')
})

const avatarFallbackClasses = computed(() => {
  return [
    'w-8',
    'h-8',
    'bg-primary-600',
    'text-white',
    'rounded-full',
    'flex',
    'items-center',
    'justify-center',
    'text-sm',
    'font-medium',
    'flex-shrink-0'
  ].join(' ')
})

// Methods
const getNavItemClasses = (item, hasChildren = false) => {
  const baseClasses = [
    'flex',
    'items-center',
    'gap-3',
    'px-3',
    'py-2',
    'text-sm',
    'font-medium',
    'rounded-lg',
    'transition-colors',
    'duration-200',
    'group'
  ]

  const interactiveClasses = hasChildren
    ? [
        'w-full',
        'text-left',
        'text-gray-700',
        'dark:text-gray-300',
        'hover:bg-gray-100',
        'dark:hover:bg-gray-700'
      ]
    : [
        'text-gray-700',
        'dark:text-gray-300',
        'hover:bg-gray-100',
        'dark:hover:bg-gray-700',
        'hover:text-primary-600',
        'dark:hover:text-primary-400'
      ]

  const activeClasses = !hasChildren && isActiveRoute(item.to)
    ? [
        'bg-primary-50',
        'dark:bg-primary-900/20',
        'text-primary-600',
        'dark:text-primary-400',
        'border-r-2',
        'border-primary-600',
        'dark:border-primary-400'
      ]
    : []

  return [
    ...baseClasses,
    ...interactiveClasses,
    ...activeClasses
  ].join(' ')
}

const getSubNavItemClasses = (item) => {
  const baseClasses = [
    'flex',
    'items-center',
    'gap-2',
    'px-3',
    'py-2',
    'text-sm',
    'rounded-lg',
    'transition-colors',
    'duration-200'
  ]

  const activeClasses = isActiveRoute(item.to)
    ? [
        'bg-primary-50',
        'dark:bg-primary-900/20',
        'text-primary-600',
        'dark:text-primary-400'
      ]
    : [
        'text-gray-600',
        'dark:text-gray-400',
        'hover:bg-gray-100',
        'dark:hover:bg-gray-700',
        'hover:text-gray-900',
        'dark:hover:text-gray-200'
      ]

  return [
    ...baseClasses,
    ...activeClasses
  ].join(' ')
}

const getChevronClasses = (itemName) => {
  return [
    'w-4',
    'h-4',
    'transition-transform',
    'duration-200',
    isSubmenuOpen(itemName) ? 'rotate-180' : ''
  ].filter(Boolean).join(' ')
}

const isActiveRoute = (to) => {
  if (!to) return false
  return route.path === to || route.path.startsWith(to + '/')
}

const isSubmenuOpen = (itemName) => {
  return openSubmenus.value.has(itemName)
}

const toggleSubmenu = (itemName) => {
  if (openSubmenus.value.has(itemName)) {
    openSubmenus.value.delete(itemName)
  } else {
    openSubmenus.value.add(itemName)
  }
}

const closeSidebar = () => {
  emit('close')
}

const toggleCollapse = () => {
  emit('toggle-collapse')
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
}

// Watch for route changes to auto-open parent menus
watch(
  () => route.path,
  (newPath) => {
    // Auto-open parent menus for active routes
    props.navigationItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          newPath === child.to || newPath.startsWith(child.to + '/')
        )
        if (hasActiveChild) {
          openSubmenus.value.add(item.name)
        }
      }
    })
  },
  { immediate: true }
)

// Handle window resize
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s ease;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.submenu-enter-to,
.submenu-leave-from {
  opacity: 1;
  max-height: 200px;
  transform: translateY(0);
}
</style>