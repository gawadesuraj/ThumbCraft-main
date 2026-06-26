const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: String,
  category: {
    type: String,
    required: true
  },
  styleConfig: {
    mood: String,
    theme: String,
    primaryColor: String,
    includeText: Boolean,
    textStyle: String,
    thumbnailStyle: String
  },
  promptTemplate: {
    type: String,
    required: true
  },
  exampleUrl: String,
  isCommunity: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Template = mongoose.model('Template', templateSchema);
module.exports = Template;
