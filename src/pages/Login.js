import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  CircularProgress,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import GoogleIcon from '@mui/icons-material/Google';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

// Styled components
const LoginContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'var(--background-color, #f5f7ff)',
  flexDirection: 'row', // Yatay düzen
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column', // Mobil cihazlarda dikey düzen
  },
}));

// Arka plan için animasyonlu gradient
const AnimatedBackground = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundSize: '400% 400%',
  animation: 'gradient 15s ease infinite',
  opacity: 0.8,
  zIndex: -1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--overlay-color, rgba(255, 255, 255, 0.85))',
    backdropFilter: 'blur(4px)',
    zIndex: -1,
  },
  '@keyframes gradient': {
    '0%': {
      backgroundPosition: '0% 50%',
    },
    '50%': {
      backgroundPosition: '100% 50%',
    },
    '100%': {
      backgroundPosition: '0% 50%',
    },
  },
});

const LoginSection = styled(Box)(({ theme }) => ({
  flex: '0 0 50%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    flex: '0 0 100%',
    padding: theme.spacing(2),
  },
}));

const FeatureSection = styled(Box)(({ theme }) => ({
  flex: '0 0 50%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    flex: '0 0 100%',
    padding: theme.spacing(2),
  },
}));

// Giriş formu için bileşen - Daha modern ve interaktif
const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4747e1',
    },
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(71, 71, 225, 0.15)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4747e1',
      borderWidth: '2px',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e0e0e0',
  },
});

// Giriş butonu için bileşen - Daha modern ve interaktif
const LoginButton = styled(Button)({
  borderRadius: '16px',
  padding: '14px',
  background: 'linear-gradient(45deg, #4747e1, #6b6bf9)',
  color: 'white',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 8px 16px rgba(71, 71, 225, 0.25)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'all 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 20px rgba(71, 71, 225, 0.35)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(0)',
  },
});

// Google giriş butonu için bileşen - Daha modern ve interaktif
const GoogleButton = styled(Button)({
  backgroundColor: '#ffffff',
  color: '#333',
  border: '1px solid #e0e0e0',
  borderRadius: '16px',
  padding: '14px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#f8f9ff',
    borderColor: '#4747e1',
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
});

// Özellik kartları için bileşen - Daha modern ve interaktif
const InfoCard = styled(Box)(({ theme }) => ({
  borderRadius: '20px',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
  width: '90px',
  height: '90px',
  background: 'var(--card-bg-color, rgba(255, 255, 255, 0.9))',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  position: 'relative',
  zIndex: 10,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.05)',
    boxShadow: '0 15px 30px rgba(71, 71, 225, 0.2)',
    '& .feature-popup': {
      opacity: 1,
      visibility: 'visible',
      transform: 'translateX(-50%) translateY(15px) scale(1)',
    },
    '& svg': {
      transform: 'scale(1.1)',
      color: '#6b6bf9',
    }
  },
  '& svg': {
    fontSize: '40px',
    color: '#4747e1',
    transition: 'all 0.3s ease',
  }
}));

// Özellik bilgilerini gösteren bileşen - Alt kısımda açılır kartlık
const FeaturePopup = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%) translateY(15px) scale(0.9)',
  background: 'linear-gradient(135deg, #4747e1 0%, #6b6bf9 100%)',
  color: '#ffffff',
  padding: theme.spacing(2),
  borderRadius: '16px',
  width: '220px',
  textAlign: 'center',
  boxShadow: '0 15px 30px rgba(71, 71, 225, 0.3)',
  opacity: 0,
  visibility: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  zIndex: 100,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    borderWidth: '10px',
    borderStyle: 'solid',
    borderColor: 'transparent transparent #4747e1 transparent',
  },
  '& .popup-title': {
    fontWeight: 700,
    fontSize: '1.1rem',
    marginBottom: '8px',
    position: 'relative',
    color: '#ffffff !important',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-6px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '50px',
      height: '2px',
      background: 'rgba(255, 255, 255, 0.5)',
      borderRadius: '2px',
    }
  },
  '& .popup-description': {
    fontSize: '0.9rem',
    opacity: 0.9,
    marginTop: '12px',
    color: '#ffffff !important',
  }
}));

// Arka plan için akademik desen
const AcademicPattern = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  width: '50%',
  backgroundImage: `url('https://www.transparenttextures.com/patterns/notebook-dark.png')`,
  backgroundRepeat: 'repeat',
  opacity: 0.03,
  zIndex: 0,
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

// Gece modu butonu için stil
const DarkModeButton = styled(IconButton)({
  position: 'absolute',
  top: '20px',
  right: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(4px)',
  color: '#4747e1',
  padding: '8px',
  zIndex: 1000,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'rotate(20deg)',
  },
});

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Sayfa yüklenirken localStorage'dan tema tercihini al
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(savedTheme === 'true');
    }
  }, []);
  
  // Tema değiştiğinde CSS değişkenlerini güncelle
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--background-color', 
      darkMode ? '#15254f' : '#f4f2f5'
    );
    
    document.documentElement.style.setProperty(
      '--overlay-color', 
      darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.85)'
    );
    
    document.documentElement.style.setProperty(
      '--text-color', 
      darkMode ? '#ffffff' : '#333333'
    );
    
    document.documentElement.style.setProperty(
      '--card-bg-color', 
      darkMode ? 'rgba(30, 40, 70, 0.9)' : 'rgba(255, 255, 255, 0.9)'
    );
    
    // Tema tercihini localStorage'a kaydet
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  
  // Tema değiştirme fonksiyonu
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error("Email login error:", error);
    } finally {
      setLoading(false);
    }
  }

  // Özellik listesi - Platform özellikleri
  const featureItems = [
    {
      title: "TYT-AYT Net Takibi",
      icon: <BarChartIcon />,
      description: "Sınav netlerinizi takip edin"
    },
    {
      title: "Ders Programı",
      icon: <CalendarMonthIcon />,
      description: "Günlük ders programınızı görüntüleyin"
    },
    {
      title: "Çalışma Analizi",
      icon: <AssessmentIcon />,
      description: "Çalışma performansınızı analiz edin"
    },
    {
      title: "Konu Takibi",
      icon: <ListAltIcon />,
      description: "Çalıştığınız konuları takip edin"
    },
    {
      title: "RekaNet",
      icon: <LeaderboardIcon />,
      description: "Arkadaşlarınızla rekabet edin"
    }
  ];

  // Çizim öğeleri
  const illustrations = [
    { top: '15%', right: '10%', size: '80px', delay: 0 },
    { bottom: '20%', left: '12%', size: '60px', delay: 0.5 },
  ];

  return (
    <LoginContainer>
      <AnimatedBackground sx={{
        background: darkMode ? 
          'linear-gradient(-45deg, #0a1128, #1a2a4a, #2a3a6a, #1a2a4a)' : 
          'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
      }} />
      
      <DarkModeButton onClick={toggleDarkMode}>
        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </DarkModeButton>
      
      {/* Animasyonlu Partiküller */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        {[...Array(15)].map((_, index) => (
          <Box
            key={index}
            component={motion.div}
            sx={{
              position: 'absolute',
              width: Math.random() * 20 + 10,
              height: Math.random() * 20 + 10,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(71, 71, 225, 0.4), rgba(107, 107, 249, 0.2))',
              boxShadow: '0 0 10px rgba(71, 71, 225, 0.3)',
              filter: 'blur(1px)'
            }}
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </Box>
      
      {/* Logo ve Başlık - Sabit pozisyonda */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, p: 3, zIndex: 10 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ color: '#4747e1', fontSize: 28, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#4747e1' }}>
            Online YKS Takip
          </Typography>
        </Box>
      </Box>

      {/* Sol Taraf - Giriş Formu */}
      <LoginSection>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ maxWidth: 450, mx: 'auto', p: 3 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: '#333',
              mb: 1
            }}>
              Hoş Geldiniz!
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#666',
              mb: 4
            }}>
              Lütfen giriş bilgilerinizi aşağıya girin
            </Typography>
            
            <form onSubmit={handleEmailLogin}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  E-posta
                </Typography>
                <StyledTextField
                  fullWidth
                  placeholder="E-posta adresinizi girin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#4747e1' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Şifre
                </Typography>
                <StyledTextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#4747e1' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Link 
                  component="button" 
                  variant="body2" 
                  sx={{ 
                    color: '#4747e1',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Şifremi unuttum?
                </Link>
              </Box>
              
              <LoginButton 
                fullWidth 
                type="submit"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
              </LoginButton>
            </form>
            
            <Box sx={{ 
              my: 3, 
              display: 'flex', 
              alignItems: 'center',
              color: '#666'
            }}>
              <Divider sx={{ flexGrow: 1 }} />
              <Typography variant="body2" sx={{ mx: 2 }}>veya</Typography>
              <Divider sx={{ flexGrow: 1 }} />
            </Box>
            
            <GoogleButton
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              Google ile giriş yap
            </GoogleButton>
            
            <Box sx={{ 
              mt: 3,
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Hesabınız yok mu? <Link component="button" sx={{ color: '#4747e1', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Kayıt Ol</Link>
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </LoginSection>
      
      {/* Sağ Taraf - Özellik Kartları */}
      <FeatureSection>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          {/* Akademik desen */}
          <AcademicPattern />
          

          
          {/* Başlık */}
          <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text-color, #333)', textAlign: 'center' }}>
              Platform Özellikleri
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-color, #666)', opacity: 0.7, textAlign: 'center', mt: 1 }}>
              Eğitim hayatınızı kolaylaştıracak araçlar
            </Typography>
          </Box>
          
          {/* Özellik Kartları */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            gap: 4,
            mt: 3,
            position: 'relative',
            zIndex: 1
          }}>
            {featureItems.map((feature, index) => (
              <InfoCard key={index}>
                {feature.icon}
                <FeaturePopup className="feature-popup">
                  <Typography className="popup-title" sx={{ fontWeight: 700 }}>
                    {feature.title}
                  </Typography>
                  <Typography className="popup-description">
                    {feature.description}
                  </Typography>
                </FeaturePopup>
              </InfoCard>
            ))}
          </Box>
        </motion.div>
      </FeatureSection>
      
      {/* Arka plan dekoratif elementleri */}
      {illustrations.map((item, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            top: item.top || 'auto',
            left: item.left || 'auto',
            right: item.right || 'auto',
            bottom: item.bottom || 'auto',
            zIndex: 0
          }}
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, item.left ? -5 : 5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: item.delay
          }}
        >
          <Box sx={{
            width: item.size,
            height: item.size,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6b6bf9, #4747e1)',
            opacity: 0.2,
            filter: 'blur(10px)'
          }} />
        </motion.div>
      ))}
    </LoginContainer>
  );
};

export default Login;
