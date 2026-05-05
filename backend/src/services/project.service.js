// backend/src/services/project.service.js

const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

const getUserProjects = async (userId) => {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          _count: { select: { tasks: true, members: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  return memberships.map((m) => ({
    ...m.project,
    role: m.role,
    taskCount: m.project._count.tasks,
    memberCount: m.project._count.members,
  }));
};

const getProjectById = async (projectId, userId) => {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!membership) {
    throw new AppError('Project not found or access denied', 404, 'NOT_FOUND');
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      _count: { select: { tasks: true } },
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  return { ...project, userRole: membership.role };
};

const createProject = async ({ name, key, description }, userId) => {
  // Check if key is already taken
  const existingKey = await prisma.project.findFirst({ where: { key } });
  if (existingKey) {
    throw new AppError('Project key already in use', 409, 'KEY_TAKEN');
  }

  const project = await prisma.project.create({
    data: {
      name,
      key,
      description,
      members: {
        create: {
          userId,
          role: 'ADMIN',
        },
      },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
    },
  });

  return project;
};

// Only admins of at least one project can create new projects
const canCreateProject = async (userId) => {
  const adminMembership = await prisma.projectMember.findFirst({
    where: { userId, role: 'ADMIN' },
  });
  return !!adminMembership;
};

const updateProject = async (projectId, data) => {
  const project = await prisma.project.update({
    where: { id: projectId },
    data,
  });
  return project;
};

const deleteProject = async (projectId) => {
  await prisma.project.delete({ where: { id: projectId } });
};

const addMember = async (projectId, { email, role }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  if (!user) {
    throw new AppError('No account found with that email. The user must sign up first.', 404, 'USER_NOT_FOUND');
  }

  const existing = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (existing) {
    throw new AppError('User is already a member of this project', 409, 'ALREADY_MEMBER');
  }

  const membership = await prisma.projectMember.create({
    data: { userId: user.id, projectId, role },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return membership;
};

const removeMember = async (projectId, targetUserId, requesterId) => {
  if (targetUserId === requesterId) {
    throw new AppError('You cannot remove yourself from the project', 400, 'CANNOT_REMOVE_SELF');
  }

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: targetUserId, projectId } },
  });

  if (!membership) {
    throw new AppError('Member not found', 404, 'NOT_FOUND');
  }

  await prisma.projectMember.delete({
    where: { userId_projectId: { userId: targetUserId, projectId } },
  });
};

module.exports = {
  getUserProjects,
  getProjectById,
  createProject,
  canCreateProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
