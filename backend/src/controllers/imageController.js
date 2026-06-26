const aiService = require('../services/aiService');
const thumbnailRepository = require('../repositories/thumbnailRepository');
const projectRepository = require('../repositories/projectRepository');
const CloudinaryUploader = require('../utils/cloudinaryUpload');

const cloudinaryUploader = new CloudinaryUploader();

class ImageController {
  // Text to Image Generation
  async generateImages(req, res, next) {
    try {
      let {
        prompt,
        enhancePrompt = false,
        category,
        mood,
        theme,
        primaryColor,
        includeText,
        textStyle,
        thumbnailStyle,
        customPrompt,
        imageCount = '4',
        provider = 'gemini',
        projectId
      } = req.body;

      if (projectId === 'null' || projectId === 'undefined' || !projectId) {
        projectId = null;
      }

      const imageCountInt = Math.max(1, Math.min(4, parseInt(imageCount) || 4));

      // Generate buffers via AIService
      const result = await aiService.generateImages(
        req.user.id,
        provider,
        {
          originalPrompt: prompt,
          prompt,
          enhancePrompt: enhancePrompt === 'true' || enhancePrompt === true,
          category,
          mood,
          theme,
          primaryColor,
          includeText,
          textStyle,
          thumbnailStyle,
          customPrompt
        },
        imageCountInt
      );

      // Upload to Cloudinary
      const urls = await cloudinaryUploader.uploadMultiple(result.images, 'studio_generated', 3, prompt);

      // Create Thumbnail records
      const thumbnail = await thumbnailRepository.create({
        userId: req.user.id,
        projectId: projectId || null,
        type: 'text-to-image',
        originalPrompt: prompt,
        finalPrompt: result.finalPrompt,
        enhancedPrompt: enhancePrompt === 'true' || enhancePrompt === true,
        styleConfig: {
          category,
          mood,
          theme,
          primaryColor,
          includeText: includeText === 'Yes' || includeText === true,
          textStyle,
          thumbnailStyle,
          customPrompt
        },
        imageUrls: urls,
        provider: result.provider
      });

      // Update Project counter if linked
      if (projectId) {
        await projectRepository.incrementThumbnailCount(projectId);
      }

      res.json({
        success: true,
        thumbnail,
        images: urls,
        prompt: result.finalPrompt,
        enhanced: enhancePrompt
      });
    } catch (err) {
      next(err);
    }
  }

  // Image to Image Generation
  async generateFromImage(req, res, next) {
    try {
      let {
        prompt,
        enhancePrompt = false,
        category,
        mood,
        theme,
        primaryColor,
        includeText,
        textStyle,
        thumbnailStyle,
        customPrompt,
        imageCount = '1',
        provider = 'gemini',
        projectId
      } = req.body;

      if (projectId === 'null' || projectId === 'undefined' || !projectId) {
        projectId = null;
      }

      const imageFile = req.file;
      if (!imageFile) {
        return res.status(400).json({ error: 'Source reference image is required' });
      }

      const imageCountInt = Math.max(1, Math.min(4, parseInt(imageCount) || 1));

      // Upload input reference image to Cloudinary
      const inputUrl = await cloudinaryUploader.uploadBuffer(imageFile.buffer, 'reference_input');

      // Collect buffers
      const result = await aiService.generateFromImage(
        req.user.id,
        provider,
        {
          originalPrompt: prompt,
          prompt,
          enhancePrompt: enhancePrompt === 'true' || enhancePrompt === true,
          category,
          mood,
          theme,
          primaryColor,
          includeText,
          textStyle,
          thumbnailStyle,
          customPrompt
        },
        imageFile.buffer,
        imageCountInt
      );

      // Upload output variations to Cloudinary
      const urls = await cloudinaryUploader.uploadMultiple(result.images, 'studio_image_to_image', 3, prompt);

      // Create Thumbnail records
      const thumbnail = await thumbnailRepository.create({
        userId: req.user.id,
        projectId: projectId || null,
        type: 'image-to-image',
        originalPrompt: prompt,
        finalPrompt: result.finalPrompt,
        enhancedPrompt: enhancePrompt === 'true' || enhancePrompt === true,
        styleConfig: {
          category,
          mood,
          theme,
          primaryColor,
          includeText: includeText === 'Yes' || includeText === true,
          textStyle,
          thumbnailStyle,
          customPrompt
        },
        inputImage: {
          originalName: imageFile.originalname,
          size: imageFile.size,
          mimeType: imageFile.mimetype,
          url: inputUrl
        },
        imageUrls: urls,
        provider: result.provider
      });

      if (projectId) {
        await projectRepository.incrementThumbnailCount(projectId);
      }

      res.json({
        success: true,
        thumbnail,
        images: urls,
        prompt: result.finalPrompt,
        enhanced: enhancePrompt
      });
    } catch (err) {
      next(err);
    }
  }

  // Get Gallery
  async getGallery(req, res, next) {
    try {
      const { limit = 20, skip = 0, projectId } = req.query;
      const filter = { userId: req.user.id };
      if (projectId && projectId !== 'null' && projectId !== 'undefined') {
        filter.projectId = projectId;
      }

      const thumbnails = await thumbnailRepository.find(
        filter,
        '',
        { createdAt: -1 },
        parseInt(limit),
        parseInt(skip)
      );

      const total = await thumbnailRepository.countDocuments(filter);

      res.json({
        success: true,
        thumbnails,
        total
      });
    } catch (err) {
      next(err);
    }
  }

  // Toggle Favorite
  async toggleFavorite(req, res, next) {
    try {
      const updated = await thumbnailRepository.toggleFavorite(
        req.params.thumbnailId,
        req.user.id
      );

      if (!updated) {
        return res.status(404).json({ error: 'Thumbnail not found' });
      }

      res.json({
        success: true,
        thumbnail: updated,
        message: updated.isFavorite ? 'Added to favorites' : 'Removed from favorites'
      });
    } catch (err) {
      next(err);
    }
  }

  // Get Favorite Thumbnails
  async getFavorites(req, res, next) {
    try {
      const { limit = 20, skip = 0 } = req.query;
      const thumbnails = await thumbnailRepository.getFavorites(
        req.user.id,
        parseInt(limit),
        parseInt(skip)
      );

      res.json({
        success: true,
        thumbnails
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete Thumbnail Record
  async deleteThumbnail(req, res, next) {
    try {
      const deleted = await thumbnailRepository.deleteById(req.params.thumbnailId);
      if (!deleted) {
        return res.status(404).json({ error: 'Thumbnail not found or unauthorized' });
      }
      res.json({
        success: true,
        message: 'Thumbnail deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  // Download Proxy to bypass CORS issues on browser side
  async downloadProxy(req, res, next) {
    try {
      const { url } = req.query;
      if (!url) return res.status(400).json({ error: 'URL is required' });
      
      const axios = require('axios');
      const response = await axios.get(url, { responseType: 'stream' });
      res.setHeader('Content-Disposition', 'attachment; filename=thumbnail.png');
      response.data.pipe(res);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ImageController();
