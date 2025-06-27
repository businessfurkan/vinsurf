import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { format } from 'date-fns';
import { tr as trLocale } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

// Import ModernStepper component
import ModernStepper from '../components/ModernStepper';

// Import CSS
import '../styles/tyt-ayt-modern.css';

// Material UI components
import {
  Container, Box, Typography, Button, TextField, Grid, Paper,
  IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Snackbar, Alert
} from '@mui/material';

// Recharts components
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Material UI icons
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ViewList as ViewListIcon,
  BarChart as BarChartIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  CalendarToday as CalendarTodayIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';

// Date picker components
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Define TYT ve AYT subjects
const tytSubjects = [
  'TYT Türkçe',
  'TYT Sosyal',
  'TYT Matematik',
  'TYT Fen Bilimleri'
];

const aytSubjects = [
  'AYT Matematik',
  'AYT Fizik',
  'AYT Kimya',
  'AYT Biyoloji',
  'AYT Edebiyat',
  'AYT Tarih',
  'AYT Coğrafya'
];

// Steps are defined below

// Styled components

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'var(--transition)',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--primary-color)'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--primary-color)',
      borderWidth: '2px'
    }
  },
  '& .MuiInputLabel-outlined.Mui-focused': {
    color: 'var(--primary-color)'
  }
}));



// Steps for the form
const steps = [
  '1. Deneme Adı',
  '2. Tarih',
  '3. Sınav Türü',
  '4. Ders Bilgileri',
  '5. Özet'
];

const TytAytNetTakibi = () => {
  
  // Get user from firebase auth
  const [user] = useAuthState(auth);
  
  // State for the multi-step form
  const [activeStep, setActiveStep] = useState(0);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState(new Date());
  const [examType, setExamType] = useState('TYT');
  const [subjectData, setSubjectData] = useState({});
  const [currentSubject, setCurrentSubject] = useState('');
  const [correctCount, setCorrectCount] = useState('');
  const [incorrectCount, setIncorrectCount] = useState('');
  const [emptyCount, setEmptyCount] = useState('');
  const [errors, setErrors] = useState({});
  
  // State for the application
  const [netRecords, setNetRecords] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0); // 0: form, 1: records, 2: statistics
  const [selectedExamType, setSelectedExamType] = useState('TYT');
  
  // Bildirim sistemi kullanımı
  
  // Helper functions
  const calculateNet = (correct, incorrect) => {
    const correctNum = parseFloat(correct) || 0;
    const incorrectNum = parseFloat(incorrect) || 0;
    return (correctNum - (incorrectNum * 0.25)).toFixed(2);
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  // Show notification
  const showNotification = useCallback((message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);
  
  // Handle next step in the form
  const handleNext = () => {
    let isValid = true;
    const newErrors = {};
    
    // Validate current step
    if (activeStep === 0) {
      if (!examName.trim()) {
        newErrors.examName = 'Deneme adı gereklidir';
        isValid = false;
      }
    } else if (activeStep === 1) {
      // Date validation is handled by the DatePicker component
    } else if (activeStep === 2) {
      // Exam type validation is handled by the Select component
    } else if (activeStep === 3) {
      // If we're trying to proceed to next step (not adding a subject), check if at least one subject is added
      if (!currentSubject || (!correctCount && !incorrectCount && !emptyCount)) {
        if (Object.keys(subjectData).length === 0) {
          setNotification({
            open: true,
            message: 'En az bir ders eklemelisiniz',
            severity: 'error'
          });
          isValid = false;
        }
      }
    }
    
    setErrors(newErrors);
    
    if (!isValid) {
      return;
    }
    
    // If we're on the subject selection step and a subject is selected, handle adding the subject
    if (activeStep === 3 && currentSubject && (correctCount || incorrectCount || emptyCount)) {
      // Save current subject data
      const correct = correctCount || '0';
      const incorrect = incorrectCount || '0';
      const empty = emptyCount || '0';
      const net = calculateNet(correct, incorrect);
      
      setSubjectData(prev => ({
        ...prev,
        [currentSubject]: {
          correctCount: correct,
          incorrectCount: incorrect,
          emptyCount: empty,
          net
        }
      }));
      
      // Clear form for next subject
      setCurrentSubject('');
      setCorrectCount('');
      setIncorrectCount('');
      setEmptyCount('');
      
      // Show success notification
      setNotification({
        open: true,
        message: `${currentSubject} dersi başarıyla eklendi`,
        severity: 'success'
      });
      
      return;
    }
    
    // If we're on the last step, submit the form
    if (activeStep === steps.length - 1) {
      // Prepare data for submission
      const examData = {
        userId: user.uid,
        examName,
        examDate,
        examType,
        subjects: subjectData,
        createdAt: serverTimestamp()
      };
      
      // Add to Firestore
      addDoc(collection(db, 'netRecords'), examData)
        .then(() => {
          // Success
          setNotification({
            open: true,
            message: 'Deneme sonuçları başarıyla kaydedildi',
            severity: 'success'
          });
          
          // Reset form
          setExamName('');
          setExamDate(new Date());
          setExamType('TYT');
          setSubjectData({});
          setCurrentSubject('');
          setCorrectCount('');
          setIncorrectCount('');
          setEmptyCount('');
          
          // Fetch updated records
          fetchRecords();
          
          // Move to next step (completion)
          setActiveStep(activeStep + 1);
        })
        .catch((error) => {
          console.error('Error saving record:', error);
          setNotification({
            open: true,
            message: 'Kaydetme sırasında bir hata oluştu',
            severity: 'error'
          });
        });
    } else {
      // Move to the next step
      setActiveStep(activeStep + 1);
    }
  };
  
  // Handle back step in the form
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Handle selecting a subject
  const handleSubjectSelect = (subject) => {
    setCurrentSubject(subject);
    
    // If we already have data for this subject, populate the form
    if (subjectData[subject]) {
      const data = subjectData[subject];
      setCorrectCount(data.correctCount.toString());
      setIncorrectCount(data.incorrectCount.toString());
      setEmptyCount(data.emptyCount.toString());
    } else {
      // Otherwise clear the form
      setCorrectCount('');
      setIncorrectCount('');
      setEmptyCount('');
    }
  };
  
  // Tavsiye gönderme fonksiyonu
  const sendRecommendation = useCallback((subject, decreasePercentage) => {
    // Ders adından konu tahmini yap
    let topic = '';
    
    if (subject.includes('Matematik')) {
      topic = 'fonksiyonlar';
    } else if (subject.includes('Fizik')) {
      topic = 'mekanik';
    } else if (subject.includes('Kimya')) {
      topic = 'organik kimya';
    } else if (subject.includes('Biyoloji')) {
      topic = 'hücre';
    } else if (subject.includes('Türkçe')) {
      topic = 'paragraf';
    } else if (subject.includes('Edebiyat')) {
      topic = 'edebi akımlar';
    } else if (subject.includes('Sosyal')) {
      topic = 'tarih';
    } else if (subject.includes('Tarih')) {
      topic = 'osmanlı tarihi';
    }
    
    // Mesajı oluştur
    const severity = decreasePercentage > 30 ? 'error' : 'warning';
    const message = `${subject} dersinde son denemelerinizde %${decreasePercentage.toFixed(1)} oranında düşüş tespit edildi. ${topic.charAt(0).toUpperCase() + topic.slice(1)} konusuna özellikle çalışmanızı öneririz.`;
    
    // Bildirim gönder
    setNotification({
      open: true,
      message: message,
      severity: severity
    });
    
  }, []);
  
  // Yapay zeka tavsiye sistemi
  const analyzePerformanceAndSendRecommendations = useCallback((records) => {
    if (!records || records.length < 3) return; // En az 3 deneme olmalı
    
    try {
      // TYT ve AYT derslerini birleştir
      const allSubjects = [...tytSubjects, ...aytSubjects];
      
      // Her ders için son 3 denemeyi analiz et
      allSubjects.forEach(subject => {
        // Bu derse ait son 3 denemeyi bul
        const subjectRecords = records
          .filter(record => record.subjects && record.subjects[subject])
          .slice(0, 3);
        
        // Eğer en az 3 deneme varsa analiz et
        if (subjectRecords.length === 3) {
          // Son deneme
          const lastExam = subjectRecords[0];
          // Önceki deneme
          const previousExam = subjectRecords[1];
          // Daha önceki deneme
          const olderExam = subjectRecords[2];
          
          // Son denemenin neti
          const lastNet = parseFloat(lastExam.subjects[subject].net);
          // Önceki denemenin neti
          const previousNet = parseFloat(previousExam.subjects[subject].net);
          // Daha önceki denemenin neti
          const olderNet = parseFloat(olderExam.subjects[subject].net);
          
          // Net ortalaması
          const avgNet = (previousNet + olderNet) / 2;
          
          // Düşüş yüzdesi
          const decreasePercentage = ((avgNet - lastNet) / avgNet) * 100;
          
          // Eğer düşüş %10'dan fazlaysa tavsiye gönder
          if (decreasePercentage > 10) {
            sendRecommendation(subject, decreasePercentage);
          }
        }
      });
    } catch (error) {
      console.error('Performans analizi sırasında hata:', error);
    }
  }, [sendRecommendation]);

  // Fetch records from Firestore
  const fetchRecords = useCallback(async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'netRecords'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const records = [];
      
      querySnapshot.forEach((doc) => {
        records.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setNetRecords(records);
      
      // Yapay zeka tavsiye sistemini çalıştır
      if (records.length > 0) {
        analyzePerformanceAndSendRecommendations(records);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      showNotification('Kayıtlar yüklenirken bir hata oluştu', 'error');
    }
  }, [user, analyzePerformanceAndSendRecommendations, showNotification]);
  
  // Delete a record
  const handleDelete = async (id) => {
    try {
      // setLoading kaldırıldı
      
      await deleteDoc(doc(db, 'netRecords', id));
      
      // Update local state
      setNetRecords(netRecords.filter(record => record.id !== id));
      
      showNotification('Kayıt başarıyla silindi', 'success');
    } catch (error) {
      console.error('Error deleting record:', error);
      showNotification('Silme işlemi sırasında bir hata oluştu', 'error');
    }
  };

  // Fetch records on component mount
  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user, fetchRecords]);

  // Render step content based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Deneme Adı
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            {/* Header Section */}
            <Box sx={{
              textAlign: 'center',
              mb: 5,
              position: 'relative'
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-3px',
                  left: '-3px',
                  right: '-3px',
                  bottom: '-3px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  opacity: 0.3,
                  filter: 'blur(8px)',
                  zIndex: -1
                }
              }}>
                <AssignmentIcon sx={{ 
                  color: '#ffffff', 
                  fontSize: '2.5rem',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }} />
              </Box>
              
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                color: '#ffffff',
                mb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}>
                Deneme Adı
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                maxWidth: '500px',
                mx: 'auto'
              }}>
                Denemenize tanımlayıcı bir isim verin. Bu isim daha sonra listeleme ve analiz ekranlarında görünecektir.
              </Typography>
            </Box>

            {/* Input Section */}
            <Box sx={{
              width: '100%',
              maxWidth: '500px',
              position: 'relative'
            }}>
              <Box sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                p: 4,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <StyledTextField
                  fullWidth
                  label="Deneme Adı"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  error={!!errors.examName}
                  helperText={errors.examName}
                  placeholder="Örn: TYT Deneme 1, Matematik Özel Deneme"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      transition: 'all 0.3s ease',
                      '& fieldset': {
                        border: 'none'
                      },
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      },
                      '&.Mui-focused': {
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 600,
                      '&.Mui-focused': {
                        color: '#667eea'
                      }
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ff6b6b',
                      fontWeight: 500,
                      marginTop: '12px'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}>
                        <AssignmentIcon sx={{ 
                          color: '#ffffff', 
                          fontSize: '1.5rem'
                        }} />
                      </Box>
                    ),
                  }}
                />
                
                {/* Öneriler */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    mb: 2,
                    fontWeight: 600
                  }}>
                    Öneri İsimleri:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      'Hız ve Renk',
                      '3D Yayınları',
                      'Karekök Yayınları',
                      'Apotemi Yayınları',
                      'Benim Hocam Yayınları',
                      'Yediiklim Yayınları',
                      'Kampüs Yayınları',
                      'Limit Yayınları',
                      'ÜçDörtBeş (345) Yayınları',
                      'Endemik Yayınları',
                      'Bilgi Sarmal Yayınları',
                      'Aydın Yayınları',
                      'Tonguç Kampüs Yayınları',
                      'Kafa Dengi Yayınları',
                      'Okyanus Yayınları'
                    ].map((suggestion, index) => (
                      <Button
                        key={index}
                        size="small"
                        onClick={() => setExamName(suggestion)}
                        sx={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '12px',
                          px: 3,
                          py: 1,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          transition: 'all 0.3s ease',
                          justifyContent: 'flex-start',
                          width: '100%',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                            transform: 'translateX(5px)'
                          }
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      case 1: // Tarih
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            {/* Header Section */}
            <Box sx={{
              textAlign: 'center',
              mb: 5,
              position: 'relative'
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 10px 30px rgba(255, 154, 158, 0.4)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-3px',
                  left: '-3px',
                  right: '-3px',
                  bottom: '-3px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
                  opacity: 0.3,
                  filter: 'blur(8px)',
                  zIndex: -1
                }
              }}>
                <CalendarTodayIcon sx={{ 
                  color: '#ffffff', 
                  fontSize: '2.5rem',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }} />
              </Box>
              
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                color: '#ffffff',
                mb: 1,
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}>
                Deneme Tarihi
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                maxWidth: '500px',
                mx: 'auto'
              }}>
                Denemenizi hangi tarihte yaptığınızı belirtin. Bu bilgi istatistikler ve gelişim takibi için önemlidir.
              </Typography>
            </Box>

            {/* Date Picker Section */}
            <Box sx={{
              width: '100%',
              maxWidth: '500px',
              position: 'relative'
            }}>
              <Box sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                p: 4,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
                  <DatePicker
                    label="Deneme Tarihi"
                    value={examDate}
                    onChange={(newValue) => setExamDate(newValue)}
                    renderInput={(params) => 
                      <StyledTextField 
                        {...params} 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            transition: 'all 0.3s ease',
                            '& fieldset': {
                              border: 'none'
                            },
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.15)',
                              borderColor: 'rgba(255, 255, 255, 0.3)'
                            },
                            '&.Mui-focused': {
                              background: 'rgba(255, 255, 255, 0.2)',
                              borderColor: '#ff9a9e',
                              boxShadow: '0 0 0 3px rgba(255, 154, 158, 0.2)'
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontWeight: 600,
                            '&.Mui-focused': {
                              color: '#ff9a9e'
                            }
                          },
                          '& .MuiInputAdornment-root .MuiIconButton-root': {
                            color: 'rgba(255, 255, 255, 0.8)',
                            backgroundColor: 'rgba(255, 154, 158, 0.2)',
                            borderRadius: '8px',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 154, 158, 0.3)',
                              color: '#ffffff'
                            }
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <Box sx={{
                              width: 50,
                              height: 50,
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2,
                              boxShadow: '0 4px 12px rgba(255, 154, 158, 0.3)'
                            }}>
                              <CalendarTodayIcon sx={{ 
                                color: '#ffffff', 
                                fontSize: '1.5rem'
                              }} />
                            </Box>
                          ),
                        }}
                      />
                    }
                  />
                </LocalizationProvider>
                
                {/* Hızlı Tarih Seçenekleri */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    mb: 2,
                    fontWeight: 600
                  }}>
                    Hızlı Seçim:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {[
                      { label: 'Bugün', value: new Date() },
                      { label: 'Dün', value: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                      { label: '1 Hafta Önce', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                      { label: '1 Ay Önce', value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                    ].map((option, index) => (
                      <Button
                        key={index}
                        size="small"
                        onClick={() => setExamDate(option.value)}
                        sx={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '20px',
                          px: 2,
                          py: 0.5,
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255, 154, 158, 0.2)',
                            color: '#ffffff',
                            borderColor: 'rgba(255, 154, 158, 0.4)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </Box>
                </Box>

                {/* Seçilen Tarih Önizlemesi */}
                {examDate && (
                  <Box sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: '12px',
                    background: 'rgba(255, 154, 158, 0.1)',
                    border: '1px solid rgba(255, 154, 158, 0.3)',
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      mb: 1
                    }}>
                      Seçilen Tarih:
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: '#ff9a9e',
                      fontWeight: 700
                    }}>
                      {format(examDate, 'dd MMMM yyyy EEEE', { locale: trLocale })}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        );
      case 2: // Sınav Türü
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            {/* Header Section */}
            <Box sx={{
              textAlign: 'center',
              mb: 5,
              position: 'relative'
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 10px 30px rgba(79, 172, 254, 0.4)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-3px',
                  left: '-3px',
                  right: '-3px',
                  bottom: '-3px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                  opacity: 0.3,
                  filter: 'blur(8px)',
                  zIndex: -1
                }
              }}>
                <AssignmentIcon sx={{ 
                  color: '#ffffff', 
                  fontSize: '2.5rem',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }} />
              </Box>
              
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                color: '#ffffff',
                mb: 1,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}>
                Sınav Türü
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                maxWidth: '500px',
                mx: 'auto'
              }}>
                Denemenizin türünü seçin. TYT temel yeterlilik, AYT ise alan yeterlilik testini temsil eder.
              </Typography>
            </Box>

            {/* Exam Type Selection */}
            <Box sx={{
              width: '100%',
              maxWidth: '600px',
              display: 'flex',
              gap: 3,
              flexDirection: { xs: 'column', md: 'row' }
            }}>
              {/* TYT Card */}
              <Box
                onClick={() => setExamType('TYT')}
                sx={{
                  flex: 1,
                  cursor: 'pointer',
                  position: 'relative',
                  borderRadius: '24px',
                  padding: 4,
                  background: examType === 'TYT' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: examType === 'TYT' 
                    ? '2px solid rgba(102, 126, 234, 0.8)'
                    : '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: examType === 'TYT' 
                    ? '0 20px 60px rgba(102, 126, 234, 0.4), 0 8px 25px rgba(102, 126, 234, 0.2)'
                    : '0 10px 30px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: examType === 'TYT' ? 'translateY(-12px) scale(1.03)' : 'translateY(0) scale(1)',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: examType === 'TYT' 
                      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                      : 'transparent',
                    borderRadius: '24px',
                    opacity: examType === 'TYT' ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    animation: examType === 'TYT' ? 'pulse 2s infinite' : 'none'
                  },
                  '&:hover': {
                    transform: examType === 'TYT' ? 'translateY(-12px) scale(1.03)' : 'translateY(-6px) scale(1.02)',
                    background: examType === 'TYT' 
                      ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                      : 'rgba(255, 255, 255, 0.12)',
                    borderColor: examType === 'TYT' 
                      ? 'rgba(102, 126, 234, 1)'
                      : 'rgba(255, 255, 255, 0.25)',
                    boxShadow: examType === 'TYT' 
                      ? '0 25px 70px rgba(102, 126, 234, 0.5), 0 12px 30px rgba(102, 126, 234, 0.3)'
                      : '0 15px 40px rgba(0, 0, 0, 0.15)'
                  },
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.02)' },
                    '100%': { transform: 'scale(1)' }
                  }
                }}
              >
                {/* Selection Indicator */}
                {examType === 'TYT' && (
                  <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite'
                  }}>
                    <CheckCircleIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
                  </Box>
                )}

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800,
                    color: examType === 'TYT' ? '#ffffff' : 'rgba(255,255,255,0.9)',
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3rem' }
                  }}>
                    TYT
                  </Typography>
                  
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    color: examType === 'TYT' ? '#ffffff' : 'rgba(255,255,255,0.8)',
                    mb: 2
                  }}>
                    Temel Yeterlilik Testi
                  </Typography>
                  
                  <Typography variant="body2" sx={{ 
                    color: examType === 'TYT' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
                    lineHeight: 1.6,
                    mb: 3
                  }}>
                    Türkçe, Sosyal Bilimler, Temel Matematik ve Fen Bilimleri derslerini kapsar
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {['Türkçe', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü', 'Matematik', 'Fizik', 'Kimya', 'Biyoloji'].map((subject, index) => (
                      <Chip 
                        key={index}
                        label={subject} 
                        size="small"
                        sx={{ 
                          backgroundColor: examType === 'TYT' 
                            ? 'rgba(255, 255, 255, 0.2)' 
                            : 'rgba(79, 172, 254, 0.2)',
                          color: examType === 'TYT' ? '#ffffff' : '#4facfe',
                          fontWeight: 600,
                          border: `1px solid ${examType === 'TYT' 
                            ? 'rgba(255, 255, 255, 0.3)' 
                            : 'rgba(79, 172, 254, 0.3)'}`
                        }} 
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* AYT Card */}
              <Box
                onClick={() => setExamType('AYT')}
                sx={{
                  flex: 1,
                  cursor: 'pointer',
                  position: 'relative',
                  borderRadius: '24px',
                  padding: 4,
                  background: examType === 'AYT' 
                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: examType === 'AYT' 
                    ? '2px solid rgba(240, 147, 251, 0.8)'
                    : '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: examType === 'AYT' 
                    ? '0 20px 60px rgba(240, 147, 251, 0.4), 0 8px 25px rgba(240, 147, 251, 0.2)'
                    : '0 10px 30px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: examType === 'AYT' ? 'translateY(-12px) scale(1.03)' : 'translateY(0) scale(1)',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: examType === 'AYT' 
                      ? 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)'
                      : 'transparent',
                    borderRadius: '24px',
                    opacity: examType === 'AYT' ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    animation: examType === 'AYT' ? 'pulse 2s infinite' : 'none'
                  },
                  '&:hover': {
                    transform: examType === 'AYT' ? 'translateY(-12px) scale(1.03)' : 'translateY(-6px) scale(1.02)',
                    background: examType === 'AYT' 
                      ? 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)'
                      : 'rgba(255, 255, 255, 0.12)',
                    borderColor: examType === 'AYT' 
                      ? 'rgba(240, 147, 251, 1)'
                      : 'rgba(255, 255, 255, 0.25)',
                    boxShadow: examType === 'AYT' 
                      ? '0 25px 70px rgba(240, 147, 251, 0.5), 0 12px 30px rgba(240, 147, 251, 0.3)'
                      : '0 15px 40px rgba(0, 0, 0, 0.15)'
                  },
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.02)' },
                    '100%': { transform: 'scale(1)' }
                  }
                }}
              >
                {/* Selection Indicator */}
                {examType === 'AYT' && (
                  <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite'
                  }}>
                    <CheckCircleIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
                  </Box>
                )}

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800,
                    color: examType === 'AYT' ? '#ffffff' : 'rgba(255,255,255,0.9)',
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3rem' }
                  }}>
                    AYT
                  </Typography>
                  
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    color: examType === 'AYT' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
                    mb: 2
                  }}>
                    Alan Yeterlilik Testi
                  </Typography>
                  
                  <Typography variant="body2" sx={{ 
                    color: examType === 'AYT' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
                    lineHeight: 1.6,
                    mb: 3
                  }}>
                    Matematik, Edebiyat, Fen Bilimleri ve Sosyal Bilimler alanlarını kapsar
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {['Matematik', 'Edebiyat', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü', 'Fizik', 'Kimya', 'Biyoloji'].map((subject, index) => (
                      <Chip 
                        key={index}
                        label={subject} 
                        size="small"
                        sx={{ 
                          backgroundColor: examType === 'AYT' 
                            ? 'rgba(255, 255, 255, 0.2)' 
                            : 'rgba(240, 147, 251, 0.2)',
                          color: examType === 'AYT' ? '#ffffff' : '#f093fb',
                          fontWeight: 600,
                          border: `1px solid ${examType === 'AYT' 
                            ? 'rgba(255, 255, 255, 0.3)' 
                            : 'rgba(240, 147, 251, 0.3)'}`
                        }} 
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Selected Info */}
            {examType && (
              <Box sx={{
                mt: 4,
                p: 3,
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#ffffff',
                  fontWeight: 700,
                  mb: 1
                }}>
                  Seçiminiz: {examType}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  {examType === 'TYT' 
                    ? 'Temel Yeterlilik Testi seçildi. 4 temel ders alanında sorularınızı girebilirsiniz.'
                    : 'Alan Yeterlilik Testi seçildi. 7 farklı ders alanında sorularınızı girebilirsiniz.'
                  }
                </Typography>
              </Box>
            )}
          </Box>
        );
      case 3: // Ders Bilgileri
        return (
          <Box sx={{ py: 2 }}>
                        {/* Header Section */}
            <Box sx={{
              textAlign: 'center',
              mb: 5,
              position: 'relative'
            }}>
              <Box sx={{
                width: 65,
                height: 65,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
                position: 'relative',
                animation: 'float 3s ease-in-out infinite',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-4px',
                  left: '-4px',
                  right: '-4px',
                  bottom: '-4px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  opacity: 0.3,
                  filter: 'blur(12px)',
                  zIndex: -1,
                  animation: 'pulse 2s ease-in-out infinite'
                },
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-8px)' }
                },
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.3 },
                  '50%': { opacity: 0.6 }
                }
              }}>
                <ShowChartIcon sx={{ 
                  color: '#ffffff', 
                  fontSize: '2rem',
                  filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))'
                }} />
              </Box>
              
              <Typography variant="h5" sx={{ 
                fontWeight: 800, 
                color: '#ffffff',
                mb: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.5rem', md: '1.8rem' }
              }}>
              Ders Bilgileri
            </Typography>
            
              <Typography variant="body1" sx={{ 
                color: 'rgba(255,255,255,0.85)',
                fontSize: '1.1rem',
                maxWidth: '650px',
                mx: 'auto',
                lineHeight: 1.7,
                fontWeight: 500
              }}>
                Her ders için doğru, yanlış ve boş sayılarını girin. Net değerleriniz otomatik hesaplanacaktır.
                </Typography>
            </Box>
            
            <Grid container spacing={4}>
              {/* Sol Panel - Ders Listesi */}
              <Grid item xs={12} md={5}>
                <Box sx={{
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                  backdropFilter: 'blur(25px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  p: 3,
                  height: '480px',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
                  }
                }}>
                  <Box sx={{ 
                    textAlign: 'center',
                    mb: 3,
                    pb: 2,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: '#ffffff',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '1.2rem'
                    }}>
                      {examType} Dersleri
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: 'rgba(255,255,255,0.7)',
                      mt: 0.5,
                      fontSize: '0.85rem'
                    }}>
                      Ders seçin ve bilgilerini girin
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    maxHeight: '350px', 
                    overflow: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '2px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '2px',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      }
                    }
                  }}>
                    {(examType === 'TYT' ? tytSubjects : aytSubjects).map((subject, index) => {
                      // Her ders için özel renk paleti
                      const getSubjectColors = (index) => {
                        const colorPalettes = [
                          { primary: '#6366f1', secondary: '#818cf8', name: 'Indigo' }, // TYT Türkçe
                          { primary: '#8b5cf6', secondary: '#a78bfa', name: 'Purple' }, // TYT Sosyal
                          { primary: '#06b6d4', secondary: '#67e8f9', name: 'Cyan' },   // TYT Matematik  
                          { primary: '#10b981', secondary: '#6ee7b7', name: 'Emerald' }, // TYT Fen
                          { primary: '#f59e0b', secondary: '#fbbf24', name: 'Amber' },   // AYT için ekstra
                          { primary: '#ef4444', secondary: '#f87171', name: 'Red' },     // AYT için ekstra
                          { primary: '#ec4899', secondary: '#f472b6', name: 'Pink' },    // AYT için ekstra
                          { primary: '#84cc16', secondary: '#a3e635', name: 'Lime' },    // AYT için ekstra
                          { primary: '#3b82f6', secondary: '#60a5fa', name: 'Blue' },    // AYT için ekstra
                        ];
                        return colorPalettes[index] || colorPalettes[0];
                      };

                      const colors = getSubjectColors(index);
                      const isSelected = currentSubject === subject;

                      return (
                        <Box
                          key={subject}
                          onClick={() => handleSubjectSelect(subject)}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: '16px',
                            p: 2.5,
                            mb: 2,
                            background: isSelected 
                              ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
                              : 'rgba(255, 255, 255, 0.06)',
                            border: isSelected
                              ? `2px solid ${colors.primary}40`
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            transform: isSelected ? 'translateY(-1px)' : 'translateY(0)',
                            boxShadow: isSelected 
                              ? `0 8px 32px ${colors.primary}30`
                              : '0 2px 12px rgba(0, 0, 0, 0.1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': isSelected ? {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                              borderRadius: '16px'
                            } : {},
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              background: isSelected 
                                ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
                                : `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}15 100%)`,
                              borderColor: isSelected
                                ? `${colors.primary}60`
                                : `${colors.primary}30`,
                              boxShadow: isSelected
                                ? `0 12px 40px ${colors.primary}40`
                                : `0 6px 24px ${colors.primary}20`
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, position: 'relative', zIndex: 1 }}>
                            <Box sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '12px',
                              background: isSelected 
                                ? 'rgba(255, 255, 255, 0.25)'
                                : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1rem',
                              fontWeight: 800,
                              color: '#ffffff',
                              boxShadow: isSelected
                                ? '0 4px 12px rgba(255, 255, 255, 0.2)'
                                : `0 4px 12px ${colors.primary}40`,
                              border: isSelected ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'
                            }}>
                              {index + 1}
                            </Box>
                            
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ 
                                fontWeight: 700,
                                color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.95)',
                                fontSize: '1.05rem',
                                mb: 0.3,
                                lineHeight: 1.2
                              }}>
                                {subject}
                              </Typography>
                              {subjectData[subject] && (
                                <Typography variant="body2" sx={{
                                  color: isSelected ? 'rgba(255,255,255,0.8)' : `${colors.primary}`,
                                  fontSize: '0.85rem',
                                  fontWeight: 600
                                }}>
                                  Net: {subjectData[subject].net}
                                </Typography>
                              )}
                            </Box>

                            {subjectData[subject] && (
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: isSelected 
                                  ? 'rgba(255, 255, 255, 0.8)'
                                  : colors.primary,
                                boxShadow: isSelected
                                  ? '0 0 8px rgba(255, 255, 255, 0.6)'
                                  : `0 0 8px ${colors.primary}60`
                              }} />
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Grid>
              
              {/* Sağ Panel - Ders Bilgisi Formu */}
              <Grid item xs={12} md={7}>
                <Box sx={{
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  p: 3,
                  minHeight: '480px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    borderRadius: '24px 24px 0 0'
                  }
                }}>
                  {currentSubject ? (
                    <>
                      {/* Ders Header */}
                      <Box sx={{ 
                        textAlign: 'center', 
                        mb: 4,
                        p: 4,
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(20px)',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                          borderRadius: '20px 20px 0 0'
                        }
                      }}>
                        <Box sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '18px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                          position: 'relative',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '2px',
                            left: '2px',
                            right: '2px',
                            height: '50%',
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                            borderRadius: '16px 16px 0 0'
                          }
                        }}>
                          <ShowChartIcon sx={{ 
                            color: '#ffffff', 
                            fontSize: '1.8rem',
                            position: 'relative',
                            zIndex: 1
                          }} />
                        </Box>
                        
                        <Typography variant="h4" sx={{ 
                          color: '#ffffff',
                          fontWeight: 900,
                          mb: 2,
                          fontSize: { xs: '1.6rem', md: '1.8rem' },
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                          {currentSubject}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: 'rgba(255,255,255,0.85)',
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          maxWidth: '420px',
                          mx: 'auto',
                          lineHeight: 1.7
                        }}>
                          Lütfen bu ders için soru sayılarını girin
                        </Typography>
                      </Box>

                      {/* Input Grid */}
                      <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                          <StyledTextField
                            fullWidth
                            label="Doğru Sayısı"
                            type="number"
                            value={correctCount}
                            onChange={(e) => setCorrectCount(e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '18px',
                                fontSize: '1rem',
                                fontFamily: '"Satoshi", "Inter", "Roboto", sans-serif',
                                fontWeight: 600,
                                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                                backdropFilter: 'blur(15px)',
                                border: '2px solid rgba(76, 175, 80, 0.3)',
                                color: '#ffffff',
                                minHeight: '56px',
                                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.15)',
                                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                '& fieldset': { border: 'none' },
                                '&:hover': {
                                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.12) 100%)',
                                  borderColor: 'rgba(76, 175, 80, 0.5)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 12px 35px rgba(76, 175, 80, 0.25)'
                                },
                                '&.Mui-focused': {
                                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                  borderColor: '#4CAF50',
                                  boxShadow: '0 0 0 4px rgba(76, 175, 80, 0.3)',
                                  transform: 'translateY(-2px)'
                                }
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.85)',
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                '&.Mui-focused': { 
                                  color: '#4CAF50',
                                  fontWeight: 800
                                }
                              }
                            }}
                            InputProps={{
                              inputProps: { min: 0, max: 100 },
                              startAdornment: (
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '12px',
                                  background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1.5,
                                  color: '#ffffff',
                                  fontWeight: 900,
                                  fontSize: '1.2rem',
                                  boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
                                  border: '2px solid rgba(255, 255, 255, 0.15)',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: '1px',
                                    left: '1px',
                                    right: '1px',
                                    height: '50%',
                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                                    borderRadius: '10px 10px 0 0'
                                  }
                                }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                                  </svg>
                                </Box>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <StyledTextField
                            fullWidth
                            label="Yanlış Sayısı"
                            type="number"
                            value={incorrectCount}
                            onChange={(e) => setIncorrectCount(e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '18px',
                                fontSize: '1rem',
                                fontFamily: '"Satoshi", "Inter", "Roboto", sans-serif',
                                fontWeight: 600,
                                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                                backdropFilter: 'blur(15px)',
                                border: '2px solid rgba(244, 67, 54, 0.3)',
                                color: '#ffffff',
                                minHeight: '56px',
                                boxShadow: '0 8px 25px rgba(244, 67, 54, 0.15)',
                                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                '& fieldset': { border: 'none' },
                                '&:hover': {
                                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.12) 100%)',
                                  borderColor: 'rgba(244, 67, 54, 0.5)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 12px 35px rgba(244, 67, 54, 0.25)'
                                },
                                '&.Mui-focused': {
                                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                  borderColor: '#f44336',
                                  boxShadow: '0 0 0 4px rgba(244, 67, 54, 0.3)',
                                  transform: 'translateY(-2px)'
                                }
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.85)',
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                '&.Mui-focused': { 
                                  color: '#f44336',
                                  fontWeight: 800
                                }
                              }
                            }}
                            InputProps={{
                              inputProps: { min: 0, max: 100 },
                              startAdornment: (
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '12px',
                                  background: 'linear-gradient(135deg, #f44336 0%, #EF5350 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1.5,
                                  color: '#ffffff',
                                  fontWeight: 900,
                                  fontSize: '1.2rem',
                                  boxShadow: '0 4px 16px rgba(244, 67, 54, 0.3)',
                                  border: '2px solid rgba(255, 255, 255, 0.15)',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: '1px',
                                    left: '1px',
                                    right: '1px',
                                    height: '50%',
                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                                    borderRadius: '10px 10px 0 0'
                                  }
                                }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
                                  </svg>
                                </Box>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <StyledTextField
                            fullWidth
                            label="Boş Sayısı"
                            type="number"
                            value={emptyCount}
                            onChange={(e) => setEmptyCount(e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '18px',
                                fontSize: '1rem',
                                fontFamily: '"Satoshi", "Inter", "Roboto", sans-serif',
                                fontWeight: 600,
                                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                                backdropFilter: 'blur(15px)',
                                border: '2px solid rgba(255, 152, 0, 0.3)',
                                color: '#ffffff',
                                minHeight: '56px',
                                boxShadow: '0 8px 25px rgba(255, 152, 0, 0.15)',
                                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                '& fieldset': { border: 'none' },
                                '&:hover': {
                                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.12) 100%)',
                                  borderColor: 'rgba(255, 152, 0, 0.5)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 12px 35px rgba(255, 152, 0, 0.25)'
                                },
                                '&.Mui-focused': {
                                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 100%)',
                                  borderColor: '#ff9800',
                                  boxShadow: '0 0 0 4px rgba(255, 152, 0, 0.3)',
                                  transform: 'translateY(-2px)'
                                }
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.85)',
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                '&.Mui-focused': { 
                                  color: '#ff9800',
                                  fontWeight: 800
                                }
                              }
                            }}
                            InputProps={{
                              inputProps: { min: 0, max: 100 },
                              startAdornment: (
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '12px',
                                  background: 'linear-gradient(135deg, #ff9800 0%, #FFB74D 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1.5,
                                  color: '#ffffff',
                                  fontWeight: 900,
                                  fontSize: '1.2rem',
                                  boxShadow: '0 4px 16px rgba(255, 152, 0, 0.3)',
                                  border: '2px solid rgba(255, 255, 255, 0.15)',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: '1px',
                                    left: '1px',
                                    right: '1px',
                                    height: '50%',
                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                                    borderRadius: '10px 10px 0 0'
                                  }
                                }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                                    <path d="M12 6v6h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  </svg>
                                </Box>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>

                      {/* Net Hesaplama ve Ekle Butonu */}
                      <Box sx={{
                        p: 4,
                        borderRadius: '24px',
                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 2,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                        backdropFilter: 'blur(25px)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                          borderRadius: '24px 24px 0 0'
                        }
                      }}>
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          flex: 1
                        }}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: '1px',
                              left: '1px',
                              right: '1px',
                              height: '50%',
                              background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                              borderRadius: '11px 11px 0 0'
                            }
                          }}>
                            <ShowChartIcon sx={{ 
                              color: '#ffffff', 
                              fontSize: '1.2rem',
                              position: 'relative',
                              zIndex: 1
                            }} />
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ 
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '1.2rem',
                              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            }}>
                              NETİNİZ:
                            </Typography>
                            <Typography variant="h6" sx={{ 
                              color: '#1e40af',
                              fontWeight: 900,
                              fontSize: '1.3rem',
                              fontFamily: '"Satoshi", "Inter", sans-serif'
                            }}>
                              {calculateNet(correctCount, incorrectCount)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Button 
                          variant="contained" 
                          onClick={handleNext}
                          startIcon={<AddIcon sx={{ fontSize: '1.1rem' }} />}
                          disabled={!correctCount && !incorrectCount && !emptyCount}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#ffffff',
                            fontWeight: 700,
                            px: 3,
                            py: 1.5,
                            borderRadius: '14px',
                            fontSize: '0.95rem',
                            minHeight: '44px',
                            minWidth: '120px',
                            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            position: 'relative',
                            overflow: 'hidden',
                            textTransform: 'none',
                            letterSpacing: '0.3px',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                              transition: 'opacity 0.3s ease'
                            },
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: '1px',
                              left: '1px',
                              right: '1px',
                              height: '50%',
                              background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
                              borderRadius: '13px 13px 0 0'
                            },
                            '&:hover': {
                              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                              transform: 'translateY(-2px) scale(1.02)',
                              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              '&::before': {
                                opacity: 0.8
                              }
                            },
                            '&:active': {
                              transform: 'translateY(-1px) scale(1.01)'
                            },
                            '&:disabled': {
                              background: 'rgba(255, 255, 255, 0.06)',
                              color: 'rgba(255, 255, 255, 0.3)',
                              transform: 'none',
                              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                              borderColor: 'rgba(255, 255, 255, 0.1)'
                            }
                          }}
                        >
                          Dersi Ekle
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      textAlign: 'center',
                      py: 6
                    }}>
                      <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        border: '2px dashed rgba(255, 255, 255, 0.3)'
                      }}>
                        <ShowChartIcon sx={{ 
                          color: 'rgba(255,255,255,0.5)', 
                          fontSize: '2.5rem'
                        }} />
                      </Box>
                      <Typography variant="h6" sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        fontWeight: 600,
                        mb: 1
                      }}>
                        Ders Seçin
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.5)',
                        maxWidth: '300px'
                      }}>
                        Lütfen sol taraftan bir ders seçerek soru sayılarını giriniz
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Eklenen Dersler Tablosu */}
            {Object.keys(subjectData).length > 0 && (
              <Box sx={{ mt: 6 }}>
                <Box sx={{
                  textAlign: 'center',
                  mb: 4,
                  position: 'relative'
                }}>
                  <Box sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <Typography sx={{ 
                      color: '#ffffff', 
                      fontSize: '1.4rem',
                      fontWeight: 900
                    }}>
                      {Object.keys(subjectData).length}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" sx={{ 
                    color: '#ffffff',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '1.3rem'
                  }}>
                    Eklenen Dersler
                  </Typography>
                  
                  <Typography variant="body1" sx={{
                    color: 'rgba(255,255,255,0.7)',
                    mt: 1,
                    fontSize: '1.05rem'
                  }}>
                    Girdiğiniz ders bilgilerinin özeti
                  </Typography>
                </Box>
                
                <Box sx={{
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  overflow: 'hidden',
                  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    borderRadius: '24px 24px 0 0'
                  }
                }}>
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ 
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '1px',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
                        }
                      }}>
                        <TableRow>
                          <TableCell sx={{ 
                            fontWeight: 900, 
                            fontSize: '1.1rem',
                            color: '#ffffff',
                            borderBottom: 'none',
                            py: 3,
                            px: 3
                          }}>
                            Ders
                          </TableCell>
                          <TableCell align="center" sx={{ 
                            fontWeight: 900, 
                            fontSize: '1.1rem',
                            color: '#ffffff',
                            borderBottom: 'none',
                            py: 3,
                            px: 3
                          }}>
                            Doğru
                          </TableCell>
                          <TableCell align="center" sx={{ 
                            fontWeight: 900, 
                            fontSize: '1.1rem',
                            color: '#ffffff',
                            borderBottom: 'none',
                            py: 3,
                            px: 3
                          }}>
                            Yanlış
                          </TableCell>
                          <TableCell align="center" sx={{ 
                            fontWeight: 900, 
                            fontSize: '1.1rem',
                            color: '#ffffff',
                            borderBottom: 'none',
                            py: 3,
                            px: 3
                          }}>
                            Boş
                          </TableCell>
                          <TableCell align="center" sx={{ 
                            fontWeight: 900, 
                            fontSize: '1.1rem',
                            color: '#ffffff',
                            borderBottom: 'none',
                            py: 3,
                            px: 3
                          }}>
                            Net
                          </TableCell>
                          <TableCell align="right" sx={{ 
                            fontWeight: 900, 
                            fontSize: '1.1rem',
                            color: '#ffffff',
                            borderBottom: 'none',
                            py: 3,
                            px: 3
                          }}>
                            İşlemler
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(subjectData).map(([subject, data], index) => (
                          <TableRow 
                            key={subject}
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                transform: 'scale(1.01)',
                                '& td': {
                                  transform: 'translateX(2px)'
                                }
                              }
                            }}
                          >
                            <TableCell sx={{ 
                              fontWeight: 800, 
                              fontSize: '1.05rem',
                              color: '#ffffff',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                              py: 2.5,
                              px: 3,
                              transition: 'all 0.3s ease'
                            }}>
                              {subject}
                            </TableCell>
                            <TableCell align="center" sx={{ 
                              color: '#4CAF50',
                              fontWeight: 800,
                              fontSize: '1.1rem',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                              py: 2.5,
                              px: 3,
                              transition: 'all 0.3s ease'
                            }}>
                              {data.correctCount}
                            </TableCell>
                            <TableCell align="center" sx={{ 
                              color: '#f44336',
                              fontWeight: 800,
                              fontSize: '1.1rem',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                              py: 2.5,
                              px: 3,
                              transition: 'all 0.3s ease'
                            }}>
                              {data.incorrectCount}
                            </TableCell>
                            <TableCell align="center" sx={{ 
                              color: '#ff9800',
                              fontWeight: 600,
                              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              {data.emptyCount}
                            </TableCell>
                            <TableCell align="center" sx={{ 
                              fontWeight: 800,
                              fontSize: '1.1rem',
                              color: '#f093fb',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              {data.net}
                            </TableCell>
                            <TableCell align="right" sx={{
                              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleSubjectSelect(subject)}
                                sx={{
                                  color: '#f093fb',
                                  background: 'rgba(240, 147, 251, 0.1)',
                                  mr: 1,
                                  '&:hover': {
                                    background: 'rgba(240, 147, 251, 0.2)',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  const newData = { ...subjectData };
                                  delete newData[subject];
                                  setSubjectData(newData);
                                }}
                                sx={{
                                  color: '#f44336',
                                  background: 'rgba(244, 67, 54, 0.1)',
                                  '&:hover': {
                                    background: 'rgba(244, 67, 54, 0.2)',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            )}
          </Box>
        );
      case 4: // Özet
        return (
          <Box sx={{ py: 2 }}>
            {/* Header Section */}
            <Box sx={{
              textAlign: 'center',
              mb: 4,
              position: 'relative'
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 10px 30px rgba(67, 233, 123, 0.4)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-3px',
                  left: '-3px',
                  right: '-3px',
                  bottom: '-3px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                  opacity: 0.3,
                  filter: 'blur(8px)',
                  zIndex: -1
                }
              }}>
                <CheckCircleIcon sx={{ 
                  color: '#ffffff', 
                  fontSize: '2.5rem',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }} />
              </Box>
              
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                color: '#ffffff',
                mb: 1,
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}>
                Deneme Özeti
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                maxWidth: '500px',
                mx: 'auto'
              }}>
                Deneme bilgilerinizi son kez kontrol edin ve kaydı tamamlayın.
              </Typography>
            </Box>

            {/* Ana Bilgiler Kartları */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                  }
                }}>
                  <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                  }}>
                    <AssignmentIcon sx={{ color: '#ffffff', fontSize: '1.8rem' }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    mb: 1,
                    fontWeight: 600
                  }}>
                    Deneme Adı
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    color: '#ffffff',
                    wordBreak: 'break-word'
                  }}>
                    {examName}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                  }
                }}>
                  <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    boxShadow: '0 8px 25px rgba(255, 154, 158, 0.3)'
                  }}>
                    <CalendarTodayIcon sx={{ color: '#ffffff', fontSize: '1.8rem' }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    mb: 1,
                    fontWeight: 600
                  }}>
                    Tarih
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    color: '#ffffff'
                  }}>
                    {format(examDate, 'dd MMMM yyyy', { locale: trLocale })}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                  }
                }}>
                  <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: examType === 'TYT' 
                      ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                      : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    boxShadow: examType === 'TYT' 
                      ? '0 8px 25px rgba(79, 172, 254, 0.3)'
                      : '0 8px 25px rgba(168, 237, 234, 0.3)'
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: '#ffffff',
                      fontWeight: 800
                    }}>
                      {examType}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    mb: 1,
                    fontWeight: 600
                  }}>
                    Sınav Türü
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    color: '#ffffff'
                  }}>
                    {examType === 'TYT' ? 'Temel Yeterlilik' : 'Alan Yeterlilik'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Dersler Tablosu */}
            <Box sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
              mb: 4
            }}>
              <Box sx={{
                p: 3,
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#ffffff',
                  fontWeight: 800,
                  textAlign: 'center'
                }}>
                  Ders Detayları ({Object.keys(subjectData).length} Ders)
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead sx={{ 
                    background: 'rgba(67, 233, 123, 0.1)' 
                  }}>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 800, 
                        fontSize: '1rem',
                        color: '#ffffff',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        Ders
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 800, 
                        fontSize: '1rem',
                        color: '#ffffff',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        Doğru
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 800, 
                        fontSize: '1rem',
                        color: '#ffffff',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        Yanlış
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 800, 
                        fontSize: '1rem',
                        color: '#ffffff',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        Boş
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 800, 
                        fontSize: '1rem',
                        color: '#ffffff',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        Net Puan
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                                         {Object.entries(subjectData).map(([subject, data], index) => (
                       <TableRow 
                         key={subject}
                         sx={{
                           '&:hover': {
                             background: 'rgba(255, 255, 255, 0.05)'
                           },
                           '&:nth-of-type(even)': {
                             background: 'rgba(255, 255, 255, 0.02)'
                           }
                         }}
                       >
                         <TableCell sx={{ 
                           fontWeight: 700, 
                           fontSize: '1.1rem',
                           color: '#ffffff',
                           borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                           display: 'flex',
                           alignItems: 'center',
                           gap: 2
                         }}>
                           <Box sx={{
                             width: 35,
                             height: 35,
                             borderRadius: '8px',
                             background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             color: '#ffffff',
                             fontWeight: 700,
                             fontSize: '0.9rem'
                           }}>
                             {index + 1}
                           </Box>
                           {subject}
                         </TableCell>
                         <TableCell align="center" sx={{ 
                           color: '#4CAF50',
                           fontWeight: 700,
                           fontSize: '1.1rem',
                           borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                         }}>
                           {data.correctCount}
                         </TableCell>
                         <TableCell align="center" sx={{ 
                           color: '#f44336',
                           fontWeight: 700,
                           fontSize: '1.1rem',
                           borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                         }}>
                           {data.incorrectCount}
                         </TableCell>
                         <TableCell align="center" sx={{ 
                           color: '#ff9800',
                           fontWeight: 700,
                           fontSize: '1.1rem',
                           borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                         }}>
                           {data.emptyCount}
                         </TableCell>
                         <TableCell align="center" sx={{ 
                           fontWeight: 800,
                           fontSize: '1.2rem',
                           color: '#43e97b',
                           borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                           position: 'relative'
                         }}>
                           <Box sx={{
                             background: 'rgba(67, 233, 123, 0.2)',
                             borderRadius: '12px',
                             px: 2,
                             py: 1,
                             display: 'inline-block',
                             border: '1px solid rgba(67, 233, 123, 0.3)'
                           }}>
                             {data.net}
                           </Box>
                         </TableCell>
                       </TableRow>
                     ))}
                     
                     {/* Toplam Net Satırı */}
                     <TableRow sx={{
                       background: 'rgba(67, 233, 123, 0.1)',
                       borderTop: '2px solid rgba(67, 233, 123, 0.3)'
                     }}>
                       <TableCell sx={{ 
                         fontWeight: 800, 
                         fontSize: '1.2rem',
                         color: '#43e97b',
                         borderBottom: 'none'
                       }}>
                         TOPLAM
                       </TableCell>
                       <TableCell align="center" sx={{ 
                         color: '#4CAF50',
                         fontWeight: 800,
                         fontSize: '1.2rem',
                         borderBottom: 'none'
                       }}>
                         {Object.values(subjectData).reduce((sum, data) => sum + parseInt(data.correctCount || 0), 0)}
                       </TableCell>
                       <TableCell align="center" sx={{ 
                         color: '#f44336',
                         fontWeight: 800,
                         fontSize: '1.2rem',
                         borderBottom: 'none'
                       }}>
                         {Object.values(subjectData).reduce((sum, data) => sum + parseInt(data.incorrectCount || 0), 0)}
                       </TableCell>
                       <TableCell align="center" sx={{ 
                         color: '#ff9800',
                         fontWeight: 800,
                         fontSize: '1.2rem',
                         borderBottom: 'none'
                       }}>
                         {Object.values(subjectData).reduce((sum, data) => sum + parseInt(data.emptyCount || 0), 0)}
                       </TableCell>
                       <TableCell align="center" sx={{ 
                         fontWeight: 900,
                         fontSize: '1.4rem',
                         color: '#43e97b',
                         borderBottom: 'none'
                       }}>
                         <Box sx={{
                           background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                           borderRadius: '16px',
                           px: 3,
                           py: 1.5,
                           display: 'inline-block',
                           color: '#ffffff',
                           boxShadow: '0 6px 20px rgba(67, 233, 123, 0.3)'
                         }}>
                           {Object.values(subjectData).reduce((sum, data) => sum + parseFloat(data.net || 0), 0).toFixed(2)}
                         </Box>
                       </TableCell>
                     </TableRow>
                   </TableBody>
                 </Table>
               </TableContainer>
             </Box>

             {/* Son Kontrol Mesajı */}
             <Box sx={{
               background: 'rgba(255, 255, 255, 0.1)',
               backdropFilter: 'blur(20px)',
               borderRadius: '20px',
               border: '1px solid rgba(255, 255, 255, 0.2)',
               p: 4,
               textAlign: 'center'
             }}>
               <Box sx={{
                 width: 60,
                 height: 60,
                 borderRadius: '50%',
                 background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 mx: 'auto',
                 mb: 2,
                 boxShadow: '0 8px 25px rgba(67, 233, 123, 0.3)'
               }}>
                 <CheckCircleIcon sx={{ color: '#ffffff', fontSize: '1.8rem' }} />
               </Box>
               
               <Typography variant="h6" sx={{ 
                 color: '#ffffff',
                 fontWeight: 700,
                 mb: 2
               }}>
                 Tüm Bilgiler Hazır!
               </Typography>
               
               <Typography variant="body1" sx={{ 
                 color: 'rgba(255,255,255,0.8)',
                 lineHeight: 1.6,
                 maxWidth: '600px',
                 mx: 'auto'
               }}>
                 Deneme bilgileriniz yukarıda özetlenmiştir. Bilgilerin doğruluğunu kontrol ettikten sonra 
                 &quot;İleri&quot; butonuna tıklayarak kaydı tamamlayabilirsiniz. 
                 Değişiklik yapmak için &quot;Geri&quot; butonunu kullanabilirsiniz.
               </Typography>
               
               <Box sx={{
                 mt: 3,
                 p: 2,
                 borderRadius: '12px',
                 background: 'rgba(67, 233, 123, 0.1)',
                 border: '1px solid rgba(67, 233, 123, 0.3)'
               }}>
                 <Typography variant="body2" sx={{ 
                   color: '#43e97b',
                   fontWeight: 600
                 }}>
                   💡 İpucu: Kayıt tamamlandıktan sonra bu deneme bilgileriniz analiz ekranlarında görünecek 
                   ve gelişim takibiniz için kullanılacaktır.
                 </Typography>
               </Box>
             </Box>
           </Box>
        );
      default:
        return null;
    }
  };

  // Not: renderRecordsList fonksiyonu artık kullanılmıyor, yeni tasarım için kaldırıldı


  
  // Zaman içinde gelişim verilerini hesapla
  const calculateTimeProgress = () => {
    const subjects = selectedExamType === 'TYT' ? tytSubjects : aytSubjects;
    const filteredRecords = netRecords.filter(record => record.examType === selectedExamType);
    
    if (filteredRecords.length === 0) return [];
    
    // Tarihe göre sırala - Güvenli bir şekilde toDate() kullanımı
    const sortedRecords = [...filteredRecords].sort((a, b) => {
      // Eğer examDate tanımlı değilse veya toDate metodu yoksa, karşılaştırma yapma
      if (!a.examDate || !a.examDate.toDate || !b.examDate || !b.examDate.toDate) {
        return 0; // Sıralamayı değiştirme
      }
      try {
        return a.examDate.toDate() - b.examDate.toDate();
      } catch (error) {
        console.error('Date sorting error:', error);
        return 0; // Hata durumunda sıralamayı değiştirme
      }
    });
    
    return sortedRecords.map(record => {
      const dataPoint = {
        name: record.examName,
        date: ''
      };
      
      // Güvenli bir şekilde tarih formatı
      try {
        if (record.examDate && typeof record.examDate.toDate === 'function') {
          dataPoint.date = format(record.examDate.toDate(), 'dd/MM', { locale: trLocale });
        } else if (record.examDate instanceof Date) {
          dataPoint.date = format(record.examDate, 'dd/MM', { locale: trLocale });
        } else {
          dataPoint.date = 'Tarih yok';
        }
      } catch (error) {
        console.error('Date formatting error:', error);
        dataPoint.date = 'Tarih hatası';
      }
      
      subjects.forEach(subject => {
        if (record.subjects && record.subjects[subject]) {
          dataPoint[subject] = parseFloat(record.subjects[subject].net);
        }
      });
      
      return dataPoint;
    });
  };
  
  // Ders için renk döndür
  const getSubjectColor = (subject) => {
    const subjectColors = {
      'TYT Türkçe': 'var(--turkce-color)',
      'TYT Sosyal': 'var(--sosyal-color)',
      'TYT Matematik': 'var(--matematik-color)',
      'TYT Fen Bilimleri': 'var(--fen-color)',
      'AYT Matematik': 'var(--matematik-color)',
      'AYT Fizik': 'var(--fizik-color)',
      'AYT Kimya': 'var(--kimya-color)',
      'AYT Biyoloji': 'var(--biyoloji-color)',
      'AYT Edebiyat': 'var(--edebiyat-color)',
      'AYT Tarih': 'var(--tarih-color)',
      'AYT Coğrafya': 'var(--cografya-color)'
    };
    
    return subjectColors[subject] || '#4a6cf7';
  };
  
  // Akıllı tavsiyeler oluştur
  const generateRecommendations = () => {
    const subjects = selectedExamType === 'TYT' ? tytSubjects : aytSubjects;
    const filteredRecords = netRecords.filter(record => record.examType === selectedExamType);
    
    if (filteredRecords.length < 2) return [];
    
    const recommendations = [];
    
    // Tarihe göre sırala
    const sortedRecords = [...filteredRecords].sort((a, b) => {
      try {
        return a.examDate.toDate() - b.examDate.toDate();
      } catch (error) {
        return 0;
      }
    });
    
    subjects.forEach((subject) => {
      const subjectRecords = sortedRecords.filter(record => 
        record.subjects && record.subjects[subject] && record.subjects[subject].net
      );
      
      if (subjectRecords.length >= 2) {
        const lastRecord = subjectRecords[subjectRecords.length - 1];
        const previousRecord = subjectRecords[subjectRecords.length - 2];
        
        const lastNet = parseFloat(lastRecord.subjects[subject].net);
        const previousNet = parseFloat(previousRecord.subjects[subject].net);
        const change = lastNet - previousNet;
        
        const lastCorrect = parseInt(lastRecord.subjects[subject].correct || 0);
        const lastIncorrect = parseInt(lastRecord.subjects[subject].incorrect || 0);
        const previousCorrect = parseInt(previousRecord.subjects[subject].correct || 0);
        const previousIncorrect = parseInt(previousRecord.subjects[subject].incorrect || 0);
        
        let message = '';
        let icon = null;
        let color = '';
        let actionTitle = '';
        
        if (change > 1.5) {
          // Güzel yükseliş
          actionTitle = 'Mükemmel İlerleme! 🚀';
          message = `${subject} dersinde harika bir performans sergiliyorsun! Önceki denemede ${previousNet.toFixed(1)} net yapmıştın, şimdi ${lastNet.toFixed(1)} net ile ${change.toFixed(1)} puanlık artış gösterdin. Bu başarıyı sürdürmek için: düzenli çalışma programını korumaya devam et, yanlış yaptığın soruları analiz etmeyi ihmal etme.`;
          icon = <TrendingUpIcon sx={{ color: '#4caf50' }} />;
          color = '#4caf50';
        } else if (change < -1.5) {
          // Düşüş var
          actionTitle = 'Gelişim Fırsatı 📈';
          const correctDiff = lastCorrect - previousCorrect;
          const incorrectDiff = lastIncorrect - previousIncorrect;
          
          let detailedAdvice = '';
          if (correctDiff < 0) {
            detailedAdvice = `Doğru sayın ${Math.abs(correctDiff)} azaldı. Daha fazla soru çözme pratiği yapman gerekiyor.`;
          }
          if (incorrectDiff > 0) {
            detailedAdvice += ` Yanlış sayın ${incorrectDiff} arttı. Hata analizine odaklan ve zayıf konuları tespit et.`;
          }
          
          message = `${subject} dersinde önceki denemende ${previousNet.toFixed(1)} net yapmıştın, fakat şimdiki denemende ${lastNet.toFixed(1)} net yaptın (${Math.abs(change).toFixed(1)} puanlık düşüş). ${detailedAdvice} Bu düşüşü yükselişe çevirmek için: hatalarını not sistemine kaydet, zayıf konularda ekstra çalışma yap, düzenli tekrar programı oluştur.`;
          icon = <TrendingDownIcon sx={{ color: '#f44336' }} />;
          color = '#f44336';
        } else if (change >= -1.5 && change <= 1.5) {
          // Stabil performans
          actionTitle = 'Kararlı Performans ⚖️';
          
          // Detaylı analiz
          let stabilityAdvice = '';
          if (lastNet >= 15) {
            stabilityAdvice = 'Yüksek seviyede kararlı bir performans sergiliyorsun. Şimdi sıra daha zor sorulara geçmekte.';
          } else if (lastNet >= 10) {
            stabilityAdvice = 'Orta seviyede istikrarlı gidiyorsun. Biraz daha hız kazanman için çözüm tekniklerini geliştir.';
        } else {
            stabilityAdvice = 'Temel seviyede kararlısın. Konu eksiklerini giderip hızını artırman gerekiyor.';
          }
          
          message = `${subject} dersinde istikrarlı bir performans gösteriyorsun (önceki: ${previousNet.toFixed(1)}, şimdi: ${lastNet.toFixed(1)}). ${stabilityAdvice} Önerim: farklı soru tipleri dene, zaman yönetimini geliştir, güçlü olduğun konuları da ihmal etme.`;
          icon = <TrendingFlatIcon sx={{ color: '#ff9800' }} />;
          color = '#ff9800';
        }
        
        // Özel durumlar için ek analizler
        if (lastIncorrect > previousIncorrect + 2) {
          message += ` ⚠️ Dikkat: Yanlış sayın önemli ölçüde arttı (${previousIncorrect} → ${lastIncorrect}). Hızlı çözme yerine doğru çözmeye odaklan.`;
        }
        
        if (lastCorrect > previousCorrect + 3) {
          message += ` 🎯 Doğru sayında güzel artış var (${previousCorrect} → ${lastCorrect}). Bu motivasyonla devam et!`;
        }
        
        // Tarihe dayalı öneriler
        try {
          const daysDiff = Math.floor((lastRecord.examDate.toDate() - previousRecord.examDate.toDate()) / (1000 * 60 * 60 * 24));
          if (daysDiff <= 3) {
            message += ` 📅 Son iki denemen arasında ${daysDiff} gün var. Düzenli çalışma tempon süper!`;
          } else if (daysDiff > 7) {
            message += ` 📅 Son iki denemen arasında ${daysDiff} gün geçmiş. Daha sık deneme çözmeni öneririm.`;
          }
        } catch (error) {
          // Tarih hatası durumunda sessizce devam et
        }
        
        recommendations.push({
          subject,
          message,
          icon,
          color,
          actionTitle: actionTitle || subject,
          lastNet: lastNet.toFixed(1),
          previousNet: previousNet.toFixed(1),
          change: change.toFixed(1),
          lastCorrect,
          lastIncorrect,
          previousCorrect,
          previousIncorrect
        });
      }
    });
    
    // En önemli önerileri öne çıkar (en büyük değişimler)
    recommendations.sort((a, b) => Math.abs(parseFloat(b.change)) - Math.abs(parseFloat(a.change)));
    
    // En fazla 6 öneri göster
    return recommendations.slice(0, 6);
  };
  
  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#1a0545',
      position: 'relative'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
          {/* Modern Header */}
          <Box sx={{
            textAlign: 'center', 
            mb: { xs: 6, md: 8 },
            pt: { xs: 4, md: 6 }
          }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  color: '#ffffff',
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                TYT-AYT Net Takibi
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', md: '1.2rem' }
                }}
              >
                Deneme sınavlarınızın sonuçlarını kaydedin ve performansınızı takip edin.
              </Typography>
            </motion.div>
          </Box>

          {/* Modern Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Box sx={{ 
              mb: 6,
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
              flexWrap: 'wrap'
            }}>
              <Button
                onClick={() => setTabValue(0)}
                startIcon={<AddIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: { xs: '0.8rem', md: '0.9rem' },
                  background: tabValue === 0 
                    ? 'linear-gradient(135deg, #55b3d9, #4a9cc7)' 
                    : 'rgba(255, 255, 255, 0.08)',
                  color: 'white',
                  border: `1px solid ${tabValue === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.1)'}`,
                  backdropFilter: 'blur(10px)',
                  boxShadow: tabValue === 0 
                    ? '0 4px 12px rgba(85, 179, 217, 0.3)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: tabValue === 0 
                      ? 'linear-gradient(135deg, #6bc1e1, #55b3d9)' 
                      : 'rgba(255, 255, 255, 0.12)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(85, 179, 217, 0.25)'
                  }
                }}
              >
                Yeni Deneme Ekle
              </Button>
              
              <Button
                onClick={() => setTabValue(1)}
                startIcon={<ViewListIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: { xs: '0.8rem', md: '0.9rem' },
                  background: tabValue === 1 
                    ? 'linear-gradient(135deg, #55b3d9, #4a9cc7)' 
                    : 'rgba(255, 255, 255, 0.08)',
                  color: 'white',
                  border: `1px solid ${tabValue === 1 ? 'transparent' : 'rgba(255, 255, 255, 0.1)'}`,
                  backdropFilter: 'blur(10px)',
                  boxShadow: tabValue === 1 
                    ? '0 4px 12px rgba(85, 179, 217, 0.3)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: tabValue === 1 
                      ? 'linear-gradient(135deg, #6bc1e1, #55b3d9)' 
                      : 'rgba(255, 255, 255, 0.12)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(85, 179, 217, 0.25)'
                  }
                }}
              >
                Kayıtlı Denemeler
              </Button>
              
              <Button
                onClick={() => setTabValue(2)}
                startIcon={<BarChartIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: { xs: '0.8rem', md: '0.9rem' },
                  background: tabValue === 2 
                    ? 'linear-gradient(135deg, #55b3d9, #4a9cc7)' 
                    : 'rgba(255, 255, 255, 0.08)',
                  color: 'white',
                  border: `1px solid ${tabValue === 2 ? 'transparent' : 'rgba(255, 255, 255, 0.1)'}`,
                  backdropFilter: 'blur(10px)',
                  boxShadow: tabValue === 2 
                    ? '0 4px 12px rgba(85, 179, 217, 0.3)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: tabValue === 2 
                      ? 'linear-gradient(135deg, #6bc1e1, #55b3d9)' 
                      : 'rgba(255, 255, 255, 0.12)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(85, 179, 217, 0.25)'
                  }
                }}
              >
                İstatistikler
              </Button>
            </Box>
          </motion.div>

          {/* Tab Content */}
          {tabValue === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {/* Multi-step Form */}
              <Paper sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                p: { xs: 3, md: 5 },
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.24)'
              }}>
                {/* Stepper */}
                <Box sx={{ mb: 4 }}>
                  <ModernStepper activeStep={activeStep} steps={steps} />
                </Box>

                {/* Step Content */}
                <Box sx={{ minHeight: '400px' }}>
                  {getStepContent(activeStep)}
                </Box>

                {/* Navigation Buttons */}
                {activeStep < steps.length && (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Button
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      startIcon={<NavigateBeforeIcon />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: '16px',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.15)',
                          color: '#ffffff',
                          transform: 'translateY(-2px)'
                        },
                        '&:disabled': {
                          opacity: 0.5,
                          transform: 'none'
                        }
                      }}
                    >
                      Geri
                    </Button>

                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<NavigateNextIcon />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: '16px',
                        fontWeight: 700,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #4a6cf7 0%, #667eea 100%)',
                        color: '#ffffff',
                        fontSize: '1rem',
                        boxShadow: '0 8px 25px rgba(74, 108, 247, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 30px rgba(74, 108, 247, 0.4)'
                        }
                      }}
                    >
                      {activeStep === steps.length - 1 ? 'Kaydet' : 'İleri'}
                    </Button>
                  </Box>
                )}

                {/* Completion Message */}
                {activeStep >= steps.length && (
                  <Box sx={{
                    textAlign: 'center',
                    py: 6
                  }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      boxShadow: '0 10px 30px rgba(67, 233, 123, 0.4)'
                    }}>
                      <CheckCircleIcon sx={{ color: '#ffffff', fontSize: '2.5rem' }} />
                    </Box>
                    
                    <Typography variant="h4" sx={{
                      fontWeight: 800,
                      color: '#ffffff',
                      mb: 2
                    }}>
                      Deneme Kaydedildi!
                    </Typography>
                    
                    <Typography variant="body1" sx={{
                      color: 'rgba(255,255,255,0.8)',
                      mb: 4,
                      maxWidth: '500px',
                      mx: 'auto',
                      lineHeight: 1.6
                    }}>
                      Deneme sonuçlarınız başarıyla kaydedildi. Şimdi &quot;Kayıtlı Denemeler&quot; veya &quot;İstatistikler&quot; sekmesinden performansınızı inceleyebilirsiniz.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Button
                        onClick={() => {
                          setActiveStep(0);
                          setTabValue(1);
                        }}
                        variant="contained"
                        startIcon={<ViewListIcon />}
                        sx={{
                          px: 3,
                          py: 1.5,
                          borderRadius: '16px',
                          fontWeight: 600,
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #55b3d9, #4a9cc7)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #6bc1e1, #55b3d9)'
                          }
                        }}
                      >
                        Kayıtları Görüntüle
                      </Button>
                      
                      <Button
                        onClick={() => {
                          setActiveStep(0);
                          setTabValue(2);
                        }}
                        variant="contained"
                        startIcon={<BarChartIcon />}
                        sx={{
                          px: 3,
                          py: 1.5,
                          borderRadius: '16px',
                          fontWeight: 600,
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)'
                          }
                        }}
                      >
                        İstatistikleri Gör
                      </Button>
                      
                      <Button
                        onClick={() => setActiveStep(0)}
                        variant="outlined"
                        startIcon={<AddIcon />}
                        sx={{
                          px: 3,
                          py: 1.5,
                          borderRadius: '16px',
                          fontWeight: 600,
                          textTransform: 'none',
                          color: '#ffffff',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          '&:hover': {
                            borderColor: '#ffffff',
                            background: 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      >
                        Yeni Deneme Ekle
                      </Button>
                    </Box>
                  </Box>
                )}
              </Paper>
            </motion.div>
          )}

          {tabValue === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Paper sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                p: { xs: 3, md: 5 },
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.24)'
              }}>
                <Typography variant="h5" sx={{
                  fontWeight: 700,
                  color: '#ffffff',
                  mb: 3,
                  textAlign: 'center'
                }}>
                  Kayıtlı Denemeler ({netRecords.length})
                </Typography>

                {netRecords.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                      Henüz deneme kaydınız bulunmamaktadır
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      İlk denemenizi eklemek için &quot;Yeni Deneme Ekle&quot; sekmesini kullanın
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>Deneme Adı</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>Tarih</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>Tür</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>Toplam Net</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#ffffff' }}>İşlemler</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {netRecords.map((record) => {
                          const totalNet = Object.values(record.subjects || {})
                            .reduce((sum, subject) => sum + parseFloat(subject.net || 0), 0);
                          
                          return (
                            <TableRow key={record.id}>
                              <TableCell sx={{ color: '#ffffff' }}>{record.examName}</TableCell>
                              <TableCell sx={{ color: '#ffffff' }}>
                                {record.examDate?.toDate ? 
                                  format(record.examDate.toDate(), 'dd/MM/yyyy', { locale: trLocale }) : 
                                  'Tarih yok'
                                }
                              </TableCell>
                              <TableCell sx={{ color: '#ffffff' }}>{record.examType}</TableCell>
                              <TableCell sx={{ color: '#4CAF50', fontWeight: 600 }}>
                                {totalNet.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  onClick={() => handleDelete(record.id)}
                                  sx={{ color: '#f44336' }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </motion.div>
          )}

          {tabValue === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {netRecords.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Modern Header with Exam Type Selector */}
              <Paper sx={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                    backdropFilter: 'blur(25px)',
                borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    p: 4,
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: selectedExamType === 'TYT' 
                        ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
                      zIndex: 1
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '16px',
                          background: selectedExamType === 'TYT' 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: selectedExamType === 'TYT'
                            ? '0 8px 25px rgba(102, 126, 234, 0.4)'
                            : '0 8px 25px rgba(240, 147, 251, 0.4)',
                          transition: 'all 0.3s ease'
                        }}>
                          <ShowChartIcon sx={{ fontSize: 32, color: '#ffffff' }} />
                        </Box>
                        <Box>
                          <Typography variant="h4" sx={{
                            fontWeight: 900,
                  color: '#ffffff',
                            fontSize: { xs: '1.8rem', md: '2.2rem' },
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-1px'
                          }}>
                            📊 Performans Analizi
                </Typography>
                          <Typography variant="body1" sx={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '1.1rem',
                            mt: 0.5
                          }}>
                            Detaylı gelişim takibi ve akıllı öneriler
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant={selectedExamType === 'TYT' ? 'contained' : 'outlined'}
                          onClick={() => setSelectedExamType('TYT')}
                          sx={{
                            borderRadius: '16px',
                            px: 3,
                            py: 1.5,
                            fontWeight: 700,
                            fontSize: '1rem',
                            background: selectedExamType === 'TYT' 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'transparent',
                            color: selectedExamType === 'TYT' ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                            border: selectedExamType === 'TYT' ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: selectedExamType === 'TYT' 
                              ? '0 8px 25px rgba(102, 126, 234, 0.4)'
                              : 'none',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: selectedExamType === 'TYT' 
                                ? '0 12px 35px rgba(102, 126, 234, 0.5)'
                                : '0 8px 25px rgba(255, 255, 255, 0.1)',
                              background: selectedExamType === 'TYT' 
                                ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                                : 'rgba(255, 255, 255, 0.05)'
                            }
                          }}
                        >
                          🎯 TYT
                        </Button>
                        <Button
                          variant={selectedExamType === 'AYT' ? 'contained' : 'outlined'}
                          onClick={() => setSelectedExamType('AYT')}
                          sx={{
                            borderRadius: '16px',
                            px: 3,
                            py: 1.5,
                            fontWeight: 700,
                            fontSize: '1rem',
                            background: selectedExamType === 'AYT' 
                              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                              : 'transparent',
                            color: selectedExamType === 'AYT' ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                            border: selectedExamType === 'AYT' ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: selectedExamType === 'AYT' 
                              ? '0 8px 25px rgba(240, 147, 251, 0.4)'
                              : 'none',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: selectedExamType === 'AYT' 
                                ? '0 12px 35px rgba(240, 147, 251, 0.5)'
                                : '0 8px 25px rgba(255, 255, 255, 0.1)',
                              background: selectedExamType === 'AYT' 
                                ? 'linear-gradient(135deg, #e885f0 0%, #e84a5f 100%)'
                                : 'rgba(255, 255, 255, 0.05)'
                            }
                          }}
                        >
                          🚀 AYT
                        </Button>
                    </Box>
                    </Box>
                  </Paper>

                  {/* Statistics Cards Grid */}
                  <Grid container spacing={3}>
                    {/* Average Net Score Card */}
                    <Grid item xs={12} md={4}>
                      <Paper sx={{
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(129, 199, 132, 0.1) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        p: 3,
                        height: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 30px rgba(76, 175, 80, 0.15)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 15px 45px rgba(76, 175, 80, 0.25)'
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -50,
                          right: -50,
                          width: 100,
                          height: 100,
                          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), transparent)',
                          borderRadius: '50%',
                          zIndex: 0
                        }
                      }}>
                        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ 
                            color: '#4caf50', 
                            fontWeight: 700, 
                            mb: 1,
                            fontSize: '0.95rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}>
                            📈 Ortalama Net
                      </Typography>
                          <Typography variant="h3" sx={{ 
                            color: '#ffffff', 
                            fontWeight: 900,
                            fontSize: '2.5rem',
                            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                          }}>
                            {(() => {
                              const filteredRecords = netRecords.filter(record => record.examType === selectedExamType);
                              if (filteredRecords.length === 0) return '0.0';
                              const totalNet = filteredRecords.reduce((sum, record) => {
                                const subjects = selectedExamType === 'TYT' ? tytSubjects : aytSubjects;
                                const recordNet = subjects.reduce((subSum, subject) => {
                                  if (record.subjects && record.subjects[subject]) {
                                    return subSum + parseFloat(record.subjects[subject].net);
                                  }
                                  return subSum;
                                }, 0);
                                return sum + recordNet;
                              }, 0);
                              return (totalNet / filteredRecords.length).toFixed(1);
                            })()}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontWeight: 500
                          }}>
                            Son {netRecords.filter(record => record.examType === selectedExamType).length} denemede
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Best Performance Card */}
                    <Grid item xs={12} md={4}>
                      <Paper sx={{
                        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 224, 130, 0.1) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 193, 7, 0.2)',
                        p: 3,
                        height: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 30px rgba(255, 193, 7, 0.15)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 15px 45px rgba(255, 193, 7, 0.25)'
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -50,
                          right: -50,
                          width: 100,
                          height: 100,
                          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), transparent)',
                          borderRadius: '50%',
                          zIndex: 0
                        }
                      }}>
                        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ 
                            color: '#ffc107', 
                            fontWeight: 700, 
                            mb: 1,
                            fontSize: '0.95rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}>
                            🏆 En İyi Performans
                          </Typography>
                          <Typography variant="h3" sx={{ 
                            color: '#ffffff', 
                            fontWeight: 900,
                            fontSize: '2.5rem',
                            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                          }}>
                            {(() => {
                              const filteredRecords = netRecords.filter(record => record.examType === selectedExamType);
                              if (filteredRecords.length === 0) return '0.0';
                              const bestNet = Math.max(...filteredRecords.map(record => {
                                const subjects = selectedExamType === 'TYT' ? tytSubjects : aytSubjects;
                                return subjects.reduce((sum, subject) => {
                                  if (record.subjects && record.subjects[subject]) {
                                    return sum + parseFloat(record.subjects[subject].net);
                                  }
                                  return sum;
                                }, 0);
                              }));
                              return bestNet.toFixed(1);
                            })()}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontWeight: 500
                          }}>
                            Toplam net skorun
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Total Exams Card */}
                    <Grid item xs={12} md={4}>
                      <Paper sx={{
                        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(100, 181, 246, 0.1) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(33, 150, 243, 0.2)',
                        p: 3,
                        height: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 30px rgba(33, 150, 243, 0.15)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 15px 45px rgba(33, 150, 243, 0.25)'
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -50,
                          right: -50,
                          width: 100,
                          height: 100,
                          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), transparent)',
                          borderRadius: '50%',
                          zIndex: 0
                        }
                      }}>
                        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ 
                            color: '#2196f3', 
                            fontWeight: 700, 
                            mb: 1,
                            fontSize: '0.95rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}>
                            📚 Toplam Deneme
                          </Typography>
                          <Typography variant="h3" sx={{ 
                            color: '#ffffff', 
                            fontWeight: 900,
                            fontSize: '2.5rem',
                            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                          }}>
                            {netRecords.filter(record => record.examType === selectedExamType).length}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontWeight: 500
                          }}>
                            {selectedExamType} denemesi çözüldü
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Modern Chart Section */}
                  <Paper sx={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                    backdropFilter: 'blur(25px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    p: 4,
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 3,
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                      }}>
                        <TrendingUpIcon sx={{ fontSize: 28, color: '#ffffff' }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{
                          fontWeight: 800,
                          color: '#ffffff',
                          fontSize: { xs: '1.5rem', md: '1.8rem' },
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          📊 Gelişim Grafiği
                        </Typography>
                        <Typography variant="body1" sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '1rem'
                        }}>
                          Zaman içindeki net skorlarınızın değişimi
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                      width: '100%', 
                      height: 450, 
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      p: 2,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={calculateTimeProgress()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                          <defs>
                            {(selectedExamType === 'TYT' ? tytSubjects : aytSubjects).map((subject, index) => (
                              <linearGradient key={subject} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={getSubjectColor(subject)} stopOpacity={0.8}/>
                                <stop offset="100%" stopColor={getSubjectColor(subject)} stopOpacity={0.2}/>
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="date" 
                            stroke="rgba(255, 255, 255, 0.7)"
                            fontSize={12}
                            fontWeight={600}
                          />
                          <YAxis 
                            stroke="rgba(255, 255, 255, 0.7)"
                            fontSize={12}
                            fontWeight={600}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.9)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '12px',
                              backdropFilter: 'blur(20px)',
                              color: '#ffffff',
                              fontWeight: 600
                            }}
                          />
                          <Legend 
                            wrapperStyle={{
                              color: '#ffffff',
                              fontWeight: 600
                            }}
                          />
                          {(selectedExamType === 'TYT' ? tytSubjects : aytSubjects).map((subject, index) => (
                              <Line 
                                key={subject}
                                type="monotone" 
                                dataKey={subject} 
                                stroke={getSubjectColor(subject)} 
                              strokeWidth={3}
                              dot={{ 
                                r: 6, 
                                fill: getSubjectColor(subject), 
                                strokeWidth: 3, 
                                stroke: '#ffffff',
                                filter: `drop-shadow(0 2px 4px ${getSubjectColor(subject)}40)`
                              }}
                              activeDot={{ 
                                r: 10, 
                                fill: getSubjectColor(subject), 
                                strokeWidth: 4, 
                                stroke: '#ffffff',
                                filter: `drop-shadow(0 4px 8px ${getSubjectColor(subject)}60)`
                              }}
                              connectNulls={false}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                  </Paper>
                  
                  {/* Enhanced Recommendations Section */}
                  <Paper sx={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                    backdropFilter: 'blur(25px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    p: 4,
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 3,
                        boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)'
                      }}>
                        <AssignmentIcon sx={{ fontSize: 28, color: '#ffffff' }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{
                          fontWeight: 800,
                          color: '#ffffff',
                          fontSize: { xs: '1.5rem', md: '1.8rem' },
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          🤖 Akıllı Öneriler
                      </Typography>
                        <Typography variant="body1" sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '1rem'
                        }}>
                          Performansınıza özel gelişim tavsiyeleri
                        </Typography>
                      </Box>
                    </Box>
                    
                                         <Grid container spacing={3}>
                       {generateRecommendations().length > 0 ? generateRecommendations().map((recommendation, index) => (
                         <Grid item xs={12} md={6} key={index}>
                           <Paper sx={{ 
                             p: 4, 
                             borderRadius: '24px',
                             background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                             border: `2px solid ${recommendation.color}40`,
                             transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                             position: 'relative',
                             overflow: 'hidden',
                             minHeight: 280,
                            '&:hover': {
                               transform: 'translateY(-8px) scale(1.02)',
                               boxShadow: `0 20px 40px ${recommendation.color}30`,
                               border: `2px solid ${recommendation.color}60`
                             },
                             '&::before': {
                               content: '""',
                               position: 'absolute',
                               top: 0,
                               left: 0,
                               right: 0,
                               height: '4px',
                               background: `linear-gradient(90deg, ${recommendation.color}, ${recommendation.color}80)`,
                               zIndex: 1
                             }
                           }}>
                             <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                               {/* Header with icon and title */}
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                              <Box sx={{ 
                                   width: 60, 
                                   height: 60, 
                                   borderRadius: '18px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                background: `linear-gradient(135deg, ${recommendation.color}, ${recommendation.color}cc)`,
                                color: 'white',
                                   boxShadow: `0 8px 25px ${recommendation.color}40`,
                                   flexShrink: 0,
                                   position: 'relative',
                                   '&::before': {
                                     content: '""',
                                     position: 'absolute',
                                     inset: -2,
                                     borderRadius: '20px',
                                     background: `linear-gradient(135deg, ${recommendation.color}60, transparent, ${recommendation.color}40)`,
                                     zIndex: -1,
                                     opacity: 0,
                                     transition: 'opacity 0.3s ease'
                                   },
                                   '&:hover::before': {
                                     opacity: 1
                                   }
                              }}>
                                {recommendation.icon}
                              </Box>
                                 <Box sx={{ flex: 1 }}>
                                   <Typography variant="h6" sx={{ 
                                     fontWeight: 800, 
                                color: recommendation.color,
                                     fontSize: '1.3rem',
                                     textShadow: `0 2px 8px ${recommendation.color}40`,
                                     lineHeight: 1.2
                                   }}>
                                     {recommendation.actionTitle}
                                   </Typography>
                                   <Typography variant="body2" sx={{ 
                                     color: 'rgba(255, 255, 255, 0.7)',
                                     fontSize: '0.9rem',
                                     fontWeight: 600,
                                     mt: 0.5
                              }}>
                                {recommendation.subject}
                              </Typography>
                            </Box>
                               </Box>

                               {/* Performance comparison */}
                               <Box sx={{ 
                                 background: 'rgba(255, 255, 255, 0.08)',
                                 borderRadius: '16px',
                                 p: 2.5,
                                 mb: 3,
                                 border: '1px solid rgba(255, 255, 255, 0.1)'
                               }}>
                                 <Typography variant="body2" sx={{ 
                              color: 'rgba(255, 255, 255, 0.8)',
                                   mb: 1.5,
                                   fontWeight: 600,
                                   fontSize: '0.9rem'
                                 }}>
                                   📊 Performans Karşılaştırması
                                 </Typography>
                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                   <Box sx={{ textAlign: 'center', flex: 1 }}>
                                     <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                                       Önceki Deneme
                                     </Typography>
                                     <Typography variant="h6" sx={{ 
                                       color: '#ffffff', 
                                       fontWeight: 700,
                                       fontSize: '1.1rem'
                                     }}>
                                       {recommendation.previousNet} net
                                     </Typography>
                                     <Typography variant="caption" sx={{ 
                                       color: 'rgba(255, 255, 255, 0.5)',
                                       fontSize: '0.75rem'
                                     }}>
                                       D:{recommendation.previousCorrect} Y:{recommendation.previousIncorrect}
                                     </Typography>
                                   </Box>
                                   
                                   <Box sx={{ 
                                     display: 'flex', 
                                     alignItems: 'center',
                                     px: 1
                                   }}>
                                     <Box sx={{
                                       width: 40,
                                       height: 2,
                                       background: parseFloat(recommendation.change) > 0 
                                         ? 'linear-gradient(90deg, #4caf50, #81c784)' 
                                         : parseFloat(recommendation.change) < 0
                                         ? 'linear-gradient(90deg, #f44336, #e57373)'
                                         : 'linear-gradient(90deg, #ff9800, #ffb74d)',
                                       borderRadius: '1px',
                                       position: 'relative',
                                       '&::after': {
                                         content: parseFloat(recommendation.change) > 0 ? '"→"' : parseFloat(recommendation.change) < 0 ? '"→"' : '"→"',
                                         position: 'absolute',
                                         right: -8,
                                         top: -8,
                                         fontSize: '12px',
                                         color: parseFloat(recommendation.change) > 0 ? '#4caf50' : parseFloat(recommendation.change) < 0 ? '#f44336' : '#ff9800'
                                       }
                                     }} />
                                   </Box>
                                   
                                   <Box sx={{ textAlign: 'center', flex: 1 }}>
                                     <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                                       Son Deneme
                                     </Typography>
                                     <Typography variant="h6" sx={{ 
                                       color: '#ffffff', 
                                       fontWeight: 700,
                                       fontSize: '1.1rem'
                                     }}>
                                       {recommendation.lastNet} net
                                     </Typography>
                                     <Typography variant="caption" sx={{ 
                                       color: 'rgba(255, 255, 255, 0.5)',
                                       fontSize: '0.75rem'
                                     }}>
                                       D:{recommendation.lastCorrect} Y:{recommendation.lastIncorrect}
                                     </Typography>
                                   </Box>
                                 </Box>
                                 
                                 {/* Change indicator */}
                                 <Box sx={{ 
                                   mt: 2, 
                                   textAlign: 'center',
                                   p: 1,
                                   borderRadius: '12px',
                                   background: parseFloat(recommendation.change) > 0 
                                     ? 'rgba(76, 175, 80, 0.15)' 
                                     : parseFloat(recommendation.change) < 0
                                     ? 'rgba(244, 67, 54, 0.15)'
                                     : 'rgba(255, 152, 0, 0.15)'
                                 }}>
                                   <Typography variant="body2" sx={{ 
                                     color: parseFloat(recommendation.change) > 0 ? '#4caf50' : parseFloat(recommendation.change) < 0 ? '#f44336' : '#ff9800',
                                     fontWeight: 700,
                                     fontSize: '0.9rem'
                                   }}>
                                     {parseFloat(recommendation.change) > 0 ? '+' : ''}{recommendation.change} net değişim
                                   </Typography>
                                 </Box>
                               </Box>

                               {/* Detailed message */}
                               <Typography variant="body1" sx={{ 
                                 color: 'rgba(255, 255, 255, 0.9)',
                                 lineHeight: 1.7,
                                 fontSize: '0.95rem',
                                 fontWeight: 500,
                                 flex: 1
                            }}>
                              {recommendation.message}
                            </Typography>
                      </Box>
                           </Paper>
                         </Grid>
                      )) : (
                        <Grid item xs={12}>
                          <Box sx={{
                            textAlign: 'center',
                            p: 6,
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '20px',
                            border: '2px dashed rgba(255, 255, 255, 0.2)'
                          }}>
                            <Typography variant="h6" sx={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontWeight: 600,
                              mb: 2
                            }}>
                              🔄 Öneriler Hazırlanıyor
                            </Typography>
                            <Typography variant="body1" sx={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '1rem'
                            }}>
                              Kişiselleştirilmiş öneriler için en az 2 deneme sonucu ekleyin
                            </Typography>
                    </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Box>
              ) : (
                <Paper sx={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                  backdropFilter: 'blur(25px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  p: 6,
                  textAlign: 'center',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
                }}>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3
                  }}>
                    <Box sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(96, 125, 139, 0.2) 0%, rgba(96, 125, 139, 0.1) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px dashed rgba(255, 255, 255, 0.3)'
                    }}>
                      <BarChartIcon sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.5)' }} />
                    </Box>
                    <Typography variant="h5" sx={{
                      color: '#ffffff',
                      fontWeight: 700,
                      mb: 1
                    }}>
                      📊 İstatistik Verisi Bulunamadı
                    </Typography>
                    <Typography variant="body1" sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '1.1rem',
                      maxWidth: 400,
                      lineHeight: 1.6
                    }}>
                      İstatistikleri görüntülemek için önce bir deneme sonucu ekleyin. 
                      Performans analizi için en az bir deneme gereklidir.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setTabValue(0)}
                      sx={{
                        mt: 2,
                        borderRadius: '16px',
                        px: 4,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)'
                        }
                      }}
                    >
                      ➕ İlk Denemeyi Ekle
                    </Button>
                  </Box>
              </Paper>
              )}
            </motion.div>
          )}

          {/* Notification */}
          <Snackbar 
            open={notification.open} 
            autoHideDuration={6000} 
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleCloseNotification} 
              severity={notification.severity} 
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Container>
      </motion.div>
    </Box>
  );
};

export default TytAytNetTakibi;
