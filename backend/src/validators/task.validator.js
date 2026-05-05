// backend/src/validators/task.validator.js

const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  order: z.number().int().default(0),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  priority: z.enum(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  order: z.number().int().optional(),
});

const reorderTasksSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
      order: z.number().int(),
    })
  ),
});

const createCommentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(2000),
});

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: result.error.errors,
      },
    });
  }
  req.body = result.data;
  next();
};

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  reorderTasksSchema,
  createCommentSchema,
  validate,
};
