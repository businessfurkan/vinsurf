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
  fontWeight: 'bold',
  padding: '12px 30px',
  borderRadius: '30px',
  textTransform: 'none',
  fontSize: '16px',
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease',
  border: '2px solid transparent',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
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



const FeatureCard = styled(Paper)(({ theme, color, index }) => ({
  borderRadius: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  width: '100%',
  height: '100%',
  transition: 'all 0.3s ease',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  cursor: 'pointer',
  margin: '0 auto',
  border: `1px solid rgba(255, 255, 255, 0.18)`,
  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.15)`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.03)',
    boxShadow: `0 15px 30px rgba(0, 0, 0, 0.25)`,
    background: `rgba(255, 255, 255, 0.2)`,
  },
}));

const FeatureIcon = styled(Box)(({ color }) => ({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${color}, ${color}CC)`,
  color: 'white',
  marginBottom: '16px',
  boxShadow: `0 10px 20px ${color}40`,
  transition: 'all 0.3s ease',
  '& svg': {
    fontSize: '30px',
    transition: 'all 0.3s ease',
  },
  '.feature-card:hover &': {
    transform: 'scale(1.1) rotate(10deg)',
  }
}));

const FeatureTitle = styled(Typography)(({ color }) => ({
  fontSize: '16px',
  fontWeight: 600,
  color: 'white',
  position: 'relative',
  paddingBottom: '12px',
  transition: 'all 0.3s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40px',
    height: '3px',
    background: color || 'white',
    borderRadius: '2px',
    transition: 'all 0.3s ease',
  },
  '.feature-card:hover &': {
    letterSpacing: '0.5px',
  },
  '.feature-card:hover &::after': {
    width: '60px',
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
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  padding: '10px 15px',
  borderRadius: '8px',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
  opacity: 0,
  visibility: 'hidden',
  transition: 'all 0.3s ease',
  zIndex: 10,
  backdropFilter: 'blur(5px)',
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
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  padding: '40px 0 60px',
  borderRadius: '40px 40px 0 0',
  marginTop: '-20px',
  position: 'relative',
  zIndex: 1,
  boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderBottom: 'none',
}));



const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const card3DRef = useRef(null);
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
    
    card3DRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const resetCardRotation = () => {
    if (!card3DRef.current) return;
    card3DRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    setIsHovering(false);
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
      title: "RekaNET Sıralama",
      description: "Şehrindeki ve ülke genelindeki sıralamalarını anlık olarak takip et, hedeflerine ne kadar yaklaştığını gör.",
      icon: <TimelineIcon />,
      color: "#FF6B6B"
    },
    {
      title: "Benimle Çalış",
      description: "Canlı çalışma oturumlarına katıl, motivasyonunu artır ve disiplinli çalışma alışkanlığı kazan.",
      icon: <GroupsIcon />,
      color: "#4ECDC4"
    },
    {
      title: "SoruForum",
      description: "Zorlandığın soruları paylaş, uzman öğretmenlerden ve arkadaşlarından anında yardım al.",
      icon: <ForumIcon />,
      color: "#FF9F1C"
    },
    {
      title: "Deneme Takibi",
      description: "Deneme sınavı sonuçlarını grafiklerle analiz et, gelişim alanlarını belirle ve ilerleme kaydedilecek konuları tespit et.",
      icon: <BarChartIcon />,
      color: "#845EC2"
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
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    },
    { 
      component: <FloatingIcon color="#4ECDC4"><MenuBookIcon /></FloatingIcon>, 
      top: '25%', right: '15%',
      animate: { y: [0, -20, 0], rotate: [0, -5, 0] },
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
    },
    { 
      component: <FloatingIcon color="#FF9F1C"><AssignmentIcon /></FloatingIcon>, 
      bottom: '20%', left: '15%',
      animate: { y: [0, -25, 0], rotate: [0, 3, 0] },
      transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }
    },
    { 
      component: <FloatingIcon color="#845EC2"><BarChartIcon /></FloatingIcon>, 
      bottom: '25%', right: '10%',
      animate: { y: [0, -15, 0], rotate: [0, -3, 0] },
      transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
    },
  ];

  return (
    <LoginContainer>
      <AnimatedBackground />
      
      <Header>
        <Logo>
          <SchoolIcon />
          YKS Çalışma Takip
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
        
        {/* 3D Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ width: '100%', maxWidth: '500px', perspective: '1000px' }}
        >
          <Card3D
            ref={card3DRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={resetCardRotation}
            sx={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
          >
            <CardFront position="front">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 4
                }}>
                  <SchoolIcon sx={{ fontSize: 40, color: '#6a11cb', mr: 1 }} />
                  <Typography variant="h4" component="h1" sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(90deg, #6a11cb, #2575fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    YKS Çalışma Takip
                  </Typography>
                </Box>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Typography variant="h6" sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  color: '#555',
                  lineHeight: 1.6
                }}>
                  Sınav başarınızı artırmak için <Box component="span" sx={{ 
                    fontWeight: 700, 
                    color: '#6a11cb'
                  }}>yapay zeka destekli</Box> çalışma platformu
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                style={{ width: '100%' }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress sx={{ 
                      color: '#6a11cb',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      }
                    }} />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                    <LoginButton
                      variant="contained"
                      startIcon={<GoogleIcon />}
                      onClick={handleGoogleLogin}
                      color="google"
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Google ile Giriş Yap
                    </LoginButton>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      width: '100%', 
                      my: 2 
                    }}>
                      <Divider sx={{ flex: 1, borderColor: 'rgba(0,0,0,0.1)' }} />
                      <Typography sx={{ px: 2, color: '#666', fontSize: '0.9rem' }}>
                        veya
                      </Typography>
                      <Divider sx={{ flex: 1, borderColor: 'rgba(0,0,0,0.1)' }} />
                    </Box>
                    
                    <Button
                      variant="outlined"
                      onClick={() => setFlipped(true)}
                      sx={{
                        borderColor: '#6a11cb',
                        color: '#6a11cb',
                        borderRadius: '30px',
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#2575fc',
                          background: 'rgba(106, 17, 203, 0.05)',
                        }
                      }}
                    >
                      Özelliklerimizi Keşfedin
                    </Button>
                  </Box>
                )}
              </motion.div>
            </CardFront>
            
            <CardBack position="back">
              <Box sx={{ width: '100%' }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  mb: 3, 
                  textAlign: 'center',
                  color: 'white',
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  Platformumuzun Özellikleri
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2,
                  mb: 3 
                }}>
                  {features.map((feature, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(5px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.2)',
                        transform: 'translateX(5px)'
                      }
                    }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '10px',
                        background: feature.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        boxShadow: `0 5px 15px ${feature.color}80`
                      }}>
                        {feature.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
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
      
      <FeatureCardsContainer>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ 
            textAlign: 'center', 
            mb: 4, 
            color: 'white',
            fontWeight: 700,
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            Neler Sunuyoruz?
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={feature.title}>
                <TooltipContainer>
                  <FeatureCard 
                    elevation={0} 
                    color={feature.color} 
                    index={index}
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
