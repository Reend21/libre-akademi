require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const passport = require('./config/passport');

const app = express();

// Trust the first proxy (Docker/nginx) so rate-limiter uses real client IP,
// not the internal container IP.
app.set('trust proxy', 1);

// Connect to db
connectDB();

// Security headers configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000"],
      mediaSrc: ["'self'", "blob:", "http://localhost:5000"],
      connectSrc: ["'self'", "http://localhost:5000"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: false
}));
app.disable('x-powered-by');

const path = require('path');

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost',
  'http://localhost:80',
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Rate limit
const uploadsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/uploads', uploadsLimiter, (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads', {
  setHeaders: (res, path) => {
    if (path.endsWith('.mkv')) {
      res.setHeader('Content-Type', 'video/x-matroska');
    }
  }
}));

// Basic Route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Libre Akademi API Çalışıyor' });
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/users', require('./routes/users'));
app.use('/api/home', require('./routes/home'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
