import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  login, 
  register, 
  logout, 
  selectCurrentUser, 
  selectIsAuthenticated, 
  selectAuthStatus, 
  selectAuthError 
} from '../store/slices/authSlice';
import { LoginCredentials, RegisterData, User } from '../utils/users';

/**
 * Custom hook for authentication operations
 * Provides login, register, and logout functionality with status tracking
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get auth state from Redux store
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  /**
   * Login a user with email and password
   */
  const handleLogin = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultAction = await dispatch(login(credentials) as any);
      if (login.rejected.match(resultAction)) {
        setError(resultAction.payload as string || 'Login failed');
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   */
  const handleRegister = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultAction = await dispatch(register(data) as any);
      if (register.rejected.match(resultAction)) {
        setError(resultAction.payload as string || 'Registration failed');
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout the current user
   */
  const handleLogout = () => {
    dispatch(logout());
  };

  /**
   * Clear any authentication errors
   */
  const clearError = () => {
    setError(null);
  };

  return {
    user,
    isAuthenticated,
    authStatus,
    authError,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
  };
};

export default useAuth; 