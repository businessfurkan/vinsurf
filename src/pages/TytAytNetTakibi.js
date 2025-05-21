import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import '../styles/tyt-ayt-modern.css';
import { styled } from '@mui/system';
import { useNotifications } from '../context/NotificationContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import trLocale from 'date-fns/locale/tr';
import { format } from 'date-fns';
import {
  School as SchoolIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  where,
  orderBy, 
  deleteDoc, 
  doc,
  serverTimestamp
} from 'firebase/firestore';

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

// Styled components
// Stepper için özel StyledCard bileşeni
const StepperCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 6px 12px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at top right, rgba(78, 133, 253, 0.15), transparent 70%)',
    pointerEvents: 'none'
  }
}));

// Normal kartlar için StyledCard bileşeni
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(145deg, #ffffff 0%, #f0efe9 100%)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(217, 212, 187, 0.15)',
  border: '1px solid rgba(217, 212, 187, 0.1)',
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), 0 6px 12px rgba(217, 212, 187, 0.2)'
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
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // State for records view
  const [viewMode, setViewMode] = useState('form'); // 'form' or 'records'
  const [selectedExamType, setSelectedExamType] = useState('TYT');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  // Bildirim sistemi için context
  const { addNotification } = useNotifications();
  
  // Helper functions
  const calculateNet = (correct, incorrect) => {
    const correctNum = parseFloat(correct) || 0;
    const incorrectNum = parseFloat(incorrect) || 0;
    return (correctNum - (incorrectNum * 0.25)).toFixed(2);
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  // Show notification
  const showNotification = useCallback((message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, [setNotification]);
  
  // Handle next step in the form
  const handleNext = () => {
    let isValid = true;
    const newErrors = {};
    
    // Validate current step
    if (activeStep === 0) {
      if (!examName.trim()) {
        newErrors.examName = 'Lütfen deneme adını girin';
        isValid = false;
      }
    } else if (activeStep === 1) {
      if (!examDate) {
        newErrors.examDate = 'Lütfen tarih seçin';
        isValid = false;
      }
    } else if (activeStep === 3) {
      if (currentSubject) {
        if (!correctCount && correctCount !== '0') {
          newErrors.correctCount = 'Doğru sayısını girin';
          isValid = false;
        }
        if (!incorrectCount && incorrectCount !== '0') {
          newErrors.incorrectCount = 'Yanlış sayısını girin';
          isValid = false;
        }
        if (!emptyCount && emptyCount !== '0') {
          newErrors.emptyCount = 'Boş sayısını girin';
          isValid = false;
        }
      }
    }
    
    setErrors(newErrors);
    
    if (!isValid) return;
    
    // If we're on the subject selection step and a subject is selected
    if (activeStep === 3 && currentSubject) {
      // Save current subject data
      const updatedSubjectData = {
        ...subjectData,
        [currentSubject]: {
          correctCount: parseInt(correctCount) || 0,
          incorrectCount: parseInt(incorrectCount) || 0,
          emptyCount: parseInt(emptyCount) || 0,
          net: calculateNet(correctCount, incorrectCount)
        }
      };
      setSubjectData(updatedSubjectData);
      
      // Clear form for next subject
      setCurrentSubject('');
      setCorrectCount('');
      setIncorrectCount('');
      setEmptyCount('');
      return;
    }
    
    // Move to next step
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  // Handle back step in the form
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
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
  
  // Submit the form data
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Create record for each subject
      const records = [];
      
      Object.entries(subjectData).forEach(([subject, data]) => {
        records.push({
          examName,
          examDate,
          examType,
          subject,
          correctCount: data.correctCount,
          incorrectCount: data.incorrectCount,
          emptyCount: data.emptyCount,
          net: data.net,
          createdAt: serverTimestamp()
        });
      });
      
      // Save records to Firestore
      for (const record of records) {
        await addDoc(collection(db, 'netRecords'), record);
      }
      
      // Show success notification
      showNotification('Deneme sonuçları başarıyla kaydedildi', 'success');
      
      // Reset form
      setActiveStep(0);
      setExamName('');
      setExamDate(new Date());
      setExamType('TYT');
      setSubjectData({});
      
      // Refresh records
      fetchNetRecords();
    } catch (error) {
      console.error('Error saving records:', error);
      showNotification('Kayıt sırasında bir hata oluştu', 'error');
    }
  };
  
  // Tavsiye gönderme fonksiyonu
  const sendRecommendation = useCallback((subject, decreasePercentage) => {
    // Ders adından konu tahmini yap
    let topic = '';
    let resources = [];
    
    // Derse göre konu ve kaynak önerileri
    if (subject.includes('Matematik')) {
      topic = 'problemler';
      resources = ['Matematik Problemi Çözme Teknikleri', 'Problem Çözüm Stratejileri', 'Matematik Problem Bankası'];
    } else if (subject.includes('Türkçe')) {
      topic = 'paragraf soruları';
      resources = ['Paragraf Çözüm Teknikleri', 'TYT Türkçe Soru Bankası', 'Dil Bilgisi Konu Anlatımı'];
    } else if (subject.includes('Fizik')) {
      topic = 'hareket problemleri';
      resources = ['Fizik Formül Kartları', 'Fizik Soru Bankası', 'Konu Anlatımlı Fizik'];
    } else if (subject.includes('Kimya')) {
      topic = 'kimyasal tepkimeler';
      resources = ['Kimya Reaksiyon Kartları', 'Kimya Soru Bankası', 'Organik Kimya Konu Anlatımı'];
    } else if (subject.includes('Biyoloji')) {
      topic = 'hücre konusu';
      resources = ['Biyoloji Hücre Atlası', 'Biyoloji Soru Bankası', 'Genetik Konu Anlatımı'];
    } else if (subject.includes('Tarih')) {
      topic = 'tarih kronolojisi';
      resources = ['Tarih Kronoloji Kartları', 'Tarih Soru Bankası', 'Osmanlı Tarihi Konu Anlatımı'];
    } else if (subject.includes('Coğrafya')) {
      topic = 'harita bilgisi';
      resources = ['Coğrafya Atlas Çalışması', 'Coğrafya Soru Bankası', 'Türkiye Coğrafyası Konu Anlatımı'];
    } else if (subject.includes('Edebiyat')) {
      topic = 'edebi akımlar';
      resources = ['Edebiyat Akımları Özeti', 'Edebiyat Soru Bankası', 'Divan Edebiyatı Konu Anlatımı'];
    } else if (subject.includes('Sosyal')) {
      topic = 'vatandaşlık konuları';
      resources = ['Vatandaşlık Konu Özeti', 'TYT Sosyal Bilimler Soru Bankası', 'Güncel Bilgiler'];
    } else if (subject.includes('Fen')) {
      topic = 'deney soruları';
      resources = ['Fen Bilimleri Deney Kitabı', 'TYT Fen Bilimleri Soru Bankası', 'Fen Konu Anlatımı'];
    } else {
      topic = 'genel konular';
      resources = ['Konu Tekrar Kitabı', 'Soru Bankası', 'Online Eğitim Platformları'];
    }
    
    // Düşüş yüzdesine göre mesaj şiddetini ayarla
    let severity = 'info';
    if (decreasePercentage > 30) {
      severity = 'warning';
    }
    
    // Tavsiye mesajını oluştur
    const message = `Son 3 denemeye göre ${subject} dersinde ${topic} kısmında zorlanıyorsun. Sana şu kaynakları öneriyorum: ${resources.join(', ')}.`;
    
    // Bildirim gönder
    addNotification(message, severity, {
      title: 'Yapay Zeka Tavsiye Sistemi',
      subject: subject,
      resources: resources,
      decreasePercentage: decreasePercentage.toFixed(1)
    });
    
  }, [addNotification]);
  
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
          .filter(record => record.subject === subject)
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt?.seconds * 1000 || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt?.seconds * 1000 || 0);
            return dateB - dateA; // Tarihe göre azalan sıralama (en yeniden en eskiye)
          })
          .slice(0, 3); // Son 3 deneme
        
        // En az 3 deneme yoksa analiz yapma
        if (subjectRecords.length < 3) return;
        
        // Net puanları al
        const nets = subjectRecords.map(record => parseFloat(record.net) || 0);
        
        // Son 3 denemede düşüş var mı kontrol et
        // En yeni deneme en eskisinden düşükse ve bir trend varsa
        if (nets[0] < nets[2] && nets[0] < nets[1]) {
          // Düşüş yüzdesini hesapla
          const decreasePercentage = ((nets[2] - nets[0]) / nets[2]) * 100;
          
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

  useEffect(() => {
    if (netRecords.length > 0) {
      analyzePerformanceAndSendRecommendations(netRecords);
    }
  }, [netRecords, analyzePerformanceAndSendRecommendations]);

  // Fetch all records
  const fetchNetRecords = useCallback(async () => {
    try {
      setLoading(true);
      
      // Kullanıcı oturum açmamışsa işlemi durdur
      if (!user || !user.uid) {
        console.log('Kullanıcı oturum açmamış, veriler yüklenemiyor');
        return;
      }
      
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
    } finally {
      setLoading(false);
    }
  }, [showNotification, setLoading, setNetRecords, analyzePerformanceAndSendRecommendations, user]);
  

  
  // Delete a record
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      
      await deleteDoc(doc(db, 'netRecords', id));
      
      // Update local state
      setNetRecords(netRecords.filter(record => record.id !== id));
      
      showNotification('Kayıt başarıyla silindi', 'success');
    } catch (error) {
      console.error('Error deleting record:', error);
      showNotification('Silme işlemi sırasında bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Load records on component mount
  useEffect(() => {
    fetchNetRecords();
  }, [fetchNetRecords]);
  
  // Render form step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#f4f2f5' }}>
              Deneme Adını Girin
            </Typography>
            <TextField
              fullWidth
              label="Deneme Adı"
              variant="outlined"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              error={!!errors.examName}
              helperText={errors.examName}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(44, 62, 80, 0.6)',
                  color: '#ffffff',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  },
                  '&:hover fieldset': {
                    borderColor: '#ffffff'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ffffff'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#ffffff'
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#ffffff'
                },
                '& .MuiInputBase-input': {
                  color: '#ffffff'
                },
                '& .MuiFormHelperText-root': {
                  color: '#ffffff'
                }
              }}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#f4f2f5' }}>
              Deneme Tarihini Seçin
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
              <DatePicker
                label="Deneme Tarihi"
                value={examDate}
                onChange={(newDate) => setExamDate(newDate)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.examDate,
                    helperText: errors.examDate,
                    sx: { 
                      mt: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(44, 62, 80, 0.6)',
                        color: '#ffffff',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&:hover fieldset': {
                          borderColor: '#ffffff'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ffffff'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#ffffff'
                      },
                      '& .MuiInputBase-input': {
                        color: '#ffffff'
                      },
                      '& .MuiFormHelperText-root': {
                        color: '#ffffff'
                      }
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#f4f2f5' }}>
              Sınav Türünü Seçin
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel sx={{ color: '#f4f2f5' }}>Sınav Türü</InputLabel>
              <Select
                value={examType}
                label="Sınav Türü"
                onChange={(e) => setExamType(e.target.value)}
                sx={{
                  backgroundColor: 'rgba(44, 62, 80, 0.6)',
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ffffff'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ffffff'
                  }
                }}
              >
                <MenuItem value="TYT" sx={{ backgroundColor: 'rgba(44, 62, 80, 0.8)', color: '#ffffff', '&:hover': { backgroundColor: 'rgba(44, 62, 80, 0.9)' }, '&.Mui-selected': { backgroundColor: 'rgba(44, 62, 80, 0.9)' } }}>TYT</MenuItem>
                <MenuItem value="AYT" sx={{ backgroundColor: 'rgba(44, 62, 80, 0.8)', color: '#ffffff', '&:hover': { backgroundColor: 'rgba(44, 62, 80, 0.9)' }, '&.Mui-selected': { backgroundColor: 'rgba(44, 62, 80, 0.9)' } }}>AYT</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#f4f2f5' }}>
              Ders Bilgilerini Girin
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#f4f2f5' }}>Ders Seçin</InputLabel>
                  <Select
                    value={currentSubject}
                    label="Ders Seçin"
                    onChange={(e) => handleSubjectSelect(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ffffff'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ffffff'
                      },
                      color: '#ffffff',
                      height: '56px',
                      fontSize: '1.1rem',
                      backgroundColor: 'rgba(44, 62, 80, 0.6)',
                      minWidth: '300px',
                      '& .MuiSelect-select': {
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        width: '100%'
                      }
                    }}
                  >
                    {(examType === 'TYT' ? tytSubjects : aytSubjects).map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {currentSubject && (
                <>
                  <Grid gridColumn={{xs: "span 12", sm: "span 4"}}>
                    <TextField
                      fullWidth
                      label="Doğru"
                      type="number"
                      InputProps={{ 
                        inputProps: { min: 0 },
                        sx: { color: '#f4f2f5' }
                      }}
                      value={correctCount}
                      onChange={(e) => setCorrectCount(e.target.value)}
                      error={!!errors.correctCount}
                      helperText={errors.correctCount}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(44, 62, 80, 0.6)',
                          color: '#ffffff',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)'
                          },
                          '&:hover fieldset': {
                            borderColor: '#ffffff'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ffffff'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#ffffff'
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#ffffff'
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff'
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ffffff'
                        }
                      }}
                    />
                  </Grid>
                  <Grid gridColumn={{xs: "span 12", sm: "span 4"}}>
                    <TextField
                      fullWidth
                      label="Yanlış"
                      type="number"
                      InputProps={{ 
                        inputProps: { min: 0 },
                        sx: { color: '#f4f2f5' }
                      }}
                      value={incorrectCount}
                      onChange={(e) => setIncorrectCount(e.target.value)}
                      error={!!errors.incorrectCount}
                      helperText={errors.incorrectCount}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(44, 62, 80, 0.6)',
                          color: '#ffffff',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)'
                          },
                          '&:hover fieldset': {
                            borderColor: '#ffffff'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ffffff'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#ffffff'
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#ffffff'
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff'
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ffffff'
                        }
                      }}
                    />
                  </Grid>
                  <Grid gridColumn={{xs: "span 12", sm: "span 4"}}>
                    <TextField
                      fullWidth
                      label="Boş"
                      type="number"
                      InputProps={{ 
                        inputProps: { min: 0 },
                        sx: { color: '#f4f2f5' }
                      }}
                      value={emptyCount}
                      onChange={(e) => setEmptyCount(e.target.value)}
                      error={!!errors.emptyCount}
                      helperText={errors.emptyCount}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(44, 62, 80, 0.6)',
                          color: '#ffffff',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)'
                          },
                          '&:hover fieldset': {
                            borderColor: '#ffffff'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ffffff'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#ffffff'
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#ffffff'
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff'
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ffffff'
                        }
                      }}
                    />
                  </Grid>
                  <Grid gridColumn="span 12">
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      startIcon={<AddIcon sx={{ color: '#f4f2f5' }} />}
                      sx={{ 
                        backgroundColor: '#f4f2f5',
                        color: '#2e5559',
                        '&:hover': {
                          backgroundColor: '#c5c0a7'
                        }
                      }}
                    >
                      Dersi Ekle
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
            
            {Object.keys(subjectData).length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    color: '#f4f2f5', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <SchoolIcon sx={{ mr: 1, color: '#f4f2f5' }} /> Eklenen Dersler
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell 
                          sx={{ 
                            backgroundColor: '#333333', 
                            color: '#ffffff', 
                            fontWeight: 'bold', 
                            fontSize: '1rem',
                            padding: '12px 16px'
                          }}
                        >
                          Ders
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            backgroundColor: '#2ecc71', 
                            color: '#000000', 
                            fontWeight: 'bold', 
                            fontSize: '1rem',
                            padding: '12px 16px'
                          }}
                        >
                          Doğru
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            backgroundColor: '#e74c3c', 
                            color: '#000000', 
                            fontWeight: 'bold', 
                            fontSize: '1rem',
                            padding: '12px 16px'
                          }}
                        >
                          Yanlış
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            backgroundColor: '#95a5a6', 
                            color: '#000000', 
                            fontWeight: 'bold', 
                            fontSize: '1rem',
                            padding: '12px 16px'
                          }}
                        >
                          Boş
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            backgroundColor: '#3498db', 
                            color: '#000000', 
                            fontWeight: 'bold', 
                            fontSize: '1rem',
                            padding: '12px 16px'
                          }}
                        >
                          Net
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(subjectData).map(([subject, data], index) => (
                        <TableRow 
                          key={subject}
                          sx={{ 
                            backgroundColor: index % 2 === 0 ? '#f9f4ff' : 'white',
                            '&:hover': { backgroundColor: '#f0e6ff' }
                          }}
                        >
                          <TableCell 
                            component="th" 
                            scope="row"
                            sx={{ 
                              color: '#f4f2f5', 
                              fontWeight: 800,
                              fontSize: '1rem'
                            }}
                          >
                            {subject}
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              color: '#2ecc71', 
                              fontWeight: 'bold',
                              fontSize: '0.95rem'
                            }}
                          >
                            {data.correctCount}
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              color: '#e74c3c', 
                              fontWeight: 'bold',
                              fontSize: '0.95rem'
                            }}
                          >
                            {data.incorrectCount}
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              color: '#7f8c8d', 
                              fontWeight: 'bold',
                              fontSize: '0.95rem'
                            }}
                          >
                            {data.emptyCount}
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              color: '#f4f2f5', 
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              backgroundColor: 'rgba(44, 62, 80, 0.8)',
                              borderRadius: '4px'
                            }}
                          >
                            {data.net}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        );
      case 4:
        return (
          <Box sx={{ p: 3 }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                color: '#f4f2f5', 
                fontWeight: 'bold',
                textAlign: 'center',
                mb: 3,
                borderBottom: '2px solid #d9d4bb',
                paddingBottom: '10px'
              }}
            >
              Deneme Bilgileri Özeti
            </Typography>
            
            <Grid container spacing={3}>
              {/* Deneme bilgileri kartları */}
              <Grid gridColumn={{xs: "span 12", md: "span 4"}}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2, 
                    borderRadius: '12px',
                    backgroundColor: '#f0f8ff',
                    height: '100%',
                    borderLeft: '4px solid #3498db'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: '#f4f2f5', fontWeight: 'bold', mb: 1 }}>
                    Deneme Adı
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#f4f2f5', fontSize: '1.1rem' }}>
                    {examName || 'Belirtilmemiş'}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid gridColumn={{xs: "span 12", md: "span 4"}}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2, 
                    borderRadius: '12px',
                    backgroundColor: '#fff8f0',
                    height: '100%',
                    borderLeft: '4px solid #e67e22'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: '#e67e22', fontWeight: 'bold', mb: 1 }}>
                    Tarih
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#f4f2f5', fontSize: '1.1rem' }}>
                    {format(examDate, 'dd MMMM yyyy', { locale: trLocale })}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid gridColumn={{xs: "span 12", md: "span 4"}}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2, 
                    borderRadius: '12px',
                    backgroundColor: '#f0fff8',
                    height: '100%',
                    borderLeft: '4px solid #2ecc71'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: '#2ecc71', fontWeight: 'bold', mb: 1 }}>
                    Sınav Türü
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#f4f2f5', fontSize: '1.1rem' }}>
                    {examType}
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Dersler tablosu */}
              <Grid gridColumn="span 12" sx={{ mt: 2 }}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2, 
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    borderTop: '4px solid #9b59b6'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#9b59b6', 
                      fontWeight: 'bold', 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <SchoolIcon sx={{ mr: 1 }} /> Dersler ve Sonuçlar
                  </Typography>
                  
                  <TableContainer sx={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell 
                            sx={{ 
                              backgroundColor: '#333333', 
                              color: '#ffffff', 
                              fontWeight: 'bold', 
                              fontSize: '1rem',
                              padding: '12px 16px'
                            }}
                          >
                            Ders
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              backgroundColor: '#2ecc71', 
                              color: '#000000', 
                              fontWeight: 'bold', 
                              fontSize: '1rem',
                              padding: '12px 16px'
                            }}
                          >
                            Doğru
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              backgroundColor: '#e74c3c', 
                              color: '#000000', 
                              fontWeight: 'bold', 
                              fontSize: '1rem',
                              padding: '12px 16px'
                            }}
                          >
                            Yanlış
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              backgroundColor: '#95a5a6', 
                              color: '#000000', 
                              fontWeight: 'bold', 
                              fontSize: '1rem',
                              padding: '12px 16px'
                            }}
                          >
                            Boş
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              backgroundColor: '#3498db', 
                              color: '#000000', 
                              fontWeight: 'bold', 
                              fontSize: '1rem',
                              padding: '12px 16px'
                            }}
                          >
                            Net
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(subjectData).map(([subject, data], index) => (
                          <TableRow 
                            key={subject}
                            sx={{ 
                              backgroundColor: index % 2 === 0 ? '#f9f4ff' : 'white',
                              '&:hover': { backgroundColor: '#f0e6ff' }
                            }}
                          >
                            <TableCell 
                              component="th" 
                              scope="row"
                              sx={{ 
                                color: '#f4f2f5', 
                                fontWeight: 800,
                                fontSize: '1rem'
                              }}
                            >
                              {subject}
                            </TableCell>
                            <TableCell 
                              align="center"
                              sx={{ 
                                color: '#2ecc71', 
                                fontWeight: 'bold',
                                fontSize: '0.95rem'
                              }}
                            >
                              {data.correctCount}
                            </TableCell>
                            <TableCell 
                              align="center"
                              sx={{ 
                                color: '#e74c3c', 
                                fontWeight: 'bold',
                                fontSize: '0.95rem'
                              }}
                            >
                              {data.incorrectCount}
                            </TableCell>
                            <TableCell 
                              align="center"
                              sx={{ 
                                color: '#7f8c8d', 
                                fontWeight: 'bold',
                                fontSize: '0.95rem'
                              }}
                            >
                              {data.emptyCount}
                            </TableCell>
                            <TableCell 
                              align="center"
                              sx={{ 
                                color: '#3498db', 
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                backgroundColor: '#ebf5fb',
                                borderRadius: '4px'
                              }}
                            >
                              {data.net}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  // Prepare data for progress chart
  const prepareChartData = useCallback((subject) => {
    if (!subject || netRecords.length === 0) return [];
    
    // Filter records for the selected subject
    const subjectRecords = netRecords.filter(record => record.subject === subject);
    
    // Sort by date
    subjectRecords.sort((a, b) => {
      const dateA = a.examDate?.toDate?.() || new Date(0);
      const dateB = b.examDate?.toDate?.() || new Date(0);
      return dateA - dateB;
    });
    
    // Create chart data
    return subjectRecords.map(record => ({
      name: record.examName,
      date: record.examDate?.toDate ? format(record.examDate.toDate(), 'dd/MM/yyyy') : '',
      net: parseFloat(record.net) || 0
    }));
  }, [netRecords]);
  
  // Handle exam type change
  const handleExamTypeChange = (type) => {
    setSelectedExamType(type);
    setSelectedSubject('');
  };
  
  // Handle subject selection
  const handleSubjectSelection = (subject) => {
    setSelectedSubject(subject);
  };
  
  // Render progress chart
  const renderProgressChart = () => {
    const chartData = prepareChartData(selectedSubject);
    
    if (chartData.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: '#f4f2f5' }}>
            Seçilen derse ait veri bulunmamaktadır.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ width: '100%', height: 300, mt: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="net" 
              stroke="#f4f2f5" 
              activeDot={{ r: 8 }} 
              name="Net Puan"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  };
  
  // Render the list of saved records
  const renderRecordsList = () => {
    if (netRecords.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: '#f4f2f5' }}>
            Henüz kaydedilmiş deneme sonucu bulunmamaktadır.
          </Typography>
        </Box>
      );
    }
    
    // Get subjects based on selected exam type
    const subjects = selectedExamType === 'TYT' ? tytSubjects : aytSubjects;
    
    // Filter records by exam type
    const filteredRecords = netRecords.filter(record => {
      return record.subject.startsWith(selectedExamType);
    });
    
    // Group records by subject
    const subjectRecords = {};
    subjects.forEach(subject => {
      subjectRecords[subject] = filteredRecords.filter(record => record.subject === subject);
    });
    
    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button 
            variant={selectedExamType === 'TYT' ? 'contained' : 'outlined'}
            onClick={() => handleExamTypeChange('TYT')}
            sx={{ 
              mr: 2,
              ...(selectedExamType === 'TYT' 
                ? {
                    backgroundColor: '#d9d4bb',
                    color: '#f4f2f5',
                    '&:hover': {
                      backgroundColor: '#c5c0a7'
                    }
                  } 
                : {
                    color: '#d9d4bb',
                    borderColor: '#d9d4bb',
                    '&:hover': {
                      borderColor: '#c5c0a7',
                      backgroundColor: 'rgba(217, 212, 187, 0.04)'
                    }
                  }
              )
            }}
          >
            TYT
          </Button>
          <Button 
            variant={selectedExamType === 'AYT' ? 'contained' : 'outlined'}
            onClick={() => handleExamTypeChange('AYT')}
            sx={{ 
              ...(selectedExamType === 'AYT' 
                ? {
                    backgroundColor: '#d9d4bb',
                    color: '#f4f2f5',
                    '&:hover': {
                      backgroundColor: '#c5c0a7'
                    }
                  } 
                : {
                    color: '#d9d4bb',
                    borderColor: '#d9d4bb',
                    '&:hover': {
                      borderColor: '#c5c0a7',
                      backgroundColor: 'rgba(217, 212, 187, 0.04)'
                    }
                  }
              )
            }}
          >
            AYT
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          {subjects.map(subject => {
            const records = subjectRecords[subject] || [];
            const latestRecord = records.length > 0 ? 
              records.sort((a, b) => {
                const dateA = a.examDate?.toDate?.() || new Date(0);
                const dateB = b.examDate?.toDate?.() || new Date(0);
                return dateB - dateA; // Descending order
              })[0] : null;
            
            return (
              <Grid gridColumn={{xs: "span 12", sm: "span 6", md: "span 4"}} key={subject}>
                <StyledCard 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedSubject === subject ? '2px solid #d9d4bb' : 'none',
                    transform: selectedSubject === subject ? 'scale(1.02)' : 'none'
                  }}
                  onClick={() => handleSubjectSelection(subject)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" gutterBottom sx={{ color: '#f4f2f5' }}>{subject}</Typography>
                      {latestRecord && (
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRecordDelete(latestRecord.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    {latestRecord ? (
                      <>
                        <Typography variant="body2" sx={{ color: '#f4f2f5' }}>
                          Son Deneme: {latestRecord.examName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#f4f2f5' }}>
                          Tarih: {latestRecord.examDate?.toDate ? 
                            format(latestRecord.examDate.toDate(), 'dd MMMM yyyy', { locale: trLocale }) : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Typography variant="body2" sx={{ color: '#f4f2f5' }}>
                            D: {latestRecord.correctCount}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#f4f2f5' }}>
                            Y: {latestRecord.incorrectCount}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#f4f2f5' }}>
                            B: {latestRecord.emptyCount}
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#f4f2f5' }}>
                            Net: {latestRecord.net}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#f4f2f5' }}>
                        Henüz kayıt bulunmamaktadır.
                      </Typography>
                    )}
                  </CardContent>
                </StyledCard>
              </Grid>
            );
          })}
        </Grid>
        
        {selectedSubject && renderProgressChart()}
      </Box>
    );
  };
  
  // Toggle between form and records view
  const toggleViewMode = () => {
    setViewMode(viewMode === 'form' ? 'records' : 'form');
  };
  
  // Handle record deletion with confirmation
  const handleRecordDelete = (id) => {
    if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      handleDelete(id);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2, position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1000,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '2px solid #d9d4bb',
          pb: 2,
          mb: 4,
          mt: 8, // Başlığı daha aşağıya almak için margin-top arttırıldı
          pt: 3 // Üstte daha fazla boşluk için padding-top arttırıldı
        }}>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', color: '#f4f2f5' }}>
            <SchoolIcon sx={{ mr: 1, color: '#d9d4bb' }} /> TYT-AYT Net Takibi
          </Typography>
          <Button 
            variant="contained" 
            onClick={toggleViewMode}
            sx={{
              backgroundColor: '#d9d4bb',
              color: '#f4f2f5',
              fontWeight: 'bold',
              padding: '10px 20px',
              fontSize: '1.05rem',
              borderRadius: '8px',
              boxShadow: '0 6px 10px rgba(217, 212, 187, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#c5c0a7',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 15px rgba(217, 212, 187, 0.5)'
              }
            }}
          >
            {viewMode === 'form' ? 'Kayıtları Görüntüle' : 'Yeni Deneme Ekle'}
          </Button>
        </Box>
        
        {viewMode === 'form' ? (
          /* Multi-step form */
          <StepperCard sx={{ mb: 4, mt: 3 }}>
            <CardContent sx={{ pt: 3, backgroundColor: 'transparent' }}>
              <Stepper 
                activeStep={activeStep} 
                alternativeLabel
                sx={{
                  py: 2,
                  '& .MuiStepIcon-root': {
                    color: 'rgba(255, 255, 255, 0.3)',
                    fontSize: '2.2rem',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    '&:hover': {
                      transform: 'scale(1.15) translateY(-2px)',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
                    },
                    '&.Mui-active': {
                      color: '#4e85fd',
                      filter: 'drop-shadow(0 4px 12px rgba(78,133,253,0.4))'
                    },
                    '&.Mui-completed': {
                      color: '#38d39f',
                      filter: 'drop-shadow(0 4px 8px rgba(56,211,159,0.3))'
                    }
                  },
                  '& .MuiStepLabel-label': {
                    color: '#f4f2f5',
                    fontWeight: 600,
                    fontSize: '1rem',
                    marginTop: '8px',
                    transition: 'all 0.3s ease',
                    '&.Mui-active': {
                      color: '#ffffff',
                      fontWeight: 800,
                      transform: 'scale(1.05)',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    },
                    '&.Mui-completed': {
                      color: '#d8fef0',
                      fontWeight: 700
                    }
                  },
                  '& .MuiStepConnector-line': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderTopWidth: '3px',
                    borderRadius: '3px',
                    transition: 'all 0.4s ease'
                  },
                  '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                    borderColor: '#4e85fd',
                    borderTopWidth: '3px',
                    boxShadow: '0 2px 4px rgba(78,133,253,0.3)'
                  },
                  '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                    borderColor: '#38d39f',
                    borderTopWidth: '3px',
                    boxShadow: '0 2px 4px rgba(56,211,159,0.2)'
                  }
                }}
              >
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconProps={{
                        icon: index + 1,
                        sx: {
                          '& .MuiStepIcon-text': {
                            fill: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          },
                          '& circle': {
                            fill: activeStep === index ? '#4e85fd' : 
                                  activeStep > index ? '#38d39f' : 'rgba(255, 255, 255, 0.3)'
                          }
                        }
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              <Box sx={{ mt: 3 }}>
                {activeStep === steps.length ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#f4f2f5' }}>
                      Tüm adımlar tamamlandı
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      startIcon={<CheckCircleIcon sx={{ color: '#f4f2f5' }} />}
                      sx={{ 
                        mt: 2,
                        backgroundColor: '#5ec837',
                        color: '#f4f2f5',
                        '&:hover': {
                          backgroundColor: '#4eb02c'
                        }
                      }}
                    >
                      Kaydet
                    </Button>
                  </Box>
                ) : (
                  <>
                    {getStepContent(activeStep)}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}>
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        startIcon={<NavigateBeforeIcon sx={{ color: activeStep === 0 ? 'rgba(255, 255, 255, 0.3)' : '#f4f2f5' }} />}
                        sx={{ 
                          color: '#f4f2f5',
                          fontWeight: 600,
                          padding: '8px 24px',
                          borderRadius: '30px',
                          background: activeStep === 0 ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
                          boxShadow: activeStep === 0 ? 'none' : '0 4px 15px rgba(255, 126, 95, 0.4)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: activeStep === 0 ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #ff7e5f 20%, #feb47b 100%)',
                            transform: activeStep === 0 ? 'none' : 'translateY(-2px)',
                            boxShadow: activeStep === 0 ? 'none' : '0 6px 20px rgba(255, 126, 95, 0.5)'
                          },
                          '&.Mui-disabled': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.3)'
                          }
                        }}
                      >
                        Geri
                      </Button>
                      
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<NavigateNextIcon sx={{ color: '#f4f2f5' }} />}
                        disabled={activeStep === 3 && Object.keys(subjectData).length === 0}
                        sx={{ 
                          backgroundColor: '#38d39f',
                          color: '#f4f2f5',
                          fontWeight: 600,
                          padding: '8px 24px',
                          borderRadius: '30px',
                          background: 'linear-gradient(135deg, #38d39f 0%, #38a4d3 100%)',
                          boxShadow: '0 4px 15px rgba(56, 211, 159, 0.4)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #38d39f 20%, #38a4d3 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(56, 211, 159, 0.5)'
                          },
                          '&.Mui-disabled': {
                            background: 'linear-gradient(135deg, rgba(56, 211, 159, 0.5) 0%, rgba(56, 164, 211, 0.5) 100%)',
                            color: 'rgba(255, 255, 255, 0.5)'
                          }
                        }}
                      >
                        {activeStep === steps.length - 1 ? 'Bitir' : 'İleri'}
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </CardContent>
          </StepperCard>
        ) : (
          /* Records view */
          <StyledCard sx={{ mt: 3 }}>
            <CardContent sx={{ pt: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#f4f2f5' }}>
                Deneme Sonuçları
              </Typography>
              {renderRecordsList()}
            </CardContent>
          </StyledCard>
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
    </motion.div>
  );
};

export default TytAytNetTakibi;
