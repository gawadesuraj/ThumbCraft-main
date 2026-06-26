class AIProvider {
  /**
   * Check if the provider is fully configured with API keys
   * @returns {boolean}
   */
  isConfigured() {
    throw new Error('isConfigured() must be implemented by subclasses');
  }

  /**
   * Generates multiple images based on a prompt
   * @param {string} prompt - Final prompt text
   * @param {number} count - Number of variations to create
   * @returns {Promise<Buffer[]>} - Array of image buffers
   */
  async generateImages(prompt, count) {
    throw new Error('generateImages() must be implemented by subclasses');
  }

  /**
   * Generates multiple images using a reference image buffer
   * @param {Buffer} imageBuffer - Reference image
   * @param {string} prompt - Modification details
   * @param {number} count - Number of variations
   * @param {Function} [onImageComplete] - Immediate upload callback
   * @returns {Promise<Buffer[]>}
   */
  async generateImagesFromImage(imageBuffer, prompt, count, onImageComplete) {
    throw new Error('generateImagesFromImage() must be implemented by subclasses');
  }

  /**
   * Enhances a prompt for better visual generation outputs
   * @param {string} userPrompt - Original input
   * @returns {Promise<string>}
   */
  async enhancePrompt(userPrompt) {
    throw new Error('enhancePrompt() must be implemented by subclasses');
  }

  /**
   * Detects image MIME type from buffers
   */
  detectMimeType(buffer) {
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
}

module.exports = AIProvider;
