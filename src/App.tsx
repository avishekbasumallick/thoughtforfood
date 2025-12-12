import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { UpdatePassword } from './pages/UpdatePassword';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import WeeklyProgress from './pages/WeeklyProgress';
import MealHistoryPage from './pages/MealHistoryPage';

function AuthenticatedAppContent() {
  const { user, loading, lastAuthEvent, setLastAuthEvent, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 1. Handle PASSWORD_RECOVERY event: Force redirect to /update-password
  useEffect(() => {
    if (lastAuthEvent === 'PASSWORD_RECOVERY') {
      navigate('/update-password');
      setLastAuthEvent(null); // Clear the event after handling
    }
  }, [lastAuthEvent, navigate, setLastAuthEvent]);

  // 2. Handle general authenticated user redirects, but avoid during password recovery
  useEffect(() => {
    // If a session exists, and we are not in a password recovery flow (indicated by hash)
    // and the user is currently on an unauthenticated route (like /login, /signup, /forgot-password)
    // then redirect to the dashboard.
    const isRecoveryHash = location.hash.includes('type=recovery');
    const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname);

    if (!loading && user && session && !isRecoveryHash && isAuthPage) {
      navigate('/');
    }
  }, [loading, user, session, navigate, location.hash, location.pathname]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, show login/signup/forgot password
  if (!user) {
    return (
      <Routes>
        <Route path="/signup" element={<Signup onToggleMode={() => navigate('/login')} />} />
        <Route path="/forgot-password" element={<ForgotPassword onToggleMode={() => navigate('/login')} />} />
        {/* The /update-password route is now handled in the authenticated section */}
        <Route path="*" element={<Login onToggleMode={(mode) => navigate(`/${mode}`)} />} />
      </Routes>
    );
  }

  // If user is authenticated (including via recovery token), show app content
  return (
    <>
      <Navigation onDataUpdate={handleDataUpdate} />
      <Routes>
        <Route path="/" element={<Dashboard key={refreshKey} onDataUpdate={handleDataUpdate} />} />
        <Route path="/weekly" element={<WeeklyProgress key={refreshKey} />} />
        <Route path="/history" element={<MealHistoryPage key={refreshKey} onMealDeleted={handleDataUpdate} />} />
        {/* This is where the UpdatePassword route should be for authenticated users */}
        <Route path="/update-password" element={<UpdatePassword onPasswordUpdated={() => navigate('/')} />} />
        {/* Catch-all for authenticated users. */}
        <Route path="*" element={<Dashboard key={refreshKey} onDataUpdate={handleDataUpdate} />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedAppContent />
    </AuthProvider>
  );
}

export default App;