<template>
  <div 
    class="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 hover:shadow-lg transition-shadow"
    :class="borderClass"
  >
    <div class="flex items-start justify-between">
      <!-- Conteúdo principal -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center mb-2">
          <span class="text-lg mr-2">{{ task.statusEmoji }}</span>
          <h3 class="text-lg font-semibold text-gray-900 truncate">
            {{ task.title }}
          </h3>
          <span class="ml-2 text-sm">{{ task.priorityEmoji }}</span>
        </div>
        
        <p v-if="task.description" class="text-gray-600 text-sm mb-3 line-clamp-2">
          {{ task.description }}
        </p>

        <!-- Tags e informações -->
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <span 
            :class="statusClasses"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          >
            {{ statusLabel }}
          </span>
          
          <span 
            :class="priorityClasses"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          >
            {{ priorityLabel }}
          </span>

          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {{ task.category }}
          </span>

          <span v-if="task.isOverdue && task.status !== 'completed'" 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            🚨 Vencida
          </span>
        </div>

        <!-- Data de vencimento -->
        <div v-if="task.dueDate" class="text-xs text-gray-500 mb-2">
          📅 Vence em: {{ formatDate(task.dueDate) }}
        </div>

        <!-- Data de criação -->
        <div class="text-xs text-gray-400">
          Criada em: {{ formatDate(task.createdAt) }}
        </div>
      </div>

      <!-- Ações -->
      <div class="flex flex-col ml-4 space-y-2">
        <button
          v-if="task.status !== 'completed'"
          @click="$emit('complete', task.id)"
          class="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
          title="Concluir tarefa"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
        </button>

        <button
          @click="$emit('edit', task)"
          class="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Editar tarefa"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          </svg>
        </button>

        <button
          @click="$emit('delete', task.id)"
          class="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Deletar tarefa"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 4a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 4a1 1 0 112 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'TaskCard',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  emits: ['complete', 'edit', 'delete'],
  setup(props) {
    const borderClass = computed(() => {
      const classes = {
        pending: 'border-gray-400',
        in_progress: 'border-yellow-400',
        completed: 'border-green-400'
      }
      return classes[props.task.status] || 'border-gray-400'
    })

    const statusClasses = computed(() => {
      const classes = {
        pending: 'bg-gray-100 text-gray-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800'
      }
      return classes[props.task.status] || 'bg-gray-100 text-gray-800'
    })

    const statusLabel = computed(() => {
      const labels = {
        pending: 'Pendente',
        in_progress: 'Em Andamento',
        completed: 'Concluída'
      }
      return labels[props.task.status] || 'Desconhecido'
    })

    const priorityClasses = computed(() => {
      const classes = {
        low: 'bg-blue-100 text-blue-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800'
      }
      return classes[props.task.priority] || 'bg-gray-100 text-gray-800'
    })

    const priorityLabel = computed(() => {
      const labels = {
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta'
      }
      return labels[props.task.priority] || 'Média'
    })

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      borderClass,
      statusClasses,
      statusLabel,
      priorityClasses,
      priorityLabel,
      formatDate
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
