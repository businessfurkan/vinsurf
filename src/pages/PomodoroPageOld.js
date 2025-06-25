import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card,
  CardContent,
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
  Stack,
  Grid,
  Paper
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
// PlayArrowIcon ve PauseIcon butonlarda kullanılıyor
/* eslint-disable no-unused-vars */
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
/* eslint-enable no-unused-vars */
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const PomodoroPage = () => {
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

  /* eslint-disable no-unused-vars */
  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };
  /* eslint-enable no-unused-vars */

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
        background: 'var(--background-color)', // Yeni arkaplan rengi
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
              color: '#2a5956',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
            }} 
          />
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              color: '#ffffff',
              fontFamily: 'Poppins, Montserrat, sans-serif',
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
                  color: '#ffffff',
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
                <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: '220px', sm: '280px', md: '320px' },
                  height: { xs: '220px', sm: '280px', md: '320px' },
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), inset 0 0 15px rgba(255, 255, 255, 0.5)',
                  border: '8px solid #ede8ce',
                  mb: 3,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '85%',
                    height: '85%',
                    borderRadius: '50%',
                    background: mode === 'pomodoro' 
                      ? 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)' 
                      : mode === 'shortBreak'
                        ? 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)'
                        : 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
                    opacity: 0.2,
                    zIndex: 0
                  }
                }}
              >
                <Typography 
                  variant="h1"
                  component="div"
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: '3.5rem', sm: '4.5rem', md: '5.5rem' },
                    lineHeight: 1,
                    color: '#ffffff',
                    textAlign: 'center',
                    zIndex: 1,
                    textShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    letterSpacing: '-2px'
                  }}
                >
                  {formatTime(timeLeft)}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    opacity: 0.8,
                    zIndex: 1
                  }}
                >
                  {mode === 'pomodoro' ? 'ÇALIŞMA' : mode === 'shortBreak' ? 'KISA MOLA' : 'UZUN MOLA'}
                </Typography>
              </Box>
                
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
                    color: '#ffffff',
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
                  <Tooltip title="Sıfırla">
                    <IconButton 
                      onClick={handleReset} 
                      sx={{ 
                        bgcolor: '#9c27b0',
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#7b1fa2',
                        },
                        boxShadow: '0 2px 6px rgba(156, 39, 176, 0.3)'
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
                    borderRadius: 4,
                    minWidth: 100,
                    textTransform: 'none',
                    fontWeight: mode === 'pomodoro' ? 600 : 500,
                    fontSize: '0.9rem',
                    bgcolor: mode === 'pomodoro' ? '#ff5252' : 'transparent',
                    color: mode === 'pomodoro' ? 'white' : '#ff5252',
                    borderColor: '#ff5252',
                    '&:hover': {
                      bgcolor: mode === 'pomodoro' ? '#e53935' : 'rgba(255, 82, 82, 0.1)',
                      borderColor: '#e53935'
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
                    backgroundColor: mode === 'shortBreak' ? '#4caf50' : 'transparent',
                    color: mode === 'shortBreak' ? 'white' : '#4caf50',
                    borderColor: '#4caf50',
                    '&:hover': {
                      backgroundColor: mode === 'shortBreak' ? '#43a047' : 'rgba(76, 175, 80, 0.1)',
                      borderColor: '#43a047',
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
                    backgroundColor: mode === 'longBreak' ? '#2196f3' : 'transparent',
                    color: mode === 'longBreak' ? 'white' : '#2196f3',
                    borderColor: '#2196f3',
                    '&:hover': {
                      backgroundColor: mode === 'longBreak' ? '#1e88e5' : 'rgba(33, 150, 243, 0.1)',
                      borderColor: '#1e88e5',
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
                  backgroundColor: mode === 'pomodoro' ? '#ff5252' : 'transparent',
                  color: mode === 'pomodoro' ? 'white' : '#ff5252',
                  borderColor: '#ff5252',
                  '&:hover': {
                    backgroundColor: mode === 'pomodoro' ? '#e53935' : 'rgba(255, 82, 82, 0.1)',
                    borderColor: '#e53935',
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
                  backgroundColor: mode === 'shortBreak' ? '#4caf50' : 'transparent',
                  color: mode === 'shortBreak' ? 'white' : '#4caf50',
                  borderColor: '#4caf50',
                  '&:hover': {
                    backgroundColor: mode === 'shortBreak' ? '#43a047' : 'rgba(76, 175, 80, 0.1)',
                    borderColor: '#43a047',
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
                  backgroundColor: mode === 'longBreak' ? '#2196f3' : 'transparent',
                  color: mode === 'longBreak' ? 'white' : '#2196f3',
                  borderColor: '#2196f3',
                  '&:hover': {
                    backgroundColor: mode === 'longBreak' ? '#1e88e5' : 'rgba(33, 150, 243, 0.1)',
                    borderColor: '#1e88e5',
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
                color: '#ffffff',
                textAlign: 'center',
                fontSize: '0.85rem',
                mt: 2
              }}
            >
              Zamanlayıcıyı başlatın: odaklanın ve verimliliğinizi artırın!
            </Typography>
          </CardContent>
        </Card>
        
        {/* Pomodoro Tekniği Açıklaması - Genişletilmiş ve Daha Canlı */}
        <Box sx={{ mb: 6, mt: 4 }}>
          <Typography 
            variant="h5" 
            component="h3"
            sx={{ 
              fontWeight: 700, 
              color: '#ffffff',
              mb: 3,
              textAlign: 'center',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '4px',
                background: 'linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%)',
                borderRadius: '2px',
              }
            }}
          >
            Pomodoro Tekniği Nedir?
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid gridColumn={{xs: "span 12", md: "span 4"}}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                },
                background: 'linear-gradient(135deg, #fff6f6 0%, #ffe6e6 100%)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    mr: 2,
                    boxShadow: '0 4px 10px rgba(255, 154, 158, 0.3)'
                  }}>1</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Çalışma Zamanı
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  25 dakikalık kesintisiz çalışma süresi içinde tamamen görevinize odaklanın. Bu süre içinde sosyal medya, telefon ve diğer dikkat dağıtıcılardan uzak durun.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid gridColumn={{xs: "span 12", md: "span 4"}}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                },
                background: 'linear-gradient(120deg, #e0f7fa 0%, #c8e6c9 100%)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    mr: 2,
                    boxShadow: '0 4px 10px rgba(132, 250, 176, 0.3)'
                  }}>2</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Kısa Mola
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Her 25 dakikalık çalışma süresinden sonra 5 dakikalık bir mola verin. Bu sürede ayağa kalkın, gerinme hareketleri yapın veya kısa bir yürüyüş yapın. Zihninizi dinlendirin.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid gridColumn={{xs: "span 12", md: "span 4"}}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                },
                background: 'linear-gradient(to top, #f3e7ff 0%, #ffe6fb 100%)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    mr: 2,
                    boxShadow: '0 4px 10px rgba(161, 140, 209, 0.3)'
                  }}>3</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Uzun Mola
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Her 4 pomodoro (çalışma süresi) tamamlandıktan sonra 15-30 dakikalık daha uzun bir mola verin. Bu süre içinde kendinizi ödüllendirin ve tamamen dinlenin.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ 
            mt: 5, 
            p: 4, 
            borderRadius: 8, 
            background: 'linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              background: 'linear-gradient(90deg, #00b09b, #96c93d, #3f51b5, #9c27b0)',
              backgroundSize: '400% 400%',
              animation: 'gradient 15s ease infinite',
              '@keyframes gradient': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' },
              },
            }} />
            
            <Typography variant="h5" sx={{ 
              mb: 4, 
              fontWeight: 800, 
              color: '#1a237e', 
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                width: '80px',
                height: '3px',
                background: 'linear-gradient(90deg, #00b09b, #96c93d)',
                transform: 'translateX(-50%)'
              }
            }}>
              Pomodoro Tekniğinin Faydaları
            </Typography>
            
            <Grid container spacing={4}>
              {/* İlk satır: 1 ve 2 yan yana */}
              <Grid gridColumn={{xs: "span 12", sm: "span 6"}}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: 4,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 25px rgba(0,0,0,0.12)'
                  }
                }}>
                  <Box sx={{ 
                    width: 70, 
                    height: 70, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    mb: 3,
                    boxShadow: '0 8px 15px rgba(246, 211, 101, 0.4)',
                    position: 'relative',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: '-5px',
                      left: '-5px',
                      right: '-5px',
                      bottom: '-5px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                      opacity: 0.4,
                      zIndex: -1
                    }
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>1</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#ff7043' }}>
                    Odaklanmayı Artırır
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#546e7a', lineHeight: 1.6 }}>
                    Kısa çalışma aralıkları daha yoğun odaklanmayı sağlar.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid gridColumn={{xs: "span 12", sm: "span 6"}}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: 4,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 25px rgba(0,0,0,0.12)'
                  }
                }}>
                  <Box sx={{ 
                    width: 70, 
                    height: 70, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    mb: 3,
                    boxShadow: '0 8px 15px rgba(67, 233, 123, 0.4)',
                    position: 'relative',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: '-5px',
                      left: '-5px',
                      right: '-5px',
                      bottom: '-5px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      opacity: 0.4,
                      zIndex: -1
                    }
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>2</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#00bfa5' }}>
                    Verimliliği Yükseltir
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#546e7a', lineHeight: 1.6 }}>
                    Düzenli molalar zihinsel yorgunluğu azaltır ve verimliliği artırır.
                  </Typography>
                </Box>
              </Grid>
              
              {/* İkinci satır: 3 ve 4 yan yana */}
              <Grid gridColumn={{xs: "span 12", sm: "span 6"}}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: 4,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 25px rgba(0,0,0,0.12)'
                  }
                }}>
                  <Box sx={{ 
                    width: 70, 
                    height: 70, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    mb: 3,
                    boxShadow: '0 8px 15px rgba(79, 172, 254, 0.4)',
                    position: 'relative',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: '-5px',
                      left: '-5px',
                      right: '-5px',
                      bottom: '-5px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      opacity: 0.4,
                      zIndex: -1
                    }
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>3</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                    Motivasyonu Korur
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#546e7a', lineHeight: 1.6 }}>
                    Küçük hedefler belirleyerek motivasyonu yüksek tutar.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid gridColumn={{xs: "span 12", sm: "span 6"}}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: 4,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 25px rgba(0,0,0,0.12)'
                  }
                }}>
                  <Box sx={{ 
                    width: 70, 
                    height: 70, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    mb: 3,
                    boxShadow: '0 8px 15px rgba(161, 140, 209, 0.4)',
                    position: 'relative',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: '-5px',
                      left: '-5px',
                      right: '-5px',
                      bottom: '-5px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                      opacity: 0.4,
                      zIndex: -1
                    }
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>4</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#9c27b0' }}>
                    Stresi Azaltır
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#546e7a', lineHeight: 1.6 }}>
                    Düzenli molalar zihinsel ve fiziksel stresi azaltır.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              &ldquo;Pomodoro Tekniği, Francesco Cirillo tarafından 1980&apos;lerde geliştirilmiş ve adını domates şeklindeki mutfak zamanlayıcısından almıştır.&rdquo;
            </Typography>
          </Box>
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
              background: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #009688 0%, #8bc34a 100%)',
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
