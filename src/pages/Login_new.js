import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Paper,
  CircularProgress,
  Divider,
  Container,
  Grid
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
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

// Enhanced animations
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled components
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

const AnimatedBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(45deg, #8e2de2, #4a00e0, #6a3093, #a044ff)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 15s ease infinite`,
  opacity: 0.8,
  zIndex: -1,
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  width: '100%',
  position: 'relative',
  zIndex: 5,
}));

const Logo = styled(Box)(({ theme }) => ({
  fontSize: '24px',
  fontWeight: 'bold',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: '8px',
    color: 'white',
  }
}));

const FloatingElement = styled(motion.div)(({ top, left, right, bottom, size }) => ({
  position: 'absolute',
  top,
  left,
  right,
  bottom,
  width: size || '80px',
  height: size || '80px',
  zIndex: 0,
  filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.15))',
}));

const FloatingIcon = styled(Box)(({ color }) => ({
  width: '100%',
  height: '100%',
  borderRadius: '20%',
  background: `linear-gradient(135deg, ${color}80, ${color})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  boxShadow: `0 10px 20px ${color}50`,
  '& svg': {
    fontSize: '40px',
  }
}));

// 3D Card Components
const Card3D = styled(Box)(({ theme }) => ({
  position: 'relative',
  transformStyle: 'preserve-3d',
  transition: 'transform 0.6s ease',
  width: '100%',
  height: '100%',
}));

const CardFace = styled(Box)(({ theme, position }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '20px',
  padding: '30px',
  transform: position === 'back' ? 'rotateY(180deg)' : 'rotateY(0)',
}));

const CardFront = styled(CardFace)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
}));

const CardBack = styled(CardFace)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
}));

const LoginButton = styled(Button)(({ theme, color }) => ({
  background: color === 'google' 
    ? 'linear-gradient(45deg, #4285F4, #34A853, #FBBC05, #EA4335)' 
    : 'linear-gradient(45deg, #6a11cb, #2575fc)',
  backgroundSize: color === 'google' ? '300% 300%' : '200% 200%',
  animation: `${gradientShift} 3s ease infinite`,
  color: '#fff',
  fontWeight: 600,
  borderRadius: '30px',
  padding: '10px 24px',
  fontSize: '16px',
  textTransform: 'none',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
    '&:before': {
      left: '100%',
      transition: 'all 0.5s ease',
    }
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
  }
}));

// Feature Card Components
const FeatureCard = styled(Paper)(({ theme, color, index }) => ({
  borderRadius: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  width: '100%',
  height: '140px',
  padding: '24px',
  background: `linear-gradient(135deg, ${color}90, ${color})`,
  marginBottom: '16px',
  boxShadow: `0 12px 24px ${color}40`,
  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  '& svg': {
    fontSize: '36px',
    transition: 'all 0.3s ease',
  },
  '.feature-card:hover &': {
    transform: 'scale(1.05) translateY(-8px)',
    boxShadow: `0 18px 30px ${color}60`,
  }
}));

const FeatureIcon = styled(Box)(({ color }) => ({
  width: '70px',
  height: '70px',
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${color}, ${color}CC)`,
  color: 'white',
  marginBottom: '16px',
  boxShadow: `0 10px 20px ${color}40`,
  transition: 'all 0.3s ease',
  '& svg': {
    fontSize: '36px',
    transition: 'all 0.3s ease',
  },
  '.feature-card:hover &': {
    transform: 'scale(1.1) rotate(5deg)',
  }
}));

const FeatureTitle = styled(Typography)(({ color }) => ({
  fontSize: '16px',
  fontWeight: 600,
  color: 'white',
  position: 'relative',
  paddingBottom: '12px',
  transition: 'all 0.3s ease',
  letterSpacing: '0.5px',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '30px',
    height: '2px',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'white',
  },
  '.feature-card:hover &': {
    letterSpacing: '0.5px',
  },
  '.feature-card:hover &::after': {
    width: '60px',
    background: 'white',
  }
}));

const FeatureDescription = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 'calc(100% + 10px)',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '8px',
  opacity: 0,
  visibility: 'hidden',
  transition: 'all 0.3s ease',
  width: '200px',
  maxWidth: '100%',
  zIndex: 10,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    borderWidth: '8px',
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.8) transparent transparent transparent',
  },
}));

const TooltipContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  '&:hover .feature-description': {
    opacity: 1,
    visibility: 'visible',
    bottom: 'calc(100% + 15px)',
  },
}));

const FeatureCardsContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.9), rgba(37, 117, 252, 0.9))',
  width: '100%',
  padding: '40px 0 60px',
  borderRadius: '30px',
  marginTop: '20px',
  marginBottom: '30px',
  position: 'relative',
  zIndex: 1,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  maxWidth: '1200px',
  marginLeft: 'auto',
  marginRight: 'auto',
}));

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const card3DRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // Handle 3D effect on mouse move
  const handleMouseMove = (e) => {
    if (!card3DRef.current || !isHovering) return;
    
    const rect = card3DRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    setRotation({ x: rotateX, y: rotateY });
    
    card3DRef.current.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
  };
  
  const resetCardRotation = () => {
    if (!card3DRef.current) return;
    setIsHovering(false);
    card3DRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
  };
  
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

  // Feature cards data with enhanced descriptions
  const features = [
    {
      title: "RekaNet Sıralama",
      description: "Şehrindeki ve ülke genelindeki sıralamalarını anlık olarak takip et, hedeflerine ne kadar yaklaştığını gör.",
      icon: <BarChartIcon />,
      color: "#FF5252"
    },
    {
      title: "Benimle Çalış",
      description: "Arkadaşlarınla birlikte çalışarak motivasyonunu artır, daha verimli çalışma seansları oluştur.",
      icon: <GroupsIcon />,
      color: "#448AFF"
    },
    {
      title: "SoruForum",
      description: "Takıldığın soruları paylaş, diğer öğrencilerden ve öğretmenlerden hızlı yanıtlar al.",
      icon: <ForumIcon />,
      color: "#FF9800"
    },
    {
      title: "Deneme Takibi",
      description: "Deneme sınavlarındaki performansını analiz et, güçlü ve zayıf yönlerini keşfet.",
      icon: <TimelineIcon />,
      color: "#9C27B0"
    },
    {
      title: "Konu Analizi",
      description: "Hangi konuya ne kadar çalıştığını görsel grafiklerle takip et, zaman yönetimini optimize et.",
      icon: <PieChartIcon />,
      color: "#00B8A9"
    }
  ];

  // Animated floating elements
  const floatingElements = [
    { 
      component: <FloatingIcon color="#FF6B6B"><BookIcon /></FloatingIcon>, 
      top: '15%', left: '10%', 
      animate: { y: [0, -30, 0], rotate: [0, 5, 0] },
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    { 
      component: <FloatingIcon color="#4ECDC4"><MenuBookIcon /></FloatingIcon>, 
      top: '25%', right: '15%',
      animate: { y: [0, -20, 0], rotate: [0, -5, 0] },
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
    },
    { 
      component: <FloatingIcon color="#FFD166"><AssignmentIcon /></FloatingIcon>, 
      bottom: '25%', right: '10%',
      animate: { y: [0, -15, 0], rotate: [0, -3, 0] },
      transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
    },
  ];

  return (
    <LoginContainer>
      <AnimatedBackground />
      
      <Header sx={{ padding: '24px 40px' }}>
        <Logo>
          <SchoolIcon sx={{ fontSize: '28px', marginRight: '12px' }} />
          YKS Hazırlık
        </Logo>
      </Header>
      
      <Box sx={{ 
        position: 'relative', 
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: { xs: '20px', md: '40px' },
        overflow: 'hidden'
      }}>
        {/* Floating Elements */}
        {floatingElements.map((element, index) => (
          <FloatingElement
            key={index}
            top={element.top}
            left={element.left}
            right={element.right}
            bottom={element.bottom}
            animate={element.animate}
            transition={element.transition}
          >
            {element.component}
          </FloatingElement>
        ))}
        
        {/* Feature Cards Section - Moved Up */}
        <FeatureCardsContainer>
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ 
              textAlign: 'center', 
              mb: 4, 
              color: 'white',
              fontWeight: 800,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              fontSize: { xs: '1.7rem', sm: '2rem', md: '2.3rem' },
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '4px',
                background: 'linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)',
                borderRadius: '2px'
              }
            }}>
              Neler Sunuyoruz?
            </Typography>
            
            <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
              {features.map((feature, index) => (
                <Grid item xs={6} sm={4} md={2.4} key={feature.title}>
                  <TooltipContainer>
                    <FeatureCard 
                      elevation={0} 
                      color={feature.color} 
                      index={index}
                      id={`feature-card-${index}`}
                      className="feature-card"
                      sx={{
                        transform: 'scale(0.95)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        '&:hover': {
                          transform: 'scale(1) translateY(-5px)',
                          boxShadow: `0 15px 30px ${feature.color}40`
                        }
                      }}
                    >
                      <FeatureIcon color={feature.color} sx={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '18px',
                        mb: 2
                      }}>
                        {feature.icon}
                      </FeatureIcon>
                      <FeatureTitle color={feature.color} sx={{
                        fontSize: '1.1rem',
                        fontWeight: 700
                      }}>
                        {feature.title}
                      </FeatureTitle>
                    </FeatureCard>
                    <FeatureDescription 
                      className="feature-description"
                      sx={{
                        padding: '12px 15px',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        fontWeight: 500
                      }}
                    >
                      {feature.description}
                    </FeatureDescription>
                  </TooltipContainer>
                </Grid>
              ))}
            </Grid>
          </Container>
        </FeatureCardsContainer>
        
        {/* 3D Login Card - Moved Down */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%',
          marginTop: '-40px',
          position: 'relative',
          zIndex: 2
        }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ width: '100%', maxWidth: '400px', perspective: '1000px' }}
          >
            <Card3D
              ref={card3DRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={resetCardRotation}
              sx={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
            >
              <CardFront position="front">
                <Box sx={{ 
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 3
                }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 800, 
                    color: '#2a5956',
                    textAlign: 'center',
                    marginBottom: '10px',
                    fontSize: { xs: '1.8rem', sm: '2.2rem' },
                    fontFamily: 'Poppins, Montserrat, sans-serif',
                  }}>
                    YKS Hazırlık
                  </Typography>
                  
                  <Typography variant="body1" sx={{ 
                    color: '#555', 
                    textAlign: 'center',
                    maxWidth: '80%',
                    marginBottom: '20px',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                  }}>
                    YKS hazırlık sürecinde ihtiyacın olan her şey tek bir platformda.
                  </Typography>
                  
                  <LoginButton 
                    color="google"
                    variant="contained"
                    startIcon={loading ? null : <GoogleIcon />}
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    sx={{ width: '100%', py: 1.5 }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Google ile Giriş Yap"
                    )}
                  </LoginButton>
                  
                  <Divider sx={{ width: '100%', my: 2, color: '#aaa' }}>
                    <Typography variant="body2" sx={{ px: 1, color: '#777' }}>
                      veya
                    </Typography>
                  </Divider>
                  
                  <Button
                    variant="outlined"
                    onClick={() => setFlipped(true)}
                    sx={{
                      borderRadius: '30px',
                      py: 1.5,
                      width: '100%',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#6a11cb',
                      color: '#6a11cb',
                      '&:hover': {
                        borderColor: '#6a11cb',
                        background: 'rgba(106, 17, 203, 0.05)',
                      }
                    }}
                  >
                    Özelliklerimizi Keşfet
                  </Button>
                </Box>
              </CardFront>
              
              <CardBack position="back">
                <Box sx={{ 
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: '10px',
                  }}>
                    Özelliklerimiz
                  </Typography>
                  
                  <Box sx={{ width: '100%', mb: 2 }}>
                    {features.map((feature, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mb: 1.5,
                        p: 1.5,
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(5px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.2)',
                          transform: 'translateX(5px)',
                        }
                      }}>
                        <Box sx={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: feature.color,
                          mr: 2
                        }}>
                          {feature.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 600, 
                            color: 'white',
                            fontSize: '0.9rem',
                          }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  
                  <Button
                    variant="contained"
                    onClick={() => setFlipped(false)}
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(5px)',
                      color: 'white',
                      borderRadius: '30px',
                      py: 1.5,
                      width: '100%',
                      textTransform: 'none',
                      fontWeight: 600,
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.3)',
                      }
                    }}
                  >
                    Giriş Ekranına Dön
                  </Button>
                </Box>
              </CardBack>
            </Card3D>
          </motion.div>
        </Box>
      </Box>
    </LoginContainer>
  );
};

export default Login;
