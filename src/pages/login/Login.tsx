import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { motion } from 'framer-motion';
import { LoginFormData } from '../../utils/form';
import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Logging in with:', formData.email);

      const result = await dispatch(login({
        email: formData.email,
        password: formData.password,
      }) as any);

      console.log('Login result:', result);

      if (result.error) {
        throw new Error(result.error.message || 'Login failed');
      }

      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      console.log('Google login success:', credentialResponse);
      setError('');
      setIsLoading(true);

      // Custom login action for Google auth
      const result = await dispatch(login({
        googleCredential: credentialResponse.credential,
      }) as any);

      console.log('Google login result:', result);

      if (result.error) {
        throw new Error(result.error.message || 'Google login failed');
      }

      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Google login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">Welcome Back</h1>

      {error && (
        <div className="mb-4 p-3 bg-danger-100 border border-danger-300 text-danger-800 dark:bg-danger-900 dark:border-danger-700 dark:text-danger-300 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <div className="flex justify-end mt-1">
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Logging in...
            </>
          ) : (
            'Log In'
          )}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-center">
        <div className="border-t border-gray-300 dark:border-gray-600 flex-grow mr-3"></div>
        <span className="text-sm text-gray-500 dark:text-gray-400">Or</span>
        <div className="border-t border-gray-300 dark:border-gray-600 flex-grow ml-3"></div>
      </div>

      <div className="mt-4 flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          theme="filled_blue"
          shape="pill"
          text="signin_with"
          locale="en"
        />
      </div>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
          Register
        </Link>
      </div>
    </motion.div>
  );
};

export default Login; 