import React, { useState, useContext, createContext, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import * as api from './api';
import { User } from './types';

import LoginModal from './pages/LoginPage';
import MapPage from './pages/MapPage';
import HostProfilePage from './pages/HostProfilePage';
import RequestWaterPage from './pages/RequestWaterPage';
import ChatPage from './pages/ChatPage';
import RateHostPage from './pages/RateHostPage';
import LandingPage from './pages/LandingPage';
import UserProfilePage from './pages/UserProfilePage';
import RequestsPage from './pages/RequestsPage';
import RequestDetailPage from './pages/RequestDetailPage';
import BottomNav from './components/BottomNav';
import MessagesPage from './pages/MessagesPage';
import FollowListPage from './pages/FollowListPage';
import AdminPage from './pages/AdminPage';
import SignUpPage from './pages/SignUpPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import OnboardingPage from './pages/OnboardingPage';
import { SpinnerIcon } from './components/Icons';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme) {
                return storedTheme as Theme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  loginWithEmail: typeof api.loginWithEmail;
  loginWithGoogle: typeof api.loginWithGoogle;
  signUpWithEmail: typeof api.signUpWithEmail;
  logout: typeof api.logout;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  setUserData: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const defaultAvailability = {
  'Monday': { enabled: false, startTime: '09:00', endTime: '17:00' },
  'Tuesday': { enabled: false, startTime: '09:00', endTime: '17:00' },
  'Wednesday': { enabled: false, startTime: '09:00', endTime: '17:00' },
  'Thursday': { enabled: false, startTime: '09:00', endTime: '17:00' },
  'Friday': { enabled: false, startTime: '09:00', endTime: '17:00' },
  'Saturday': { enabled: false, startTime: '10:00', endTime: '14:00' },
  'Sunday': { enabled: false, startTime: '10:00', endTime: '14:00' },
};

const sanitizeUser = (user: User | null): User | null => {
    if (!user) return null;

    // Perform a deep merge for availability to ensure all days and their properties exist
    const mergedAvailability = { ...defaultAvailability };
    if (user.availability && typeof user.availability === 'object') {
        for (const day of Object.keys(mergedAvailability)) {
            const dayData = user.availability[day];
            if (dayData && typeof dayData === 'object') {
                mergedAvailability[day] = { ...mergedAvailability[day], ...dayData };
            }
        }
    }

    const defaultAddress = { street: '', number: '', postalCode: '', city: '', country: '' };
    const defaultMaintenance = { lastFilterChange: '', lastECleaning: '' };

    return {
        ...user,
        followers: user.followers || [],
        following: user.following || [],
        phLevels: user.phLevels || [],
        availability: mergedAvailability,
        phone: user.phone || '',
        address: { ...defaultAddress, ...(user.address || {}) },
        maintenance: { ...defaultMaintenance, ...(user.maintenance || {}) },
    };
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserDataInternal] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  
  const setUserData = useCallback((value: React.SetStateAction<User | null>) => {
      if (typeof value === 'function') {
          setUserDataInternal(prev => sanitizeUser(value(prev)));
      } else {
          setUserDataInternal(sanitizeUser(value));
      }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const dbUser = await api.getUserById(firebaseUser.uid);
        if (dbUser) {
            setUserData(dbUser);
        } else {
            // This case might happen if user is created in Auth but not in Firestore yet (e.g., during signup).
            // The onboarding flow should handle creating the Firestore doc.
            setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUserData]);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

  const value: AuthContextType = {
    user,
    userData,
    isAuthenticated: !!user,
    isLoginModalOpen,
    loginWithEmail: (email, password) => api.loginWithEmail(email, password).then(res => { closeLoginModal(); return res; }),
    loginWithGoogle: () => api.loginWithGoogle().then(res => { closeLoginModal(); return res; }),
    signUpWithEmail: api.signUpWithEmail,
    logout: api.logout,
    openLoginModal,
    closeLoginModal,
    setUserData,
  };
  
   if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950">
        <SpinnerIcon className="w-12 h-12 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, openLoginModal } = useAuth();
    
    useEffect(() => {
        if (!isAuthenticated) {
            openLoginModal();
        }
    }, [isAuthenticated, openLoginModal]);

    if (!isAuthenticated) {
      return <div className="w-full h-screen bg-gray-50 dark:bg-gray-950" />;
    }
    return <>{children}</>;
};

const MainLayout: React.FC = () => (
    <div className="flex flex-col h-screen">
        <main className="flex-1 overflow-y-auto pb-16">
            <Outlet />
        </main>
        <BottomNav />
    </div>
);


const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
        <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/map" />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        
        {/* Onboarding is protected in a sense that it needs a userId, but user is not fully auth'd yet */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/map" element={<MapPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
        </Route>
        
        <Route path="/host/:id" element={<ProtectedRoute><HostProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:userId/:followType" element={<ProtectedRoute><FollowListPage /></ProtectedRoute>} />
        <Route path="/request/:hostId" element={<ProtectedRoute><RequestWaterPage /></ProtectedRoute>} />
        <Route path="/request-detail/:requestId" element={<ProtectedRoute><RequestDetailPage /></ProtectedRoute>} />
        <Route path="/chat/:requestId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/rate/:requestId" element={<ProtectedRoute><RateHostPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        
        <Route path="/*" element={<Navigate to={isAuthenticated ? "/map" : "/"} replace />} />
      </Routes>
  );
};

const AppContent = () => {
    const { isLoginModalOpen, closeLoginModal } = useAuth();
    return (
        <HashRouter>
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-2xl shadow-gray-300/20 dark:shadow-black/20">
                <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
                <AppRoutes />
            </div>
        </HashRouter>
    );
};

export default function App() {
  return (
    <ThemeProvider>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </ThemeProvider>
  );
}