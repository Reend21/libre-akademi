const express = require('express');
const router = express.Router();
const { Course, User, Lesson, Progress, sequelize } = require('../models');
const { fn, col, Op } = require('sequelize');

// @route   GET /api/home/authenticated
// @desc    Get dynamic content for the authenticated home page
router.get('/authenticated', async (req, res) => {
  try {
    // 1. Featured Course (Editor's Recommendation)
    const featuredCourse = await Course.findOne({
      order: [['averageRating', 'DESC'], ['createdAt', 'DESC']],
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'username', 'avatar'] },
        { model: Lesson, as: 'lessons', attributes: ['id'] }
      ]
    });

    // 2. Popular Courses (highest student count)
    const popularCourses = await Course.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM Progresses
              WHERE
                Progresses.courseId = Course.id
            )`),
            'studentCount'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM Lessons
              WHERE
                Lessons.courseId = Course.id
            )`),
            'lessonCount'
          ]
        ]
      },
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'username', 'avatar'] }
      ],
      order: [[sequelize.literal('studentCount'), 'DESC']],
      limit: 10
    });

    // 3. Courses by Category
    const usedCategories = await Course.findAll({
      attributes: [[fn('DISTINCT', col('category')), 'category']],
      raw: true
    });

    const categoryData = [];
    for (const cat of usedCategories) {
      if (!cat.category) continue;
      
      const coursesInCat = await Course.findAll({
        where: { category: cat.category },
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM Lessons
                WHERE
                  Lessons.courseId = Course.id
              )`),
              'lessonCount'
            ]
          ]
        },
        include: [
          { model: User, as: 'instructor', attributes: ['id', 'username', 'avatar'] }
        ],
        limit: 10,
        order: [['createdAt', 'DESC']]
      });

      if (coursesInCat.length > 0) {
        categoryData.push({
          name: cat.category,
          courses: coursesInCat.map(c => {
            const json = c.toJSON();
            json._id = json.id;
            return json;
          })
        });
      }
    }

    res.json({
      featured: featuredCourse ? { ...featuredCourse.toJSON(), _id: featuredCourse.id } : null,
      popular: popularCourses.map(c => {
        const json = c.toJSON();
        json._id = json.id;
        return json;
      }),
      categories: categoryData
    });
  } catch (error) {
    console.error('Authenticated home error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
