const cloudinary = require('cloudinary').v2;

class CloudinaryUploader {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  isConfigured() {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }

  detectMimeType(buffer) {
    if (!buffer) return 'image/jpeg';
    const signatures = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/gif': [0x47, 0x49, 0x46],
      'image/webp': [0x52, 0x49, 0x46, 0x46]
    };

    for (const [mimeType, signature] of Object.entries(signatures)) {
      if (signature.every((byte, index) => buffer[index] === byte)) {
        return mimeType;
      }
    }
    return 'image/jpeg';
  }

  extractKeywords(prompt) {
    if (!prompt) return 'abstract,creative';
    
    let cleanPrompt = prompt.toLowerCase();
    cleanPrompt = cleanPrompt.replace(/create a youtube thumbnail in widescreen 16:9 aspect ratio\./g, '');
    cleanPrompt = cleanPrompt.replace(/subject:/g, '');
    cleanPrompt = cleanPrompt.replace(/style tags:/g, '');
    cleanPrompt = cleanPrompt.replace(/clean visual design, highly engaging, contrasty lighting, optimized for click-through rate\./g, '');
    
    const stopwords = new Set([
      'a', 'an', 'the', 'of', 'in', 'on', 'at', 'for', 'with', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
      'to', 'from', 'by', 'about', 'as', 'into', 'like', 'through', 'after', 'before', 'styling', 'style', 
      'tags', 'design', 'aesthetic', 'vibes', 'colors', 'color', 'big', 'overlay', 'text', 'widescreen', 
      'aspect', 'ratio', 'generate', 'image', 'images', 'photo', 'art', 'render', '3d', 'realistic', 'modern',
      'highly', 'engaging', 'contrast', 'contrasty', 'lighting', 'optimized', 'click', 'through', 'rate', 'whoes',
      'each', 'whose', 'thay', 'want',
      'young', 'old', 'new', 'cute', 'beautiful', 'pretty', 'nice', 'good', 'bad', 'sitting', 'standing', 'lying', 
      'running', 'walking', 'playing', 'happy', 'sad', 'angry', 'excited', 'serious', 'fun', 'professional', 
      'mysterious', 'energetic', 'red', 'blue', 'green', 'purple', 'orange', 'yellow', 'pink', 'cyan', 'black', 'white',
      'grey', 'gray', 'gold', 'silver', 'neon', 'dark', 'light', 'bright', 'thumbnail', 
      'studio', 'draft', 'drafts', 'generation', 'create', 'making', 'altered', 'using', 'provided', 'reference', 
      'foundation', 'modify', 'modifications', 'adjustments', 'details', 'objective', 'fidelity'
    ]);

    const words = cleanPrompt
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 2 && !stopwords.has(w));

    const uniqueWords = [...new Set(words)].slice(0, 3);
    return uniqueWords.length > 0 ? uniqueWords.join(',') : 'abstract,creative';
  }

  async uploadBuffer(imageBuffer, fileName = null) {
    if (!this.isConfigured()) {
      console.warn('[CloudinaryUploader] Cloudinary is not configured. Returning data URI fallback.');
      const mime = this.detectMimeType(imageBuffer);
      return `data:${mime};base64,${imageBuffer.toString('base64')}`;
    }
    try {
      const finalFileName = fileName || `generated_${Date.now()}`;
      return await this.uploadBufferWithRetry(imageBuffer, finalFileName, 2);
    } catch (err) {
      console.warn(`[CloudinaryUploader] Cloudinary upload failed: ${err.message}. Falling back to data URI.`);
      const mime = this.detectMimeType(imageBuffer);
      return `data:${mime};base64,${imageBuffer.toString('base64')}`;
    }
  }

  async uploadMultiple(imageBuffers, baseFileName = 'generated', maxConcurrency = 3, prompt = null) {
    if (!imageBuffers || imageBuffers.length === 0) return [];
    if (!this.isConfigured()) {
      console.warn('[CloudinaryUploader] Cloudinary is not configured. Returning mock URLs.');
      const keywords = this.extractKeywords(prompt);
      const encodedKeywords = keywords.split(',').map(encodeURIComponent).join(',');
      return imageBuffers.map((buffer, i) => {
        if (buffer && buffer.length > 200) {
          const mime = this.detectMimeType(buffer);
          return `data:${mime};base64,${buffer.toString('base64')}`;
        }
        return `https://loremflickr.com/1280/720/${encodedKeywords}?random=${i}_${Date.now()}`;
      });
    }

    try {
      const results = [];
      const batches = [];

      for (let i = 0; i < imageBuffers.length; i += maxConcurrency) {
        batches.push(imageBuffers.slice(i, i + maxConcurrency));
      }

      for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        const promises = batch.map((buffer, idx) => {
          const globalIdx = b * maxConcurrency + idx;
          const fileName = `${baseFileName}_${Date.now()}_${globalIdx}`;
          return this.uploadBufferWithRetry(buffer, fileName, 3);
        });

        const batchResults = await Promise.allSettled(promises);
        for (const res of batchResults) {
          if (res.status === 'fulfilled') {
            results.push(res.value);
          } else {
            console.warn('[CloudinaryUploader] Individual upload failed:', res.reason?.message);
          }
        }
      }

      // If all Cloudinary uploads failed, fall back to data URIs / mock URLs
      if (results.length === 0) {
        console.warn('[CloudinaryUploader] All Cloudinary uploads failed. Falling back to data URIs.');
        return imageBuffers.map((buffer, i) => {
          if (buffer && buffer.length > 200) {
            const mime = this.detectMimeType(buffer);
            return `data:${mime};base64,${buffer.toString('base64')}`;
          }
          const keywords = this.extractKeywords(prompt);
          const encodedKeywords = keywords.split(',').map(encodeURIComponent).join(',');
          return `https://loremflickr.com/1280/720/${encodedKeywords}?random=${i}_${Date.now()}`;
        });
      }

      return results;
    } catch (err) {
      console.error('[CloudinaryUploader] uploadMultiple failed:', err.message);
      // Graceful fallback instead of throwing
      return imageBuffers.map((buffer, i) => {
        if (buffer && buffer.length > 200) {
          const mime = this.detectMimeType(buffer);
          return `data:${mime};base64,${buffer.toString('base64')}`;
        }
        const keywords = this.extractKeywords(prompt);
        const encodedKeywords = keywords.split(',').map(encodeURIComponent).join(',');
        return `https://loremflickr.com/1280/720/${encodedKeywords}?random=${i}_${Date.now()}`;
      });
    }
  }

  async uploadBufferWithRetry(imageBuffer, fileName, maxRetries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.uploadBufferWithTimeout(imageBuffer, fileName, 30000);
      } catch (err) {
        lastError = err;
        console.warn(`[CloudinaryUploader] Upload attempt ${attempt}/${maxRetries} failed:`, err.message);
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    throw lastError;
  }

  uploadBufferWithTimeout(imageBuffer, fileName, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Upload timeout after ${timeoutMs}ms for ${fileName}`));
      }, timeoutMs);

      const options = {
        resource_type: 'image',
        folder: 'ai-thumbnail-studio',
        use_filename: true,
        unique_filename: true,
        public_id: fileName
      };

      cloudinary.uploader.upload_stream(options, (err, result) => {
        clearTimeout(timeout);
        if (err) {
          console.error('[CloudinaryUploader] Cloudinary upload stream error:', err);
          reject(err);
        } else {
          console.log('[CloudinaryUploader] Upload success:', result.secure_url);
          resolve(result.secure_url);
        }
      }).end(imageBuffer);
    });
  }
}

module.exports = CloudinaryUploader;
