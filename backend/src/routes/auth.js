const authController = require('../controllers/authController')
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware')

async function authRoutes(fastify, options) {
  // Rotas públicas
  fastify.post('/register', authController.register)
  fastify.post('/login', authController.login)

  // Rotas protegidas
  fastify.get('/me', { 
    preHandler: [authMiddleware] 
  }, authController.getProfile)

  fastify.post('/logout', { 
    preHandler: [authMiddleware] 
  }, authController.logout)

  // Exemplo de rota protegida para admins
  fastify.get('/admin-only', { 
    preHandler: [authMiddleware, adminMiddleware] 
  }, async (request, reply) => {
    return {
      message: 'Esta é uma rota apenas para administradores',
      user: request.user.toJSON()
    }
  })
}

module.exports = authRoutes
