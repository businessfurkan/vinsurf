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
import { useMediaQuery, useTheme } from '@mui/material';

// Import ModernStepper component
import ModernStepper from '../components/ModernStepper';

// Import CSS
import '../styles/tyt-ayt-modern.css';

// Material UI components
import {
  Container, Box, Typography, Button, TextField, Grid, Paper,
  Select, MenuItem, FormControl, InputLabel, Card, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Chip, Snackbar, Alert
} from '@mui/material';

// Recharts components
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
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
  Close as CloseIcon,
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

const StyledButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: '30px',
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
  letterSpacing: '0.5px',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  ...(variant === 'contained' && {
    background: 'linear-gradient(45deg, var(--primary-color), var(--primary-light))',
    color: 'white',
    border: 'none',
    '&:hover': {
      background: 'linear-gradient(45deg, var(--primary-dark), var(--primary-color))',
      boxShadow: '0 4px 15px rgba(74, 108, 247, 0.4)'
    }
  }),
  ...(variant === 'outlined' && {
    background: 'transparent',
    color: 'var(--primary-color)',
    border: '2px solid var(--primary-color)',
    '&:hover': {
      background: 'rgba(74, 108, 247, 0.1)'
    }
  })
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
  const [selectedSubject, setSelectedSubject] = useState('');
  
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
      if (Object.keys(subjectData).length === 0) {
        setNotification({
          open: true,
          message: 'En az bir ders eklemelisiniz',
          severity: 'error'
        });
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    
    if (!isValid) {
      return;
    }
    
    // If we're on the subject selection step and a subject is selected
    if (activeStep === 3 && currentSubject) {
      // Save current subject data
      if (correctCount || incorrectCount || emptyCount) {
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
      }
      
      // Clear form for next subject
      setCurrentSubject('');
      setCorrectCount('');
      setIncorrectCount('');
      setEmptyCount('');
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

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Render step content based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Deneme Adı
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
              Deneme Adı
            </Typography>
            <StyledTextField
              fullWidth
              label="Deneme Adı"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              error={!!errors.examName}
              helperText={errors.examName}
              placeholder="Örn: TYT Deneme 1"
              InputProps={{
                startAdornment: (
                  <AssignmentIcon sx={{ color: 'var(--primary-color)', mr: 1 }} />
                ),
              }}
            />
          </Box>
        );
      case 1: // Tarih
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
              Deneme Tarihi
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
              <DatePicker
                label="Deneme Tarihi"
                value={examDate}
                onChange={(newValue) => setExamDate(newValue)}
                renderInput={(params) => <StyledTextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Box>
        );
      case 2: // Sınav Türü
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
              Sınav Türü
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Sınav Türü</InputLabel>
              <Select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                label="Sınav Türü"
              >
                <MenuItem value="TYT">TYT</MenuItem>
                <MenuItem value="AYT">AYT</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 3: // Ders Bilgileri
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
              Ders Bilgileri
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Dersler
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto', pr: 1 }}>
                  {(examType === 'TYT' ? tytSubjects : aytSubjects).map((subject) => (
                    <Card 
                      key={subject}
                      className={`subject-card ${examType === 'TYT' ? 'tyt' : 'ayt'} ${currentSubject === subject ? 'active' : ''}`}
                      onClick={() => handleSubjectSelect(subject)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {subject}
                        </Typography>
                        {subjectData[subject] && (
                          <Chip 
                            label={`Net: ${subjectData[subject].net}`}
                            size="small"
                            sx={{ 
                              bgcolor: 'rgba(255, 255, 255, 0.2)', 
                              color: 'white',
                              fontWeight: 600
                            }} 
                          />
                        )}
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  {currentSubject ? `${currentSubject} Bilgileri` : 'Ders Seçin'}
                </Typography>
                
                {currentSubject ? (
                  <Box className="modern-card" sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <StyledTextField
                          fullWidth
                          label="Doğru Sayısı"
                          type="number"
                          value={correctCount}
                          onChange={(e) => setCorrectCount(e.target.value)}
                          InputProps={{
                            inputProps: { min: 0 }
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
                          InputProps={{
                            inputProps: { min: 0 }
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
                          InputProps={{
                            inputProps: { min: 0 }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Net: {calculateNet(correctCount, incorrectCount)}
                          </Typography>
                          <StyledButton 
                            variant="contained" 
                            onClick={handleNext}
                            startIcon={<AddIcon />}
                          >
                            Dersi Ekle
                          </StyledButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Box className="modern-card" sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      Lütfen sol taraftan bir ders seçin.
                    </Typography>
                  </Box>
                )}
                
                {Object.keys(subjectData).length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Eklenen Dersler
                    </Typography>
                    <TableContainer component={Paper} className="modern-card">
                      <Table className="modern-table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Ders</TableCell>
                            <TableCell align="center">Doğru</TableCell>
                            <TableCell align="center">Yanlış</TableCell>
                            <TableCell align="center">Boş</TableCell>
                            <TableCell align="center">Net</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(subjectData).map(([subject, data]) => (
                            <TableRow key={subject}>
                              <TableCell component="th" scope="row" sx={{ fontWeight: 800, fontSize: '1rem' }}>
                                {subject}
                              </TableCell>
                              <TableCell align="center">{data.correctCount}</TableCell>
                              <TableCell align="center">{data.incorrectCount}</TableCell>
                              <TableCell align="center">{data.emptyCount}</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>{data.net}</TableCell>
                              <TableCell align="right">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleSubjectSelect(subject)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => {
                                    const newData = { ...subjectData };
                                    delete newData[subject];
                                    setSubjectData(newData);
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
                )}
              </Grid>
            </Grid>
          </Box>
        );
      case 4: // Özet
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
              Deneme Özeti
            </Typography>
            
            <Box className="summary-info">
              <Box className="summary-item name">
                <Typography variant="subtitle2">Deneme Adı</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{examName}</Typography>
              </Box>
              
              <Box className="summary-item date">
                <Typography variant="subtitle2">Tarih</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {format(examDate, 'dd MMMM yyyy', { locale: trLocale })}
                </Typography>
              </Box>
              
              <Box className="summary-item type">
                <Typography variant="subtitle2">Sınav Türü</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{examType}</Typography>
              </Box>
            </Box>
            
            <Box className="summary-card">
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                Dersler
              </Typography>
              
              <TableContainer>
                <Table className="modern-table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, fontSize: '1rem' }}>Ders</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, fontSize: '1rem' }}>Doğru</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, fontSize: '1rem' }}>Yanlış</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, fontSize: '1rem' }}>Boş</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, fontSize: '1rem' }}>Net</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(subjectData).map(([subject, data]) => (
                      <TableRow key={subject}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 800, fontSize: '1rem' }}>
                          {subject}
                        </TableCell>
                        <TableCell align="center">{data.correctCount}</TableCell>
                        <TableCell align="center">{data.incorrectCount}</TableCell>
                        <TableCell align="center">{data.emptyCount}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>{data.net}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  // Not: renderRecordsList fonksiyonu artık kullanılmıyor, yeni tasarım için kaldırıldı

  // İstatistik yardımcı fonksiyonları
  // En yüksek net yapılan dersi hesapla
  const calculateHighestNetSubject = () => {
    const subjects = selectedExamType === 'TYT' ? tytSubjects : aytSubjects;
    const filteredRecords = netRecords.filter(record => record.examType === selectedExamType);
    
    if (filteredRecords.length === 0) return 'Veri yok';
    
    let highestSubject = '';
    let highestNet = 0;
    
    subjects.forEach(subject => {
      const subjectNets = filteredRecords
        .filter(record => record.subjects && record.subjects[subject])
        .map(record => parseFloat(record.subjects[subject].net));
      
      if (subjectNets.length > 0) {
        const maxNet = Math.max(...subjectNets);
        if (maxNet > highestNet) {
          highestNet = maxNet;
          highestSubject = subject;
        }
      }
    });
    
    return highestSubject ? `${highestSubject}: ${highestNet.toFixed(2)}` : 'Veri yok';
  };
  
  // Gelişim durumunu hesapla
  const calculateGrowthStatus = () => {
    const subjects = selectedExamType === 'TYT' ? tytSubjects : aytSubjects;
    const filteredRecords = netRecords.filter(record => record.examType === selectedExamType);
    
    if (filteredRecords.length < 2) {
      return (
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Yetersiz veri
        </Typography>
      );
    }
    
    // Tüm dersler için ortalama net değişimini hesapla
    let totalGrowth = 0;
    let validSubjectCount = 0;
    
    subjects.forEach(subject => {
      const subjectRecords = filteredRecords.filter(record => 
        record.subjects && record.subjects[subject]
      );
      
      if (subjectRecords.length >= 2) {
        // Tarihe göre sırala
        const sortedRecords = [...subjectRecords].sort((a, b) => {
          try {
            if (a.examDate && a.examDate.toDate && b.examDate && b.examDate.toDate) {
              return b.examDate.toDate() - a.examDate.toDate();
            }
            return 0;
          } catch (error) {
            return 0;
          }
        });
        
        // Son iki denemenin netlerini al
        const lastNet = parseFloat(sortedRecords[0].subjects[subject].net);
        const prevNet = parseFloat(sortedRecords[1].subjects[subject].net);
        
        // Değişim yüzdesini hesapla
        const change = lastNet - prevNet;
        const changePercent = prevNet !== 0 ? (change / prevNet) * 100 : 0;
        
        totalGrowth += changePercent;
        validSubjectCount++;
      }
    });
    
    // Ortalama gelişim yüzdesi
    const avgGrowth = validSubjectCount > 0 ? totalGrowth / validSubjectCount : 0;
    
    // Gelişim durumunu görsel olarak göster
    if (avgGrowth > 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingUpIcon sx={{ color: '#2ecc71', mr: 1, fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#2ecc71' }}>
            Yükseliyor ({avgGrowth.toFixed(2)}%)
          </Typography>
        </Box>
      );
    } else if (avgGrowth < 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingDownIcon sx={{ color: '#e74c3c', mr: 1, fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#e74c3c' }}>
            Düşüş ({Math.abs(avgGrowth).toFixed(2)}%)
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingFlatIcon sx={{ color: '#f39c12', mr: 1, fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f39c12' }}>
            Stabil (0.00%)
          </Typography>
        </Box>
      );
    }
  };
  
  // Belirli bir dersin gelişim durumunu hesapla
  const calculateSubjectGrowthStatus = (subject) => {
    const filteredRecords = netRecords.filter(record => 
      record.examType === selectedExamType && 
      record.subjects && 
      record.subjects[subject]
    );
    
    if (filteredRecords.length < 2) {
      return (
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Veri yok
        </Typography>
      );
    }
    
    // Tarihe göre sırala (en yeniden en eskiye)
    const sortedRecords = [...filteredRecords].sort((a, b) => {
      try {
        if (a.examDate && a.examDate.toDate && b.examDate && b.examDate.toDate) {
          return b.examDate.toDate() - a.examDate.toDate();
        }
        return 0;
      } catch (error) {
        console.error('Date sorting error:', error);
        return 0;
      }
    });
    
    // Son iki denemenin netlerini al
    const lastNet = parseFloat(sortedRecords[0].subjects[subject].net);
    const prevNet = parseFloat(sortedRecords[1].subjects[subject].net);
    
    // Değişim yüzdesini hesapla
    const change = lastNet - prevNet;
    const changePercent = prevNet !== 0 ? (change / prevNet) * 100 : 0;
    
    // Gelişim durumunu görsel olarak göster
    if (change > 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingUpIcon sx={{ color: '#2ecc71', mr: 1, fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#2ecc71' }}>
            Yükseliyor ({changePercent.toFixed(2)}%)
          </Typography>
        </Box>
      );
    } else if (change < 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingDownIcon sx={{ color: '#e74c3c', mr: 1, fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#e74c3c' }}>
            Düşüş ({Math.abs(changePercent).toFixed(2)}%)
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingFlatIcon sx={{ color: '#f39c12', mr: 1, fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f39c12' }}>
            Stabil (0.00%)
          </Typography>
        </Box>
      );
    }
  };
  
  // Ders bazlı ortalama netleri hesapla
  const calculateSubjectAverages = () => {
    const subjects = selectedExamType === 'TYT' ? tytSubjects : aytSubjects;
    const filteredRecords = netRecords.filter(record => record.examType === selectedExamType);
    
    if (filteredRecords.length === 0) return [];
    
    const result = [];
    
    subjects.forEach(subject => {
      const subjectNets = filteredRecords
        .filter(record => record.subjects && record.subjects[subject])
        .map(record => parseFloat(record.subjects[subject].net));
      
      if (subjectNets.length > 0) {
        const average = subjectNets.reduce((a, b) => a + b, 0) / subjectNets.length;
        result.push({
          subject,
          average
        });
      }
    });
    
    return result;
  };
  
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
  const getSubjectColor = (index) => {
    const colors = [
      '#4a6cf7', '#9b59b6', '#e74c3c', '#f39c12', '#27ae60', 
      '#16a085', '#2980b9', '#8e44ad', '#c0392b', '#d35400'
    ];
    return colors[index % colors.length];
  };
  
  // Tavsiyeler oluştur
  const generateRecommendations = () => {
    const subjects = selectedExamType === 'TYT' ? tytSubjects : aytSubjects;
    const filteredRecords = netRecords.filter(record => record.examType === selectedExamType);
    
    if (filteredRecords.length < 2) return [];
    
    const recommendations = [];
    
    subjects.forEach((subject, index) => {
      const subjectRecords = filteredRecords
        .filter(record => record.subjects && record.subjects[subject])
        .sort((a, b) => a.examDate.toDate() - b.examDate.toDate());
      
      if (subjectRecords.length >= 2) {
        const firstNet = parseFloat(subjectRecords[0].subjects[subject].net);
        const lastNet = parseFloat(subjectRecords[subjectRecords.length - 1].subjects[subject].net);
        const growth = lastNet - firstNet;
        
        let message = '';
        let icon = null;
        let color = '';
        
        if (growth > 2) {
          message = `${subject} dersinde güzel bir ilerleme kaydettiniz. Bu tempoyu koruyun!`;
          icon = <TrendingUpIcon sx={{ color: '#4caf50' }} />;
          color = '#4caf50';
        } else if (growth < -2) {
          message = `${subject} dersinde düşüş görülüyor. Daha fazla pratik yapmanızı öneririz.`;
          icon = <TrendingDownIcon sx={{ color: '#f44336' }} />;
          color = '#f44336';
        } else {
          message = `${subject} dersinde performansınız stabil. Geliştirmek için farklı soru tipleri deneyin.`;
          icon = <TrendingFlatIcon sx={{ color: '#ff9800' }} />;
          color = '#ff9800';
        }
        
        recommendations.push({
          subject,
          message,
          icon,
          color
        });
      }
    });
    
    return recommendations;
  };
  
  // Not: renderStatistics fonksiyonu artık kullanılmıyor, yeni tasarım için kaldırıldı
  
  // Render statistics function - commented out as it's not used anymore
  /*
  const renderStatistics = () => {
    // These variables would need to be defined if this function were used
    const subjects = selectedExamType === 'TYT' ? tytSubjects : aytSubjects;
    const filteredRecords = netRecords.filter(record => record.examType === selectedExamType);
    const chartData = calculateTimeProgress();
    
    // Generate random colors for chart
    const COLORS = ['#4a6cf7', '#ff6b6b', '#2ecc71', '#f39c12', '#3498db', '#9b59b6', '#1abc9c', '#e74c3c'];
    
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sınav Türü</InputLabel>
            <Select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              label="Sınav Türü"
            >
              <MenuItem value="TYT">TYT</MenuItem>
              <MenuItem value="AYT">AYT</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box className="modern-card" sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
            Net Değişim Grafiği
          </Typography>
          
          <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {subjects.map((subject, index) => (
                  <Line 
                    key={subject}
                    type="monotone"
                    dataKey={subject}
                    stroke={COLORS[index % COLORS.length]}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
        
        {selectedSubject ? (
          <Box className="modern-card" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                {selectedSubject} Detaylı Analiz
              </Typography>
              <IconButton size="small" onClick={() => setSelectedSubject('')}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={selectedSubject} fill="#4a6cf7" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        ) : (
          <Box className="modern-card" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
              Ders Bazlı Performans
            </Typography>
            
            <Grid container spacing={2}>
              {subjects.map((subject, index) => {
                // Calculate average net for this subject
                const subjectData = filteredRecords
                  .filter(record => record.subjects && record.subjects[subject])
                  .map(record => parseFloat(record.subjects[subject].net));
                
                const avgNet = subjectData.length > 0 
                  ? (subjectData.reduce((a, b) => a + b, 0) / subjectData.length).toFixed(2)
                  : 0;
                
                // Calculate trend (up or down)
                let trend = 'stable';
                if (subjectData.length >= 2) {
                  const lastNet = subjectData[0];
                  const prevNet = subjectData[1];
                  trend = lastNet > prevNet ? 'up' : lastNet < prevNet ? 'down' : 'stable';
                }
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={subject}>
                    <Card 
                      className="subject-card"
                      sx={{ 
                        cursor: 'pointer',
                        bgcolor: COLORS[index % COLORS.length],
                        color: 'white'
                      }}
                      onClick={() => setSelectedSubject(subject)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {subject}
                        </Typography>
                        {trend === 'up' ? (
                          <TrendingUpIcon sx={{ color: '#2ecc71' }} />
                        ) : trend === 'down' ? (
                          <TrendingDownIcon sx={{ color: '#e74c3c' }} />
                        ) : (
                          <TrendingFlatIcon />
                        )}
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mt: 2 }}>
                        {avgNet}
                      </Typography>
                      <Typography variant="body2">
                        Ortalama Net
                      </Typography>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Box>
    );
  };
  */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'var(--primary-color)' }}>
            TYT-AYT Net Takibi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Deneme sınavlarınızın sonuçlarını kaydedin ve performansınızı takip edin.
          </Typography>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant={isMobile ? 'fullWidth' : 'standard'}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 0,
                px: 3
              }
            }}
          >
            <Tab 
              label="Yeni Deneme Ekle" 
              icon={<AddIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Kayıtlı Denemeler" 
              icon={<ViewListIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="İstatistikler" 
              icon={<BarChartIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        {/* Tab panels */}
        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && (
            <Box>
              <ModernStepper activeStep={activeStep} />
              
              <Box sx={{ mt: 4 }}>
                {activeStep === steps.length ? (
                  /* Form submitted successfully */
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 60, color: 'var(--success-color)', mb: 2 }} />
                    <Typography variant="h5" gutterBottom sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      Deneme sonuçlarınız başarıyla kaydedildi!
                    </Typography>
                    <Button
                      onClick={() => setActiveStep(0)}
                      sx={{ 
                        mt: 3,
                        background: 'linear-gradient(135deg, #5db6d9, #4a9cc7)',
                        color: 'white',
                        fontWeight: 600,
                        padding: '10px 24px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 8px rgba(93, 182, 217, 0.25)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #72c5e4, #5db6d9)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 12px rgba(93, 182, 217, 0.3)'
                        }
                      }}
                    >
                      Yeni Deneme Ekle
                    </Button>
                  </Box>
                ) : (
                  /* Form steps */
                  <>
                    <Box className="modern-card" sx={{ p: 3, mb: 4 }}>
                      {getStepContent(activeStep)}
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mt: 4,
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? 2 : 0
                    }}>
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        startIcon={<NavigateBeforeIcon />}
                        sx={{ 
                          opacity: activeStep === 0 ? 0.5 : 1,
                          order: isMobile ? 2 : 1,
                          width: isMobile ? '100%' : 'auto',
                          background: 'linear-gradient(135deg, #55b3d9, #3498db)',
                          color: 'white',
                          fontWeight: 600,
                          padding: '10px 24px',
                          borderRadius: '12px',
                          boxShadow: '0 4px 8px rgba(53, 152, 219, 0.25)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #6bc1e1, #55b3d9)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 12px rgba(53, 152, 219, 0.3)'
                          }
                        }}
                      >
                        Geri
                      </Button>
                      
                      <Button
                        onClick={handleNext}
                        endIcon={<NavigateNextIcon />}
                        disabled={activeStep === 3 && Object.keys(subjectData).length === 0}
                        sx={{ 
                          order: isMobile ? 1 : 2,
                          width: isMobile ? '100%' : 'auto',
                          background: 'linear-gradient(135deg, #5db6d9, #4a9cc7)',
                          color: 'white',
                          fontWeight: 600,
                          padding: '10px 24px',
                          borderRadius: '12px',
                          boxShadow: '0 4px 8px rgba(93, 182, 217, 0.25)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #72c5e4, #5db6d9)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 12px rgba(93, 182, 217, 0.3)'
                          },
                          '&:disabled': {
                            background: 'linear-gradient(135deg, #a8d4e5, #8abfd0)',
                            color: '#e0e0e0',
                            boxShadow: 'none'
                          }
                        }}
                      >
                        {activeStep === steps.length - 1 ? 'Bitir' : 'İleri'}
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box>
              <Box className="modern-card" sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                    Deneme Sonuçları
                  </Typography>
                </Box>
                
                {/* TYT/AYT Seçim Butonları */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  mb: 4,
                  flexDirection: isMobile ? 'column' : 'row' 
                }}>
                  <Button
                    onClick={() => setSelectedExamType('TYT')}
                    sx={{
                      flex: 1,
                      py: 3,
                      background: selectedExamType === 'TYT' 
                        ? 'linear-gradient(135deg, #5db6d9, #4a9cc7)' 
                        : 'linear-gradient(135deg, #f5f7fa, #e4e8f0)',
                      color: selectedExamType === 'TYT' ? 'white' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      borderRadius: '16px',
                      boxShadow: selectedExamType === 'TYT' 
                        ? '0 8px 16px rgba(93, 182, 217, 0.25)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 10px 20px rgba(93, 182, 217, 0.3)'
                      }
                    }}
                  >
                    TYT Denemeleri
                  </Button>
                  
                  <Button
                    onClick={() => setSelectedExamType('AYT')}
                    sx={{
                      flex: 1,
                      py: 3,
                      background: selectedExamType === 'AYT' 
                        ? 'linear-gradient(135deg, #55b3d9, #3498db)' 
                        : 'linear-gradient(135deg, #f5f7fa, #e4e8f0)',
                      color: selectedExamType === 'AYT' ? 'white' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      borderRadius: '16px',
                      boxShadow: selectedExamType === 'AYT' 
                        ? '0 8px 16px rgba(53, 152, 219, 0.25)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 10px 20px rgba(53, 152, 219, 0.3)'
                      }
                    }}
                  >
                    AYT Denemeleri
                  </Button>
                </Box>
                
                {/* Seçilen Sınav Türüne Göre Dersler */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6' }}>
                    {selectedExamType} Dersleri
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {(selectedExamType === 'TYT' ? tytSubjects : aytSubjects).map((subject) => (
                      <Grid item xs={12} sm={6} md={4} key={subject}>
                        <Card 
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            background: selectedSubject === subject
                              ? selectedExamType === 'TYT'
                                ? 'linear-gradient(135deg, #4a6cf7, #3a56d4)'
                                : 'linear-gradient(135deg, #9b59b6, #8e44ad)'
                              : 'white',
                            color: selectedSubject === subject ? 'white' : 'var(--text-primary)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
                            }
                          }}
                          onClick={() => setSelectedSubject(subject)}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {subject}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                
                {/* Seçilen Derse Göre Sonuçlar */}
                {selectedSubject && (
                  <Box className="modern-card" sx={{ p: 3, mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6' }}>
                        {selectedSubject} Sonuçları
                      </Typography>
                      <IconButton size="small" onClick={() => setSelectedSubject('')}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                    
                    <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                      <Table>
                        <TableHead sx={{ 
                          background: selectedExamType === 'TYT' 
                            ? 'linear-gradient(135deg, #4a6cf7, #3a56d4)' 
                            : 'linear-gradient(135deg, #9b59b6, #8e44ad)' 
                        }}>
                          <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Deneme Adı</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Tarih</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Doğru</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Yanlış</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Boş</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Net</TableCell>
                            <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>İşlemler</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {netRecords
                            .filter(record => record.examType === selectedExamType && record.subjects && record.subjects[selectedSubject])
                            .map((record) => (
                              <TableRow key={record.id}>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                                  {record.examName}
                                </TableCell>
                                <TableCell align="center">
                                  {record.examDate && format(record.examDate.toDate(), 'dd MMMM yyyy', { locale: trLocale })}
                                </TableCell>
                                <TableCell align="center">{record.subjects[selectedSubject].correctCount}</TableCell>
                                <TableCell align="center">{record.subjects[selectedSubject].incorrectCount}</TableCell>
                                <TableCell align="center">{record.subjects[selectedSubject].emptyCount}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, color: selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6' }}>
                                  {record.subjects[selectedSubject].net}
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: '#4a6cf7' }}
                                    onClick={() => {
                                      // Düzenleme işlemi için gerekli state'leri ayarla
                                      setExamName(record.examName);
                                      setExamDate(record.examDate.toDate());
                                      setExamType(record.examType);
                                      setSubjectData(record.subjects);
                                      setActiveStep(0);
                                      setTabValue(0);
                                      
                                      // Bildirim göster
                                      setNotification({
                                        open: true,
                                        message: 'Deneme düzenleme moduna geçildi',
                                        severity: 'info'
                                      });
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    sx={{ color: '#e74c3c' }}
                                    onClick={() => handleDelete(record.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {/* Grafik Gösterimi */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6' }}>
                        {selectedSubject} Performans Grafiği
                      </Typography>
                      
                      <Box sx={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={netRecords
                              .filter(record => record.examType === selectedExamType && record.subjects && record.subjects[selectedSubject])
                              .map(record => ({
                                name: record.examName,
                                date: record.examDate ? format(record.examDate.toDate(), 'dd/MM', { locale: trLocale }) : '',
                                net: parseFloat(record.subjects[selectedSubject].net)
                              }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="net" 
                              name="Net"
                              stroke={selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6'} 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>
                  </Box>
                )}
                
                {/* Deneme yoksa veya ders seçilmediyse */}
                {(!selectedSubject && netRecords.length > 0) && (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Lütfen incelemek istediğiniz dersi seçin.
                    </Typography>
                  </Box>
                )}
                
                {netRecords.length === 0 && (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Henüz kaydedilmiş deneme sonucu bulunmamaktadır.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box>
              <Box className="modern-card" sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                    İstatistikler
                  </Typography>
                </Box>
                
                {/* Ders Seçim Bölümü */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                    Hangi dersin istatistiklerini görmek istersiniz?
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {(selectedExamType === 'TYT' ? tytSubjects : aytSubjects).map((subject) => (
                      <Grid item xs={12} sm={6} md={3} key={subject}>
                        <Card 
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            background: selectedSubject === subject
                              ? 'linear-gradient(135deg, #5db6d9, #4a9cc7)'
                              : 'white',
                            color: selectedSubject === subject ? 'white' : 'var(--text-primary)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '80px',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 8px 16px rgba(93, 182, 217, 0.25)'
                            }
                          }}
                          onClick={() => setSelectedSubject(subject)}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                            {subject}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                    <Grid item xs={12} sm={6} md={3}>
                      <Card 
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                          background: selectedSubject === '' 
                            ? 'linear-gradient(135deg, #5db6d9, #4a9cc7)' 
                            : 'white',
                          color: selectedSubject === '' ? 'white' : 'var(--text-primary)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: '80px',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 8px 16px rgba(93, 182, 217, 0.25)'
                          }
                        }}
                        onClick={() => setSelectedSubject('')}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                          Tüm Dersler
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
                
                {/* TYT/AYT Seçim Butonları */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  mb: 4,
                  flexDirection: isMobile ? 'column' : 'row' 
                }}>
                  <Button
                    onClick={() => setSelectedExamType('TYT')}
                    sx={{
                      flex: 1,
                      py: 3,
                      background: selectedExamType === 'TYT' 
                        ? 'linear-gradient(135deg, #4a6cf7, #3a56d4)' 
                        : 'linear-gradient(135deg, #f5f7fa, #e4e8f0)',
                      color: selectedExamType === 'TYT' ? 'white' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      borderRadius: '16px',
                      boxShadow: selectedExamType === 'TYT' 
                        ? '0 10px 20px rgba(74, 108, 247, 0.3)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 30px rgba(74, 108, 247, 0.2)'
                      }
                    }}
                  >
                    TYT İstatistikleri
                  </Button>
                  
                  <Button
                    onClick={() => setSelectedExamType('AYT')}
                    sx={{
                      flex: 1,
                      py: 3,
                      background: selectedExamType === 'AYT' 
                        ? 'linear-gradient(135deg, #9b59b6, #8e44ad)' 
                        : 'linear-gradient(135deg, #f5f7fa, #e4e8f0)',
                      color: selectedExamType === 'AYT' ? 'white' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      borderRadius: '16px',
                      boxShadow: selectedExamType === 'AYT' 
                        ? '0 10px 20px rgba(155, 89, 182, 0.3)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 30px rgba(155, 89, 182, 0.2)'
                      }
                    }}
                  >
                    AYT İstatistikleri
                  </Button>
                </Box>
                
                {/* İstatistik Kartları */}
                {netRecords.filter(record => record.examType === selectedExamType).length > 0 ? (
                  <>
                    {/* Özet Bilgiler */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 600, 
                        color: '#5db6d9',
                        borderBottom: `2px solid #5db6d9`,
                        pb: 1,
                        mb: 3
                      }}>
                        Genel Performans Özeti
                      </Typography>
                      
                      <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 3,
                        justifyContent: 'center'
                      }}>
                        {/* Toplam Deneme Kartı */}
                        <Box sx={{
                          width: { xs: '100%', sm: '45%', md: '22%' },
                          p: 3,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #FFD3A5, #FD6585)',
                          color: 'white',
                          boxShadow: '0 8px 16px rgba(253, 101, 133, 0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 20px rgba(253, 101, 133, 0.3)'
                          }
                        }}>
                          <Box sx={{ 
                            width: 60, 
                            height: 60, 
                            borderRadius: '50%', 
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                          }}>
                            <AssignmentIcon sx={{ fontSize: 30 }} />
                          </Box>
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                            Toplam Deneme
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800 }}>
                            {(() => {
                              // Tüm Dersler seçiliyse
                              if (selectedSubject === '') {
                                return netRecords.filter(record => record.examType === selectedExamType).length;
                              }
                              // Belirli bir ders seçiliyse
                              else {
                                return netRecords.filter(record => 
                                  record.examType === selectedExamType && 
                                  record.subjects && 
                                  record.subjects[selectedSubject]
                                ).length;
                              }
                            })()}
                          </Typography>
                        </Box>
                        
                        {/* Son Deneme Tarihi Kartı */}
                        <Box sx={{
                          width: { xs: '100%', sm: '45%', md: '22%' },
                          p: 3,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #90F7EC, #32CCBC)',
                          color: 'white',
                          boxShadow: '0 8px 16px rgba(50, 204, 188, 0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 20px rgba(50, 204, 188, 0.3)'
                          }
                        }}>
                          <Box sx={{ 
                            width: 60, 
                            height: 60, 
                            borderRadius: '50%', 
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                          }}>
                            <CalendarTodayIcon sx={{ fontSize: 30 }} />
                          </Box>
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                            Son Deneme Tarihi
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            {(() => {
                              try {
                                // Önce sınav türüne göre filtrele
                                let filteredRecords = netRecords.filter(record => record.examType === selectedExamType);
                                
                                // Eğer belirli bir ders seçilmişse, sadece o derse ait kayıtları filtrele
                                if (selectedSubject && selectedSubject !== '') {
                                  filteredRecords = filteredRecords.filter(record => 
                                    record.subjects && record.subjects[selectedSubject]
                                  );
                                }
                                
                                if (filteredRecords.length === 0) return 'Tarih yok';
                                
                                // Güvenli sıralama fonksiyonu
                                const sortedRecords = [...filteredRecords].sort((a, b) => {
                                  // Eğer examDate tanımlı değilse veya toDate metodu yoksa, karşılaştırma yapma
                                  if (!a.examDate || !a.examDate.toDate || !b.examDate || !b.examDate.toDate) {
                                    return 0; // Sıralamayı değiştirme
                                  }
                                  try {
                                    return b.examDate.toDate() - a.examDate.toDate();
                                  } catch (error) {
                                    console.error('Date sorting error:', error);
                                    return 0; // Hata durumunda sıralamayı değiştirme
                                  }
                                });
                                
                                // İlk kaydın tarihini güvenli bir şekilde al
                                const latestRecord = sortedRecords[0];
                                if (!latestRecord || !latestRecord.examDate) return 'Tarih yok';
                                
                                try {
                                  if (typeof latestRecord.examDate.toDate === 'function') {
                                    return format(latestRecord.examDate.toDate(), 'dd MMMM yyyy', { locale: trLocale });
                                  } else if (latestRecord.examDate instanceof Date) {
                                    return format(latestRecord.examDate, 'dd MMMM yyyy', { locale: trLocale });
                                  } else {
                                    return 'Tarih yok';
                                  }
                                } catch (error) {
                                  console.error('Date formatting error:', error);
                                  return 'Tarih yok';
                                }
                              } catch (error) {
                                console.error('General error in date processing:', error);
                                return 'Tarih yok';
                              }
                            })()}
                          </Typography>
                        </Box>
                        
                        {/* En Yüksek Net Kartı */}
                        <Box sx={{
                          width: { xs: '100%', sm: '45%', md: '22%' },
                          p: 3,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #ABDCFF, #0396FF)',
                          color: 'white',
                          boxShadow: '0 8px 16px rgba(3, 150, 255, 0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 20px rgba(3, 150, 255, 0.3)'
                          }
                        }}>
                          <Box sx={{ 
                            width: 60, 
                            height: 60, 
                            borderRadius: '50%', 
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                          }}>
                            <TrendingUpIcon sx={{ fontSize: 30 }} />
                          </Box>
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                            En Yüksek Net
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            {(() => {
                              // Belirli bir ders seçiliyse
                              if (selectedSubject && selectedSubject !== '') {
                                const filteredRecords = netRecords
                                  .filter(record => 
                                    record.examType === selectedExamType && 
                                    record.subjects && 
                                    record.subjects[selectedSubject]
                                  )
                                  .map(record => parseFloat(record.subjects[selectedSubject].net));
                                
                                if (filteredRecords.length === 0) return 'Veri yok';
                                
                                const maxNet = Math.max(...filteredRecords);
                                return `${maxNet.toFixed(2)}`;
                              } 
                              // Tüm dersler seçiliyse
                              else {
                                return calculateHighestNetSubject();
                              }
                            })()}
                          </Typography>
                        </Box>
                        
                        {/* Gelişim Durumu Kartı */}
                        <Box sx={{
                          width: { xs: '100%', sm: '45%', md: '22%' },
                          p: 3,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #FFF6B7, #F6416C)',
                          color: 'white',
                          boxShadow: '0 8px 16px rgba(246, 65, 108, 0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 20px rgba(246, 65, 108, 0.3)'
                          }
                        }}>
                          <Box sx={{ 
                            width: 60, 
                            height: 60, 
                            borderRadius: '50%', 
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                          }}>
                            <ShowChartIcon sx={{ fontSize: 30 }} />
                          </Box>
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                            Gelişim Durumu
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {(() => {
                              // Belirli bir ders seçiliyse
                              if (selectedSubject && selectedSubject !== '') {
                                return calculateSubjectGrowthStatus(selectedSubject);
                              }
                              // Tüm dersler seçiliyse
                              else {
                                return calculateGrowthStatus();
                              }
                            })()}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Ders Bazlı Performans */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 600, 
                        color: selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6',
                        borderBottom: `2px solid ${selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6'}`,
                        pb: 1
                      }}>
                        Ders Bazlı Performans
                      </Typography>
                      
                      {/* Belirli bir ders seçilmişse ve Tüm Dersler değilse, o derse özel grafik göster */}
                      {selectedSubject && selectedSubject !== '' ? (
                        <Box sx={{ width: '100%', height: 400, mt: 3 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={netRecords
                                .filter(record => 
                                  record.examType === selectedExamType && 
                                  record.subjects && 
                                  record.subjects[selectedSubject]
                                )
                                .map(record => ({
                                  name: record.examName,
                                  date: record.examDate ? format(record.examDate.toDate(), 'dd/MM', { locale: trLocale }) : '',
                                  net: parseFloat(record.subjects[selectedSubject].net)
                                }))}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="net" 
                                name={`${selectedSubject} Net`}
                                stroke={selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6'} 
                                activeDot={{ r: 8 }} 
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                      ) : (
                        <Box sx={{ width: '100%', height: 400, mt: 3 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={calculateSubjectAverages()}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="subject" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar 
                                dataKey="average" 
                                name="Ortalama Net" 
                                fill={selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6'} 
                                radius={[8, 8, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      )}
                    </Box>
                    
                    {/* Zaman İçinde Gelişim */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 600, 
                        color: selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6',
                        borderBottom: `2px solid ${selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6'}`,
                        pb: 1
                      }}>
                        Zaman İçinde Gelişim
                      </Typography>
                      
                      <Box sx={{ width: '100%', height: 400, mt: 3 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={calculateTimeProgress()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {/* Belirli bir ders seçilmişse ve Tüm Dersler değilse, sadece o dersi göster */}
                            {selectedSubject && selectedSubject !== '' ? (
                              <Line 
                                key={selectedSubject}
                                type="monotone" 
                                dataKey={selectedSubject} 
                                stroke={selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6'} 
                                strokeWidth={3}
                                dot={{ r: 6 }}
                                activeDot={{ r: 9 }}
                              />
                            ) : (
                              /* Tüm dersler seçilmişse, tüm dersleri göster */
                              (selectedExamType === 'TYT' ? tytSubjects : aytSubjects).map((subject, index) => (
                                <Line 
                                  key={subject}
                                  type="monotone" 
                                  dataKey={subject} 
                                  stroke={getSubjectColor(index)} 
                                  strokeWidth={2}
                                  dot={{ r: 5 }}
                                  activeDot={{ r: 8 }}
                                />
                              ))
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>
                    
                    {/* Tavsiyeler */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 600, 
                        color: selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6',
                        borderBottom: `2px solid ${selectedExamType === 'TYT' ? '#4a6cf7' : '#9b59b6'}`,
                        pb: 1
                      }}>
                        Gelişim Tavsiyeleri
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        {generateRecommendations().map((recommendation, index) => (
                          <Card key={index} sx={{ 
                            p: 2, 
                            mb: 2, 
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            borderLeft: `4px solid ${recommendation.color}`
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {recommendation.icon}
                              <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 600 }}>
                                {recommendation.subject}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                              {recommendation.message}
                            </Typography>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      İstatistikler için yeterli veri bulunmamaktadır.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
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
        </Box>
      </Container>
    </motion.div>
  );
};

export default TytAytNetTakibi;
