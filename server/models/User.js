const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  bio: {
    type: DataTypes.TEXT,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('Erkek', 'Kadın', 'Belirtmek İstemiyorum'),
    allowNull: true,
    defaultValue: 'Belirtmek İstemiyorum'
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  github: {
    type: DataTypes.STRING,
  },
  google: {
    type: DataTypes.STRING,
  },
  linkedin: {
    type: DataTypes.STRING,
  },
  preferredLanguage: {
    type: DataTypes.STRING,
    defaultValue: 'tr',
  }
}, {
  timestamps: true,
  getterMethods: {
    _id() { return this.id; }
  }
});

module.exports = User;
