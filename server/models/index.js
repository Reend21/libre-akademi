const { sequelize } = require('../config/db');
const User = require('./User');
const Course = require('./Course');
const Lesson = require('./Lesson');
const Progress = require('./Progress');
const Review = require('./Review');
const CompletedLesson = require('./CompletedLesson');
const Activity = require('./Activity');

// Relationships

// A User creates many Courses (Instructor)
User.hasMany(Course, { foreignKey: 'instructorId', as: 'publishedCourses' });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

// A Course has many Lessons
Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons', onDelete: 'CASCADE' });
Lesson.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// A User has many Progresses
User.hasMany(Progress, { foreignKey: 'userId', as: 'progresses' });
Progress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// A Course has many Progresses
Course.hasMany(Progress, { foreignKey: 'courseId', as: 'progresses' });
Progress.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// A Progress has many CompletedLessons
Progress.hasMany(CompletedLesson, { foreignKey: 'progressId', as: 'completedLessons', onDelete: 'CASCADE' });
CompletedLesson.belongsTo(Progress, { foreignKey: 'progressId', as: 'progress' });

// CompletedLesson also belongs to Lesson
Lesson.hasMany(CompletedLesson, { foreignKey: 'lessonId', as: 'completions' });
CompletedLesson.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// A User writes many Reviews
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// A Course has many Reviews
Course.hasMany(Review, { foreignKey: 'courseId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// A Lesson has many Reviews
Lesson.hasMany(Review, { foreignKey: 'lessonId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// A User has many Activities
User.hasMany(Activity, { foreignKey: 'userId', as: 'activities', onDelete: 'CASCADE' });
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Course,
  Lesson,
  Progress,
  Review,
  CompletedLesson,
  Activity
};
