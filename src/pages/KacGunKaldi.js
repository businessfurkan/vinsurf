/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Box, Typography, Paper, Grid, 
  Card, CardContent, useTheme, alpha 
} from '@mui/material';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { 
  AccessTime as AccessTimeIcon,
  EmojiEvents as EmojiEventsIcon,
  CalendarToday as CalendarTodayIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';

const KacGunKaldi = () => {
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // YKS 2026 tarihi - Haziran 2026'nın ilk cumartesi ve pazar günleri (varsayılan olarak 6-7 Haziran 2026)
  const targetDate = new Date('2026-06-06T10:00:00');
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]); // targetDate bağımlılığını ekledim
  
  // Motivasyon mesajları
  const motivationalMessages = [
    "Her gün bir adım daha yakınsın!",
    "Bugünün çalışması, yarının başarısı!",
    "Hedefine odaklan, başarı senin olacak!",
    "Zorluklar geçici, başarı kalıcıdır!",
    "Kendine inan, yapabilirsin!",
    "Disiplin, özgürlüğün yoludur!",
    "Bugün yaptığın fedakarlık, yarın gülümsemene neden olacak!",
    "Vazgeçme, her şey güzel olacak!",
    "Başarı, küçük adımların toplamıdır!",
    "Şimdi çalış, sonra kutla!"
  ];
  
  // Rastgele motivasyon mesajı seç
  const [motivationalMessage, setMotivationalMessage] = useState('');
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    setMotivationalMessage(motivationalMessages[randomIndex]);
    
    // Her 10 saniyede bir mesajı değiştir
    const messageInterval = setInterval(() => {
      const newIndex = Math.floor(Math.random() * motivationalMessages.length);
      setMotivationalMessage(motivationalMessages[newIndex]);
    }, 10000);
    
    return () => clearInterval(messageInterval);
  }, [motivationalMessages]); // motivationalMessages bağımlılığını ekledim
  
  // Renk paleti
  const colors = {
    days: theme.palette.primary.main,
    hours: theme.palette.secondary.main,
    minutes: theme.palette.success.main,
    seconds: theme.palette.warning.main
  };
  
  // Animasyon efekti için
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimate(prev => !prev);
    }, 500);
    
    return () => clearInterval(animationInterval);
  }, []);
  
  // Yorum ve motivasyon mesajları
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [name, setName] = useState('');
  const [showComments, setShowComments] = useState(false);
  
  // Yorumları Firestore'dan çek - useCallback ile sarmalıyorum
  const fetchComments = useCallback(async () => {
    try {
      const commentsQuery = query(
        collection(db, 'motivationComments'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const commentSnapshot = await getDocs(commentsQuery);
      const commentsList = commentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsList);
    } catch (error) {
      console.error('Yorumlar yüklenirken hata oluştu:', error);
    }
  }, []);
  
  // Sayfa yüklendiğinde yorumları çek
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, fetchComments]);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper 
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.secondary.light, 0.2)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,154,139,0.2) 0%, transparent 70%)',
            zIndex: 0
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(199,206,234,0.2) 0%, transparent 70%)',
            zIndex: 0
          }
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: theme.palette.primary.main, position: 'relative', zIndex: 1 }}>
          <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          YKS 2026&apos;ya Kalan Süre
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
          Hedefine ulaşmak için her saniyeyi değerlendir!
        </Typography>
      </Paper>
      
      <Box sx={{ position: 'relative', mb: 6, display: 'flex', flexDirection: 'column' }}>
        {/* Moved the date information to the right side */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          mb: 2,
          mr: 2
        }}>
          <Paper 
            elevation={3} 
            sx={{ 
              py: 1, 
              px: 3, 
              borderRadius: 5,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              animation: animate ? 'pulse 1.5s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' }
              }
            }}
          >
            <AccessTimeIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              YKS 2026: 6-7 Haziran 2026
            </Typography>
          </Paper>
        </Box>
        
        {/* Redesigned countdown timer - more horizontal and centered */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            mt: 4,
            mb: 5,
            position: 'relative'
          }}
        >
          <Paper
            elevation={5}
            sx={{
              borderRadius: 6,
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.05)} 0%, ${alpha(theme.palette.secondary.dark, 0.05)} 100%)`,
              backdropFilter: 'blur(10px)',
              boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.15)}`,
              position: 'relative',
              p: 1,
              maxWidth: 900,
              width: '100%',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 80%)',
                zIndex: 0
              }
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'stretch',
                position: 'relative',
                zIndex: 1,
                p: { xs: 1, sm: 2 }
              }}
            >
              {/* DAYS */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 1, sm: 2, md: 3 },
                  position: 'relative',
                  flex: 1,
                  maxWidth: 200
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(135deg, ${colors.days} 0%, ${alpha(colors.days, 0.8)} 100%)`,
                    borderRadius: 4,
                    p: { xs: 1.5, sm: 2, md: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at top left, rgba(255,255,255,0.3) 0%, transparent 70%)',
                      zIndex: 0
                    }
                  }}
                >
                  <Typography 
                    variant="h2" 
                    component="div" 
                    sx={{ 
                      fontWeight: 800, 
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      position: 'relative',
                      zIndex: 1,
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }
                    }}
                  >
                    {timeLeft.days}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, position: 'relative', zIndex: 1 }}>
                    <CalendarTodayIcon sx={{ mr: 0.5, color: 'white' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                      GÜN
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              {/* HOURS */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 1, sm: 2, md: 3 },
                  position: 'relative',
                  flex: 1,
                  maxWidth: 200
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(135deg, ${colors.hours} 0%, ${alpha(colors.hours, 0.8)} 100%)`,
                    borderRadius: 4,
                    p: { xs: 1.5, sm: 2, md: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at top right, rgba(255,255,255,0.3) 0%, transparent 70%)',
                      zIndex: 0
                    }
                  }}
                >
                  <Typography 
                    variant="h2" 
                    component="div" 
                    sx={{ 
                      fontWeight: 800, 
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      position: 'relative',
                      zIndex: 1,
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }
                    }}
                  >
                    {timeLeft.hours}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, position: 'relative', zIndex: 1 }}>
                    <AccessTimeIcon sx={{ mr: 0.5, color: 'white' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                      SAAT
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              {/* MINUTES */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 1, sm: 2, md: 3 },
                  position: 'relative',
                  flex: 1,
                  maxWidth: 200
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(135deg, ${colors.minutes} 0%, ${alpha(colors.minutes, 0.8)} 100%)`,
                    borderRadius: 4,
                    p: { xs: 1.5, sm: 2, md: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at bottom left, rgba(255,255,255,0.3) 0%, transparent 70%)',
                      zIndex: 0
                    }
                  }}
                >
                  <Typography 
                    variant="h2" 
                    component="div" 
                    sx={{ 
                      fontWeight: 800, 
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      position: 'relative',
                      zIndex: 1,
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }
                    }}
                  >
                    {timeLeft.minutes}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, position: 'relative', zIndex: 1 }}>
                    <EmojiEventsIcon sx={{ mr: 0.5, color: 'white' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                      DAKİKA
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              {/* SECONDS */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 1, sm: 2, md: 3 },
                  position: 'relative',
                  flex: 1,
                  maxWidth: 200
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(135deg, ${colors.seconds} 0%, ${alpha(colors.seconds, 0.8)} 100%)`,
                    borderRadius: 4,
                    p: { xs: 1.5, sm: 2, md: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at top right, rgba(255,255,255,0.3) 0%, transparent 70%)',
                      zIndex: 0
                    }
                  }}
                >
                  <Typography 
                    variant="h2" 
                    component="div" 
                    sx={{ 
                      fontWeight: 800, 
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      position: 'relative',
                      zIndex: 1,
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }
                    }}
                  >
                    {timeLeft.seconds}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, position: 'relative', zIndex: 1 }}>
                    <CelebrationIcon sx={{ mr: 0.5, color: 'white' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                      SANİYE
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
      
      <Box sx={{ mt: 6 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            textAlign: 'center',
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.2)} 0%, ${alpha(theme.palette.success.light, 0.2)} 100%)`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)',
              zIndex: 0
            }
          }}
        >
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.primary.dark,
              position: 'relative',
              zIndex: 1,
              animation: 'fadeIn 2s infinite alternate',
              '@keyframes fadeIn': {
                '0%': { opacity: 0.7 },
                '100%': { opacity: 1 }
              }
            }}
          >
            {motivationalMessage}
          </Typography>
        </Paper>
      </Box>
      
      <Box sx={{ mt: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Zamanını Verimli Kullan
                </Typography>
                <Typography variant="body1" paragraph>
                  YKS&apos;ye kalan süreyi en iyi şekilde değerlendirmek için her gün düzenli çalışma planı yap. 
                  Konuları parçalara bölerek öğren ve düzenli tekrarlarla kalıcı hale getir.
                </Typography>
                <Typography variant="body1">
                  Unutma, başarı disiplinli ve düzenli çalışmanın sonucudur!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                  Motivasyonunu Yüksek Tut
                </Typography>
                <Typography variant="body1" paragraph>
                  Zaman zaman motivasyonun düşebilir, bu normal. Kendine küçük hedefler koy ve 
                  başardıkça kendini ödüllendir. Başarı hikayelerini oku ve hedefini sürekli hatırla.
                </Typography>
                <Typography variant="body1">
                  İnanmak, başarmanın yarısıdır!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default KacGunKaldi;
