const express = require('express');
const router = express.Router();
const { User, Course, Progress } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const { protect } = require('../middleware/auth');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window (OWASP recommendation)
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
  body('password').isLength({ min: 8 }).withMessage('Şifre en az 8 karakter olmalıdır.'),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Geçerli bir yaş giriniz.'),
  body('gender').optional({ checkFalsy: true }).trim().isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Geçerli bir cinsiyet değeri giriniz.'),
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
    console.error('Register error:', error);
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
      if (user.twoFactorEnabled) {
        const tempToken = jwt.sign({ tempId: user.id }, process.env.JWT_SECRET, { expiresIn: '5m' });
        return res.json({ requires2FA: true, tempToken });
      }

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
    console.error('Login error:', error);
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
    userData.hasGoogle = !!userData.googleId;
    userData.hasGithub = !!userData.githubId;
    
    // Cleanup sensitive data before sending
    delete userData.googleId;
    delete userData.githubId;
    delete userData.twoFactorSecret;
    delete userData.recoveryCodes;

    res.json({
      ...userData,
      completedCourses,
      ongoingCourses
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
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
    console.error('Language update error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'E-posta adresi gereklidir.' });

  try {
    const user = await User.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.' });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // In production: send email with reset link
    // For now, we return the token in development mode only
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] Şifre sıfırlama bağlantısı:', resetUrl);
      return res.json({
        message: 'Şifre sıfırlama bağlantısı oluşturuldu.',
        devResetUrl: resetUrl
      });
    }

    // TODO: Implement email sending here (nodemailer, resend etc.)
    res.json({ message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Şifre en az 8 karakter olmalıdır.' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş sıfırlama bağlantısı.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: 'Şifreniz başarıyla güncellendi. Artık giriş yapabilirsiniz.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/connect/google
router.get('/connect/google', (req, res, next) => {
  const token = req.query.token;
  passport.authenticate('google', { scope: ['profile', 'email'], state: token })(req, res, next);
});

// @route   GET /api/auth/google/callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth' }), (req, res) => {
  if (req.user.isConnecting) {
    return res.redirect(`${process.env.CLIENT_URL}/profile/edit?connected=google`);
  }
  const token = generateToken(req.user.id);
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
});

// @route   GET /api/auth/github
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// @route   GET /api/auth/connect/github
router.get('/connect/github', (req, res, next) => {
  const token = req.query.token;
  passport.authenticate('github', { scope: ['user:email'], state: token })(req, res, next);
});

// @route   GET /api/auth/github/callback
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login?error=oauth' }), (req, res) => {
  if (req.user.isConnecting) {
    return res.redirect(`${process.env.CLIENT_URL}/profile/edit?connected=github`);
  }
  const token = generateToken(req.user.id);
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
});

// @route   POST /api/auth/2fa/login
router.post('/2fa/login', authLimiter, async (req, res) => {
  const { tempToken, code } = req.body;
  if (!tempToken || !code) return res.status(400).json({ message: 'Gerekli bilgiler eksik.' });

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.tempId) return res.status(401).json({ message: 'Geçersiz token.' });

    const user = await User.findByPk(decoded.tempId);
    if (!user || !user.twoFactorEnabled) return res.status(400).json({ message: 'Geçersiz işlem.' });

    // Check if code is a recovery code
    let isValid = false;
    if (code.length === 8) {
      const recoveryCodes = JSON.parse(user.recoveryCodes || '[]');
      if (recoveryCodes.includes(code)) {
        isValid = true;
        const updatedCodes = recoveryCodes.filter(c => c !== code);
        user.recoveryCodes = JSON.stringify(updatedCodes);
        await user.save();
      }
    } else {
      isValid = authenticator.check(code, user.twoFactorSecret);
    }

    if (!isValid) return res.status(401).json({ message: 'Geçersiz kod.' });

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
  } catch (err) {
    res.status(401).json({ message: 'Süresi dolmuş veya geçersiz işlem.' });
  }
});

// @route   POST /api/auth/2fa/setup
router.post('/2fa/setup', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: 'İki faktörlü doğrulama zaten aktif.' });
    }

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'Libre Akademi', secret);

    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
    
    res.json({ secret, qrCodeUrl });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/auth/2fa/verify
router.post('/2fa/verify', protect, async (req, res) => {
  const { token, secret } = req.body;
  try {
    const isValid = authenticator.check(token, secret);
    if (!isValid) {
      return res.status(400).json({ message: 'Geçersiz doğrulama kodu.' });
    }

    const user = await User.findByPk(req.user.id);
    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    
    // Generate recovery codes
    const recoveryCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex'));
    user.recoveryCodes = JSON.stringify(recoveryCodes);
    
    await user.save();

    res.json({ message: 'İki faktörlü doğrulama aktif edildi.', recoveryCodes });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/auth/2fa/disable
router.post('/2fa/disable', protect, async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user.twoFactorEnabled) return res.status(400).json({ message: 'İki faktörlü doğrulama zaten kapalı.' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ message: 'Şifre hatalı.' });

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.recoveryCodes = null;
    await user.save();

    res.json({ message: 'İki faktörlü doğrulama kapatıldı.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
