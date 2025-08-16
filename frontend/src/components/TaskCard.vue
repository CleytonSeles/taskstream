<template>
  <Card 
    :variant="cardVariant"
    class="task-card group mb-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
    :class="[
      borderClass,
      { 'opacity-75': task.status === 'completed' },
      'animate-slide-up'
    ]"
    @click="handleCardClick"
  >
    <!-- Indicador de prioridade -->
    <div 
      class="absolute top-0 left-0 w-1 h-full rounded-l-lg"
      :class="priorityIndicatorClass"
    ></div>

    <!-- Cabeçalho da tarefa -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center space-x-3 flex-1 min-w-0">
        <!-- Ícone de status -->
        <div 
          class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
          :class="statusIconClass"
        >
          <component :is="statusIcon" class="w-5 h-5" />
        </div>

        <!-- Título e prioridade -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1">
            <h3 
              class="text-lg font-semibold truncate transition-colors duration-300"
              :class="task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'"
            >
              {{ task.title }}
            </h3>
            <Badge 
              :variant="priorityBadgeVariant"
              size="sm"
              class="flex-shrink-0"
            >
              <component :is="priorityIcon" class="w-3 h-3 mr-1" />
              {{ priorityLabel }}
            </Badge>
          </div>
          
          <!-- Categoria -->
          <Badge variant="outline" size="sm" class="text-xs">
            <FolderIcon class="w-3 h-3 mr-1" />
            {{ task.category }}
          </Badge>
        </div>
      </div>

      <!-- Menu de ações -->
      <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          v-if="task.status !== 'completed'"
          variant="ghost"
          size="sm"
          @click.stop="$emit('complete', task.id)"
          class="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
          title="Concluir tarefa"
        >
          <CheckIcon class="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          @click.stop="$emit('edit', task)"
          class="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          title="Editar tarefa"
        >
          <EditIcon class="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          @click.stop="$emit('delete', task.id)"
          class="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Deletar tarefa"
        >
          <TrashIcon class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Descrição -->
    <div v-if="task.description" class="mb-4">
      <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
        {{ task.description }}
      </p>
    </div>

    <!-- Tags e status -->
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <Badge :variant="statusBadgeVariant" size="sm">
        <component :is="statusIcon" class="w-3 h-3 mr-1" />
        {{ statusLabel }}
      </Badge>

      <Badge 
        v-if="task.isOverdue && task.status !== 'completed'" 
        variant="destructive"
        size="sm"
        class="animate-pulse"
      >
        <AlertTriangleIcon class="w-3 h-3 mr-1" />
        Vencida
      </Badge>
    </div>

    <!-- Informações de data -->
    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
      <div v-if="task.dueDate" class="flex items-center space-x-1">
        <CalendarIcon class="w-3 h-3" />
        <span>Vence: {{ formatDate(task.dueDate) }}</span>
      </div>
      
      <div class="flex items-center space-x-1">
        <ClockIcon class="w-3 h-3" />
        <span>{{ formatDate(task.createdAt) }}</span>
      </div>
    </div>

    <!-- Barra de progresso (se aplicável) -->
    <div v-if="task.status === 'in_progress'" class="mt-4">
      <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>Progresso</span>
        <span>{{ task.progress || 0 }}%</span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
          :style="{ width: `${task.progress || 0}%` }"
        ></div>
      </div>
    </div>
  </Card>
</template>

<script>
import { computed } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import {
  CheckIcon,
  EditIcon,
  TrashIcon,
  ClockIcon,
  CalendarIcon,
  FolderIcon,
  AlertTriangleIcon,
  CircleIcon,
  PlayIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ZapIcon,
  TrendingUpIcon
} from 'lucide-vue-next'

export default {
  name: 'TaskCard',
  components: {
    Card,
    Button,
    Badge,
    CheckIcon,
    EditIcon,
    TrashIcon,
    ClockIcon,
    CalendarIcon,
    FolderIcon,
    AlertTriangleIcon,
    CircleIcon,
    PlayIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    ZapIcon,
    TrendingUpIcon
  },
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  emits: ['complete', 'edit', 'delete', 'click'],
  setup(props, { emit }) {
    // Variante do card baseada no status
    const cardVariant = computed(() => {
      if (props.task.status === 'completed') return 'outline'
      if (props.task.isOverdue && props.task.status !== 'completed') return 'destructive'
      return 'elevated'
    })

    // Classes de borda lateral para indicar status
    const borderClass = computed(() => {
      const classes = {
        pending: 'border-l-4 border-l-gray-400',
        in_progress: 'border-l-4 border-l-blue-500',
        completed: 'border-l-4 border-l-green-500'
      }
      return classes[props.task.status] || 'border-l-4 border-l-gray-400'
    })

    // Indicador de prioridade na lateral
    const priorityIndicatorClass = computed(() => {
      const classes = {
        low: 'bg-blue-500',
        medium: 'bg-yellow-500',
        high: 'bg-red-500'
      }
      return classes[props.task.priority] || 'bg-gray-400'
    })

    // Ícone de status
    const statusIcon = computed(() => {
      const icons = {
        pending: 'CircleIcon',
        in_progress: 'PlayIcon',
        completed: 'CheckCircleIcon'
      }
      return icons[props.task.status] || 'CircleIcon'
    })

    // Classes do ícone de status
    const statusIconClass = computed(() => {
      const classes = {
        pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        in_progress: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        completed: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
      }
      return classes[props.task.status] || 'bg-gray-100 text-gray-600'
    })

    // Variante do badge de status
    const statusBadgeVariant = computed(() => {
      const variants = {
        pending: 'secondary',
        in_progress: 'default',
        completed: 'success'
      }
      return variants[props.task.status] || 'secondary'
    })

    const statusLabel = computed(() => {
      const labels = {
        pending: 'Pendente',
        in_progress: 'Em Andamento',
        completed: 'Concluída'
      }
      return labels[props.task.status] || 'Desconhecido'
    })

    // Ícone de prioridade
    const priorityIcon = computed(() => {
      const icons = {
        low: 'TrendingUpIcon',
        medium: 'AlertCircleIcon',
        high: 'ZapIcon'
      }
      return icons[props.task.priority] || 'AlertCircleIcon'
    })

    // Variante do badge de prioridade
    const priorityBadgeVariant = computed(() => {
      const variants = {
        low: 'outline',
        medium: 'secondary',
        high: 'destructive'
      }
      return variants[props.task.priority] || 'secondary'
    })

    const priorityLabel = computed(() => {
      const labels = {
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta'
      }
      return labels[props.task.priority] || 'Média'
    })

    // Manipulador de clique no card
    const handleCardClick = () => {
      emit('click', props.task)
    }

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
      cardVariant,
      borderClass,
      priorityIndicatorClass,
      statusIcon,
      statusIconClass,
      statusBadgeVariant,
      statusLabel,
      priorityIcon,
      priorityBadgeVariant,
      priorityLabel,
      handleCardClick,
      formatDate
    }
  }
}
</script>

<style scoped>
/* Animações de entrada */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes progressPulse {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Card com animação de entrada */
.task-card {
  animation: slideInUp 0.3s ease-out;
  transition: all 0.2s ease-in-out;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Indicador de prioridade */
.priority-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  border-radius: 0 0.5rem 0.5rem 0;
}

/* Ícone de status com animação */
.status-icon {
  transition: all 0.2s ease-in-out;
}

.status-icon:hover {
  transform: scale(1.1);
}

/* Menu de ações com fade */
.actions-menu {
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.2s ease-in-out;
}

.task-card:hover .actions-menu {
  opacity: 1;
  transform: translateX(0);
}

/* Barra de progresso animada */
.progress-bar {
  background: linear-gradient(
    90deg,
    #3b82f6,
    #1d4ed8,
    #3b82f6
  );
  background-size: 200% 100%;
  animation: progressPulse 2s ease-in-out infinite;
}

/* Efeitos de hover para badges */
.badge-hover {
  transition: all 0.2s ease-in-out;
}

.badge-hover:hover {
  transform: scale(1.05);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsividade */
@media (max-width: 640px) {
  .task-card {
    margin-bottom: 0.75rem;
  }
  
  .actions-menu {
    opacity: 1;
    transform: translateX(0);
    position: static;
    margin-top: 0.75rem;
    justify-content: center;
  }
  
  .priority-indicator {
    width: 100%;
    height: 4px;
    top: 0;
    right: 0;
    border-radius: 0.5rem 0.5rem 0 0;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .task-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
}
</style>
