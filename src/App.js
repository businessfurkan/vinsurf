import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { NotificationProvider } from './context/NotificationContext';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import PomodoroPage from './pages/PomodoroPage';
import TytAytNetTakibi from './pages/TytAytNetTakibi';
import DersProgrami from './pages/DersProgrami';
import Analiz from './pages/Analiz';
import NotDefterim from './pages/NotDefterim';
import KonuTakip from './pages/KonuTakip';
import SoruForum from './pages/SoruForum';
import SoruForumDetail from './pages/SoruForumDetail';
import BenimleCalis from './pages/BenimleCalis';
import RekaNET from './pages/RekaNET';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import CheckAdminStatus from './pages/CheckAdminStatus';

// Theme
import theme from './theme';

// Styles
import './styles/global.css';

const App = () => {
  const [user, loading] = useAuthState(auth);
  
  // Kullanıcı giriş takibi
  React.useEffect(() => {
    const trackUserLogin = async () => {
      if (!user) return;
      
      try {
        // Kullanıcı profil dökümanına referans
        const userRef = doc(db, 'userProfiles', user.uid);
        
        // Kullanıcı profil dökümanını al
        const userDoc = await getDoc(userRef);
        
        // Şimdiki zaman
        const now = new Date();
        
        if (userDoc.exists()) {
          // Kullanıcı profili varsa güncelle
          const userData = userDoc.data();
          const lastLogin = userData.lastLogin?.toDate ? userData.lastLogin.toDate() : new Date(userData.lastLogin?.seconds * 1000 || 0);
          
          // Son giriş ve şimdiki zaman arasındaki fark (gün olarak)
          const daysSinceLastLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
          
          // Kullanıcı profilini güncelle
          await updateDoc(userRef, {
            lastLogin: serverTimestamp(),
            previousLogin: userData.lastLogin || serverTimestamp(),
            daysSinceLastLogin: daysSinceLastLogin,
            displayName: user.displayName || userData.displayName || user.email?.split('@')[0] || 'Kullanıcı'
          });
        } else {
          // Kullanıcı profili yoksa oluştur
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
            photoURL: user.photoURL || '',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            previousLogin: serverTimestamp(),
            daysSinceLastLogin: 0,
            targetRank: 150000 // Varsayılan hedef sıralama
          });
        }
      } catch (error) {
        console.error('Kullanıcı giriş takibi sırasında hata:', error);
      }
    };
    
    if (user && !loading) {
      trackUserLogin();
    }
  }, [user, loading]);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    
    if (loading) return <div>Loading...</div>;
    
    if (!user) {
      // React Router v7 için startTransition kullanımı
      React.startTransition(() => {
        navigate('/login', { replace: true });
      });
      return null;
    }
    
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
      {user ? (
        <Box sx={{ display: 'flex', bgcolor: '#FFFFF0', minHeight: '100vh' }}>
          <Sidebar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3 },
              width: { sm: `calc(100% - ${240}px)` },
              overflow: 'auto',
              bgcolor: '#FFFFF0',
            }}
          >
            <Header />
            <Box sx={{ mt: 2 }}>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/pomodoro" element={<ProtectedRoute><PomodoroPage /></ProtectedRoute>} />
                <Route path="/tyt-ayt-net-takibi" element={<ProtectedRoute><TytAytNetTakibi /></ProtectedRoute>} />
                <Route path="/performans" element={<ProtectedRoute><DersProgrami /></ProtectedRoute>} />
                <Route path="/analiz" element={<ProtectedRoute><Analiz /></ProtectedRoute>} />
                <Route path="/not-defterim" element={<ProtectedRoute><NotDefterim /></ProtectedRoute>} />
                <Route path="/konu-takip" element={<ProtectedRoute><KonuTakip /></ProtectedRoute>} />
                <Route path="/soru-forum" element={<ProtectedRoute><SoruForum /></ProtectedRoute>} />
                <Route path="/soru-forum/:postId" element={<ProtectedRoute><SoruForumDetail /></ProtectedRoute>} />
                <Route path="/benimle-calis" element={<ProtectedRoute><BenimleCalis /></ProtectedRoute>} />
                <Route path="/rekanet" element={<ProtectedRoute><RekaNET /></ProtectedRoute>} />
                <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin-panel" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                <Route path="/check-admin" element={<ProtectedRoute><CheckAdminStatus /></ProtectedRoute>} />
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
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
