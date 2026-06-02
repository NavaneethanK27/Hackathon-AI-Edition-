const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { taskValidation } = require('../middleware/validate');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleSubtask,
  breakdownTask
} = require('../controllers/taskController');

// All task routes are protected
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(taskValidation, createTask);

router.route('/:id')
  .put(taskValidation, updateTask)
  .delete(deleteTask);

router.patch('/:id/subtasks/:subtaskId', toggleSubtask);
router.post('/:id/breakdown', breakdownTask);

module.exports = router;
