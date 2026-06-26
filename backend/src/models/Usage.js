const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['image-generation', 'prompt-enhancement', 'background-removal', 'text-overlay'],
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  creditsConsumed: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  error: String
}, {
  timestamps: true
});

const Usage = mongoose.model('Usage', usageSchema);
module.exports = Usage;
