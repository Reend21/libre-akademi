const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png|mp4|mkv|webm/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/(jpeg|png)|video\/(mp4|x-matroska|webm)/.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Sadece görseller (JPG, PNG) ve videolar (MP4, MKV, WebM) yüklenebilir!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max (covers video)
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
