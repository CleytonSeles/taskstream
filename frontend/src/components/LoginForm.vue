<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
    
    <!-- Floating Elements -->
    <div class="absolute top-20 left-10 w-20 h-20 bg-primary-200 dark:bg-primary-800 rounded-full opacity-20 animate-bounce-soft"></div>
    <div class="absolute bottom-20 right-10 w-16 h-16 bg-secondary-200 dark:bg-secondary-800 rounded-full opacity-20 animate-pulse-soft"></div>
    <div class="absolute top-1/2 left-20 w-12 h-12 bg-accent-200 dark:bg-accent-800 rounded-full opacity-20 animate-bounce-soft" style="animation-delay: 1s;"></div>
    
    <div class="relative max-w-md w-full space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="text-center animate-slide-down">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl mb-6 shadow-lg animate-scale-in">
          <span class="text-2xl">🚀</span>
        </div>
        <h2 class="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
          TaskStream
        </h2>
        <p class="mt-3 text-gray-600 dark:text-gray-300 text-lg">
          {{ isLogin ? 'Bem-vindo de volta!' : 'Junte-se a nós hoje' }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ isLogin ? 'Faça login em sua conta' : 'Crie sua conta gratuita' }}
        </p>
      </div>

      <!-- Login Card -->
      <Card 
        variant="elevated" 
        size="lg" 
        class="animate-slide-up glass backdrop-blur-sm border border-white/20 dark:border-gray-700/50"
        :padding="8"
      >
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Nome (apenas para registro) -->
          <Transition
            name="slide-fade"
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 transform -translate-y-4"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 transform translate-y-0"
            leave-to-class="opacity-0 transform -translate-y-4"
          >
            <div v-if="!isLogin">
              <Input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Nome completo"
                size="lg"
                variant="outlined"
                :icon-left="UserIcon"
                required
                class="animate-slide-down"
              />
            </div>
          </Transition>

          <!-- Email -->
          <div class="animate-slide-down" style="animation-delay: 0.1s;">
            <Input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Seu melhor email"
              size="lg"
              variant="outlined"
              :icon-left="MailIcon"
              required
            />
          </div>

          <!-- Senha -->
          <div class="animate-slide-down" style="animation-delay: 0.2s;">
            <Input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Senha segura"
              size="lg"
              variant="outlined"
              :icon-left="LockIcon"
              required
            />
          </div>

          <!-- Erro -->
          <Transition
            name="error-fade"
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 transform scale-95"
            enter-to-class="opacity-100 transform scale-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 transform scale-100"
            leave-to-class="opacity-0 transform scale-95"
          >
            <div v-if="authStore.error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div class="flex items-center">
                <AlertCircleIcon class="w-5 h-5 text-red-500 mr-2" />
                <p class="text-red-700 dark:text-red-300 text-sm font-medium">
                  {{ authStore.error }}
                </p>
              </div>
            </div>
          </Transition>

          <!-- Botão Submit -->
          <div class="animate-slide-up" style="animation-delay: 0.3s;">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              :loading="authStore.loading"
              :disabled="authStore.loading"
              full-width
              class="font-semibold text-lg py-4 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <template v-if="!authStore.loading">
                <component :is="isLogin ? LogInIcon : UserPlusIcon" class="w-5 h-5 mr-2" />
                {{ isLogin ? 'Entrar' : 'Criar Conta' }}
              </template>
              <template v-else>
                Processando...
              </template>
            </Button>
          </div>

          <!-- Divider -->
          <div class="relative animate-fade-in" style="animation-delay: 0.4s;">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                ou
              </span>
            </div>
          </div>

          <!-- Toggle Login/Register -->
          <div class="text-center animate-slide-up" style="animation-delay: 0.5s;">
            <Button
              type="button"
              variant="ghost"
              size="md"
              @click="toggleMode"
              class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-all duration-200"
            >
              {{ isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Faça login' }}
            </Button>
          </div>
        </form>
      </Card>

      <!-- Footer -->
      <div class="text-center text-xs text-gray-500 dark:text-gray-400 animate-fade-in" style="animation-delay: 0.6s;">
        <p>Ao continuar, você concorda com nossos</p>
        <div class="flex items-center justify-center space-x-4 mt-1">
          <a href="#" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Termos de Uso</a>
          <span>•</span>
          <a href="#" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Política de Privacidade</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { authService } from '@/services/authService.js'

// Componentes do Design System
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'

// Ícones Lucide
import { 
  User as UserIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  LogIn as LogInIcon,
  UserPlus as UserPlusIcon,
  AlertCircle as AlertCircleIcon
} from 'lucide-vue-next'

export default {
  name: 'LoginForm',
  components: {
    Button,
    Input,
    Card,
    UserIcon,
    MailIcon,
    LockIcon,
    LogInIcon,
    UserPlusIcon,
    AlertCircleIcon
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const isLogin = ref(true)
    const form = ref({
      name: '',
      email: '',
      password: ''
    })

    const toggleMode = () => {
      isLogin.value = !isLogin.value
      authStore.setError(null)
      form.value = { name: '', email: '', password: '' }
    }

    const handleSubmit = async () => {
      try {
        if (isLogin.value) {
          await authService.loginWithStore({
            email: form.value.email,
            password: form.value.password
          })
        } else {
          await authService.registerWithStore({
            name: form.value.name,
            email: form.value.email,
            password: form.value.password
          })
        }

        // Redirecionar para dashboard
        router.push('/dashboard')
        
      } catch (error) {
        // Erro já foi tratado no service
        console.error('Erro na autenticação:', error.message)
      }
    }

    return {
      isLogin,
      form,
      authStore,
      toggleMode,
      handleSubmit,
      // Ícones
      UserIcon,
      MailIcon,
      LockIcon,
      LogInIcon,
      UserPlusIcon,
      AlertCircleIcon
    }
  }
}
</script>

<style scoped>
/* Background Grid Pattern */
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Glass Morphism Effect */
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.dark .glass {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Animações Customizadas */
@keyframes slide-fade-enter {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-fade-leave {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

/* Hover Effects */
.hover-lift {
  transition: transform 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

/* Focus Ring Enhancement */
.focus-ring-enhanced:focus {
  outline: none;
  box-shadow: 
    0 0 0 3px rgba(59, 130, 246, 0.1),
    0 0 0 1px rgba(59, 130, 246, 0.3);
}

/* Gradient Text Animation */
.gradient-text {
  background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Floating Elements Animation */
.floating {
  animation: floating 3s ease-in-out infinite;
}

@keyframes floating {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Card Entrance Animation */
.card-entrance {
  animation: cardEntrance 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes cardEntrance {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Button Pulse Effect */
.btn-pulse {
  position: relative;
  overflow: hidden;
}

.btn-pulse::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: width 0.6s, height 0.6s, top 0.6s, left 0.6s;
  transform: translate(-50%, -50%);
}

.btn-pulse:active::before {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .floating-elements {
    display: none;
  }
  
  .glass {
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
}

/* Dark Mode Transitions */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

/* Loading State Enhancements */
.loading-overlay {
  position: relative;
}

.loading-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  border-radius: inherit;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.loading-overlay.loading::after {
  opacity: 1;
  pointer-events: all;
}
</style>
