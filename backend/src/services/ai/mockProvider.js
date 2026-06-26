const AIProvider = require('./aiProvider');

class MockProvider extends AIProvider {
  isConfigured() {
    return true; // Mock is always configured
  }

  async generateImages(prompt, count = 4) {
    console.log(`[MockProvider] Mock generating ${count} variations. Instantly returning placeholder buffers.`);
    const mockBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    return Array.from({ length: count }, () => mockBuffer);
  }

  async generateImagesFromImage(imageBuffer, prompt, count = 1, onImageComplete = null) {
    console.log(`[MockProvider] Mock Img2Img generating ${count} variations using mock images`);
    const mockBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const buffers = Array.from({ length: count }, () => mockBuffer);
    if (onImageComplete) {
      buffers.forEach((buf, i) => onImageComplete(buf, i + 1));
    }
    return buffers;
  }

  async enhancePrompt(userPrompt) {
    console.log('[MockProvider] Mock enhancing prompt...');
    return `[Mock Enhanced] ${userPrompt} - Ultra-detailed 8k, cinematic lighting, vibrant contrast, hyper-realistic composition optimized for high click-through-rate YouTube thumbnail.`;
  }
}

module.exports = MockProvider;
