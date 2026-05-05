// backend/src/controllers/project.controller.js

const projectService = require('../services/project.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getUserProjects(req.user.id);
    res.json({ success: true, data: { projects } });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user.id);
    res.json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    // Check if user has ADMIN role on any existing project
    const adminMembership = await prisma.projectMember.findFirst({
      where: { userId: req.user.id, role: 'ADMIN' },
    });

    if (!adminMembership) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only Admins can create projects. Contact your administrator.',
        },
      });
    }

    const project = await projectService.createProject(req.body, req.user.id);
    res.status(201).json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.json({ success: true, data: { message: 'Project deleted' } });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const membership = await projectService.addMember(req.params.id, req.body);
    res.status(201).json({ success: true, data: { membership } });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    await projectService.removeMember(req.params.id, req.params.uid, req.user.id);
    res.json({ success: true, data: { message: 'Member removed' } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
