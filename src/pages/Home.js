import React, { useEffect, useContext } from 'react';
import { 
  Box, 
  Container,
  Paper,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ThemeContext } from '../context/ThemeContext';
import RankingGoals from '../components/RankingGoals';
import AnalyticalStopwatch from '../components/AnalyticalStopwatch';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNotifications } from '../context/NotificationContext';

const Home = () => {
  const [user] = useAuthState(auth);
  const { addNotification } = useNotifications() || { addNotification: () => {} };
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  
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

  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        width: '100%',
        minHeight: '100vh',
        pt: { xs: 2, sm: 3, md: 4 },
        pb: { xs: 4, sm: 5, md: 6 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'var(--background-color)',
      }}
    >
      {/* Tema Değiştirme Butonu */}
      <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
        <Tooltip title={darkMode ? "Aydınlık Moda Geç" : "Koyu Moda Geç"}>
          <IconButton 
            onClick={toggleTheme} 
            sx={{ 
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', 
              color: darkMode ? '#fff' : '#333',
              '&:hover': {
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
              },
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              width: 48,
              height: 48
            }}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Container 
        maxWidth={false}
        sx={{ 
          width: '100%',
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: { xs: '100%', lg: '90%', xl: '1800px' }
        }}
      >
        {/* Sıralama Hedeflerim Section */}
        <Paper 
          elevation={0} 
          className="home-card card-hover"
          sx={{ 
            borderRadius: '16px', 
            overflow: 'hidden',
            mb: { xs: 4, sm: 5, md: 6 },
            background: 'var(--background-color)',
            boxShadow: '0 8px 32px rgba(77, 77, 0, 0.08), 0 2px 8px rgba(77, 77, 0, 0.05)',
            position: 'relative',
            minHeight: 220,
            width: '100%',
            mx: 'auto',
            transform: 'translateZ(0)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(77, 77, 0, 0.12), 0 3px 12px rgba(77, 77, 0, 0.08)',
              transform: 'translateY(-2px) translateZ(0)'
            }
          }}
        >
          <Box 
            sx={{ 
              p: { xs: 3, sm: 4, md: 5 },
              bgcolor: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              className="heading-font"
              sx={{ 
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                color: '#2e3856',
                mb: 2,
                fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.2rem' },
                textShadow: '0 2px 8px rgba(255, 255, 255, 0.5)',
                letterSpacing: 1,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  width: '80px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #4285F4, #0F9D58)',
                  transform: 'translateX(-50%)'
                }
              }}
            >
              🎯 Sıralama Hedeflerim
            </Typography>
            <Typography 
              variant="body1"
              sx={{ 
                color: '#2a5956', 
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, 
                mb: 3, 
                fontWeight: 500, 
                textAlign: 'center',
                maxWidth: '800px'
              }}
            >
              Hedeflediğin sıralamaları kaydet, motivasyonunu artır!
            </Typography>
            <RankingGoals />
          </Box>
        </Paper>

        {/* Analitik Kronometre Section */}
        <Paper 
          elevation={0} 
          className="home-card card-hover"
          sx={{ 
            borderRadius: '16px', 
            overflow: 'hidden',
            mb: { xs: 4, sm: 5, md: 6 },
            background: 'var(--background-color)',
            boxShadow: '0 8px 32px rgba(77, 77, 0, 0.08), 0 2px 8px rgba(77, 77, 0, 0.05)',
            position: 'relative',
            minHeight: 220,
            width: '100%',
            mx: 'auto',
            transform: 'translateZ(0)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(77, 77, 0, 0.12), 0 3px 12px rgba(77, 77, 0, 0.08)',
              transform: 'translateY(-2px) translateZ(0)'
            }
          }}
        >
          <Box 
            sx={{ 
              p: { xs: 3, sm: 4, md: 5 },
              bgcolor: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200
            }}
          >
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              className="heading-font"
              sx={{ 
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                color: '#2e3856',
                mb: 2,
                fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.2rem' },
                textShadow: '0 2px 8px rgba(255, 255, 255, 0.5)',
                letterSpacing: 1,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  width: '80px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #43C6AC, #F8FFAE)',
                  transform: 'translateX(-50%)'
                }
              }}
            >
              Analitik Kronometre: Detaylı Çalışma Takibi
            </Typography>
            
            <Typography 
              variant="body1" 
              className="body-font"
              paragraph
              sx={{ 
                fontFamily: 'Poppins, Montserrat, sans-serif',
                color: '#2a5956',
                mb: 4,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                maxWidth: '800px',
                lineHeight: 1.6,
                textAlign: 'center'
              }}
            >
              Analitik kronometre ile ders ve konu bazlı çalışmalarınızı kaydedin. 
              İlerlemenizi takip edin ve her derste ne kadar zaman harcadığınızı görün.
            </Typography>
            
            <Box sx={{ 
              width: '100%', 
              mx: 'auto', 
              maxWidth: '100%'
            }}>
              <AnalyticalStopwatch />
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
