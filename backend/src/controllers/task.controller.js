// backend/src/controllers/task.controller.js

const taskService = require('../services/task.service');

const listTasks = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      assigneeId: req.query.assigneeId,
      search: req.query.search,
    };
    const tasks = await taskService.getProjectTasks(req.params.id, filters);
    res.json({ success: true, data: { tasks } });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.tid, req.params.id);
    res.json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.params.id, req.body, req.user.id);
    res.status(201).json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.tid,
      req.params.id,
      req.body,
      req.user,
      req.membership
    );
    res.json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.tid, req.params.id);
    res.json({ success: true, data: { message: 'Task deleted' } });
  } catch (error) {
    next(error);
  }
};

const reorderTasks = async (req, res, next) => {
  try {
    await taskService.reorderTasks(req.body.tasks);
    res.json({ success: true, data: { message: 'Tasks reordered' } });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const comment = await taskService.addComment(
      req.params.tid,
      req.params.id,
      req.body.body,
      req.user.id
    );
    res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    await taskService.deleteComment(req.params.cid, req.user.id, req.membership.role);
    res.json({ success: true, data: { message: 'Comment deleted' } });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const stats = await taskService.getDashboardStats(req.params.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
  addComment,
  deleteComment,
  getDashboard,
};
