import React, { useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Theme
import theme from './theme';

// Styles
import './styles/global.css';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Analytics from './pages/Analytics';
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



const App = () => {
  const [user, loading] = useAuthState(auth);
  
  // Mobil cihaz uyarısı için state
  const [mobileWarningOpen, setMobileWarningOpen] = useState(false);
  
  // Mobil cihaz kontrolü için media query
  const isMobile = useMediaQuery('(max-width:767px)');
  
  // Mobil cihaz uyarısını göster
  useEffect(() => {
    // LocalStorage'dan daha önce uyarının gösterilip gösterilmediğini kontrol et
    const hasShownMobileWarning = localStorage.getItem('hasShownMobileWarning');
    
    // Eğer mobil cihazsa ve daha önce uyarı gösterilmediyse uyarıyı göster
    if (isMobile && !hasShownMobileWarning) {
      setMobileWarningOpen(true);
    }
  }, [isMobile]);
  
  // Mobil uyarı diyaloğunu kapat
  const handleCloseMobileWarning = () => {
    setMobileWarningOpen(false);
    // Uyarının gösterildiğini localStorage'a kaydet
    localStorage.setItem('hasShownMobileWarning', 'true');
  };
  
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

  // Sidebar açık/kapalı durumunu yönetmek için state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sidebar'ı açıp kapatmak için fonksiyon
  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
        {/* Mobil cihaz uyarı diyaloğu */}
        <Dialog
          open={mobileWarningOpen}
          onClose={handleCloseMobileWarning}
          aria-labelledby="mobile-warning-dialog-title"
          aria-describedby="mobile-warning-dialog-description"
          sx={{
            '& .MuiDialog-paper': {
              width: '90%',
              maxWidth: '500px',
              borderRadius: '12px',
              padding: '10px',
              backgroundColor: '#f8f9fa'
            }
          }}
        >
          <DialogTitle 
            id="mobile-warning-dialog-title"
            sx={{ 
              textAlign: 'center', 
              fontWeight: 'bold',
              color: '#e74c3c',
              fontSize: '1.2rem'
            }}
          >
            Uyarı
          </DialogTitle>
          <DialogContent>
            <DialogContentText 
              id="mobile-warning-dialog-description"
              sx={{ 
                textAlign: 'center',
                color: '#2c3e50',
                fontSize: '1rem'
              }}
            >
              Panelimiz Masaüstü - Laptop ve Tabletlerde çalışmaktadır lütfen bu cihazlardan biri ile sitemize giriş yapınız.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button 
              onClick={handleCloseMobileWarning} 
              variant="contained"
              sx={{ 
                backgroundColor: '#3498db',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#2980b9'
                },
                borderRadius: '8px',
                padding: '8px 24px'
              }}
            >
              Tamam
            </Button>
          </DialogActions>
        </Dialog>
      {user ? (
        <Box sx={{ display: 'flex', bgcolor: '#1b293d', minHeight: '100vh', position: 'relative' }}>
          <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3 },
              overflow: 'auto',
              bgcolor: '#1b293d',
              transition: theme => theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              marginLeft: '80px',
              width: 'calc(100% - 80px)',
            }}
          >
            <Header handleDrawerToggle={handleDrawerToggle} sidebarOpen={sidebarOpen} />
            <Box sx={{ mt: 2 }}>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/tyt-ayt-net-takibi" element={<ProtectedRoute><TytAytNetTakibi /></ProtectedRoute>} />
                <Route path="/performans" element={<ProtectedRoute><DersProgrami /></ProtectedRoute>} />
                <Route path="/analiz" element={<ProtectedRoute><Analiz /></ProtectedRoute>} />
                <Route path="/not-defterim" element={<ProtectedRoute><NotDefterim /></ProtectedRoute>} />
                <Route path="/konu-takip" element={<ProtectedRoute><KonuTakip /></ProtectedRoute>} />
                <Route path="/soru-forum" element={<ProtectedRoute><SoruForum /></ProtectedRoute>} />
                <Route path="/soru-forum/:postId" element={<ProtectedRoute><SoruForumDetail /></ProtectedRoute>} />
                <Route path="/benimle-calis" element={
                  <ProtectedRoute>
                    <Box sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '80px', // Sidebar genişliği
                        height: '100%',
                        backgroundColor: '#1b293d',
                        zIndex: 1,
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 'calc((100% - 1200px) / 2)', // Sağ kenar boşluğu
                        height: '100%',
                        backgroundColor: '#1b293d',
                        zIndex: 1,
                        '@media (max-width: 1200px)': {
                          width: '0px',
                        },
                      },
                    }}>

                      <BenimleCalis />
                    </Box>
                  </ProtectedRoute>
                } />
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
      </AuthProvider>
    </MuiThemeProvider>
  </ThemeProvider>
  );
};

export default App;
