<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            👑 Painel Administrativo
          </h1>
          <p class="text-gray-600 mb-8">
            Área restrita para administradores do sistema.
          </p>
          <router-link 
            to="/dashboard" 
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Voltar ao Dashboard
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminView'
}
</script>