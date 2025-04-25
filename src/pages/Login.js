import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid,
  CircularProgress,
  Container,
  Paper
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

import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';


// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

// Styled components
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
  background: '#FFF8E1',
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  width: '100%',
}));

const Logo = styled(Box)(({ theme }) => ({
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: '8px',
    color: '#FF6B6B',
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: { xs: 'column', md: 'column' },
  alignItems: 'center',
  justifyContent: 'center',
  padding: { xs: '20px', md: '40px 20px' },
  position: 'relative',
  overflow: 'visible',
  flex: 1,
  minHeight: '60vh',
}));



const HeroImageContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  right: '0',
  transform: 'translateY(-50%)',
  zIndex: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0.7,
  pointerEvents: 'none',
}));

const BigLetterA = styled(Box)(({ theme }) => ({
  fontSize: '400px',
  fontWeight: 'bold',
  color: '#FF6B6B',
  opacity: 0.9,
  position: 'relative',
  lineHeight: 0.8,
  fontFamily: '"Arial", sans-serif',
}));

const FloatingElement = styled(Box)(({ top, left, right, bottom, rotate, size }) => ({
  position: 'absolute',
  top,
  left,
  right,
  bottom,
  width: size || '80px',
  height: size || '80px',
  transform: rotate ? `rotate(${rotate}deg)` : 'none',
  animation: `${float} 6s ease-in-out infinite`,
  zIndex: 0,
}));

const GreenBlob = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '300px',
  height: '300px',
  borderRadius: '50%',
  background: '#4ECDC4',
  opacity: 0.3,
  top: '50%',
  right: '50%',
  transform: 'translate(50%, -50%)',
  zIndex: 0,
}));







const LoginButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4776E6, #8E54E9)',
  color: '#fff',
  fontWeight: 'bold',
  padding: '12px 30px',
  borderRadius: '30px',
  textTransform: 'none',
  fontSize: '16px',
  boxShadow: '0 8px 20px rgba(142, 84, 233, 0.3)',
  transition: 'all 0.3s ease',
  border: '2px solid transparent',
  '&:hover': {
    background: 'linear-gradient(45deg, #3A66D6, #7B46D9)',
    boxShadow: '0 10px 25px rgba(142, 84, 233, 0.4)',
    transform: 'translateY(-3px)',
  },
}));



const FeatureCard = styled(Paper)(({ theme, color, index }) => ({
  borderRadius: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  width: '180px',
  height: '180px',
  transition: 'all 0.3s ease',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  cursor: 'pointer',
  margin: '0 auto',
  border: `3px solid ${color}15`,
  boxShadow: `0 10px 25px ${color}25`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.03)',
    boxShadow: `0 15px 30px ${color}40`,
    background: `linear-gradient(135deg, white, ${color}10)`,
  },
}));

const FeatureIcon = styled(Box)(({ color }) => ({
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${color}, ${color}CC)`,
  color: '#fff',
  marginBottom: '16px',
  boxShadow: `0 8px 20px ${color}50`,
  border: '4px solid white',
  transition: 'all 0.3s ease',
  '& .MuiSvgIcon-root': {
    fontSize: '32px',
    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))',
  },
  '.feature-card:hover &': {
    transform: 'scale(1.1) rotate(5deg)',
  }
}));

const FeatureTitle = styled(Typography)(({ theme, color }) => ({
  fontSize: '18px',
  fontWeight: '800',
  color: '#333',
  marginTop: '10px',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40px',
    height: '3px',
    background: color || '#333',
    borderRadius: '2px',
  }
}));

const FeatureDescription = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  color: '#fff',
  lineHeight: 1.5,
  position: 'absolute',
  bottom: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '220px',
  background: 'linear-gradient(135deg, rgba(66, 99, 235, 0.95), rgba(87, 66, 235, 0.95))',
  padding: '14px',
  borderRadius: '12px',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  zIndex: 10,
  opacity: 0,
  visibility: 'hidden',
  transition: 'all 0.3s ease',
  pointerEvents: 'none',
  fontWeight: '500',
  textAlign: 'center',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    border: '8px solid transparent',
    borderTopColor: 'rgba(87, 66, 235, 0.95)',
  }
}));

const TooltipContainer = styled(Box)(({ isOpen }) => ({
  position: 'relative',
  '&:hover .feature-description, &.active .feature-description': {
    opacity: 1,
    visibility: 'visible',
    bottom: 'calc(100% + 15px)',
  },
}));

const FeatureCardsContainer = styled(Box)(({ theme }) => ({
  background: '#FFF8E1',
  padding: '40px 0 60px',
  borderRadius: '40px 40px 0 0',
  marginTop: '-20px',
  position: 'relative',
  zIndex: 1,
}));



const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  // Feature cards data
  const features = [
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

  // Decorative elements
  const decorativeElements = [
    { component: <BookIcon />, size: '80px', top: '15%', left: '5%', rotate: '15' },
    { component: <MenuBookIcon />, size: '60px', top: '20%', right: '10%', rotate: '-10' },
    { component: <AssignmentIcon />, size: '70px', bottom: '30%', left: '8%', rotate: '20' },
  ];

  return (
    <LoginContainer>
      <Header>
        <Logo>
          <SchoolIcon />
          YKS Çalışma Takip
        </Logo>
      </Header>
      
      <HeroSection>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 20px',
          position: 'relative',
          zIndex: 5
        }}>
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 800, 
              color: '#333',
              mb: 3,
              textAlign: 'center',
              position: 'relative',
              background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 10px rgba(0,0,0,0.05)',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100px',
                height: '6px',
                background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4)',
                borderRadius: '3px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }
            }}
          >
            YKS Çalışma Takip
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 500,
              color: '#444',
              mb: 5,
              maxWidth: '650px',
              lineHeight: 1.7,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              textAlign: 'center',
              padding: '15px 25px',
            }}
          >
            <Box component="span" sx={{ color: '#FF6B6B', fontWeight: 700, fontSize: '1.15em' }}>Pomodoro tekniği</Box> ve 
            <Box component="span" sx={{ color: '#4ECDC4', fontWeight: 700, fontSize: '1.15em' }}>analitik çalışma takibi</Box> ile 
            sınav başarınızı artırın. Düzenli çalışma ve detaylı istatistiklerle 
            performansınızı maksimum seviyeye çıkarın.
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            width: '100%',
            mb: 4
          }}>
            {loading ? (
              <CircularProgress size={36} sx={{ color: '#FF6B6B' }} />
            ) : (
              <LoginButton
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                size="large"
                sx={{ 
                  py: 1.5, 
                  px: 4,
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 20px rgba(255, 107, 107, 0.3)'
                }}
              >
                Google ile Giriş Yap
              </LoginButton>
            )}
          </Box>
        </Box>
        
        <HeroImageContainer>
          <GreenBlob />
          <BigLetterA>A</BigLetterA>
          
          {decorativeElements.map((element, index) => (
            <FloatingElement
              key={index}
              top={element.top}
              left={element.left}
              right={element.right}
              bottom={element.bottom}
              rotate={element.rotate}
              size={element.size}
            >
              {element.component}
            </FloatingElement>
          ))}
        </HeroImageContainer>
      </HeroSection>
      
      <FeatureCardsContainer>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={feature.title}>
                <TooltipContainer>
                  <FeatureCard 
                    elevation={0} 
                    color={feature.color} 
                    index={index}
                    onClick={() => {
                      // Tıklama işlevi burada eklenebilir
                      const card = document.getElementById(`feature-card-${index}`);
                      card.classList.toggle('active');
                    }}
                    id={`feature-card-${index}`}
                    className="feature-card"
                  >
                    <FeatureIcon color={feature.color}>
                      {feature.icon}
                    </FeatureIcon>
                    <FeatureTitle color={feature.color}>{feature.title}</FeatureTitle>
                  </FeatureCard>
                  <FeatureDescription className="feature-description">{feature.description}</FeatureDescription>
                </TooltipContainer>
              </Grid>
            ))}
          </Grid>
        </Container>
      </FeatureCardsContainer>
    </LoginContainer>
  );
};

export default Login;
