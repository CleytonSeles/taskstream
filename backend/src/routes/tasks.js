const taskController = require('../controllers/taskController')
const { authMiddleware } = require('../middlewares/authMiddleware')

async function taskRoutes(fastify, options) {
  // Todas as rotas de tarefas precisam de autenticação
  fastify.addHook('preHandler', authMiddleware)

  // GET /tasks - Listar tarefas
  fastify.get('/', taskController.getTasks)

  // GET /tasks/stats - Estatísticas do usuário
  fastify.get('/stats', taskController.getUserStats)

  // GET /tasks/:id - Obter tarefa específica
  fastify.get('/:id', taskController.getTaskById)

  // POST /tasks - Criar nova tarefa
  fastify.post('/', taskController.createTask)

  // PUT /tasks/:id - Atualizar tarefa
  fastify.put('/:id', taskController.updateTask)

  // DELETE /tasks/:id - Deletar tarefa
  fastify.delete('/:id', taskController.deleteTask)

  // PATCH /tasks/:id/complete - Marcar como concluída
  fastify.patch('/:id/complete', taskController.completeTask)

  // PATCH /tasks/:id/assign - Atribuir tarefa
  fastify.patch('/:id/assign', taskController.assignTask)
}

module.exports = taskRoutes
