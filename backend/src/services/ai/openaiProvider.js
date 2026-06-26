const OpenAI = require('openai');
const AIProvider = require('./aiProvider');

class OpenAIProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = process.env.OPENAI_API_KEY;
    if (this.apiKey) {
      this.openai = new OpenAI({ apiKey: this.apiKey });
    }
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async generateImages(prompt, count = 1) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is not set');
    }

    console.log(`[OpenAIProvider] Generating image via DALL-E for: "${prompt}"`);
    try {
      // DALL-E-3 only supports count = 1 per request
      const model = process.env.OPENAI_IMAGE_MODEL || 'dall-e-3';
      
      const promises = Array.from({ length: count }, async () => {
        const response = await this.openai.images.generate({
          model,
          prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json'
        });
        
        const base64Data = response.data[0].b64_json;
        return Buffer.from(base64Data, 'base64');
      });

      return await Promise.all(promises);
    } catch (err) {
      console.error('[OpenAIProvider] Error generating image:', err.message);
      throw err;
    }
  }

  async generateImagesFromImage(imageBuffer, prompt, count = 1, onImageComplete = null) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is not set');
    }

    console.log(`[OpenAIProvider] Generating image edits/variations via DALL-E`);
    try {
      // DALL-E-2 supports image edits/variations
      // Note: OpenAI requires PNG format for edits/variations
      // Since it is complex to convert buffers dynamically without sharp/canvas (which might not be installed),
      // we'll write a clean wrapper that attempts to call image creation variation or fallback to standard prompt generation
      const response = await this.openai.images.createVariation({
        image: imageBuffer,
        n: count,
        size: '1024x1024',
        response_format: 'b64_json'
      });

      const buffers = response.data.map((item, index) => {
        const buffer = Buffer.from(item.b64_json, 'base64');
        if (onImageComplete) {
          onImageComplete(buffer, index + 1);
        }
        return buffer;
      });

      return buffers;
    } catch (err) {
      console.warn('[OpenAIProvider] Edits failed, falling back to standard text-to-image with reference text:', err.message);
      return await this.generateImages(`Incorporate the visual layout and style of the input reference. ${prompt}`, count);
    }
  }

  async enhancePrompt(userPrompt) {
    if (!this.isConfigured()) return userPrompt;
    try {
      console.log('[OpenAIProvider] Enhancing prompt with GPT...');
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert prompt engineer for AI image generators.
Enhance the user's prompt to be highly visual, detailed, and optimized.
Keep descriptions within 1-2 sentences. Keep the core subject intact.`
          },
          {
            role: 'user',
            content: `Enhance this prompt: "${userPrompt}"`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      return response.choices[0].message.content.trim();
    } catch (err) {
      console.warn('[OpenAIProvider] Enhance failed, returning original:', err.message);
      return userPrompt;
    }
  }
}

module.exports = OpenAIProvider;
