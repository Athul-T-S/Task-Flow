// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean slate
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('Demo1234', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Alex Admin',
      email: 'admin@demo.com',
      password: hashedPassword,
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex+Admin&backgroundColor=0052CC&fontColor=ffffff',
    },
  });

  const member = await prisma.user.create({
    data: {
      name: 'Morgan Member',
      email: 'member@demo.com',
      password: hashedPassword,
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Morgan+Member&backgroundColor=36B37E&fontColor=ffffff',
    },
  });

  console.log('✅ Users created');

  // Create project
  const project = await prisma.project.create({
    data: {
      name: 'Demo Project',
      key: 'DP',
      description: 'A sample project to demonstrate the Jira clone capabilities.',
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('✅ Project created');

  // Create tasks
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const tasks = [
    {
      title: 'Set up project infrastructure',
      description: 'Initialize repositories, configure CI/CD pipelines, and set up environments.',
      priority: 'HIGHEST',
      status: 'DONE',
      dueDate: lastWeek,
      assigneeId: admin.id,
      order: 0,
    },
    {
      title: 'Design system architecture',
      description: 'Create detailed technical architecture document including database schema, API design, and frontend component tree.',
      priority: 'HIGH',
      status: 'DONE',
      dueDate: twoDaysAgo,
      assigneeId: admin.id,
      order: 1,
    },
    {
      title: 'Implement authentication flow',
      description: 'Build JWT-based auth with refresh token rotation. Include login, signup, and password reset.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: tomorrow,
      assigneeId: admin.id,
      order: 0,
    },
    {
      title: 'Build Kanban board UI',
      description: 'Implement drag-and-drop kanban board using react-beautiful-dnd. Columns: To Do, In Progress, Done.',
      priority: 'HIGHEST',
      status: 'IN_PROGRESS',
      dueDate: nextWeek,
      assigneeId: member.id,
      order: 1,
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST endpoints using OpenAPI/Swagger specification.',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: nextWeek,
      assigneeId: member.id,
      order: 0,
    },
    {
      title: 'Add unit tests for services',
      description: 'Achieve 80%+ test coverage for all backend service functions using Jest.',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: nextWeek,
      assigneeId: null,
      order: 1,
    },
    {
      title: 'Performance optimization',
      description: 'Profile and optimize slow database queries. Add proper indexes.',
      priority: 'LOW',
      status: 'TODO',
      dueDate: null,
      assigneeId: admin.id,
      order: 2,
    },
    {
      title: 'Deploy to production (OVERDUE)',
      description: 'Set up Railway deployment with proper environment variables and health checks.',
      priority: 'HIGHEST',
      status: 'TODO',
      dueDate: twoDaysAgo, // Overdue!
      assigneeId: member.id,
      order: 3,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        ...task,
        projectId: project.id,
        creatorId: admin.id,
      },
    });
  }

  console.log('✅ Tasks created');

  // Add some comments
  const firstTask = await prisma.task.findFirst({
    where: { projectId: project.id, status: 'DONE' },
  });

  if (firstTask) {
    await prisma.comment.createMany({
      data: [
        {
          body: 'Infrastructure is all set up. Using Railway for deployment.',
          taskId: firstTask.id,
          authorId: admin.id,
        },
        {
          body: 'Great work! The CI pipeline looks solid.',
          taskId: firstTask.id,
          authorId: member.id,
        },
      ],
    });
  }

  console.log('✅ Comments added');
  console.log('\n🎉 Seed complete!');
  console.log('---');
  console.log('Admin credentials: admin@demo.com / Demo1234');
  console.log('Member credentials: member@demo.com / Demo1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
