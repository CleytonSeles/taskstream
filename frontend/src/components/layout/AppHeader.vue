<template>
  <header :class="headerClasses">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo/Brand -->
        <div class="flex items-center gap-4">
          <button
            v-if="showMenuButton"
            type="button"
            :class="menuButtonClasses"
            @click="toggleSidebar"
            aria-label="Toggle menu"
          >
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div class="flex items-center gap-3">
            <div :class="logoClasses">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1 :class="titleClasses">
              {{ title }}
            </h1>
          </div>
        </div>

        <!-- Navigation (Desktop) -->
        <nav v-if="showNavigation" class="hidden md:flex items-center gap-6">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.to"
            :class="navLinkClasses"
            :aria-current="$route.path === item.to ? 'page' : undefined"
          >
            <component v-if="item.icon" :is="item.icon" class="w-4 h-4" />
            {{ item.name }}
          </router-link>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <!-- Search (if enabled) -->
          <div v-if="showSearch" class="hidden sm:block">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="searchPlaceholder"
                :class="searchInputClasses"
                @input="handleSearch"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Theme Toggle -->
          <button
            v-if="showThemeToggle"
            type="button"
            :class="themeButtonClasses"
            @click="toggleTheme"
            :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
          >
            <svg v-if="isDark" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Notifications -->
          <button
            v-if="showNotifications"
            type="button"
            :class="notificationButtonClasses"
            @click="toggleNotifications"
            aria-label="Notificações"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span v-if="notificationCount > 0" :class="notificationBadgeClasses">
              {{ notificationCount > 99 ? '99+' : notificationCount }}
            </span>
          </button>

          <!-- User Menu -->
          <div v-if="user" class="relative">
            <button
              type="button"
              :class="userButtonClasses"
              @click="toggleUserMenu"
              :aria-expanded="showUserMenu"
              aria-label="Menu do usuário"
            >
              <img
                v-if="user.avatar"
                :src="user.avatar"
                :alt="user.name"
                class="w-8 h-8 rounded-full object-cover"
              />
              <div v-else :class="avatarFallbackClasses">
                {{ getInitials(user.name) }}
              </div>
            </button>

            <!-- User Dropdown -->
            <Transition name="dropdown">
              <div v-if="showUserMenu" :class="userMenuClasses" @click="closeUserMenu">
                <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ user.name }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ user.email }}
                  </p>
                </div>
                <div class="py-1">
                  <button
                    v-for="item in userMenuItems"
                    :key="item.name"
                    type="button"
                    :class="userMenuItemClasses"
                    @click="item.action"
                  >
                    <component v-if="item.icon" :is="item.icon" class="w-4 h-4" />
                    {{ item.name }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: 'TaskStream'
  },
  user: {
    type: Object,
    default: null
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'transparent', 'glass'].includes(value)
  },
  showMenuButton: {
    type: Boolean,
    default: false
  },
  showNavigation: {
    type: Boolean,
    default: true
  },
  showSearch: {
    type: Boolean,
    default: false
  },
  showThemeToggle: {
    type: Boolean,
    default: true
  },
  showNotifications: {
    type: Boolean,
    default: false
  },
  navigationItems: {
    type: Array,
    default: () => []
  },
  searchPlaceholder: {
    type: String,
    default: 'Buscar...'
  },
  notificationCount: {
    type: Number,
    default: 0
  },
  sticky: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'toggle-sidebar',
  'search',
  'toggle-theme',
  'toggle-notifications',
  'logout'
])

const router = useRouter()
const searchQuery = ref('')
const showUserMenu = ref(false)
const isDark = ref(false)

// User menu items
const userMenuItems = computed(() => [
  {
    name: 'Perfil',
    icon: 'UserIcon',
    action: () => router.push('/profile')
  },
  {
    name: 'Configurações',
    icon: 'CogIcon',
    action: () => router.push('/settings')
  },
  {
    name: 'Sair',
    icon: 'LogoutIcon',
    action: handleLogout
  }
])

// Computed classes
const headerClasses = computed(() => {
  const baseClasses = [
    'border-b',
    'border-gray-200',
    'dark:border-gray-700',
    'transition-all',
    'duration-200',
    'z-40'
  ]

  const variantClasses = {
    default: [
      'bg-white',
      'dark:bg-gray-800',
      'shadow-sm'
    ],
    transparent: [
      'bg-white/80',
      'dark:bg-gray-800/80',
      'backdrop-blur-md'
    ],
    glass: [
      'glass',
      'border-white/20'
    ]
  }

  const stickyClasses = props.sticky ? ['sticky', 'top-0'] : []

  return [
    ...baseClasses,
    ...variantClasses[props.variant],
    ...stickyClasses
  ].join(' ')
})

const menuButtonClasses = computed(() => {
  return [
    'p-2',
    'text-gray-600',
    'hover:text-gray-900',
    'dark:text-gray-400',
    'dark:hover:text-gray-100',
    'hover:bg-gray-100',
    'dark:hover:bg-gray-700',
    'rounded-lg',
    'transition-colors',
    'duration-200',
    'focus-ring'
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
    'text-xl',
    'font-bold',
    'text-gray-900',
    'dark:text-gray-100',
    'hidden',
    'sm:block'
  ].join(' ')
})

const navLinkClasses = computed(() => {
  return [
    'flex',
    'items-center',
    'gap-2',
    'px-3',
    'py-2',
    'text-sm',
    'font-medium',
    'text-gray-700',
    'dark:text-gray-300',
    'hover:text-primary-600',
    'dark:hover:text-primary-400',
    'hover:bg-gray-100',
    'dark:hover:bg-gray-700',
    'rounded-lg',
    'transition-colors',
    'duration-200',
    'router-link-active:text-primary-600',
    'router-link-active:bg-primary-50',
    'dark:router-link-active:text-primary-400',
    'dark:router-link-active:bg-primary-900/20'
  ].join(' ')
})

const searchInputClasses = computed(() => {
  return [
    'w-64',
    'pl-10',
    'pr-4',
    'py-2',
    'text-sm',
    'bg-gray-50',
    'dark:bg-gray-700',
    'border',
    'border-gray-300',
    'dark:border-gray-600',
    'rounded-lg',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:border-transparent',
    'dark:text-white',
    'placeholder-gray-500',
    'dark:placeholder-gray-400',
    'transition-colors',
    'duration-200'
  ].join(' ')
})

const themeButtonClasses = computed(() => {
  return [
    'p-2',
    'text-gray-600',
    'hover:text-gray-900',
    'dark:text-gray-400',
    'dark:hover:text-gray-100',
    'hover:bg-gray-100',
    'dark:hover:bg-gray-700',
    'rounded-lg',
    'transition-colors',
    'duration-200',
    'focus-ring'
  ].join(' ')
})

const notificationButtonClasses = computed(() => {
  return [
    'relative',
    'p-2',
    'text-gray-600',
    'hover:text-gray-900',
    'dark:text-gray-400',
    'dark:hover:text-gray-100',
    'hover:bg-gray-100',
    'dark:hover:bg-gray-700',
    'rounded-lg',
    'transition-colors',
    'duration-200',
    'focus-ring'
  ].join(' ')
})

const notificationBadgeClasses = computed(() => {
  return [
    'absolute',
    '-top-1',
    '-right-1',
    'min-w-[1.25rem]',
    'h-5',
    'px-1',
    'text-xs',
    'font-medium',
    'text-white',
    'bg-red-500',
    'rounded-full',
    'flex',
    'items-center',
    'justify-center'
  ].join(' ')
})

const userButtonClasses = computed(() => {
  return [
    'flex',
    'items-center',
    'p-1',
    'hover:bg-gray-100',
    'dark:hover:bg-gray-700',
    'rounded-lg',
    'transition-colors',
    'duration-200',
    'focus-ring'
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
    'font-medium'
  ].join(' ')
})

const userMenuClasses = computed(() => {
  return [
    'absolute',
    'right-0',
    'mt-2',
    'w-56',
    'bg-white',
    'dark:bg-gray-800',
    'border',
    'border-gray-200',
    'dark:border-gray-700',
    'rounded-lg',
    'shadow-lg',
    'py-1',
    'z-50'
  ].join(' ')
})

const userMenuItemClasses = computed(() => {
  return [
    'flex',
    'items-center',
    'gap-3',
    'w-full',
    'px-4',
    'py-2',
    'text-sm',
    'text-gray-700',
    'dark:text-gray-300',
    'hover:bg-gray-100',
    'dark:hover:bg-gray-700',
    'transition-colors',
    'duration-200'
  ].join(' ')
})

// Methods
const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  emit('toggle-theme')
}

const toggleNotifications = () => {
  emit('toggle-notifications')
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const handleLogout = () => {
  closeUserMenu()
  emit('logout')
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Click outside to close user menu
const handleClickOutside = (event) => {
  if (showUserMenu.value && !event.target.closest('.relative')) {
    closeUserMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>