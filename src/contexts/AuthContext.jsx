import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, usersAPI } from '../lib/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setProfile(parsedUser);
        
        // Fetch fresh user data
        fetchCurrentUser();
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.success) {
        setUser(response.data.user);
        setProfile(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      // If fetching user fails, clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ email, password, username, full_name }) => {
    try {
      const response = await authAPI.register({
        email,
        password,
        username,
        full_name
      });

      if (response.success) {
        const { token, refreshToken, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setProfile(user);
        
        return { data: response.data, error: null };
      }
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      const response = await authAPI.login({ email, password });

      if (response.success) {
        const { token, refreshToken, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setProfile(user);
        
        return { data: response.data, error: null };
      }
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  };

  const signOut = async () => {
    try {
      await authAPI.logout();
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      setUser(null);
      setProfile(null);
      
      return { error: null };
    } catch (error) {
      return { error: { message: error.message } };
    }
  };

  const resetPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return { error: null, data: response };
    } catch (error) {
      return { error: { message: error.message } };
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.updatePassword(currentPassword, newPassword);
      return { error: null, data: response };
    } catch (error) {
      return { error: { message: error.message } };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      const response = await usersAPI.updateProfile(updates);

      if (response.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        setProfile(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { error: null };
      }
    } catch (error) {
      return { error: { message: error.message } };
    }
  };

  const uploadAvatar = async (file) => {
    try {
      if (!user) throw new Error('No user logged in');

      const response = await usersAPI.uploadAvatar(file);

      if (response.success) {
        const updatedUser = { ...user, avatar_url: response.data.avatar_url };
        setUser(updatedUser);
        setProfile(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return { data: response.data.avatar_url, error: null };
      }
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  };

  const isAdmin = useCallback(() => {
    return profile?.role === 'admin';
  }, [profile]);

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
