const express = require('express');
const router = express.Router();
const { User, Course, Progress, Activity, CompletedLesson, Lesson } = require('../models');
const { Op } = require('sequelize');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { verifyMagicBytes } = require('../middleware/verifyMagicBytes');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;

// Rate limiter for public profile lookups — prevents username enumeration scraping
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   GET /api/users/:username
// @desc    Get user profile by username (public — PII fields excluded)
router.get('/:username', profileLimiter, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      // Exclude passwordHash and all PII fields from the public endpoint.
      // Sensitive fields are only returned via the authenticated /api/auth/me route.
      attributes: { exclude: ['passwordHash', 'email', 'phoneNumber', 'age', 'gender'] },
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
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
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
      // Verify magic bytes of the uploaded file — client-supplied MIME/extension is not trusted.
      const isValid = await verifyMagicBytes(req.file.path);
      if (!isValid) {
        await fs.unlink(req.file.path).catch(() => {}); // Remove the rejected file
        return res.status(400).json({ message: 'Geçersiz dosya türü. Sadece JPEG, PNG, MP4, MKV veya WebM kabul edilir.' });
      }
      user.avatar = `/uploads/${req.file.filename}`;
    }
    // NOTE: req.body.avatar string updates are intentionally not accepted.
    // Accepting arbitrary URL strings is an SSRF/XSS vector and bypasses
    // all file-type validation. Use file upload only.

    await user.save();

    const userData = user.toJSON();
    delete userData.passwordHash;
    userData._id = userData.id;

    res.json(userData);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/users/password
// @desc    Update password
router.put('/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate new password before processing — no validation here allows
  // an attacker to set an empty string password, locking out the owner.
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ message: 'Yeni şifre en az 8 karakter olmalıdır.' });
  }

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
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
