import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, 
  DialogTitle, DialogContent, DialogActions,
  CircularProgress
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
          <Box sx={{ display: 'flex', gap: 3, height: '100%', p: 2, pl: 0, bgcolor: '#1a0545' }}>
      {/* Sol Panel - Ders ve Konu Seçimi */}
      <Box sx={{ flex: 2, maxWidth: '450px' }}>
        <Card sx={{ 
          height: { xs: 'auto', md: '500px' }, 
          borderRadius: '20px', 
          boxShadow: '0 15px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              background: `linear-gradient(135deg, ${selectedColor}20 0%, ${selectedColor}10 50%, rgba(255,255,255,0.05) 100%)`,
              p: 3,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              flexShrink: 0,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(45deg, ${selectedColor}08 0%, transparent 100%)`,
                pointerEvents: 'none'
              }
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: '#ffffff',
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                position: 'relative',
                zIndex: 1,
                fontSize: '1.1rem'
              }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${selectedColor} 0%, ${selectedColor}CC 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 6px 15px ${selectedColor}30`
                }}>
                  <TimerIcon sx={{ color: '#ffffff', fontSize: '1rem' }} />
                </Box>
                Ders ve Konu Seçimi
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                opacity: 0.8,
                position: 'relative',
                zIndex: 1,
                fontSize: '0.85rem'
              }}>
                Çalışmak istediğiniz sınav türü, ders ve konuyu seçin
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 2.5, 
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, textAlign: 'center', fontSize: '1rem' }}>
                    Sınav Türü Seçin
                  </Typography>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => handleExamTypeSelect('TYT')}
                    sx={{
                      background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 50%, #64B5F6 100%)',
                      color: '#fff',
                      py: 2.5,
                      borderRadius: '16px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'left 0.6s'
                      },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #21CBF3 0%, #2196F3 50%, #1976D2 100%)',
                        transform: 'translateY(-3px) scale(1.02)',
                        boxShadow: '0 10px 30px rgba(33, 150, 243, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                        '&::before': {
                          left: '100%'
                        }
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
                      background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFAB40 100%)',
                      color: '#fff',
                      py: 2.5,
                      borderRadius: '16px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'left 0.6s'
                      },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B6B 50%, #E64A19 100%)',
                        transform: 'translateY(-3px) scale(1.02)',
                        boxShadow: '0 10px 30px rgba(255, 107, 107, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                        '&::before': {
                          left: '100%'
                        }
                      }
                    }}
                  >
                    AYT (Alan Yeterlilik Testi)
                  </Button>
                </Box>
              ) : (
                // Ders ve konu seçimi
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexShrink: 0 }}>
                    <Button
                      onClick={() => setSelectedExamType('')}
                      sx={{ color: '#ffffff', minWidth: 'auto', p: 1.5, mr: 2 }}
                    >
                      ←
                    </Button>
                    <Box sx={{
                      px: 3,
                      py: 1.5,
                      borderRadius: '16px',
                      background: selectedExamType === 'TYT' 
                        ? 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)' 
                        : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: selectedExamType === 'TYT'
                        ? '0 4px 12px rgba(33, 150, 243, 0.3)'
                        : '0 4px 12px rgba(255, 107, 107, 0.3)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      {selectedExamType}
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 2,
                    maxHeight: 'calc(100% - 70px)',
                    overflowY: 'auto',
                    pr: 2,
                    '&::-webkit-scrollbar': {
                      width: '5px',
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
                    {Object.entries(yksData[selectedExamType]).map(([subject, data]) => (
                      <Box key={subject} sx={{ mb: 2 }}>
                        <Box
                          onClick={() => handleSubjectClick(subject)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 3,
                            borderRadius: '20px',
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: `linear-gradient(135deg, ${data.color}15 0%, ${data.color}05 100%)`,
                              opacity: 0,
                              transition: 'opacity 0.3s ease'
                            },
                            '&:hover': {
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
                              transform: 'translateX(8px) scale(1.02)',
                              boxShadow: `0 8px 25px ${data.color}20`,
                              border: `1px solid ${data.color}30`,
                              '&::before': {
                                opacity: 1
                              }
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
                            <Box sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '16px',
                              background: `linear-gradient(135deg, ${data.color} 0%, ${data.color}CC 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: `0 8px 20px ${data.color}30, inset 0 1px 0 rgba(255,255,255,0.2)`,
                              border: '1px solid rgba(255,255,255,0.1)',
                              transition: 'all 0.3s ease'
                            }}>
                              {React.cloneElement(subjectIcons[subject], { 
                                sx: { color: '#ffffff', fontSize: '1.2rem' } 
                              })}
                            </Box>
                            <Typography sx={{ 
                              fontWeight: 700, 
                              color: '#ffffff',
                              fontSize: '1.1rem',
                              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                              {subject}
                            </Typography>
                          </Box>
                          <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            zIndex: 1
                          }}>
                            <ChevronRightIcon sx={{ 
                              color: '#ffffff',
                              fontSize: '1.2rem',
                              transform: expandedSubject === subject ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s ease'
                            }} />
                          </Box>
                        </Box>
                        
                        {expandedSubject === subject && (
                          <Box sx={{ 
                            ml: 2, 
                            mr: 1,
                            mt: 2,
                            maxHeight: '240px',
                            overflowY: 'auto',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                            backdropFilter: 'blur(15px)',
                            borderRadius: '20px',
                            p: 2,
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: `linear-gradient(135deg, ${data.color}08 0%, transparent 50%, ${data.color}05 100%)`,
                              borderRadius: '20px',
                              pointerEvents: 'none'
                            },
                            '&::-webkit-scrollbar': {
                              width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: '3px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: `linear-gradient(135deg, ${data.color} 0%, ${data.color}80 100%)`,
                              borderRadius: '3px',
                              '&:hover': {
                                background: `linear-gradient(135deg, ${data.color}CC 0%, ${data.color} 100%)`,
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
                                  p: 1.8,
                                  borderRadius: '12px',
                                  mt: index > 0 ? 1 : 0,
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  boxShadow: '0 3px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.25)',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                                    transition: 'left 0.5s ease',
                                    pointerEvents: 'none'
                                  },
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                                    transform: 'translateX(4px) translateY(-1px) scale(1.01)',
                                    boxShadow: `0 6px 20px ${data.color}20, inset 0 1px 0 rgba(255,255,255,0.3)`,
                                    border: `1px solid ${data.color}30`,
                                    '&::before': {
                                      left: '100%'
                                    }
                                  }
                                }}
                              >
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1.5, 
                                  flex: 1,
                                  position: 'relative',
                                  zIndex: 1
                                }}>
                                  <Box sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${data.color} 0%, ${data.color}80 100%)`,
                                    boxShadow: `0 0 6px ${data.color}60, 0 1px 3px rgba(0,0,0,0.2)`,
                                    flexShrink: 0
                                  }} />
                                  <Typography sx={{ 
                                    fontSize: '0.85rem', 
                                    color: '#ffffff',
                                    fontWeight: 500,
                                    flex: 1,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                    letterSpacing: '0.1px'
                                  }}>
                                    {topic}
                                  </Typography>
                                </Box>
                                <Button
                                  size="small"
                                  variant="contained"
                                  sx={{
                                    minWidth: '60px',
                                    background: `linear-gradient(135deg, ${data.color} 0%, ${data.color}CC 50%, ${data.color}80 100%)`,
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    py: 0.8,
                                    px: 1.8,
                                    ml: 1.5,
                                    borderRadius: '10px',
                                    boxShadow: `0 3px 10px ${data.color}40, inset 0 1px 0 rgba(255,255,255,0.3)`,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    textTransform: 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    zIndex: 1,
                                    overflow: 'hidden',
                                    '&::before': {
                                      content: '""',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                                      opacity: 0,
                                      transition: 'opacity 0.3s ease'
                                    },
                                    '&:hover': {
                                      background: `linear-gradient(135deg, ${data.color}CC 0%, ${data.color} 50%, ${data.color}E6 100%)`,
                                      transform: 'translateY(-2px) scale(1.03)',
                                      boxShadow: `0 6px 16px ${data.color}60, inset 0 1px 0 rgba(255,255,255,0.4)`,
                                      '&::before': {
                                        opacity: 1
                                      }
                                    },
                                    '&:active': {
                                      transform: 'translateY(-1px) scale(1.01)'
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
        boxShadow: '0 15px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'auto', md: '500px' }
      }}>
        <CardContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ 
            p: 2.5,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
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
            
            <Box sx={{
              px: 2,
              py: 1,
              borderRadius: '16px',
              background: isRunning 
                ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' 
                : 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: isRunning 
                ? '0 4px 12px rgba(76, 175, 80, 0.3)' 
                : '0 4px 12px rgba(255, 152, 0, 0.3)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                animation: isRunning ? 'pulse 1.5s ease-in-out infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.5, transform: 'scale(0.8)' }
                }
              }} />
              <Typography sx={{
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {isRunning ? "ÇALIŞIYOR" : "HAZIR"}
              </Typography>
            </Box>
          </Box>
          
          {/* Kronometre Gösterimi */}
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(85, 179, 217, 0.05) 50%, rgba(255,255,255,0.02) 100%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 30% 20%, ${selectedColor || '#2196F3'}10 0%, transparent 50%)`,
              pointerEvents: 'none'
            }
          }}>
            {/* Daire içinde zaman gösterimi */}
            <Box sx={{ 
              width: { xs: '180px', sm: '220px' },
              height: { xs: '180px', sm: '220px' },
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              mb: 3,
              zIndex: 1,
              background: `
                linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.25) 0%, 
                  rgba(255, 255, 255, 0.15) 50%,
                  rgba(255, 255, 255, 0.1) 100%
                )
              `,
              backdropFilter: 'blur(25px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.4),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(255, 255, 255, 0.1)
              `,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `
                  0 25px 80px rgba(0, 0, 0, 0.25),
                  inset 0 1px 0 rgba(255, 255, 255, 0.5),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1),
                  0 0 0 1px rgba(255, 255, 255, 0.2)
                `
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-8px',
                left: '-8px',
                width: 'calc(100% + 16px)',
                height: 'calc(100% + 16px)',
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
                top: '-4px',
                left: '-4px',
                width: 'calc(100% + 8px)',
                height: 'calc(100% + 8px)',
                borderRadius: '50%',
                border: `3px solid ${selectedColor || '#2196F3'}`,
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
                  fontSize: { xs: '1.8rem', sm: '2.2rem' },
                  mb: 1.5,
                  opacity: 0.9,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }} />
                
                <Typography variant="h1" sx={{ 
                  fontSize: { xs: '1.8rem', sm: '2.4rem' },
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
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.8)',
                    textAlign: 'center',
                    mt: 2,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    px: 3,
                    py: 1.5,
                    border: '2px solid rgba(255,255,255,0.2)'
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
              mt: 4,
              width: '100%',
              maxWidth: '300px'
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
                      py: 2,
                      px: 3,
                      borderRadius: '16px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: `0 8px 20px ${selectedColor || '#2196F3'}40`,
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(12px)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${selectedColor || '#21CBF3'} 0%, ${selectedColor || '#2196F3'} 50%, ${selectedColor || '#1976D2'} 100%)`,
                        transform: 'translateY(-3px) scale(1.02)',
                        boxShadow: `0 12px 28px ${selectedColor || '#2196F3'}50`,
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
                        py: 1.5,
                        px: 2.5,
                        borderRadius: '14px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        boxShadow: '0 6px 18px rgba(255, 87, 34, 0.4)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(12px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #FF7043 0%, #FF5722 50%, #E64A19 100%)',
                          transform: 'translateY(-3px) scale(1.02)',
                          boxShadow: '0 8px 22px rgba(255, 87, 34, 0.5)',
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
                        py: 1.7,
                        px: 3,
                        borderRadius: '16px',
                        fontWeight: 700,
                        fontSize: '1rem',
                        textTransform: 'none',
                        boxShadow: '0 8px 24px rgba(156, 39, 176, 0.4)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(12px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #BA68C8 0%, #9C27B0 50%, #7B1FA2 100%)',
                          transform: 'translateY(-4px) scale(1.03)',
                          boxShadow: '0 10px 28px rgba(156, 39, 176, 0.5)',
                          border: '2px solid rgba(255,255,255,0.3)'
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
                        py: 1.7,
                        px: 3,
                        borderRadius: '16px',
                        fontWeight: 700,
                        fontSize: '1rem',
                        textTransform: 'none',
                        boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(12px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 50%, #388E3C 100%)',
                          transform: 'translateY(-4px) scale(1.03)',
                          boxShadow: '0 10px 28px rgba(76, 175, 80, 0.5)',
                          border: '2px solid rgba(255,255,255,0.3)'
                        }
                      }}
                    >
                      Kaydet
                    </Button>
                  </>
                )
              ) : (
                <Box sx={{
                  position: 'relative',
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.12) 0%, rgba(156, 39, 176, 0.12) 50%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  py: 2.5,
                  px: 3,
                  mb: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shimmer 4s ease-in-out infinite',
                    '@keyframes shimmer': {
                      '0%': { left: '-100%' },
                      '100%': { left: '100%' }
                    }
                  }
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2.5,
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 50%, #9C27B0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%',
                        height: '100%',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                        pointerEvents: 'none'
                      }
                    }}>
                      <TimerIcon sx={{ 
                        color: '#ffffff', 
                        fontSize: '1.3rem',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                        position: 'relative',
                        zIndex: 1
                      }} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '1rem',
                          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          letterSpacing: '0.3px',
                          lineHeight: 1.3
                        }}
                      >
                        Lütfen soldan bir konu seçiniz
                      </Typography>
                    </Box>
                  </Box>
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
            borderRadius: '24px',
            boxShadow: '0 24px 72px rgba(0, 0, 0, 0.3)',
            p: 0,
            background: 'linear-gradient(135deg, rgba(27, 41, 61, 0.95) 0%, rgba(27, 41, 61, 0.98) 100%)',
            backdropFilter: 'blur(24px)',
            border: '2px solid rgba(255,255,255,0.1)',
            minWidth: '480px'
          }
        }}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0,0,0,0.6)'
          }
        }}
      >
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${selectedColor || '#2196F3'}20 0%, ${selectedColor || '#2196F3'}10 100%)`,
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '1.4rem',
          textAlign: 'center',
          borderBottom: '2px solid rgba(255,255,255,0.1)',
          py: 4
        }}>
          Çalışma Kaydı
        </DialogTitle>
        <DialogContent sx={{ 
          p: 4,
          color: 'rgba(255,255,255,0.9)'
        }}>
          <Box sx={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            p: 3.5,
            border: '2px solid rgba(255,255,255,0.1)',
            textAlign: 'center'
          }}>
            <Typography sx={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              fontWeight: 500
            }}>
              <strong style={{ color: selectedColor || '#2196F3' }}>{selectedExamType}</strong> - <strong style={{ color: selectedColor || '#2196F3' }}>{selectedSubject}</strong> - <strong style={{ color: selectedColor || '#2196F3' }}>{selectedTopic}</strong> için <strong style={{ color: '#4CAF50' }}>{formatTime(time, false)}</strong> süresince çalıştınız. 
            </Typography>
            <Typography sx={{
              fontSize: '1.05rem',
              mt: 2.5,
              opacity: 0.8
            }}>
              Bu çalışmayı kaydetmek istiyor musunuz?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 4, 
          gap: 3,
          borderTop: '2px solid rgba(255,255,255,0.1)'
        }}>
          <Button 
            onClick={handleCancelSave} 
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
              color: '#ffffff',
              fontWeight: 600,
              px: 4,
              py: 1.6,
              borderRadius: '16px',
              textTransform: 'none',
              boxShadow: '0 6px 20px rgba(244, 67, 54, 0.3)',
              border: '2px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #e57373 0%, #f44336 100%)',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 24px rgba(244, 67, 54, 0.4)'
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
              px: 4,
              py: 1.6,
              borderRadius: '16px',
              textTransform: 'none',
              boxShadow: `0 6px 20px ${selectedColor || '#2196F3'}40`,
              border: '2px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: `linear-gradient(135deg, ${selectedColor || '#21CBF3'} 0%, ${selectedColor || '#2196F3'} 100%)`,
                transform: 'translateY(-3px)',
                boxShadow: `0 8px 24px ${selectedColor || '#2196F3'}50`
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
