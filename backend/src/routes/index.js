// backend/src/routes/index.js

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const projectRoutes = require('./project.routes');
const taskRoutes = require('./task.routes');

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/projects/:id/tasks', taskRoutes);

// Convenience dashboard route
router.use('/projects/:id/dashboard', (req, res, next) => {
  req.url = '/dashboard';
  taskRoutes(req, res, next);
});

module.exports = router;
