const express = require('express');
const router = express.Router();
const { User, Course, Progress, Activity, CompletedLesson, Lesson } = require('../models');
const { Op } = require('sequelize');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const bcrypt = require('bcryptjs');

// @route   GET /api/users/:username
// @desc    Get user profile by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: Progress,
          as: 'progresses',
          include: [{ model: Course, as: 'course' }]
        },
        {
          model: Course,
          as: 'publishedCourses'
        },
        {
          model: Activity,
          as: 'activities',
          where: {
            date: { [Op.gte]: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
          },
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const userData = user.toJSON();
    userData._id = userData.id;

    // Format output
    const completedCourses = userData.progresses.filter(p => p.isCompleted && p.course).map(p => {
      const c = p.course;
      c._id = c.id;
      return c;
    });
    
    const ongoingCourses = userData.progresses.filter(p => !p.isCompleted && p.course).map(p => {
      const c = p.course;
      c._id = c.id;
      return c;
    });

    if (userData.publishedCourses) {
      userData.publishedCourses = userData.publishedCourses.map(c => {
        c._id = c.id;
        return c;
      });
    }

    // Contribution graph data
    const contributionMap = {};
    if (userData.activities) {
      userData.activities.forEach(act => {
        if (!contributionMap[act.date]) {
          contributionMap[act.date] = 0;
        }
        contributionMap[act.date]++;
      });
    }

    res.json({
      ...userData,
      completedCourses,
      ongoingCourses,
      contributions: contributionMap
    });

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Custom middleware to handle multer errors gracefully
const handleAvatarUpload = (req, res, next) => {
  const uploader = upload.single('avatar');
  uploader(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: typeof err === 'string' ? err : err.message || 'Dosya yükleme hatası' });
    }
    next();
  });
};

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', protect, handleAvatarUpload, async (req, res) => {
  const { name, username, bio, age, gender, phoneNumber, github, google, linkedin } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ where: { username } });
      if (usernameExists) {
        return res.status(400).json({ message: 'Bu kullanıcı adı zaten alınmış.' });
      }
    }

    user.name = name || user.name;
    user.username = username || user.username;
    user.bio = bio !== undefined ? bio : user.bio;
    user.age = age || user.age;
    user.gender = gender || user.gender;
    user.phoneNumber = phoneNumber !== undefined ? phoneNumber : user.phoneNumber;
    user.github = github !== undefined ? github : user.github;
    user.google = google !== undefined ? google : user.google;
    user.linkedin = linkedin !== undefined ? linkedin : user.linkedin;
    
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    } else if (req.body.avatar) {
      // Allow URL string updates if sent instead of file
      user.avatar = req.body.avatar;
    }

    await user.save();

    const userData = user.toJSON();
    delete userData.passwordHash;
    userData._id = userData.id;

    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// @route   PUT /api/users/password
// @desc    Update password
router.put('/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    res.json({ message: 'Şifreniz başarıyla güncellendi.' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;
