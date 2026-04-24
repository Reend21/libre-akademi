const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Yetkisiz erişim, token yok' });
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token başarısız, yetkisiz erişim' });
  }
};

module.exports = { protect };
