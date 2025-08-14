const authService = require('../services/authService')

class AuthController {
  // POST /api/v1/auth/register
  async register(request, reply) {
    try {
      const { name, email, password, role } = request.body

      if (!name || !email || !password) {
        return reply.status(400).send({
          error: 'Nome, email e senha são obrigatórios'
        })
      }

      const result = await authService.register({ name, email, password, role })

      reply.status(201).send({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: result
      })

    } catch (error) {
      reply.status(400).send({
        error: error.message
      })
    }
  }

  // POST /api/v1/auth/login
  async login(request, reply) {
    try {
      const { email, password } = request.body

      if (!email || !password) {
        return reply.status(400).send({
          error: 'Email e senha são obrigatórios'
        })
      }

      const result = await authService.login(email, password)

      reply.send({
        success: true,
        message: 'Login realizado com sucesso',
        data: result
      })

    } catch (error) {
      reply.status(401).send({
        error: error.message
      })
    }
  }

  // GET /api/v1/auth/me (rota protegida)
  async getProfile(request, reply) {
    try {
      // O usuário será injetado pelo middleware
      const user = request.user

      reply.send({
        success: true,
        data: {
          user: user.toJSON()
        }
      })

    } catch (error) {
      reply.status(500).send({
        error: 'Erro interno do servidor'
      })
    }
  }

  // POST /api/v1/auth/logout
  async logout(request, reply) {
    reply.send({
      success: true,
      message: 'Logout realizado com sucesso'
    })
  }
}

module.exports = new AuthController()
