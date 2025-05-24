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

import Dialog from '@mui/material/Dialog';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
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

  // Not: Sıfırlama işlemi butonlar içinde inline olarak kullanılıyor

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
        where('subject', '==', selectedSubject)
      );
      
      const statsSnapshot = await getDocs(statsQuery);
      
      if (statsSnapshot.empty) {
        // Yeni istatistik oluştur
        await addDoc(collection(db, 'studyStats'), {
          userId: user.uid,
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

  // Not: Konu seçimi işlemi butonlar içinde inline olarak kullanılıyor

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
      p: { xs: 2, sm: 3 },
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      maxHeight: '100vh',
      overflow: 'hidden'
    }}>
      <Typography variant="h4" component="h1" sx={{ 
        fontWeight: 700, 
        mb: 1,
        color: '#1a1a1a',
        fontSize: { xs: '1.8rem', md: '2.2rem' }
      }}>
        Analizli Kronometre
      </Typography>
      
      <Typography variant="body1" sx={{ 
        color: '#555', 
        mb: 1,
        maxWidth: '800px'
      }}>
        Analizli kronometre ile ders ve konu bazlı çalışmalarını kaydedin. İlerlerinizi
        takip edin ve her derste ne kadar zaman harcadığınızı görün.
      </Typography>
      
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        width: '100%',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Ders ve konu seçimi */}
        <Card sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 50%' },
          borderRadius: '20px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          background: '#f4f2f5',
          height: { xs: 'auto', md: '600px' },
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ 
              p: 2,
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 700,
                  color: '#333'
                }}
              >
                Ders ve Konu Seçimi
              </Typography>
              
              <ChevronRightIcon sx={{ color: '#999' }} />
            </Box>
            
            {/* Ders listesi */}
            <Box sx={{ 
              flex: 1,
              overflowY: 'auto',
              p: 2
            }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.keys(yksData).map((subject) => (
                    <Box key={subject} sx={{ mb: 1 }}>
                      <Box 
                        onClick={() => handleSubjectClick(subject)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1.5,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          background: '#f4f2f5',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: 'rgba(0,0,0,0.03)'
                          }
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: yksData[subject].color || '#9c27b0',
                            width: 32,
                            height: 32,
                            mr: 1.5,
                            fontSize: '0.9rem'
                          }}
                        >
                          {subject.charAt(0)}
                        </Avatar>
                        <Typography 
                          variant="subtitle1"
                          sx={{ 
                            flex: 1,
                            fontWeight: 600,
                            fontSize: '0.95rem'
                          }}
                        >
                          {subject}
                        </Typography>
                        <ChevronRightIcon 
                          sx={{ 
                            transform: expandedSubject === subject ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease'
                          }} 
                        />
                      </Box>
                      
                      {/* Konu listesi */}
                      {expandedSubject === subject && (
                        <Box 
                          sx={{
                            mt: 0.5,
                            ml: 2,
                            borderLeft: '1px dashed rgba(0,0,0,0.1)',
                            pl: 1.5,
                            maxHeight: '300px',
                            overflowY: 'auto'
                          }}
                        >
                          {yksData[subject].topics.map((topic) => (
                            <Box 
                              key={topic}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 1,
                                borderRadius: '8px',
                                mt: 0.5,
                                background: '#f4f2f5',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  background: 'rgba(0,0,0,0.03)'
                                }
                              }}
                            >
                              <Typography 
                                variant="body2"
                                sx={{ 
                                  flex: 1,
                                  fontWeight: 500,
                                  fontSize: '0.85rem'
                                }}
                              >
                                {topic}
                              </Typography>
                              
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleStartStudy(subject, topic)}
                                sx={{
                                  bgcolor: yksData[subject].color || '#9c27b0',
                                  color: '#fff',
                                  fontSize: '0.7rem',
                                  py: 0.5,
                                  minWidth: 'auto',
                                  '&:hover': {
                                    bgcolor: yksData[subject].color ? `${yksData[subject].color}dd` : '#7b1fa2'
                                  }
                                }}
                              >
                                Çalışmaya Başla
                              </Button>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Kronometre Kartı */}
        <Card id="timer-section" sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 50%' },
          borderRadius: '20px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          background: '#f4f2f5',
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
              justifyContent: 'space-between'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 700,
                  color: '#333'
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
              p: 4
            }}>
              {/* Daire içinde zaman gösterimi */}
              <Box sx={{ 
                width: { xs: '220px', sm: '280px' },
                height: { xs: '220px', sm: '280px' },
                borderRadius: '50%',
                border: '2px solid rgba(33, 150, 243, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                mb: 4,
                background: 'rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
                backdropFilter: 'blur(4px)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-4px',
                  left: '-4px',
                  width: 'calc(100% + 8px)',
                  height: 'calc(100% + 8px)',
                  borderRadius: '50%',
                  border: '4px solid transparent',
                  borderTopColor: selectedColor || '#2196F3',
                  borderRightColor: 'rgba(33, 150, 243, 0.3)',
                  animation: isRunning ? 'spin 2s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': {
                      transform: 'rotate(0deg)'
                    },
                    '100%': {
                      transform: 'rotate(360deg)'
                    }
                  }
                }
              }}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TimerIcon sx={{ 
                    color: '#2196F3',
                    fontSize: '2rem',
                    mb: 2,
                    opacity: 0.8
                  }} />
                  
                  <Typography variant="h1" sx={{ 
                    fontSize: { xs: '2.5rem', sm: '3.5rem' },
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: '#333',
                    letterSpacing: '2px'
                  }}>
                    {formatTime(time, true)}
                  </Typography>
                </Box>
              </Box>
              
              {/* Butonlar */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: isRunning ? 'row' : 'column',
                gap: 2,
                mt: 2,
                width: '100%',
                maxWidth: '400px'
              }}>
                {selectedSubject && selectedTopic ? (
                  !isRunning ? (
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={() => setIsRunning(true)}
                      sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: '#fff',
                        py: 1.5,
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '1rem',
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
                      Çalışmaya Başla
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => setIsRunning(false)}
                        sx={{
                          background: 'linear-gradient(45deg, #FF5722 30%, #FF9800 90%)',
                          color: '#fff',
                          py: 1.5,
                          borderRadius: '10px',
                          fontWeight: 600,
                          fontSize: '1rem',
                          textTransform: 'none',
                          boxShadow: '0 3px 5px 2px rgba(255, 87, 34, .3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 10px 2px rgba(255, 87, 34, .3)'
                          }
                        }}
                      >
                        Duraklat
                      </Button>
                      
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => {
                          setTime(0);
                          setIsRunning(false);
                        }}
                        sx={{
                          background: 'linear-gradient(45deg, #9C27B0 30%, #E040FB 90%)',
                          color: '#fff',
                          py: 1.5,
                          borderRadius: '10px',
                          fontWeight: 600,
                          fontSize: '1rem',
                          textTransform: 'none',
                          boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #E040FB 30%, #9C27B0 90%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 10px 2px rgba(156, 39, 176, .3)'
                          }
                        }}
                      >
                        Sıfırla
                      </Button>
                      
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleSaveStudy}
                        sx={{
                          background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                          color: '#fff',
                          py: 1.5,
                          borderRadius: '10px',
                          fontWeight: 600,
                          fontSize: '1rem',
                          textTransform: 'none',
                          boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #8BC34A 30%, #4CAF50 90%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 10px 2px rgba(76, 175, 80, .3)'
                          }
                        }}
                      >
                        Kaydet
                      </Button>
                    </>
                  )
                ) : (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      textAlign: 'center', 
                      color: '#666',
                      fontStyle: 'italic',
                      p: 2
                    }}
                  >
                    Lütfen sol taraftan bir ders ve konu seçiniz
                  </Typography>
                )}
              </Box>
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
            p: 1,
            background: '#f4f2f5'
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
