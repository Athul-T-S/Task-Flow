// backend/src/routes/task.routes.js

const express = require('express');
const router = express.Router({ mergeParams: true });
const taskController = require('../controllers/task.controller');
const authGuard = require('../middleware/authGuard');
const { requireAdmin, requireMember } = require('../middleware/requireAdmin');
const {
  createTaskSchema,
  updateTaskSchema,
  reorderTasksSchema,
  createCommentSchema,
  validate,
} = require('../validators/task.validator');

router.use(authGuard);

// Dashboard
router.get('/dashboard', requireMember, taskController.getDashboard);

// Tasks CRUD
router.get('/', requireMember, taskController.listTasks);
router.post('/', requireMember, validate(createTaskSchema), taskController.createTask);
router.patch('/reorder', requireMember, validate(reorderTasksSchema), taskController.reorderTasks);
router.get('/:tid', requireMember, taskController.getTask);
router.put('/:tid', requireMember, validate(updateTaskSchema), taskController.updateTask);
router.delete('/:tid', requireAdmin, taskController.deleteTask);

// Comments
router.post('/:tid/comments', requireMember, validate(createCommentSchema), taskController.addComment);
router.delete('/:tid/comments/:cid', requireMember, taskController.deleteComment);

module.exports = router;
