const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only bookmark an article once
bookmarkSchema.index({ user: 1, article: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
