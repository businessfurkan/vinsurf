import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid,
  CircularProgress,
  Container,
  Fade,
  Grow,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Paper,
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
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useTheme } from '@mui/material/styles';

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(91, 143, 185, 0.6); }
  70% { box-shadow: 0 0 0 15px rgba(91, 143, 185, 0); }
  100% { box-shadow: 0 0 0 0 rgba(91, 143, 185, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-15px); }
  60% { transform: translateY(-7px); }
`;

// Styled components
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  overflow: 'hidden',
  position: 'relative',
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%235b8fb9\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    backgroundSize: '180px 180px',
    zIndex: 0,
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  overflow: 'hidden',
  height: '100%',
  boxShadow: '0 10px 30px rgba(91, 143, 185, 0.1)',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  position: 'relative',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 15px 35px rgba(91, 143, 185, 0.15)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: 'linear-gradient(90deg, #5B8FB9, #7CA6C8)',
  }
}));

const FeatureIcon = styled(Avatar)(({ theme, color }) => ({
  backgroundColor: color || theme.palette.primary.main,
  width: 56,
  height: 56,
  boxShadow: '0 8px 16px rgba(91, 143, 185, 0.2)',
  margin: '0 auto 16px',
  animation: `${float} 6s ease-in-out infinite`,
  '& .MuiSvgIcon-root': {
    fontSize: 28,
    color: '#FFFFFF'
  }
}));

const FloatingShape = styled(Box)(({ theme, delay, size, top, left, right, bottom, color }) => ({
  position: 'absolute',
  width: size || '60px',
  height: size || '60px',
  top: top,
  left: left,
  right: right,
  bottom: bottom,
  borderRadius: '50%',
  background: color || 'linear-gradient(135deg, rgba(91, 143, 185, 0.3), rgba(184, 192, 255, 0.2))',
  animation: `${float} 6s ease-in-out infinite`,
  animationDelay: delay || '0s',
  zIndex: 0,
  opacity: 0.8,
  backdropFilter: 'blur(5px)',
}));

const StatsBox = styled(Paper)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: '20px 16px',
  margin: '8px 0',
  textAlign: 'center',
  boxShadow: '0 10px 25px rgba(91, 143, 185, 0.08)',
  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 15px 35px rgba(91, 143, 185, 0.12)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(45deg, rgba(91, 143, 185, 0.03) 0%, rgba(184, 192, 255, 0.03) 100%)',
    zIndex: 0,
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #5B8FB9 30%, #7CA6C8 90%)',
  borderRadius: 50,
  border: 0,
  color: '#FFFFFF',
  padding: '12px 36px',
  boxShadow: '0 10px 20px rgba(91, 143, 185, 0.3)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 15px 30px rgba(91, 143, 185, 0.4)',
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 5px 15px rgba(91, 143, 185, 0.4)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)',
    opacity: 0,
    transition: 'opacity 0.5s ease',
  },
  '&:hover::after': {
    opacity: 1,
  }
}));

const GlowingCircle = styled(Box)(({ theme }) => ({
  width: '220px',
  height: '220px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(91,143,185,0.8) 0%, rgba(91,143,185,0.4) 50%, rgba(91,143,185,0.1) 70%, rgba(91,143,185,0) 100%)',
  animation: `${pulse} 3s infinite`,
  position: 'absolute',
  zIndex: 0,
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '100%',
  zIndex: 1,
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  position: 'relative',
}));

const LogoIcon = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  backgroundColor: theme.palette.primary.main,
  boxShadow: '0 15px 35px rgba(91, 143, 185, 0.3)',
  animation: `${bounce} 2s ease infinite`,
  '& .MuiSvgIcon-root': {
    fontSize: 45,
    color: '#FFFFFF'
  }
}));

const AnimatedText = styled(Typography)(({ theme, delay }) => ({
  animation: `${fadeIn} 0.8s ${delay || '0s'} forwards`,
  opacity: 0,
  transform: 'translateY(20px)',
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #5B8FB9 30%, #B8C0FF 90%)',
  backgroundSize: '200% 100%',
  color: 'transparent',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  animation: `${shimmer} 3s linear infinite`,
  fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 800,
}));

const FeatureGrid = styled(Grid)(({ theme }) => ({
  maxWidth: 1200,
  margin: '0 auto',
}));

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  // Stats data
  const stats = [
    { 
      label: "Ders Kategorisi", 
      value: "25+", 
      icon: <MenuBookIcon />,
      color: theme.palette.primary.main
    },
    { 
      label: "Analitik Rapor", 
      value: "10+", 
      icon: <AssessmentIcon />,
      color: theme.palette.secondary.main
    },
    { 
      label: "Aktif Kullanıcı", 
      value: "1000+", 
      icon: <EmojiEventsIcon />,
      color: theme.palette.success.main
    }
  ];

  // Features data
  const features = [
    {
      title: "Pomodoro Tekniği",
      description: "Odaklanmış çalışma ve dinlenme döngüleriyle verimliliğinizi artırın",
      icon: <TimerIcon />,
      color: theme.palette.primary.main
    },
    {
      title: "Detaylı Analitik",
      description: "Ders ve konu bazlı çalışma sürenizi takip edin ve raporlayın",
      icon: <BarChartIcon />,
      color: theme.palette.secondary.main
    },
    {
      title: "YKS Odaklı",
      description: "TYT ve AYT konularına göre başarınızı not tutun ve raporlayın",
      icon: <AutoStoriesIcon />,
      color: theme.palette.success.main
    },
    {
      title: "Akıllı Hatırlatıcılar",
      description: "Çalışma hedeflerinize ulaşmanız için kişiselleştirilmiş bildirimler",
      icon: <PsychologyIcon />,
      color: theme.palette.error.main
    }
  ];

  return (
    <LoginContainer>
      {/* Decorative floating shapes */}
      <FloatingShape size="120px" top="10%" left="5%" delay="0s" color="linear-gradient(135deg, rgba(91, 143, 185, 0.2), rgba(91, 143, 185, 0.1))" />
      <FloatingShape size="80px" top="20%" right="10%" delay="1s" color="linear-gradient(135deg, rgba(184, 192, 255, 0.2), rgba(184, 192, 255, 0.1))" />
      <FloatingShape size="150px" bottom="10%" left="15%" delay="2s" color="linear-gradient(135deg, rgba(6, 214, 160, 0.1), rgba(6, 214, 160, 0.05))" />
      <FloatingShape size="100px" bottom="20%" right="5%" delay="3s" color="linear-gradient(135deg, rgba(255, 209, 102, 0.1), rgba(255, 209, 102, 0.05))" />

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4} alignItems="center" justifyContent="center" sx={{ minHeight: '90vh' }}>
          {/* Left side - Login form */}
          <Grid item xs={12} md={5} sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
            order: { xs: 2, md: 1 }
          }}>
            <Fade in={true} timeout={1000}>
              <Box sx={{ position: 'relative', mb: 6 }}>
                <GlowingCircle sx={{ 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)'
                }} />
                
                <LogoContainer>
                  <LogoIcon>
                    <SchoolIcon />
                  </LogoIcon>
                </LogoContainer>
                
                <GradientText variant="h3" component="h1" sx={{ mb: 1, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                  YKS Çalışma Takip
                </GradientText>
                
                <AnimatedText 
                  variant="h6" 
                  sx={{ 
                    mb: 4,
                    fontWeight: 400,
                    color: theme.palette.text.secondary,
                    maxWidth: 450,
                    mx: 'auto'
                  }}
                  delay="0.3s"
                >
                  Başarının anahtarı etkili çalışmadır
                </AnimatedText>
                
                <AnimatedText 
                  variant="body1" 
                  sx={{ 
                    mb: 4,
                    color: theme.palette.text.secondary,
                    maxWidth: 450,
                    mx: 'auto',
                    lineHeight: 1.8
                  }}
                  delay="0.5s"
                >
                  Pomodoro tekniği ve analitik çalışma takibi ile sınav 
                  başarınızı artırın. Düzenli çalışma ve detaylı istatistiklerle 
                  performansınızı maksimum seviyeye çıkarın.
                </AnimatedText>
                
                <Grow in={true} timeout={1500}>
                  <Box sx={{ position: 'relative', zIndex: 3 }}>
                    {loading ? (
                      <CircularProgress size={36} sx={{ color: theme.palette.primary.main }} />
                    ) : (
                      <GradientButton
                        variant="contained"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleLogin}
                        size="large"
                        sx={{ px: 4, py: 1.5 }}
                      >
                        Google ile Giriş Yap
                      </GradientButton>
                    )}
                  </Box>
                </Grow>
              </Box>
            </Fade>
          </Grid>
          
          {/* Right side - Features */}
          <Grid item xs={12} md={7} sx={{ 
            order: { xs: 1, md: 2 },
            mb: { xs: 4, md: 0 }
          }}>
            <Fade in={true} timeout={1200}>
              <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
                <AnimatedText 
                  variant="h4" 
                  sx={{ 
                    mb: 2,
                    fontWeight: 700,
                    color: theme.palette.primary.main
                  }}
                  delay="0.7s"
                >
                  Neden YKS Çalışma Takip?
                </AnimatedText>
                
                <AnimatedText 
                  variant="body1" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    maxWidth: 600
                  }}
                  delay="0.9s"
                >
                  YKS Çalışma Takip uygulaması ile çalışma sürenizi optimize edin, 
                  performansınızı analiz edin ve hedeflerinize daha hızlı ulaşın.
                </AnimatedText>
              </Box>
            </Fade>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.map((stat, index) => (
                <Grid item xs={4} key={stat.label}>
                  <Grow in={true} timeout={1000 + (index * 300)}>
                    <StatsBox elevation={3}>
                      <Box sx={{ mb: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: stat.color,
                            width: 48,
                            height: 48,
                            mx: 'auto',
                            mb: 2,
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                            '& .MuiSvgIcon-root': { fontSize: 28 }
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                      </Box>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 800, 
                          fontSize: '2rem', 
                          color: theme.palette.text.primary,
                          mb: 0.5,
                          textShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.9rem', 
                          color: theme.palette.text.secondary, 
                          fontWeight: 500
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
              <Box sx={{ width: '100%', overflow: 'visible' }}>
                <Grid container spacing={3}>
                  {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} key={feature.title} sx={{ height: '100%' }}>
                      <Grow in={true} timeout={1500 + (index * 200)}>
                        <FeatureCard elevation={4} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ p: 3, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <FeatureIcon color={feature.color}>
                              {feature.icon}
                            </FeatureIcon>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700, 
                              fontSize: '1.1rem', 
                              mb: 1.5,
                              color: theme.palette.text.primary
                            }}>
                              {feature.title}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              fontSize: '0.9rem',
                              color: theme.palette.text.secondary,
                              fontWeight: 400,
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
        </Grid>
      </Container>
    </LoginContainer>
  );
};

export default Login;
