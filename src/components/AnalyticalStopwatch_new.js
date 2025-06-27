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
  
  // yksData'dan ders verilerini oluştur
  const createSubjectsFromYksData = () => {
    const subjects = {};
    
    // TYT ve AYT derslerini birleştir
    [...Object.entries(yksData.TYT), ...Object.entries(yksData.AYT)].forEach(([dersAd, dersData]) => {
      if (!subjects[dersAd]) {
        subjects[dersAd] = {
          color: dersData.color,
          topics: [...dersData.topics]
        };
      } else {
        // Eğer ders hem TYT hem AYT'de varsa konuları birleştir
        subjects[dersAd].topics = [...new Set([...subjects[dersAd].topics, ...dersData.topics])];
      }
    });
    
    return subjects;
  };

  const subjects = createSubjectsFromYksData();
  
  // Ders renklerini yksData'dan al
  const subjectColors = Object.fromEntries(
    Object.entries(subjects).map(([name, data]) => [name, data.color])
  );

  // Ders logolarını tanımlayalım
  const subjectIcons = {
    'Türkçe': <MenuBookIcon />,
    'Matematik': <CalculateIcon />,
    'Temel Matematik': <CalculateIcon />,
    'Fizik': <ScienceIcon />,
    'Kimya': <ScienceIcon />,
    'Biyoloji': <BioIcon />,
    'Tarih': <HistoryIcon />,
    'Coğrafya': <PublicIcon />,
    'Felsefe': <PsychologyIcon />,
    'Din Kültürü': <TempleBuddhistIcon />,
    'Edebiyat': <MenuBookIcon />
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
      p: { xs: 2, sm: 3 },
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }}>
      <Typography variant="h4" component="h1" sx={{ 
        fontWeight: 700, 
        mb: 1,
        color: '#ffffff',
        fontSize: { xs: '1.8rem', md: '2.2rem' }
      }}>
        Analizli Kronometre
      </Typography>
      
      <Typography variant="body1" sx={{ 
        color: '#ffffff', 
        mb: 3,
        maxWidth: '800px'
      }}>
        Analizli kronometre ile ders ve konu bazlı çalışmalarını kaydedin. İlerilerinizi
        takip edin ve her derste ne kadar zaman harcadığınızı görün.
      </Typography>
      
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        width: '100%'
      }}>
        {/* Ders ve konu seçimi */}
        <Card sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 50%' },
          borderRadius: '20px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          background: '#1a0545'
        }}>
          <CardContent sx={{ p: 0 }}>
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
            
            {/* Ders Listesi */}
            <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {Object.keys(subjects).map((subject) => (
                <Box 
                  key={subject}
                  sx={{ 
                    p: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.02)'
                    },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onClick={() => setExpandedSubject(expandedSubject === subject ? null : subject)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        bgcolor: `${subjectColors[subject]}20`,
                        color: subjectColors[subject],
                        fontWeight: 700,
                        fontSize: '1rem'
                      }}
                    >
                      {subjectIcons[subject] || subject.charAt(0)}
                    </Avatar>
                    
                    <Typography sx={{ 
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: '#333'
                    }}>
                      {subject}
                    </Typography>
                  </Box>
                  
                  <ChevronRightIcon sx={{ 
                    color: '#999',
                    transform: expandedSubject === subject ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.3s ease'
                  }} />
                </Box>
              ))}
            </Box>
            
            {/* Seçilen dersin konuları */}
            {expandedSubject && subjects[expandedSubject] && subjects[expandedSubject].topics && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderTop: '1px solid rgba(0,0,0,0.06)'
              }}>
                <Typography sx={{ 
                  fontWeight: 700, 
                  mb: 2, 
                  fontSize: '0.9rem', 
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {expandedSubject} Konuları
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {subjects[expandedSubject].topics.map((topic) => (
                    <Box 
                      key={topic}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: '8px',
                        backgroundColor: selectedTopic === topic ? 
                          `${subjectColors[expandedSubject]}10` : '#1a0545',
                        border: `1px solid ${selectedTopic === topic ? 
                          subjectColors[expandedSubject] : 'rgba(0,0,0,0.06)'}`,
                      }}
                    >
                      <Typography sx={{ 
                        fontWeight: selectedTopic === topic ? 600 : 400,
                        fontSize: '0.95rem',
                        color: selectedTopic === topic ? 
                          subjectColors[expandedSubject] : '#555'
                      }}>
                        {topic}
                      </Typography>
                      
                      <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartStudy(expandedSubject, topic);
                        }}
                        sx={{
                          backgroundColor: subjectColors[expandedSubject],
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: `${subjectColors[expandedSubject]}d0`
                          }
                        }}
                      >
                        Çalışmaya Başla
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Kronometre Kartı */}
        <Card id="timer-section" sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 50%' },
          borderRadius: '20px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          background: '#1a0545',
          display: 'flex',
          flexDirection: 'column'
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
                border: '10px solid rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                mb: 4,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-10px',
                  left: '-10px',
                  width: 'calc(100% + 20px)',
                  height: 'calc(100% + 20px)',
                  borderRadius: '50%',
                  border: '10px solid transparent',
                  borderTopColor: selectedColor || '#2196F3',
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
                    color: selectedColor || '#2196F3',
                    fontSize: '2rem',
                    mb: 2,
                    opacity: 0.7
                  }} />
                  
                  <Typography variant="h1" sx={{ 
                    fontSize: { xs: '2.5rem', sm: '3.5rem' },
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: '#333'
                  }}>
                    {formatTime(time, true)}
                  </Typography>
                </Box>
              </Box>
              
              {/* Butonlar */}
              <Box sx={{ 
                display: 'flex',
                gap: 2,
                mt: 2,
                width: '100%',
                maxWidth: '400px'
              }}>
                {!isRunning ? (
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => setIsRunning(true)}
                    sx={{
                      backgroundColor: '#2196F3',
                      color: '#fff',
                      py: 1.5,
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none'
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
                        backgroundColor: '#FF5722',
                        color: '#fff',
                        py: 1.5,
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none'
                      }}
                    >
                      Duraklat
                    </Button>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={handleSaveStudy}
                      sx={{
                        backgroundColor: '#4CAF50',
                        color: '#fff',
                        py: 1.5,
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none'
                      }}
                    >
                      Kaydet
                    </Button>
                  </>
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
            background: '#1a0545'
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
