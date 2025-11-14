// src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ToastContainer } from 'react-toastify';
import Home from './components/homeSection/Home';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LoginPage from './pages/auth/LoginPage';
//import SignupPage from './pages/auth/SignUp';
import NotFoundPage from './pages/NotFoundPage';
import './i18n';

function AppContent() {
  const { isAuthenticated, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect after login/logout if needed
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && window.location.pathname === '/login') {
        if (userRole === 'PORTAL_ADMIN') navigate('/admin/dashboard');
        else if (userRole === 'EDITOR' || userRole === 'PUBLISHER') navigate('/cms/dashboard');
        else navigate('/');
      } else if (!isAuthenticated && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/cms'))) {
        navigate('/login');
      }
    }
  }, [isAuthenticated, userRole, authLoading, navigate]);

  if (authLoading) {
    return <LoadingSpinner />;
  }
  // const showSidebar = isAuthenticated && (userRole === 'PORTAL_ADMIN' || userRole === 'EDITOR' || userRole === 'PUBLISHER');
  console.log("App rendered");

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/error" element={<NotFoundPage />} />

           {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/Signup" element={<SignupPage />} /> */}
        </Route>
      </Routes>
    </div>
  );
}

// Wrap AppContent with AuthProvider
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <ToastContainer position="top-right" autoClose={5000} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;