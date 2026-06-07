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
    type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    allowNull: true,
    defaultValue: 'prefer_not_to_say'
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
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  githubId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  theme: {
    type: DataTypes.STRING,
    defaultValue: 'dark',
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  recoveryEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  recoveryCodes: {
    type: DataTypes.TEXT, // Storing JSON string array of codes
    allowNull: true,
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  twoFactorSecret: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
  getterMethods: {
    _id() { return this.id; }
  }
});

module.exports = User;
