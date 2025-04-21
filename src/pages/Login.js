import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid,
  CircularProgress,
  useTheme,
  Paper,
  Container,
  Fade,
  Grow,
  Card,
  CardContent,
  Avatar,
  Divider,
  useMediaQuery
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import SchoolIcon from '@mui/icons-material/School';
import TimerIcon from '@mui/icons-material/Timer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

// Animasyonlar
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(63, 81, 181, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(63, 81, 181, 0); }
  100% { box-shadow: 0 0 0 0 rgba(63, 81, 181, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Özel stil bileşenleri
const FeatureCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#FFFFF0',
  borderRadius: 16,
  overflow: 'hidden',
  height: '100%',
  boxShadow: '0 8px 25px rgba(77, 77, 0, 0.08)',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 30px rgba(77, 77, 0, 0.12)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: 'linear-gradient(90deg, #3f51b5, #5c6bc0)',
  }
}));

const FeatureIcon = styled(Avatar)(({ theme, color }) => ({
  backgroundColor: color || '#3f51b5',
  width: 56,
  height: 56,
  boxShadow: '0 4px 12px rgba(63, 81, 181, 0.2)',
  margin: '0 auto 16px',
  animation: `${float} 6s ease-in-out infinite`,
  '& .MuiSvgIcon-root': {
    fontSize: 28,
  }
}));

const StatsBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#FFFFF0',
  borderRadius: 16,
  padding: '24px 16px',
  margin: '12px 0',
  textAlign: 'center',
  boxShadow: '0 8px 25px rgba(77, 77, 0, 0.08)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 30px rgba(77, 77, 0, 0.12)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(45deg, rgba(63, 81, 181, 0.03) 0%, rgba(92, 107, 192, 0.03) 100%)',
    zIndex: 0,
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
  borderRadius: 50,
  border: 0,
  color: 'white',
  padding: '14px 36px',
  boxShadow: '0 8px 16px rgba(63, 81, 181, 0.25)',
  transition: 'all 0.3s ease',
  fontWeight: 600,
  fontSize: '1rem',
  animation: `${pulse} 2s infinite`,
  '&:hover': {
    boxShadow: '0 12px 20px rgba(63, 81, 181, 0.4)',
    transform: 'translateY(-3px) scale(1.02)',
    background: 'linear-gradient(45deg, #3949ab 30%, #5c6bc0 90%)',
  },
}));

const ShimmerText = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  background: 'linear-gradient(90deg, #3f51b5, #5c6bc0, #3f51b5)',
  backgroundSize: '200% 100%',
  color: 'transparent',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  animation: `${shimmer} 3s linear infinite`,
}));

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Özellik kartları için veri
  const features = [
    {
      title: 'Pomodoro Tekniği',
      description: 'Odaklanmış çalışma ve dinlenme döngüleriyle verimliliğinizi artırın',
      icon: <TimerIcon />,
      color: '#5c6bc0'
    },
    {
      title: 'Detaylı Analitik',
      description: 'Ders ve konu bazlı çalışma sürelerini takip edin ve raporlayın',
      icon: <AssessmentIcon />,
      color: '#3949ab'
    },
    {
      title: 'YKS Odaklı',
      description: 'TYT ve AYT konularına göre özelleştirilmiş net takibi ve raporlama',
      icon: <SchoolIcon />,
      color: '#303f9f'
    },
    {
      title: 'Konu Takibi',
      description: 'Çözdüğünüz soruları kaydedin ve gelişiminizi izleyin',
      icon: <MenuBookIcon />,
      color: '#283593'
    }
  ];
  
  // İstatistik kutuları için veri
  const stats = [
    { value: '25+', label: 'Ders Kategorisi', icon: <MenuBookIcon /> },
    { value: '10+', label: 'Analitik Rapor', icon: <AssessmentIcon /> },
    { value: '1000+', label: 'Aktif Kullanıcı', icon: <EmojiEventsIcon /> }
  ];

  return (
    <Box 
      className="login-container"
      sx={{ 
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background: `linear-gradient(135deg, #FFFFF0 0%, #FFFACD 100%)`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Arka plan dekoratif öğeler */}
      <Box sx={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(63,81,181,0.05) 0%, rgba(63,81,181,0) 70%)',
        top: '-200px',
        left: '-200px',
        zIndex: 0,
      }} />
      
      <Box sx={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(92,107,192,0.05) 0%, rgba(92,107,192,0) 70%)',
        bottom: '-100px',
        right: '5%',
        zIndex: 0,
      }} />
      
      <Box sx={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(63,81,181,0.03) 0%, rgba(63,81,181,0) 70%)',
        top: '20%',
        right: '20%',
        zIndex: 0,
      }} />
      
      {/* Dekoratif çizgiler */}
      <Box sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: `
          linear-gradient(90deg, rgba(63,81,181,0.03) 1px, transparent 1px),
          linear-gradient(rgba(63,81,181,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        zIndex: 0,
      }} />

      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} sx={{ minHeight: '90vh' }}>
          {/* Sol panel - Giriş Formu */}
          <Grid 
            item 
            xs={12} 
            md={6} 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 3, sm: 4 },
              position: 'relative',
            }}
          >
          <Fade in={true} timeout={800}>
            <Container maxWidth="sm">
              <Box 
                sx={{ 
                  mb: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: { xs: 'center', md: 'flex-start' }
                }}
              >
                <ShimmerText 
                  variant="h3" 
                  component="h1" 
                  gutterBottom 
                  sx={{ 
                    fontFamily: 'Poppins, Montserrat, sans-serif',
                    fontWeight: 700, 
                    mb: 1,
                    color: theme.palette.primary.main,
                    fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3rem' },
                    letterSpacing: '-0.5px',
                    lineHeight: 1.2
                  }}
                >
                  YKS Çalışma Takip
                </ShimmerText>
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#3f51b5',
                    mb: 3,
                    letterSpacing: '0.5px'
                  }}
                >
                  Hesabınıza giriş yapın
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#555', 
                    mb: 4,
                    lineHeight: 1.6,
                    fontSize: '1.05rem',
                    maxWidth: '500px',
                    mx: { xs: 'auto', md: 0 }
                  }}
                >
                  Pomodoro tekniği ve analitik çalışma takibi ile sınav başarınızı artırın. Düzenli çalışma ve detaylı istatistiklerle performansınızı maksimum seviyeye çıkarın.
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: { xs: 'center', md: 'flex-start' },
                  mt: 4
                }}>
                  <GradientButton
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    size="large"
                    sx={{ 
                      position: 'relative',
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: { sm: '240px' },
                      fontWeight: 500,
                      fontFamily: 'Inter, Montserrat, sans-serif',
                      letterSpacing: '0.5px',
                      mb: 3
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Google ile Giriş Yap"
                    )}
                  </GradientButton>

                  <Typography 
                    variant="body2" 
                    align="center" 
                    sx={{ 
                      mt: 4, 
                      color: '#718096',
                      px: 2,
                      fontFamily: 'Inter, Montserrat, sans-serif',
                      fontSize: { xs: '0.8rem', sm: '0.85rem' },
                      lineHeight: 1.6
                    }}
                  >
                    Giriş yaparak, YKS çalışma verilerinizin kaydedilmesini ve analiz edilmesini kabul etmiş olursunuz.
                  </Typography>
                </Box>
              </Box>
            </Container>
          </Fade>
        </Grid>
        
          {/* Sağ panel - Bilgi ve İstatistikler */}
          <Grid 
            item 
            md={6} 
            className="login-right-panel"
            sx={{ 
              display: { xs: 'none', md: 'flex' },
              position: 'relative',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
              color: 'white',
              p: 6,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(63, 81, 181, 0.2)',
            }}
          >
          {/* Arka plan dekoratif öğeleri */}
          <Box sx={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          }} />
          
          <Box sx={{
            position: 'absolute',
            bottom: '15%',
            left: '10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
          }} />
          
          <Fade in={true} timeout={1200}>
            <Box 
              sx={{
                position: 'relative',
                zIndex: 1,
                maxWidth: 500,
                width: '100%',
                textAlign: 'center',
                mb: 6
              }}
            >
              <Typography 
                variant="h3" 
                sx={{ 
                  fontFamily: 'Poppins, Montserrat, sans-serif',
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { md: '2.2rem', lg: '2.5rem' },
                  textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                Başarının anahtarı etkili çalışmadır
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: 'Inter, Montserrat, sans-serif',
                  fontWeight: 400,
                  fontSize: '1.1rem',
                  lineHeight: 1.7,
                  opacity: 0.9,
                  mb: 5
                }}
              >
                YKS Çalışma Takip uygulaması ile çalışma sürenizi optimize edin, 
                performansınızı analiz edin ve hedeflerinize daha hızlı ulaşın.
              </Typography>
            </Box>
          </Fade>
          
            <Grid container spacing={3} sx={{ maxWidth: 500, mb: 6 }}>
              {stats.map((stat, index) => (
                <Grid item xs={4} key={stat.label}>
                  <Grow in={true} timeout={1000 + (index * 300)}>
                    <StatsBox>
                      <Box sx={{ mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.15)',
                            width: 48,
                            height: 48,
                            mx: 'auto',
                            mb: 1,
                            '& .MuiSvgIcon-root': { fontSize: 24 }
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                      </Box>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 800, 
                          fontSize: '2.5rem', 
                          color: '#FFFFF0',
                          mb: 1,
                          textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.9rem', 
                          color: '#FFFFF0', 
                          fontWeight: 500,
                          opacity: 0.9
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </StatsBox>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          
            <Fade in={true} timeout={1800}>
              <Box sx={{ width: '100%', maxWidth: 500 }}>
                <Grid container spacing={3}>
                  {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} key={feature.title}>
                      <Grow in={true} timeout={1500 + (index * 200)}>
                        <FeatureCard>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <FeatureIcon color={feature.color}>
                              {feature.icon}
                            </FeatureIcon>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 600, 
                              fontSize: '1.1rem', 
                              mb: 1.5,
                              color: '#333'
                            }}>
                              {feature.title}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              fontSize: '0.9rem',
                              color: '#555',
                              lineHeight: 1.6
                            }}>
                              {feature.description}
                            </Typography>
                          </CardContent>
                        </FeatureCard>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Fade>
          </Grid>
      </Container>
    </Box>
  );
};

export default Login;
