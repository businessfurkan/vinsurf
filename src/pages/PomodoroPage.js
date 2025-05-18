import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Button,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import PomodoroTimer from '../components/PomodoroTimer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
// SettingsIcon kullanılmadığı için kaldırıldı
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
// FlagIcon kullanılmadığı için kaldırıldı
import AssignmentIcon from '@mui/icons-material/Assignment';

const PomodoroPage = () => {
  const theme = useTheme();

  // Pomodoro state'leri
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 dakika
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [muted, setMuted] = useState(false);

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
        changeMode('shortBreak');
      } else {
        changeMode('pomodoro');
      }

      // Ses çalma
      if (!muted) {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
        audio.play();
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, muted]);

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
      }}
    >
      <Container maxWidth="xl" sx={{ height: '100%' }}>
        <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'flex-start' },
            mb: { xs: 3, sm: 4, md: 5 },
            gap: 2
          }}
        >
          <TimerIcon 
            sx={{ 
              fontSize: { xs: 32, sm: 40, md: 48 },
              color: '#333', // Mor yerine koyu gri
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
            }} 
          />
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              color: '#333', // Mor yerine koyu gri
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.6rem' },
              textAlign: { xs: 'center', md: 'left' },
              letterSpacing: '-0.5px',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: '60px',
                height: '4px',
                borderRadius: '2px',
                background: '#333', // Mor yerine koyu gri
                display: { xs: 'none', md: 'block' }
              }
            }}
          >
            Pomodoro Tekniği
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Timer Card - Genişletilmiş ve yeniden tasarlanmış */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 4,
                background: 'rgba(255, 255, 240, 0.7)', // FFFFF0 ile uyumlu
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                  <LocalFireDepartmentIcon 
                    sx={{ 
                      color: '#333', // Mor yerine koyu gri
                      fontSize: 28,
                      filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2))',
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#333', // Mor yerine koyu gri
                      fontSize: { xs: '1.4rem', sm: '1.6rem' },
                    }}
                  >
                    Pomodoro Zamanlayıcı
                  </Typography>
                </Box>

                {/* Özel Pomodoro Zamanlayıcı Tasarımı - Yayvan ve Modern */}
                <Box sx={{ 
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: 3,
                  p: { xs: 2, sm: 3, md: 4 },
                  mb: 4,
                  background: 'rgba(255, 255, 240, 0.9)', // FFFFF0 ile uyumlu
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                  width: '100%',
                  maxWidth: '100%'
                }}>
                  {/* Mod Seçici */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    mb: 3,
                    width: '100%'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}>
                      <Button 
                        variant={mode === 'pomodoro' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => changeMode('pomodoro')}
                        sx={{ 
                          borderRadius: '8px 0 0 8px',
                          px: 2,
                          py: 1,
                          minWidth: 100,
                          fontWeight: mode === 'pomodoro' ? 700 : 500,
                          borderColor: mode === 'pomodoro' ? 'transparent' : 'rgba(0, 0, 0, 0.08)',
                          backgroundColor: mode === 'pomodoro' ? '#333' : 'rgba(255, 255, 240, 0.8)',
                          color: mode === 'pomodoro' ? 'white' : '#333',
                          '&:hover': {
                            backgroundColor: mode === 'pomodoro' ? '#222' : 'rgba(255, 255, 240, 0.9)',
                          }
                        }}
                      >
                        Pomodoro
                      </Button>
                      <Button 
                        variant={mode === 'shortBreak' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => changeMode('shortBreak')}
                        sx={{ 
                          borderRadius: 0,
                          px: 2,
                          py: 1,
                          minWidth: 100,
                          fontWeight: mode === 'shortBreak' ? 700 : 500,
                          borderColor: mode === 'shortBreak' ? 'transparent' : 'rgba(0, 0, 0, 0.08)',
                          backgroundColor: mode === 'shortBreak' ? '#333' : 'rgba(255, 255, 240, 0.8)',
                          color: mode === 'shortBreak' ? 'white' : '#333',
                          '&:hover': {
                            backgroundColor: mode === 'shortBreak' ? '#222' : 'rgba(255, 255, 240, 0.9)',
                          }
                        }}
                      >
                        Kısa Mola
                      </Button>
                      <Button 
                        variant={mode === 'longBreak' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => changeMode('longBreak')}
                        sx={{ 
                          borderRadius: '0 8px 8px 0',
                          px: 2,
                          py: 1,
                          minWidth: 100,
                          fontWeight: mode === 'longBreak' ? 700 : 500,
                          borderColor: mode === 'longBreak' ? 'transparent' : 'rgba(0, 0, 0, 0.08)',
                          backgroundColor: mode === 'longBreak' ? '#333' : 'rgba(255, 255, 240, 0.8)',
                          color: mode === 'longBreak' ? 'white' : '#333',
                          '&:hover': {
                            backgroundColor: mode === 'longBreak' ? '#222' : 'rgba(255, 255, 240, 0.9)',
                          }
                        }}
                      >
                        Uzun Mola
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Ana Zamanlayıcı Alanı - Genişletilmiş Yatay Tasarım */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'center', md: 'flex-start' },
                    justifyContent: 'space-between',
                    gap: { xs: 4, md: 6 },
                    my: 4,
                    px: { xs: 2, sm: 3, md: 4 },
                    width: '100%',
                    maxWidth: '100%'
                  }}>
                    {/* Sol taraf - Zamanlayıcı */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: { xs: 'center', md: 'flex-start' },
                      flex: { xs: '1', md: '0 0 40%' },
                      mr: { md: 4 }
                    }}>
                      <Typography
                        variant="h1"
                        component="div"
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: { xs: '4rem', sm: '5rem', md: '6rem' },
                          lineHeight: 1,
                          color: '#333',
                          mb: 1
                        }}
                      >
                        {formatTime(timeLeft)}
                      </Typography>
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
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.85rem'
                        }}
                      >
                        {mode === 'pomodoro' ? 'Çalışma' : mode === 'shortBreak' ? 'Kısa Mola' : 'Uzun Mola'}
                      </Typography>
                    </Box>

                    {/* Sağ taraf - Kontroller */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'row', sm: 'column' },
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleStartPause}
                        startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
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
                        <Tooltip title="Hedef Belirle">
                          <IconButton 
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
                </Box>
                
                {/* Gizli PomodoroTimer bileşeni */}
                <Box sx={{ display: 'none' }}>
                  <PomodoroTimer />
                </Box>
                
                <Typography 
                  variant="body1"
                  sx={{ 
                    textAlign: 'center',
                    color: alpha(theme.palette.text.primary, 0.8),
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    mt: 1,
                  }}
                >
                  Zamanlayıcıyı başlatın, odaklanın ve verimliliğinizi artırın!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Info Card */}
          <Grid item xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.light, 0.03)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                overflow: 'hidden',
                boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.08)}`,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 15px 50px ${alpha(theme.palette.common.black, 0.12)}`,
                },
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                  <SelfImprovementIcon 
                    sx={{ 
                      color: theme.palette.secondary.main,
                      fontSize: 28,
                      filter: `drop-shadow(0 2px 5px ${alpha(theme.palette.secondary.main, 0.4)})`,
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '1.4rem', sm: '1.6rem' },
                      background: `linear-gradient(90deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Verimli Çalışma
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha(theme.palette.text.primary, 0.8),
                    mb: 2,
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                  }}
                >
                  Pomodoro tekniği, 25 dakikalık odaklanmış çalışma ve 5 dakikalık kısa molalardan oluşan bilimsel bir zaman yönetimi metodudur.
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexWrap: 'wrap', 
                  mb: 2,
                  justifyContent: 'center' 
                }}>
                  <Chip 
                    label="Odaklanma" 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      borderRadius: '12px',
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                    }}
                  />
                  <Chip 
                    label="Verimlilik" 
                    color="secondary" 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      borderRadius: '12px',
                      boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.15)}`,
                    }}
                  />
                  <Chip 
                    label="Motivasyon" 
                    color="success" 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      borderRadius: '12px',
                      boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.15)}`,
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha(theme.palette.text.primary, 0.8),
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                  }}
                >
                  Bu metodu kullanarak daha verimli çalışabilir, konsantrasyonunuzu artırabilir ve zihinsel yorgunluğu azaltabilirsiniz.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Pomodoro Bilgi Kartı */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.7)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                overflow: 'hidden',
                boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.06)}`,
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3, 
                  gap: 1.5,
                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  pb: 2
                }}>
                  <AccessTimeIcon 
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontSize: 28,
                      filter: `drop-shadow(0 2px 5px ${alpha(theme.palette.primary.main, 0.3)})`,
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '1.4rem', sm: '1.6rem' },
                      color: theme.palette.primary.main,
                    }}
                  >
                    Pomodoro Tekniği Hakkında
                  </Typography>
                </Box>
                
                <Grid container spacing={4}>
                  {/* Sol Taraf - Açıklama */}
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: alpha(theme.palette.text.primary, 0.9),
                        mb: 3,
                        fontSize: '0.95rem',
                        lineHeight: 1.7,
                        position: 'relative',
                        pl: { md: 2 },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '3px',
                          borderRadius: '3px',
                          background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          display: { xs: 'none', md: 'block' }
                        }
                      }}
                    >
                      Pomodoro Tekniği, 1980&apos;li yıllarda Francesco Cirillo tarafından geliştirilen bir zaman yönetimi metodudur. 
                      İtalyanca &quot;domates&quot; anlamına gelen &quot;pomodoro&quot; kelimesi, Cirillo&apos;nun üniversite öğrencisiyken kullandığı domates şeklindeki mutfak zamanlayıcısından gelmektedir.
                    </Typography>
                    
                    <Box sx={{ 
                      p: 2.5, 
                      borderRadius: 3, 
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      mb: 3
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          mb: 2,
                          color: theme.palette.primary.main,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <EmojiEventsIcon fontSize="small" />
                        Pomodoro Tekniğinin Faydaları
                      </Typography>
                      
                      <Grid container spacing={1}>
                        {[
                          "Dikkat dağınıklığını azaltır",
                          "Zaman yönetimini geliştirir",
                          "Erteleme davranışını azaltır",
                          "Verimliliği artırır",
                          "Motivasyonu yüksek tutar",
                          "Zihinsel yorgunluğu azaltır"
                        ].map((benefit, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5,
                              mb: 1
                            }}>
                              <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: theme.palette.primary.main,
                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
                              }} />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 500,
                                  color: alpha(theme.palette.text.primary, 0.9),
                                }}
                              >
                                {benefit}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Grid>
                  
                  {/* Sağ Taraf - Adımlar */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 2.5, 
                      borderRadius: 3, 
                      bgcolor: alpha(theme.palette.secondary.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                      height: '100%'
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          mb: 2.5,
                          color: theme.palette.secondary.main,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <TimerIcon fontSize="small" />
                        Pomodoro Tekniğinin Adımları
                      </Typography>
                      
                      {[
                        {
                          title: "Görev Belirleme",
                          desc: "Yapmak istediğiniz görevi belirleyin."
                        },
                        {
                          title: "Zamanlayıcıyı Ayarlama",
                          desc: "Zamanlayıcıyı 25 dakikaya ayarlayın (bir pomodoro)."
                        },
                        {
                          title: "Çalışma",
                          desc: "Zamanlayıcı çalana kadar göreve odaklanın. Bu süre içinde dikkat dağıtıcı şeylerden uzak durun."
                        },
                        {
                          title: "Kısa Mola",
                          desc: "Zamanlayıcı çaldığında 5 dakikalık bir mola verin."
                        },
                        {
                          title: "Tekrarlama",
                          desc: "Dört pomodoro tamamlandıktan sonra, 15-30 dakikalık daha uzun bir mola verin."
                        }
                      ].map((step, index) => (
                        <Box key={index} sx={{ 
                          mb: 2, 
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 2
                        }}>
                          <Box sx={{ 
                            width: 28, 
                            height: 28, 
                            borderRadius: '50%', 
                            bgcolor: alpha(theme.palette.secondary.main, 0.15),
                            color: theme.palette.secondary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            flexShrink: 0,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.secondary.main, 0.1)}`
                          }}>
                            {index + 1}
                          </Box>
                          <Box>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                mb: 0.5,
                                color: theme.palette.secondary.main
                              }}
                            >
                              {step.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: alpha(theme.palette.text.primary, 0.8),
                                fontSize: '0.9rem',
                                lineHeight: 1.5
                              }}
                            >
                              {step.desc}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PomodoroPage;
