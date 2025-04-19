import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Divider, 
  LinearProgress, 
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  IconButton,
  Snackbar,
  Tooltip,
  Popover,
  FormControl,
  Select,
  MenuItem,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Slider
} from '@mui/material';
import AnalyticalStopwatch from '../components/AnalyticalStopwatch';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SubjectIcon from '@mui/icons-material/Subject';
import CloseIcon from '@mui/icons-material/Close';
import TargetIcon from '@mui/icons-material/Flag';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FlagIcon from '@mui/icons-material/Flag';
import SaveIcon from '@mui/icons-material/Save';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SchoolIcon from '@mui/icons-material/School';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckIcon from '@mui/icons-material/Check';

import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const Analiz = () => {
  const [user] = useAuthState(auth);
  const [studyRecords, setStudyRecords] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().toLocaleString('tr-TR', { month: 'long', year: 'numeric' }));
  const [topicDialog, setTopicDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [studyTargets, setStudyTargets] = useState({});
  const [targetSubject, setTargetSubject] = useState('');
  const [targetHours, setTargetHours] = useState(10);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [tipAnchorEl, setTipAnchorEl] = useState(null);
  const [lowHoursDialog, setLowHoursDialog] = useState(false);

  // Fetch study records from Firestore
  const fetchStudyRecords = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching study records:', error);
      setIsLoading(false);
    }
  }, [user]);

  // Fetch study targets from Firestore
  const fetchStudyTargets = useCallback(async () => {
    if (!user) return;

    try {
      const targetsRef = doc(db, 'users', user.uid, 'stats', 'targets');
      const targetsDoc = await getDoc(targetsRef);
      
      if (targetsDoc.exists()) {
        setStudyTargets(targetsDoc.data());
      } else {
        // Create empty targets doc if it doesn't exist
        await setDoc(targetsRef, {});
        setStudyTargets({});
      }
    } catch (error) {
      console.error('Error fetching study targets:', error);
    }
  }, [user]);

  // Save study target for a subject
  const saveStudyTarget = async (subject, hours) => {
    if (!user || !subject) return;
    
    // Ensure hours is a valid number
    const validHours = parseInt(hours) || 10;
    
    // Check if hours is less than 10
    if (validHours < 10) {
      setLowHoursDialog(true);
      return;
    }

    try {
      // Convert to seconds for storage (consistent with analytics data)
      const targetSeconds = validHours * 3600;
      
      // Update local state
      const updatedTargets = {
        ...studyTargets,
        [subject]: targetSeconds
      };
      
      setStudyTargets(updatedTargets);
      
      // Save to Firestore
      const targetsRef = doc(db, 'users', user.uid, 'stats', 'targets');
      await setDoc(targetsRef, updatedTargets);
      
      // Show success message
      setSnackbarMessage(`${subject} için ${validHours} saat hedef kaydedildi`);
      setSnackbarOpen(true);
      
      // Reset target hours input
      setTargetHours(10);
    } catch (error) {
      console.error('Error saving study target:', error);
      setSnackbarMessage('Hedef kaydedilirken bir hata oluştu');
      setSnackbarOpen(true);
    }
  };

  // Delete study target for a subject
  const handleDeleteTarget = async (subject) => {
    if (!user || !subject) return;

    try {
      // Create a copy of current targets without the deleted subject
      const updatedTargets = { ...studyTargets };
      delete updatedTargets[subject];
      
      // Update local state
      setStudyTargets(updatedTargets);
      
      // Save to Firestore
      const targetsRef = doc(db, 'users', user.uid, 'stats', 'targets');
      await setDoc(targetsRef, updatedTargets);
      
      // Show success message
      setSnackbarMessage(`${subject} için hedef silindi`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting study target:', error);
      setSnackbarMessage('Hedef silinirken bir hata oluştu');
      setSnackbarOpen(true);
    }
  };

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

  // Load study records
  useEffect(() => {
    if (user) {
      fetchStudyRecords();
      fetchStudyTargets();
    }
  }, [user, fetchStudyRecords, fetchStudyTargets]);

  // Calculate analytics whenever study records change
  useEffect(() => {
    if (studyRecords.length > 0) {
      calculateAnalytics();
    }
  }, [studyRecords, calculateAnalytics]);

  // Format time for display
  const formatTime = (seconds, includeHours = false) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    let timeString = '';
    if (hours > 0 || includeHours) {
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

  // Calculate progress percentage based on target (or default if no target)
  const calculateProgress = (totalSeconds, subject) => {
    // Check if there's a target for this subject
    if (studyTargets && studyTargets[subject]) {
      const targetSeconds = studyTargets[subject];
      const progress = (totalSeconds / targetSeconds) * 100;
      return Math.floor(Math.min(progress, 100));
    } else {
      // Default calculation if no target (40 hours)
      const progress = (totalSeconds / 144000) * 100;
      return Math.floor(Math.min(progress, 100));
    }
  };

  const handleOpenTip = (event) => {
    setTipAnchorEl(event.currentTarget);
  };

  const handleCloseTip = () => {
    setTipAnchorEl(null);
  };

  const tipOpen = Boolean(tipAnchorEl);
  const tipId = tipOpen ? 'simple-popover' : undefined;

  const handleOpenTopicDialog = (subject) => {
    setSelectedSubject(subject);
    setTopicDialog(true);
  };

  const handleCloseTopicDialog = () => {
    setTopicDialog(false);
    setSelectedSubject(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getSubjectColor = (subject) => {
    const subjectColors = {
      'Matematik': '#4285F4',
      'Fizik': '#0F9D58',
      'Kimya': '#DB4437',
      'Biyoloji': '#F4B400',
      'Edebiyat': '#673AB7',
      'Türkçe': '#3F51B5',
      'Tarih': '#FF6D00',
      'Coğrafya': '#00ACC1',
      'Felsefe': '#9E9E9E',
      'Din Kültürü': '#795548',
      'İngilizce': '#607D8B'
    };
    
    return subjectColors[subject] || '#3F51B5';
  };

  const getLighterColor = (color) => {
    const rgb = hexToRgb(color);
    return `rgba(${rgb.r + 50}, ${rgb.g + 50}, ${rgb.b + 50}, 1)`;
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
  minHeight: '100vh',
  py: 4,
  px: { xs: 1, sm: 2, md: 4 },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
  position: 'relative',
  overflow: 'hidden',
  // Glassmorphism overlay
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255,255,255,0.35)',
    backdropFilter: 'blur(8px)',
    zIndex: 0,
  },
  zIndex: 1,
}}>
      <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom sx={{ 
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        '&::before': {
          content: '""',
          display: 'block',
          width: 5,
          height: 24,
          backgroundColor: 'primary.main',
          borderRadius: 4,
          marginRight: 1.5
        }
      }}>
        Çalışma Analizleri
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: 'repeat(1, 1fr)', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)', 
            lg: 'repeat(4, 1fr)' 
          },
          gap: 3
        }}>
          {/* Sabit ders listesi - tüm dersler burada yer alacak */}
          {['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Edebiyat', 'Türkçe', 'Tarih', 
            'Coğrafya', 'Felsefe', 'Din Kültürü', 'İngilizce'].map(subject => {
            
            // Ders için veri var mı kontrol et
            const hasData = Object.keys(analytics).includes(subject);
            const totalSubjectTime = hasData ? analytics[subject].totalTime : 0;
            const targetTime = studyTargets[subject] || 0;
            const progressPercent = targetTime > 0 ? Math.floor(Math.min(100, (totalSubjectTime / targetTime) * 100)) : 0;
            const topicCount = hasData ? Object.keys(analytics[subject]?.topics || {}).length : 0;
            
            // Define subject color based on YKS color scheme
            const subjectColors = {
              'Matematik': '#4285F4',
              'Fizik': '#0F9D58',
              'Kimya': '#DB4437',
              'Biyoloji': '#F4B400',
              'Edebiyat': '#673AB7',
              'Türkçe': '#3F51B5',
              'Tarih': '#FF6D00',
              'Coğrafya': '#00ACC1',
              'Felsefe': '#9E9E9E',
              'Din Kültürü': '#795548',
              'İngilizce': '#607D8B'
            };
            
            const subjectColor = subjectColors[subject] || '#3F51B5';
            
            return (
              <Card 
  key={subject}
  sx={{
    borderRadius: 4,
    overflow: 'hidden',
    background: `linear-gradient(135deg, ${subjectColor} 0%, #fff 100%)`,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
    backdropFilter: 'blur(10px)',
    border: `1.5px solid rgba(255,255,255,0.25)` ,
    transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
    opacity: hasData ? 1 : 0.85,
    position: 'relative',
    zIndex: 2,
    '&:hover': {
      transform: 'translateY(-6px) scale(1.025)',
      boxShadow: '0 12px 24px 0 rgba(31, 38, 135, 0.18)',
      opacity: 1,
      borderColor: `${subjectColor}99`,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(255,255,255,0.12)',
      pointerEvents: 'none',
      zIndex: 1,
    }
  }}
>
                <Box sx={{
  p: 2,
  background: `linear-gradient(120deg, ${subjectColor} 60%, #fff 100%)`,
  color: 'white',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `2.5px solid ${subjectColor}`,
  boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.12)',
  zIndex: 2,
}}>
                  <Typography variant="subtitle1" fontWeight="600">
                    {subject}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {studyTargets[subject] > 0 && (
                      <Chip 
                        label={`${Math.round(studyTargets[subject] / 3600)} saat`}
                        size="small" 
                        icon={<AccessTimeIcon style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }} />}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.7)',
                          fontWeight: 400,
                          border: '1px solid rgba(255,255,255,0.15)',
                          '& .MuiChip-icon': {
                            color: 'rgba(255,255,255,0.7) !important',
                            marginLeft: '5px'
                          }
                        }} 
                      />
                    )}
                    <Chip 
                      label={hasData ? `${formatTime(totalSubjectTime)}` : "0 dakika"} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        fontWeight: 600,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }} 
                    />
                  </Box>
                </Box>
                
                <CardContent sx={{
  p: 2.5,
  background: 'rgba(255,255,255,0.70)',
  backdropFilter: 'blur(6px)',
  borderRadius: 2,
  boxShadow: '0 1.5px 6px rgba(31,38,135,0.08)',
  zIndex: 2,
}}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        İlerleme
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {hasData ? `${Math.floor(progressPercent)}%` : "0%"}
                      </Typography>
                    </Box>
                    <Box sx={{
  width: '100%',
  mx: 'auto',
  maxWidth: '100%',
  background: 'rgba(255,255,255,0.28)',
  borderRadius: 3,
  boxShadow: '0 2px 10px rgba(31,38,135,0.07)',
  p: 2,
  mb: 2,
  backdropFilter: 'blur(4px)',
}}>
  <AnalyticalStopwatch />
</Box>
                      <Box 
                        sx={{
                          width: hasData ? `${progressPercent}%` : '0%',
                          height: '100%',
                          bgcolor: subjectColor,
                          borderRadius: 3,
                          boxShadow: '0 1px 6px rgba(31,38,135,0.08)',
                        }}
                      />
                    </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {hasData ? `${topicCount} konu` : "Henüz konu yok"}
                    </Typography>
                    
                    <Button
                      variant="text"
                      size="small"
                      sx={{ 
                        color: subjectColor,
                        fontSize: '0.8rem',
                        fontWeight: 500
                      }}
                      onClick={() => {
                        setSelectedSubject(subject);
                        setTopicDialog(true);
                      }}
                      disabled={!hasData}
                    >
                      Konular
                      <Box component="span" sx={{ display: 'inline-flex', ml: 0.5 }}>
                        <NavigateNextIcon fontSize="small" />
                      </Box>
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
      {/* Hedef Belirleme Bölümü */}
      <Paper
        elevation={0}
        sx={{
          mt: 5,
          p: 0,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.02)'
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '5px', 
          background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)' 
        }} />
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 3, 
          pb: 0
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48, 
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
            color: 'white',
            mr: 2,
            boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)'
          }}>
            <FlagIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom={false}>
              Çalışma Hedefi Belirle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Her ders için hedeflediğin çalışma sürelerini ayarla
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ px: 3, pb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="600" color="text.primary" gutterBottom>
                  Ders Seç
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={targetSubject}
                    onChange={(e) => setTargetSubject(e.target.value)}
                    displayEmpty
                    sx={{ 
                      borderRadius: 2,
                      backgroundColor: '#f5f7fa',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0,0,0,0.08)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0,0,0,0.18)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 2,
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                          mt: 0.5
                        }
                      }
                    }}
                  >
                    <MenuItem value="" disabled>Lütfen bir ders seçin</MenuItem>
                    {['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Edebiyat', 'Türkçe', 'Tarih', 
                      'Coğrafya', 'Felsefe', 'Din Kültürü', 'İngilizce']
                      .sort()
                      .map((subject) => {
                        // Ders renkleri
                        const subjectColors = {
                          'Matematik': '#4285F4',
                          'Fizik': '#0F9D58',
                          'Kimya': '#DB4437',
                          'Biyoloji': '#F4B400',
                          'Edebiyat': '#673AB7',
                          'Türkçe': '#3F51B5',
                          'Tarih': '#FF6D00',
                          'Coğrafya': '#00ACC1',
                          'Felsefe': '#9E9E9E',
                          'Din Kültürü': '#795548',
                          'İngilizce': '#607D8B'
                        };
                          
                        return (
                          <MenuItem 
                            key={subject} 
                            value={subject}
                            sx={{
                              borderLeft: `3px solid ${subjectColors[subject] || '#3F51B5'}`,
                              my: 0.5,
                              mx: 0.5,
                              borderRadius: 1,
                              '&.Mui-selected': {
                                bgcolor: `${subjectColors[subject]}15` || 'rgba(63, 81, 181, 0.08)',
                                fontWeight: 'bold'
                              },
                              '&.Mui-selected:hover': {
                                bgcolor: `${subjectColors[subject]}25` || 'rgba(63, 81, 181, 0.12)'
                              }
                            }}
                          >
                            {subject}
                          </MenuItem>
                        )
                      }
                    )}
                  </Select>
                </FormControl>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" fontWeight="600" color="text.primary" gutterBottom sx={{ mb: 1 }}>
                  Hedef Süre (Saat)
                </Typography>
                <TextField
                  type="number"
                  value={targetHours}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= 150) {
                      setTargetHours(value);
                    } else if (!isNaN(value) && value > 150) {
                      setTargetHours(150);
                    } else if (!isNaN(value) && value < 1) {
                      setTargetHours(1);
                    }
                  }}
                  inputProps={{ 
                    min: 1, 
                    max: 150,
                    step: 1
                  }}
                  fullWidth
                  variant="outlined"
                  placeholder="Hedef saat (1-150)"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f5f7fa',
                      '& fieldset': {
                        borderColor: 'rgba(0,0,0,0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: targetSubject ? getSubjectColor(targetSubject) : '#e53935',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: targetSubject ? getSubjectColor(targetSubject) : '#e53935',
                      }
                    },
                    '& .MuiInputBase-input': {
                      textAlign: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      py: 1.5
                    }
                  }}
                />
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: 1,
                  mb: 2
                }}>
                  <Typography variant="caption" color="text.secondary">
                    Minimum: 1 saat
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Maksimum: 150 saat
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={() => saveStudyTarget(targetSubject, targetHours)}
                  disabled={!targetSubject}
                  fullWidth
                  sx={{ 
                    py: 1.2,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
                    background: targetSubject ? `linear-gradient(135deg, ${getSubjectColor(targetSubject)} 0%, ${getLighterColor(getSubjectColor(targetSubject))} 100%)` : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(33, 150, 243, 0.25)',
                      transform: 'translateY(-2px)'
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)'
                    },
                    cursor: targetSubject ? 'pointer' : 'not-allowed',
                    opacity: targetSubject ? 1 : 0.7
                  }}
                >
                  Hedefi Kaydet
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column'
              }}>
                <Typography variant="subtitle2" fontWeight="600" color="text.primary" gutterBottom>
                  Mevcut Hedefler
                </Typography>
                
                <Box sx={{ 
                  flex: 1, 
                  bgcolor: '#f5f7fa',
                  borderRadius: 2,
                  p: 2,
                  overflowY: 'auto',
                  maxHeight: 250
                }}>
                  {Object.keys(studyTargets).length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      p: 3,
                      color: 'text.secondary',
                      textAlign: 'center'
                    }}>
                      <HelpOutlineIcon sx={{ mb: 1, fontSize: 40, color: 'action.disabled' }} />
                      <Typography variant="body2">
                        Henüz hiç hedef belirlemedin. Hedefler, çalışma motivasyonunu artırmaya yardımcı olur.
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {Object.keys(studyTargets)
                        .filter(subject => subject !== 'daily')
                        .sort()
                        .map(subject => {
                          const targetTime = studyTargets[subject];
                          const hours = Math.floor(targetTime / 3600);
                          
                          // Ders renkleri
                          const subjectColors = {
                            'Matematik': '#4285F4',
                            'Fizik': '#0F9D58',
                            'Kimya': '#DB4437',
                            'Biyoloji': '#F4B400',
                            'Edebiyat': '#673AB7',
                            'Türkçe': '#3F51B5',
                            'Tarih': '#FF6D00',
                            'Coğrafya': '#00ACC1',
                            'Felsefe': '#9E9E9E',
                            'Din Kültürü': '#795548',
                            'İngilizce': '#607D8B'
                          };
                          
                          return (
                            <Paper
                              key={subject}
                              sx={{ 
                                mb: 1.5, 
                                p: 1.5,
                                borderRadius: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                borderLeft: `4px solid ${subjectColors[subject] || '#3F51B5'}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'translateX(4px)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                }
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle2" fontWeight="600">
                                  {subject}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {hours} saat
                                </Typography>
                              </Box>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteTarget(subject)}
                                sx={{ 
                                  color: 'text.secondary',
                                  '&:hover': { 
                                    color: 'error.main', 
                                    bgcolor: 'error.light' 
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Paper>
                          );
                        })}
                    </List>
                  )}
                </Box>
                
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <LightbulbIcon sx={{ color: 'warning.main', mr: 1 }} fontSize="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    İpucu: Hedeflerini düzenli olarak gözden geçir ve güncelle.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Konu detayları diyaloğu */}
      <Dialog 
        open={topicDialog} 
        onClose={handleCloseTopicDialog} 
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 0,
          position: 'relative'
        }}>
          <Box sx={{
            p: 2,
            background: selectedSubject ? `linear-gradient(135deg, ${getSubjectColor(selectedSubject)} 0%, ${getLighterColor(getSubjectColor(selectedSubject))} 100%)` : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ mr: 1.5, fontSize: 24 }} />
              <Typography variant="h6" fontWeight={600}>
                {selectedSubject} - Konu Detayları
              </Typography>
            </Box>
            <IconButton
              color="inherit"
              size="small"
              onClick={handleCloseTopicDialog}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedSubject && analytics[selectedSubject] && (
            <Box sx={{ p: 3 }}>
              <Paper elevation={0} sx={{ 
                mb: 3, 
                p: 2.5, 
                borderRadius: 2, 
                bgcolor: 'rgba(245, 247, 250, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="700" color="primary.dark" gutterBottom>
                      Toplam Çalışma Süresi
                    </Typography>
                    <Typography variant="h5" fontWeight="800" color={getSubjectColor(selectedSubject)}>
                      {formatTime(analytics[selectedSubject].totalTime)}
                    </Typography>
                  </Box>
                  {studyTargets[selectedSubject] > 0 && (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle2" fontWeight="600" color="text.secondary" gutterBottom>
                        Hedef
                      </Typography>
                      <Typography variant="h6" fontWeight="700" color="text.secondary">
                        {Math.round(studyTargets[selectedSubject] / 3600)} saat
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight="600" color="text.secondary">
                      İlerleme
                    </Typography>
                    <Typography variant="caption" fontWeight="700" color={getSubjectColor(selectedSubject)}>
                      {calculateProgress(analytics[selectedSubject].totalTime, selectedSubject)}%
                    </Typography>
                  </Box>
                  <LinearProgress
  variant="determinate"
  value={calculateProgress(analytics[selectedSubject].totalTime, selectedSubject)}
  sx={{
    height: 10,
    borderRadius: 6,
    bgcolor: 'rgba(255,255,255,0.32)',
    boxShadow: '0 1px 4px rgba(31,38,135,0.10)',
    '& .MuiLinearProgress-bar': {
      bgcolor: getSubjectColor(selectedSubject),
      backgroundImage: `linear-gradient(90deg, ${getSubjectColor(selectedSubject)} 0%, ${getLighterColor(getSubjectColor(selectedSubject))} 100%)`,
      borderRadius: 6,
      boxShadow: '0 1px 6px rgba(31,38,135,0.08)',
    },
  }}
/>
                </Box>
              </Paper>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 1.5,
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
              }}>
                <FormatListBulletedIcon sx={{ mr: 1, color: getSubjectColor(selectedSubject) }} />
                <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                  Konu Bazlı Çalışma Süreleri
                </Typography>
              </Box>
              
              {Object.keys(analytics[selectedSubject].topics).length > 0 ? (
                <Box sx={{ maxHeight: '300px', overflowY: 'auto', pr: 1 }}>
                  {Object.keys(analytics[selectedSubject].topics)
                    .sort((a, b) => analytics[selectedSubject].topics[b] - analytics[selectedSubject].topics[a])
                    .map((topic, index) => (
                      <Paper 
                        key={topic}
                        elevation={0}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          mb: 1.5,
                          bgcolor: 'white',
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.08)',
                            borderColor: 'rgba(0, 0, 0, 0.12)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            bgcolor: getSubjectColor(selectedSubject),
                            mr: 1.5
                          }} />
                          <Typography fontWeight={600} fontSize="0.95rem">{topic}</Typography>
                        </Box>
                        <Chip
                          label={formatTime(analytics[selectedSubject].topics[topic])}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: `${getSubjectColor(selectedSubject)}15`,
                            color: getSubjectColor(selectedSubject),
                            border: `1px solid ${getSubjectColor(selectedSubject)}30`
                          }}
                        />
                      </Paper>
                    ))}
                </Box>
              ) : (
                <Paper
  elevation={0}
  sx={{
    p: 3,
    borderRadius: 3,
    textAlign: 'center',
    bgcolor: 'rgba(255,255,255,0.65)',
    border: '1.5px dashed #a3bffa',
    boxShadow: '0 2px 12px rgba(31,38,135,0.04)',
    backdropFilter: 'blur(3px)',
  }}
>
                  <AssignmentIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    Bu ders için henüz konu çalışması kaydı bulunmuyor.
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: 'rgba(245, 247, 250, 0.8)' }}>
          <Button 
            variant="contained" 
            onClick={handleCloseTopicDialog}
            startIcon={<CheckIcon />}
            sx={{ 
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: selectedSubject ? `linear-gradient(135deg, ${getSubjectColor(selectedSubject)} 0%, ${getLighterColor(getSubjectColor(selectedSubject))} 100%)` : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bildirim */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        action={
          <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      {/* Az saat uyarısı diyaloğu */}
      <Dialog 
        open={lowHoursDialog} 
        onClose={() => setLowHoursDialog(false)} 
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ 
          bgcolor: 'warning.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5
        }}>
          <Typography variant="h6" fontWeight={700}>
            Hedef Süre Uyarısı
          </Typography>
          <Button
            color="inherit"
            size="small"
            onClick={() => setLowHoursDialog(false)}
            sx={{ minWidth: 'auto', p: 0.5 }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent dividers sx={{
  p: 3,
  background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)',
  backdropFilter: 'blur(6px)',
  borderRadius: 3,
  boxShadow: '0 2px 12px rgba(31,38,135,0.10)',
}}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" color="error.main" gutterBottom fontWeight="bold">
                Üzgünüm :(
              </Typography>
            </Box>
            <Typography variant="body1" color="text.primary" paragraph>
              Herhangi bir derse 1 ay içinde 10 saatten az çalışma hedefi belirlemeni kabul edemiyorum. 
              Bu sadece seni sıralamada geriye atar.
            </Typography>
            <Typography variant="body1" color="text.primary" paragraph fontWeight="medium">
              Biz tamamen ileriye yönelik akıllıca program yapmalıyız.
            </Typography>
            <Typography variant="body1" color="primary.main" paragraph fontWeight="bold" sx={{ mt: 2 }}>
              Unutma! Ne kadar ileriye gidebileceğini sadece ileriye giderek görebilirsin.
            </Typography>
            <Typography variant="body1" color="success.main" fontWeight="bold">
              Sana güveniyorum.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => setLowHoursDialog(false)}
            sx={{ 
              fontWeight: 600,
              px: 4,
              borderRadius: 2
            }}
          >
            Anladım
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Analiz;
