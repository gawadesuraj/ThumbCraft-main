const mongoose = require('mongoose');

const thumbnailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null,
    index: true
  },
  type: {
    type: String,
    enum: ['text-to-image', 'image-to-image'],
    required: true
  },
  originalPrompt: {
    type: String,
    required: true
  },
  finalPrompt: {
    type: String,
    required: true
  },
  enhancedPrompt: {
    type: Boolean,
    default: false
  },
  styleConfig: {
    category: String,
    mood: String,
    theme: String,
    primaryColor: String,
    includeText: Boolean,
    textStyle: String,
    thumbnailStyle: String,
    customPrompt: String
  },
  inputImage: {
    originalName: String,
    size: Number,
    mimeType: String,
    url: String // Reference image URL if uploaded
  },
  imageUrls: {
    type: [String],
    required: true
  },
  provider: {
    type: String,
    enum: ['gemini', 'openai', 'openrouter', 'mock'],
    default: 'gemini'
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Thumbnail = mongoose.model('Thumbnail', thumbnailSchema);
module.exports = Thumbnail;
