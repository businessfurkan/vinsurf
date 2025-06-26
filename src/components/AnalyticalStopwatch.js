import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, 
  DialogTitle, DialogContent, DialogActions,
  CircularProgress, Avatar, Chip
} from '@mui/material';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import TimerIcon from '@mui/icons-material/Timer';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Ders logoları için ikonlar
import MenuBookIcon from '@mui/icons-material/MenuBook'; // Türkçe, Edebiyat
import PublicIcon from '@mui/icons-material/Public'; // Sosyal Bilimler, Coğrafya
import CalculateIcon from '@mui/icons-material/Calculate'; // Matematik, Temel Matematik
import ScienceIcon from '@mui/icons-material/Science'; // Fen Bilimleri, Fizik, Kimya
import BioIcon from '@mui/icons-material/Biotech'; // Biyoloji
import HistoryIcon from '@mui/icons-material/History'; // Tarih
import PsychologyIcon from '@mui/icons-material/Psychology'; // Felsefe
import TempleBuddhistIcon from '@mui/icons-material/TempleHindu'; // Din Kültürü

import Dialog from '@mui/material/Dialog';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

import yksData from '../utils/yksData';

const AnalyticalStopwatch = () => {
  const [user] = useAuthState(auth);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState(''); // TYT veya AYT
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ders renklerini tanımlayalım
  const subjectColors = {
    // TYT Dersleri
    'Türkçe': '#4285f4',
    'Sosyal Bilimler': '#9c27b0',
    'Temel Matematik': '#34a853',
    'Fen Bilimleri': '#ea4335',
    // AYT Dersleri
    'Matematik': '#34a853',
    'Edebiyat': '#ff5722',
    'Fizik': '#ea4335',
    'Biyoloji': '#0f9d58',
    'Kimya': '#fbbc05',
    'Tarih': '#9c27b0',
    'Coğrafya': '#795548',
    'Felsefe': '#607d8b',
    'Din Kültürü': '#00bcd4'
  };
  
  // Seçilen dersin rengini alalım
  const selectedColor = selectedSubject ? subjectColors[selectedSubject] || '#2196F3' : '#2196F3';

  // Ders logolarını tanımlayalım
  const subjectIcons = {
    // TYT Dersleri
    'Türkçe': <MenuBookIcon />,
    'Sosyal Bilimler': <PublicIcon />,
    'Temel Matematik': <CalculateIcon />,
    'Fen Bilimleri': <ScienceIcon />,
    // AYT Dersleri
    'Matematik': <CalculateIcon />,
    'Edebiyat': <MenuBookIcon />,
    'Fizik': <ScienceIcon />,
    'Biyoloji': <BioIcon />,
    'Kimya': <ScienceIcon />,
    'Tarih': <HistoryIcon />,
    'Coğrafya': <PublicIcon />,
    'Felsefe': <PsychologyIcon />,
    'Din Kültürü': <TempleBuddhistIcon />
  };

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

  // Çalışma kaydını Firestore'a kaydet
  const saveStudyRecord = async () => {
    if (!user) {
      alert('Kaydedebilmek için giriş yapmalısınız.');
      return;
    }

    if (time <= 0) {
      alert('Kaydedilecek bir çalışma süresi yok.');
      return;
    }

    try {
      // Çalışma kaydı verileri
      const studyData = {
        userId: user.uid,
        examType: selectedExamType,
        subject: selectedSubject,
        topic: selectedTopic,
        duration: time, // milisaniye cinsinden süre
        timestamp: new Date(),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD formatında tarih
        formattedDuration: formatTime(time, false) // Okunabilir süre formatı
      };

      // Çalışma kaydını Firestore'a ekle
      await addDoc(collection(db, 'studyRecords'), studyData);
      
      // Kullanıcının toplam çalışma istatistiklerini güncelle
      // Önce mevcut istatistikleri kontrol et
      const statsQuery = query(
        collection(db, 'studyStats'), 
        where('userId', '==', user.uid),
        where('examType', '==', selectedExamType),
        where('subject', '==', selectedSubject)
      );
      
      const statsSnapshot = await getDocs(statsQuery);
      
      if (statsSnapshot.empty) {
        // Yeni istatistik oluştur
        await addDoc(collection(db, 'studyStats'), {
          userId: user.uid,
          examType: selectedExamType,
          subject: selectedSubject,
          totalDuration: time,
          sessionCount: 1,
          lastUpdated: new Date()
        });
      } else {
        // Mevcut istatistiği güncelle
        const statsDoc = statsSnapshot.docs[0];
        const currentStats = statsDoc.data();
        
        await updateDoc(statsDoc.ref, {
          totalDuration: currentStats.totalDuration + time,
          sessionCount: currentStats.sessionCount + 1,
          lastUpdated: new Date()
        });
      }
      
      // Arayüzü sıfırla
      setShowSaveDialog(false);
      setTime(0);
      setIsRunning(false);
      alert('Çalışmanız başarıyla kaydedildi!');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
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

  // Ders tıklandığında konuları göster/gizle
  const handleSubjectClick = (subject) => {
    setExpandedSubject(expandedSubject === subject ? null : subject);
  };

  // Çalışmaya başla butonuna tıklandığında
  const handleStartStudy = (subject, topic) => {
    // Çalışma zaten devam ediyorsa, kullanıcıya uyarı ver
    if (isRunning) {
      // Burada bir uyarı gösterilebilir (ileride eklenebilir)
      return;
    }
    
    // Önceki çalışma kaydedilmemişse, sıfırla
    if (time > 0) {
      setTime(0);
    }
    
    setSelectedSubject(subject);
    setSelectedTopic(topic);
    setIsRunning(true); // Çalışmaya başla butonuna basınca hemen çalışmaya başla
  };

  // Sınav türü seçimi
  const handleExamTypeSelect = (examType) => {
    setSelectedExamType(examType);
    setSelectedSubject('');
    setSelectedTopic('');
    setExpandedSubject(null);
  };

  // Yükleme durumunda gösterilecek içerik
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Ana içerik
  return (
    <Box sx={{ display: 'flex', gap: 3, height: '100%', p: 2 }}>
      {/* Sol Panel - Ders ve Konu Seçimi */}
      <Box sx={{ flex: 2, maxWidth: '500px' }}>
        <Card sx={{ 
          height: { xs: 'auto', md: '600px' }, 
          borderRadius: '20px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          background: '#1b293d',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              background: `linear-gradient(135deg, ${selectedColor}15 0%, ${selectedColor}25 100%)`,
              p: 3,
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              flexShrink: 0
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: '#ffffff',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <TimerIcon sx={{ color: selectedColor }} />
                Ders ve Konu Seçimi
              </Typography>
              <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.8 }}>
                Çalışmak istediğiniz sınav türü, ders ve konuyu seçin
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 2, 
              flex: 1, 
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(255,255,255,0.5)',
                }
              }
            }}>
              {!selectedExamType ? (
                // Sınav türü seçimi
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, textAlign: 'center' }}>
                    Sınav Türü Seçin
                  </Typography>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => handleExamTypeSelect('TYT')}
                    sx={{
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      color: '#fff',
                      py: 2,
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 10px 2px rgba(33, 150, 243, .3)'
                      }
                    }}
                  >
                    TYT (Temel Yeterlilik Testi)
                  </Button>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => handleExamTypeSelect('AYT')}
                    sx={{
                      background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                      color: '#fff',
                      py: 2,
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 3px 5px 2px rgba(255, 107, 107, .3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 10px 2px rgba(255, 107, 107, .3)'
                      }
                    }}
                  >
                    AYT (Alan Yeterlilik Testi)
                  </Button>
                </Box>
              ) : (
                // Ders ve konu seçimi
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                    <Button
                      onClick={() => setSelectedExamType('')}
                      sx={{ color: '#ffffff', minWidth: 'auto', p: 0.5, mr: 1 }}
                    >
                      ←
                    </Button>
                    <Chip 
                      label={selectedExamType} 
                      sx={{ 
                        backgroundColor: selectedExamType === 'TYT' ? '#2196F3' : '#FF6B6B',
                        color: '#fff',
                        fontWeight: 600
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1,
                    maxHeight: 'calc(100% - 60px)',
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '2px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: '2px',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.5)',
                      }
                    }
                  }}>
                    {Object.entries(yksData[selectedExamType]).map(([subject, data]) => (
                      <Box key={subject} sx={{ mb: 1 }}>
                        <Box
                          onClick={() => handleSubjectClick(subject)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.1)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.15)',
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              width: 36, 
                              height: 36, 
                              bgcolor: data.color,
                              fontSize: '0.9rem',
                              fontWeight: 600
                            }}>
                              {subjectIcons[subject]}
                            </Avatar>
                            <Typography sx={{ 
                              fontWeight: 600, 
                              color: '#ffffff',
                              fontSize: '1rem'
                            }}>
                              {subject}
                            </Typography>
                          </Box>
                          <ChevronRightIcon sx={{ 
                            color: '#ffffff',
                            transform: expandedSubject === subject ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                          }} />
                        </Box>
                        
                        {expandedSubject === subject && (
                          <Box sx={{ 
                            ml: 3, 
                            mt: 1,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            background: 'rgba(0,0,0,0.1)',
                            borderRadius: '8px',
                            p: 1,
                            '&::-webkit-scrollbar': {
                              width: '4px',
                            },
                            '&::-webkit-scrollbar-track': {
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: '2px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: 'rgba(255,255,255,0.2)',
                              borderRadius: '2px',
                              '&:hover': {
                                background: 'rgba(255,255,255,0.3)',
                              }
                            }
                          }}>
                            {data.topics.map((topic, index) => (
                              <Box
                                key={index}
                                onClick={() => handleStartStudy(subject, topic)}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 1.5,
                                  borderRadius: '8px',
                                  mt: 0.5,
                                  background: 'rgba(255,255,255,0.05)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    background: 'rgba(255,255,255,0.1)',
                                    transform: 'translateX(4px)'
                                  },
                                  cursor: 'pointer'
                                }}
                              >
                                <Typography sx={{ 
                                  fontSize: '0.9rem', 
                                  color: '#ffffff',
                                  fontWeight: 500,
                                  flex: 1
                                }}>
                                  {topic}
                                </Typography>
                                <Button
                                  size="medium"
                                  variant="contained"
                                  sx={{
                                    minWidth: '70px',
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    py: 1,
                                    px: 2,
                                    ml: 1,
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
                                    textTransform: 'none',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 8px rgba(33, 150, 243, 0.4)'
                                    }
                                  }}
                                >
                                  Başla
                                </Button>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Kronometre Kartı */}
      <Card id="timer-section" sx={{ 
        flex: 1,
        borderRadius: '20px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        background: '#1b293d',
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'auto', md: '600px' }
      }}>
        <CardContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ 
            p: 2,
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '1.1rem', 
                fontWeight: 700,
                color: '#ffffff'
              }}
            >
              Analizli Kronometre
            </Typography>
            
            <Chip 
              label={isRunning ? "ÇALIŞIYOR" : "HAZIR"}
              size="small"
              color={isRunning ? "success" : "warning"}
              sx={{ 
                fontWeight: 600,
                fontSize: '0.7rem',
                height: '24px'
              }}
            />
          </Box>
          
          {/* Kronometre Gösterimi */}
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(85, 179, 217, 0.1) 100%)'
          }}>
            {/* Daire içinde zaman gösterimi */}
            <Box sx={{ 
              width: { xs: '200px', sm: '250px' },
              height: { xs: '200px', sm: '250px' },
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              mb: 4,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.3),
                0 0 0 1px rgba(255, 255, 255, 0.1)
              `,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: `
                  0 12px 40px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4),
                  0 0 0 1px rgba(255, 255, 255, 0.2)
                `
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-6px',
                left: '-6px',
                width: 'calc(100% + 12px)',
                height: 'calc(100% + 12px)',
                borderRadius: '50%',
                background: `conic-gradient(
                  from 0deg,
                  ${selectedColor || '#2196F3'} 0deg,
                  ${selectedColor || '#2196F3'}80 90deg,
                  ${selectedColor || '#2196F3'}40 180deg,
                  ${selectedColor || '#2196F3'}20 270deg,
                  ${selectedColor || '#2196F3'} 360deg
                )`,
                animation: isRunning ? 'spinGlow 3s linear infinite' : 'none',
                opacity: isRunning ? 1 : 0.3,
                transition: 'opacity 0.3s ease',
                zIndex: -1,
                '@keyframes spinGlow': {
                  '0%': {
                    transform: 'rotate(0deg)',
                    filter: 'blur(0px)'
                  },
                  '50%': {
                    transform: 'rotate(180deg)',
                    filter: 'blur(2px)'
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                    filter: 'blur(0px)'
                  }
                }
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-3px',
                left: '-3px',
                width: 'calc(100% + 6px)',
                height: 'calc(100% + 6px)',
                borderRadius: '50%',
                border: `2px solid ${selectedColor || '#2196F3'}`,
                opacity: isRunning ? 0.6 : 0.2,
                animation: isRunning ? 'pulse 2s ease-in-out infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 0.6,
                    transform: 'scale(1)'
                  },
                  '50%': {
                    opacity: 0.8,
                    transform: 'scale(1.02)'
                  }
                }
              }
            }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}>
                <TimerIcon sx={{ 
                  color: selectedColor || '#2196F3',
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  mb: 1,
                  opacity: 0.9,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }} />
                
                <Typography variant="h1" sx={{ 
                  fontSize: { xs: '2.2rem', sm: '2.8rem' },
                  fontWeight: 800,
                  fontFamily: '"Satoshi", "Segoe UI", monospace',
                  color: '#ffffff',
                  letterSpacing: '2px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  background: `linear-gradient(135deg, #ffffff 0%, ${selectedColor || '#2196F3'}40 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))',
                  transition: 'all 0.3s ease'
                }}>
                  {formatTime(time, true)}
                </Typography>
                
                {/* Alt bilgi yazısı */}
                {selectedSubject && selectedTopic && (
                  <Typography sx={{ 
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.8)',
                    textAlign: 'center',
                    mt: 1,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    px: 2,
                    py: 0.5,
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    {selectedSubject} • {selectedTopic}
                  </Typography>
                )}
              </Box>
            </Box>
            
            {/* Butonlar */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: isRunning ? 'row' : 'column',
              gap: 2,
              mt: 3,
              width: '100%',
              maxWidth: '320px'
            }}>
              {selectedSubject && selectedTopic ? (
                !isRunning ? (
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => setIsRunning(true)}
                    sx={{
                      background: `linear-gradient(135deg, ${selectedColor || '#2196F3'} 0%, ${selectedColor || '#2196F3'}CC 50%, ${selectedColor || '#21CBF3'} 100%)`,
                      color: '#ffffff',
                      py: 1.8,
                      px: 3,
                      borderRadius: '16px',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: `0 8px 24px ${selectedColor || '#2196F3'}40`,
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${selectedColor || '#21CBF3'} 0%, ${selectedColor || '#2196F3'} 50%, ${selectedColor || '#1976D2'} 100%)`,
                        transform: 'translateY(-4px) scale(1.02)',
                        boxShadow: `0 12px 32px ${selectedColor || '#2196F3'}50`,
                        border: '1px solid rgba(255,255,255,0.3)'
                      },
                      '&:active': {
                        transform: 'translateY(-2px) scale(1.01)'
                      }
                    }}
                  >
                    Çalışmaya Başla
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      fullWidth
                      size="medium"
                      onClick={() => setIsRunning(false)}
                      sx={{
                        background: 'linear-gradient(135deg, #FF5722 0%, #FF7043 50%, #FF9800 100%)',
                        color: '#ffffff',
                        py: 1.3,
                        px: 2,
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        boxShadow: '0 6px 20px rgba(255, 87, 34, 0.4)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #FF7043 0%, #FF5722 50%, #E64A19 100%)',
                          transform: 'translateY(-3px) scale(1.02)',
                          boxShadow: '0 8px 24px rgba(255, 87, 34, 0.5)',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }
                      }}
                    >
                      Duraklat
                    </Button>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      size="medium"
                      onClick={() => {
                        setTime(0);
                        setIsRunning(false);
                      }}
                      sx={{
                        background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 50%, #E040FB 100%)',
                        color: '#ffffff',
                        py: 1.3,
                        px: 2,
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #BA68C8 0%, #9C27B0 50%, #7B1FA2 100%)',
                          transform: 'translateY(-3px) scale(1.02)',
                          boxShadow: '0 8px 24px rgba(156, 39, 176, 0.5)',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }
                      }}
                    >
                      Sıfırla
                    </Button>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      size="medium"
                      onClick={handleSaveStudy}
                      sx={{
                        background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 50%, #8BC34A 100%)',
                        color: '#ffffff',
                        py: 1.3,
                        px: 2,
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 50%, #388E3C 100%)',
                          transform: 'translateY(-3px) scale(1.02)',
                          boxShadow: '0 8px 24px rgba(76, 175, 80, 0.5)',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }
                      }}
                    >
                      Kaydet
                    </Button>
                  </>
                )
              ) : (
                <Box sx={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  p: 3,
                  textAlign: 'center'
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      lineHeight: 1.5
                    }}
                  >
                    Lütfen soldan bir ders ve konu seçiniz
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Kaydetme Dialog'u */}
      <Dialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            p: 0,
            background: 'linear-gradient(135deg, rgba(27, 41, 61, 0.95) 0%, rgba(27, 41, 61, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: '400px'
          }
        }}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }
        }}
      >
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${selectedColor || '#2196F3'}20 0%, ${selectedColor || '#2196F3'}10 100%)`,
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '1.3rem',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          py: 3
        }}>
          Çalışma Kaydı
        </DialogTitle>
        <DialogContent sx={{ 
          p: 3,
          color: 'rgba(255,255,255,0.9)'
        }}>
          <Box sx={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            p: 2.5,
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center'
          }}>
            <Typography sx={{
              fontSize: '1rem',
              lineHeight: 1.6,
              fontWeight: 500
            }}>
              <strong style={{ color: selectedColor || '#2196F3' }}>{selectedExamType}</strong> - <strong style={{ color: selectedColor || '#2196F3' }}>{selectedSubject}</strong> - <strong style={{ color: selectedColor || '#2196F3' }}>{selectedTopic}</strong> için <strong style={{ color: '#4CAF50' }}>{formatTime(time, false)}</strong> süresince çalıştınız. 
            </Typography>
            <Typography sx={{
              fontSize: '0.95rem',
              mt: 1.5,
              opacity: 0.8
            }}>
              Bu çalışmayı kaydetmek istiyor musunuz?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          gap: 2,
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Button 
            onClick={handleCancelSave} 
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
              color: '#ffffff',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              borderRadius: '12px',
              textTransform: 'none',
              boxShadow: '0 4px 16px rgba(244, 67, 54, 0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #e57373 0%, #f44336 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)'
              }
            }}
          >
            Kaydetme
          </Button>
          <Button 
            onClick={handleConfirmSave} 
            startIcon={<SaveIcon />}
            sx={{
              background: `linear-gradient(135deg, ${selectedColor || '#2196F3'} 0%, ${selectedColor || '#21CBF3'} 100%)`,
              color: '#ffffff',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              borderRadius: '12px',
              textTransform: 'none',
              boxShadow: `0 4px 16px ${selectedColor || '#2196F3'}40`,
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: `linear-gradient(135deg, ${selectedColor || '#21CBF3'} 0%, ${selectedColor || '#2196F3'} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${selectedColor || '#2196F3'}50`
              }
            }}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalyticalStopwatch;
