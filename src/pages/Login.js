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
  Grow
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import SchoolIcon from '@mui/icons-material/School';
import TimerIcon from '@mui/icons-material/Timer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

// Özel stil bileşenleri
const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: 16,
  color: '#fff',
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  width: 40,
  height: 40,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  marginRight: 12,
}));

const StatsBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  padding: 16,
  margin: '8px 0',
  textAlign: 'center',
  backdropFilter: 'blur(5px)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
  borderRadius: 50,
  border: 0,
  color: 'white',
  padding: '12px 30px',
  boxShadow: '0 8px 16px rgba(63, 81, 181, 0.25)',
  transition: 'all 0.3s ease',
  fontWeight: 600,
  '&:hover': {
    boxShadow: '0 12px 20px rgba(63, 81, 181, 0.4)',
    transform: 'translateY(-3px)',
  },
}));

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

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

  return (
    <Box 
      className="login-container"
      sx={{ 
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(120deg, #f5f7fa 0%, #e8ecf1 100%)',
        position: 'relative',
      }}
    >
      {/* Arka plan dekoru */}
      <Box sx={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(63,81,181,0.1) 0%, rgba(63,81,181,0) 70%)',
        top: '-250px',
        left: '-250px',
        zIndex: 0,
      }} />
      
      <Box sx={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(63,81,181,0.1) 0%, rgba(63,81,181,0) 70%)',
        bottom: '-150px',
        right: '10%',
        zIndex: 0,
      }} />

      <Grid container sx={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
        {/* Sol panel - Giriş Formu */}
        <Grid 
          item 
          xs={12} 
          md={6} 
          className="login-left-panel"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: { xs: 3, sm: 5, md: 8 },
            height: '100%',
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
                <Typography 
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
                    lineHeight: 1.2,
                    background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  YKS Çalışma Takip
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500, 
                    mb: 1.5,
                    color: '#4a5568',
                    fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
                    textAlign: { xs: 'center', md: 'left' }
                  }}
                >
                  Hesabınıza giriş yapın
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 5,
                    color: '#5F6477',
                    fontWeight: 400,
                    fontFamily: 'Inter, Montserrat, sans-serif',
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    textAlign: { xs: 'center', md: 'left' },
                    maxWidth: '90%',
                    lineHeight: 1.6
                  }}
                >
                  Pomodoro tekniği ve analitik çalışma takibi ile sınav başarınızı artırın. 
                  Düzenli çalışma ve istatistiklerle performansınızı maksimum seviyeye çıkarın.
                </Typography>
              </Box>
              
              {error && (
                <Paper
                  elevation={0}
                  sx={{
                    mb: 4,
                    p: 2,
                    bgcolor: 'rgba(255, 0, 0, 0.05)',
                    border: '1px solid rgba(255, 0, 0, 0.1)',
                    borderRadius: 2,
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'red',
                      fontWeight: 500,
                      fontFamily: 'Inter, Montserrat, sans-serif',
                    }}
                  >
                    {error}
                  </Typography>
                </Paper>
              )}
              
              <Grow in={animationComplete} timeout={500}>
                <Box>
                  <GradientButton
                    variant="contained"
                    startIcon={loading ? null : <GoogleIcon />}
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    size="large"
                    fullWidth
                    disableElevation
                    className="custom-button"
                    sx={{ 
                      py: { xs: 1.5, sm: 2 },
                      textTransform: 'none',
                      fontSize: { xs: '1rem', sm: '1.1rem' },
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
              </Grow>
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
            background: 'linear-gradient(135deg, #4a6bdf 0%, #2a5ebd 100%)',
            color: 'white',
            p: 6,
            height: '100%',
            overflow: 'hidden',
            boxShadow: '-10px 0px 30px rgba(0, 0, 0, 0.1)',
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
            <Grid item xs={4}>
              <Grow in={true} timeout={1000}>
                <StatsBox>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '2.5rem', 
                      color: '#fff',
                      mb: 1
                    }}
                  >
                    25+
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.9rem', 
                      color: 'rgba(255, 255, 255, 0.85)', 
                      fontWeight: 500 
                    }}
                  >
                    Ders Kategorisi
                  </Typography>
                </StatsBox>
              </Grow>
            </Grid>
            <Grid item xs={4}>
              <Grow in={true} timeout={1300}>
                <StatsBox>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '2.5rem', 
                      color: '#fff',
                      mb: 1
                    }}
                  >
                    10+
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.9rem', 
                      color: 'rgba(255, 255, 255, 0.85)', 
                      fontWeight: 500 
                    }}
                  >
                    Analitik Rapor
                  </Typography>
                </StatsBox>
              </Grow>
            </Grid>
            <Grid item xs={4}>
              <Grow in={true} timeout={1600}>
                <StatsBox>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '2.5rem', 
                      color: '#fff',
                      mb: 1
                    }}
                  >
                    1000+
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.9rem', 
                      color: 'rgba(255, 255, 255, 0.85)', 
                      fontWeight: 500 
                    }}
                  >
                    Aktif Kullanıcı
                  </Typography>
                </StatsBox>
              </Grow>
            </Grid>
          </Grid>
          
          <Fade in={true} timeout={1800}>
            <Box sx={{ maxWidth: 450 }}>
              <FeatureItem>
                <FeatureIcon>
                  <TimerIcon />
                </FeatureIcon>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 0.5 }}>
                    Pomodoro Tekniği
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                    Odaklanmış çalışma ve dinlenme döngüleriyle verimliliğinizi artırın
                  </Typography>
                </Box>
              </FeatureItem>
              
              <FeatureItem>
                <FeatureIcon>
                  <AssessmentIcon />
                </FeatureIcon>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 0.5 }}>
                    Detaylı Analitik
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                    Ders ve konu bazlı çalışma sürelerini takip edin ve raporlayın
                  </Typography>
                </Box>
              </FeatureItem>
              
              <FeatureItem>
                <FeatureIcon>
                  <SchoolIcon />
                </FeatureIcon>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 0.5 }}>
                    YKS Odaklı
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                    TYT ve AYT konularına göre özelleştirilmiş net takibi ve raporlama
                  </Typography>
                </Box>
              </FeatureItem>
            </Box>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
