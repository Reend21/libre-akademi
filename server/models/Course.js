const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const CATEGORIES = require('../config/categories');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM(...CATEGORIES),
    allowNull: false,
  },
  coverImage: {
    type: DataTypes.STRING,
  },
  averageRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  donationEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  timestamps: true,
  getterMethods: {
    _id() { return this.id; }
  }
});

module.exports = Course;
