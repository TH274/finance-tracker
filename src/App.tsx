import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store/store';
import { setTheme } from './store/slices/themeSlice';
import { fetchUserProfile } from './store/slices/authSlice';

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

import { Dashboard, Budget, Settings, Login, Register, NotFound, Transactions } from './pages/index';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    dispatch(setTheme(mode));
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      dispatch(setTheme(e.matches ? 'dark' : 'light'));
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [dispatch, mode]);
  
  useEffect(() => {
    if (isAuthenticated && !user) {
      console.log('App: Authenticated but no user data, fetching profile');
      dispatch(fetchUserProfile() as any);
    }
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    console.log('App: Current auth state:', { isAuthenticated, user });
  }, [isAuthenticated, user]);
  
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        
        {/* Protected App Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/transactions" element={
          <ProtectedRoute>
            <MainLayout>
              <Transactions />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/budget" element={
          <ProtectedRoute>
            <MainLayout>
              <Budget />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
