


import React, { useState, useContext, createContext, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  login: (email: string) => void;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const login = useCallback((email: string) => {
    if (email) {
        setIsAuthenticated(true);
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);


  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoginModalOpen, openLoginModal, closeLoginModal }}>
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
      // Render a blank page while the modal is active
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
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Protected Routes */}
        <Route path="/map" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<MapPage />} />
        </Route>
         <Route path="/requests" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<RequestsPage />} />
        </Route>
         <Route path="/messages" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<MessagesPage />} />
        </Route>
         <Route path="/profile" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<UserProfilePage />} />
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

export default function App() {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <ThemeProvider>
        <AuthProvider>
            <HashRouter>
                 <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-2xl shadow-gray-300/20 dark:shadow-black/20">
                    <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
                    <AppRoutes />
                 </div>
            </HashRouter>
        </AuthProvider>
    </ThemeProvider>
  );
}