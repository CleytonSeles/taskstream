const fastify = require('fastify')({ logger: true })

// Registrar plugins
fastify.register(require('@fastify/cors'), {
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174']
})

// Registrar rotas
fastify.register(require('./routes/health'), { prefix: '/api/v1' })
fastify.register(require('./routes/auth'), { prefix: '/api/v1/auth' })

// Rota raiz
fastify.get('/', async (request, reply) => {
  return { 
    message: 'TaskStream API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/v1/health',
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        profile: 'GET /api/v1/auth/me',
        logout: 'POST /api/v1/auth/logout'
      }
    }
  }
})

// Inicializar servidor
const start = async () => {
  try {
    const port = process.env.PORT || 3001
    await fastify.listen({ port, host: '0.0.0.0' })
    fastify.log.info(`TaskStream API running on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
