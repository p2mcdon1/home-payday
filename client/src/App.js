import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdultDashboard from './components/AdultDashboard';
import KidDashboard from './components/KidDashboard';
import { getAuthToken, setAuthToken, removeAuthToken, getCurrentUser, setCurrentUser } from './utils/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setAuthToken(token);
    setCurrentUser(userData);
    setUser(userData);
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    // Clear login form data from sessionStorage
    sessionStorage.removeItem('loginUsername');
    sessionStorage.removeItem('loginError');
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === 'adult' ? '/adult' : '/kid'} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/adult/*"
          element={
            user && user.role === 'adult' ? (
              <AdultDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/kid/*"
          element={
            user ? (
              <KidDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to={user ? (user.role === 'adult' ? '/adult' : '/kid') : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
