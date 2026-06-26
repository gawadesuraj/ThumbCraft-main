const crypto = require('crypto');

class PromptCache {
  constructor(maxSize = 100, ttlMinutes = 60) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
  }

  generateKey(prompt) {
    return crypto.createHash('md5').update(prompt.trim().toLowerCase()).digest('hex');
  }

  get(originalPrompt) {
    const key = this.generateKey(originalPrompt);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`[PromptCache] Cache hit: ${key.substring(0, 8)}...`);
    return cached.enhancedPrompt;
  }

  set(originalPrompt, enhancedPrompt) {
    const key = this.generateKey(originalPrompt);
    
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      enhancedPrompt,
      timestamp: Date.now()
    });
    
    console.log(`[PromptCache] Cached: ${key.substring(0, 8)}...`);
  }

  clear() {
    this.cache.clear();
    console.log('[PromptCache] Cache cleared');
  }
}

module.exports = new PromptCache();
