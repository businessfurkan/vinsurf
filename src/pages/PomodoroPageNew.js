import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Stack,
  Grid,
  Grow,
  Chip
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const PomodoroPage = () => {
  const audioRef = useRef(null);

  // Pomodoro state'leri
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('pomodoro');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [muted, setMuted] = useState(false);
  
  // Hedef belirleme state'leri
  const [goal, setGoal] = useState('');
  const [currentGoal, setCurrentGoal] = useState('');
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [showGoalResult, setShowGoalResult] = useState(false);
  
  // Bildirim state'i
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Info popup state'leri
  const [infoPopup, setInfoPopup] = useState({
    open: false,
    title: '',
    content: '',
    type: ''
  });

  // Zamanlayıcı fonksiyonları
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartPause = () => {
    if (!isRunning && !currentGoal && mode === 'pomodoro') {
      setShowGoalInput(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setTimeLeft(25 * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(5 * 60);
    } else {
      setTimeLeft(15 * 60);
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const changeMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'pomodoro') {
      setTimeLeft(25 * 60);
    } else if (newMode === 'shortBreak') {
      setTimeLeft(5 * 60);
    } else {
      setTimeLeft(15 * 60);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleGoalSubmit = () => {
    if (goal.trim()) {
      setCurrentGoal(goal);
      setShowGoalInput(false);
      setIsRunning(true);
      showNotification('Hedefiniz belirlendi! Şimdi çalışmaya başlayabilirsiniz.', 'success');
    } else {
      showNotification('Lütfen bir hedef belirleyin', 'warning');
    }
  };

  const handleGoalResult = (completed) => {
    setShowGoalResult(false);
    
    if (completed) {
      showNotification('Tebrikler! Hedefinizi başarıyla tamamladınız! 🎉', 'success');
      setCompletedPomodoros(prev => prev + 1);
    } else {
      showNotification('Sorun değil, bir dahaki sefere daha iyi olacak! 💪', 'info');
    }
    
    setCurrentGoal('');
    setGoal('');
    handleReset();
  };

  // Info kartları için veri
  const infoCards = [
    {
      id: 'what',
      title: 'Pomodoro Nedir?',
      icon: <InfoIcon />,
      color: '#47a670',
      summary: 'Zaman yönetimi tekniği',
      content: `Pomodoro Tekniği, 1980'lerde Francesco Cirillo tarafından geliştirilen bir zaman yönetimi metodudur. 

📚 Temel Prensipler:
• 25 dakikalık odaklanma periyotları
• 5 dakikalık kısa molalar  
• 4 pomodoro sonrası 15-30 dakika uzun mola
• Dikkat dağınıklığını minimize etme

🎯 Amaç:
Sürekli odaklanma ile verimliliği artırmak ve zihinsel yorgunluğu azaltmak.`,
    },
    {
      id: 'how',
      title: 'Nasıl Çalışır?',
      icon: <AutoAwesomeIcon />,
      color: '#5cb85c',
      summary: '4 basit adım',
      content: `🔄 Pomodoro Döngüsü:

1️⃣ HEDEF BELİRLE
• Yapılacak işi net tanımla
• Gerçekçi hedefler koy
• Dikkat dağıtıcıları kapat

2️⃣ 25 DAKİKA ODAKLAN
• Sadece belirlenen işe odaklan
• Telefonu sessiz moda al
• Kesintilere izin verme

3️⃣ 5 DAKİKA MOLA
• Kısa nefes al
• Su iç, gerinin
• Sosyal medyaya bakma

4️⃣ TEKRARLA
• 4 pomodoro sonrası uzun mola
• İlerlemeyi değerlendir`,
    },
    {
      id: 'benefits',
      title: 'Faydaları',
      icon: <PsychologyIcon />,
      color: '#8bc34a',
      summary: 'Bilimsel kanıtlar',
      content: `🧠 Bilimsel Faydalar:

✅ ODAKLANMA
• %40 daha fazla konsantrasyon
• Dikkat süresi artışı
• Çoklu görev yanılgısını önler

✅ VERİMLİLİK
• %25 daha hızlı tamamlama
• Kaliteli çıktılar
• Daha az hata oranı

✅ MENTAL SAĞLIK
• Stres seviyesi azalır
• Motivasyon artar
• Tükenmişlik önlenir

✅ ZAMAN YÖNETİMİ
• Gerçekçi planlama
• İş-yaşam dengesi
• Öncelik belirleme becerisi`,
    },
    {
      id: 'tips',
      title: 'İpuçları',
      icon: <TipsAndUpdatesIcon />,
      color: '#3e8e41',
      summary: 'Verimlilik önerileri',
      content: `💡 Başarı İpuçları:

🎯 HAZIRLIK
• Çalışma alanını düzenle
• Gerekli materyalleri hazırla
• Hedefleri küçük parçalara böl

⚡ UYGULAMA
• İlk 2-3 dakika en zor kısım
• Mükemmeliyetçilikten kaçın
• İlerlemeyi kaydet

🛡️ DİKKAT DAĞITICILARI
• Telefonu başka odaya koy
• Bildirimleri kapat
• "Sonra yapacağım" listesi tut

🔄 MOLA DÖNEMLERİ
• Ekrandan uzaklaş
• Fiziksel aktivite yap
• Derin nefes egzersizleri

📈 UZUN VADELİ
• Günlük pomodoro sayısını takip et
• Hangi saatlerde daha verimli olduğunu öğren
• Hedef büyüklüğünü optimize et`,
    }
  ];

  // Timer circle progress hesaplama
  const getProgress = () => {
    const totalTime = mode === 'pomodoro' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // Zamanlayıcı efekti
  useEffect(() => {
    let timer = null;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      
      if (mode === 'pomodoro') {
        if (currentGoal) {
          setShowGoalResult(true);
        } else {
          setCompletedPomodoros(prev => prev + 1);
          showNotification('Pomodoro tamamlandı! Mola zamanı 🎉', 'success');
        }
        
        if (!muted && audioRef.current) {
          audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Otomatik mola başlat
        setTimeout(() => {
          if (completedPomodoros % 4 === 3) {
            changeMode('longBreak');
          } else {
            changeMode('shortBreak');
          }
          setIsRunning(true);
        }, 2000);
      } else {
        showNotification('Mola bitti! Yeni pomodoro başlayabilir 💪', 'info');
        changeMode('pomodoro');
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, completedPomodoros, currentGoal, muted]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#47a670',
        py: 4,
        px: 2
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              color: '#ffffff',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <TimerIcon sx={{ fontSize: 48, color: '#125861' }} />
            Pomodoro Tekniği
          </Typography>
          <Typography variant="h6" sx={{ color: '#b8c7e0', fontWeight: 400 }}>
            Odaklanma ve verimlilik için bilimsel zaman yönetimi
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Sol Panel - Timer */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                p: 4,
                textAlign: 'center'
              }}
            >
              {/* Mode Tabs */}
              <Stack direction="row" spacing={1} justifyContent="center" mb={3}>
                {[
                  { key: 'pomodoro', label: 'Pomodoro', time: '25:00' },
                  { key: 'shortBreak', label: 'Kısa Mola', time: '05:00' },
                  { key: 'longBreak', label: 'Uzun Mola', time: '15:00' }
                ].map((tab) => (
                  <Chip
                    key={tab.key}
                    label={`${tab.label}`}
                    onClick={() => changeMode(tab.key)}
                    sx={{
                      bgcolor: mode === tab.key ? '#125861' : 'rgba(255, 255, 255, 0.1)',
                      color: mode === tab.key ? '#47a670' : '#ffffff',
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      fontSize: '0.9rem',
                      '&:hover': {
                        bgcolor: mode === tab.key ? '#f5e6d3' : 'rgba(255, 255, 255, 0.2)',
                      }
                    }}
                  />
                ))}
              </Stack>

              {/* Timer Circle */}
              <Box
                sx={{
                  position: 'relative',
                  width: 280,
                  height: 280,
                  margin: '0 auto',
                  mb: 4
                }}
              >
                {/* Background Circle */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '8px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
                
                {/* Progress Circle */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: `conic-gradient(from 0deg, #125861 ${getProgress()}%, transparent ${getProgress()}%)`,
                    transform: 'rotate(-90deg)',
                    transition: 'all 0.3s ease'
                  }}
                />

                {/* Timer Text */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}
                >
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#ffffff',
                      fontSize: '3.5rem',
                      fontFamily: 'monospace'
                    }}
                  >
                    {formatTime(timeLeft)}
                  </Typography>
                  
                  {currentGoal && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#b8c7e0',
                        mt: 1,
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {currentGoal}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Control Buttons */}
              <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartPause}
                  startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                  sx={{
                    bgcolor: '#125861',
                    color: '#47a670',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: '#f5e6d3',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isRunning ? 'Duraklat' : 'Başla'}
                </Button>

                <IconButton
                  onClick={handleReset}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <RestartAltIcon />
                </IconButton>

                <IconButton
                  onClick={toggleMute}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
              </Stack>

              {/* Stats */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 3,
                  mt: 2
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#125861' }}>
                    {completedPomodoros}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b8c7e0' }}>
                    Tamamlanan
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Sağ Panel - Info Cards */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {infoCards.map((card, index) => (
                <Grid item xs={6} key={card.id}>
                  <Grow in timeout={500 + index * 200}>
                    <Card
                      onClick={() => setInfoPopup({
                        open: true,
                        title: card.title,
                        content: card.content,
                        type: card.id
                      })}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          background: 'rgba(255, 255, 255, 0.15)',
                          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          gap: 1
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: card.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {card.icon}
                        </Box>
                        
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#125861',
                            fontSize: '1rem'
                          }}
                        >
                          {card.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#b8c7e0',
                            fontSize: '0.85rem'
                          }}
                        >
                          {card.summary}
                        </Typography>
                      </Box>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Info Popup Dialog */}
      <Dialog 
        open={infoPopup.open} 
        onClose={() => setInfoPopup({ ...infoPopup, open: false })}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: '#47a670',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#125861' }}>
            {infoPopup.title}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#ffffff',
              lineHeight: 1.8,
              whiteSpace: 'pre-line'
            }}
          >
            {infoPopup.content}
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setInfoPopup({ ...infoPopup, open: false })}
            sx={{
              bgcolor: '#125861',
              color: '#47a670',
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#f5e6d3'
              }
            }}
          >
            Anladım
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hedef Belirleme Diyaloğu */}
      <Dialog 
        open={showGoalInput} 
        onClose={() => setShowGoalInput(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: '#47a670',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: 500,
            width: '100%'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#125861' }}>
            <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Hedefinizi Belirleyin
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#b8c7e0', mb: 3 }}>
            Bu pomodoro seansında neyi başarmak istiyorsunuz?
          </Typography>
          
          <TextField
            autoFocus
            fullWidth
            label="Hedefiniz"
            placeholder="Örn: Matematik konusundan 20 soru çözmek"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            variant="outlined"
            sx={{ 
              mb: 1,
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#125861',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#b8c7e0',
                '&.Mui-focused': {
                  color: '#125861',
                },
              },
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleGoalSubmit();
              }
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => {
              setShowGoalInput(false);
              setIsRunning(true);
            }} 
            sx={{ 
              color: '#b8c7e0',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Hedefsiz Başlat
          </Button>
          
          <Button 
            onClick={handleGoalSubmit} 
            variant="contained" 
            disabled={!goal.trim()}
            sx={{ 
              bgcolor: '#125861',
              color: '#47a670',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                bgcolor: '#f5e6d3',
              },
              '&:disabled': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Hedefi Belirle ve Başlat
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Hedef Sonuç Diyaloğu */}
      <Dialog 
        open={showGoalResult} 
        onClose={() => handleGoalResult(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: '#47a670',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: 500,
            width: '100%'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#125861' }}>
            <EmojiEventsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Pomodoro Tamamlandı!
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#b8c7e0', mb: 2 }}>
            Hedefiniz: <strong style={{ color: '#125861' }}>{currentGoal}</strong>
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#ffffff' }}>
            Hedefinizi tamamladınız mı?
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => handleGoalResult(false)} 
            startIcon={<CancelIcon />}
            sx={{ 
              color: '#b8c7e0',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Hayır
          </Button>
          
          <Button 
            onClick={() => handleGoalResult(true)} 
            variant="contained" 
            startIcon={<CheckCircleIcon />}
            sx={{ 
              bgcolor: '#125861',
              color: '#47a670',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                bgcolor: '#f5e6d3',
              }
            }}
          >
            Evet, Tamamladım!
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bildirim Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Audio element */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>
    </Box>
  );
};

export default PomodoroPage;
