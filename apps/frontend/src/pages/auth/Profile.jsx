import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';

const Profile = () => {
  const { user, profile, updateProfile, uploadAvatar, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    bio: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        fullName: profile.full_name || '',
        bio: profile.bio || '',
      });
      setAvatarPreview(profile.avatar_url || '');
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, avatar: 'File size must be less than 2MB' }));
        return;
      }
      
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, avatar: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
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

    // Upload avatar if changed
    if (avatarFile) {
      const { error: avatarError } = await uploadAvatar(avatarFile);
      if (avatarError) {
        setMessage({ type: 'error', text: avatarError.message });
        setLoading(false);
        return;
      }
    }

    // Update profile
    const { error } = await updateProfile({
      username: formData.username,
      full_name: formData.fullName,
      bio: formData.bio,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    }
  };

  if (authLoading) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Profile
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card className="overflow-hidden shadow-2xl">
          {/* Success/Error Message */}
          {message.text && (
            <div className={`px-6 py-4 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' 
                : 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={`font-medium ${
                  message.type === 'success' 
                    ? 'text-green-800 dark:text-green-300' 
                    : 'text-red-800 dark:text-red-300'
                }`}>
                  {message.text}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
              <div className="relative group mb-4">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl ring-4 ring-blue-100 dark:ring-blue-900/30"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-4 ring-blue-100 dark:ring-blue-900/30">
                    {formData.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <label htmlFor="avatar" className="cursor-pointer">
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Change Avatar
                  </span>
                </label>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Max file size: 2MB
                </p>
                {errors.avatar && (
                  <p className="text-red-500 text-sm mt-2">{errors.avatar}</p>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <Input
                label="Username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                fullWidth
                required
                placeholder="Enter your username"
              />

              <Input
                label="Full Name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                fullWidth
                required
                placeholder="Enter your full name"
              />

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-slate-900 dark:text-white"
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Brief description for your profile
                </p>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-3 gap-4 my-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Articles</div>
              </div>
              <div className="text-center border-x border-slate-300 dark:border-slate-600">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Comments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Likes</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button 
                type="submit" 
                loading={loading}
                className="flex-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Account Info */}
        <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Email</span>
              <span className="font-medium text-slate-900 dark:text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Member since</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Role</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {profile?.role || 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
