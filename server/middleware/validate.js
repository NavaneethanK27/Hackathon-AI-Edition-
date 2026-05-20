const { body, validationResult } = require('express-validator');

// General validation executor
const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateFields
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validateFields
];

const courseValidation = [
  body('name').trim().notEmpty().withMessage('Course name is required'),
  body('color').optional().matches(/^#([0-9a-fA-F]{3}){1,2}$/).withMessage('Color must be a valid hex code'),
  validateFields
];

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('dueDate').notEmpty().withMessage('Due date is required').isISO8601().withMessage('Due date must be a valid ISO8601 date'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
  body('estimatedHours').optional().isFloat({ min: 0.25 }).withMessage('Estimated hours must be at least 0.25'),
  validateFields
];

const studyBlockValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('startTime').isISO8601().withMessage('Start time must be a valid ISO8601 date'),
  body('endTime').isISO8601().withMessage('End time must be a valid ISO8601 date'),
  validateFields
];

module.exports = {
  registerValidation,
  loginValidation,
  courseValidation,
  taskValidation,
  studyBlockValidation
};
