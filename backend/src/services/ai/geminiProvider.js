const { GoogleGenAI } = require('@google/genai');
const AIProvider = require('./aiProvider');

class GeminiProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
    // Image-capable models to try in order (free-tier compatible)
    this.imageModels = [
      'gemini-2.5-flash-image',
      'gemini-3.1-flash-image',
      'gemini-3-pro-image',
    ];
    // Text-only model for prompt enhancement
    this.textModel = 'gemini-2.5-flash';
    this.model = 'gemini-2.5-flash-image';
  }

  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Text-to-Image: Uses generateContent with responseModalities: ['IMAGE', 'TEXT']
   * Tries multiple image-capable models in order before falling back to mock.
   */
  async generateImages(prompt, count = 4) {
    if (!this.isConfigured()) {
      console.warn('[GeminiProvider] Gemini API key is not set. Falling back to mock images.');
      return this.getMockImages(count, prompt);
    }

    // Generate images one at a time since generateContent returns 1 image per call
    const imageBuffers = [];

    for (let i = 0; i < count; i++) {
      const buffer = await this.generateSingleImage(prompt, i + 1);
      if (buffer) {
        imageBuffers.push(buffer);
      }
    }

    if (imageBuffers.length === 0) {
      console.warn('[GeminiProvider] All image generation attempts failed. Falling back to mock images.');
      return this.getMockImages(count, prompt);
    }

    return imageBuffers;
  }

  /**
   * Generate a single image by trying each image model in the fallback chain.
   */
  async generateSingleImage(prompt, index) {
    for (const modelName of this.imageModels) {
      try {
        console.log(`[GeminiProvider] Generating image ${index} using ${modelName}...`);
        const response = await this.ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        });

        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              const buffer = Buffer.from(part.inlineData.data, 'base64');
              
              // The Gemini Image API sometimes returns a tiny solid black/blank placeholder image 
              // (usually < 5KB) if the prompt triggers a safety filter or contains text-generation commands (like "explain").
              if (buffer.length < 15000) {
                console.warn(`[GeminiProvider] ${modelName} returned a suspiciously small image (${buffer.length} bytes). Likely a black placeholder from safety filters.`);
                continue; // Reject and try next model / fallback
              }

              console.log(`[GeminiProvider] ✅ Image ${index} generated successfully via ${modelName} (${buffer.length} bytes)`);
              return buffer;
            }
          }
        }
        console.warn(`[GeminiProvider] ${modelName} returned no image data for image ${index}`);
      } catch (err) {
        const msg = err.message || JSON.stringify(err);
        console.warn(`[GeminiProvider] ${modelName} failed for image ${index}: ${msg.substring(0, 200)}`);
        // If it's a quota error, try next model
        if (msg.includes('429') || msg.includes('quota')) continue;
        // If it's a billing/plan error, try next model
        if (msg.includes('paid plan') || msg.includes('billing')) continue;
        // For other errors, also try next model
        continue;
      }
    }
    return null;
  }

  /**
   * Image-to-Image: Uses generateContent with the reference image + prompt
   */
  async generateImagesFromImage(imageBuffer, prompt, count = 4, onImageComplete = null) {
    if (!this.isConfigured()) {
      console.warn('[GeminiProvider] Gemini API key is not set. Falling back to mock images.');
      return this.getMockImages(count, prompt);
    }

    console.log(`[GeminiProvider] Image-to-Image request for ${count} variations`);
    const resultBuffers = [];

    for (let i = 0; i < count; i++) {
      const buffer = await this.generateSingleImageFromImage(imageBuffer, prompt, i + 1);
      if (buffer) {
        resultBuffers.push(buffer);
        if (onImageComplete && typeof onImageComplete === 'function') {
          try {
            await onImageComplete(buffer, i + 1);
          } catch (err) {
            console.warn(`[GeminiProvider] Callback failed for index ${i + 1}:`, err.message);
          }
        }
      }
    }

    if (resultBuffers.length === 0) {
      console.warn('[GeminiProvider] Image-to-image generation failed. Falling back to mock images.');
      const mockBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      const buffers = Array.from({ length: count }, () => mockBuffer);
      if (onImageComplete) {
        buffers.forEach((buf, i) => onImageComplete(buf, i + 1));
      }
      return buffers;
    }

    return resultBuffers;
  }

  /**
   * Generate a single image-to-image variation by trying each image model.
   */
  async generateSingleImageFromImage(imageBuffer, prompt, index) {
    const base64Image = imageBuffer.toString('base64');
    const mimeType = this.detectMimeType(imageBuffer);

    const editPrompt = `Edit and restyle this reference image based on the following instructions. 
Preserve the core subject, characters, and composition but apply the requested modifications.
Make the output suitable as a highly engaging YouTube thumbnail in widescreen 16:9 format.

Modification Request: ${prompt}`;

    const contents = [
      {
        role: 'user',
        parts: [
          { text: editPrompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          }
        ]
      }
    ];

    for (const modelName of this.imageModels) {
      try {
        console.log(`[GeminiProvider] Generating Img2Img variation ${index} using ${modelName}...`);
        const response = await this.ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        });

        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              const buffer = Buffer.from(part.inlineData.data, 'base64');
              
              if (buffer.length < 15000) {
                console.warn(`[GeminiProvider] ${modelName} returned a suspiciously small image (${buffer.length} bytes). Likely a black placeholder from safety filters.`);
                continue; 
              }

              console.log(`[GeminiProvider] ✅ Img2Img variation ${index} generated via ${modelName} (${buffer.length} bytes)`);
              return buffer;
            }
          }
        }
        console.warn(`[GeminiProvider] ${modelName} returned no image data for variation ${index}`);
      } catch (err) {
        const msg = err.message || JSON.stringify(err);
        console.warn(`[GeminiProvider] ${modelName} failed for Img2Img ${index}: ${msg.substring(0, 200)}`);
        continue;
      }
    }
    return null;
  }

  async enhancePrompt(userPrompt) {
    if (!this.isConfigured()) return userPrompt;
    try {
      console.log('[GeminiProvider] Enhancing prompt with Gemini...');
      const response = await this.ai.models.generateContent({
        model: this.textModel,
        contents: `You are an expert prompt engineer for AI image generation.
Enhance this prompt to be highly visual, detailed, and optimized for image models in 1-2 descriptive sentences.
Keep the core concept intact.

Input: "${userPrompt}"
Output:`
      });

      const text = response.text ? response.text.trim() : '';
      return text || userPrompt;
    } catch (error) {
      console.warn('[GeminiProvider] Prompt enhancement failed, returning original:', error.message);
      return userPrompt;
    }
  }

  async getMockImages(count, prompt = '', onComplete = null) {
    console.log(`[GeminiProvider] Mock fallback active. Returning placeholder buffers.`);
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const buffers = Array.from({ length: count }, () => buffer);
    if (onComplete && typeof onComplete === 'function') {
      buffers.forEach((buf, i) => {
        try {
          onComplete(buf, i + 1);
        } catch (err) {
          console.warn(`[GeminiProvider] Mock callback failed for index ${i + 1}:`, err.message);
        }
      });
    }
    return buffers;
  }
}

module.exports = GeminiProvider;
