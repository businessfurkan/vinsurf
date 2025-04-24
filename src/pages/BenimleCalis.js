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
// alpha fonksiyonu artık kullanılmadığı için import kaldırıldı
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
      backgroundImage: 'linear-gradient(135deg, rgba(142, 36, 170, 0.08) 0%, rgba(97, 97, 255, 0.08) 100%)',
      borderRadius: 4,
      boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
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
          icon={<Box 
            sx={{ 
              width: 22, 
              height: 22, 
              borderRadius: '50%', 
              backgroundColor: '#4CAF50',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            ✔
          </Box>}
          sx={{ 
            width: '100%', 
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            '& .MuiAlert-message': {
              fontWeight: 500,
              color: '#2e3856',
            }
          }}
        >
          Çalışma planınız başarıyla kaydedildi!
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
        background: 'radial-gradient(circle, rgba(142, 36, 170, 0.15) 0%, rgba(142, 36, 170, 0) 70%)',
        filter: 'blur(20px)',
        animation: 'pulse 15s infinite alternate',
        zIndex: -1
      }} />
      <Box sx={{ 
        position: 'absolute', 
        bottom: -150, 
        left: -150, 
        width: 400, 
        height: 400, 
        borderRadius: '50%', 
        background: 'radial-gradient(circle, rgba(97, 97, 255, 0.12) 0%, rgba(97, 97, 255, 0) 70%)',
        filter: 'blur(25px)',
        animation: 'pulse 20s infinite alternate-reverse',
        zIndex: -1
      }} />
      <Box sx={{ 
        position: 'absolute', 
        top: '40%', 
        left: '20%', 
        width: 200, 
        height: 200, 
        borderRadius: '50%', 
        background: 'radial-gradient(circle, rgba(255, 152, 0, 0.08) 0%, rgba(255, 152, 0, 0) 70%)',
        filter: 'blur(15px)',
        animation: 'float 25s infinite ease-in-out',
        zIndex: -1
      }} />
      
      {/* Animated Title with gradient background */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center', 
          mb: 4, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.15) 0%, rgba(97, 97, 255, 0.15) 100%)',
          borderRadius: 4,
          p: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8E24AA 0%, #6A1B9A 100%)',
              mr: { xs: 0, sm: 3 },
              mb: { xs: 2, sm: 0 },
              boxShadow: '0 10px 20px rgba(142, 36, 170, 0.3)'
            }}
          >
            <HandshakeIcon 
              sx={{ 
                fontSize: 40, 
                color: '#fff',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
              }} 
            />
          </Box>
        </Zoom>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Slide direction="down" in={true} mountOnEnter unmountOnExit style={{ transitionDelay: '200ms' }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #8E24AA 0%, #6A1B9A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(142, 36, 170, 0.2)',
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
                color: '#424242',
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
          @keyframes pulse {
            0% { opacity: 0.5; transform: scale(1); }
            100% { opacity: 0.8; transform: scale(1.1); }
          }
          @keyframes float {
            0% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-15px) translateX(15px); }
            50% { transform: translateY(0px) translateX(30px); }
            75% { transform: translateY(15px) translateX(15px); }
            100% { transform: translateY(0px) translateX(0px); }
          }
        `}</style>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 0, 
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              border: '1px solid rgba(142, 36, 170, 0.2)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,1))',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              }
            }}
          >
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 400,
                flexDirection: 'column',
                gap: 2,
                background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.03) 0%, rgba(97, 97, 255, 0.03) 100%)'
              }}>
                <Box sx={{ 
                  position: 'relative',
                  width: 60,
                  height: 60,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Box sx={{ 
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '3px solid rgba(142, 36, 170, 0.2)',
                    borderTopColor: '#8E24AA',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <CircularProgress size={40} sx={{ color: '#8E24AA' }} />
                </Box>
                <Typography variant="body1" sx={{ color: '#555', fontWeight: 500 }}>
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
                gap: 2,
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(255, 152, 0, 0.05) 100%)'
              }}>
                <Box sx={{ 
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  mb: 1
                }}>
                  <Typography variant="h4" color="error">
                    !
                  </Typography>
                </Box>
                <Typography variant="h6" color="error" sx={{ mb: 1, fontWeight: 600 }}>
                  {error}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center', maxWidth: 400 }}>
                  Bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => window.location.reload()}
                  startIcon={<RefreshIcon />}
                  sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 10px rgba(142, 36, 170, 0.3)',
                    background: 'linear-gradient(45deg, #8E24AA 0%, #6A1B9A 100%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #6A1B9A 0%, #4A148C 100%)'
                    }
                  }}
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
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.03) 0%, rgba(97, 97, 255, 0.03) 100%)'
              }}>
                <Box sx={{ 
                  width: 100,
                  height: 100,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.1) 0%, rgba(97, 97, 255, 0.1) 100%)',
                  mb: 2,
                  animation: 'pulse 2s infinite ease-in-out'
                }}>
                  <LiveTvIcon sx={{ fontSize: 50, color: '#8E24AA' }} />
                </Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: '#2e3856', 
                  mb: 1,
                  background: 'linear-gradient(135deg, #2e3856 0%, #424242 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Şu anda aktif bir canlı yayın bulunmuyor
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#555', 
                  maxWidth: 500,
                  lineHeight: 1.6
                }}>
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
                  background: 'linear-gradient(to right, rgba(142, 36, 170, 0.15), rgba(97, 97, 255, 0.15))',
                  borderBottom: '1px solid rgba(142, 36, 170, 0.2)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      backgroundColor: '#f44336',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mr: 2,
                      boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)'
                    }}>
                      <LiveTvIcon sx={{ color: '#fff', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2e3856', lineHeight: 1.2 }}>
                        Canlı Yayın
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Şimdi yayında
                      </Typography>
                    </Box>
                  </Box>
                  <Tooltip title="YouTube'da Aç">
                    <IconButton 
                      color="error" 
                      component="a" 
                      href={liveStreamLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,1)',
                        }
                      }}
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
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              border: '1px solid rgba(142, 36, 170, 0.2)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,1))',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              pb: 2,
              borderBottom: '1px solid rgba(142, 36, 170, 0.1)'
            }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #8E24AA 0%, #6A1B9A 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mr: 2,
                boxShadow: '0 4px 10px rgba(142, 36, 170, 0.3)'
              }}>
                <EmojiPeopleIcon sx={{ color: '#fff', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: '#2e3856',
                background: 'linear-gradient(135deg, #2e3856 0%, #424242 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Birlikte Çalışalım
              </Typography>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 3, color: '#424242' }}>
              Canlı yayınlarımızda birlikte çalışarak verimli ders çalışma alışkanlıkları kazanabilirsiniz. Aşağıdaki özelliklerden yararlanabilirsiniz:
            </Typography>

            {/* Ders çalışma planı giriş alanı */}
            <Box sx={{ 
              mb: 3, 
              p: 3, 
              borderRadius: 3, 
              background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.08) 0%, rgba(97, 97, 255, 0.08) 100%)',
              border: '1px solid rgba(142, 36, 170, 0.15)',
              boxShadow: '0 5px 15px rgba(142, 36, 170, 0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -30, 
                  right: -30, 
                  width: 100, 
                  height: 100, 
                  borderRadius: '50%', 
                  background: 'radial-gradient(circle, rgba(142, 36, 170, 0.1) 0%, rgba(142, 36, 170, 0) 70%)',
                  zIndex: 0
                }} 
              />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 24, 
                      borderRadius: 1, 
                      background: 'linear-gradient(to bottom, #8E24AA, #6A1B9A)', 
                      mr: 2 
                    }} 
                  />
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#2e3856',
                      background: 'linear-gradient(135deg, #2e3856 0%, #424242 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Bugün hangi derslere çalışacaksınız?
                  </Typography>
                </Box>
                
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
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(142, 36, 170, 0.2)',
                        borderWidth: 2,
                        borderRadius: 1,
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(142, 36, 170, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8E24AA',
                        borderWidth: 2,
                      },
                    },
                  }}
                />
                
                <Button
                  variant="contained"
                  size="medium"
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 3,
                    background: 'linear-gradient(45deg, #8E24AA 0%, #6A1B9A 100%)',
                    boxShadow: '0 4px 10px rgba(142, 36, 170, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #6A1B9A 0%, #4A148C 100%)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(45deg, #bdbdbd 0%, #9e9e9e 100%)',
                      color: 'rgba(255,255,255,0.6)',
                    },
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                  onClick={() => setSnackbarOpen(true)}
                  disabled={!studyPlan.trim()}
                  startIcon={<Box 
                    component="span" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      animation: !studyPlan.trim() ? 'none' : 'pulse 1.5s infinite'
                    }}
                  >
                    ✔
                  </Box>}
                >
                  Kaydet
                </Button>
              </Box>
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
            
            <Box sx={{ mt: 'auto', pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 3,
                  py: 2,
                  background: 'linear-gradient(45deg, #8E24AA 0%, #6A1B9A 100%)',
                  boxShadow: '0 8px 20px rgba(142, 36, 170, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #6A1B9A 0%, #4A148C 100%)',
                    boxShadow: '0 10px 25px rgba(142, 36, 170, 0.4)',
                  },
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1.1rem',
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
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  '& svg': {
                    mr: 1,
                    animation: 'pulse 2s infinite'
                  }
                }}>
                  <LiveTvIcon sx={{ fontSize: 20 }} />
                  Hadi Başlayalım!
                </Box>
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  borderWidth: 2,
                  borderColor: 'rgba(142, 36, 170, 0.5)',
                  color: '#8E24AA',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(5px)',
                  '&:hover': {
                    borderColor: '#8E24AA',
                    backgroundColor: 'rgba(142, 36, 170, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
                component="a"
                href="https://www.youtube.com/@businessfurkan"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<YouTubeIcon sx={{ color: '#f44336' }} />}
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
