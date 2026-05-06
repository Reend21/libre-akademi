const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    // Use a cryptographically random UUID — not guessable by timestamp brute-force
    const uniqueName = `${file.fieldname}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
    cb(null, uniqueName);
  }
});

const checkFileType = (file, cb) => {
  const isVideo = file.fieldname === 'video';
  const isThumbnail = ['thumbnail', 'coverImage', 'avatar'].includes(file.fieldname);

  if (isVideo) {
    const filetypes = /mp4|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /video\/(mp4|x-matroska)/.test(file.mimetype);

    if (extname && mimetype) return cb(null, true);
    return cb(new Error('Sadece MP4 ve MKV videoları yüklenebilir!'));
  }

  if (isThumbnail) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|png|webp)/.test(file.mimetype);

    if (extname && mimetype) return cb(null, true);
    return cb(new Error('Sadece JPG, PNG ve WEBP görselleri yüklenebilir!'));
  }

  cb(new Error('Geçersiz dosya türü!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max (covers video)
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
