const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  await prisma.task.deleteMany()
  await prisma.user.deleteMany()

  // Criar usuários
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin TaskStream',
      email: 'admin@taskstream.com',
      password: await bcrypt.hash('password', 10),
      role: 'admin'
    }
  })

  const regularUser = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@taskstream.com',
      password: await bcrypt.hash('123456', 10),
      role: 'user'
    }
  })

  const regularUser2 = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@taskstream.com',
      password: await bcrypt.hash('123456', 10),
      role: 'user'
    }
  })

  console.log('👥 Usuários criados:', { adminUser: adminUser.email, regularUser: regularUser.email, regularUser2: regularUser2.email })

  // Criar tarefas
  const tasks = [
    {
      title: 'Implementar autenticação JWT',
      description: 'Sistema completo de login e registro com tokens JWT seguros',
      status: 'completed',
      priority: 'high',
      category: 'backend',
      userId: adminUser.id,
      dueDate: new Date(Date.now() - 86400000), // ontem
      completedAt: new Date(Date.now() - 43200000) // 12h atrás
    },
    {
      title: 'Criar dashboard responsivo',
      description: 'Interface principal com estatísticas em tempo real e navegação intuitiva',
      status: 'completed',
      priority: 'high',
      category: 'frontend',
      userId: adminUser.id,
      dueDate: new Date(Date.now() - 86400000),
      completedAt: new Date(Date.now() - 21600000) // 6h atrás
    },
    {
      title: 'Configurar banco PostgreSQL',
      description: 'Setup do banco de dados PostgreSQL com Prisma ORM e migrations',
      status: 'completed',
      priority: 'high',
      category: 'devops',
      userId: adminUser.id,
      dueDate: new Date(),
      completedAt: new Date()
    },
    {
      title: 'Implementar CRUD de tarefas',
      description: 'Sistema completo de gerenciamento de tarefas com filtros e validações',
      status: 'in_progress',
      priority: 'high',
      category: 'backend',
      userId: regularUser.id,
      dueDate: new Date(Date.now() + 86400000) // amanhã
    },
    {
      title: 'Adicionar filtros avançados',
      description: 'Filtros por status, prioridade, categoria e busca em tempo real',
      status: 'in_progress',
      priority: 'medium',
      category: 'frontend',
      userId: regularUser.id,
      assignedToId: regularUser2.id,
      dueDate: new Date(Date.now() + 172800000) // 2 dias
    },
    {
      title: 'Configurar deploy AWS Lambda',
      description: 'Deploy serverless da API com AWS Lambda e CloudFormation',
      status: 'pending',
      priority: 'high',
      category: 'devops',
      userId: adminUser.id,
      dueDate: new Date(Date.now() + 259200000) // 3 dias
    },
    {
      title: 'Implementar testes automatizados',
      description: 'Testes unitários com Jest e testes e2e com Playwright',
      status: 'pending',
      priority: 'medium',
      category: 'testing',
      userId: regularUser2.id,
      dueDate: new Date(Date.now() + 432000000) // 5 dias
    },
    {
      title: 'Adicionar sistema de notificações',
      description: 'Notificações em tempo real para atualizações de tarefas',
      status: 'pending',
      priority: 'low',
      category: 'feature',
      userId: regularUser.id,
      dueDate: new Date(Date.now() + 604800000) // 7 dias
    },
    {
      title: 'Criar relatórios de produtividade',
      description: 'Dashboard com gráficos e métricas de performance da equipe',
      status: 'pending',
      priority: 'medium',
      category: 'analytics',
      userId: adminUser.id,
      assignedToId: regularUser.id,
      dueDate: new Date(Date.now() + 864000000) // 10 dias
    },
    {
      title: 'Documentar API com OpenAPI',
      description: 'Documentação completa da API com Swagger UI interativo',
      status: 'pending',
      priority: 'low',
      category: 'documentation',
      userId: regularUser2.id,
      dueDate: new Date(Date.now() + 1209600000) // 14 dias
    }
  ]

  for (const taskData of tasks) {
    await prisma.task.create({ data: taskData })
  }

  console.log('📋 Tarefas criadas:', tasks.length)

  // Estatísticas finais
  const stats = {
    users: await prisma.user.count(),
    tasks: await prisma.task.count(),
    completedTasks: await prisma.task.count({ where: { status: 'completed' } }),
    pendingTasks: await prisma.task.count({ where: { status: 'pending' } }),
    inProgressTasks: await prisma.task.count({ where: { status: 'in_progress' } })
  }

  console.log('📊 Estatísticas finais:', stats)
  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
