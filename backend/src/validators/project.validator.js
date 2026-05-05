// backend/src/validators/project.validator.js

const { z } = require('zod');

const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  key: z
    .string()
    .min(2)
    .max(10)
    .regex(/^[A-Z0-9]+$/, 'Key must be uppercase letters/numbers only')
    .toUpperCase(),
  description: z.string().max(500).optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
});

const addMemberSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
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

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema, validate };
