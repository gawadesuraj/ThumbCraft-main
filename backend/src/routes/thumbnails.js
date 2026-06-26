const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageController = require('../controllers/imageController');
const { requireAuth } = require('../middlewares/auth');
const { validateGenerate } = require('../middlewares/validator');
const { generationLimiter } = require('../middlewares/rateLimiter');

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.use(requireAuth); // Enforce authentication

// Generation
router.post('/generate', generationLimiter, upload.none(), validateGenerate, imageController.generateImages);
router.post('/generate-from-image', generationLimiter, upload.single('image'), validateGenerate, imageController.generateFromImage);

// Gallery & Favorites
router.get('/download', imageController.downloadProxy);
router.get('/gallery', imageController.getGallery);
router.post('/:thumbnailId/favorite', imageController.toggleFavorite);
router.get('/favorites', imageController.getFavorites);
router.delete('/:thumbnailId', imageController.deleteThumbnail);

module.exports = router;
