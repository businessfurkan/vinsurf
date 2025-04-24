import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Grid,
  IconButton,
  Tooltip,
  Zoom,
  Fade,
  Slide,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import YouTubeIcon from '@mui/icons-material/YouTube';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import RefreshIcon from '@mui/icons-material/Refresh';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';

const BenimleCalis = () => {
  // useAuthState hook'u ileride kullanılabilir, şimdilik yorum satırına alıyoruz
  // const [user] = useAuthState(auth);
  const [liveStreamLink, setLiveStreamLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [studyPlan, setStudyPlan] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fetch live stream link from Firestore
  useEffect(() => {
    const fetchLiveStreamLink = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'appSettings', 'liveStream');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setLiveStreamLink(docSnap.data().youtubeLink || '');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching live stream link:', error);
        setError('Canlı yayın bilgileri yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchLiveStreamLink();
  }, []);

  // Function to trigger confetti effect
  const triggerConfetti = () => {
    setShowConfetti(true);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setTimeout(() => {
      setShowConfetti(false);
    }, 2000);
  };

  // Extract video ID from YouTube URL
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    
    let videoId = '';
    
    // Regular YouTube URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      videoId = match[2];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    
    // YouTube Live URL
    const liveRegExp = /^.*(youtube.com\/live\/)([^#&?]*).*/;
    const liveMatch = url.match(liveRegExp);
    
    if (liveMatch && liveMatch[2]) {
      return `https://www.youtube.com/embed/live_stream?channel=${liveMatch[2]}&autoplay=1`;
    }
    
    return url; // Return original URL if no match
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 }, 
      maxWidth: 1200, 
      mx: 'auto',
      minHeight: '90vh',
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(142, 36, 170, 0.05) 0%, rgba(142, 36, 170, 0.02) 90%)'
    }}>
      {/* Snackbar notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
        >
          Çalışma planınız kaydedildi!
        </Alert>
      </Snackbar>

      {/* Animated background elements */}
      <Box sx={{ 
        position: 'absolute', 
        top: -100, 
        right: -100, 
        width: 300, 
        height: 300, 
        borderRadius: '50%', 
        background: 'radial-gradient(circle, rgba(142, 36, 170, 0.1) 0%, rgba(142, 36, 170, 0) 70%)',
        zIndex: -1
      }} />
      
      <Box sx={{ 
        position: 'absolute', 
        bottom: -100, 
        left: -100, 
        width: 250, 
        height: 250, 
        borderRadius: '50%', 
        background: 'radial-gradient(circle, rgba(142, 36, 170, 0.08) 0%, rgba(142, 36, 170, 0) 70%)',
        zIndex: -1
      }} />
      
      {/* Animated Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, overflow: 'hidden' }}>
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <HandshakeIcon 
            sx={{ 
              fontSize: 60, 
              color: '#8E24AA',
              mr: 2,
              filter: 'drop-shadow(0 4px 6px rgba(142, 36, 170, 0.3))'
            }} 
          />
        </Zoom>
        <Box>
          <Slide direction="down" in={true} mountOnEnter unmountOnExit style={{ transitionDelay: '200ms' }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                color: '#8E24AA',
                textShadow: '2px 2px 4px rgba(142, 36, 170, 0.2)',
                lineHeight: 1.2
              }}
            >
              Benimle Çalış
            </Typography>
          </Slide>
          <Fade in={true} style={{ transitionDelay: '400ms' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: alpha('#8E24AA', 0.8),
                fontWeight: 500
              }}
            >
              Canlı yayında birlikte çalışalım!
            </Typography>
          </Fade>
        </Box>
      </Box>
      
      {/* Main content */}
      <Grid container spacing={4} sx={{ animation: 'fadeIn 0.8s ease-out' }}>
        {/* Style etiketini normal React stiline dönüştürüyoruz */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes ripple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(2.5); opacity: 0; }
          }
        `}</style>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 0, 
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid rgba(142, 36, 170, 0.2)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 400,
                flexDirection: 'column',
                gap: 2
              }}>
                <CircularProgress sx={{ color: '#8E24AA' }} />
                <Typography variant="body1" color="text.secondary">
                  Canlı yayın bilgileri yükleniyor...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 400,
                flexDirection: 'column',
                gap: 2
              }}>
                <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => window.location.reload()}
                  startIcon={<RefreshIcon />}
                >
                  Yeniden Dene
                </Button>
              </Box>
            ) : !liveStreamLink ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 400,
                flexDirection: 'column',
                gap: 2,
                p: 4,
                textAlign: 'center'
              }}>
                <LiveTvIcon sx={{ fontSize: 60, color: alpha('#8E24AA', 0.6), mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2e3856', mb: 1 }}>
                  Şu anda aktif bir canlı yayın bulunmuyor
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
                  Canlı yayın başladığında burada görüntülenecektir. Daha sonra tekrar kontrol edin.
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: alpha('#8E24AA', 0.1),
                  borderBottom: '1px solid rgba(142, 36, 170, 0.2)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LiveTvIcon sx={{ color: '#f44336', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2e3856' }}>
                      Canlı Yayın
                    </Typography>
                  </Box>
                  <Tooltip title="YouTube'da Aç">
                    <IconButton 
                      color="error" 
                      component="a" 
                      href={liveStreamLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <YouTubeIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ flexGrow: 1, position: 'relative', paddingTop: '56.25%' }}>
                  <iframe
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    src={getYoutubeEmbedUrl(liveStreamLink)}
                    title="YouTube Canlı Yayın"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 4,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid rgba(142, 36, 170, 0.2)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              pb: 2,
              borderBottom: '1px solid rgba(142, 36, 170, 0.1)'
            }}>
              <EmojiPeopleIcon sx={{ color: '#8E24AA', mr: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e3856' }}>
                Birlikte Çalışalım
              </Typography>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 3, color: '#424242' }}>
              Canlı yayınlarımızda birlikte çalışarak verimli ders çalışma alışkanlıkları kazanabilirsiniz. Aşağıdaki özelliklerden yararlanabilirsiniz:
            </Typography>

            {/* Ders çalışma planı giriş alanı */}
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: 'rgba(142, 36, 170, 0.05)',
              border: '1px solid rgba(142, 36, 170, 0.1)'
            }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#2e3856' }}>
                Bugün hangi derslere çalışacaksınız?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="Örn: Matematik (2 saat), Fizik (1 saat), TYT Denemesi..."
                value={studyPlan}
                onChange={(e) => setStudyPlan(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(142, 36, 170, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(142, 36, 170, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8E24AA',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: '#8E24AA',
                  '&:hover': {
                    backgroundColor: '#6A1B9A',
                  },
                  textTransform: 'none',
                }}
                onClick={() => setSnackbarOpen(true)}
                disabled={!studyPlan.trim()}
              >
                Kaydet
              </Button>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#8E24AA', 
                    mr: 2 
                  }} 
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Canlı soru-cevap imkanı
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#8E24AA', 
                    mr: 2 
                  }} 
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Pomodoro tekniği ile çalışma
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#8E24AA', 
                    mr: 2 
                  }} 
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Motivasyon ve odaklanma teknikleri
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#8E24AA', 
                    mr: 2 
                  }} 
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Birlikte soru çözümleri
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 'auto', pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  backgroundColor: '#8E24AA',
                  '&:hover': {
                    backgroundColor: '#6A1B9A',
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': showConfetti ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                    opacity: 0.6,
                    animation: 'ripple 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  } : {}
                }}
                onClick={triggerConfetti}
              >
                Hadi Başlayalım!
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  borderColor: '#8E24AA',
                  color: '#8E24AA',
                  '&:hover': {
                    borderColor: '#6A1B9A',
                    backgroundColor: alpha('#8E24AA', 0.05)
                  },
                  textTransform: 'none',
                  fontWeight: 600
                }}
                component="a"
                href="https://www.youtube.com/@businessfurkan"
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube Kanalına Git
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BenimleCalis;
