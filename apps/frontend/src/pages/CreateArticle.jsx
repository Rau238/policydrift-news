import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { articlesAPI, categoriesAPI, tagsAPI } from '../lib/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';

const CreateArticle = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef(null);
  
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: '#3B82F6', icon: '' });
  const [newTag, setNewTag] = useState({ name: '', description: '', color: '' });
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    status: 'draft',
    is_featured: false,
  });
  
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const isEditMode = !!editId;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
    if (isEditMode) {
      fetchArticle();
    }
  }, [isEditMode, editId]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagsAPI.getAll();
      setAvailableTags(response.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await articlesAPI.getById(editId);
      const data = response.data;

      if (data.author._id !== user.id) {
        navigate('/');
        return;
      }

      setFormData({
        title: data.title,
        excerpt: data.excerpt || '',
        content: data.content,
        category: data.category._id || '',
        status: data.status || 'draft',
        is_featured: data.is_featured || false,
      });
      
      setSelectedTags(data.tags?.map(tag => tag._id) || []);
      setExistingImageUrl(data.featured_image || '');
      setImagePreview(data.featured_image || '');
    } catch (err) {
      console.error('Error fetching article:', err);
      setMessage({ type: 'error', text: 'Failed to load article' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'File size must be less than 5MB' }));
        return;
      }

      setFeaturedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await categoriesAPI.create({
        name: newCategory.name,
        description: newCategory.description,
        color: newCategory.color,
        icon: newCategory.icon,
      });

      setCategories(prev => [...prev, response.data]);
      setFormData(prev => ({ ...prev, category: response.data._id }));
      setShowNewCategoryModal(false);
      setNewCategory({ name: '', description: '', color: '#3B82F6', icon: '' });
      setMessage({ type: 'success', text: 'Category created successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      alert('Error creating category: ' + err.message);
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;

    try {
      const response = await tagsAPI.create({
        name: newTag.name.trim(),
        description: newTag.description,
        color: newTag.color,
      });

      setAvailableTags(prev => [...prev, response.data]);
      setSelectedTags(prev => [...prev, response.data._id]);
      setShowNewTagModal(false);
      setNewTag({ name: '', description: '', color: '' });
      setMessage({ type: 'success', text: 'Tag created successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      alert('Error creating tag: ' + err.message);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 100) {
      newErrors.content = 'Content must be at least 100 characters';
    }

    if (!isEditMode && !featuredImage && !imagePreview) {
      newErrors.image = 'Featured image is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('content', formData.content.trim());
      if (formData.excerpt) submitData.append('excerpt', formData.excerpt.trim());
      submitData.append('category', formData.category);
      submitData.append('tags', JSON.stringify(selectedTags));
      submitData.append('status', formData.status);
      submitData.append('is_featured', formData.is_featured);
      
      // Only append image if a new one was selected
      if (featuredImage) {
        submitData.append('image', featuredImage);
      }

      let response;
      if (isEditMode) {
        response = await articlesAPI.update(editId, submitData);
      } else {
        response = await articlesAPI.create(submitData);
      }

      setMessage({ 
        type: 'success', 
        text: isEditMode ? 'Article updated successfully!' : 'Article created successfully!' 
      });
      
      setTimeout(() => {
        navigate(`/article/${response.data.slug}`);
      }, 1500);
    } catch (err) {
      console.error('Error saving article:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save article' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (isEditMode && loading)) {
    return <Loading fullScreen text={isEditMode ? 'Loading article...' : 'Loading...'} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {isEditMode ? '✏️ Edit Article' : '✨ Create New Article'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {isEditMode ? 'Update your article details' : 'Share your story with the world'}
              </p>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                <span className={`ml-2 font-semibold ${
                  formData.status === 'published' ? 'text-green-600' : 
                  formData.status === 'draft' ? 'text-yellow-600' : 'text-slate-600'
                }`}>
                  {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fadeIn ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          }`}>
            {message.type === 'success' ? (
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Content Card */}
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Article Details
            </h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Article Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter an engaging title..."
                  className="w-full px-4 py-3 text-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Excerpt (Optional)
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Write a brief summary of your article..."
                  rows="3"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your article content here..."
                  rows="20"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-mono text-sm"
                />
                {errors.content && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                )}
                <p className="mt-2 text-xs text-slate-500">{formData.content.length} characters</p>
              </div>
            </div>
          </Card>

          {/* Featured Image */}
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Featured Image <span className="text-red-500">*</span>
            </h2>

            {imagePreview && (
              <div className="relative group mb-4">
                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-xl"/>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setFeaturedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl"
            />
            {errors.image && (
              <p className="mt-2 text-sm text-red-600">{errors.image}</p>
            )}
          </Card>

          {/* Category & Tags */}
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Classification
            </h2>

            <div className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    New
                  </button>
                </div>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag._id}
                      type="button"
                      onClick={() => toggleTag(tag._id)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTags.includes(tag._id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowNewTagModal(true)}
                    className="px-3 py-1 rounded-full text-sm bg-green-600 text-white"
                  >
                    + New Tag
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Publishing Options */}
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Publishing Options
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                  Mark as featured article
                </label>
              </div>
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Article' : 'Create Article')}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Category Modal */}
        {showNewCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Create New Category</h3>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Icon (emoji)"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                  className="w-full h-10 rounded-lg"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryModal(false)}
                    className="px-4 py-2 bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tag Modal */}
        {showNewTagModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Create New Tag</h3>
              <form onSubmit={handleCreateTag} className="space-y-4">
                <input
                  type="text"
                  placeholder="Tag name"
                  value={newTag.name}
                  onChange={(e) => setNewTag({...newTag, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newTag.description}
                  onChange={(e) => setNewTag({...newTag, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag({...newTag, color: e.target.value})}
                  className="w-full h-10 rounded-lg"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewTagModal(false)}
                    className="px-4 py-2 bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateArticle;
