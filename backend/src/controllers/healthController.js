class HealthController {
  async getHealth(request, reply) {
    return {
      status: 'ok',
      service: 'TaskStream API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  }
}

module.exports = new HealthController()
