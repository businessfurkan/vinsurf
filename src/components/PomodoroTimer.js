import React, { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { 
  Box, 
  Typography, 
  Button, 
  Slider, 
  TextField, 
  Grid, 
  IconButton, 
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Zoom,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { dataService } from '../services/dataService';
import { playClickSound } from '../utils/soundUtils';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FlagIcon from '@mui/icons-material/Flag';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SendIcon from '@mui/icons-material/Send';

const PomodoroTimer = () => {
  const [user] = useAuthState(auth);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak'
  const [settings, setSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Missing state declarations for no-undef errors
  const [muted, setMuted] = useState(false);
  
  const [pomodoroStats, setPomodoroStats] = useState({
    totalCompleted: 0,
    totalMinutes: 0,
    lastSession: null
  });
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  // Hedef sistemi için state'ler
  const [goal, setGoal] = useState('');
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [showGoalResult, setShowGoalResult] = useState(false);
  const [currentGoal, setCurrentGoal] = useState('');

  // Bildirim gösterme
  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Define playSound function with useCallback to prevent recreation on each render
  const playSound = useCallback(() => {
    if (!muted) {
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
      audio.play();
    }
  }, [muted]);

  // Ayarları ve istatistikleri yükle
  useEffect(() => {
    const loadPomodoroData = async () => {
      try {
        setIsLoading(true);
        const userId = user ? user.uid : 'anonymous';
        
        // Ayarları yükle
        const pomodoroData = await dataService.fetchData('pomodoroSettings', userId);
        
        if (pomodoroData && pomodoroData.length > 0) {
          const userSettings = pomodoroData[0];
          setSettings({
            pomodoro: userSettings.pomodoro || 25,
            shortBreak: userSettings.shortBreak || 5,
            longBreak: userSettings.longBreak || 15,
          });
          setMuted(userSettings.muted || false);
        }
        
        // İstatistikleri yükle
        const statsData = await dataService.fetchData('pomodoroStats', userId);
        
        if (statsData && statsData.length > 0) {
          const userStats = statsData[0];
          setPomodoroStats({
            totalCompleted: userStats.totalCompleted || 0,
            totalMinutes: userStats.totalMinutes || 0,
            lastSession: userStats.lastSession || null
          });
          setCompletedPomodoros(userStats.dailyCompleted || 0);
        }
      } catch (error) {
        console.error('Pomodoro verileri yüklenirken hata oluştu:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPomodoroData();
  }, [user]);

  // Ayarları kaydet
  const saveSettings = async () => {
    try {
      const userId = user ? user.uid : 'anonymous';
      const settingsData = {
        ...settings,
        muted
      };
      
      // Mevcut ayarları kontrol et
      const existingSettings = await dataService.fetchData('pomodoroSettings', userId);
      
      if (existingSettings && existingSettings.length > 0) {
        // Güncelle
        await dataService.updateData('pomodoroSettings', existingSettings[0].id, settingsData, userId);
      } else {
        // Yeni oluştur
        await dataService.addData('pomodoroSettings', settingsData, userId);
      }
      
      showNotification('Ayarlar başarıyla kaydedildi.');
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata oluştu:', error);
      showNotification('Ayarlar kaydedilirken bir hata oluştu.', 'error');
    }
  };

  // İstatistikleri kaydet
  const saveStats = useCallback(async (newCompletedPomodoros) => {
    try {
      const userId = user ? user.uid : 'anonymous';
      
      // Yeni istatistikleri hesapla
      const newStats = {
        totalCompleted: pomodoroStats.totalCompleted + 1,
        totalMinutes: pomodoroStats.totalMinutes + settings.pomodoro,
        lastSession: new Date(),
        dailyCompleted: newCompletedPomodoros
      };
      
      // Mevcut istatistikleri kontrol et
      const existingStats = await dataService.fetchData('pomodoroStats', userId);
      
      if (existingStats && existingStats.length > 0) {
        // Güncelle
        await dataService.updateData('pomodoroStats', existingStats[0].id, newStats, userId);
      } else {
        // Yeni oluştur
        await dataService.addData('pomodoroStats', newStats, userId);
      }
      
      // State'i güncelle
      setPomodoroStats({
        totalCompleted: newStats.totalCompleted,
        totalMinutes: newStats.totalMinutes,
        lastSession: newStats.lastSession
      });
    } catch (error) {
      console.error('İstatistikler kaydedilirken hata oluştu:', error);
    }
  }, [user, pomodoroStats, settings.pomodoro]);

  // Initialize the timer when mode changes
  useEffect(() => {
    if (mode === 'pomodoro') {
      setTimeLeft(settings.pomodoro * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(settings.shortBreak * 60);
    } else {
      setTimeLeft(settings.longBreak * 60);
    }
    setIsRunning(false);
  }, [mode, settings]);

  // Timer logic
  useEffect(() => {
    let timer = null;
    
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      playSound();
      
      // Pomodoro tamamlandığında istatistikleri güncelle
      if (mode === 'pomodoro') {
        setCompletedPomodoros(prev => prev + 1);
        saveStats();
        
        // Eğer aktif bir hedef varsa, hedef sonuç ekranını göster
        if (currentGoal) {
          setShowGoalResult(true);
        }
      }
      
      // Otomatik olarak bir sonraki moda geç
      if (mode === 'pomodoro') {
        // 4 pomodoro tamamlandığında uzun mola, değilse kısa mola
        if ((completedPomodoros + 1) % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(settings.longBreak * 60);
        } else {
          setMode('shortBreak');
          setTimeLeft(settings.shortBreak * 60);
        }
      } else {
        // Mola bittiğinde pomodoro moduna geri dön
        setMode('pomodoro');
        setTimeLeft(settings.pomodoro * 60);
      }
    }
    
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, completedPomodoros, playSound, saveStats, currentGoal, settings.pomodoro, settings.shortBreak, settings.longBreak]);

  const handleStartPause = () => {
    // Eğer pomodoro modundaysa ve timer çalışmıyorsa ve hedef belirlenmemişse
    if (mode === 'pomodoro' && !isRunning && !currentGoal) {
      setShowGoalInput(true);
      // Sayacı başlatma, bu sadece hedef diyaloğunu açar
      return;
    } else if (showGoalResult) {
      setShowGoalResult(false);
      setCurrentGoal('');
      setGoal('');
      handleReset();
      return;
    }
    
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    if (mode === 'pomodoro') {
      setTimeLeft(settings.pomodoro * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(settings.shortBreak * 60);
    } else {
      setTimeLeft(settings.longBreak * 60);
    }
    setIsRunning(false);
  };

  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value,
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setMuted(!muted);
    // Ses ayarını kaydet
    setTimeout(() => {
      saveSettings();
    }, 500);
  };

  // Calculate progress percentage for the circular progress
  const calculateProgress = () => {
    let totalSeconds;
    if (mode === 'pomodoro') {
      totalSeconds = settings.pomodoro * 60;
    } else if (mode === 'shortBreak') {
      totalSeconds = settings.shortBreak * 60;
    } else {
      totalSeconds = settings.longBreak * 60;
    }
    
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  // Hedef belirleme fonksiyonu
  const handleGoalSubmit = () => {
    if (goal.trim()) {
      setCurrentGoal(goal);
      setShowGoalInput(false);
      setIsRunning(true);
    } else {
      showNotification('Lütfen bir hedef belirleyin', 'warning');
    }
  };

  // Hedef başarı durumunu işleme fonksiyonu
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

  return (
    <Box sx={{ fontFamily: 'Quicksand, sans-serif', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {isLoading ? (
        <CircularProgress 
          size={60}
          sx={{ 
            color: '#0067b8',
            mt: 4
          }}
        />
      ) : (
        <>
          {/* Timer Mode Selection */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 4,
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)'
            }}
          >
            <Button 
              onClick={() => { setMode('pomodoro'); playClickSound(); }} 
              variant={mode === 'pomodoro' ? 'contained' : 'text'}
              disableElevation
              sx={{ 
                flex: 1, 
                py: 1.2,
                borderRadius: 0,
                color: mode === 'pomodoro' ? 'white' : 'text.secondary',
                backgroundColor: mode === 'pomodoro' ? '#0067b8' : 'transparent',
                '&:hover': {
                  backgroundColor: mode === 'pomodoro' ? '#005da6' : 'rgba(0, 0, 0, 0.04)'
                },
                fontFamily: 'Quicksand, sans-serif',
                fontWeight: 600
              }}
            >
              Pomodoro
            </Button>
            <Button 
              onClick={() => { setMode('shortBreak'); playClickSound(); }} 
              variant={mode === 'shortBreak' ? 'contained' : 'text'}
              disableElevation
              sx={{ 
                flex: 1, 
                py: 1.2,
                borderRadius: 0,
                color: mode === 'shortBreak' ? 'white' : 'text.secondary',
                backgroundColor: mode === 'shortBreak' ? '#34a853' : 'transparent',
                '&:hover': {
                  backgroundColor: mode === 'shortBreak' ? '#2d9549' : 'rgba(0, 0, 0, 0.04)'
                },
                fontFamily: 'Quicksand, sans-serif',
                fontWeight: 600
              }}
            >
              Kısa Mola
            </Button>
            <Button 
              onClick={() => { setMode('longBreak'); playClickSound(); }} 
              variant={mode === 'longBreak' ? 'contained' : 'text'}
              disableElevation
              sx={{ 
                flex: 1, 
                py: 1.2,
                borderRadius: 0,
                color: mode === 'longBreak' ? 'white' : 'text.secondary',
                backgroundColor: mode === 'longBreak' ? '#ea4335' : 'transparent',
                '&:hover': {
                  backgroundColor: mode === 'longBreak' ? '#d33426' : 'rgba(0, 0, 0, 0.04)'
                },
                fontFamily: 'Quicksand, sans-serif',
                fontWeight: 600
              }}
            >
              Uzun Mola
            </Button>
          </Box>
          
          {/* Gösterişli İlerleme Çubuğu */}
          <Box 
            sx={{ 
              width: '100%', 
              maxWidth: 400, 
              mx: 'auto', 
              mb: 3, 
              mt: 2,
              position: 'relative',
              height: 12,
              bgcolor: 'rgba(0,0,0,0.05)',
              borderRadius: 6,
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.03)'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${calculateProgress()}%`,
                background: mode === 'pomodoro' 
                  ? 'linear-gradient(90deg, #0067b8 0%, #0078d4 100%)' 
                  : mode === 'shortBreak' 
                    ? 'linear-gradient(90deg, #34a853 0%, #46c565 100%)' 
                    : 'linear-gradient(90deg, #ea4335 0%, #ff5c52 100%)',
                transition: 'width 1s linear',
                boxShadow: `0 0 10px ${mode === 'pomodoro' ? 'rgba(0,103,184,0.6)' : 
                          mode === 'shortBreak' ? 'rgba(52,168,83,0.6)' : 'rgba(234,67,53,0.6)'}`,
                borderRadius: 6,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)',
                  opacity: 0.8
                }
              }}
            />
          </Box>
          
          {/* Main Timer Display - Horizontal Layout */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', mb: 4, width: '100%' }}>
            <Box 
              sx={{ 
                position: 'relative', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                width: { xs: 220, sm: 220, md: 250 },
                height: { xs: 120, sm: 120, md: 130 },
                mr: { xs: 0, sm: 4, md: 6 }
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: '5rem', 
                    fontWeight: 900,
                    letterSpacing: '-2px',
                    color: 
                      mode === 'pomodoro' ? '#0067b8' : 
                      mode === 'shortBreak' ? '#34a853' : '#ea4335',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  {formatTime(timeLeft)}
                </Typography>
                
                {/* Pomodoro sayısı göstergesi */}
                {mode === 'pomodoro' && (
                  <Typography 
                    sx={{ 
                      borderRadius: 8,
                      px: 3,
                      py: 1.2,
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      backgroundColor: '#333',
                      '&:hover': {
                        backgroundColor: '#222',
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                      },
                      minWidth: { xs: '120px', sm: '140px' }
                    }}
                  >
                    {isRunning ? 'Duraklat' : 'Başlat'}
                  </Button>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1,
                    flexDirection: { xs: 'row', sm: 'row' }
                  }}>
                    <Tooltip title="Sıfırla">
                      <IconButton 
                        onClick={handleReset} 
                        color="inherit" 
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.08)',
                          }
                        }}
                      >
                        <RestartAltIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ayarlar">
                      <IconButton 
                        onClick={() => setShowSettings(true)} 
                        color="inherit"
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.08)',
                          }
                        }}
                      >
                        <SettingsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={muted ? "Sesi Aç" : "Sesi Kapat"}>
                      <IconButton 
                        onClick={toggleMute} 
                        color="inherit"
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.08)',
                          }
                        }}
                      >
                        {muted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    {!currentGoal && !isRunning && (
                      <Tooltip title="Hedef Belirle">
                        <IconButton 
                          onClick={() => setShowGoalInput(true)} 
                          color="primary"
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(51, 51, 51, 0.08)',
                            '&:hover': {
                              bgcolor: 'rgba(51, 51, 51, 0.15)',
                            }
                          }}
                        >
                          <AssignmentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  textAlign: 'center', 
                  mt: 2, 
                  color: 'text.secondary',
                  fontSize: '0.8rem',
                  fontStyle: 'italic' 
                }}
              >
                Zamanlayıcıyı başlatın: odaklanın ve verimliliğinizi artırın!
              </Typography>
            </CardContent>
          </Card>
            
            <Button 
              size="large" 
              variant="outlined"
              onClick={() => { handleReset(); playClickSound(); }}
              startIcon={<RestartAltIcon />}
              sx={{ 
                borderRadius: 28, 
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: 'Quicksand, sans-serif',
                borderColor: 'rgba(0,0,0,0.15)',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'rgba(0,0,0,0.3)',
                  backgroundColor: 'rgba(0,0,0,0.03)'
                }
              }}
            >
              Sıfırla
            </Button>
            
            <Button 
              size="large" 
              variant="outlined"
              onClick={() => { setShowSettings(!showSettings); playClickSound(); }}
              startIcon={<SettingsIcon />}
              sx={{ 
                borderRadius: 28, 
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: 'Quicksand, sans-serif',
                borderColor: 'rgba(0,0,0,0.15)',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'rgba(0,0,0,0.3)',
                  backgroundColor: 'rgba(0,0,0,0.03)'
                }
              }}
            >
              Ayarlar
            </Button>
          </Box>
          
          {/* Hedef giriş diyaloğu */}
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
                endIcon={<SendIcon />}
                sx={{ 
                  borderRadius: 6, 
                  fontWeight: 600, 
                  px: 3,
                  boxShadow: '0 4px 12px rgba(0,103,184,0.3)',
                  textTransform: 'none'
                }}
              >
                Hedefi Belirle ve Başlat
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Settings Dialog */}
          <Dialog
            open={showSettings}
            onClose={() => setShowSettings(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 700, fontFamily: 'Quicksand, sans-serif' }}>
              Pomodoro Ayarları
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Pomodoro Süresi (dakika)
                  </Typography>
                  <Slider
                    value={settings.pomodoro}
                    onChange={(e, value) => handleSettingChange('pomodoro', value)}
                    step={1}
                    marks
                    min={5}
                    max={60}
                    valueLabelDisplay="auto"
                  />
                  <TextField
                    value={settings.pomodoro}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 5 && value <= 60) {
                        handleSettingChange('pomodoro', value);
                      }
                    }}
                    type="number"
                    InputProps={{ inputProps: { min: 5, max: 60 } }}
                    size="small"
                    sx={{ width: '80px', mt: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Kısa Mola Süresi (dakika)
                  </Typography>
                  <Slider
                    value={settings.shortBreak}
                    onChange={(e, value) => handleSettingChange('shortBreak', value)}
                    step={1}
                    marks
                    min={1}
                    max={15}
                    valueLabelDisplay="auto"
                  />
                  <TextField
                    value={settings.shortBreak}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 1 && value <= 15) {
                        handleSettingChange('shortBreak', value);
                      }
                    }}
                    type="number"
                    InputProps={{ inputProps: { min: 1, max: 15 } }}
                    size="small"
                    sx={{ width: '80px', mt: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Uzun Mola Süresi (dakika)
                  </Typography>
                  <Slider
                    value={settings.longBreak}
                    onChange={(e, value) => handleSettingChange('longBreak', value)}
                    step={1}
                    marks
                    min={5}
                    max={30}
                    valueLabelDisplay="auto"
                  />
                  <TextField
                    value={settings.longBreak}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 5 && value <= 30) {
                        handleSettingChange('longBreak', value);
                      }
                    }}
                    type="number"
                    InputProps={{ inputProps: { min: 5, max: 30 } }}
                    size="small"
                    sx={{ width: '80px', mt: 1 }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowSettings(false)} color="inherit">
                İptal
              </Button>
              <Button 
                onClick={() => {
                  saveSettings();
                  setShowSettings(false);
                }} 
                variant="contained" 
                color="primary"
              >
                Kaydet
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
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
        </>
      )}
    </Box>
  );
};

export default PomodoroTimer;