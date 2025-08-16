import { ref, watch, nextTick } from 'vue'

/**
 * Composable para gerenciar localStorage de forma reativa
 * @param {string} key - Chave do localStorage
 * @param {*} defaultValue - Valor padrão se não existir no localStorage
 * @param {Object} options - Opções de configuração
 */
export function useLocalStorage(key, defaultValue = null, options = {}) {
  const {
    serializer = {
      read: JSON.parse,
      write: JSON.stringify
    },
    syncAcrossTabs = true,
    onError = (error) => console.error('useLocalStorage error:', error)
  } = options

  // Função para ler do localStorage
  const read = () => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return serializer.read(item)
    } catch (error) {
      onError(error)
      return defaultValue
    }
  }

  // Função para escrever no localStorage
  const write = (value) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, serializer.write(value))
      }
    } catch (error) {
      onError(error)
    }
  }

  // Estado reativo
  const storedValue = read()
  const state = ref(storedValue)

  // Watcher para sincronizar mudanças
  watch(
    state,
    (newValue) => {
      write(newValue)
    },
    { deep: true }
  )

  // Listener para mudanças em outras abas
  if (syncAcrossTabs && typeof window !== 'undefined') {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== serializer.write(state.value)) {
        try {
          state.value = e.newValue ? serializer.read(e.newValue) : defaultValue
        } catch (error) {
          onError(error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Cleanup function
    const cleanup = () => {
      window.removeEventListener('storage', handleStorageChange)
    }

    // Return cleanup function for manual cleanup
    state.cleanup = cleanup
  }

  return state
}

/**
 * Composable para gerenciar múltiplas chaves do localStorage
 * @param {Object} keys - Objeto com chaves e valores padrão
 * @param {Object} options - Opções de configuração
 */
export function useLocalStorageState(keys, options = {}) {
  const state = {}
  const cleanupFunctions = []

  for (const [key, defaultValue] of Object.entries(keys)) {
    const storageRef = useLocalStorage(key, defaultValue, options)
    state[key] = storageRef
    
    if (storageRef.cleanup) {
      cleanupFunctions.push(storageRef.cleanup)
    }
  }

  // Cleanup all listeners
  const cleanup = () => {
    cleanupFunctions.forEach(fn => fn())
  }

  return {
    ...state,
    cleanup
  }
}

/**
 * Composable para cache com expiração
 * @param {string} key - Chave do localStorage
 * @param {*} defaultValue - Valor padrão
 * @param {number} ttl - Time to live em milissegundos
 */
export function useLocalStorageCache(key, defaultValue = null, ttl = 24 * 60 * 60 * 1000) {
  const cacheKey = `cache_${key}`
  
  const serializer = {
    read: (value) => {
      const parsed = JSON.parse(value)
      const now = Date.now()
      
      if (parsed.expiry && now > parsed.expiry) {
        localStorage.removeItem(cacheKey)
        return defaultValue
      }
      
      return parsed.data
    },
    write: (value) => {
      const expiry = ttl ? Date.now() + ttl : null
      return JSON.stringify({
        data: value,
        expiry
      })
    }
  }

  const state = useLocalStorage(cacheKey, defaultValue, { serializer })

  // Método para limpar o cache
  const clear = () => {
    state.value = defaultValue
  }

  // Método para verificar se o cache é válido
  const isValid = () => {
    try {
      const item = localStorage.getItem(cacheKey)
      if (!item) return false
      
      const parsed = JSON.parse(item)
      return !parsed.expiry || Date.now() <= parsed.expiry
    } catch {
      return false
    }
  }

  // Método para renovar o TTL
  const refresh = () => {
    if (state.value !== defaultValue) {
      const currentValue = state.value
      state.value = currentValue // Trigger write with new expiry
    }
  }

  return {
    value: state,
    clear,
    isValid,
    refresh,
    cleanup: state.cleanup
  }
}

/**
 * Composable para preferências do usuário
 */
export function useUserPreferences() {
  const preferences = useLocalStorageState({
    theme: 'system',
    language: 'pt-BR',
    sidebarCollapsed: false,
    notificationsEnabled: true,
    autoSave: true,
    compactMode: false,
    animationsEnabled: true,
    soundEnabled: false
  })

  // Métodos de conveniência
  const setPreference = (key, value) => {
    if (preferences[key]) {
      preferences[key].value = value
    }
  }

  const getPreference = (key) => {
    return preferences[key]?.value
  }

  const resetPreferences = () => {
    preferences.theme.value = 'system'
    preferences.language.value = 'pt-BR'
    preferences.sidebarCollapsed.value = false
    preferences.notificationsEnabled.value = true
    preferences.autoSave.value = true
    preferences.compactMode.value = false
    preferences.animationsEnabled.value = true
    preferences.soundEnabled.value = false
  }

  const exportPreferences = () => {
    const exported = {}
    for (const [key, ref] of Object.entries(preferences)) {
      if (key !== 'cleanup') {
        exported[key] = ref.value
      }
    }
    return exported
  }

  const importPreferences = (importedPrefs) => {
    for (const [key, value] of Object.entries(importedPrefs)) {
      if (preferences[key]) {
        preferences[key].value = value
      }
    }
  }

  return {
    preferences,
    setPreference,
    getPreference,
    resetPreferences,
    exportPreferences,
    importPreferences,
    cleanup: preferences.cleanup
  }
}

/**
 * Composable para histórico de ações (undo/redo)
 * @param {string} key - Chave do localStorage
 * @param {number} maxHistory - Máximo de itens no histórico
 */
export function useLocalStorageHistory(key, maxHistory = 50) {
  const historyKey = `history_${key}`
  const history = useLocalStorage(historyKey, [])
  const currentIndex = useLocalStorage(`${historyKey}_index`, -1)

  const push = (item) => {
    const newHistory = [...history.value]
    
    // Remove items após o índice atual (para redo)
    if (currentIndex.value < newHistory.length - 1) {
      newHistory.splice(currentIndex.value + 1)
    }
    
    // Adiciona novo item
    newHistory.push({
      data: item,
      timestamp: Date.now()
    })
    
    // Limita o tamanho do histórico
    if (newHistory.length > maxHistory) {
      newHistory.shift()
    } else {
      currentIndex.value++
    }
    
    history.value = newHistory
  }

  const undo = () => {
    if (canUndo.value) {
      currentIndex.value--
      return history.value[currentIndex.value]?.data
    }
    return null
  }

  const redo = () => {
    if (canRedo.value) {
      currentIndex.value++
      return history.value[currentIndex.value]?.data
    }
    return null
  }

  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)

  const clear = () => {
    history.value = []
    currentIndex.value = -1
  }

  const getCurrent = () => {
    return history.value[currentIndex.value]?.data
  }

  return {
    history: readonly(history),
    currentIndex: readonly(currentIndex),
    push,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    getCurrent
  }
}

/**
 * Utilitários para localStorage
 */
export const localStorageUtils = {
  // Verifica se localStorage está disponível
  isAvailable() {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  },

  // Obtém o tamanho usado do localStorage
  getSize() {
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  },

  // Limpa itens expirados
  clearExpired() {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key))
          if (item.expiry && Date.now() > item.expiry) {
            localStorage.removeItem(key)
          }
        } catch {
          // Item inválido, remove
          localStorage.removeItem(key)
        }
      }
    })
  },

  // Exporta todos os dados
  exportAll() {
    const data = {}
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        data[key] = localStorage[key]
      }
    }
    return data
  },

  // Importa dados
  importAll(data) {
    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(key, value)
    }
  }
}