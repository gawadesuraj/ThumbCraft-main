const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'user-signup',
      'user-login',
      'password-reset',
      'thumbnail-generated',
      'project-created',
      'project-deleted',
      'thumbnail-favorited'
    ]
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

const History = mongoose.model('History', historySchema);
module.exports = History;
