import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, 
  Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions,
  useTheme, CircularProgress, IconButton,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import SaveIcon from '@mui/icons-material/Save';
import BarChartIcon from '@mui/icons-material/BarChart';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs, doc, setDoc, getDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import yksData from '../utils/yksData';

const AnalyticalStopwatch = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [studyRecords, setStudyRecords] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({});
  const theme = useTheme();

  // Fetch study records from Firestore
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
      
      setStudyRecords(records);
    } catch (error) {
      console.error('Error fetching study records:', error);
    }
  }, [user]);

  const loadActiveTimer = useCallback(async () => {
    if (!user) return;
    
    try {
      const timerDocRef = doc(db, 'activeTimers', user.uid);
      const timerDoc = await getDoc(timerDocRef);
      
      if (timerDoc.exists()) {
        const timerData = timerDoc.data();
        
        // Check if timer is still valid (not expired after 1 month)
        const timerStartTime = timerData.startTime.toDate();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        if (timerStartTime > oneMonthAgo) {
          // Timer is still valid
          
          if (timerData.isRunning) {
            // Sadece timer çalışıyorsa ders ve konu seçimini geri yükle
            setSelectedSubject(timerData.subject);
            setSelectedTopic(timerData.topic);
            setExpandedSubject(timerData.subject);
            
            // Calculate elapsed time if timer was running
            const elapsedSeconds = Math.floor((new Date() - timerStartTime) / 1000);
            setTime(timerData.elapsedTime + elapsedSeconds);
            setStartTime(timerStartTime);
            setIsRunning(true);
          } else {
            // Timer was paused but we don't want to automatically select subject/topic
            // Just preserve the elapsed time
            setTime(timerData.elapsedTime);
            setIsRunning(false);
            // Reset selection when timer is not running
            setSelectedSubject('');
            setSelectedTopic('');
            setExpandedSubject(null);
          }
        } else {
          // Timer expired, delete it
          await deleteDoc(timerDocRef);
        }
      }
    } catch (error) {
      console.error('Error loading active timer:', error);
    }
  }, [user]);

  // Calculate total study time per subject and topic
  const calculateAnalytics = useCallback(() => {
    const analytics = {};
    
    studyRecords.forEach(record => {
      if (!analytics[record.subject]) {
        analytics[record.subject] = {
          totalTime: 0,
          topics: {}
        };
      }
      
      if (!analytics[record.subject].topics[record.topic]) {
        analytics[record.subject].topics[record.topic] = 0;
      }
      
      analytics[record.subject].topics[record.topic] += record.duration;
      analytics[record.subject].totalTime += record.duration;
    });
    
    setAnalytics(analytics);
  }, [studyRecords]);

  // Load study records and active timer state from Firestore
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await fetchStudyRecords();
        await loadActiveTimer();
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, fetchStudyRecords, loadActiveTimer]);

  // Calculate analytics whenever study records change
  useEffect(() => {
    if (studyRecords.length > 0) {
      calculateAnalytics();
    }
  }, [studyRecords, calculateAnalytics]);

  // Save timer state to Firebase whenever it changes
  useEffect(() => {
    const saveTimerState = async () => {
      if (!user || (!isRunning && time === 0 && !selectedSubject && !selectedTopic)) return;
      
      try {
        const timerDocRef = doc(db, 'activeTimers', user.uid);
        
        if (time === 0 && !selectedSubject && !selectedTopic) {
          // Delete timer if reset
          await deleteDoc(timerDocRef);
        } else {
          // Save current timer state
          await setDoc(timerDocRef, {
            userId: user.uid,
            subject: selectedSubject,
            topic: selectedTopic,
            elapsedTime: time,
            isRunning: isRunning,
            startTime: startTime ? new Date(startTime) : new Date(),
            lastUpdated: new Date(),
            createdAt: new Date(),
            // Add expiration date - 24 months from now
            expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 24))
          });
        }
      } catch (error) {
        console.error('Error saving timer state:', error);
      }
    };
    
    if (user) {
      saveTimerState();
    }
  }, [user, isRunning, time, selectedSubject, selectedTopic, startTime]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    if (time > 0) {
      setShowSaveDialog(true);
    } else {
      resetTimer();
    }
  };

  const handleConfirmSave = async () => {
    await saveStudyRecord();
    resetTimer();
    setShowSaveDialog(false);
  };

  const handleCancelSave = () => {
    resetTimer();
    setShowSaveDialog(false);
  };

  const resetTimer = async () => {
    setIsRunning(false);
    setTime(0);
    setSelectedSubject('');
    setSelectedTopic('');
    setStartTime(null);
    setExpandedSubject(null); // Accordion'u da kapat
    
    // Delete active timer from Firebase
    if (user) {
      try {
        const timerDocRef = doc(db, 'activeTimers', user.uid);
        await deleteDoc(timerDocRef);
      } catch (error) {
        console.error('Error deleting timer state:', error);
      }
    }
  };

  const saveStudyRecord = async () => {
    if (!user || !selectedSubject || !selectedTopic || time === 0) return;
    
    try {
      // Add a new study record
      await addDoc(collection(db, 'studyRecords'), {
        userId: user.uid,
        subject: selectedSubject,
        topic: selectedTopic,
        duration: time, // Store the full time in seconds
        timestamp: new Date(),
        createdAt: new Date(),
        expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 24))
      });
      
      // Clear the active timer
      const timerDocRef = doc(db, 'activeTimers', user.uid);
      await deleteDoc(timerDocRef);
      
      // Refresh study records
      await fetchStudyRecords();
      
      // Show success message
      alert('Çalışma kaydedildi!');
    } catch (error) {
      console.error('Error saving study record:', error);
      alert('Çalışma kaydedilirken bir hata oluştu.');
    }
  };

  const formatTime = (seconds, isForDisplay = false) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    // For the timer display, keep the HH:MM:SS format
    if (!isForDisplay) {
      return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
      ].join(':');
    }
    
    // For analytics display, use a more human-readable format (hours and minutes only)
    let timeString = '';
    if (hours > 0) {
      timeString += `${hours} saat`;
    }
    if (minutes > 0) {
      if (hours > 0) timeString += ' ';
      timeString += `${minutes} dakika`;
    }
    
    // If both hours and minutes are 0, show as 0 dakika
    if (hours === 0 && minutes === 0) {
      timeString = '0 dakika';
    }
    
    return timeString;
  };

  // Konu başlığına tıklandığında
  const handleSubjectClick = (subject) => {
    // Ders seçimi sadece Çalışmaya Başla butonları ile yapılacak
    if (isRunning) return;
    setSelectedSubject(subject);
    setExpandedSubject(subject); // Accordion'u açık tut
  };

  // Alt konu tıklandığında
  const handleTopicClick = (topic) => {
    // Konu seçimi sadece Çalışmaya Başla butonları ile yapılacak
    if (isRunning) return;
    setSelectedTopic(topic);
  };

  // Function to update study records in Firestore
  const updateStudyRecordsInFirestore = async (newAnalytics) => {
    if (!user) return;
    
    try {
      // Get all study records for this user
      const recordsQuery = query(
        collection(db, 'studyRecords'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(recordsQuery);
      
      // Create a batch to perform multiple operations
      const batch = writeBatch(db);
      
      // Delete records for topics that have been reset
      querySnapshot.forEach((doc) => {
        const record = doc.data();
        
        // If the subject exists but the topic doesn't, or if the subject doesn't exist at all
        if (
          !newAnalytics[record.subject] || 
          (newAnalytics[record.subject] && !newAnalytics[record.subject].topics[record.topic])
        ) {
          batch.delete(doc.ref);
        }
      });
      
      // Commit the batch
      await batch.commit();
      
      // Refresh study records
      fetchStudyRecords();
    } catch (error) {
      console.error('Error updating study records:', error);
    }
  };

  const handleSendToAnalytics = () => {
    if (time > 0) {
      handleConfirmSave().then(() => {
        // Navigate to analytics page after saving
        navigate('/analiz');
      });
    } else {
      // If no active study session, just navigate
      navigate('/analiz');
    }
  };

  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
    setStartTime(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Subject and Topic Selection */}
        <Card sx={{ 
          flex: 1, 
          borderRadius: 2, 
          boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
          overflow: 'visible'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                  content: '""',
                  display: 'block',
                  width: 4,
                  height: 20,
                  backgroundColor: 'primary.main',
                  borderRadius: 4,
                  marginRight: 1.5
                }
              }}>
              YKS 2024 Dersleri
            </Typography>
            
            <Box sx={{ maxHeight: 'calc(100vh - 320px)', overflow: 'auto', pr: 1 }}>
              {Object.keys(yksData).map((subject) => (
                <Accordion 
                  key={subject}
                  expanded={expandedSubject === subject}
                  onChange={() => {
                    // Eğer zaten bu ders açıksa, kapat; değilse aç
                    setExpandedSubject(expandedSubject === subject ? null : subject);
                  }}
                  disabled={isRunning}
                  sx={{
                    mb: 1,
                    borderRadius: '8px !important',
                    overflow: 'hidden',
                    backgroundColor: yksData[subject].color + '10',
                    border: '1px solid ' + yksData[subject].color + '20',
                    '&:before': {
                      display: 'none', // Removing default divider
                    },
                    '&.Mui-expanded': {
                      margin: '0 0 8px 0',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.07)',
                      backgroundColor: yksData[subject].color + '15',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      padding: '4px 16px',
                      minHeight: '48px',
                      '& .MuiAccordionSummary-content': {
                        margin: '10px 0',
                      },
                      '&.Mui-expanded': {
                        borderBottom: `1px solid ${yksData[subject].color}30`
                      },
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: yksData[subject].color + '25',
                      }
                    }}
                  >
                    <Typography sx={{ 
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      color: expandedSubject === subject ? yksData[subject].color : 'text.primary',
                      '&::before': {
                        content: '""',
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        backgroundColor: yksData[subject].color,
                        borderRadius: '50%',
                        marginRight: 1,
                        boxShadow: `0 0 0 3px ${yksData[subject].color}30`
                      }
                    }}>
                      {subject}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {yksData[subject].topics.map((topic) => (
                        <Box 
                          key={topic}
                          sx={{ 
                            p: 1.5, 
                            borderRadius: 1.5,
                            bgcolor: selectedTopic === topic ? `${yksData[subject].color}20` : 'background.paper',
                            '&:hover': { bgcolor: `${yksData[subject].color}15` },
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid',
                            borderColor: selectedTopic === topic 
                              ? `${yksData[subject].color}50` 
                              : 'rgba(0,0,0,0.05)',
                            boxShadow: selectedTopic === topic 
                              ? `0 3px 10px ${yksData[subject].color}20` 
                              : '0 1px 5px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: selectedTopic === topic ? 500 : 400,
                              fontSize: '0.875rem',
                              color: selectedTopic === topic ? yksData[subject].color : 'text.primary' 
                            }}
                          >
                            {topic}
                          </Typography>
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="primary"
                            sx={{ 
                              borderRadius: 4,
                              fontWeight: 600,
                              py: 0.6,
                              px: 1.8,
                              fontSize: '0.75rem',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                              bgcolor: yksData[subject].color,
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' 
                                  ? `${yksData[subject].color}e0` 
                                  : `${yksData[subject].color}d0`,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                transform: 'translateY(-1px)'
                              },
                              transition: 'transform 0.2s ease-in-out'
                            }}
                            onClick={(e) => {
                              e.stopPropagation(); // Tıklamanın kutuya yayılmasını engelle
                              handleSubjectClick(subject);
                              handleTopicClick(topic);
                              setIsRunning(true);
                              setStartTime(new Date());
                            }}
                          >
                            Çalışmaya Başla
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </CardContent>
        </Card>
        
        {/* Analytical Stopwatch Section */}
        <Card sx={{ 
          flex: 1, 
          borderRadius: 2,
          boxShadow: '0 6px 18px rgba(0,0,0,0.08)'
        }}>
          <CardContent sx={{ p: 3 }}>
            {/* Kronometre Bölümü */}
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                  content: '""',
                  display: 'block',
                  width: 4,
                  height: 20,
                  backgroundColor: 'primary.main',
                  borderRadius: 4,
                  marginRight: 1.5
                }
              }}>
              Analizli Kronometre
            </Typography>

            {/* Timer Card */}
            <Box sx={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  mb: 3,
  p: { xs: 2.5, sm: 3.5 },
  borderRadius: 4,
  background: 'rgba(255,255,255,0.6)',
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.13)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.18)',
  minWidth: { xs: 'auto', sm: 340 },
  maxWidth: 420,
  mx: 'auto',
  position: 'relative',
}}>
              <Typography
  variant="h2"
  sx={{
    fontFamily: 'Montserrat, monospace',
    fontWeight: 800,
    mb: 1.5,
    fontSize: { xs: '2.6rem', sm: '3.7rem', md: '4.2rem' },
    color: isRunning ? 'primary.main' : 'secondary.main',
    textShadow: '0 4px 16px #43C6AC55, 0 1px 0 #fff',
    letterSpacing: 2,
    transition: 'color 0.3s',
    lineHeight: 1.1,
    userSelect: 'none',
  }}
>
  {formatTime(time)}
</Typography>
              
              {selectedSubject && selectedTopic ? (
  <Box sx={{
    mb: 2,
    px: 2.5,
    py: 0.7,
    borderRadius: 99,
    background: 'linear-gradient(90deg, #43C6AC 0%, #F8FFAE 100%)',
    color: '#2e3856',
    fontWeight: 600,
    fontSize: '1rem',
    boxShadow: '0 2px 8px #43C6AC22',
    display: 'inline-block',
    letterSpacing: 0.5,
    textAlign: 'center',
  }}>
    <span style={{ fontWeight: 700 }}>{selectedSubject}</span> - {selectedTopic}
  </Box>
) : (
  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
    Lütfen bir ders ve konu seçin
  </Typography>
)}
              
              <Box sx={{ display: 'flex', gap: 2.5, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
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
        setStartTime(new Date());
      }}
      disabled={!selectedSubject || !selectedTopic}
      sx={{
        borderRadius: 99,
        px: 4,
        py: 1.5,
        fontWeight: 700,
        fontSize: '1.1rem',
        background: 'linear-gradient(90deg, #43C6AC 0%, #F8FFAE 100%)',
        color: '#2e3856',
        boxShadow: '0 2px 12px #43C6AC33',
        '&:hover': {
          background: 'linear-gradient(90deg, #43C6AC 0%, #F8FFAE 80%)',
          color: '#222',
        },
        transition: 'all 0.2s',
      }}
    >
      Başlat
    </Button>
  ) : (
    <Tooltip title="Duraklat" arrow>
      <IconButton
        color="warning"
        onClick={handlePause}
        sx={{
          borderRadius: 99,
          p: 1.3,
          background: 'linear-gradient(90deg, #F8FFAE 0%, #43C6AC 100%)',
          color: '#2e3856',
          boxShadow: '0 2px 10px #43C6AC22',
          '&:hover': {
            background: 'linear-gradient(90deg, #43C6AC 0%, #F8FFAE 80%)',
            color: '#222',
          },
          transition: 'all 0.2s',
        }}
      >
        <PauseIcon sx={{ fontSize: 28 }} />
      </IconButton>
    </Tooltip>
  )}
  <Tooltip title="Durdur" arrow>
    <span>
      <IconButton
        color="error"
        onClick={handleStop}
        disabled={time === 0}
        sx={{
          borderRadius: 99,
          p: 1.3,
          background: 'linear-gradient(90deg, #ffb6b9 0%, #fae3d9 100%)',
          color: '#a10000',
          boxShadow: '0 2px 10px #fae3d955',
          '&:hover': {
            background: 'linear-gradient(90deg, #fae3d9 0%, #ffb6b9 80%)',
            color: '#fff',
          },
          transition: 'all 0.2s',
        }}
      >
        <StopIcon sx={{ fontSize: 28 }} />
      </IconButton>
    </span>
  </Tooltip>
  <Tooltip title="Sıfırla" arrow>
    <span>
      <IconButton
        color="info"
        onClick={handleReset}
        disabled={time === 0}
        sx={{
          borderRadius: 99,
          p: 1.3,
          background: 'linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)',
          color: '#22577a',
          boxShadow: '0 2px 10px #a1c4fd33',
          '&:hover': {
            background: 'linear-gradient(90deg, #c2e9fb 0%, #a1c4fd 80%)',
            color: '#222',
          },
          transition: 'all 0.2s',
        }}
      >
        <RestartAltIcon sx={{ fontSize: 26 }} />
      </IconButton>
    </span>
  </Tooltip>
</Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* Save Dialog */}
      <Dialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
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
