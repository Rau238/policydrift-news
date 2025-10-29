const mongoose = require('mongoose');
const slugify = require('slugify');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Article content is required']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  featured_image: {
    type: String,
    required: [true, 'Featured image is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  published_at: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  reading_time: {
    type: Number, // in minutes
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBreakingNews: {
    type: Boolean,
    default: false
  },
  meta_title: String,
  meta_description: String,
  meta_keywords: [String],
  allow_comments: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug before saving
articleSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    this.slug = `${baseSlug}-${Date.now()}`;
  }
  
  // Calculate reading time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.reading_time = Math.ceil(wordCount / 200);
  }
  
  // Auto-generate excerpt if not provided
  if (!this.excerpt && this.content) {
    const plainText = this.content.replace(/<[^>]*>/g, '');
    this.excerpt = plainText.substring(0, 200) + '...';
  }
  
  // Set published_at when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.published_at) {
    this.published_at = new Date();
  }
  
  next();
});

// Index for search and performance
articleSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
articleSchema.index({ status: 1, published_at: -1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ author: 1, status: 1 });
// Note: slug index is already created via unique: true in schema definition

// Virtual for comments
articleSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'article',
  match: { isApproved: true, isDeleted: false }
});

// Virtual for bookmarks count
articleSchema.virtual('bookmarksCount', {
  ref: 'Bookmark',
  localField: '_id',
  foreignField: 'article',
  count: true
});

module.exports = mongoose.model('Article', articleSchema);
