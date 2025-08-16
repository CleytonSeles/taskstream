import { ref, computed, watch, onMounted } from 'vue'

const isDark = ref(false)
const theme = ref('light')
const systemPreference = ref('light')

// Theme options
const themes = {
  light: {
    name: 'light',
    label: 'Claro',
    icon: 'SunIcon'
  },
  dark: {
    name: 'dark',
    label: 'Escuro',
    icon: 'MoonIcon'
  },
  system: {
    name: 'system',
    label: 'Sistema',
    icon: 'ComputerDesktopIcon'
  }
}

/**
 * Composable para gerenciar tema da aplicação
 * Suporta temas claro, escuro e automático (sistema)
 */
export function useTheme() {
  // Computed properties
  const currentTheme = computed(() => {
    if (theme.value === 'system') {
      return systemPreference.value
    }
    return theme.value
  })

  const isLight = computed(() => currentTheme.value === 'light')
  const isDarkMode = computed(() => currentTheme.value === 'dark')

  const themeOptions = computed(() => Object.values(themes))

  // Methods
  const setTheme = (newTheme) => {
    if (!themes[newTheme]) {
      console.warn(`Tema '${newTheme}' não é válido. Temas disponíveis: ${Object.keys(themes).join(', ')}`)
      return
    }

    theme.value = newTheme
    saveThemeToStorage(newTheme)
    applyTheme()
  }

  const toggleTheme = () => {
    if (theme.value === 'system') {
      setTheme('light')
    } else if (theme.value === 'light') {
      setTheme('dark')
    } else {
      setTheme('system')
    }
  }

  const toggleDarkMode = () => {
    setTheme(isDarkMode.value ? 'light' : 'dark')
  }

  const applyTheme = () => {
    const root = document.documentElement
    const effectiveTheme = currentTheme.value

    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Add current theme class
    root.classList.add(effectiveTheme)
    
    // Update isDark ref for reactivity
    isDark.value = effectiveTheme === 'dark'

    // Update meta theme-color for mobile browsers
    updateMetaThemeColor(effectiveTheme)

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('theme-changed', {
      detail: {
        theme: theme.value,
        effectiveTheme,
        isDark: isDark.value
      }
    }))
  }

  const updateMetaThemeColor = (effectiveTheme) => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      const colors = {
        light: '#ffffff',
        dark: '#1f2937'
      }
      metaThemeColor.setAttribute('content', colors[effectiveTheme] || colors.light)
    }
  }

  const detectSystemPreference = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemPreference.value = mediaQuery.matches ? 'dark' : 'light'
      return mediaQuery
    }
    return null
  }

  const saveThemeToStorage = (themeValue) => {
    try {
      localStorage.setItem('taskstream-theme', themeValue)
    } catch (error) {
      console.warn('Não foi possível salvar o tema no localStorage:', error)
    }
  }

  const loadThemeFromStorage = () => {
    try {
      const savedTheme = localStorage.getItem('taskstream-theme')
      if (savedTheme && themes[savedTheme]) {
        return savedTheme
      }
    } catch (error) {
      console.warn('Não foi possível carregar o tema do localStorage:', error)
    }
    return 'system' // Default theme
  }

  const initializeTheme = () => {
    // Detect system preference
    const mediaQuery = detectSystemPreference()
    
    // Load saved theme or use default
    const savedTheme = loadThemeFromStorage()
    theme.value = savedTheme

    // Apply initial theme
    applyTheme()

    // Listen for system preference changes
    if (mediaQuery) {
      const handleSystemThemeChange = (e) => {
        systemPreference.value = e.matches ? 'dark' : 'light'
        if (theme.value === 'system') {
          applyTheme()
        }
      }

      mediaQuery.addEventListener('change', handleSystemThemeChange)
      
      // Return cleanup function
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange)
      }
    }
  }

  const getThemeIcon = (themeName = theme.value) => {
    return themes[themeName]?.icon || 'SunIcon'
  }

  const getThemeLabel = (themeName = theme.value) => {
    return themes[themeName]?.label || 'Desconhecido'
  }

  // CSS custom properties helpers
  const setCSSVariable = (property, value) => {
    document.documentElement.style.setProperty(property, value)
  }

  const getCSSVariable = (property) => {
    return getComputedStyle(document.documentElement).getPropertyValue(property)
  }

  // Watch for theme changes
  watch(
    () => theme.value,
    () => {
      applyTheme()
    }
  )

  watch(
    () => systemPreference.value,
    () => {
      if (theme.value === 'system') {
        applyTheme()
      }
    }
  )

  // Initialize on mount
  let cleanup = null
  onMounted(() => {
    cleanup = initializeTheme()
  })

  // Cleanup function for manual cleanup if needed
  const destroy = () => {
    if (cleanup) {
      cleanup()
    }
  }

  return {
    // State
    theme: readonly(theme),
    isDark: readonly(isDark),
    systemPreference: readonly(systemPreference),
    
    // Computed
    currentTheme,
    isLight,
    isDarkMode,
    themeOptions,
    
    // Methods
    setTheme,
    toggleTheme,
    toggleDarkMode,
    getThemeIcon,
    getThemeLabel,
    setCSSVariable,
    getCSSVariable,
    initializeTheme,
    destroy,
    
    // Constants
    themes: readonly(themes)
  }
}

// Global theme state (singleton)
let globalThemeInstance = null

export function useGlobalTheme() {
  if (!globalThemeInstance) {
    globalThemeInstance = useTheme()
  }
  return globalThemeInstance
}

// Helper function to get current theme without reactivity
export function getCurrentTheme() {
  try {
    const savedTheme = localStorage.getItem('taskstream-theme')
    if (savedTheme && themes[savedTheme]) {
      if (savedTheme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return savedTheme
    }
  } catch (error) {
    console.warn('Erro ao obter tema atual:', error)
  }
  
  // Fallback to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}