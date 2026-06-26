const GeminiProvider = require('./ai/geminiProvider');
const OpenAIProvider = require('./ai/openaiProvider');
const OpenRouterProvider = require('./ai/openrouterProvider');
const MockProvider = require('./ai/mockProvider');

const userRepository = require('../repositories/userRepository');
const usageRepository = require('../repositories/usageRepository');
const promptCache = require('../utils/promptCache');

class AIService {
  constructor() {
    this.providers = {
      gemini: new GeminiProvider(),
      openai: new OpenAIProvider(),
      openrouter: new OpenRouterProvider(),
      mock: new MockProvider()
    };
  }

  /**
   * Get the active provider instance or fallback
   * @param {string} name - Provider code name
   * @returns {AIProvider}
   */
  getProvider(name) {
    const selected = this.providers[name];
    if (selected && selected.isConfigured()) {
      return selected;
    }

    // Search for first configured real provider
    for (const key of ['gemini', 'openai', 'openrouter']) {
      if (this.providers[key].isConfigured()) {
        console.warn(`[AIService] Selected provider "${name}" not configured. Falling back to "${key}".`);
        return this.providers[key];
      }
    }

    // Ultimate fallback is Mock
    console.warn(`[AIService] No real AI providers configured. Falling back to MockProvider.`);
    return this.providers.mock;
  }

  /**
   * Generates images based on prompt and configurations
   */
  async generateImages(userId, providerName, data, count = 4) {
    const provider = this.getProvider(providerName);
    const resolvedProviderName = provider === this.providers.mock ? 'mock' : providerName;

    // Credit validation
    const bypassCredits = process.env.BYPASS_CREDIT_LIMIT === 'true';
    const cost = bypassCredits ? 0 : 5;

    if (!bypassCredits) {
      const user = await userRepository.findById(userId);
      if (!user || user.credits < cost) {
        throw new Error(`Insufficient credits. You need at least ${cost} credits to generate thumbnails.`);
      }
    }

    // Format final prompt
    let finalPrompt = this.buildStructuredPrompt(data, false);

    // Enhance prompt if requested
    if (data.enhancePrompt) {
      const cached = promptCache.get(finalPrompt);
      if (cached) {
        finalPrompt = cached;
      } else {
        const enhanced = await provider.enhancePrompt(finalPrompt);
        promptCache.set(finalPrompt, enhanced);
        finalPrompt = enhanced;
        
        const enhancementCost = bypassCredits ? 0 : 1;
        // Log enhancement usage
        await usageRepository.create({
          userId,
          action: 'prompt-enhancement',
          provider: resolvedProviderName,
          model: 'text-enhancer',
          creditsConsumed: enhancementCost,
          status: 'success'
        });
        if (enhancementCost > 0) {
          await userRepository.deductCredits(userId, enhancementCost);
        }
      }
    }

    try {
      const images = await provider.generateImages(finalPrompt, count);
      
      // Log generation usage
      await usageRepository.create({
        userId,
        action: 'image-generation',
        provider: resolvedProviderName,
        model: provider.model || 'generation-model',
        creditsConsumed: cost,
        status: 'success'
      });

      // Deduct credits
      await userRepository.deductCredits(userId, cost);

      return {
        images,
        finalPrompt,
        provider: resolvedProviderName
      };
    } catch (err) {
      // Log failed attempt
      await usageRepository.create({
        userId,
        action: 'image-generation',
        provider: resolvedProviderName,
        model: provider.model || 'generation-model',
        creditsConsumed: 0,
        status: 'failed',
        error: err.message
      });
      throw err;
    }
  }

  /**
   * Generates images using reference image and modification instructions
   */
  async generateFromImage(userId, providerName, data, imageBuffer, count = 1, onImageComplete = null) {
    const provider = this.getProvider(providerName);
    const resolvedProviderName = provider === this.providers.mock ? 'mock' : providerName;

    // Credit validation
    const bypassCredits = process.env.BYPASS_CREDIT_LIMIT === 'true';
    const cost = bypassCredits ? 0 : 5;

    if (!bypassCredits) {
      const user = await userRepository.findById(userId);
      if (!user || user.credits < cost) {
        throw new Error(`Insufficient credits. You need at least ${cost} credits to generate thumbnails.`);
      }
    }

    let finalPrompt = this.buildStructuredPrompt(data, true);

    if (data.enhancePrompt) {
      const cached = promptCache.get(finalPrompt);
      if (cached) {
        finalPrompt = cached;
      } else {
        const enhanced = await provider.enhancePrompt(finalPrompt);
        promptCache.set(finalPrompt, enhanced);
        finalPrompt = enhanced;

        const enhancementCost = bypassCredits ? 0 : 1;
        await usageRepository.create({
          userId,
          action: 'prompt-enhancement',
          provider: resolvedProviderName,
          model: 'text-enhancer',
          creditsConsumed: enhancementCost,
          status: 'success'
        });
        if (enhancementCost > 0) {
          await userRepository.deductCredits(userId, enhancementCost);
        }
      }
    }

    try {
      const images = await provider.generateImagesFromImage(imageBuffer, finalPrompt, count, onImageComplete);

      await usageRepository.create({
        userId,
        action: 'image-generation',
        provider: resolvedProviderName,
        model: provider.model || 'generation-model',
        creditsConsumed: cost,
        status: 'success'
      });

      await userRepository.deductCredits(userId, cost);

      return {
        images,
        finalPrompt,
        provider: resolvedProviderName
      };
    } catch (err) {
      await usageRepository.create({
        userId,
        action: 'image-generation',
        provider: resolvedProviderName,
        model: provider.model || 'generation-model',
        creditsConsumed: 0,
        status: 'failed',
        error: err.message
      });
      throw err;
    }
  }

  /**
   * Formats prompts structured with questions fields
   */
  buildStructuredPrompt(fields, isImageToImage = false) {
    const {
      category,
      mood,
      theme,
      primaryColor,
      includeText,
      textStyle,
      thumbnailStyle,
      customPrompt,
      originalPrompt
    } = fields;

    let prompt = '';
    const tweaks = [];

    if (isImageToImage) {
      if (originalPrompt) {
        prompt = `Primary objective: ${originalPrompt}. Use the reference image provided as the foundation and modify it. `;
      } else {
        prompt = 'Edit the reference image to optimize it as a YouTube thumbnail. ';
      }

      if (category) tweaks.push(`adapt style for ${category}`);
      if (mood) tweaks.push(`mood: ${mood.toLowerCase()}`);
      if (theme) tweaks.push(`theme: ${theme.toLowerCase()}`);
      if (primaryColor) tweaks.push(`dominant tone: ${primaryColor.toLowerCase()}`);
      if (thumbnailStyle) tweaks.push(`render style: ${thumbnailStyle.toLowerCase()}`);
      if ((includeText === 'Yes' || includeText === true) && textStyle) {
        tweaks.push(`add modern overlay text style: ${textStyle.toLowerCase()}`);
      }

      if (tweaks.length > 0) {
        prompt += 'Style modifications: ' + tweaks.join(', ') + '. ';
      }
      if (customPrompt) {
        prompt += `Extra constraints: ${customPrompt}. `;
      }
      prompt += 'Ensure widescreen composition and preserve high likeness to original features.';
    } else {
      prompt = 'Create a YouTube thumbnail in widescreen 16:9 aspect ratio. ';
      if (originalPrompt) prompt += `Subject: ${originalPrompt}. `;
      if (customPrompt) prompt += `Details: ${customPrompt}. `;

      if (category) tweaks.push(`${category} style`);
      if (thumbnailStyle) tweaks.push(`${thumbnailStyle} design`);
      if (theme) tweaks.push(`${theme} aesthetic`);
      if (mood) tweaks.push(`${mood} vibes`);
      if (primaryColor) tweaks.push(`colors: ${primaryColor}`);
      if ((includeText === 'Yes' || includeText === true) && textStyle) {
        tweaks.push(`with big overlay text in ${textStyle} style`);
      }

      if (tweaks.length > 0) {
        prompt += 'Style tags: ' + tweaks.join(', ') + '. ';
      }
      prompt += 'Clean visual design, highly engaging, contrasty lighting, optimized for click-through rate.';
    }

    return prompt;
  }
}

module.exports = new AIService();
