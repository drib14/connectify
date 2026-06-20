const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'connectify/general';
    if (file.fieldname === 'avatar') folder = 'connectify/avatars';
    else if (file.fieldname === 'coverPhoto') folder = 'connectify/covers';
    else if (file.fieldname === 'postMedia') folder = 'connectify/posts';
    else if (file.fieldname === 'eventMedia') folder = 'connectify/events';
    else if (file.fieldname === 'communityMedia') folder = 'connectify/communities';

    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov'],
      transformation: file.mimetype.startsWith('image/') ? [{ width: 1200, crop: 'limit', quality: 'auto' }] : [],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  },
});

module.exports = upload;
