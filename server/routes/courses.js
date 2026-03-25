const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Review = require('../models/Review');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/courses
// @desc    Get all courses (with optional search/filter)
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.search) query.title = { $regex: req.query.search, $options: 'i' };
    if (req.query.category) query.category = req.query.category;

    const courses = await Course.find(query).populate('instructor', 'username avatar');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'username bio avatar');
    if (!course) return res.status(404).json({ message: 'Kurs bulunamadı' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// @route   POST /api/courses
// @desc    Create a course
router.post('/', protect, upload.single('coverImage'), async (req, res) => {
  const { title, description, category } = req.body;
  
  try {
    const course = await Course.create({
      title,
      description,
      category,
      instructor: req.user.id,
      coverImage: req.file ? `/uploads/${req.file.filename}` : ''
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Katman Hatası', error: error.message });
  }
});

// @route   PUT /api/courses/:id/lessons
// @desc    Add lesson video to course
router.put('/:id/lessons', protect, upload.single('video'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Kurs bulunamadı' });

    if (course.instructor.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Yetkisiz erişim' });
    }

    const { title, duration } = req.body;
    course.lessons.push({
      title,
      duration,
      videoUrl: req.file ? `/uploads/${req.file.filename}` : ''
    });

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// @route   POST /api/courses/:id/reviews
// @desc    Add a review
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Kurs bulunamadı' });

    const alreadyReviewed = await Review.findOne({ course: req.params.id, user: req.user.id });
    if (alreadyReviewed) return res.status(400).json({ message: 'Kursu zaten incelediniz' });

    await Review.create({ course: req.params.id, user: req.user.id, rating, comment });
    
    // Update course average
    const reviews = await Review.find({ course: req.params.id });
    course.averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await course.save();

    res.status(201).json({ message: 'İnceleme eklendi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// @route   POST /api/courses/:id/progress
// @desc    Mark a lesson as complete
router.post('/:id/progress', protect, async (req, res) => {
  const { lessonId } = req.body;
  try {
    let progress = await Progress.findOne({ course: req.params.id, user: req.user.id });
    
    if (!progress) {
      progress = await Progress.create({ course: req.params.id, user: req.user.id, completedLessons: [lessonId] });
    } else {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
    }

    const course = await Course.findById(req.params.id);
    if (progress.completedLessons.length >= course.lessons.length) {
      progress.isCompleted = true;
    }
    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;
