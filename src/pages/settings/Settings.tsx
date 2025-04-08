import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Sun, Moon, User, Lock } from 'lucide-react';
import { RootState } from '../../store/store';
import { setTheme } from '../../store/slices/themeSlice';
import type { ThemeMode } from '../../store/slices/themeSlice';
import { ProfileFormData, PasswordFormData } from '../../utils/form';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const mode = useSelector((state: RootState) => state.theme.mode);
  
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    setProfileSuccess('');
    setProfileError('');

    setTimeout(() => {
      setProfileSuccess('');
    }, 3000);
  };
  
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    setPasswordSuccess('');
    setPasswordError('');
    
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    setTimeout(() => {
      setPasswordSuccess('');
    }, 3000);
  };
  
  const handleThemeChange = (newTheme: ThemeMode) => {
    dispatch(setTheme(newTheme));
  };
  
  return (
    <motion.div
      className="p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-2xl font-bold mb-6 text-gray-800 dark:text-white"
        variants={itemVariants}
      >
        Settings
      </motion.h1>
      
      {/* Profile Settings Section */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
        variants={itemVariants}
      >
        <div className="flex items-center mb-4">
          <User className="h-5 w-5 mr-2 text-primary-500" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Profile Information</h2>
        </div>
        
        <form onSubmit={handleProfileUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          {profileSuccess && (
            <div className="mb-4 p-2 bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300 rounded">
              {profileSuccess}
            </div>
          )}
          
          {profileError && (
            <div className="mb-4 p-2 bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300 rounded">
              {profileError}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none"
            >
              Update Profile
            </button>
          </div>
        </form>
      </motion.div>
      
      {/* Password Settings Section */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
        variants={itemVariants}
      >
        <div className="flex items-center mb-4">
          <Lock className="h-5 w-5 mr-2 text-primary-500" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Change Password</h2>
        </div>
        
        <form onSubmit={handlePasswordUpdate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          {passwordSuccess && (
            <div className="mb-4 p-2 bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300 rounded">
              {passwordSuccess}
            </div>
          )}
          
          {passwordError && (
            <div className="mb-4 p-2 bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300 rounded">
              {passwordError}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none"
            >
              Update Password
            </button>
          </div>
        </form>
      </motion.div>
      
      {/* Theme Settings Section */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        variants={itemVariants}
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Appearance</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleThemeChange('light')}
            className={`p-4 flex flex-col items-center justify-center rounded-lg border transition-all ${
              mode === 'light' 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Sun size={24} className="mb-2" />
            <span>Light</span>
          </button>
          
          <button
            onClick={() => handleThemeChange('dark')}
            className={`p-4 flex flex-col items-center justify-center rounded-lg border transition-all ${
              mode === 'dark' 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300' 
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Moon size={24} className="mb-2" />
            <span>Dark</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Settings; 