import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import ErrorMessage from '../../components/ui/ErrorMessage';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    icon: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name
    if (name === 'name' && !editingCategory) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.slug.trim()) errors.slug = 'Slug is required';
    if (!/^[a-z0-9-]+$/.test(formData.slug)) errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            color: formData.color,
            icon: formData.icon
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([{
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            color: formData.color,
            icon: formData.icon
          }]);

        if (error) throw error;
      }

      await fetchCategories();
      closeModal();
    } catch (err) {
      setFormErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#3B82F6',
      icon: category.icon || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"? This will affect all articles in this category.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;
      await fetchCategories();
    } catch (err) {
      alert('Error deleting category: ' + err.message);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
      icon: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
      icon: ''
    });
    setFormErrors({});
  };

  if (loading) return <Loading fullScreen text="Loading categories..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCategories} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Categories Management</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{categories.length} categories total</p>
        </div>
        <Button onClick={openCreateModal} variant="primary" className="w-full sm:w-auto">
          <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add Category</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🏷️</div>
          <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">No categories yet</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Create your first category to organize articles
          </p>
          <Button onClick={openCreateModal} variant="primary">
            Create First Category
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {category.icon && (
                    <div className="text-3xl">{category.icon}</div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">/{category.slug}</p>
                  </div>
                </div>
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow"
                  style={{ backgroundColor: category.color }}
                  title={category.color}
                />
              </div>
              
              {category.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="flex-1 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(category)}
                  className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 px-2 sm:px-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formErrors.submit && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                  {formErrors.submit}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Category Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={formErrors.name}
                  placeholder="e.g., Technology"
                  required
                  fullWidth
                />

                <Input
                  label="Slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  error={formErrors.slug}
                  placeholder="e.g., technology"
                  required
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Brief description of this category..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-16 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                    />
                    <Input
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="#3B82F6"
                      fullWidth
                    />
                  </div>
                </div>

                <Input
                  label="Icon (Emoji)"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="💻"
                  fullWidth
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button type="submit" variant="primary" loading={saving} className="flex-1">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
