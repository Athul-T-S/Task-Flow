// backend/src/routes/project.routes.js

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const authGuard = require('../middleware/authGuard');
const { requireAdmin, requireMember } = require('../middleware/requireAdmin');
const {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  validate,
} = require('../validators/project.validator');

router.use(authGuard);

router.get('/', projectController.listProjects);
router.post('/', validate(createProjectSchema), projectController.createProject);
router.get('/:id', requireMember, projectController.getProject);
router.put('/:id', requireAdmin, validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id', requireAdmin, projectController.deleteProject);
router.post('/:id/members', requireAdmin, validate(addMemberSchema), projectController.addMember);
router.delete('/:id/members/:uid', requireAdmin, projectController.removeMember);

module.exports = router;
