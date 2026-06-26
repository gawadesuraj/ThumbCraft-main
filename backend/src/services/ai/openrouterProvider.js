const axios = require('axios');
const AIProvider = require('./aiProvider');

class OpenRouterProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = process.env.OPENROUTER_API_KEY;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async generateImages(prompt, count = 1) {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key is not set');
    }

    console.log(`[OpenRouterProvider] Generating ${count} images for: "${prompt}"`);
    try {
      // OpenRouter supports image generation using specific models, e.g. stabilityai/stable-diffusion-xl
      const model = process.env.OPENROUTER_IMAGE_MODEL || 'stabilityai/stable-diffusion-xl';
      
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          prompt,
          response_format: 'b64_json',
          n: count
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.data) {
        return response.data.data.map(item => Buffer.from(item.b64_json, 'base64'));
      }
      throw new Error('Invalid response structure from OpenRouter');
    } catch (err) {
      console.error('[OpenRouterProvider] Generation error:', err.message);
      throw err;
    }
  }

  async generateImagesFromImage(imageBuffer, prompt, count = 1, onImageComplete = null) {
    // If image-to-image is unsupported by selected model, fallback to prompt-based generation
    console.warn('[OpenRouterProvider] Image-to-image fallback to text-to-image');
    return await this.generateImages(prompt, count);
  }

  async enhancePrompt(userPrompt) {
    if (!this.isConfigured()) return userPrompt;
    try {
      console.log('[OpenRouterProvider] Enhancing prompt with OpenRouter...');
      const model = process.env.OPENROUTER_TEXT_MODEL || 'google/gemini-2.5-flash';
      
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'Enhance the user\'s prompt to make it descriptive, artistic, and suitable for high-quality image generation. Keep it to 1-2 sentences.'
            },
            {
              role: 'user',
              content: userPrompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const enhanced = response.data.choices[0].message.content.trim();
      return enhanced;
    } catch (err) {
      console.warn('[OpenRouterProvider] Enhance failed, returning original:', err.message);
      return userPrompt;
    }
  }
}

module.exports = OpenRouterProvider;
