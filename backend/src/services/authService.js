const jwt = require('jsonwebtoken')
const userRepository = require('../repositories/userRepository')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

class AuthService {
  // Registrar novo usuário
  async register(userData) {
    const validation = User.validate(userData)
    
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`)
    }

    // Verificar se email já existe
    if (await userRepository.emailExists(userData.email)) {
      throw new Error('Email já está em uso')
    }

    // Criar usuário
    const user = await userRepository.create(userData)
    
    // Gerar token
    const token = this.generateToken(user)

    return {
      user: user.toJSON(),
      token
    }
  }

  // Login de usuário
  async login(email, password) {
    const user = await userRepository.findByEmail(email)
    
    if (!user) {
      throw new Error('Credenciais inválidas')
    }

    const isPasswordValid = await user.comparePassword(password)
    
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas')
    }

    const token = this.generateToken(user)

    return {
      user: user.toJSON(),
      token
    }
  }

  // Gerar JWT token
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  }

  // Verificar token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      throw new Error('Token inválido')
    }
  }

  // Obter usuário pelo token
  async getUserFromToken(token) {
    const decoded = this.verifyToken(token)
    return await userRepository.findById(decoded.id)
  }
}

module.exports = new AuthService()
