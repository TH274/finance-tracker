import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import { apiBaseUrl } from '../../config';
import { User, AuthState, LoginCredentials, RegisterData } from '../../utils/users';
import { loginUser as apiLoginUser, registerUser as apiRegisterUser } from '../../api/axios/api';

const getStoredUser = (): User | null => {
  try {
    const userString = localStorage.getItem('user');
    if (!userString) return null;
    return JSON.parse(userString);
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

const initialState: AuthState = {
  user: getStoredUser(), 
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', credentials.email);
      
      // Use the API client function instead of direct fetch
      const data = await apiLoginUser(credentials.email, credentials.password);
      console.log('Login success:', data);
      
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Login thunk error:', error);
      return rejectWithValue((error instanceof Error) ? error.message : 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      // Use the API client function instead of direct fetch
      const data = await apiRegisterUser(
        userData.email, 
        userData.password, 
        `${userData.firstName} ${userData.lastName}`.trim()
      );
      
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;
      const userId = state.auth.user?.id;

      if (!token || !userId) {
        throw new Error('No token or user ID available');
      }

      // For json-server, directly query the user by ID
      const response = await fetch(`${apiBaseUrl}/users/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        console.log('Auth login pending');
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        console.log('Auth login fulfilled:', action.payload.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        console.log('Auth login rejected:', action.payload);
      })

      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        if (action.payload === 'No token available' || action.payload === 'Failed to fetch user profile') {
          localStorage.removeItem('token');
          state.token = null;
          state.isAuthenticated = false;
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer; 