<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4 py-4">
        <h1 class="text-3xl font-bold text-gray-800">
          🚀 TaskStream
        </h1>
        <p class="text-gray-600 mt-1">Sistema de Gerenciamento de Tarefas Colaborativo</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <ApiStatus />
      
      <RouterView />
    </main>
  </div>
</template>

<script>
import ApiStatus from './components/ApiStatus.vue'

export default {
  name: 'App',
  components: {
    ApiStatus
  }
}
</script>
