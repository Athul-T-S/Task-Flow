// backend/src/middleware/requireAdmin.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const requireAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const userId = req.user.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Project ID is required' },
      });
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not a member of this project' },
      });
    }

    if (membership.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin privileges required' },
      });
    }

    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
};

const requireMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const userId = req.user.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Project ID is required' },
      });
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not a member of this project' },
      });
    }

    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireAdmin, requireMember };
