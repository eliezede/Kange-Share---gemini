

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
      return <div className="w-full h-screen bg-gray-50" />;
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


const AppWithContainer = () => {
  const { isLoginModalOpen, closeLoginModal } = useAuth();
  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-2xl shadow-gray-300/20">
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <Routes>
        {/* Routes with Bottom Nav */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/map" element={<MapPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
        </Route>
        
        {/* Routes without Bottom Nav */}
        <Route path="/host/:id" element={<ProtectedRoute><HostProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:userId/:followType" element={<ProtectedRoute><FollowListPage /></ProtectedRoute>} />
        <Route path="/request/:hostId" element={<ProtectedRoute><RequestWaterPage /></ProtectedRoute>} />
        <Route path="/request-detail/:requestId" element={<ProtectedRoute><RequestDetailPage /></ProtectedRoute>} />
        <Route path="/chat/:requestId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/rate/:requestId" element={<ProtectedRoute><RateHostPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/*" element={<AppWithContainer />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}