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
  CardContent,
  Paper,
  useMediaQuery
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ForumIcon from '@mui/icons-material/Forum';
import GroupsIcon from '@mui/icons-material/Groups';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import BookIcon from '@mui/icons-material/Book';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
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

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Styled components
const LoginContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  width: '100%',
  display: 'flex',
  overflow: 'hidden',
  position: 'relative',
  background: '#FFFFF0',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23A0522D\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    backgroundSize: '180px 180px',
    zIndex: 0,
  }
}));

// Decorative study shapes for the background
const studyShapes = [
  {
    size: '100px',
    top: '10%',
    left: '5%',
    delay: '0s',
    color: 'rgba(255, 107, 107, 0.1)',
    rotate: '10deg',
    icon: <BookIcon />
  },
  {
    size: '80px',
    top: '20%',
    right: '10%',
    delay: '1s',
    color: 'rgba(78, 205, 196, 0.1)',
    rotate: '-15deg',
    icon: <MenuBookIcon />
  },
  {
    size: '120px',
    bottom: '15%',
    left: '15%',
    delay: '2s',
    color: 'rgba(255, 159, 28, 0.1)',
    rotate: '20deg',
    icon: <EmojiObjectsIcon />
  },
  {
    size: '90px',
    bottom: '20%',
    right: '5%',
    delay: '3s',
    color: 'rgba(132, 94, 194, 0.1)',
    rotate: '-10deg',
    icon: <SchoolIcon />
  }
];



const StudyShape = styled(Box)(({ size, top, right, bottom, left, delay, color, rotate }) => ({
  position: 'absolute',
  width: size,
  height: size,
  top,
  right,
  bottom,
  left,
  borderRadius: '20%',
  background: color || 'rgba(255, 255, 255, 0.1)',
  animation: `${float} 10s ease-in-out infinite`,
  animationDelay: delay || '0s',
  zIndex: 1,
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: `rotate(${rotate || '0deg'})`,
  opacity: 0.6,
  '& .MuiSvgIcon-root': {
    fontSize: parseInt(size) * 0.5,
    color: 'rgba(0, 0, 0, 0.2)',
  }
}));

const MainContent = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 1200,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  backgroundColor: '#fff',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(4),
  position: 'relative',
  minHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const LeftPanel = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: theme.spacing(2),
  position: 'relative',
  zIndex: 2,
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  marginBottom: theme.spacing(2),
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
  boxShadow: '0 8px 20px rgba(255, 107, 107, 0.3)',
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    fontSize: 40,
    color: '#fff',
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 800,
  textAlign: 'left',
}));

const AnimatedText = styled(Typography)(({ delay }) => ({
  animation: `${fadeIn} 1s ease-in-out`,
  animationDelay: delay || '0s',
  animationFillMode: 'both',
  textAlign: 'left',
}));

const LoginButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  border: 0,
  borderRadius: 50,
  boxShadow: '0 3px 15px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  padding: '12px 30px',
  fontWeight: 600,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 20px 2px rgba(255, 105, 135, .4)',
  },
}));



const InfoCard = styled(Paper)(({ theme, color }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s ease',
  height: '100%',
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${color}20`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 10px 25px ${color}30`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '5px',
    height: '100%',
    background: color,
  }
}));

const IconWrapper = styled(Box)(({ color }) => ({
  width: 50,
  height: 50,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `${color}15`,
  color: color,
  flexShrink: 0,
  '& .MuiSvgIcon-root': {
    fontSize: 28,
    color: color,
  },
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

    // studyShapes is defined at the top of the file

  // Info cards data
  const infoCards = [
    {
      title: "RekaNET Sıralama",
      description: "RekaNET ile şehrinde hangi sıralamadasın öğren",
      icon: <TimelineIcon />,
      color: "#FF8E53"
    },
    {
      title: "Benimle Çalış",
      description: "Benimle Çalış sistemi ile her gün canlı yayında beraber çalışıyoruz",
      icon: <GroupsIcon />,
      color: "#FE6B8B"
    },
    {
      title: "SoruForum",
      description: "Takıldığın soru mu oldu? SoruForum sayesinde soru sorabilirsin",
      icon: <ForumIcon />,
      color: "#4A90E2"
    },
    {
      title: "Deneme Takibi",
      description: "Deneme netlerini grafiklerle kontrol edebilirsin",
      icon: <BarChartIcon />,
      color: "#9B59B6"
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
      {/* Decorative study shapes */}
      {studyShapes.map((shape, index) => (
        <StudyShape 
          key={index}
          size={shape.size} 
          top={shape.top} 
          left={shape.left} 
          right={shape.right} 
          bottom={shape.bottom} 
          delay={shape.delay} 
          color={shape.color}
          rotate={shape.rotate}
        >
          {shape.icon}
        </StudyShape>
      ))}

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
        <MainContent>
          <Grid 
            container 
            spacing={4}
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
                justifyContent: 'center',
                height: { xs: 'auto', md: '100%' },
                pb: { xs: 4, md: 0 }
              }}
            >
              <LeftPanel>
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
                    color: '#666',
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
                    color: '#666',
                    lineHeight: 1.6,
                    fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
                    maxWidth: '90%'
                  }}
                  delay="0.5s"
                >
                  Pomodoro tekniği ve analitik çalışma takibi ile sınav 
                  başarınızı artırın. Düzenli çalışma ve detaylı istatistiklerle 
                  performansınızı maksimum seviyeye çıkarın.
                </AnimatedText>
                
                <Grow in={true} timeout={1500}>
                  <Box sx={{ position: 'relative', zIndex: 3, mt: 2 }}>
                    {loading ? (
                      <CircularProgress size={36} sx={{ color: '#FE6B8B' }} />
                    ) : (
                      <LoginButton
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
                      </LoginButton>
                    )}
                  </Box>
                </Grow>
              </LeftPanel>
            </Grid>
            
            {/* Right side - Info Cards */}
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
                    mb: { xs: 2, md: 3 }, 
                    textAlign: { xs: 'center', md: 'left' }
                  }}
                >
                  <AnimatedText 
                    variant="h4" 
                    sx={{ 
                      mb: { xs: 1, md: 1 },
                      fontWeight: 700,
                      color: '#4A90E2',
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '1.75rem' }
                    }}
                    delay="0.7s"
                  >
                    Neden YKS Çalışma Takip?
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
                        md={index < 3 ? 4 : 6}
                        key={card.title}
                      >
                        <Grow in={true} timeout={1200 + (index * 150)}>
                          <InfoCard 
                            elevation={2} 
                            color={card.color}
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
                              <IconWrapper
                                color={card.color}
                              >
                                {card.icon}
                              </IconWrapper>
                              <Box>
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    fontSize: '1rem',
                                    mb: 0.5,
                                    color: '#333'
                                  }}
                                >
                                  {card.title}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontSize: '0.8rem',
                                    color: '#666',
                                    fontWeight: 400,
                                    lineHeight: 1.4
                                  }}
                                >
                                  {card.description}
                                </Typography>
                              </Box>
                            </CardContent>
                          </InfoCard>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </MainContent>
      </Container>
    </LoginContainer>
  );
};

export default Login;
