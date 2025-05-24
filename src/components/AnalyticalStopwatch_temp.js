import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, 
  Accordion, AccordionSummary, AccordionDetails,
  DialogTitle, DialogContent, DialogActions,
  CircularProgress, Divider, Avatar, Chip
} from '@mui/material';

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import SaveIcon from '@mui/icons-material/Save';
import TimerIcon from '@mui/icons-material/Timer';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import Dialog from '@mui/material/Dialog';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

import yksData from '../utils/yksData';

const AnalyticalStopwatch = () => {
  const [user] = useAuthState(auth);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ders renklerini tanımlayalım
  const subjectColors = {
    'Türkçe': '#FF5722',
    'Matematik': '#2196F3',
    'Fizik': '#F44336',
    'Kimya': '#FF9800',
    'Biyoloji': '#4CAF50',
    'Tarih': '#9C27B0',
    'Coğrafya': '#795548',
    'Felsefe': '#607D8B',
    'Din Kültürü': '#009688',
    'Yabancı Dil': '#3F51B5',
    'Geometri': '#00BCD4'
  };
  
  // Seçilen dersin rengini alalım
  const selectedColor = selectedSubject ? subjectColors[selectedSubject] || '#2196F3' : '#2196F3';

  // Zamanlayıcı için useEffect
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (!isRunning && time !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, time]);

  // Firestore'dan çalışma kayıtlarını getir
  const fetchStudyRecords = useCallback(async () => {
    if (!user) return;
    
    try {
      const recordsQuery = query(
        collection(db, 'studyRecords'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(recordsQuery);
      const records = [];
      
      querySnapshot.forEach((doc) => {
        records.push(doc.data());
      });
      
    } catch (error) {
      console.error('Error fetching study records:', error);
    }
  }, [user]);

  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchStudyRecords();
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchStudyRecords]);

  // Kaydet butonuna tıklandığında

  // Kaydet butonuna tıklandığında
  const handleSaveStudy = () => {
    setShowSaveDialog(true);
  };

  // Kaydetmeyi onayla
  const handleConfirmSave = () => {
    saveStudyRecord();
    setShowSaveDialog(false);
  };

  // Kaydetmeyi iptal et
  const handleCancelSave = () => {
    setShowSaveDialog(false);
  };

  // Zamanlayıcıyı sıfırla
  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
  };

  // Çalışma kaydını Firestore'a kaydet
  const saveStudyRecord = async () => {
    if (!user || !selectedSubject || !selectedTopic || time === 0) return;
    
    try {
      await addDoc(collection(db, 'studyRecords'), {
        userId: user.uid,
        subject: selectedSubject,
        topic: selectedTopic,
        duration: time,
        timestamp: new Date()
      });
      
      // Başarılı kayıt sonrası işlemler
      setTime(0);
      alert('Çalışma kaydınız başarıyla kaydedildi!');
      
    } catch (error) {
      console.error('Error saving study record:', error);
      alert('Kayıt sırasında bir hata oluştu.');
    }
  };

  // Zamanı formatla
  const formatTime = (seconds, isForDisplay = false) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (isForDisplay) {
      // Kronometre gösterimi için format
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      // Diğer yerler için daha okunabilir format
      let formattedTime = '';
      
      if (hours > 0) {
        formattedTime += `${hours} saat `;
      }
      
      if (minutes > 0 || hours > 0) {
        formattedTime += `${minutes} dakika `;
      }
      
      formattedTime += `${remainingSeconds} saniye`;
      
      return formattedTime;
    }
  };

  // Alt konu tıklandığında
  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
  };

  // Çalışmaya başla butonuna tıklandığında
  const handleStartStudy = (subject, topic) => {
    setSelectedSubject(subject);
    setSelectedTopic(topic);
    
    // Kronometre bölümüne kaydır
    const timerElement = document.getElementById('timer-section');
    if (timerElement) {
      timerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Yükleme durumunda gösterilecek içerik
  if (isLoading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: '#55b3d9' }} />
      </Box>
    );
  }

  // Ana içerik
  return (
    <Box sx={{ 
      width: '100%',
      background: 'linear-gradient(135deg, rgba(240,249,255,0.2) 0%, rgba(229,239,255,0.1) 100%)',
      borderRadius: '20px',
      padding: { xs: 2, sm: 3 },
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: `linear-gradient(90deg, ${selectedColor || '#2196F3'} 0%, ${selectedColor || '#2196F3'}80 100%)`,
        zIndex: 1
      }
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50px',
          left: '-50px',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${selectedColor || '#2196F3'}15 0%, ${selectedColor || '#2196F3'}01 70%)`,
          filter: 'blur(30px)',
          zIndex: 0
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-50px',
          right: '-50px',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${selectedColor || '#2196F3'}10 0%, ${selectedColor || '#2196F3'}01 70%)`,
          filter: 'blur(30px)',
          zIndex: 0
        }
      }}>
        {/* Ders ve konu seçimi */}
        <Card sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 50%' },
          borderRadius: '20px', 
          boxShadow: '0 15px 35px rgba(0,0,0,0.06), 0 5px 15px rgba(0,0,0,0.03)',
          border: `1px solid ${selectedColor || '#2196F3'}15`,
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          '&:hover': {
            boxShadow: `0 20px 40px rgba(0,0,0,0.08), 0 8px 20px ${selectedColor || '#2196F3'}15`,
            transform: 'translateY(-3px)'
          },
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `
              radial-gradient(circle at 90% 10%, ${selectedColor || '#2196F3'}08 0%, transparent 20%),
              radial-gradient(circle at 10% 90%, ${selectedColor || '#2196F3'}08 0%, transparent 20%)
            `,
            opacity: 0.5,
            zIndex: 0
          }
        }}>
          <CardContent sx={{ p: 3.5 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 3
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 700, 
                  display: 'flex',
                  alignItems: 'center',
                  color: selectedColor || 'primary.main',
                  '&::before': {
                    content: '""',
                    display: 'block',
                    width: 4,
                    height: 24,
                    backgroundColor: selectedColor || 'primary.main',
                    borderRadius: 4,
                    marginRight: 1.5
                  }
                }}
              >
                Ders ve Konu Seçimi
              </Typography>
              
              {selectedSubject && selectedTopic && (
                <Chip 
                  icon={<MenuBookIcon sx={{ fontSize: '0.9rem !important' }} />}
                  label="Seçim Yapıldı"
                  size="small"
                  color="success"
                  sx={{ 
                    fontWeight: 600,
                    borderRadius: '8px',
                    '& .MuiChip-icon': { color: 'inherit' }
                  }}
                />
              )}
            </Box>
            
            {/* Ders Akordiyonları */}
            <Box sx={{ maxHeight: '400px', overflow: 'auto', pr: 1 }}>
              {Object.keys(yksData).map((subject) => (
                <Accordion 
                  key={subject}
                  expanded={expandedSubject === subject}
                  onChange={() => setExpandedSubject(expandedSubject === subject ? null : subject)}
                  sx={{ 
                    mb: 1.5, 
                    boxShadow: 'none',
                    border: `1px solid ${expandedSubject === subject ? subjectColors[subject] : '#e0e0e080'}`,
                    borderRadius: '12px !important',
                    overflow: 'hidden',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      margin: '8px 0 16px',
                      boxShadow: `0 8px 20px ${subjectColors[subject]}20`
                    },
                    background: expandedSubject === subject ? 
                      `linear-gradient(135deg, ${subjectColors[subject]}08 0%, ${subjectColors[subject]}02 100%)` : 
                      'rgba(255,255,255,0.6)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: expandedSubject === subject ? 
                          `${subjectColors[subject]}20` : 'rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                      }}>
                        <ExpandMoreIcon sx={{ 
                          fontSize: '1.1rem',
                          color: expandedSubject === subject ? subjectColors[subject] : 'text.secondary'
                        }} />
                      </Box>
                    }
                    sx={{ 
                      borderRadius: '12px',
                      minHeight: '54px',
                      backgroundColor: expandedSubject === subject ? 
                        `${subjectColors[subject]}10` : 'transparent',
                      '&:hover': {
                        backgroundColor: `${subjectColors[subject]}08`
                      },
                      '& .MuiAccordionSummary-content': {
                        margin: '12px 0'
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1.5
                    }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: `${subjectColors[subject]}20`,
                          color: subjectColors[subject],
                          fontWeight: 700,
                          fontSize: '0.9rem'
                        }}
                      >
                        {subject.charAt(0)}
                      </Avatar>
                      
                      <Typography sx={{ 
                        fontWeight: expandedSubject === subject ? 700 : 600,
                        fontSize: '0.95rem',
                        color: expandedSubject === subject ? subjectColors[subject] : 'text.primary'
                      }}>
                        {subject}
                      </Typography>
                      
                      {selectedSubject === subject && (
                        <Chip 
                          label="Seçili"
                          size="small"
                          sx={{ 
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            backgroundColor: `${subjectColors[subject]}20`,
                            color: subjectColors[subject],
                            borderRadius: '4px'
                          }}
                        />
                      )}
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails sx={{ p: 2, pt: 0.5 }}>
                    <Divider sx={{ 
                      my: 1.5, 
                      borderColor: `${subjectColors[subject]}30`,
                      opacity: 0.5
                    }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                      {yksData[subject] && yksData[subject].topics && Array.isArray(yksData[subject].topics) ? (
                        yksData[subject].topics.map((topic) => (
                          <Box 
                            key={topic} 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              backgroundColor: selectedTopic === topic ? 
                                `${subjectColors[subject]}10` : 'transparent',
                              borderRadius: '10px',
                              padding: '2px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Button
                              variant={selectedTopic === topic ? "contained" : "outlined"}
                              size="small"
                              onClick={() => handleTopicClick(topic)}
                              sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                justifyContent: 'flex-start',
                                pl: 2,
                                py: 1,
                                fontWeight: selectedTopic === topic ? 600 : 500,
                                fontSize: '0.9rem',
                                color: selectedTopic === topic ? '#fff' : subjectColors[subject],
                                borderColor: selectedTopic === topic ? 'transparent' : `${subjectColors[subject]}40`,
                                backgroundColor: selectedTopic === topic ? 
                                  `linear-gradient(45deg, ${subjectColors[subject]} 0%, ${subjectColors[subject]}d0 100%)` : 
                                  'transparent',
                                '&:hover': {
                                  backgroundColor: selectedTopic === topic ? 
                                    `linear-gradient(45deg, ${subjectColors[subject]}e0 0%, ${subjectColors[subject]} 100%)` : 
                                    `${subjectColors[subject]}15`,
                                  borderColor: selectedTopic === topic ? 'transparent' : subjectColors[subject],
                                },
                                transition: 'all 0.3s ease',
                                boxShadow: selectedTopic === topic ? 
                                  `0 4px 12px ${subjectColors[subject]}40` : 
                                  'none',
                                flex: 1
                              }}
                            >
                              {topic}
                            </Button>
                            
                            {/* Konu için Çalışmaya Başla butonu */}
                            <Button
                              variant="contained"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartStudy(subject, topic);
                              }}
                              sx={{
                                ml: 1,
                                mr: 0.5,
                                borderRadius: '8px',
                                textTransform: 'none',
                                background: `linear-gradient(45deg, ${subjectColors[subject]} 0%, ${subjectColors[subject]}d0 100%)`,
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                minWidth: 'auto',
                                py: 0.7,
                                px: 1.5,
                                '&:hover': {
                                  background: `linear-gradient(45deg, ${subjectColors[subject]}d0 0%, ${subjectColors[subject]} 100%)`,
                                  boxShadow: `0 4px 12px ${subjectColors[subject]}40`
                                },
                                '&:active': {
                                  transform: 'scale(0.97)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Seç
                            </Button>
                          </Box>
                        ))
                      ) : (
                        <Typography sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
                          Veri bulunamadı veya format hatalı
                        </Typography>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Kronometre Kartı */}
        <Card id="timer-section" sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 50%' },
          borderRadius: '20px', 
          boxShadow: '0 15px 35px rgba(0,0,0,0.06), 0 5px 15px rgba(0,0,0,0.03)',
          border: `1px solid ${selectedColor || '#2196F3'}15`,
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `
              radial-gradient(circle at 90% 10%, ${selectedColor || '#2196F3'}08 0%, transparent 20%),
              radial-gradient(circle at 10% 90%, ${selectedColor || '#2196F3'}08 0%, transparent 20%)
            `,
            opacity: 0.5,
            zIndex: 0
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            {/* Başlık */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 3
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  color: selectedColor || 'primary.main',
                  '&::before': {
                    content: '""',
                    display: 'block',
                    width: 4,
                    height: 24,
                    backgroundColor: selectedColor || 'primary.main',
                    borderRadius: 4,
                    marginRight: 1.5
                  }
                }}
              >
                Analizli Kronometre
              </Typography>
              
              <Chip 
                icon={<AccessTimeIcon sx={{ fontSize: '1rem !important' }} />}
                label={isRunning ? 'Çalışıyor' : 'Hazır'}
                size="small"
                color={isRunning ? 'success' : 'warning'}
                sx={{ 
                  fontWeight: 600,
                  borderRadius: '8px',
                  '& .MuiChip-icon': { color: 'inherit' }
                }}
              />
            </Box>
            
            {/* Modern Kronometre */}
            <Box sx={{ 
              position: 'relative',
              mb: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${selectedColor}20 0%, ${selectedColor}05 70%)`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                filter: 'blur(30px)',
                zIndex: 0
              }
            }}>
              <Box sx={{ 
                position: 'relative',
                width: { xs: '240px', sm: '280px' },
                height: { xs: '240px', sm: '280px' },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)`,
                backdropFilter: 'blur(10px)',
                border: `2px solid ${selectedColor}30`,
                boxShadow: `0 15px 35px ${selectedColor}25, inset 0 2px 15px rgba(255,255,255,0.15)`,
                mb: 3,
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: '94%',
                  height: '94%',
                  borderRadius: '50%',
                  border: `4px solid transparent`,
                  borderTopColor: selectedColor,
                  borderRightColor: `${selectedColor}60`,
                  animation: isRunning ? 'spin 4s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': {
                      transform: 'rotate(0deg)'
                    },
                    '100%': {
                      transform: 'rotate(360deg)'
                    }
                  }
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '86%',
                  height: '86%',
                  borderRadius: '50%',
                  border: `3px solid transparent`,
                  borderBottomColor: `${selectedColor}90`,
                  borderLeftColor: `${selectedColor}40`,
                  animation: isRunning ? 'spin-reverse 6s linear infinite' : 'none',
                  '@keyframes spin-reverse': {
                    '0%': {
                      transform: 'rotate(0deg)'
                    },
                    '100%': {
                      transform: 'rotate(-360deg)'
                    }
                  }
                }
              }}>
                {/* Arka plan efektleri */}
                <Box sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  opacity: 0.1,
                  background: `
                    radial-gradient(circle at 20% 20%, ${selectedColor} 0%, transparent 20%),
                    radial-gradient(circle at 80% 80%, ${selectedColor} 0%, transparent 20%),
                    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 40%)
                  `,
                  zIndex: 1
                }} />
                
                {/* Zaman gösterimi */}
                <Typography variant="h1" align="center" sx={{ 
                  fontSize: { xs: '3rem', sm: '3.8rem', md: '4.2rem' },
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: selectedColor,
                  textShadow: `0 2px 20px ${selectedColor}70`,
                  letterSpacing: 2,
                  position: 'relative',
                  zIndex: 2
                }}>
                  {formatTime(time, true)}
                </Typography>
                
                {/* Üst ikon */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: '15%', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  backgroundColor: `${selectedColor}20`,
                  padding: '6px',
                  borderRadius: '50%',
                  boxShadow: `0 4px 12px ${selectedColor}30`
                }}>
                  <TimerIcon sx={{ color: selectedColor, fontSize: '1.8rem', opacity: 0.9 }} />
                </Box>
                
                {/* Alt durum metni */}
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: '15%', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Chip
                    label={isRunning ? 'ÇALIŞIYOR' : 'HAZIR'}
                    size="small"
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: 1,
                      backgroundColor: isRunning ? '#4caf5030' : '#ff980030',
                      color: isRunning ? '#4caf50' : '#ff9800',
                      border: `1px solid ${isRunning ? '#4caf5060' : '#ff980060'}`,
                      borderRadius: '12px',
                      boxShadow: `0 2px 8px ${isRunning ? '#4caf5020' : '#ff980020'}`
                    }}
                  />
                </Box>
                
                {/* Pulsating effect for running state */}
                {isRunning && (
                  <Box sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%': { boxShadow: `0 0 0 0 ${selectedColor}40` },
                      '70%': { boxShadow: `0 0 0 15px ${selectedColor}00` },
                      '100%': { boxShadow: `0 0 0 0 ${selectedColor}00` }
                    },
                    zIndex: 1
                  }} />
                )}
              </Box>
            </Box>

            {/* Seçili ders ve konu bilgisi */}
            {selectedSubject && selectedTopic && (
              <Box sx={{ 
                py: 1.5, 
                px: 2, 
                mb: 3, 
                backgroundColor: `${selectedColor}10`,
                borderRadius: '12px', 
                border: `1px solid ${selectedColor}30`,
                color: selectedColor,
                fontWeight: 500,
                letterSpacing: 0.5,
                textAlign: 'center',
                boxShadow: `0 4px 12px ${selectedColor}20`,
                maxWidth: '90%',
                width: '100%',
                position: 'relative',
                zIndex: 1
              }}>
                <span style={{ fontWeight: 700 }}>{selectedSubject}</span> - {selectedTopic}
              </Box>
            )}
            
            {/* Butonlar */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2.5, 
              mt: 4, 
              position: 'relative',
              zIndex: 1
            }}>
              {!isRunning ? (
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon sx={{ fontSize: 28 }} />}
                  onClick={() => {
                    if (!selectedSubject || !selectedTopic) {
                      alert('Lütfen önce bir ders ve konu seçin!');
                      return;
                    }
                    setIsRunning(true);
                  }}
                  disabled={!selectedSubject || !selectedTopic}
                  sx={{
                    borderRadius: 99,
                    px: 5,
                    py: 1.8,
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    background: `linear-gradient(45deg, ${selectedColor} 0%, ${selectedColor}90 100%)`,
                    color: '#fff',
                    textTransform: 'none',
                    boxShadow: `0 10px 25px ${selectedColor}40`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${selectedColor}90 0%, ${selectedColor} 100%)`,
                      boxShadow: `0 15px 30px ${selectedColor}60`,
                      transform: 'translateY(-3px) scale(1.03)'
                    },
                    '&:active': {
                      transform: 'translateY(1px) scale(0.98)'
                    },
                    '&:disabled': {
                      background: 'linear-gradient(45deg, #e0e0e0 0%, #d5d5d5 100%)',
                      color: '#a0a0a0',
                      boxShadow: 'none'
                    },
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  Çalışmaya Başla
                </Button>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  flexWrap: 'wrap', 
                  justifyContent: 'center',
                  width: '100%',
                  maxWidth: '500px'
                }}>
                  <Button
                    variant="contained"
                    startIcon={<PauseIcon sx={{ fontSize: 22 }} />}
                    onClick={() => setIsRunning(false)}
                    sx={{
                      flex: 1,
                      minWidth: '140px',
                      borderRadius: 99,
                      px: 2,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      background: 'linear-gradient(45deg, #FF9966 0%, #FF5E62 100%)',
                      color: '#fff',
                      textTransform: 'none',
                      boxShadow: '0 8px 20px rgba(255, 94, 98, 0.25)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FF5E62 0%, #FF9966 100%)',
                        boxShadow: '0 12px 25px rgba(255, 94, 98, 0.35)',
                        transform: 'translateY(-2px)'
                      },
                      '&:active': {
                        transform: 'translateY(1px) scale(0.98)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Duraklat
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<StopIcon sx={{ fontSize: 22 }} />}
                    onClick={handleReset}
                    sx={{
                      flex: 1,
                      minWidth: '140px',
                      borderRadius: 99,
                      px: 2,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      background: 'linear-gradient(45deg, #8E2DE2 0%, #4A00E0 100%)',
                      color: '#fff',
                      textTransform: 'none',
                      boxShadow: '0 8px 20px rgba(142, 45, 226, 0.25)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #4A00E0 0%, #8E2DE2 100%)',
                        boxShadow: '0 12px 25px rgba(142, 45, 226, 0.35)',
                        transform: 'translateY(-2px)'
                      },
                      '&:active': {
                        transform: 'translateY(1px) scale(0.98)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Sıfırla
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon sx={{ fontSize: 22 }} />}
                    onClick={handleSaveStudy}
                    sx={{
                      flex: 1,
                      minWidth: '140px',
                      borderRadius: 99,
                      px: 2,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      background: 'linear-gradient(45deg, #00b09b 0%, #96c93d 100%)',
                      color: '#fff',
                      textTransform: 'none',
                      boxShadow: '0 8px 20px rgba(0, 176, 155, 0.25)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #96c93d 0%, #00b09b 100%)',
                        boxShadow: '0 12px 25px rgba(0, 176, 155, 0.35)',
                        transform: 'translateY(-2px)'
                      },
                      '&:active': {
                        transform: 'translateY(1px) scale(0.98)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Kaydet
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* Kaydetme Dialog'u */}
      <Dialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            p: 1
          }
        }}
      >
        <DialogTitle>Çalışma Kaydı</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedSubject} - {selectedTopic} için {formatTime(time, false)} süresince çalıştınız. 
            Bu çalışmayı kaydetmek istiyor musunuz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSave} color="error">
            Kaydetme
          </Button>
          <Button onClick={handleConfirmSave} color="primary" startIcon={<SaveIcon />}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalyticalStopwatch;
