const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com PostgreSQL...')
    
    // Teste de conexão
    await prisma.$connect()
    console.log('✅ Conexão com PostgreSQL estabelecida!')
    
    // Teste de consulta
    const userCount = await prisma.user.count()
    const taskCount = await prisma.task.count()
    
    console.log(`👥 Usuários no banco: ${userCount}`)
    console.log(`📋 Tarefas no banco: ${taskCount}`)
    
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()