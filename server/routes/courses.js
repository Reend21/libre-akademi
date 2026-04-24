const express = require('express');
const router = express.Router();
const { Course, User, Review, Progress, Lesson, CompletedLesson, Activity } = require('../models');
const { Op, fn, col } = require('sequelize');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/courses
// @desc    Get all courses (with optional search/filter)
router.get('/', async (req, res) => {
  try {
    const whereClause = {};
    if (req.query.search) {
      whereClause.title = { [Op.like]: `%${req.query.search}%` };
    }
    if (req.query.category) {
      whereClause.category = req.query.category;
    }

    // F08: Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    const { count, rows: courses } = await Course.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'username', 'avatar'] }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    const mappedCourses = courses.map(c => {
      const json = c.toJSON();
      json._id = json.id;
      if (json.instructor) json.instructor._id = json.instructor.id;
      return json;
    });

    res.json({
      courses: mappedCourses,
      total: count,
      page,
      pages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'username', 'bio', 'avatar'] },
        { model: Lesson, as: 'lessons' }
      ]
    });

    if (!course) return res.status(404).json({ message: 'Kurs bulunamadı' });

    const mappedCourse = course.toJSON();
    mappedCourse._id = mappedCourse.id;
    if (mappedCourse.instructor) mappedCourse.instructor._id = mappedCourse.instructor.id;
    mappedCourse.lessons = mappedCourse.lessons.map(l => ({ ...l, _id: l.id }));

    res.json(mappedCourse);
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
      instructorId: req.user.id,
      coverImage: req.file ? `/uploads/${req.file.filename}` : ''
    });
    
    // Log activity
    await Activity.create({ userId: req.user.id, action: 'course_created' });
    
    const mappedCourse = course.toJSON();
    mappedCourse._id = mappedCourse.id;
    
    res.status(201).json(mappedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Kurs oluşturulurken bir hata oluştu.' });
  }
});

// @route   PUT /api/courses/:id/lessons
// @desc    Add lesson video to course
router.put('/:id/lessons', protect, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Kurs bulunamadı' });

    if (course.instructorId !== req.user.id) {
       return res.status(401).json({ message: 'Yetkisiz erişim' });
    }

    const { title, duration, description, order } = req.body;
    
    let videoUrl = '';
    let thumbnailUrl = '';

    if (req.files && req.files['video']) {
      videoUrl = `/uploads/${req.files['video'][0].filename}`;
    }
    if (req.files && req.files['thumbnail']) {
      thumbnailUrl = `/uploads/${req.files['thumbnail'][0].filename}`;
    }
    
    await Lesson.create({
      title,
      duration,
      description,
      thumbnail: thumbnailUrl,
      videoUrl,
      order: order || 0,
      courseId: course.id
    });

    // Fetch updated course
    const updatedCourse = await Course.findByPk(req.params.id, {
      include: [{ model: Lesson, as: 'lessons' }]
    });

    const mappedCourse = updatedCourse.toJSON();
    mappedCourse._id = mappedCourse.id;
    mappedCourse.lessons = mappedCourse.lessons.map(l => ({ ...l, _id: l.id }));

    res.json(mappedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// @route   POST /api/courses/:id/reviews
// @desc    Add a review
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Kurs bulunamadı' });

    const alreadyReviewed = await Review.findOne({ where: { courseId: req.params.id, userId: req.user.id } });
    if (alreadyReviewed) return res.status(400).json({ message: 'Kursu zaten incelediniz' });

    await Review.create({ courseId: req.params.id, userId: req.user.id, rating, comment });
    
    // F09: Use SQL AVG instead of loading all reviews into memory
    const result = await Review.findOne({
      where: { courseId: req.params.id },
      attributes: [
        [fn('AVG', col('rating')), 'avg']
      ],
      raw: true
    });
    
    course.averageRating = parseFloat(result.avg) || 0;
    await course.save();

    res.status(201).json({ message: 'İnceleme eklendi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/courses/:id/progress
// @desc    Mark a lesson as complete
router.post('/:id/progress', protect, async (req, res) => {
  const { lessonId } = req.body;
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: Lesson, as: 'lessons' }]
    });
    if (!course) return res.status(404).json({ message: 'Kurs bulunamadı' });

    let progress = await Progress.findOne({ 
      where: { courseId: req.params.id, userId: req.user.id },
      include: [{ model: CompletedLesson, as: 'completedLessons' }]
    });
    
    if (!progress) {
      progress = await Progress.create({ courseId: req.params.id, userId: req.user.id });
      // Reload to get the empty completions array
      progress = await Progress.findByPk(progress.id, {
        include: [{ model: CompletedLesson, as: 'completedLessons' }]
      });
    }

    const alreadyCompleted = progress.completedLessons.find(c => c.lessonId === parseInt(lessonId));
    
    if (!alreadyCompleted) {
      await CompletedLesson.create({ progressId: progress.id, lessonId: parseInt(lessonId) });
      progress.completedLessons.push({ lessonId: parseInt(lessonId) }); // push for memory check below
      
      // Log activity
      await Activity.create({ userId: req.user.id, action: 'lesson_completed' });
    }

    if (progress.completedLessons.length >= course.lessons.length && course.lessons.length > 0) {
      progress.isCompleted = true;
      await progress.save();
    }
    
    const mappedProgress = progress.toJSON();
    mappedProgress._id = mappedProgress.id;
    mappedProgress.completedLessons = mappedProgress.completedLessons.map(cl => cl.lessonId);

    res.json(mappedProgress);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;
