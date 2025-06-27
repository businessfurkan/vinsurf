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
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import PublicIcon from '@mui/icons-material/Public';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import WarningIcon from '@mui/icons-material/Warning';
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
  const [examType, setExamType] = useState('TYT');
  const [cardExamType, setCardExamType] = useState('TYT');
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);

  // TYT ve AYT ders listeleri
  const subjectLists = {
    TYT: [
      'Türkçe',
      'Tarih',
      'Coğrafya',
      'Felsefe',
      'Din Kültürü',
      'Temel Matematik',
      'Fizik',
      'Kimya',
      'Biyoloji'
    ],
    AYT: [
      'Matematik',
      'Edebiyat',
      'Fizik',
      'Biyoloji',
      'Kimya',
      'Tarih',
      'Coğrafya',
      'Felsefe',
      'Din Kültürü'
    ]
  };

  const getCurrentSubjects = () => {
    return subjectLists[examType] || [];
  };

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
      // TYT Dersleri
      'Türkçe': '#4285f4',
      'Tarih': '#9c27b0',
      'Coğrafya': '#795548',
      'Felsefe': '#607d8b',
      'Din Kültürü': '#00bcd4',
      'Temel Matematik': '#34a853',
      'Fizik': '#ea4335',
      'Kimya': '#fbbc05',
      'Biyoloji': '#0f9d58',
      
      // AYT Dersleri
      'Matematik': '#34a853',
      'Edebiyat': '#4285f4'
    };
    return subjectColors[subject] || '#1E90FF';
  };

  const getSubjectIcon = (subject) => {
    switch (subject) {
      // TYT Dersleri
      case 'Türkçe':
        return <MenuBookIcon />;
      case 'Tarih':
        return <HistoryEduIcon />;
      case 'Coğrafya':
        return <PublicIcon />;
      case 'Felsefe':
        return <PsychologyIcon />;
      case 'Din Kültürü':
        return <AccountBalanceIcon />;
      case 'Temel Matematik':
        return <FunctionsIcon />;
      case 'Fizik':
        return <ScienceIcon />;
      case 'Kimya':
        return <ScienceIcon sx={{ transform: 'rotate(45deg)' }} />;
      case 'Biyoloji':
        return <BiotechIcon />;
      
      // AYT Dersleri
      case 'Matematik':
        return <FunctionsIcon />;
      case 'Edebiyat':
        return <MenuBookIcon />;
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
    <Box sx={{ minHeight: '100vh', py: 4, px: { xs: 1, sm: 2, md: 4 }, background: '#1a0545' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)' }} />
      {/* Modern Header Section */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' },
        mb: 4, 
        mt: 3,
        gap: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{
            width: 6,
            height: 32,
            background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
            borderRadius: 3,
            mr: 2,
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)'
          }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
              fontFamily: "'Poppins', 'Montserrat', sans-serif"
            }}
          >
            📊 Çalışma Analizleri
          </Typography>
        </Box>
        
        {/* Modern TYT/AYT Toggle */}
        <Box sx={{ 
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '6px',
          border: '1px solid rgba(33, 150, 243, 0.2)',
          boxShadow: '0 8px 32px rgba(33, 150, 243, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
            borderRadius: '20px',
            zIndex: 0
          }
        }}>
          {['TYT', 'AYT'].map((type) => (
            <Button
              key={type}
              variant="text"
              onClick={() => setCardExamType(type)}
              sx={{
                minWidth: '100px',
                py: 1.5,
                px: 3,
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                ...(cardExamType === type ? {
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(33, 150, 243, 0.4), 0 4px 12px rgba(33, 150, 243, 0.2)',
                  transform: 'scale(1.05)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
                    boxShadow: '0 12px 32px rgba(33, 150, 243, 0.5), 0 6px 16px rgba(33, 150, 243, 0.3)',
                    transform: 'scale(1.08)'
                  }
                } : {
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    transform: 'scale(1.02)'
                  }
                })
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ fontSize: '1.2rem' }}>
                  {type === 'TYT' ? '📝' : '🎯'}
                </Box>
                {type}
              </Box>
            </Button>
          ))}
        </Box>
      </Box>

      {/* Dynamic Subject Count Info */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
        p: 2,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(15px)',
        borderRadius: '16px',
        border: '1px solid rgba(33, 150, 243, 0.2)',
        maxWidth: 'fit-content',
        mx: 'auto'
      }}>
        <Typography sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontWeight: 600,
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: cardExamType === 'TYT' ? '#2196F3' : '#1976D2',
            boxShadow: `0 0 8px ${cardExamType === 'TYT' ? '#2196F3' : '#1976D2'}60`
          }} />
          {cardExamType} Dersleri • {subjectLists[cardExamType].length} Ders
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: 'repeat(1, 1fr)', 
          sm: 'repeat(2, 1fr)', 
          md: cardExamType === 'TYT' ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)', 
          lg: cardExamType === 'TYT' ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
          xl: cardExamType === 'TYT' ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)'
        }, 
        gap: 3,
        mb: 6
      }}>
        {subjectLists[cardExamType].map(subject => {
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
                background: '#2d5a70',
                backdropFilter: 'blur(25px)',
                boxShadow: `
                  0 12px 40px rgba(0, 0, 0, 0.15),
                  0 4px 16px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.15),
                  0 6px 20px ${getSubjectColor(subject)}25
                `,
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                padding: 3,
                border: `2px solid ${getSubjectColor(subject)}40`,
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': { 
                  background: '#3a6485',
                  boxShadow: `
                    0 20px 60px rgba(0, 0, 0, 0.2),
                    0 8px 25px rgba(0, 0, 0, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2),
                    0 12px 35px ${getSubjectColor(subject)}40
                  `,
                  border: `2px solid ${getSubjectColor(subject)}60`,
                  transform: 'translateY(-12px) scale(1.03) rotateX(5deg)',
                  '&::after': {
                    opacity: 1,
                    transform: 'translateX(100%) translateY(100%)'
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, 
                    ${getSubjectColor(subject)}15 0%, 
                    transparent 30%, 
                    transparent 70%, 
                    ${getSubjectColor(subject)}10 100%)`,
                  borderRadius: '20px',
                  pointerEvents: 'none',
                  zIndex: 0,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                  opacity: 0,
                  transition: 'all 0.6s ease',
                  transform: 'translateX(-100%) translateY(-100%)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }
              }}
            >
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  background: `linear-gradient(90deg, ${getSubjectColor(subject)} 0%, ${getSubjectColor(subject)}CC 50%, ${getSubjectColor(subject)} 100%)`,
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                  boxShadow: `0 0 15px ${getSubjectColor(subject)}80, 0 2px 8px ${getSubjectColor(subject)}40`,
                }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, position: 'relative', zIndex: 1 }}>
                <Avatar
                  sx={{
                    background: `linear-gradient(135deg, ${getSubjectColor(subject)} 0%, ${getSubjectColor(subject)}AA 50%, ${getSubjectColor(subject)}CC 100%)`,
                    color: '#ffffff',
                    width: 64,
                    height: 64,
                    boxShadow: `
                      0 12px 30px ${getSubjectColor(subject)}50,
                      0 6px 16px rgba(0, 0, 0, 0.2),
                      inset 0 2px 4px rgba(255, 255, 255, 0.25),
                      inset 0 -2px 4px rgba(0, 0, 0, 0.1)
                    `,
                    mr: 2.5,
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    border: `3px solid rgba(255, 255, 255, 0.2)`,
                    backdropFilter: 'blur(15px)',
                    position: 'relative',
                    zIndex: 2,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-2px',
                      left: '-2px',
                      right: '-2px',
                      bottom: '-2px',
                      background: `linear-gradient(135deg, ${getSubjectColor(subject)}60, transparent, ${getSubjectColor(subject)}40)`,
                      borderRadius: '50%',
                      zIndex: -1,
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    },
                    '&:hover': {
                      transform: 'scale(1.15) rotate(8deg) translateY(-2px)',
                      boxShadow: `
                        0 16px 40px ${getSubjectColor(subject)}60,
                        0 8px 20px rgba(0, 0, 0, 0.25),
                        inset 0 2px 6px rgba(255, 255, 255, 0.3),
                        inset 0 -2px 6px rgba(0, 0, 0, 0.15)
                      `,
                      '&::before': {
                        opacity: 1
                      }
                    }
                  }}
                >
                  {getSubjectIcon(subject)}
                </Avatar>
                <Typography 
                  sx={{ 
                    fontSize: 22, 
                    fontWeight: 900, 
                    color: '#ffffff', 
                    fontFamily: `'Poppins','Montserrat','Inter',sans-serif`,
                    lineHeight: 1.1,
                    letterSpacing: '-0.8px',
                    textShadow: `0 3px 12px ${getSubjectColor(subject)}80, 0 2px 4px rgba(0,0,0,0.4)`,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    position: 'relative',
                    zIndex: 2,
                    background: `linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {subject}
                </Typography>
              </Box>
              
              {/* Study time display */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2, 
                mt: 0.5, 
                background: `linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.1) 0%, 
                  rgba(255, 255, 255, 0.05) 100%)`,
                backdropFilter: 'blur(10px)',
                p: 1.5, 
                borderRadius: '16px',
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                position: 'relative',
                zIndex: 1
              }}>
                <AccessTimeIcon sx={{ 
                  fontSize: 20, 
                  color: getSubjectColor(subject), 
                  mr: 1,
                  filter: `drop-shadow(0 1px 2px ${getSubjectColor(subject)}40)`
                }} />
                <Typography 
                  variant="body1" 
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {formatTime(subjectData.totalTime || 0)}
                </Typography>
              </Box>
              
              {/* Progress bar section */}
              <Box sx={{ mt: 'auto', width: '100%', pt: 1, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight={700} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'rgba(255, 255, 255, 0.9)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    {hasTarget ? (
                      <>
                        <FlagIcon sx={{ 
                          mr: 0.5, 
                          fontSize: 18, 
                          color: getSubjectColor(subject),
                          filter: `drop-shadow(0 1px 2px ${getSubjectColor(subject)}40)`
                        }} />
                        İlerleme
                      </>
                    ) : (
                      <>
                        <HelpOutlineIcon sx={{ 
                          mr: 0.5, 
                          fontSize: 18, 
                          color: '#ffa726',
                          filter: 'drop-shadow(0 1px 2px rgba(255, 167, 38, 0.4))'
                        }} />
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
                          background: `linear-gradient(135deg, ${getSubjectColor(subject)} 0%, ${getSubjectColor(subject)}CC 100%)`,
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          height: 24,
                          boxShadow: `0 2px 8px ${getSubjectColor(subject)}40`,
                          border: `1px solid rgba(255, 255, 255, 0.2)`,
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>
                
                <LinearProgress
                  variant="determinate"
                  value={hasTarget ? progress : 0}
                  sx={{
                    height: 12,
                    borderRadius: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
                      animation: hasTarget && progress > 0 ? 'shimmer 2s ease-in-out infinite' : 'none',
                      '@keyframes shimmer': {
                        '0%': { transform: 'translateX(-100%)' },
                        '100%': { transform: 'translateX(100%)' }
                      }
                    },
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, 
                        ${getSubjectColor(subject)} 0%, 
                        ${getSubjectColor(subject)}DD 50%, 
                        ${getSubjectColor(subject)} 100%)`,
                      borderRadius: 8,
                      boxShadow: `
                        0 0 16px ${getSubjectColor(subject)}70,
                        0 2px 8px ${getSubjectColor(subject)}50,
                        inset 0 1px 2px rgba(255, 255, 255, 0.3),
                        inset 0 -1px 2px rgba(0, 0, 0, 0.1)
                      `,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(90deg, 
                          transparent 0%, 
                          rgba(255, 255, 255, 0.25) 50%, 
                          transparent 100%)`,
                        borderRadius: 8,
                        transform: 'translateX(-100%)',
                        animation: hasTarget && progress > 0 ? 'slideProgress 3s ease-in-out infinite' : 'none',
                        '@keyframes slideProgress': {
                          '0%': { transform: 'translateX(-100%)' },
                          '50%': { transform: 'translateX(100%)' },
                          '100%': { transform: 'translateX(100%)' }
                        }
                      }
                    },
                  }}
                />
              </Box>
            </Card>
          );
        })}
      </Box>

      {/* Çalışma Hedefi Belirle Butonu */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        mt: 15,
        mb: 4
      }}>
        <Button
          onClick={() => setTargetDialogOpen(true)}
          sx={{
            p: 2.5,
            borderRadius: '18px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(33, 150, 243, 0.3)',
            boxShadow: '0 12px 40px rgba(33, 150, 243, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            maxWidth: '380px',
            minWidth: '320px',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.02)',
              boxShadow: '0 16px 50px rgba(33, 150, 243, 0.2), 0 6px 20px rgba(0, 0, 0, 0.15)',
              border: '2px solid rgba(33, 150, 243, 0.5)',
              background: 'rgba(255, 255, 255, 0.12)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
              borderRadius: '18px',
              zIndex: 0,
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            position: 'relative',
            zIndex: 1
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: 48, 
              height: 48, 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 50%, #42A5F5 100%)', 
              color: 'white', 
              boxShadow: '0 8px 20px rgba(33, 150, 243, 0.4), 0 3px 8px rgba(33, 150, 243, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)',
                boxShadow: '0 12px 25px rgba(33, 150, 243, 0.5), 0 4px 12px rgba(33, 150, 243, 0.3)',
              }
            }}>
              <FlagIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box sx={{ textAlign: 'left' }}>
              <Typography 
                variant="h6" 
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                  letterSpacing: '-0.3px',
                  fontFamily: "'Poppins', 'Montserrat', sans-serif",
                }}
              >
                🎯 Çalışma Hedefi Belirle
              </Typography>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  letterSpacing: '0.1px',
                }}
              >
                ✨ Hedeflerini ayarla ve başarına odaklan
              </Typography>
            </Box>
          </Box>
        </Button>
      </Box>

      {/* Mevcut Hedefler */}
      {Object.keys(studyTargets).length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography 
            variant="h6" 
            sx={{
              fontWeight: 700, 
              color: '#55b3d9', 
              mb: 2,
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
          <List sx={{ p: 0 }}>
            {Object.entries(studyTargets).map(([subject, seconds]) => {
              const hours = Math.round(seconds / 3600);
              return (
                <Paper
                  key={subject}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    mb: 2,
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${getSubjectColor(subject)}40`,
                    boxShadow: `0 8px 25px ${getSubjectColor(subject)}20, 0 2px 8px rgba(0,0,0,0.1)`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '6px',
                      height: '100%',
                      background: `linear-gradient(180deg, ${getSubjectColor(subject)} 0%, ${getLighterColor(getSubjectColor(subject))} 100%)`,
                      borderRadius: '0 8px 8px 0'
                    },
                    '&:hover': { 
                      transform: 'translateX(8px) translateY(-3px) scale(1.02)', 
                      boxShadow: `0 12px 35px ${getSubjectColor(subject)}30, 0 4px 15px rgba(0,0,0,0.15)`,
                      border: `2px solid ${getSubjectColor(subject)}60`
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        background: `linear-gradient(135deg, ${getSubjectColor(subject)} 0%, ${getLighterColor(getSubjectColor(subject))} 100%)`, 
                        width: 48, 
                        height: 48, 
                        mr: 2.5,
                        boxShadow: `0 6px 20px ${getSubjectColor(subject)}40, 0 2px 8px ${getSubjectColor(subject)}20`,
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(5deg)',
                          boxShadow: `0 8px 25px ${getSubjectColor(subject)}50, 0 4px 12px ${getSubjectColor(subject)}30`
                        }
                      }}
                    >
                      {getSubjectIcon(subject)}
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 800, 
                          color: 'rgba(255, 255, 255, 0.9)',
                          textShadow: `0 1px 3px ${getSubjectColor(subject)}60`,
                          mb: 0.5
                        }}
                      >
                        {subject}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon sx={{ 
                          fontSize: 18, 
                          color: getSubjectColor(subject),
                          filter: `drop-shadow(0 1px 2px ${getSubjectColor(subject)}40)`
                        }} />
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 700, 
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '1rem'
                          }}
                        >
                          ⏰ {hours} saat
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <IconButton 
                    size="medium" 
                    onClick={() => handleDeleteTarget(subject)} 
                    sx={{ 
                      background: 'rgba(244, 67, 54, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(244, 67, 54, 0.3)',
                      color: 'rgba(244, 67, 54, 0.9)', 
                      borderRadius: '12px',
                      width: 44,
                      height: 44,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        color: 'white',
                        border: '1px solid rgba(244, 67, 54, 0.8)',
                        transform: 'scale(1.15) rotate(5deg)',
                        boxShadow: '0 8px 25px rgba(244, 67, 54, 0.4)'
                      } 
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              );
            })}
          </List>
        </Box>
      )}
      
      {/* İpucu */}
      <Box sx={{ 
        mt: 3, 
        display: 'flex', 
        alignItems: 'center',
        p: 1.5,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 193, 7, 0.3)'
      }}>
        <LightbulbIcon sx={{ color: '#ffc107', mr: 1.5, fontSize: 24 }} />
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            fontWeight: 600,
            lineHeight: 1.5
          }}
        >
          İpucu: Hedeflerini düzenli olarak gözden geçir ve güncelle. Gerçekçi hedefler motivasyonunu artırır.
        </Typography>
              </Box>
      
      <Dialog 
        open={topicDialog} 
        onClose={handleCloseTopicDialog} 
        fullWidth 
        maxWidth="md" 
        PaperProps={{ 
          sx: { 
            borderRadius: '24px', 
            overflow: 'hidden', 
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.3),
              0 8px 32px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 30% 20%, ${selectedSubject ? getSubjectColor(selectedSubject) : '#3f51b5'}20 0%, transparent 60%)`,
              pointerEvents: 'none',
              zIndex: 0,
            }
          } 
        }}
      >
        <DialogTitle sx={{ p: 0, position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            p: 3, 
            background: selectedSubject 
              ? `linear-gradient(135deg, ${getSubjectColor(selectedSubject)} 0%, ${getSubjectColor(selectedSubject)}CC 60%, ${getSubjectColor(selectedSubject)}99 100%)` 
              : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 60%, #7986cb 100%)', 
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
              pointerEvents: 'none',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <Box sx={{
                p: 1.5,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                mr: 2,
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              }}>
                <SchoolIcon sx={{ fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
              </Box>
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{
                    fontWeight: 800, 
                    fontSize: '1.5rem',
                    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                    letterSpacing: '-0.5px'
                  }}
                >
                  {selectedSubject || 'Ders'} - Konu Detayları
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    opacity: 0.9,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    mt: 0.5
                  }}
                >
                  Detaylı çalışma analizi
                </Typography>
              </Box>
            </Box>
            <IconButton 
              color="inherit" 
              size="small" 
              onClick={handleCloseTopicDialog} 
              sx={{ 
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                position: 'relative',
                zIndex: 1,
                '&:hover': { 
                  background: 'rgba(255, 255, 255, 0.25)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, position: 'relative', zIndex: 1 }}>
          {selectedSubject && analytics[selectedSubject] ? (
            <Box sx={{ p: 4 }}>
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                borderRadius: '20px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: selectedSubject 
                    ? `linear-gradient(90deg, ${getSubjectColor(selectedSubject)} 0%, ${getSubjectColor(selectedSubject)}80 100%)`
                    : 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)',
                  boxShadow: selectedSubject 
                    ? `0 0 12px ${getSubjectColor(selectedSubject)}60`
                    : '0 0 12px rgba(63, 81, 181, 0.6)',
                }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      sx={{
                        fontWeight: 700, 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        mb: 1,
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      Toplam Çalışma Süresi
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{
                        fontWeight: 800, 
                        color: '#ffffff',
                        textShadow: selectedSubject 
                          ? `0 2px 8px ${getSubjectColor(selectedSubject)}60, 0 1px 2px rgba(0,0,0,0.3)`
                          : '0 2px 8px rgba(63, 81, 181, 0.6), 0 1px 2px rgba(0,0,0,0.3)',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                      }}
                    >
                      {formatTime(analytics[selectedSubject].totalTime)}
                    </Typography>
                  </Box>
                  {studyTargets[selectedSubject] > 0 && (
                    <Box sx={{ 
                      textAlign: 'right',
                      p: 2,
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{
                          fontWeight: 600, 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          mb: 0.5,
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                      >
                        Hedef
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{
                          fontWeight: 700, 
                          color: '#ffffff',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                      >
                        {Math.round(studyTargets[selectedSubject] / 3600)} saat
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{
                        fontWeight: 600, 
                        color: 'rgba(255, 255, 255, 0.8)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      İlerleme
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{
                        fontWeight: 700, 
                        color: '#ffffff',
                        textShadow: selectedSubject 
                          ? `0 1px 2px ${getSubjectColor(selectedSubject)}60`
                          : '0 1px 2px rgba(63, 81, 181, 0.6)'
                      }}
                    >
                      {calculateProgress(analytics[selectedSubject].totalTime, selectedSubject)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(analytics[selectedSubject].totalTime, selectedSubject)}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: selectedSubject 
                          ? `linear-gradient(90deg, ${getSubjectColor(selectedSubject)} 0%, ${getSubjectColor(selectedSubject)}CC 100%)`
                          : 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)',
                        borderRadius: 6,
                        boxShadow: selectedSubject 
                          ? `0 0 16px ${getSubjectColor(selectedSubject)}60, inset 0 1px 0 rgba(255, 255, 255, 0.3)`
                          : '0 0 16px rgba(63, 81, 181, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                          borderRadius: 6,
                        }
                      },
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3, 
                pb: 2, 
                borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  mr: 2
                }}>
                  <FormatListBulletedIcon sx={{ 
                    color: selectedSubject ? getSubjectColor(selectedSubject) : '#3f51b5',
                    filter: selectedSubject 
                      ? `drop-shadow(0 1px 2px ${getSubjectColor(selectedSubject)}40)`
                      : 'drop-shadow(0 1px 2px rgba(63, 81, 181, 0.4))'
                  }} />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{
                    fontWeight: 700, 
                    color: '#ffffff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  Konu Bazlı Çalışma Süreleri
                </Typography>
              </Box>
              {sortedTopics.length > 0 ? (
                <Box sx={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto', 
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: selectedSubject 
                      ? `linear-gradient(180deg, ${getSubjectColor(selectedSubject)} 0%, ${getSubjectColor(selectedSubject)}CC 100%)`
                      : 'linear-gradient(180deg, #3f51b5 0%, #5c6bc0 100%)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: selectedSubject 
                      ? `linear-gradient(180deg, ${getSubjectColor(selectedSubject)}DD 0%, ${getSubjectColor(selectedSubject)}AA 100%)`
                      : 'linear-gradient(180deg, #5c6bc0 0%, #7986cb 100%)',
                  }
                }}>
                  {sortedTopics.map((topic, index) => (
                    <Box
                      key={topic}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2.5,
                        borderRadius: '16px',
                        mb: 2,
                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': { 
                          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-2px) scale(1.01)'
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '4px',
                          height: '100%',
                          background: selectedSubject 
                            ? `linear-gradient(180deg, ${getSubjectColor(selectedSubject)} 0%, ${getSubjectColor(selectedSubject)}80 100%)`
                            : 'linear-gradient(180deg, #3f51b5 0%, #5c6bc0 100%)',
                          boxShadow: selectedSubject 
                            ? `0 0 8px ${getSubjectColor(selectedSubject)}60`
                            : '0 0 8px rgba(63, 81, 181, 0.6)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                        <Box sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          background: selectedSubject 
                            ? `linear-gradient(135deg, ${getSubjectColor(selectedSubject)} 0%, ${getSubjectColor(selectedSubject)}CC 100%)`
                            : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
                          mr: 2,
                          boxShadow: selectedSubject 
                            ? `0 2px 8px ${getSubjectColor(selectedSubject)}40`
                            : '0 2px 8px rgba(63, 81, 181, 0.4)',
                          border: '2px solid rgba(255, 255, 255, 0.3)'
                        }} />
                        <Typography 
                          sx={{
                            fontWeight: 600, 
                            fontSize: '1rem',
                            color: '#ffffff',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }}
                        >
                          {topic}
                        </Typography>
                      </Box>
                      <Chip
                        label={formatTime(analytics[selectedSubject].topics[topic])}
                        size="medium"
                        sx={{ 
                          fontWeight: 700, 
                          background: selectedSubject 
                            ? `linear-gradient(135deg, ${getSubjectColor(selectedSubject)} 0%, ${getSubjectColor(selectedSubject)}CC 100%)`
                            : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: selectedSubject 
                            ? `0 2px 8px ${getSubjectColor(selectedSubject)}40`
                            : '0 2px 8px rgba(63, 81, 181, 0.4)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: selectedSubject 
                              ? `0 4px 12px ${getSubjectColor(selectedSubject)}50`
                              : '0 4px 12px rgba(63, 81, 181, 0.5)',
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ 
                  p: 4, 
                  borderRadius: '20px', 
                  textAlign: 'center',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}>
                  <Typography 
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    Bu derse ait konu bazlı analiz bulunamadı.
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                Lütfen bir ders seçin.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          borderTop: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <Button 
            variant="contained" 
            onClick={handleCloseTopicDialog} 
            sx={{ 
              fontWeight: 700, 
              px: 6, 
              py: 1.5,
              borderRadius: '16px',
              fontSize: '1rem',
              background: selectedSubject 
                ? `linear-gradient(135deg, ${getSubjectColor(selectedSubject)} 0%, ${getSubjectColor(selectedSubject)}CC 100%)`
                : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: selectedSubject 
                ? `0 4px 16px ${getSubjectColor(selectedSubject)}40`
                : '0 4px 16px rgba(63, 81, 181, 0.4)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              '&:hover': {
                background: selectedSubject 
                  ? `linear-gradient(135deg, ${getSubjectColor(selectedSubject)}DD 0%, ${getSubjectColor(selectedSubject)}AA 100%)`
                  : 'linear-gradient(135deg, #5c6bc0 0%, #7986cb 100%)',
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: selectedSubject 
                  ? `0 8px 24px ${getSubjectColor(selectedSubject)}50`
                  : '0 8px 24px rgba(63, 81, 181, 0.5)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog 
        open={lowHoursDialog} 
        onClose={() => setLowHoursDialog(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ 
          sx: { 
            borderRadius: '24px', 
            overflow: 'hidden', 
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.3),
              0 8px 32px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 20%, #ff930020 0%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 0,
            }
          } 
        }}
      >
        <DialogTitle sx={{ p: 0, position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, #ff9300 0%, #ffb300 60%, #ffc107 100%)', 
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
              pointerEvents: 'none',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <Box sx={{
                p: 1.5,
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                mr: 2,
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              }}>
                <WarningIcon sx={{ fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
              </Box>
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{
                    fontWeight: 800, 
                    fontSize: '1.5rem',
                    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                    letterSpacing: '-0.5px'
                  }}
                >
                  Hedef Süre Uyarısı
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    opacity: 0.9,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    mt: 0.5
                  }}
                >
                  Çalışma hedefi kontrolü
                </Typography>
              </Box>
            </Box>
            <IconButton 
              color="inherit" 
              size="small" 
              onClick={() => setLowHoursDialog(false)} 
              sx={{ 
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                position: 'relative',
                zIndex: 1,
                '&:hover': { 
                  background: 'rgba(255, 255, 255, 0.25)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            p: 4,
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            m: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #ff9300 0%, #ffb300 100%)',
              boxShadow: '0 0 12px rgba(255, 147, 0, 0.6)',
            }
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                mb: 3,
                p: 2,
                borderRadius: '16px',
                background: 'rgba(255, 147, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 147, 0, 0.2)',
                display: 'inline-block'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{
                    color: '#ff9300',
                    fontWeight: 800,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    filter: 'drop-shadow(0 1px 2px rgba(255, 147, 0, 0.3))'
                  }}
                >
                  Üzgünüm :(
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                sx={{
                  color: '#ffffff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  mb: 2,
                  lineHeight: 1.6,
                  fontSize: '1.1rem'
                }}
              >
                Herhangi bir derse 1 ay içinde 10 saatten az çalışma hedefi belirlemeni kabul edemiyorum. Bu sadece seni sıralamada geriye atar.
              </Typography>
              <Typography 
                variant="body1" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  mb: 3,
                  fontWeight: 600,
                  lineHeight: 1.6,
                  fontSize: '1.1rem'
                }}
              >
                Biz tamamen ileriye yönelik akıllıca program yapmalıyız.
              </Typography>
              <Box sx={{
                p: 3,
                borderRadius: '16px',
                background: 'linear-gradient(145deg, rgba(63, 81, 181, 0.15) 0%, rgba(63, 81, 181, 0.08) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(63, 81, 181, 0.2)',
                mb: 3,
                boxShadow: '0 4px 16px rgba(63, 81, 181, 0.1)'
              }}>
                <Typography 
                  variant="body1" 
                  sx={{
                    color: '#3f51b5',
                    fontWeight: 800,
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    filter: 'drop-shadow(0 1px 2px rgba(63, 81, 181, 0.3))',
                    fontSize: '1.2rem',
                    lineHeight: 1.5
                  }}
                >
                  Unutma! Ne kadar ileriye gidebileceğini sadece ileriye giderek görebilirsin.
                </Typography>
              </Box>
              <Box sx={{
                p: 2,
                borderRadius: '12px',
                background: 'linear-gradient(145deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.08) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                display: 'inline-block'
              }}>
                <Typography 
                  variant="body1" 
                  sx={{
                    color: '#4caf50',
                    fontWeight: 800,
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    filter: 'drop-shadow(0 1px 2px rgba(76, 175, 80, 0.3))',
                    fontSize: '1.1rem'
                  }}
                >
                  Sana güveniyorum.
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          borderTop: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <Button 
            variant="contained" 
            onClick={() => setLowHoursDialog(false)} 
            sx={{ 
              fontWeight: 700, 
              px: 6, 
              py: 1.5,
              borderRadius: '16px',
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #ff9300 0%, #ffb300 100%)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(255, 147, 0, 0.4)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ffb300 0%, #ffc107 100%)',
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: '0 8px 24px rgba(255, 147, 0, 0.5)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            Anladım
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hedef Belirleme Dialog */}
      <Dialog
        open={targetDialogOpen}
        onClose={() => setTargetDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(27, 41, 61, 0.95)',
            backdropFilter: 'blur(25px)',
            borderRadius: '24px',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(33, 150, 243, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0.1) 100%)',
          borderBottom: '1px solid rgba(33, 150, 243, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: 48, 
                height: 48, 
                borderRadius: '14px', 
                background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 50%, #42A5F5 100%)', 
                color: 'white', 
                mr: 2,
                boxShadow: '0 8px 20px rgba(33, 150, 243, 0.4)'
              }}>
                <FlagIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff' }}>
                  🎯 Çalışma Hedefi Belirle
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  ✨ Her ders için hedeflediğin çalışma sürelerini ayarla
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setTargetDialogOpen(false)} sx={{ color: '#ffffff' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Divider sx={{ 
            my: 2, 
            borderColor: 'rgba(33, 150, 243, 0.2)',
            '&::before, &::after': {
              borderColor: 'rgba(33, 150, 243, 0.2)'
            }
          }} />
          <Box sx={{ px: 2.5, pb: 2.5 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{
                      fontWeight: 700, 
                      color: '#55b3d9', 
                      mb: 2,
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
                    Sınav Türü & Ders Seç
                  </Typography>
                  
                  {/* TYT/AYT Seçim Butonları */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1.5, 
                    mb: 2,
                    p: 1,
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    border: '1px solid rgba(33, 150, 243, 0.2)'
                  }}>
                    {['TYT', 'AYT'].map((type) => (
                      <Button
                        key={type}
                        variant={examType === type ? 'contained' : 'outlined'}
                        onClick={() => {
                          setExamType(type);
                          setTargetSubject('');
                        }}
                        sx={{
                          flex: 1,
                          py: 1.5,
                          px: 3,
                          borderRadius: '12px',
                          fontWeight: 700,
                          fontSize: '1rem',
                          textTransform: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          ...(examType === type ? {
                            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                            color: '#ffffff',
                            boxShadow: '0 8px 25px rgba(33, 150, 243, 0.4), 0 4px 12px rgba(33, 150, 243, 0.2)',
                            border: '2px solid #2196F3',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
                              boxShadow: '0 12px 35px rgba(33, 150, 243, 0.5), 0 6px 16px rgba(33, 150, 243, 0.3)',
                              transform: 'translateY(-2px) scale(1.02)'
                            }
                          } : {
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            border: '2px solid rgba(33, 150, 243, 0.3)',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: 'rgba(255, 255, 255, 0.9)',
                              border: '2px solid rgba(33, 150, 243, 0.5)',
                              transform: 'translateY(-1px)'
                            }
                          })
                        }}
                      >
                        {type === 'TYT' ? '📝 TYT' : '🎯 AYT'}
                      </Button>
                    ))}
                                     </Box>
                   
                   {/* Ders Seçimi Dropdown */}
                   <FormControl fullWidth>
                     <Select
                       value={targetSubject}
                       onChange={(e) => setTargetSubject(e.target.value)}
                       displayEmpty
                       sx={{
                         borderRadius: '16px',
                         background: 'rgba(255, 255, 255, 0.12)',
                         backdropFilter: 'blur(10px)',
                         border: '1px solid rgba(33, 150, 243, 0.3)',
                         boxShadow: '0 8px 32px rgba(33, 150, 243, 0.15)',
                         height: 64,
                         transition: 'all 0.3s ease',
                         '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                         '&:hover': { 
                           background: 'rgba(255, 255, 255, 0.18)',
                           border: '1px solid rgba(33, 150, 243, 0.5)',
                           transform: 'translateY(-2px)',
                           boxShadow: '0 12px 40px rgba(33, 150, 243, 0.2)'
                         },
                         '&.Mui-focused': { 
                           background: 'rgba(255, 255, 255, 0.2)',
                           border: '2px solid rgba(33, 150, 243, 0.7)',
                           boxShadow: '0 16px 50px rgba(33, 150, 243, 0.25)'
                         },
                         '& .MuiSelect-select': { 
                           display: 'flex', 
                           alignItems: 'center',
                           fontWeight: 700,
                           fontSize: '1.1rem',
                           py: 2,
                           color: 'rgba(255, 255, 255, 0.9)',
                           textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                         }
                       }}
                       MenuProps={{ 
                         PaperProps: { 
                           sx: { 
                             borderRadius: '20px', 
                             background: 'rgba(255, 255, 255, 0.15)',
                             backdropFilter: 'blur(20px)',
                             border: '1px solid rgba(33, 150, 243, 0.3)',
                             boxShadow: '0 20px 60px rgba(0,0,0,0.2)', 
                             mt: 1,
                             maxHeight: 400,
                             overflow: 'auto'
                           } 
                         } 
                       }}
                     >
                       <MenuItem value="" disabled>
                         <Box sx={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           color: 'rgba(255, 255, 255, 0.6)',
                           background: 'rgba(33, 150, 243, 0.1)',
                           borderRadius: '12px',
                           p: 1.5,
                           m: 1
                         }}>
                           <SubjectIcon sx={{ mr: 2, fontSize: 24, opacity: 0.8 }} />
                           <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
                             📚 Lütfen bir {examType} dersi seçin
                           </Typography>
                         </Box>
                       </MenuItem>
                       {getCurrentSubjects().map(subject => (
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
                 
                 {/* Hedef Süre Girişi */}
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
                       if (!isNaN(value) && value >= 1 && value <= 400) setTargetHours(value);
                       else if (!isNaN(value) && value > 400) setTargetHours(400);
                       else if (!isNaN(value) && value < 1) setTargetHours(1);
                     }}
                     inputProps={{ min: 1, max: 400, step: 1 }}
                     fullWidth
                     variant="outlined"
                     placeholder="Hedef saat (1-400)"
                     sx={{
                       mb: 3,
                       '& .MuiOutlinedInput-root': {
                         borderRadius: '16px',
                         background: 'rgba(255, 255, 255, 0.12)',
                         backdropFilter: 'blur(10px)',
                         border: `2px solid ${targetSubject ? getSubjectColor(targetSubject) + '60' : 'rgba(33, 150, 243, 0.3)'}`,
                         boxShadow: `0 8px 32px ${targetSubject ? getSubjectColor(targetSubject) + '20' : 'rgba(33, 150, 243, 0.15)'}`,
                         height: 80,
                         transition: 'all 0.3s ease',
                         '& fieldset': { border: 'none' },
                         '&:hover': { 
                           background: 'rgba(255, 255, 255, 0.18)',
                           border: `2px solid ${targetSubject ? getSubjectColor(targetSubject) : 'rgba(33, 150, 243, 0.5)'}`,
                           transform: 'translateY(-3px)',
                           boxShadow: `0 12px 40px ${targetSubject ? getSubjectColor(targetSubject) + '30' : 'rgba(33, 150, 243, 0.2)'}`
                         },
                         '&.Mui-focused': { 
                           background: 'rgba(255, 255, 255, 0.2)',
                           border: `3px solid ${targetSubject ? getSubjectColor(targetSubject) : 'rgba(33, 150, 243, 0.7)'}`,
                           boxShadow: `0 16px 50px ${targetSubject ? getSubjectColor(targetSubject) + '40' : 'rgba(33, 150, 243, 0.25)'}`
                         },
                       },
                       '& .MuiInputBase-input': { 
                         textAlign: 'center', 
                         fontSize: '2rem', 
                         fontWeight: 900, 
                         py: 2,
                         color: 'rgba(255, 255, 255, 0.9)',
                         textShadow: `0 2px 4px ${targetSubject ? getSubjectColor(targetSubject) + '60' : 'rgba(33, 150, 243, 0.4)'}`,
                         '&::placeholder': {
                           color: 'rgba(255, 255, 255, 0.5)',
                           fontSize: '1.2rem',
                           fontWeight: 600
                         }
                       }
                     }}
                   />
                   
                   {/* Min/Max Bilgi Chipleri */}
                   <Box sx={{ 
                     display: 'flex', 
                     justifyContent: 'space-between', 
                     alignItems: 'center', 
                     gap: 2,
                     mb: 4,
                     mt: 2
                   }}>
                     <Chip 
                       label="⚡ Min: 1 saat" 
                       size="medium" 
                       sx={{ 
                         background: 'rgba(76, 175, 80, 0.15)', 
                         backdropFilter: 'blur(10px)',
                         color: 'rgba(255, 255, 255, 0.9)',
                         fontWeight: 700,
                         fontSize: '0.9rem',
                         border: '1px solid rgba(76, 175, 80, 0.4)',
                         borderRadius: '12px',
                         px: 2,
                         py: 1,
                         boxShadow: '0 4px 16px rgba(76, 175, 80, 0.2)',
                         transition: 'all 0.3s ease',
                         '&:hover': {
                           transform: 'scale(1.05)',
                           boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)'
                         }
                       }}
                     />
                     <Chip 
                       label="🚀 Max: 400 saat" 
                       size="medium" 
                       sx={{ 
                         background: 'rgba(255, 152, 0, 0.15)', 
                         backdropFilter: 'blur(10px)',
                         color: 'rgba(255, 255, 255, 0.9)',
                         fontWeight: 700,
                         fontSize: '0.9rem',
                         border: '1px solid rgba(255, 152, 0, 0.4)',
                         borderRadius: '12px',
                         px: 2,
                         py: 1,
                         boxShadow: '0 4px 16px rgba(255, 152, 0, 0.2)',
                         transition: 'all 0.3s ease',
                         '&:hover': {
                           transform: 'scale(1.05)',
                           boxShadow: '0 6px 20px rgba(255, 152, 0, 0.3)'
                         }
                       }}
                     />
                   </Box>
                 </Box>
               </Grid>
               
               {/* Kaydet Butonu */}
               <Grid item xs={12}>
                 <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                   <Button
                     variant="contained"
                     startIcon={<SaveIcon sx={{ fontSize: 26 }} />}
                     onClick={() => {
                       saveStudyTarget(targetSubject, targetHours);
                       setTargetDialogOpen(false);
                     }}
                     disabled={!targetSubject}
                     sx={{
                       py: 2.5,
                       px: 6,
                       borderRadius: '20px',
                       background: targetSubject ? 
                         `linear-gradient(135deg, ${getSubjectColor(targetSubject)} 0%, ${getLighterColor(getSubjectColor(targetSubject))} 50%, ${getSubjectColor(targetSubject)} 100%)` : 
                         'linear-gradient(135deg, #2196F3 0%, #42A5F5 50%, #1976D2 100%)',
                       boxShadow: targetSubject ? 
                         `0 12px 30px ${getSubjectColor(targetSubject)}40, 0 4px 15px ${getSubjectColor(targetSubject)}20` : 
                         '0 12px 30px rgba(33, 150, 243, 0.4), 0 4px 15px rgba(33, 150, 243, 0.2)',
                       transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                       fontSize: '1.3rem',
                       fontWeight: 900,
                       letterSpacing: '0.5px',
                       textTransform: 'none',
                       minWidth: '280px',
                       '&:hover': { 
                         boxShadow: targetSubject ? 
                           `0 16px 40px ${getSubjectColor(targetSubject)}50, 0 8px 25px ${getSubjectColor(targetSubject)}30` : 
                           '0 16px 40px rgba(33, 150, 243, 0.5), 0 8px 25px rgba(33, 150, 243, 0.3)', 
                         transform: 'translateY(-5px) scale(1.02)'
                       },
                       '&:disabled': {
                         background: 'rgba(255, 255, 255, 0.1)',
                         color: 'rgba(255, 255, 255, 0.5)',
                         boxShadow: 'none'
                       }
                     }}
                   >
                     🎯 Hedefi Kaydet
                   </Button>
                 </Box>
               </Grid>
             </Grid>
           </Box>
         </DialogContent>
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
