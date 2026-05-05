// backend/src/services/task.service.js

const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

const TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  dueDate: true,
  order: true,
  projectId: true,
  createdAt: true,
  updatedAt: true,
  assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
  creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
  _count: { select: { comments: true } },
};

const getProjectTasks = async (projectId, filters = {}) => {
  const where = { projectId };

  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assigneeId) where.assigneeId = filters.assigneeId;
  if (filters.search) {
    where.title = { contains: filters.search, mode: 'insensitive' };
  }

  const tasks = await prisma.task.findMany({
    where,
    select: TASK_SELECT,
    orderBy: [{ status: 'asc' }, { order: 'asc' }],
  });

  return tasks;
};

const getTaskById = async (taskId, projectId) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, projectId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  return task;
};

const createTask = async (projectId, data, creatorId) => {
  // Determine order (put at end of status column)
  const lastTask = await prisma.task.findFirst({
    where: { projectId, status: data.status || 'TODO' },
    orderBy: { order: 'desc' },
  });

  const order = lastTask ? lastTask.order + 1 : 0;

  const task = await prisma.task.create({
    data: {
      ...data,
      projectId,
      creatorId,
      order,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
    select: TASK_SELECT,
  });

  return task;
};

const updateTask = async (taskId, projectId, data, requestingUser, membership) => {
  const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });

  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  // Members can only update status/description of their assigned tasks
  if (membership.role !== 'ADMIN') {
    if (task.assigneeId !== requestingUser.id) {
      throw new AppError('You can only update tasks assigned to you', 403, 'FORBIDDEN');
    }
    const allowedFields = ['status', 'description'];
    const attemptedFields = Object.keys(data);
    const forbidden = attemptedFields.filter((f) => !allowedFields.includes(f));
    if (forbidden.length > 0) {
      throw new AppError(
        `Members can only update: ${allowedFields.join(', ')}`,
        403,
        'FORBIDDEN'
      );
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...data,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
    },
    select: TASK_SELECT,
  });

  return updated;
};

const deleteTask = async (taskId, projectId) => {
  const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }
  await prisma.task.delete({ where: { id: taskId } });
};

const reorderTasks = async (tasks) => {
  const updates = tasks.map(({ id, status, order }) =>
    prisma.task.update({
      where: { id },
      data: { status, order },
    })
  );

  await prisma.$transaction(updates);
};

const addComment = async (taskId, projectId, body, authorId) => {
  const task = await prisma.task.findFirst({ where: { id: taskId, projectId } });
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }

  const comment = await prisma.comment.create({
    data: { body, taskId, authorId },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return comment;
};

const deleteComment = async (commentId, userId, userRole) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    throw new AppError('Comment not found', 404, 'NOT_FOUND');
  }
  if (comment.authorId !== userId && userRole !== 'ADMIN') {
    throw new AppError('You can only delete your own comments', 403, 'FORBIDDEN');
  }
  await prisma.comment.delete({ where: { id: commentId } });
};

const getDashboardStats = async (projectId) => {
  const [tasksByStatus, tasksByPriority, overdueCount, members, tasksByUser] = await Promise.all([
    prisma.task.groupBy({
      by: ['status'],
      where: { projectId },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: { projectId },
      _count: true,
    }),
    prisma.task.count({
      where: {
        projectId,
        dueDate: { lt: new Date() },
        status: { not: 'DONE' },
      },
    }),
    prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    }),
    prisma.task.groupBy({
      by: ['assigneeId'],
      where: { projectId, assigneeId: { not: null } },
      _count: true,
    }),
  ]);

  const totalTasks = await prisma.task.count({ where: { projectId } });
  const completedTasks = tasksByStatus.find((t) => t.status === 'DONE')?._count ?? 0;

  // Build user task map
  const userTaskMap = tasksByUser.reduce((acc, item) => {
    acc[item.assigneeId] = item._count;
    return acc;
  }, {});

  const memberStats = members.map((m) => ({
    user: m.user,
    role: m.role,
    taskCount: userTaskMap[m.user.id] || 0,
  }));

  return {
    totalTasks,
    completedTasks,
    overdueCount,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    tasksByStatus: tasksByStatus.map((t) => ({ status: t.status, count: t._count })),
    tasksByPriority: tasksByPriority.map((t) => ({ priority: t.priority, count: t._count })),
    memberStats,
  };
};

module.exports = {
  getProjectTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
  addComment,
  deleteComment,
  getDashboardStats,
};
