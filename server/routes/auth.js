const express = require('express');
const router = express.Router();
const { User, Course, Progress } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: { message: 'Çok fazla deneme. Lütfen 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation helpers
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Ad soyad gereklidir.').isLength({ max: 100 }),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Kullanıcı adı 3-30 karakter olmalıdır.')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.'),
  body('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır.'),
];

const loginValidation = [
  body('identifier').trim().notEmpty().withMessage('Kullanıcı adı veya e-posta gereklidir.'),
  body('password').notEmpty().withMessage('Şifre gereklidir.'),
];

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  return null;
};

// @route   POST /api/auth/register
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  const { name, username, email, password, age, gender } = req.body;
  
  try {
    const userExists = await User.findOne({ 
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (userExists) {
      return res.status(400).json({ message: 'Kullanıcı adı veya e-posta zaten kullanımda' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, username, email, passwordHash, age, gender });

    res.status(201).json({
      _id: user.id,
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      age: user.age,
      gender: user.gender,
      preferredLanguage: user.preferredLanguage,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/auth/login
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({ 
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }]
      }
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        _id: user.id,
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        age: user.age,
        gender: user.gender,
        preferredLanguage: user.preferredLanguage,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Geçersiz kullanıcı adı/e-posta veya şifre' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
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
        }
      ]
    });

    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    // Map progresses to completed/ongoing for frontend
    const completedCourses = user.progresses.filter(p => p.isCompleted).map(p => p.course);
    const ongoingCourses = user.progresses.filter(p => !p.isCompleted).map(p => p.course);

    const userData = user.toJSON();
    userData._id = userData.id;

    res.json({
      ...userData,
      completedCourses,
      ongoingCourses
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// @route   PUT /api/auth/language
router.put('/language', protect, async (req, res) => {
  const { language } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    user.preferredLanguage = language;
    await user.save();

    const userData = user.toJSON();
    delete userData.passwordHash;
    userData._id = userData.id;

    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;
