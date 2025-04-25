import React, { useState } from 'react';
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
  Paper,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import SchoolIcon from '@mui/icons-material/School';
import TimerIcon from '@mui/icons-material/Timer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ForumIcon from '@mui/icons-material/Forum';
import GroupsIcon from '@mui/icons-material/Groups';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useTheme } from '@mui/material/styles';

// Animations - Updated
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

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-15px); }
  60% { transform: translateY(-7px); }
`;

const colorChange = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled components
const LoginContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  width: '100%',
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
  width: ({ size }) => size || 56,
  height: ({ size }) => size || 56,
  boxShadow: '0 8px 16px rgba(91, 143, 185, 0.2)',
  margin: '0 auto 16px',
  animation: `${float} 6s ease-in-out infinite`,
  '& .MuiSvgIcon-root': {
    fontSize: ({ size }) => (size ? size/2 : 28),
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
  [theme.breakpoints.down('sm')]: {
    display: 'none', // Hide on small screens to prevent clutter
  },
}));

const StatsBox = styled(Paper)(({ theme, color }) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: '16px 12px',
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
    height: '5px',
    background: color || 'linear-gradient(45deg, rgba(91, 143, 185, 0.8) 0%, rgba(184, 192, 255, 0.8) 100%)',
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
    background: 'linear-gradient(45deg, #3D6F94 30%, #5B8FB9 90%)',
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
  },
  [theme.breakpoints.down('sm')]: {
    padding: '10px 24px',
    fontSize: '0.875rem',
  },
}));

const GlowingCircle = styled(Box)(({ theme }) => ({
  width: '180px',
  height: '180px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(91,143,185,0.8) 0%, rgba(91,143,185,0.4) 50%, rgba(91,143,185,0.1) 70%, rgba(91,143,185,0) 100%)',
  animation: `${pulse} 3s infinite`,
  position: 'absolute',
  zIndex: 0,
  [theme.breakpoints.down('md')]: {
    width: '150px',
    height: '150px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '120px',
    height: '120px',
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  position: 'relative',
}));

const LogoIcon = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  backgroundColor: theme.palette.primary.main,
  boxShadow: '0 15px 35px rgba(91, 143, 185, 0.3)',
  animation: `${bounce} 2s ease infinite`,
  '& .MuiSvgIcon-root': {
    fontSize: 40,
    color: '#FFFFFF'
  },
  [theme.breakpoints.down('md')]: {
    width: 60,
    height: 60,
    '& .MuiSvgIcon-root': {
      fontSize: 35,
    }
  },
  [theme.breakpoints.down('sm')]: {
    width: 50,
    height: 50,
    '& .MuiSvgIcon-root': {
      fontSize: 30,
    }
  },
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

const RainbowBorder = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: 20,
  padding: 3,
  background: 'linear-gradient(90deg, #5B8FB9, #B8C0FF, #06D6A0, #FFD166, #5B8FB9)',
  backgroundSize: '400% 400%',
  animation: `${colorChange} 10s ease infinite`,
  boxShadow: '0 10px 30px rgba(91, 143, 185, 0.15)',
}));

const ContentBox = styled(Box)(({ theme }) => ({
  background: '#FFFFFF',
  borderRadius: 18,
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  overflow: 'hidden',
}));
const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
      color: theme.palette.primary.main,
      tooltip: "YKS hazırlık için kapsamlı ders kategorileri"
    },
    { 
      label: "Analitik Rapor", 
      value: "10+", 
      icon: <AssessmentIcon />,
      color: theme.palette.secondary.main,
      tooltip: "Detaylı çalışma performans analizleri"
    },
    { 
      label: "Aktif Kullanıcı", 
      value: "1000+", 
      icon: <EmojiEventsIcon />,
      color: theme.palette.success.main,
      tooltip: "Büyüyen öğrenci topluluğumuza katılın"
    }
  ];

  // Features data
  const features = [
    {
      title: "Pomodoro Tekniği",
      description: "Odaklanmış çalışma ve dinlenme döngüleriyle verimliliğinizi artırın",
      icon: <TimerIcon />,
      color: "#5B8FB9"
    },
    {
      title: "Detaylı Analitik",
      description: "Ders ve konu bazlı çalışma sürenizi takip edin ve raporlayın",
      icon: <BarChartIcon />,
      color: "#B8C0FF"
    },
    {
      title: "YKS Odaklı",
      description: "TYT ve AYT konularına göre başarınızı not tutun ve raporlayın",
      icon: <AutoStoriesIcon />,
      color: "#06D6A0"
    },
    {
      title: "Akıllı Hatırlatıcılar",
      description: "Çalışma hedeflerinize ulaşmanız için kişiselleştirilmiş bildirimler",
      icon: <PsychologyIcon />,
      color: "#FFD166"
    }
  ];
  
  // Info cards data
  const infoCards = [
    {
      title: "RekaNET Sıralama",
      description: "RekaNET ile şehrinde hangi sıralamadasın öğren",
      icon: <TimelineIcon />,
      color: "#FF6B6B"
    },
    {
      title: "Benimle Çalış",
      description: "Benimle Çalış sistemi ile her gün canlı yayında beraber çalışıyoruz",
      icon: <GroupsIcon />,
      color: "#4ECDC4"
    },
    {
      title: "SoruForum",
      description: "Takıldığın soru mu oldu? SoruForum sayesinde soru sorabilirsin",
      icon: <ForumIcon />,
      color: "#FF9F1C"
    },
    {
      title: "Deneme Takibi",
      description: "Deneme netlerini grafiklerle kontrol edebilirsin",
      icon: <BarChartIcon />,
      color: "#845EC2"
    },
    {
      title: "Konu Analizi",
      description: "Hangi konuya ne kadar çalıştığını görebilirsin",
      icon: <PieChartIcon />,
      color: "#00B8A9"
    }
  ];

  return (
    <LoginContainer>
      {/* Decorative floating shapes */}
      <FloatingShape size="100px" top="10%" left="5%" delay="0s" color="linear-gradient(135deg, rgba(91, 143, 185, 0.2), rgba(91, 143, 185, 0.1))" />
      <FloatingShape size="70px" top="20%" right="10%" delay="1s" color="linear-gradient(135deg, rgba(184, 192, 255, 0.2), rgba(184, 192, 255, 0.1))" />
      <FloatingShape size="120px" bottom="10%" left="15%" delay="2s" color="linear-gradient(135deg, rgba(6, 214, 160, 0.1), rgba(6, 214, 160, 0.05))" />
      <FloatingShape size="80px" bottom="20%" right="5%" delay="3s" color="linear-gradient(135deg, rgba(255, 209, 102, 0.1), rgba(255, 209, 102, 0.05))" />

      <Container 
        maxWidth="xl" 
        sx={{ 
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 2, sm: 3, md: 4 }, 
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative', 
          zIndex: 2
        }}
      >
        <RainbowBorder sx={{ width: '100%', height: { xs: 'auto', md: '85vh' } }}>
          <ContentBox>
            <Grid 
              container 
              spacing={3}
              sx={{ height: '100%' }}
            >
              {/* Left side - Login form */}
              <Grid 
                item 
                xs={12} 
                md={5} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  height: { xs: 'auto', md: '100%' },
                  pb: { xs: 4, md: 0 }
                }}
              >
                <Fade in={true} timeout={1000}>
                  <Box 
                    sx={{ 
                      position: 'relative', 
                      width: '100%',
                      maxWidth: { xs: '100%', sm: 450 },
                      px: { xs: 2, md: 4 }
                    }}
                  >
                    <GlowingCircle 
                      sx={{ 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)'
                      }} 
                    />
                    
                    <LogoContainer>
                      <LogoIcon>
                        <SchoolIcon />
                      </LogoIcon>
                    </LogoContainer>
                    
                    <GradientText 
                      variant="h3" 
                      component="h1" 
                      sx={{ 
                        mb: 1, 
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
                      }}
                    >
                      YKS Çalışma Takip
                    </GradientText>
                    
                    <AnimatedText 
                      variant="h6" 
                      sx={{ 
                        mb: { xs: 2, md: 2 },
                        fontWeight: 500,
                        color: theme.palette.text.secondary,
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' }
                      }}
                      delay="0.3s"
                    >
                      Başarının anahtarı etkili çalışmadır
                    </AnimatedText>
                    
                    <AnimatedText 
                      variant="body1" 
                      sx={{ 
                        mb: { xs: 3, md: 4 },
                        color: theme.palette.text.secondary,
                        lineHeight: 1.6,
                        fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' }
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
                            size={isMobile ? "medium" : "large"}
                            sx={{ 
                              px: { xs: 3, md: 4 }, 
                              py: { xs: 1, md: 1.5 },
                              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' }
                            }}
                          >
                            Google ile Giriş Yap
                          </GradientButton>
                        )}
                      </Box>
                    </Grow>
                    
                    <Grid 
                      container 
                      spacing={2} 
                      sx={{ 
                        mt: 4,
                        display: { xs: 'none', md: 'flex' } 
                      }}
                    >
                      {stats.map((stat, index) => (
                        <Grid item xs={4} key={stat.label}>
                          <Tooltip title={stat.tooltip} arrow placement="top">
                            <StatsBox 
                              elevation={2}
                              color={`linear-gradient(45deg, ${stat.color} 0%, ${stat.color}99 100%)`}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: stat.color,
                                  width: 40,
                                  height: 40,
                                  mx: 'auto',
                                  mb: 1,
                                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                  '& .MuiSvgIcon-root': { fontSize: 24 }
                                }}
                              >
                                {stat.icon}
                              </Avatar>
                              <Typography 
                                variant="h4" 
                                sx={{ 
                                  fontWeight: 800, 
                                  fontSize: '1.5rem', 
                                  color: theme.palette.text.primary,
                                  mb: 0.5
                                }}
                              >
                                {stat.value}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '0.75rem', 
                                  color: theme.palette.text.secondary, 
                                  fontWeight: 500
                                }}
                              >
                                {stat.label}
                              </Typography>
                            </StatsBox>
                          </Tooltip>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Fade>
              </Grid>
              
              {/* Right side - Features */}
              <Grid 
                item 
                xs={12} 
                md={7} 
                sx={{ 
                  height: { xs: 'auto', md: '100%' },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Fade in={true} timeout={1200}>
                  <Box 
                    sx={{ 
                      mb: { xs: 2, md: 2 }, 
                      textAlign: { xs: 'center', md: 'left' },
                      px: { xs: 2, md: 0 }
                    }}
                  >
                    <AnimatedText 
                      variant="h4" 
                      sx={{ 
                        mb: { xs: 1, md: 1 },
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '1.75rem' }
                      }}
                      delay="0.7s"
                    >
                      Neden YKS Çalışma Takip?
                    </AnimatedText>
                    
                    <AnimatedText 
                      variant="body1" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
                        mx: { xs: 'auto', md: 0 },
                        display: { xs: 'none', md: 'block' }
                      }}
                      delay="0.9s"
                    >
                      YKS Çalışma Takip uygulaması ile çalışma sürenizi optimize edin, 
                      performansınızı analiz edin ve hedeflerinize daha hızlı ulaşın.
                    </AnimatedText>
                  </Box>
                </Fade>
                
                {/* Info Cards Section */}
                <Fade in={true} timeout={1500}>
                  <Box sx={{ mb: 2 }}>
                    <Grid 
                      container 
                      spacing={2}
                    >
                      {infoCards.map((card, index) => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={6} 
                          md={4}
                          key={card.title}
                        >
                          <Grow in={true} timeout={1200 + (index * 150)}>
                            <FeatureCard 
                              elevation={3} 
                              sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transform: 'scale(1)',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.03)',
                                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                                },
                                '&::after': {
                                  background: `linear-gradient(90deg, ${card.color}, ${card.color}99)`,
                                  height: '8px'
                                }
                              }}
                            >
                              <CardContent 
                                sx={{ 
                                  p: 2.5, 
                                  textAlign: 'left', 
                                  flex: 1, 
                                  display: 'flex', 
                                  flexDirection: 'row', 
                                  alignItems: 'center',
                                  gap: 2
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: card.color,
                                    width: 50,
                                    height: 50,
                                    boxShadow: `0 6px 15px ${card.color}40`,
                                    flexShrink: 0,
                                    animation: `${float} 4s ease-in-out infinite`,
                                    animationDelay: `${index * 0.2}s`
                                  }}
                                >
                                  {card.icon}
                                </Avatar>
                                <Box>
                                  <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                      fontWeight: 700, 
                                      fontSize: '1rem',
                                      mb: 0.5,
                                      color: theme.palette.text.primary
                                    }}
                                  >
                                    {card.title}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontSize: '0.8rem',
                                      color: theme.palette.text.secondary,
                                      fontWeight: 400,
                                      lineHeight: 1.4
                                    }}
                                  >
                                    {card.description}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </FeatureCard>
                          </Grow>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Fade>
                
                {/* Features Section */}
                <Fade in={true} timeout={1800}>
                  <Box sx={{ mt: 1 }}>
                    <Grid 
                      container 
                      spacing={2}
                    >
                      {features.map((feature, index) => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={6} 
                          key={feature.title}
                        >
                          <Grow in={true} timeout={1500 + (index * 200)}>
                            <FeatureCard 
                              elevation={3} 
                              sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                '&::after': {
                                  background: `linear-gradient(90deg, ${feature.color}, ${feature.color}99)`,
                                }
                              }}
                            >
                              <CardContent 
                                sx={{ 
                                  p: { xs: 2, md: 2.5 }, 
                                  textAlign: 'center', 
                                  flex: 1, 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }}
                              >
                                <FeatureIcon 
                                  color={feature.color}
                                  size={isMobile ? 48 : isTablet ? 52 : 56}
                                >
                                  {feature.icon}
                                </FeatureIcon>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, 
                                    mb: { xs: 1, md: 1 },
                                    color: theme.palette.text.primary
                                  }}
                                >
                                  {feature.title}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                                    color: theme.palette.text.secondary,
                                    fontWeight: 400,
                                    lineHeight: 1.5
                                  }}
                                >
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
          </ContentBox>
        </RainbowBorder>
      </Container>
    </LoginContainer>
  );
};

export default Login;
