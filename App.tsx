
import React, { useState, useContext, createContext, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';
import HostProfilePage from './pages/HostProfilePage';
import RequestWaterPage from './pages/RequestWaterPage';
import ChatPage from './pages/ChatPage';
import RateHostPage from './pages/RateHostPage';
import LandingPage from './pages/LandingPage';
import UserProfilePage from './pages/UserProfilePage';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
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

  const login = useCallback((email: string) => {
    if (email) {
        setIsAuthenticated(true);
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const AppWithContainer = () => (
  <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-2xl shadow-gray-300/20">
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
      <Route path="/host/:id" element={<ProtectedRoute><HostProfilePage /></ProtectedRoute>} />
      <Route path="/request/:id" element={<ProtectedRoute><RequestWaterPage /></ProtectedRoute>} />
      <Route path="/chat/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/rate/:id" element={<ProtectedRoute><RateHostPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
      <Route path="/*" element={<Navigate to="/login" replace />} />
    </Routes>
  </div>
);

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