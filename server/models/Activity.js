const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. 'lesson_completed', 'course_created', 'course_enrolled', 'review_added'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
});

module.exports = Activity;
