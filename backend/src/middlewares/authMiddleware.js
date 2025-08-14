const authService = require('../services/authService')

// Middleware para verificar autenticação
async function authMiddleware(request, reply) {
  try {
    // Obter token do header Authorization
    const authHeader = request.headers.authorization
    
    if (!authHeader) {
      return reply.status(401).send({
        error: 'Token de acesso requerido'
      })
    }

    // Extrair token (formato: "Bearer TOKEN")
    const token = authHeader.split(' ')[1]
    
    if (!token) {
      return reply.status(401).send({
        error: 'Token de acesso inválido'
      })
    }

    // Verificar e decodificar token
    const user = await authService.getUserFromToken(token)
    
    if (!user) {
      return reply.status(401).send({
        error: 'Usuário não encontrado'
      })
    }

    // Adicionar usuário à requisição
    request.user = user

  } catch (error) {
    return reply.status(401).send({
      error: 'Token inválido ou expirado'
    })
  }
}

// Middleware para verificar role de admin
async function adminMiddleware(request, reply) {
  if (request.user.role !== 'admin') {
    return reply.status(403).send({
      error: 'Acesso negado: permissões de administrador requeridas'
    })
  }
}

module.exports = {
  authMiddleware,
  adminMiddleware
}
