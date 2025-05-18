import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card,
  CardContent,
  useTheme,
  alpha,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Stack
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

const PomodoroPage = () => {
  const theme = useTheme();
  const audioRef = useRef(null);

  // Pomodoro state'leri
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 dakika
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak'
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

  // Zamanlayıcı fonksiyonları
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
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

  // Bildirim gösterme fonksiyonu
  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Hedef belirleme fonksiyonu
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

  // Hedef sonuç fonksiyonu
  const handleGoalResult = (completed) => {
    setShowGoalResult(false);
    
    // Başarı durumuna göre bildirim göster
    if (completed) {
      showNotification('Tebrikler! Hedefinizi başarıyla tamamladınız! 🎉', 'success');
    } else {
      showNotification('Sorun değil, bir dahaki sefere daha iyi olacak! 💪', 'info');
    }
    
    // Yeni bir pomodoro için hazırlan
    setCurrentGoal('');
    setGoal('');
    handleReset();
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
      // Pomodoro tamamlandığında
      if (mode === 'pomodoro') {
        setCompletedPomodoros(prev => prev + 1);
        
        // Eğer bir hedef belirlendiyse, hedef sonuç diyaloğunu göster
        if (currentGoal) {
          setShowGoalResult(true);
        } else {
          changeMode('shortBreak');
        }
      } else {
        changeMode('pomodoro');
      }

      // Ses çalma
      if (!muted) {
        if (audioRef.current) {
          audioRef.current.play();
        } else {
          const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
          audioRef.current = audio;
          audio.play();
        }
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, muted, currentGoal]);

  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        width: '100%',
        minHeight: '100vh',
        pt: { xs: 2, sm: 3, md: 4 },
        pb: { xs: 4, sm: 5, md: 6 },
        px: { xs: 1, sm: 2, md: 3 },
        background: '#FFFFF0', // Açık krem rengi arka plan
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Container maxWidth="md" sx={{ height: '100%' }}>
        {/* Başlık */}
        <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: { xs: 3, sm: 4 },
            gap: 2
          }}
        >
          <TimerIcon 
            sx={{ 
              fontSize: { xs: 32, sm: 40 },
              color: '#333',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
            }} 
          />
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              color: '#333',
              fontSize: { xs: '1.8rem', sm: '2.2rem' },
              textAlign: 'center',
              letterSpacing: '-0.5px',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: '60px',
                height: '4px',
                backgroundColor: '#333',
                borderRadius: '2px',
              }
            }}
          >
            Pomodoro Tekniği
          </Typography>
        </Box>

        {/* Ana Pomodoro Kartı */}
        <Card
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: '800px',
            mx: 'auto',
            borderRadius: 4,
            background: 'rgba(255, 255, 240, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            mb: 4,
            '&:hover': {
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Başlık */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  fontWeight: 700,
                  color: '#333',
                  fontSize: { xs: '1.4rem', sm: '1.6rem' },
                  textAlign: 'center'
                }}
              >
                Pomodoro Zamanlayıcı
              </Typography>
            </Box>

            {/* Ana İçerik Alanı */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 4, md: 6 },
              mb: 4
            }}>
              {/* Orta Kısım - Zamanlayıcı */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Zamanlayıcı Sayacı */}
                <Typography
                  variant="h1"
                  component="div"
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: '4rem', sm: '5rem', md: '6rem' },
                    lineHeight: 1,
                    color: '#333',
                    mb: 1,
                    textAlign: 'center'
                  }}
                >
                  {formatTime(timeLeft)}
                </Typography>
                
                {/* Tamamlanan Pomodoro Sayısı */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: 1
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      opacity: 0.7, 
                      fontSize: '0.9rem',
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <EmojiEventsIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                    {completedPomodoros} pomodoro tamamlandı
                  </Typography>
                </Box>
                
                {/* Mod Göstergesi */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.85rem'
                  }}
                >
                  {mode === 'pomodoro' ? 'Çalışma' : mode === 'shortBreak' ? 'Kısa Mola' : 'Uzun Mola'}
                </Typography>
                
                {/* Ana Kontrol Butonları */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  mt: 2,
                  justifyContent: 'center'
                }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleStartPause}
                    startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                    sx={{ 
                      borderRadius: 30,
                      px: 3,
                      py: 1,
                      bgcolor: '#333',
                      '&:hover': {
                        bgcolor: '#222',
                      },
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    {isRunning ? 'Duraklat' : 'Başlat'}
                  </Button>
                  
                  <Tooltip title="Sıfırla">
                    <IconButton 
                      onClick={handleReset} 
                      size="large"
                      sx={{ 
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.08)',
                        }
                      }}
                    >
                      <RestartAltIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={muted ? "Sesi Aç" : "Sesi Kapat"}>
                    <IconButton 
                      onClick={toggleMute} 
                      size="large"
                      sx={{ 
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.08)',
                        }
                      }}
                    >
                      {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {/* Hedef Belirleme Butonu */}
                {!currentGoal && !isRunning && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setShowGoalInput(true)}
                    startIcon={<AssignmentIcon />}
                    sx={{ 
                      mt: 2,
                      borderRadius: 30,
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                      color: '#333',
                      '&:hover': {
                        borderColor: 'rgba(0, 0, 0, 0.4)',
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                      }
                    }}
                  >
                    Hedef Belirle
                  </Button>
                )}
                
                {/* Mevcut Hedef Göstergesi */}
                {currentGoal && (
                  <Box sx={{ 
                    mt: 2,
                    p: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.03)',
                    borderRadius: 2,
                    border: '1px dashed rgba(0, 0, 0, 0.1)',
                    maxWidth: '100%',
                    width: '100%'
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontWeight: 500,
                        color: 'text.secondary'
                      }}
                    >
                      <AssignmentIcon fontSize="small" />
                      Hedef: {currentGoal}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Sağ Kısım - Mod Seçiciler */}
              <Stack 
                direction="column" 
                spacing={2}
                sx={{
                  display: { xs: 'none', md: 'flex' }
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.secondary',
                    textAlign: 'center',
                    mb: 1
                  }}
                >
                  Mod Seçin
                </Typography>
                
                <Button
                  variant={mode === 'pomodoro' ? 'contained' : 'outlined'}
                  onClick={() => changeMode('pomodoro')}
                  fullWidth
                  sx={{ 
                    borderRadius: 2,
                    py: 1,
                    fontWeight: mode === 'pomodoro' ? 700 : 500,
                    backgroundColor: mode === 'pomodoro' ? '#333' : 'transparent',
                    color: mode === 'pomodoro' ? 'white' : '#333',
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                    '&:hover': {
                      backgroundColor: mode === 'pomodoro' ? '#222' : 'rgba(0, 0, 0, 0.05)',
                      borderColor: 'rgba(0, 0, 0, 0.3)',
                    }
                  }}
                >
                  Pomodoro
                </Button>
                
                <Button
                  variant={mode === 'shortBreak' ? 'contained' : 'outlined'}
                  onClick={() => changeMode('shortBreak')}
                  fullWidth
                  sx={{ 
                    borderRadius: 2,
                    py: 1,
                    fontWeight: mode === 'shortBreak' ? 700 : 500,
                    backgroundColor: mode === 'shortBreak' ? '#333' : 'transparent',
                    color: mode === 'shortBreak' ? 'white' : '#333',
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                    '&:hover': {
                      backgroundColor: mode === 'shortBreak' ? '#222' : 'rgba(0, 0, 0, 0.05)',
                      borderColor: 'rgba(0, 0, 0, 0.3)',
                    }
                  }}
                >
                  Kısa Mola
                </Button>
                
                <Button
                  variant={mode === 'longBreak' ? 'contained' : 'outlined'}
                  onClick={() => changeMode('longBreak')}
                  fullWidth
                  sx={{ 
                    borderRadius: 2,
                    py: 1,
                    fontWeight: mode === 'longBreak' ? 700 : 500,
                    backgroundColor: mode === 'longBreak' ? '#333' : 'transparent',
                    color: mode === 'longBreak' ? 'white' : '#333',
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                    '&:hover': {
                      backgroundColor: mode === 'longBreak' ? '#222' : 'rgba(0, 0, 0, 0.05)',
                      borderColor: 'rgba(0, 0, 0, 0.3)',
                    }
                  }}
                >
                  Uzun Mola
                </Button>
              </Stack>
            </Box>
            
            {/* Mobil için Mod Seçiciler */}
            <Stack 
              direction="row" 
              spacing={1}
              sx={{
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'center',
                mb: 3
              }}
            >
              <Button
                variant={mode === 'pomodoro' ? 'contained' : 'outlined'}
                onClick={() => changeMode('pomodoro')}
                size="small"
                sx={{ 
                  borderRadius: 2,
                  fontWeight: mode === 'pomodoro' ? 700 : 500,
                  backgroundColor: mode === 'pomodoro' ? '#333' : 'transparent',
                  color: mode === 'pomodoro' ? 'white' : '#333',
                  borderColor: 'rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    backgroundColor: mode === 'pomodoro' ? '#222' : 'rgba(0, 0, 0, 0.05)',
                    borderColor: 'rgba(0, 0, 0, 0.3)',
                  }
                }}
              >
                Pomodoro
              </Button>
              
              <Button
                variant={mode === 'shortBreak' ? 'contained' : 'outlined'}
                onClick={() => changeMode('shortBreak')}
                size="small"
                sx={{ 
                  borderRadius: 2,
                  fontWeight: mode === 'shortBreak' ? 700 : 500,
                  backgroundColor: mode === 'shortBreak' ? '#333' : 'transparent',
                  color: mode === 'shortBreak' ? 'white' : '#333',
                  borderColor: 'rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    backgroundColor: mode === 'shortBreak' ? '#222' : 'rgba(0, 0, 0, 0.05)',
                    borderColor: 'rgba(0, 0, 0, 0.3)',
                  }
                }}
              >
                Kısa Mola
              </Button>
              
              <Button
                variant={mode === 'longBreak' ? 'contained' : 'outlined'}
                onClick={() => changeMode('longBreak')}
                size="small"
                sx={{ 
                  borderRadius: 2,
                  fontWeight: mode === 'longBreak' ? 700 : 500,
                  backgroundColor: mode === 'longBreak' ? '#333' : 'transparent',
                  color: mode === 'longBreak' ? 'white' : '#333',
                  borderColor: 'rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    backgroundColor: mode === 'longBreak' ? '#222' : 'rgba(0, 0, 0, 0.05)',
                    borderColor: 'rgba(0, 0, 0, 0.3)',
                  }
                }}
              >
                Uzun Mola
              </Button>
            </Stack>
            
            {/* Bilgi Metni */}
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                textAlign: 'center',
                fontSize: '0.85rem',
                mt: 2
              }}
            >
              Zamanlayıcıyı başlatın: odaklanın ve verimliliğinizi artırın!
            </Typography>
          </CardContent>
        </Card>
        
        {/* Pomodoro Tekniği Açıklaması */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              fontWeight: 700, 
              color: '#333',
              mb: 2
            }}
          >
            Verimli Çalışma
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pomodoro tekniği, 25 dakikalık odaklanmış çalışma ve 5 dakikalık kısa molalardan oluşan bir zaman yönetimi metodudur.
          </Typography>
        </Box>
      </Container>
      
      {/* Hedef Belirleme Diyaloğu */}
      <Dialog 
        open={showGoalInput} 
        onClose={() => setShowGoalInput(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxWidth: 500,
            width: '100%',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon color="primary" />
            Bu Pomodoro için hedefiniz nedir?
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bu 25 dakikalık süre içinde ne yapmayı planlıyorsunuz? Hedefinizi belirlemek motivasyonunuzu artıracak ve odaklanmanıza yardımcı olacaktır.
          </Typography>
          
          <TextField
            autoFocus
            fullWidth
            label="Hedefiniz"
            placeholder="Örn: Matematik konusundan 20 soru çözmek"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            variant="outlined"
            sx={{ mb: 1 }}
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
              // Hedefsiz başlat butonuna tıklandığında sayacı başlat
              setIsRunning(true);
            }} 
            color="inherit"
            sx={{ borderRadius: 6, fontWeight: 500, textTransform: 'none' }}
          >
            Hedefsiz Başlat
          </Button>
          
          <Button 
            onClick={handleGoalSubmit} 
            variant="contained" 
            color="primary"
            disabled={!goal.trim()}
            sx={{ 
              borderRadius: 6, 
              fontWeight: 600, 
              px: 3,
              bgcolor: '#333',
              '&:hover': {
                bgcolor: '#222',
              },
              textTransform: 'none'
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
            maxWidth: 500,
            width: '100%',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEventsIcon color="primary" />
            Pomodoro Tamamlandı!
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Hedefiniz: <strong>{currentGoal}</strong>
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Hedefinizi tamamladınız mı?
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => handleGoalResult(false)} 
            color="inherit"
            startIcon={<CancelIcon />}
            sx={{ borderRadius: 6, fontWeight: 500, textTransform: 'none' }}
          >
            Hayır
          </Button>
          
          <Button 
            onClick={() => handleGoalResult(true)} 
            variant="contained" 
            color="primary"
            startIcon={<CheckCircleIcon />}
            sx={{ 
              borderRadius: 6, 
              fontWeight: 600, 
              px: 3,
              bgcolor: '#333',
              '&:hover': {
                bgcolor: '#222',
              },
              textTransform: 'none'
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
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PomodoroPage;
