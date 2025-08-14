<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            🚀 TaskStream
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            Sistema de Gerenciamento de Tarefas Colaborativo
          </p>
          <div class="space-x-4">
            <router-link 
              to="/login" 
              class="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Fazer Login
            </router-link>
            <router-link 
              to="/dashboard" 
              class="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
            >
              Dashboard
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>