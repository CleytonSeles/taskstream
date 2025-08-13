const healthController = require('../controllers/healthController')

async function healthRoutes(fastify, options) {
  fastify.get('/health', healthController.getHealth)
}

module.exports = healthRoutes
