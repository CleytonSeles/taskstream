<template>
  <!-- Overlay -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="closeModal"
  >
    <!-- Modal -->
    <div 
      class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEditing ? '✏️ Editar Tarefa' : '➕ Nova Tarefa' }}
        </h3>
        <button 
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="handleSubmit">
        <!-- Título -->
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            maxlength="100"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Digite o título da tarefa"
          />
        </div>

        <!-- Descrição -->
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            maxlength="500"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descreva a tarefa (opcional)"
          ></textarea>
        </div>

        <!-- Status e Prioridade -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              v-model="form.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">⏳ Pendente</option>
              <option value="in_progress">🔄 Em Andamento</option>
              <option value="completed">✅ Concluída</option>
            </select>
          </div>

          <div>
            <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <select
              id="priority"
              v-model="form.priority"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">🟢 Baixa</option>
              <option value="medium">🟡 Média</option>
              <option value="high">🔴 Alta</option>
            </select>
          </div>
        </div>

        <!-- Categoria e Data -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <input
              id="category"
              v-model="form.category"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ex: backend, frontend, devops"
            />
          </div>

          <div>
            <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-2">
              Data de Vencimento
            </label>
            <input
              id="dueDate"
              v-model="form.dueDate"
              type="datetime-local"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Erro -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-600 text-sm">{{ error }}</p>
        </div>

        <!-- Botões -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </span>
            <span v-else>
              {{ isEditing ? 'Salvar Alterações' : 'Criar Tarefa' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'

export default {
  name: 'TaskModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    task: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const error = ref(null)
    const form = ref({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      category: 'general',
      dueDate: ''
    })

    const isEditing = computed(() => !!props.task)

    // Resetar formulário quando abre/fecha
    watch(() => props.isOpen, (isOpen) => {
      if (isOpen) {
        if (props.task) {
          // Modo edição
          form.value = {
            title: props.task.title,
            description: props.task.description || '',
            status: props.task.status,
            priority: props.task.priority,
            category: props.task.category,
            dueDate: props.task.dueDate ? new Date(props.task.dueDate).toISOString().slice(0, 16) : ''
          }
        } else {
          // Modo criação
          form.value = {
            title: '',
            description: '',
            status: 'pending',
            priority: 'medium',
            category: 'general',
            dueDate: ''
          }
        }
        error.value = null
      }
    })

    const closeModal = () => {
      emit('close')
    }

    const handleSubmit = async () => {
      error.value = null

      if (!form.value.title.trim()) {
        error.value = 'Título é obrigatório'
        return
      }

      try {
        const taskData = { ...form.value }
        
        // Converter data se fornecida
        if (taskData.dueDate) {
          taskData.dueDate = new Date(taskData.dueDate).toISOString()
        }

        emit('submit', taskData)
      } catch (err) {
        error.value = err.message
      }
    }

    return {
      form,
      error,
      isEditing,
      closeModal,
      handleSubmit
    }
  }
}
</script>
