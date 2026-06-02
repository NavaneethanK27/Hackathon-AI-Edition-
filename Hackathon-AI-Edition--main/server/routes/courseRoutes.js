const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { courseValidation } = require('../middleware/validate');
const {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

// All course routes are protected
router.use(protect);

router.route('/')
  .get(getCourses)
  .post(courseValidation, createCourse);

router.route('/:id')
  .put(courseValidation, updateCourse)
  .delete(deleteCourse);

module.exports = router;
