import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import useAuth from '../useAuth';
import { AuthState } from '../../utils/users';
import type { AnyAction } from '@reduxjs/toolkit';

// Mock Redux store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'idle' as const,
        error: null,
        ...initialState
      } as AuthState
    }
  });
};

// Mock the dispatch function for testing async actions
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn().mockImplementation((action: AnyAction) => {
    // Return a resolved promise with mock data for successful login
    if (action.type === 'auth/login/pending') {
      return Promise.resolve({
        type: 'auth/login/fulfilled',
        payload: { user: { id: '1', email: 'test@example.com' }, token: 'fake-token' }
      });
    }
    // Return a rejected promise for failed login
    if (action.type === 'auth/login/rejected') {
      return Promise.resolve({
        type: 'auth/login/rejected',
        payload: 'Invalid credentials'
      });
    }
    // Return a resolved promise for successful registration
    if (action.type === 'auth/register/pending') {
      return Promise.resolve({
        type: 'auth/register/fulfilled',
        payload: { user: { id: '2', email: 'new@example.com' }, token: 'new-token' }
      });
    }
    return action;
  })
}));

// Wrapper component to provide Redux store to tested hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={createTestStore()}>
    {children}
  </Provider>
);

describe('useAuth hook', () => {
  // Test 1: Test successful login
  it('should handle successful login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Initial state
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    
    // Trigger login
    let loginPromise;
    await act(async () => {
      loginPromise = result.current.login({ 
        email: 'test@example.com', 
        password: 'password123' 
      });
    });
    
    // Wait for the async action to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Check final state after login
    expect(await loginPromise).toBe(true);
    expect(result.current.error).toBeNull();
  });

  // Test 2: Test user registration
  it('should handle user registration', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Initial state
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    
    // Trigger registration
    let registerPromise;
    await act(async () => {
      registerPromise = result.current.register({
        email: 'new@example.com',
        password: 'newpassword',
        firstName: 'New',
        lastName: 'User'
      });
    });
    
    // Wait for the async action to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Check final state after registration
    expect(await registerPromise).toBe(true);
    expect(result.current.error).toBeNull();
  });
}); 