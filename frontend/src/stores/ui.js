import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useTheme } from '../composables/useTheme.js'
import { useLocalStorage } from '../composables/useLocalStorage.js'

export const useUIStore = defineStore('ui', () => {
  // Composables
  const theme = useTheme()
  const preferences = useLocalStorage('taskstream-ui-preferences', {
    sidebarCollapsed: false,
    sidebarVariant: 'default',
    headerVariant: 'default',
    compactMode: false,
    animationsEnabled: true,
    soundEnabled: false,
    notificationsEnabled: true,
    autoSave: true,
    language: 'pt-BR'
  })

  // Estado da interface
  const isLoading = ref(false)
  const loadingMessage = ref('')
  const sidebarCollapsed = ref(preferences.value.sidebarCollapsed || false)
  const sidebarVariant = ref(preferences.value.sidebarVariant || 'default')
  const headerVariant = ref(preferences.value.headerVariant || 'default')
  const compactMode = ref(preferences.value.compactMode || false)
  const animationsEnabled = ref(preferences.value.animationsEnabled !== false)
  const soundEnabled = ref(preferences.value.soundEnabled || false)
  const notificationsEnabled = ref(preferences.value.notificationsEnabled !== false)
  const autoSave = ref(preferences.value.autoSave !== false)
  const language = ref(preferences.value.language || 'pt-BR')

  // Estado dos modais
  const modals = ref(new Map())
  const activeModal = ref(null)

  // Estado das notificações
  const notifications = ref([])
  const maxNotifications = ref(5)

  // Estado do layout
  const layoutMode = ref('default') // default, fullscreen, focus
  const contentPadding = ref('normal') // compact, normal, spacious

  // Estado da busca global
  const globalSearch = ref({
    isOpen: false,
    query: '',
    results: [],
    isSearching: false
  })

  // Estado dos tooltips
  const tooltipsEnabled = ref(true)

  // Estado da navegação
  const breadcrumbs = ref([])
  const navigationHistory = ref([])

  // Computed properties
  const isDarkMode = computed(() => theme.isDark.value)
  const currentTheme = computed(() => theme.theme.value)
  
  const hasActiveModal = computed(() => activeModal.value !== null)
  const hasNotifications = computed(() => notifications.value.length > 0)
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read).length
  )

  const layoutClasses = computed(() => {
    const classes = []
    
    if (sidebarCollapsed.value) classes.push('sidebar-collapsed')
    if (compactMode.value) classes.push('compact-mode')
    if (layoutMode.value === 'fullscreen') classes.push('fullscreen-mode')
    if (layoutMode.value === 'focus') classes.push('focus-mode')
    if (!animationsEnabled.value) classes.push('no-animations')
    
    classes.push(`content-padding-${contentPadding.value}`)
    classes.push(`sidebar-${sidebarVariant.value}`)
    classes.push(`header-${headerVariant.value}`)
    
    return classes
  })

  const isMobile = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  })

  const isTablet = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= 768 && window.innerWidth < 1024
  })

  const isDesktop = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= 1024
  })

  // Actions
  const setLoading = (loading, message = '') => {
    isLoading.value = loading
    loadingMessage.value = message
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    updatePreferences()
  }

  const setSidebarCollapsed = (collapsed) => {
    sidebarCollapsed.value = collapsed
    updatePreferences()
  }

  const setSidebarVariant = (variant) => {
    sidebarVariant.value = variant
    updatePreferences()
  }

  const setHeaderVariant = (variant) => {
    headerVariant.value = variant
    updatePreferences()
  }

  const toggleCompactMode = () => {
    compactMode.value = !compactMode.value
    updatePreferences()
  }

  const setCompactMode = (compact) => {
    compactMode.value = compact
    updatePreferences()
  }

  const toggleAnimations = () => {
    animationsEnabled.value = !animationsEnabled.value
    updatePreferences()
    
    // Aplicar classe CSS globalmente
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('no-animations', !animationsEnabled.value)
    }
  }

  const setAnimationsEnabled = (enabled) => {
    animationsEnabled.value = enabled
    updatePreferences()
    
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('no-animations', !enabled)
    }
  }

  const toggleSound = () => {
    soundEnabled.value = !soundEnabled.value
    updatePreferences()
  }

  const setSoundEnabled = (enabled) => {
    soundEnabled.value = enabled
    updatePreferences()
  }

  const toggleNotifications = () => {
    notificationsEnabled.value = !notificationsEnabled.value
    updatePreferences()
  }

  const setNotificationsEnabled = (enabled) => {
    notificationsEnabled.value = enabled
    updatePreferences()
  }

  const toggleAutoSave = () => {
    autoSave.value = !autoSave.value
    updatePreferences()
  }

  const setAutoSave = (enabled) => {
    autoSave.value = enabled
    updatePreferences()
  }

  const setLanguage = (lang) => {
    language.value = lang
    updatePreferences()
  }

  const setLayoutMode = (mode) => {
    layoutMode.value = mode
  }

  const setContentPadding = (padding) => {
    contentPadding.value = padding
  }

  // Modal management
  const openModal = (id, props = {}) => {
    modals.value.set(id, { id, props, isOpen: true })
    activeModal.value = id
  }

  const closeModal = (id) => {
    if (modals.value.has(id)) {
      modals.value.delete(id)
    }
    
    if (activeModal.value === id) {
      // Encontrar o próximo modal ativo
      const remainingModals = Array.from(modals.value.keys())
      activeModal.value = remainingModals.length > 0 ? remainingModals[remainingModals.length - 1] : null
    }
  }

  const closeAllModals = () => {
    modals.value.clear()
    activeModal.value = null
  }

  const isModalOpen = (id) => {
    return modals.value.has(id)
  }

  const getModalProps = (id) => {
    return modals.value.get(id)?.props || {}
  }

  // Notification management
  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      persistent: false,
      read: false,
      createdAt: new Date(),
      ...notification
    }

    notifications.value.unshift(newNotification)

    // Limitar número de notificações
    if (notifications.value.length > maxNotifications.value) {
      notifications.value = notifications.value.slice(0, maxNotifications.value)
    }

    // Auto-remover se não for persistente
    if (!newNotification.persistent && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const markNotificationAsRead = (id) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const markAllNotificationsAsRead = () => {
    notifications.value.forEach(n => n.read = true)
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  // Notification shortcuts
  const showSuccess = (message, title = 'Sucesso') => {
    return addNotification({ type: 'success', title, message })
  }

  const showError = (message, title = 'Erro') => {
    return addNotification({ type: 'error', title, message, persistent: true })
  }

  const showWarning = (message, title = 'Atenção') => {
    return addNotification({ type: 'warning', title, message })
  }

  const showInfo = (message, title = 'Informação') => {
    return addNotification({ type: 'info', title, message })
  }

  // Global search
  const openGlobalSearch = () => {
    globalSearch.value.isOpen = true
    globalSearch.value.query = ''
    globalSearch.value.results = []
  }

  const closeGlobalSearch = () => {
    globalSearch.value.isOpen = false
    globalSearch.value.query = ''
    globalSearch.value.results = []
    globalSearch.value.isSearching = false
  }

  const setGlobalSearchQuery = (query) => {
    globalSearch.value.query = query
  }

  const setGlobalSearchResults = (results) => {
    globalSearch.value.results = results
  }

  const setGlobalSearching = (searching) => {
    globalSearch.value.isSearching = searching
  }

  // Breadcrumbs
  const setBreadcrumbs = (crumbs) => {
    breadcrumbs.value = crumbs
  }

  const addBreadcrumb = (crumb) => {
    breadcrumbs.value.push(crumb)
  }

  const removeBreadcrumb = (index) => {
    breadcrumbs.value.splice(index, 1)
  }

  const clearBreadcrumbs = () => {
    breadcrumbs.value = []
  }

  // Navigation history
  const addToHistory = (route) => {
    navigationHistory.value.unshift(route)
    
    // Limitar histórico
    if (navigationHistory.value.length > 50) {
      navigationHistory.value = navigationHistory.value.slice(0, 50)
    }
  }

  const clearHistory = () => {
    navigationHistory.value = []
  }

  // Tooltips
  const toggleTooltips = () => {
    tooltipsEnabled.value = !tooltipsEnabled.value
  }

  const setTooltipsEnabled = (enabled) => {
    tooltipsEnabled.value = enabled
  }

  // Utility methods
  const updatePreferences = () => {
    preferences.value = {
      sidebarCollapsed: sidebarCollapsed.value,
      sidebarVariant: sidebarVariant.value,
      headerVariant: headerVariant.value,
      compactMode: compactMode.value,
      animationsEnabled: animationsEnabled.value,
      soundEnabled: soundEnabled.value,
      notificationsEnabled: notificationsEnabled.value,
      autoSave: autoSave.value,
      language: language.value
    }
  }

  const resetToDefaults = () => {
    sidebarCollapsed.value = false
    sidebarVariant.value = 'default'
    headerVariant.value = 'default'
    compactMode.value = false
    animationsEnabled.value = true
    soundEnabled.value = false
    notificationsEnabled.value = true
    autoSave.value = true
    language.value = 'pt-BR'
    layoutMode.value = 'default'
    contentPadding.value = 'normal'
    tooltipsEnabled.value = true
    
    updatePreferences()
    theme.setTheme('system')
  }

  const exportSettings = () => {
    return {
      theme: theme.theme.value,
      preferences: preferences.value,
      layoutMode: layoutMode.value,
      contentPadding: contentPadding.value,
      tooltipsEnabled: tooltipsEnabled.value
    }
  }

  const importSettings = (settings) => {
    if (settings.theme) {
      theme.setTheme(settings.theme)
    }
    
    if (settings.preferences) {
      Object.assign(preferences.value, settings.preferences)
      
      // Aplicar preferências
      sidebarCollapsed.value = preferences.value.sidebarCollapsed
      sidebarVariant.value = preferences.value.sidebarVariant
      headerVariant.value = preferences.value.headerVariant
      compactMode.value = preferences.value.compactMode
      animationsEnabled.value = preferences.value.animationsEnabled
      soundEnabled.value = preferences.value.soundEnabled
      notificationsEnabled.value = preferences.value.notificationsEnabled
      autoSave.value = preferences.value.autoSave
      language.value = preferences.value.language
    }
    
    if (settings.layoutMode) {
      layoutMode.value = settings.layoutMode
    }
    
    if (settings.contentPadding) {
      contentPadding.value = settings.contentPadding
    }
    
    if (typeof settings.tooltipsEnabled === 'boolean') {
      tooltipsEnabled.value = settings.tooltipsEnabled
    }
  }

  // Watchers para responsividade
  if (typeof window !== 'undefined') {
    const handleResize = () => {
      // Auto-colapsar sidebar em mobile
      if (window.innerWidth < 768 && !sidebarCollapsed.value) {
        setSidebarCollapsed(true)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Executar uma vez na inicialização
  }

  // Aplicar configurações iniciais
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('no-animations', !animationsEnabled.value)
  }

  return {
    // State
    isLoading,
    loadingMessage,
    sidebarCollapsed,
    sidebarVariant,
    headerVariant,
    compactMode,
    animationsEnabled,
    soundEnabled,
    notificationsEnabled,
    autoSave,
    language,
    modals,
    activeModal,
    notifications,
    maxNotifications,
    layoutMode,
    contentPadding,
    globalSearch,
    tooltipsEnabled,
    breadcrumbs,
    navigationHistory,
    
    // Computed
    isDarkMode,
    currentTheme,
    hasActiveModal,
    hasNotifications,
    unreadNotifications,
    layoutClasses,
    isMobile,
    isTablet,
    isDesktop,
    
    // Theme actions (delegated)
    toggleTheme: theme.toggleTheme,
    setTheme: theme.setTheme,
    
    // Actions
    setLoading,
    toggleSidebar,
    setSidebarCollapsed,
    setSidebarVariant,
    setHeaderVariant,
    toggleCompactMode,
    setCompactMode,
    toggleAnimations,
    setAnimationsEnabled,
    toggleSound,
    setSoundEnabled,
    toggleNotifications,
    setNotificationsEnabled,
    toggleAutoSave,
    setAutoSave,
    setLanguage,
    setLayoutMode,
    setContentPadding,
    
    // Modal actions
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModalProps,
    
    // Notification actions
    addNotification,
    removeNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Global search actions
    openGlobalSearch,
    closeGlobalSearch,
    setGlobalSearchQuery,
    setGlobalSearchResults,
    setGlobalSearching,
    
    // Breadcrumb actions
    setBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    clearBreadcrumbs,
    
    // Navigation actions
    addToHistory,
    clearHistory,
    
    // Tooltip actions
    toggleTooltips,
    setTooltipsEnabled,
    
    // Utility actions
    updatePreferences,
    resetToDefaults,
    exportSettings,
    importSettings
  }
})