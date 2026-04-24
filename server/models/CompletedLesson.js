const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CompletedLesson = sequelize.define('CompletedLesson', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  }
}, {
  timestamps: true,
});

module.exports = CompletedLesson;
