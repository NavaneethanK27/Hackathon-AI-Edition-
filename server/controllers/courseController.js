const Course = require('../models/Course');
const Task = require('../models/Task');
const StudyBlock = require('../models/StudyBlock');

// @desc    Get all user courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ user: req.user._id }).lean();
    return res.status(200).json({
      success: true,
      courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private
const createCourse = async (req, res, next) => {
  try {
    const { name, code, color, description } = req.body;

    const course = await Course.create({
      name,
      code,
      color,
      description,
      user: req.user._id
    });

    return res.status(201).json({
      success: true,
      course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, user: req.user._id });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      });
    }

    const { name, code, color, description } = req.body;
    course.name = name || course.name;
    course.code = code !== undefined ? code : course.code;
    course.color = color || course.color;
    course.description = description !== undefined ? description : course.description;

    const updatedCourse = await course.save();
    return res.status(200).json({
      success: true,
      course: updatedCourse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      });
    }

    // Cascade: Nullify references in Tasks & StudyBlocks
    await Task.updateMany({ course: req.params.id }, { $unset: { course: "" } });
    await StudyBlock.updateMany({ course: req.params.id }, { $unset: { course: "" } });

    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully and associated references removed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse
};
