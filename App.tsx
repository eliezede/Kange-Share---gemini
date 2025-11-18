import React, { useState, useContext, createContext, useCallback, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import * as api from './api';
import { User, Notification } from './types';

import LoginModal from './pages/LoginPage';
import MapPage from './pages/MapPage';
import HostProfilePage from './pages/HostProfilePage';
import RequestWaterPage from './pages/RequestWaterPage';
import ChatPage from './pages/ChatPage';
import RateHostPage from './pages/RateHostPage';
import LandingPage from './pages/LandingPage';
import UserProfilePage from './pages/UserProfilePage';
import UserDashboardPage from './pages/UserDashboardPage';
import RequestsPage from './pages/RequestsPage';
import RequestDetailPage from './pages/RequestDetailPage';
import BottomNav from './components/BottomNav';
import MessagesPage from './pages/MessagesPage';
import FollowListPage from './pages/FollowListPage';
import AdminPage from './pages/AdminPage';
import SignUpPage from './pages/SignUpPage';
import OnboardingPage from './pages/OnboardingPage';
import { SpinnerIcon } from './components/Icons';
import Header from './components/Header';
import { ToastProvider } from './hooks/useToast';
import { ToastContainer } from './components/Toast';
import SettingsPage from './pages/SettingsPage';
import AdminHostVerificationsPage from './pages/AdminHostVerificationsPage';

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
  notifications: Notification[];
  unreadCount: number;
  pendingHostRequestCount: number;
  unreadMessagesCount: number;
  loading: boolean;
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingHostRequestCount, setPendingHostRequestCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
          if (firebaseUser) {
            setUser(firebaseUser);
            let dbUser = await api.getUserById(firebaseUser.uid);
            if (!dbUser) {
              // New user (e.g., via Google Sign-In for the first time)
              const nameParts = (firebaseUser.displayName || 'New User').split(' ');
              await api.createInitialUser(
                  firebaseUser.uid,
                  firebaseUser.email || '',
                  nameParts[0] || '',
                  nameParts.slice(1).join(' ') || '',
                  firebaseUser.displayName || 'New User',
                  firebaseUser.photoURL || ''
              );
              dbUser = await api.getUserById(firebaseUser.uid);
            }
            setUserData(dbUser);
          } else {
            setUser(null);
            setUserData(null);
          }
      } catch (error) {
          console.error("Error fetching user data:", error);
          // Ensure loading is false even on error
      } finally {
          setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let notifUnsubscribe: (() => void) | null = null;
    let requestsUnsubscribe: (() => void) | null = null;
    
    if (user) {
        notifUnsubscribe = api.getNotificationsStream(user.uid, setNotifications);
        if (userData?.isHost) {
          requestsUnsubscribe = api.getPendingHostRequestsStream(user.uid, setPendingHostRequestCount);
        } else {
          setPendingHostRequestCount(0);
        }
    } else {
        setNotifications([]);
        setPendingHostRequestCount(0);
    }
    
    return () => {
      if (notifUnsubscribe) notifUnsubscribe();
      if (requestsUnsubscribe) requestsUnsubscribe();
    };
  }, [user, userData?.isHost]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const unreadMessagesCount = useMemo(() => notifications.filter(n => n.type === 'new_message' && !n.read).length, [notifications]);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

  const value: AuthContextType = {
    user,
    userData,
    isAuthenticated: !!user,
    isLoginModalOpen,
    loading,
    loginWithEmail: (email, password) => api.loginWithEmail(email, password).then(res => { closeLoginModal(); return res; }),
    loginWithGoogle: () => api.loginWithGoogle().then(res => { closeLoginModal(); return res; }),
    signUpWithEmail: api.signUpWithEmail,
    logout: api.logout,
    openLoginModal,
    closeLoginModal,
    setUserData,
    notifications,
    unreadCount,
    pendingHostRequestCount,
    unreadMessagesCount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const MainLayout: React.FC = () => (
    <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">
             <div className="pb-28">
                <Outlet />
            </div>
        </main>
        <BottomNav />
    </div>
);


const AppRoutes = () => {
    const { isAuthenticated, userData, loading, openLoginModal } = useAuth();
    const location = useLocation();

    useEffect(() => {
        // If user is not authenticated and tries to access a protected page, open login modal.
        // This handles deep links.
        if (!loading && !isAuthenticated && location.pathname !== '/' && location.pathname !== '/signup') {
            openLoginModal();
        }
    }, [isAuthenticated, loading, location.pathname, openLoginModal]);

    if (loading) {
        return (
            <div className="w-full h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950">
                <SpinnerIcon className="w-12 h-12 text-brand-blue animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/" element={<LandingPage />} />
                <Route path="/*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }
    
    // User is authenticated
    if (userData && !userData.onboardingCompleted) {
        return (
             <Routes>
                <Route path="/onboarding/:step" element={<OnboardingPage />} />
                <Route path="/*" element={<Navigate to={`/onboarding/${userData.onboardingStep || 'welcome'}`} replace />} />
            </Routes>
        );
    }

    // User is authenticated and onboarding is complete
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/map" element={<MapPage />} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/profile" element={<UserDashboardPage />} />
                <Route path="/profile/edit" element={<UserProfilePage />} />
                <Route path="/host/:id" element={<HostProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile/:userId/:followType" element={<FollowListPage />} />
                <Route path="/request/:hostId" element={<RequestWaterPage />} />
                <Route path="/request-detail/:requestId" element={<RequestDetailPage />} />
                <Route path="/chat/:requestId" element={<ChatPage />} />
                <Route path="/rate/:requestId" element={<RateHostPage />} />
                {userData?.isAdmin && (
                    <>
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/admin/distributor-verifications" element={<AdminHostVerificationsPage />} />
                    </>
                )}
            </Route>
            <Route path="/*" element={<Navigate to="/map" replace />} />
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
                <ToastContainer />
            </div>
        </HashRouter>
    );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}