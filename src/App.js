import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import PomodoroPage from './pages/PomodoroPage';
import TytAytNetTakibi from './pages/TytAytNetTakibi';
import YapayZeka from './pages/YapayZeka';
import DersProgrami from './pages/DersProgrami';
import Analiz from './pages/Analiz';
import BugunCozduklerin from './pages/BugunCozduklerin';
import NotDefterim from './pages/NotDefterim';
import Profile from './pages/Profile';
import Login from './pages/Login';

// Theme
import theme from './theme';

// Styles
import './styles/global.css';

const App = () => {
  const [user, loading] = useAuthState(auth);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {user ? (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
          <Sidebar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3 },
              width: { sm: `calc(100% - ${240}px)` },
              overflow: 'auto',
            }}
          >
            <Header />
            <Box sx={{ mt: 2 }}>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/pomodoro" element={<ProtectedRoute><PomodoroPage /></ProtectedRoute>} />
                <Route path="/tyt-ayt-net-takibi" element={<ProtectedRoute><TytAytNetTakibi /></ProtectedRoute>} />
                <Route path="/yapay-zeka" element={<ProtectedRoute><YapayZeka /></ProtectedRoute>} />
                <Route path="/performans" element={<ProtectedRoute><DersProgrami /></ProtectedRoute>} />
                <Route path="/analiz" element={<ProtectedRoute><Analiz /></ProtectedRoute>} />
                <Route path="/bugun-cozduklerin" element={<ProtectedRoute><BugunCozduklerin /></ProtectedRoute>} />
                <Route path="/not-defterim" element={<ProtectedRoute><NotDefterim /></ProtectedRoute>} />
                <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </ThemeProvider>
  );
};

export default App;
