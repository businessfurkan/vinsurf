import React, { useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ThemeContext } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

// Components
import AnalyticalStopwatch from '../components/AnalyticalStopwatch';

// Modern icons
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';

const Home = () => {
  const [user] = useAuthState(auth);
  const { addNotification } = useNotifications() || { addNotification: () => {} };
  
  // Kullanıcı 3 gün veya daha uzun süre giriş yapmadıysa bildirim gönder
  useEffect(() => {
    const checkInactivity = async () => {
      if (!user) return;
      
      try {
        // Kullanıcı profil dökümanına referans
        const userRef = doc(db, 'userProfiles', user.uid);
        
        // Kullanıcı profil dökümanını al
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const daysSinceLastLogin = userData.daysSinceLastLogin || 0;
          const displayName = userData.displayName || user.displayName || user.email?.split('@')[0] || 'Kullanıcı';
          const targetRank = userData.targetRank || 150000;
          
          // 3 gün veya daha uzun süre giriş yapılmadıysa bildirim gönder
          if (daysSinceLastLogin >= 3) {
            const message = `${displayName}, seni ${daysSinceLastLogin} gündür görmüyoruz. Hedefin hâlâ ${targetRank.toLocaleString()} sıralamaya girmek mi yoksa?`;
            
            // Bildirim gönder
            if (addNotification) {
              addNotification(message, 'warning', {
                type: 'inactivity',
                daysSinceLastLogin,
                targetRank
              });
            }
          }
        }
      } catch (error) {
        console.error('Kullanıcı inaktivite kontrolü sırasında hata:', error);
      }
    };
    
    if (user) {
      checkInactivity();
    }
  }, [user, addNotification]);

  const { darkMode } = useContext(ThemeContext);
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down('md')); // Kullanılmıyor ama ileride kullanılabilir

  useEffect(() => {
    // Component mounted
    // Any initialization can go here
  }, []);

  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        width: '100%',
        minHeight: '100vh',
        pt: { xs: 1, sm: 2, md: 3 },
        pb: { xs: 4, sm: 5, md: 6 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'var(--background-color)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: darkMode ? 
            'radial-gradient(circle at 10% 20%, rgba(21, 37, 79, 0.2) 0%, rgba(21, 37, 79, 0.01) 80%)' : 
            'radial-gradient(circle at 10% 20%, rgba(92, 179, 217, 0.1) 0%, rgba(92, 179, 217, 0.01) 80%)',
          zIndex: 0
        }
      }}
    >
      <Container 
        maxWidth={false}
        sx={{ 
          width: '100%',
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: { xs: '100%', lg: '90%', xl: '1800px' },
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Boş alan - Sıralama Hedefleri kaldırıldı */}
        <Box sx={{ mb: 4 }}>
          {/* Boş alan */}
        </Box>

        {/* Analizli Kronometre Section */}
        <Box sx={{ mt: 5, mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            className="heading-font"
            sx={{ 
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: darkMode ? '#ffffff' : '#2e3856',
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <TimerOutlinedIcon sx={{ color: '#55b3d9' }} />
            Analizli Kronometre
          </Typography>
          
          <Typography 
            variant="body1"
            sx={{ 
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#5f6368',
              mb: 3,
              fontSize: '1rem',
              maxWidth: '800px'
            }}
          >
            Analizli kronometre ile ders ve konu bazlı çalışmalarınızı kaydedin. İlerlemenizi takip edin ve her derste ne kadar zaman harcadığınızı görün.
          </Typography>
          
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: '16px', 
              overflow: 'hidden',
              background: 'var(--card-bg-color, rgba(255, 255, 255, 0.85))',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(85, 179, 217, 0.15)',
              }
            }}
          >
            <Box sx={{
              height: '4px',
              width: '100%',
              background: 'linear-gradient(90deg, #55b3d9, #abe7ff)',
            }} />
            
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <AnalyticalStopwatch />
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
