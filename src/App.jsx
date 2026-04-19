import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import { auth } from './api/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import AuthForm from './components/AuthForm';
import { Loader2 } from 'lucide-react';
import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';
import LandingPage from './pages/LandingPage';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-stone-200 animate-spin" strokeWidth={1.5} />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, authInitialized } = useStore();
  const location = useLocation();
  
  if (!authInitialized) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { user, authInitialized } = useStore();
  
  if (!authInitialized) {
    return <LoadingScreen />;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { initAuth, login, register, resetPassword, setError, isSyncing, errorMsg, setUser, fetchExpenses, user, authInitialized } = useStore();
  const unsubscribeRef = useRef(null);
  const isFirstMount = useRef(true);

  const [authMode, setAuthMode] = useState('login');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleModeChange = useCallback((mode) => {
    setAuthMode(mode);
    setError(null);
  }, [setError]);

  const validateInput = useCallback((email, password, requirePassword = false) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (requirePassword && (!password || password.length < 6)) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  }, [setError]);

  useEffect(() => {
    if (!isFirstMount.current) return;
    isFirstMount.current = false;

    const init = async () => {
      await initAuth();
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      unsubscribeRef.current = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          fetchExpenses(currentUser.uid);
        } else {
          setUser(null);
        }
      });
    };
    
    init();
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [initAuth, setUser, fetchExpenses]);

  useEffect(() => {
    if (!authInitialized) return;
    
    const currentPath = location.pathname;
    
    if (user && currentPath === '/login') {
      navigate('/', { replace: true });
    } else if (!user && currentPath !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [user, authInitialized, navigate, location.pathname]);

  const handleAuthSubmit = useCallback(async (e, formData) => {
    if (!formData) {
      setError("Form data missing");
      return;
    }
    
    const { email, password } = formData;
    setError(null);
    
    const requirePassword = authMode !== 'reset';
    if (!validateInput(email, password, requirePassword)) {
      return;
    }
    
    if (authMode === 'reset') {
      await resetPassword(email);
      return;
    }
    
    if (authMode === 'login') {
      await login(email, password);
    } else {
      setIsTransitioning(true);
      try {
        await register(email, password);
        await login(email, password);
      } finally {
        setIsTransitioning(false);
      }
    }
  }, [authMode, validateInput, login, register, resetPassword, setError]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      // Clear all local state
      localStorage.removeItem('rememberedEmail');
      // Force a page reload to clear all state
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [setUser, navigate]);

  const isLoading = isTransitioning || isSyncing;

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          !authInitialized ? (
            <LoadingScreen />
          ) : user ? (
            <HomePage onLogout={handleLogout} />
          ) : (
            <LandingPage onGetStarted={() => navigate('/login')} />
          )
        }
      />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <AuthForm 
              authMode={authMode}
              setAuthMode={handleModeChange}
              isSyncing={isLoading}
              errorMsg={errorMsg}
              onSubmit={handleAuthSubmit}
              setError={setError}
            />
          </PublicRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <AnalyticsPage onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}