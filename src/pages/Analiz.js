import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Divider,
  LinearProgress,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  IconButton,
  Snackbar,
  FormControl,
  Select,
  MenuItem,
  TextField,
  List,
  Avatar,
  Tooltip
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SubjectIcon from '@mui/icons-material/Subject';
import CloseIcon from '@mui/icons-material/Close';
import FlagIcon from '@mui/icons-material/Flag';
import SaveIcon from '@mui/icons-material/Save';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SchoolIcon from '@mui/icons-material/School';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FunctionsIcon from '@mui/icons-material/Functions';
import ScienceIcon from '@mui/icons-material/Science';
import BiotechIcon from '@mui/icons-material/Biotech';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LanguageIcon from '@mui/icons-material/Language';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import PublicIcon from '@mui/icons-material/Public';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TranslateIcon from '@mui/icons-material/Translate';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const Analiz = () => {
  const [user] = useAuthState(auth);
  const [studyRecords, setStudyRecords] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [topicDialog, setTopicDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [studyTargets, setStudyTargets] = useState({});
  const [targetSubject, setTargetSubject] = useState('');
  const [targetHours, setTargetHours] = useState(10);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [lowHoursDialog, setLowHoursDialog] = useState(false);

  const fetchStudyRecords = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const recordsQuery = query(collection(db, 'studyRecords'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(recordsQuery);
      const records = [];
      querySnapshot.forEach((doc) => records.push(doc.data()));
      setStudyRecords(records);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching study records:', error);
      setIsLoading(false);
    }
  }, [user]);

  const fetchStudyTargets = useCallback(async () => {
    if (!user) return;
    try {
      const targetsRef = doc(db, 'users', user.uid, 'stats', 'targets');
      const targetsDoc = await getDoc(targetsRef);
      if (targetsDoc.exists()) {
        setStudyTargets(targetsDoc.data());
      } else {
        await setDoc(targetsRef, {});
        setStudyTargets({});
      }
    } catch (error) {
      console.error('Error fetching study targets:', error);
    }
  }, [user]);

  const saveStudyTarget = async (subject, hours) => {
    if (!user || !subject) return;
    let validHours = parseInt(hours, 10);
    if (isNaN(validHours)) validHours = 10;
    if (validHours < 10) {
      setLowHoursDialog(true);
      return;
    }
    try {
      const targetSeconds = validHours * 3600;
      const updatedTargets = { ...studyTargets, [subject]: targetSeconds };
      setStudyTargets(updatedTargets);
      const targetsRef = doc(db, 'users', user.uid, 'stats', 'targets');
      await setDoc(targetsRef, updatedTargets);
      setSnackbarMessage(`${subject} için ${validHours} saat hedef kaydedildi`);
      setSnackbarOpen(true);
      setTargetHours(10);
    } catch (error) {
      console.error('Error saving study target:', error);
      setSnackbarMessage('Hedef kaydedilirken bir hata oluştu');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteTarget = async (subject) => {
    if (!user || !subject) return;
    try {
      const updatedTargets = { ...studyTargets };
      delete updatedTargets[subject];
      setStudyTargets(updatedTargets);
      const targetsRef = doc(db, 'users', user.uid, 'stats', 'targets');
      await setDoc(targetsRef, updatedTargets);
      setSnackbarMessage(`${subject} için hedef silindi`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting study target:', error);
      setSnackbarMessage('Hedef silinirken bir hata oluştu');
      setSnackbarOpen(true);
    }
  };

  const calculateAnalytics = useCallback(() => {
    const analytics = {};
    studyRecords.forEach(record => {
      if (!analytics[record.subject]) {
        analytics[record.subject] = { totalTime: 0, topics: {} };
      }
      if (!analytics[record.subject].topics[record.topic]) {
        analytics[record.subject].topics[record.topic] = 0;
      }
      analytics[record.subject].topics[record.topic] += record.duration;
      analytics[record.subject].totalTime += record.duration;
    });
    setAnalytics(analytics);
  }, [studyRecords]);

  useEffect(() => {
    if (user) {
      fetchStudyRecords();
      fetchStudyTargets();
    }
  }, [user, fetchStudyRecords, fetchStudyTargets]);

  useEffect(() => {
    if (studyRecords.length > 0) {
      calculateAnalytics();
    }
  }, [studyRecords, calculateAnalytics]);

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
    if (hours === 0 && minutes === 0) {
      timeString = '0 dakika';
    }
    return timeString;
  };

  const calculateProgress = (totalSeconds, subject) => {
    if (studyTargets && studyTargets[subject]) {
      const targetSeconds = studyTargets[subject];
      const progress = (totalSeconds / targetSeconds) * 100;
      return Math.floor(Math.min(progress, 100));
    } else {
      const progress = (totalSeconds / 144000) * 100;
      return Math.floor(Math.min(progress, 100));
    }
  };

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
    if (!subject) return '#4285F4';
    const subjectColors = {
      'Matematik': '#1E90FF',
      'Fizik': '#2ECC71',
      'Kimya': '#E74C3C',
      'Biyoloji': '#F1C40F',
      'Türkçe': '#9B59B6',
      'Tarih': '#E67E22',
      'Coğrafya': '#00BFFF',
      'Edebiyat': '#8E44AD',
      'Felsefe': '#7F8C8D',
      'Din Kültürü': '#A0522D',
      'İngilizce': '#2980B9',
    };
    return subjectColors[subject] || '#1E90FF';
  };

  const getSubjectIcon = (subject) => {
    switch (subject) {
      case 'Matematik':
        return <FunctionsIcon />;
      case 'Fizik':
        return <ScienceIcon />;
      case 'Kimya':
        return <ScienceIcon sx={{ transform: 'rotate(45deg)' }} />;
      case 'Biyoloji':
        return <BiotechIcon />;
      case 'Edebiyat':
        return <MenuBookIcon />;
      case 'Türkçe':
        return <LanguageIcon />;
      case 'Tarih':
        return <HistoryEduIcon />;
      case 'Coğrafya':
        return <PublicIcon />;
      case 'Felsefe':
        return <PsychologyIcon />;
      case 'Din Kültürü':
        return <AccountBalanceIcon />;
      case 'İngilizce':
        return <TranslateIcon />;
      default:
        return <SubjectIcon />;
    }
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
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  };

  const sortedTopics = useMemo(() => {
    if (!selectedSubject || !analytics[selectedSubject]?.topics) return [];
    return Object.keys(analytics[selectedSubject].topics).sort(
      (a, b) => analytics[selectedSubject].topics[b] - analytics[selectedSubject].topics[a]
    );
  }, [selectedSubject, analytics]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4, px: { xs: 1, sm: 2, md: 4 }, background: '#D9D4BB' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)' }} />
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        sx={{ mb: 3, display: 'flex', alignItems: 'center', '&::before': { content: '""', width: 5, height: 24, backgroundColor: '#ede8ce', borderRadius: 4, marginRight: 1.5 } }}
      >
        Çalışma Analizleri
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
        {['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Edebiyat', 'Türkçe', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü', 'İngilizce'].map(subject => {
          const subjectData = analytics[subject] || { totalTime: 0 };
          const progress = calculateProgress(subjectData.totalTime, subject);
          const hasTarget = studyTargets[subject] > 0;
          
          return (
            <Card
              key={subject}
              elevation={0}
              onClick={() => handleOpenTopicDialog(subject)}
              sx={{
                cursor: 'pointer',
                borderRadius: '20px',
                background: `linear-gradient(145deg, #ffffff 0%, ${getSubjectColor(subject)}10 100%)`,
                boxShadow: `0 10px 25px 0 rgba(0,0,0,0.08), 0 5px 15px 0 ${getSubjectColor(subject)}25`,
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                padding: 2.5,
                border: `2px solid ${getSubjectColor(subject)}40`,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  boxShadow: `0 15px 35px 0 rgba(0,0,0,0.12), 0 8px 20px 0 ${getSubjectColor(subject)}50`, 
                  borderColor: getSubjectColor(subject),
                  transform: 'translateY(-8px) scale(1.02)'
                },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '6px',
                  background: `linear-gradient(90deg, ${getSubjectColor(subject)} 0%, ${getLighterColor(getSubjectColor(subject))} 100%)`,
                  borderTopLeftRadius: '18px',
                  borderTopRightRadius: '18px'
                }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                <Avatar
                  sx={{
                    bgcolor: getSubjectColor(subject),
                    color: '#ffffff',
                    width: 56,
                    height: 56,
                    boxShadow: `0 6px 16px ${getSubjectColor(subject)}50`,
                    mr: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1) rotate(5deg)'
                    }
                  }}
                >
                  {getSubjectIcon(subject)}
                </Avatar>
                <Typography 
                  sx={{ 
                    fontSize: 20, 
                    fontWeight: 800, 
                    color: getSubjectColor(subject), 
                    fontFamily: `'Poppins','Inter','Roboto',sans-serif`,
                    lineHeight: 1.2,
                    letterSpacing: '-0.5px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {subject}
                </Typography>
              </Box>
              
              {/* Study time display */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 0.5, backgroundColor: `${getSubjectColor(subject)}15`, p: 1.5, borderRadius: 2 }}>
                <AccessTimeIcon sx={{ fontSize: 20, color: getSubjectColor(subject), mr: 1 }} />
                <Typography variant="body1" color="text.primary" fontWeight={700} fontSize="1rem">
                  {formatTime(subjectData.totalTime || 0)}
                </Typography>
              </Box>
              
              {/* Progress bar section */}
              <Box sx={{ mt: 'auto', width: '100%', pt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    {hasTarget ? (
                      <>
                        <FlagIcon sx={{ mr: 0.5, fontSize: 18, color: getSubjectColor(subject) }} />
                        İlerleme
                      </>
                    ) : (
                      <>
                        <HelpOutlineIcon sx={{ mr: 0.5, fontSize: 18, color: 'warning.main' }} />
                        Hedef Yok
                      </>
                    )}
                  </Typography>
                  {hasTarget && (
                    <Tooltip title={`Hedef: ${Math.round(studyTargets[subject] / 3600)} saat`} arrow placement="top">
                      <Chip 
                        label={`${progress}%`} 
                        size="small" 
                        sx={{ 
                          fontWeight: 800, 
                          bgcolor: getSubjectColor(subject), 
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          height: 24
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>
                
                <LinearProgress
                  variant="determinate"
                  value={hasTarget ? progress : 0}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'rgba(0,0,0,0.06)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getSubjectColor(subject),
                      backgroundImage: `linear-gradient(90deg, ${getSubjectColor(subject)} 0%, ${getLighterColor(getSubjectColor(subject))} 100%)`,
                      borderRadius: 5,
                      boxShadow: `0 2px 6px ${getSubjectColor(subject)}40`
                    },
                  }}
                />
              </Box>
            </Card>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 3, pt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ fontWeight: 700, borderRadius: 2, boxShadow: '0 2px 8px rgba(33, 150, 243, 0.14)', mb: 1, minWidth: 200 }}
          onClick={() => setTopicDialog(true)}
        >
          Konu Bazlı Çalışma Süreleri
        </Button>
      </Box>
      <Box sx={{ 
        p: 3, 
        pb: 0, 
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(33, 150, 243, 0.02) 100%)',
          borderRadius: '20px',
          zIndex: -1,
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 60, 
            height: 60, 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)', 
            color: 'white', 
            mr: 2.5, 
            boxShadow: '0 8px 20px rgba(33, 150, 243, 0.3)',
            transform: 'rotate(-5deg)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'rotate(0deg) scale(1.05)',
              boxShadow: '0 10px 25px rgba(33, 150, 243, 0.4)'
            }
          }}>
            <FlagIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography 
              variant="h5" 
              sx={{
                fontWeight: 800,
                color: '#1565C0',
                mb: 0.5,
                letterSpacing: '-0.5px',
                textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                fontFamily: "'Poppins', 'Montserrat', sans-serif"
              }}
            >
              Çalışma Hedefi Belirle
            </Typography>
            <Typography 
              variant="body1" 
              sx={{
                color: '#546E7A',
                fontWeight: 500,
                fontSize: '1rem',
                letterSpacing: '0.2px'
              }}
            >
              Her ders için hedeflediğin çalışma sürelerini ayarla
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ 
        my: 3, 
        borderColor: 'rgba(33, 150, 243, 0.2)',
        '&::before, &::after': {
          borderColor: 'rgba(33, 150, 243, 0.2)'
        }
      }} />
      <Box sx={{ px: 3, pb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle1" 
                sx={{
                  fontWeight: 700, 
                  color: '#55b3d9', 
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: 4,
                    height: 18,
                    backgroundColor: '#55b3d9',
                    borderRadius: 4,
                    mr: 1.5
                  }
                }}
              >
                Ders Seç
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={targetSubject}
                  onChange={(e) => setTargetSubject(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: 3,
                    backgroundColor: '#ede8ce',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    height: 56,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(25, 118, 210, 0.2)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(25, 118, 210, 0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#55b3d9', borderWidth: 2 },
                    '& .MuiSelect-select': { 
                      display: 'flex', 
                      alignItems: 'center',
                      fontWeight: 600,
                      fontSize: '1rem',
                      py: 1.5
                    }
                  }}
                  MenuProps={{ 
                    PaperProps: { 
                      sx: { 
                        borderRadius: 3, 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)', 
                        mt: 0.5,
                        maxHeight: 350
                      } 
                    } 
                  }}
                >
                  <MenuItem value="" disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#757575' }}>
                      <SubjectIcon sx={{ mr: 1.5, fontSize: 20, opacity: 0.7 }} />
                      Lütfen bir ders seçin
                    </Box>
                  </MenuItem>
                  {['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Edebiyat', 'Türkçe', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü', 'İngilizce'].sort().map(subject => (
                    <MenuItem
                      key={subject}
                      value={subject}
                      sx={{
                        borderLeft: `4px solid ${getSubjectColor(subject)}`,
                        my: 0.8,
                        mx: 0.5,
                        borderRadius: 2,
                        py: 1.5,
                        transition: 'all 0.2s ease',
                        '&.Mui-selected': { 
                          bgcolor: `${getSubjectColor(subject)}15`, 
                          fontWeight: 'bold',
                          boxShadow: `0 2px 8px ${getSubjectColor(subject)}30`
                        },
                        '&.Mui-selected:hover': { bgcolor: `${getSubjectColor(subject)}25` },
                        '&:hover': { bgcolor: `${getSubjectColor(subject)}10` }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            bgcolor: getSubjectColor(subject),
                            mr: 1.5,
                            fontSize: '0.9rem'
                          }}
                        >
                          {getSubjectIcon(subject)}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600 }}>{subject}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{
                  fontWeight: 700, 
                  color: '#55b3d9', 
                  mb: 1.5,
                  mt: 3,
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: 4,
                    height: 18,
                    backgroundColor: '#55b3d9',
                    borderRadius: 4,
                    mr: 1.5
                  }
                }}
              >
                Hedef Süre (Saat)
              </Typography>
              <TextField
                type="number"
                value={targetHours}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1 && value <= 150) setTargetHours(value);
                  else if (!isNaN(value) && value > 150) setTargetHours(150);
                  else if (!isNaN(value) && value < 1) setTargetHours(1);
                }}
                inputProps={{ min: 1, max: 150, step: 1 }}
                fullWidth
                variant="outlined"
                placeholder="Hedef saat (1-150)"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#ede8ce',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    height: 56,
                    '& fieldset': { borderColor: targetSubject ? `${getSubjectColor(targetSubject)}50` : 'rgba(25, 118, 210, 0.2)' },
                    '&:hover fieldset': { borderColor: targetSubject ? getSubjectColor(targetSubject) : '#55b3d9' },
                    '&.Mui-focused fieldset': { borderColor: targetSubject ? getSubjectColor(targetSubject) : '#55b3d9', borderWidth: 2 },
                  },
                  '& .MuiInputBase-input': { 
                    textAlign: 'center', 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    py: 1.5,
                    color: targetSubject ? getSubjectColor(targetSubject) : '#55b3d9'
                  },
                  '& .MuiInputAdornment-root': {
                    mr: 2
                  }
                }}
              />
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                px: 1, 
                mb: 3,
                mt: 1,
                backgroundColor: 'rgba(33, 150, 243, 0.08)',
                borderRadius: 2,
                py: 1
              }}>
                <Chip 
                  label="Minimum: 1 saat" 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(33, 150, 243, 0.1)', 
                    color: '#55b3d9',
                    fontWeight: 600,
                    border: '1px solid rgba(33, 150, 243, 0.2)'
                  }}
                />
                <Chip 
                  label="Maksimum: 150 saat" 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(33, 150, 243, 0.1)', 
                    color: '#55b3d9',
                    fontWeight: 600,
                    border: '1px solid rgba(33, 150, 243, 0.2)'
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon sx={{ fontSize: 22 }} />}
                onClick={() => saveStudyTarget(targetSubject, targetHours)}
                disabled={!targetSubject}
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  boxShadow: targetSubject ? `0 6px 16px ${getSubjectColor(targetSubject)}40` : '0 6px 16px rgba(33, 150, 243, 0.3)',
                  background: targetSubject ? `linear-gradient(135deg, ${getSubjectColor(targetSubject)} 0%, ${getLighterColor(getSubjectColor(targetSubject))} 100%)` : 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
                  transition: 'all 0.3s ease',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  '&:hover': { 
                    boxShadow: targetSubject ? `0 8px 20px ${getSubjectColor(targetSubject)}50` : '0 8px 20px rgba(33, 150, 243, 0.4)', 
                    transform: 'translateY(-3px)' 
                  },
                  '&:active': { 
                    transform: 'translateY(-1px)', 
                    boxShadow: targetSubject ? `0 4px 12px ${getSubjectColor(targetSubject)}30` : '0 4px 12px rgba(33, 150, 243, 0.25)' 
                  },
                }}
              >
                Hedefi Kaydet
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography 
                variant="subtitle1" 
                sx={{
                  fontWeight: 700, 
                  color: '#55b3d9', 
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: 4,
                    height: 18,
                    backgroundColor: '#55b3d9',
                    borderRadius: 4,
                    mr: 1.5
                  }
                }}
              >
                Mevcut Hedefler
              </Typography>
              <Box sx={{ 
                flex: 1, 
                bgcolor: '#ede8ce', 
                borderRadius: 3, 
                p: 2.5, 
                overflowY: 'auto', 
                maxHeight: 280,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid rgba(33, 150, 243, 0.15)'
              }}>
                {Object.keys(studyTargets).length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%', 
                    p: 4, 
                    color: 'text.secondary', 
                    textAlign: 'center',
                    backgroundColor: 'rgba(33, 150, 243, 0.03)',
                    borderRadius: 2
                  }}>
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                      }}
                    >
                      <HelpOutlineIcon sx={{ fontSize: 40, color: '#55b3d9' }} />
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#55b3d9',
                        mb: 1
                      }}
                    >
                      Henüz Hedef Belirlemedin
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#546E7A', lineHeight: 1.6 }}>
                      Hedefler, çalışma motivasyonunu artırmaya ve ilerlemeyi takip etmeye yardımcı olur.
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {Object.keys(studyTargets).filter(subject => subject !== 'daily').sort().map(subject => {
                      const targetTime = studyTargets[subject];
                      const hours = Math.floor(targetTime / 3600);
                      return (
                        <Paper
                          key={subject}
                          sx={{
                            mb: 2,
                            p: 2,
                            borderRadius: 3,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                            borderLeft: `5px solid ${getSubjectColor(subject)}`,
                            transition: 'all 0.3s ease',
                            backgroundColor: '#ede8ce',
                            '&:hover': { 
                              transform: 'translateX(5px) scale(1.01)', 
                              boxShadow: `0 6px 16px ${getSubjectColor(subject)}20` 
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: getSubjectColor(subject), 
                                width: 36, 
                                height: 36, 
                                mr: 2,
                                boxShadow: `0 3px 8px ${getSubjectColor(subject)}40`
                              }}
                            >
                              {getSubjectIcon(subject)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="700" sx={{ color: getSubjectColor(subject) }}>{subject}</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon sx={{ fontSize: 16, mr: 0.7, color: 'text.secondary' }} />
                                <Typography variant="body2" fontWeight="600" color="text.secondary">{hours} saat</Typography>
                              </Box>
                            </Box>
                          </Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteTarget(subject)} 
                            sx={{ 
                              color: 'text.secondary', 
                              bgcolor: 'rgba(244, 67, 54, 0.1)',
                              '&:hover': { 
                                color: 'white', 
                                bgcolor: 'error.main'
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
              <Box sx={{ 
                mt: 3, 
                display: 'flex', 
                alignItems: 'center',
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                border: '1px dashed rgba(255, 193, 7, 0.5)'
              }}>
                <LightbulbIcon sx={{ color: 'warning.main', mr: 1.5, fontSize: 24 }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#F57F17', 
                    fontWeight: 600,
                    lineHeight: 1.5
                  }}
                >
                  İpucu: Hedeflerini düzenli olarak gözden geçir ve güncelle. Gerçekçi hedefler motivasyonunu artırır.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Dialog open={topicDialog} onClose={handleCloseTopicDialog} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)' } }}>
        <DialogTitle sx={{ p: 0, position: 'relative' }}>
          <Box sx={{ p: 2, background: selectedSubject ? `linear-gradient(135deg, ${getSubjectColor(selectedSubject)} 0%, ${getLighterColor(getSubjectColor(selectedSubject))} 100%)` : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ mr: 1.5, fontSize: 24 }} />
              <Typography variant="h6" fontWeight={600}>{selectedSubject || 'Ders'} - Konu Detayları</Typography>
            </Box>
            <IconButton color="inherit" size="small" onClick={handleCloseTopicDialog} sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedSubject && analytics[selectedSubject] ? (
            <Box sx={{ p: 3 }}>
              <Paper elevation={0} sx={{ mb: 3, p: 2.5, borderRadius: 2, bgcolor: 'rgba(245, 247, 250, 0.95)', border: '1px solid rgba(0, 0, 0, 0.06)', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="700" color="primary.dark" gutterBottom>Toplam Çalışma Süresi</Typography>
                    <Typography variant="h5" fontWeight="800" color={getSubjectColor(selectedSubject)}>{formatTime(analytics[selectedSubject].totalTime)}</Typography>
                  </Box>
                  {studyTargets[selectedSubject] > 0 && (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle2" fontWeight="600" color="text.secondary" gutterBottom>Hedef</Typography>
                      <Typography variant="h6" fontWeight="700" color="text.secondary">{Math.round(studyTargets[selectedSubject] / 3600)} saat</Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight="600" color="text.secondary">İlerleme</Typography>
                    <Typography variant="caption" fontWeight="700" color={getSubjectColor(selectedSubject)}>{calculateProgress(analytics[selectedSubject].totalTime, selectedSubject)}%</Typography>
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <FormatListBulletedIcon sx={{ mr: 1, color: getSubjectColor(selectedSubject) }} />
                <Typography variant="subtitle1" fontWeight="700" color="text.primary">Konu Bazlı Çalışma Süreleri</Typography>
              </Box>
              {sortedTopics.length > 0 ? (
                <Box sx={{ maxHeight: '300px', overflowY: 'auto', pr: 1 }}>
                  {sortedTopics.map(topic => (
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
                        '&:hover': { boxShadow: '0 3px 8px rgba(0, 0, 0, 0.08)', borderColor: 'rgba(0, 0, 0, 0.12)', transform: 'translateY(-2px)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: getSubjectColor(selectedSubject), mr: 1.5 }} />
                        <Typography fontWeight={600} fontSize="0.95rem">{topic}</Typography>
                      </Box>
                      <Chip
                        label={formatTime(analytics[selectedSubject].topics[topic])}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: `${getSubjectColor(selectedSubject)}15`, color: getSubjectColor(selectedSubject), border: `1px solid ${getSubjectColor(selectedSubject)}30` }}
                      />
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">Bu derse ait konu bazlı analiz bulunamadı.</Typography>
                </Paper>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Lütfen bir ders seçin.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button variant="contained" onClick={handleCloseTopicDialog} sx={{ fontWeight: 600, px: 4, borderRadius: 2 }}>Kapat</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={lowHoursDialog} onClose={() => setLowHoursDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: '#ffb300', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
          <Typography variant="h6" fontWeight={700}>Hedef Süre Uyarısı</Typography>
          <Button color="inherit" size="small" onClick={() => setLowHoursDialog(false)} sx={{ minWidth: 'auto', p: 0.5 }}>
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)', borderRadius: 3, boxShadow: '0 2px 12px rgba(31,38,135,0.10)' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" color="error.main" gutterBottom fontWeight="bold">Üzgünüm :(</Typography>
            </Box>
            <Typography variant="body1" color="text.primary" paragraph>
              Herhangi bir derse 1 ay içinde 10 saatten az çalışma hedefi belirlemeni kabul edemiyorum. Bu sadece seni sıralamada geriye atar.
            </Typography>
            <Typography variant="body1" color="text.primary" paragraph fontWeight="medium">
              Biz tamamen ileriye yönelik akıllıca program yapmalıyız.
            </Typography>
            <Typography variant="body1" color="primary.main" paragraph fontWeight="bold" sx={{ mt: 2 }}>
              Unutma! Ne kadar ileriye gidebileceğini sadece ileriye giderek görebilirsin.
            </Typography>
            <Typography variant="body1" color="success.main" fontWeight="bold">Sana güveniyorum.</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button variant="contained" onClick={() => setLowHoursDialog(false)} sx={{ fontWeight: 600, px: 4, borderRadius: 2 }}>Anladım</Button>
        </DialogActions>
      </Dialog>
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
    </Box>
  );
};

export default Analiz;