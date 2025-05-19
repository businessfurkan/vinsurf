import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import '../styles/tyt-ayt-modern.css';
import { useNotifications } from '../context/NotificationContext';
import { keyframes, styled } from '@mui/system';
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  ButtonGroup,
  FormControl,
  Select,
  MenuItem,
  Tooltip, 
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
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import {
  School as SchoolIcon,
  Close as CloseIcon,
  Add as AddIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  Delete as DeleteIcon,
  RestartAlt as RestartAltIcon,
  QueryStats as QueryStatsIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';

import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  deleteDoc, 
  doc
} from 'firebase/firestore';

// Define TYT ve AYT subjects
const tytSubjects = [
  'Türkçe',
  'Sosyal Bilimler',
  'Temel Matematik',
  'Fen Bilimleri'
];

const aytSubjects = [
  'Matematik',
  'Fizik',
  'Kimya',
  'Biyoloji',
  'Edebiyat',
  'Tarih-1',
  'Coğrafya-1',
  'Tarih-2',
  'Coğrafya-2',
  'Felsefe',
  'Din Kültürü',
  'Yabancı Dil'
];

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const StyledCard = styled(Card)(({ theme, color = '#abe7ff' }) => ({
  borderRadius: 20,
  background: 'linear-gradient(145deg, #ffffff 0%, #f5f8ff 100%)',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(85, 179, 217, 0.15)',
  border: '1px solid rgba(85, 179, 217, 0.1)',
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.15), 0 8px 15px rgba(85, 179, 217, 0.2)'
  }
}));

// Subject color mapping for charts
const getSubjectColor = (subject) => {
  const colors = {
    'Türkçe': '#FF6B6B',
    'Matematik': '#4ECDC4',
    'Fizik': '#45B7D1',
    'Kimya': '#98D4BB',
    'Biyoloji': '#F9C74F',
    'Tarih': '#F8961E',
    'Coğrafya': '#90BE6D',
    'Felsefe': '#577590',
    'Din Kültürü': '#F94144',
    'Yabancı Dil': '#F2CC8F'
  };
  return colors[subject] || '#4ECDC4';
};

const TytAytNetTakibi = () => {
  const [user] = useState(null);
  const [examType, setExamType] = useState('TYT');
  const [subject, setSubject] = useState('');
  const [correctCount, setCorrectCount] = useState('');
  const [incorrectCount, setIncorrectCount] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examName, setExamName] = useState('');
  const [netRecords, setNetRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});
  const [selectedGraphSubject, setSelectedGraphSubject] = useState('');
  const [selectedRecordsSubject, setSelectedRecordsSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [chartType, setChartType] = useState('bar');

  // Bildirim sistemini kullan
  const { addNotification } = useNotifications() || { addNotification: () => {} };

  // Calculate net
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
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Gelişim takibi ve uyarı sistemi
  const compareWithPreviousRecord = useCallback((newRecord) => {
    try {
      if (!netRecords || netRecords.length === 0) return;
      
      // Aynı ders ve sınav türü için önceki kayıtları bul
      const previousRecords = netRecords.filter(record => 
        record.examType === newRecord.examType && 
        record.subject === newRecord.subject
      );
      
      if (previousRecords.length === 0) return;
      
      // Tarihe göre sırala (en yeniden en eskiye)
      const sortedRecords = [...previousRecords].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      // En son kayıt
      const lastRecord = sortedRecords[0];
      
      // Yeni kayıt ile son kaydı karşılaştır
      const lastNet = parseFloat(lastRecord.net);
      const newNet = parseFloat(newRecord.net);
      
      // Net değişimi
      const netDifference = (newNet - lastNet).toFixed(2);
      
      // Bildirim oluştur
      if (netDifference < 0) {
        // Net düşmüş
        const message = `${newRecord.subject} dersinde bir önceki denemene göre ${Math.abs(netDifference)} net düşüş var. Daha fazla çalışmalısın!`;
        if (addNotification) {
          addNotification(message, 'warning', {
            examType: newRecord.examType,
            subject: newRecord.subject,
            netDifference
          });
        }
      } else if (netDifference > 0) {
        // Net artmış
        const message = `${newRecord.subject} dersinde bir önceki denemene göre ${netDifference} net artış var. Harika ilerliyorsun!`;
        if (addNotification) {
          addNotification(message, 'success', {
            examType: newRecord.examType,
            subject: newRecord.subject,
            netDifference
          });
        }
      } else {
        // Net değişmemiş
        const message = `${newRecord.subject} dersinde bir önceki deneme ile aynı neti yaptın. Biraz daha çalışarak netini artırabilirsin.`;
        if (addNotification) {
          addNotification(message, 'info', {
            examType: newRecord.examType,
            subject: newRecord.subject,
            netDifference
          });
        }
      }
    } catch (error) {
      console.error('Gelişim takibi karşılaştırmasında hata:', error);
    }
  }, [netRecords, addNotification]);
  
  // Fetch existing net records
  useEffect(() => {
    const fetchNetRecords = async () => {
      try {
        if (!user) {
        // Even if user is not logged in, try to load from localStorage
        try {
          const cachedRecords = localStorage.getItem('netRecords_anonymous');
          if (cachedRecords) {
            const parsedRecords = JSON.parse(cachedRecords);
            // Convert date strings back to Date objects
            const processedRecords = parsedRecords.map(record => ({
              ...record,
              date: new Date(record.date)
            }));
            setNetRecords(processedRecords);
          }
        } catch (localStorageError) {
          console.error('Error loading from localStorage:', localStorageError);
        }
        setLoading(false);
        return;
      }
      } catch (error) {
        console.error('Kullanıcı kontrolünde hata:', error);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // First try to get cached records from localStorage
        let cachedRecords = [];
        try {
          const cachedData = localStorage.getItem(`netRecords_${user.uid}`);
          if (cachedData) {
            cachedRecords = JSON.parse(cachedData);
            // Convert date strings back to Date objects
            cachedRecords = cachedRecords.map(record => ({
              ...record,
              date: new Date(record.date instanceof Object ? record.date : new Date(record.date))
            }));
            // Immediately set these records so user sees something while Firestore loads
            setNetRecords(cachedRecords);
          }
        } catch (localStorageError) {
          console.error('Error recovering from localStorage:', localStorageError);
        }
        
        // Store current user ID for future session recovery
        localStorage.setItem('lastNetRecordsUserId', user.uid);
        
        const q = query(
          collection(db, 'netRecords'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const records = [];
        
        querySnapshot.forEach((doc) => {
          // Ensure all date fields are properly handled
          const data = doc.data();
          
          // Convert Firestore timestamps to JavaScript Date objects if needed
          const recordDate = data.date instanceof Date ? data.date : 
            data.date?.toDate ? data.date.toDate() : new Date(data.date?.seconds * 1000 || Date.now());
          
          records.push({
            id: doc.id,
            ...data,
            date: recordDate,
            net: calculateNet(data.correctCount, data.incorrectCount)
          });
        });
        
        // Merge records, preferring Firebase data but including any local-only records
        const mergedRecords = [...records];
        
        // Add any cached records that aren't in the Firestore results
        cachedRecords.forEach(cachedRecord => {
          if (!records.some(r => r.id === cachedRecord.id)) {
            mergedRecords.push(cachedRecord);
          }
        });
        
        // Sort records by date (most recent first)
        mergedRecords.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });
        
        setNetRecords(mergedRecords);
        
        // Always store in localStorage for persistence
        try {
          localStorage.setItem(`netRecords_${user.uid}`, JSON.stringify(mergedRecords));
        } catch (localStorageError) {
          console.error('Error saving to localStorage:', localStorageError);
        }
      } catch (error) {
        console.error('Error fetching net records:', error);
        
        // Try to recover from localStorage
        try {
          const cachedRecords = localStorage.getItem(`netRecords_${user.uid}`);
          if (cachedRecords) {
            const parsedRecords = JSON.parse(cachedRecords);
            // Convert date strings back to Date objects
            const processedRecords = parsedRecords.map(record => ({
              ...record,
              date: new Date(record.date)
            }));
            setNetRecords(processedRecords);
            showNotification('Kayıtlar önbelleğinizden yüklendi', 'info');
          }
        } catch (localStorageError) {
          console.error('Error recovering from localStorage:', localStorageError);
        }
        
        showNotification('Kayıtlar yüklenirken bir hata oluştu', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNetRecords();
  }, [user]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!subject) newErrors.subject = 'Lütfen bir ders seçin';
    if (!correctCount) newErrors.correctCount = 'Doğru sayısını girin';
    if (!incorrectCount) newErrors.incorrectCount = 'Yanlış sayısını girin';
    if (!examName) newErrors.examName = 'Deneme adını girin';
    if (!examDate) newErrors.examDate = 'Tarih seçin';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Otomatik olarak yeni kayıt yapıldığında o dersi seçelim
    setSelectedRecordsSubject(subject);
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Create the record object
      const newRecord = {
        userId: user ? user.uid : 'anonymous',
        examType,
        subject,
        correctCount: parseFloat(correctCount),
        incorrectCount: parseFloat(incorrectCount),
        examName,
        date: new Date(examDate),
        createdAt: new Date(),
        // Add expiration date - 24 months from now
        expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 24))
      };
      
      let docId = '';
      
      // If user is authenticated, add record to Firestore
      if (user) {
        try {
          // Add record to Firestore
          const docRef = await addDoc(collection(db, 'netRecords'), newRecord);
          docId = docRef.id;
        } catch (firestoreError) {
          console.error('Error saving to Firestore:', firestoreError);
          // Generate local ID as fallback
          docId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          showNotification('Sunucuya kaydedilemedi, yerel olarak kaydedildi', 'warning');
        }
      } else {
        // Generate a unique ID for local storage
        docId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }
      
      // Add the new record to the state with ID
      const recordWithId = {
        id: docId,
        ...newRecord,
        net: calculateNet(newRecord.correctCount, newRecord.incorrectCount)
      };
      
      // Update the netRecords state immediately
      const updatedRecords = [recordWithId, ...netRecords];
      setNetRecords(updatedRecords);
      
      // Update localStorage to ensure persistence
      try {
        const storageKey = user ? `netRecords_${user.uid}` : 'netRecords_anonymous';
        localStorage.setItem(storageKey, JSON.stringify(updatedRecords));
        if (user) {
          localStorage.setItem('lastNetRecordsUserId', user.uid);
        }
      } catch (localStorageError) {
        console.error('Error saving to localStorage:', localStorageError);
        showNotification('Kayıt yerel depolamaya kaydedilemedi', 'warning');
      }
      
      // Gelişim takibi - önceki kayıtlarla karşılaştır
      try {
        compareWithPreviousRecord(recordWithId);
      } catch (error) {
        console.error('Gelişim takibi karşılaştırmasında hata:', error);
      }
      
      showNotification(`${examType} ${subject} kaydı başarıyla eklendi!`);
      
      // Clear form
      setSubject('');
      setCorrectCount('');
      setIncorrectCount('');
      setExamName('');
      setExamDate('');
      
      // Show success notification
      showNotification('Net kaydı başarıyla eklendi!');
    } catch (error) {
      console.error('Error saving net record:', error);
      showNotification('Kayıt sırasında bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete record
  const handleDelete = async (id) => {
    try {
      // Only delete from Firestore if it's not a local record and user is logged in
      if (user && !id.startsWith('local_')) {
        await deleteDoc(doc(db, 'netRecords', id));
      }
      
      // Update state
      const updatedRecords = netRecords.filter(record => record.id !== id);
      setNetRecords(updatedRecords);
      
      // Update localStorage to ensure persistence
      try {
        const storageKey = user ? `netRecords_${user.uid}` : 'netRecords_anonymous';
        localStorage.setItem(storageKey, JSON.stringify(updatedRecords));
        
        // If this was the last record, make sure we keep track of the last userId
        if (user && updatedRecords.length === 0) {
          localStorage.setItem('lastNetRecordsUserId', user.uid);
        }
      } catch (localStorageError) {
        console.error('Error updating localStorage after deletion:', localStorageError);
      }
      
      showNotification('Kayıt başarıyla silindi');
    } catch (error) {
      console.error('Error deleting record:', error);
      showNotification('Silme işlemi sırasında bir hata oluştu', 'error');
    }
  };

  // Process data for charts
  const processChartData = () => {
    const data = {};
    
    netRecords.forEach(record => {
      if (!data[record.subject]) {
        data[record.subject] = [];
      }
      
      // Format date properly handling both Date objects and Firestore timestamps
      let formattedDate;
      if (record.date instanceof Date) {
        formattedDate = record.date.toLocaleDateString('tr-TR');
      } else if (record.date?.seconds) {
        formattedDate = new Date(record.date.seconds * 1000).toLocaleDateString('tr-TR');
      } else {
        formattedDate = 'N/A';
      }
      
      data[record.subject].push({
        name: record.examName,
        net: parseFloat(record.net),
        doğru: record.correctCount,
        yanlış: record.incorrectCount,
        date: formattedDate
      });
    });
    
    return Object.keys(data).map(subject => ({
      subject,
      color: getSubjectColor(subject),
      data: data[subject].sort((a, b) => {
        // Try to compare by date first
        const dateA = new Date(a.date.split('.').reverse().join('-'));
        const dateB = new Date(b.date.split('.').reverse().join('-'));
        
        if (!isNaN(dateA) && !isNaN(dateB)) {
          return dateA - dateB;
        }
        // Fallback to comparing by name
        return a.name.localeCompare(b.name);
      })
    }));
  };
  
  const chartData = processChartData();
  
  const formatDate = (date) => {
    if (!date || !date.seconds) return '';
    return new Date(date.seconds * 1000).toLocaleDateString('tr-TR');
  };

  return (
    <Box sx={{ 
      p: 3, 
      pt: 4, 
      pb: 4, 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4ecfb 100%)', 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background pattern */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.4,
        backgroundImage: 'radial-gradient(#55b3d9 1px, transparent 1px), radial-gradient(#55b3d9 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 20px 20px',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      {/* Page content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 4,
          pb: 2,
          borderBottom: '2px solid rgba(63, 81, 181, 0.2)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -2,
            left: 0,
            width: '120px',
            height: '2px',
            background: 'linear-gradient(90deg, #3f51b5, #55b3d9)',
            borderRadius: '2px'
          }
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 800, 
            background: 'linear-gradient(90deg, #3f51b5, #55b3d9)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Poppins, Quicksand, sans-serif',
            display: 'flex',
            alignItems: 'center',
            letterSpacing: '-0.5px'
          }}>
            <SchoolIcon sx={{ mr: 1.5, fontSize: 36, color: '#3f51b5' }} />
            TYT-AYT Net Takibi
          </Typography>
          
          <Button
            startIcon={showAddForm ? <CloseIcon /> : <AddIcon />}
            onClick={() => {
              setShowAddForm(!showAddForm);
            }}
            variant="contained"
            sx={{
              background: showAddForm 
                ? 'linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%)' 
                : 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
              fontWeight: 600,
              borderRadius: '30px',
              padding: '10px 24px',
              transition: 'all 0.3s ease',
              boxShadow: showAddForm 
                ? '0 4px 15px rgba(255, 65, 108, 0.4)' 
                : '0 4px 15px rgba(71, 118, 230, 0.4)',
              '&:hover': {
                boxShadow: showAddForm 
                  ? '0 8px 25px rgba(255, 65, 108, 0.5)' 
                  : '0 8px 25px rgba(71, 118, 230, 0.5)',
                transform: 'translateY(-3px)'
              }
            }}
          >
            {showAddForm ? 'Formu Kapat' : 'Yeni Net Ekle'}
          </Button>
        </Box>

        {/* Main content */}
        <Grid container spacing={4}>
          {/* Form section - conditionally rendered */}
          {showAddForm && (
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <StyledCard sx={{ 
                  p: 4, 
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
                  borderRadius: '24px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(63, 81, 181, 0.15)',
                  border: '1px solid rgba(63, 81, 181, 0.1)',
                  overflow: 'visible'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 2,
                    borderBottom: '1px solid rgba(63, 81, 181, 0.1)',
                    overflow: 'visible'
                  }}>
                  <Avatar sx={{ 
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)', 
                    mr: 2,
                    boxShadow: '0 4px 10px rgba(71, 118, 230, 0.3)',
                    transform: 'translateY(-4px)'
                  }}>
                    <AddIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    background: 'linear-gradient(90deg, #3f51b5, #8E54E9)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.5px'
                  }}>
                    Yeni Net Ekle
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Doğru Sayısı"
                      type="number"
                      value={correctCount}
                      onChange={(e) => setCorrectCount(e.target.value)}
                      fullWidth
                      margin="normal"
                      error={!!errors.correctCount}
                      helperText={errors.correctCount}
                      InputProps={{ 
                        startAdornment: (
                          <Box sx={{ 
                            mr: 1, 
                            display: 'flex', 
                            alignItems: 'center',
                            color: '#4CAF50'
                          }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              bgcolor: '#4CAF50',
                              mr: 0.5 
                            }} />
                          </Box>
                        ),
                        sx: { 
                          backgroundColor: 'rgba(76, 175, 80, 0.08)', 
                          borderRadius: 2,
                          '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.12)' },
                          '&.Mui-focused': { backgroundColor: 'rgba(76, 175, 80, 0.12)' }
                        }
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(76, 175, 80, 0.3)' },
                          '&:hover fieldset': { borderColor: '#4CAF50' },
                          '&.Mui-focused fieldset': { borderColor: '#4CAF50' }
                        },
                        '& .MuiInputLabel-root': { color: '#4CAF50' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#4CAF50' }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Yanlış Sayısı"
                      type="number"
                      value={incorrectCount}
                      onChange={(e) => setIncorrectCount(e.target.value)}
                      fullWidth
                      margin="normal"
                      error={!!errors.incorrectCount}
                      helperText={errors.incorrectCount}
                      InputProps={{ 
                        startAdornment: (
                          <Box sx={{ 
                            mr: 1, 
                            display: 'flex', 
                            alignItems: 'center',
                            color: '#F44336'
                          }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              bgcolor: '#F44336',
                              mr: 0.5 
                            }} />
                          </Box>
                        ),
                        sx: { 
                          backgroundColor: 'rgba(244, 67, 54, 0.08)', 
                          borderRadius: 2,
                          '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.12)' },
                          '&.Mui-focused': { backgroundColor: 'rgba(244, 67, 54, 0.12)' }
                        }
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(244, 67, 54, 0.3)' },
                          '&:hover fieldset': { borderColor: '#F44336' },
                          '&.Mui-focused fieldset': { borderColor: '#F44336' }
                        },
                        '& .MuiInputLabel-root': { color: '#F44336' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#F44336' }
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ color: '#6200EA', fontWeight: 500 }}>Sınav Türü</InputLabel>
                      <Select
                        value={examType}
                        onChange={(e) => {
                          setExamType(e.target.value);
                          setSubject('');
                        }}
                        label="Sınav Türü"
                        sx={{
                          borderRadius: 2,
                          backgroundColor: 'rgba(98, 0, 234, 0.04)',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98, 0, 234, 0.3)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98, 0, 234, 0.5)' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6200EA' },
                          '& .MuiSelect-select': { fontWeight: 500 }
                        }}
                      >
                        <MenuItem value="TYT" sx={{ 
                          fontWeight: examType === 'TYT' ? 600 : 400,
                          color: examType === 'TYT' ? '#6200EA' : 'inherit'
                        }}>
                          TYT
                        </MenuItem>
                        <MenuItem value="AYT" sx={{ 
                          fontWeight: examType === 'AYT' ? 600 : 400,
                          color: examType === 'AYT' ? '#6200EA' : 'inherit'
                        }}>
                          AYT
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Sınav Adı"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      fullWidth
                      margin="normal"
                      error={!!errors.examName}
                      helperText={errors.examName}
                      InputProps={{ 
                        startAdornment: (
                          <Box sx={{ 
                            mr: 1, 
                            display: 'flex', 
                            alignItems: 'center',
                            color: '#6200EA'
                          }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              bgcolor: '#6200EA',
                              mr: 0.5 
                            }} />
                          </Box>
                        ),
                        sx: { 
                          backgroundColor: 'rgba(98, 0, 234, 0.04)', 
                          borderRadius: 2,
                          '&:hover': { backgroundColor: 'rgba(98, 0, 234, 0.08)' },
                          '&.Mui-focused': { backgroundColor: 'rgba(98, 0, 234, 0.08)' }
                        }
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(98, 0, 234, 0.3)' },
                          '&:hover fieldset': { borderColor: '#6200EA' },
                          '&.Mui-focused fieldset': { borderColor: '#6200EA' }
                        },
                        '& .MuiInputLabel-root': { color: '#6200EA' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#6200EA' }
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, position: 'relative' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    onClick={handleSubmit}
                    startIcon={<AddIcon />}
                    sx={{
                      py: 1.8,
                      borderRadius: '30px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      letterSpacing: '0.5px',
                      textTransform: 'none',
                      background: 'linear-gradient(45deg, #6200EA 0%, #B388FF 100%)',
                      boxShadow: '0 10px 20px rgba(98, 0, 234, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 15px 30px rgba(98, 0, 234, 0.4)',
                        background: 'linear-gradient(45deg, #5600D1 0%, #A370FF 100%)'
                      },
                      '&:active': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 5px 15px rgba(98, 0, 234, 0.4)'
                      }
                    }}
                  >
                    Kaydet ve Tamamla
                  </Button>
                  <Box sx={{
                    position: 'absolute',
                    bottom: -15,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                  }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(98, 0, 234, 0.7)',
                        fontStyle: 'italic',
                        fontWeight: 500
                      }}
                    >
                      Tüm alanları doldurduğunuzdan emin olun
                    </Typography>
                  </Box>
                </Box>
              </StyledCard>
            </motion.div>
          </Grid>
        )}

        {/* Grafik ve Tablo Bölümü */}
        <Grid item xs={12} md={showAddForm ? 6 : 12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              background: 'linear-gradient(145deg, #ffffff 0%, #f5f8ff 100%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(63, 81, 181, 0.15)',
              border: '1px solid rgba(63, 81, 181, 0.1)',
              height: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '4px', 
              background: 'linear-gradient(90deg, #55b3d9 0%, #5db6d9 100%)' 
            }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 700, 
                  mb: 0,
                  fontFamily: 'Poppins, Quicksand, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#3f51b5',
                  '&::before': { 
                    content: '""', 
                    width: 3, 
                    height: 18, 
                    backgroundColor: '#3f51b5', 
                    borderRadius: 4, 
                    marginRight: 1.5 
                  },
                }}
              >
                Net Kayıtları
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Sınav Türü Butonları */}
                <ButtonGroup variant="outlined" size="small">
                  <Button 
                    onClick={() => {
                      setSelectedExamType('TYT');
                      setSelectedRecordsSubject('');
                    }}
                    sx={{
                      backgroundColor: selectedExamType === 'TYT' ? 'rgba(85, 179, 217, 0.1)' : 'transparent',
                      borderColor: 'rgba(85, 179, 217, 0.3)',
                      color: selectedExamType === 'TYT' ? '#55b3d9' : 'text.secondary',
                      fontWeight: selectedExamType === 'TYT' ? 600 : 400,
                      '&:hover': {
                        backgroundColor: 'rgba(85, 179, 217, 0.08)',
                        borderColor: 'rgba(85, 179, 217, 0.5)',
                      }
                    }}
                  >
                    TYT
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedExamType('AYT');
                      setSelectedRecordsSubject('');
                    }}
                    sx={{
                      backgroundColor: selectedExamType === 'AYT' ? 'rgba(85, 179, 217, 0.1)' : 'transparent',
                      borderColor: 'rgba(85, 179, 217, 0.3)',
                      color: selectedExamType === 'AYT' ? '#55b3d9' : 'text.secondary',
                      fontWeight: selectedExamType === 'AYT' ? 600 : 400,
                      '&:hover': {
                        backgroundColor: 'rgba(85, 179, 217, 0.08)',
                        borderColor: 'rgba(85, 179, 217, 0.5)'
                      }
                    }}
                  >
                    AYT
                  </Button>
                </ButtonGroup>
                
                {/* Grafik Görünümü Butonları */}
                <ButtonGroup variant="outlined" size="small" sx={{ ml: 'auto' }}>
                  <Tooltip title="Çubuk Grafik">
                    <Button 
                      onClick={() => setChartType('bar')}
                      sx={{
                        backgroundColor: chartType === 'bar' ? 'rgba(85, 179, 217, 0.1)' : 'transparent',
                        borderColor: 'rgba(85, 179, 217, 0.3)',
                        color: chartType === 'bar' ? '#55b3d9' : 'text.secondary',
                        '&:hover': {
                          backgroundColor: 'rgba(85, 179, 217, 0.08)',
                        }
                      }}
                    >
                      <BarChartIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Çizgi Grafik">
                    <Button 
                      onClick={() => setChartType('line')}
                      sx={{
                        backgroundColor: chartType === 'line' ? 'rgba(85, 179, 217, 0.1)' : 'transparent',
                        borderColor: 'rgba(85, 179, 217, 0.3)',
                        color: chartType === 'line' ? '#55b3d9' : 'text.secondary',
                        '&:hover': {
                          backgroundColor: 'rgba(85, 179, 217, 0.08)',
                        }
                      }}
                    >
                      <TimelineIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Pasta Grafik">
                    <Button 
                      onClick={() => setChartType('pie')}
                      sx={{
                        backgroundColor: chartType === 'pie' ? 'rgba(85, 179, 217, 0.1)' : 'transparent',
                        borderColor: 'rgba(85, 179, 217, 0.3)',
                        color: chartType === 'pie' ? '#55b3d9' : 'text.secondary',
                        '&:hover': {
                          backgroundColor: 'rgba(85, 179, 217, 0.08)',
                        }
                      }}
                    >
                      <PieChartIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                </ButtonGroup>
                
                {/* Ders Seçim Menüsü */}
                {selectedExamType && (
                  <FormControl sx={{ minWidth: 180 }}>
                    <Select
                      value={selectedRecordsSubject}
                      onChange={(e) => setSelectedRecordsSubject(e.target.value)}
                      displayEmpty
                      size="small"
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(85, 179, 217, 0.2)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(85, 179, 217, 0.5)' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#55b3d9' },
                        '& .MuiSelect-select': { fontWeight: 500, py: 1 }
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
                      <MenuItem value="" sx={{ borderRadius: 1, my: 0.5, mx: 0.5 }}>
                        <em>Tüm {selectedExamType} Dersleri</em>
                      </MenuItem>
                      {selectedExamType === 'TYT' 
                        ? tytSubjects.map(subj => (
                            <MenuItem 
                              key={subj} 
                              value={subj}
                              sx={{
                                borderRadius: 1, 
                                my: 0.5, 
                                mx: 0.5, 
                                fontWeight: selectedRecordsSubject === subj ? 600 : 400,
                                borderLeft: selectedRecordsSubject === subj ? '3px solid #3f51b5' : 'none',
                                pl: selectedRecordsSubject === subj ? 1.5 : 2
                              }}
                            >
                              {subj}
                            </MenuItem>
                          ))
                        : aytSubjects.map(subj => (
                            <MenuItem 
                              key={subj} 
                              value={subj}
                              sx={{
                                borderRadius: 1, 
                                my: 0.5, 
                                mx: 0.5, 
                                fontWeight: selectedRecordsSubject === subj ? 600 : 400,
                                borderLeft: selectedRecordsSubject === subj ? '3px solid #3f51b5' : 'none',
                                pl: selectedRecordsSubject === subj ? 1.5 : 2
                              }}
                            >
                              {subj}
                            </MenuItem>
                          ))
                      }
                    </Select>
                  </FormControl>
                )}
                
                {/* Sıfırlama Butonu */}
                {(selectedExamType || selectedRecordsSubject) && (
                  <Tooltip title="Filtreleri Sıfırla">
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSelectedExamType('');
                        setSelectedRecordsSubject('');
                      }}
                      sx={{ color: 'text.secondary' }}
                    >
                      <RestartAltIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress size={40} thickness={4} sx={{ color: '#55b3d9' }} />
              </Box>
            ) : netRecords.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                my: 4, 
                p: 4, 
                bgcolor: 'rgba(63, 81, 181, 0.04)',
                borderRadius: 2,
                border: '1px dashed rgba(63, 81, 181, 0.2)'
              }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(63, 81, 181, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  animation: `${pulse} 1.5s infinite`
                }}>
                  <QueryStatsIcon sx={{ fontSize: 40, color: '#3f51b5' }} />
                </Box>
                <Typography variant="h6" color="primary" fontWeight={600} textAlign="center">
                  Lütfen verileri görmek istediğiniz dersi seçiniz
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  {selectedExamType === 'TYT' ? 'TYT' : 'AYT'} derslerinden birini seçtiğinizde ilgili kayıtlar burada görünecek 📊
                </Typography>
                <Box sx={{ 
                  mt: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(63, 81, 181, 0.08)',
                  p: 1.5,
                  px: 2,
                  borderRadius: 2
                }}>
                  <HelpOutlineIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    İpucu: Yukarıdaki menüden bir ders seçin
                  </Typography>
                </Box>
              </Box>
            ) : netRecords.length === 0 ? (
              <Box sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
                <Typography variant="body1">Henüz net kaydı bulunmuyor.</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Denemelere girip netlerinizi takip etmek için yukarıdaki formu doldurun.
                </Typography>
              </Box>
            ) : netRecords.filter(record => {
              // Hem sınav türü hem de ders seçildiğinde kayıtları göster
              if (selectedExamType && selectedRecordsSubject) {
                return record.examType === selectedExamType && record.subject === selectedRecordsSubject;
              }
              // Hiçbir filtre seçilmediğinde tüm kayıtları göster
              if (!selectedExamType && !selectedRecordsSubject) {
                return true;
              }
              // Diğer durumlarda hiçbir kayıt gösterme
              return false;
            }).length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                my: 4, 
                p: 4, 
                bgcolor: 'rgba(0,0,0,0.02)',
                borderRadius: 2,
                border: '1px dashed rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <HelpOutlineIcon sx={{ fontSize: 30, color: 'text.disabled' }} />
                </Box>
                {selectedRecordsSubject ? (
                  <>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                      {selectedRecordsSubject} dersine ait kayıt bulunmuyor.
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                      Bu ders için kayıt oluşturmak için sol taraftaki formu kullanabilirsiniz.
                    </Typography>
                  </>
                ) : selectedExamType ? (
                  <>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                      {selectedExamType} sınavına ait kayıt bulunmuyor.
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                      {selectedExamType} dersleri için kayıt oluşturmak için sol taraftaki formu kullanabilirsiniz.
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                      Henüz net kaydı bulunmuyor.
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                      Denemelere girip netlerinizi takip etmek için yukarıdaki formu doldurun.
                    </Typography>
                  </>
                )}
              </Box>
            ) : (
              <>
                <TableContainer sx={{ mb: 4, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.15) 0%, rgba(63, 81, 181, 0.25) 100%)' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#3f51b5', py: 2, fontSize: '0.95rem' }}>Deneme</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#3f51b5', py: 2, fontSize: '0.95rem' }}>Sınav Türü</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#3f51b5', py: 2, fontSize: '0.95rem' }}>Ders</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#4caf50', py: 2, fontSize: '0.95rem' }}>Doğru</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#f44336', py: 2, fontSize: '0.95rem' }}>Yanlış</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#3f51b5', py: 2, fontSize: '0.95rem' }}>Net</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#3f51b5', py: 2, fontSize: '0.95rem' }}>Tarih</TableCell>
                        <TableCell sx={{ py: 2 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {netRecords
                        .filter(record => {
                          // Hem sınav türü hem de ders seçildiğinde kayıtları göster
                          if (selectedExamType && selectedRecordsSubject) {
                            return record.examType === selectedExamType && record.subject === selectedRecordsSubject;
                          }
                          // Diğer durumlarda hiçbir kayıt gösterme
                          return false;
                        })
                        .map((record, index) => {
                        // Her ders için farklı bir renk tonu belirle
                        const subjectColors = {
                          'Türkçe': '#3f51b5',
                          'Sosyal Bilimler': '#673ab7',
                          'Temel Matematik': '#2196f3',
                          'Fen Bilimleri': '#009688',
                          'Matematik': '#2196f3',
                          'Fizik': '#00bcd4',
                          'Kimya': '#009688',
                          'Biyoloji': '#4caf50',
                          'Edebiyat': '#ff9800',
                          'Tarih-1': '#795548',
                          'Coğrafya-1': '#607d8b',
                          'Tarih-2': '#8d6e63',
                          'Coğrafya-2': '#78909c',
                          'Felsefe': '#9c27b0',
                          'Din Kültürü': '#f44336',
                          'Yabancı Dil': '#e91e63'
                        };
                        
                        const subjectColor = subjectColors[record.subject] || '#3f51b5';
                        const rowBgColor = index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'white';
                        
                        return (
                          <TableRow 
                            key={record.id} 
                            sx={{ 
                              bgcolor: rowBgColor,
                              '&:hover': { bgcolor: `${subjectColor}10` },
                              transition: 'background-color 0.2s ease',
                              borderLeft: `3px solid ${subjectColor}50`
                            }}
                          >
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: '#333',
                              fontSize: '0.9rem',
                              py: 1.8
                            }}>
                              {record.examName}
                            </TableCell>
                            <TableCell sx={{ py: 1.8 }}>
                              <Chip 
                                label={record.examType} 
                                size="small" 
                                sx={{ 
                                  fontWeight: 700, 
                                  bgcolor: record.examType === 'TYT' ? 'rgba(63, 81, 181, 0.15)' : 'rgba(156, 39, 176, 0.15)',
                                  color: record.examType === 'TYT' ? '#3f51b5' : '#9c27b0',
                                  border: record.examType === 'TYT' ? '1px solid rgba(63, 81, 181, 0.3)' : '1px solid rgba(156, 39, 176, 0.3)',
                                  borderRadius: 1,
                                  py: 0.8,
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }} 
                              />
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 600, 
                              color: subjectColor,
                              fontSize: '0.9rem',
                              py: 1.8
                            }}>
                              {record.subject}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: '#4caf50',
                              fontSize: '1rem',
                              py: 1.8,
                              bgcolor: 'rgba(76, 175, 80, 0.05)'
                            }}>
                              {record.correctCount}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: '#f44336',
                              fontSize: '1rem',
                              py: 1.8,
                              bgcolor: 'rgba(244, 67, 54, 0.05)'
                            }}>
                              {record.incorrectCount}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 800, 
                              color: subjectColor,
                              fontSize: '1.1rem',
                              py: 1.8,
                              bgcolor: `${subjectColor}10`,
                              borderRadius: 1,
                              textAlign: 'center',
                              boxShadow: 'inset 0 0 5px rgba(0,0,0,0.05)'
                            }}>
                              {record.net}
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 500,
                              fontSize: '0.85rem',
                              py: 1.8,
                              color: 'text.secondary'
                            }}>
                              {record.date instanceof Date ? record.date.toLocaleDateString('tr-TR') : formatDate(record.date)}
                            </TableCell>
                            <TableCell sx={{ py: 1.8 }}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDelete(record.id)}
                                sx={{
                                  color: 'rgba(244, 67, 54, 0.7)',
                                  '&:hover': {
                                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                                    color: '#f44336'
                                  },
                                  boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {chartData.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 700, 
                        mb: 3,
                        fontFamily: 'Poppins, Quicksand, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#3f51b5',
                        '&::before': { 
                          content: '""', 
                          width: 3, 
                          height: 18, 
                          backgroundColor: '#3f51b5', 
                          borderRadius: 4, 
                          marginRight: 1.5 
                        },
                      }}
                    >
                      Net Gelişim Grafiği
                    </Typography>
                    
                    {/* Ders seçim butonları */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1, 
                      mb: 3,
                      justifyContent: { xs: 'center', sm: 'flex-start' }
                    }}>
                      {chartData.map((item) => {
                        // Her ders için farklı bir renk tonu belirle
                        const subjectColors = {
                          'Türkçe': '#3f51b5',
                          'Sosyal Bilimler': '#673ab7',
                          'Temel Matematik': '#2196f3',
                          'Fen Bilimleri': '#009688',
                          'Matematik': '#2196f3',
                          'Fizik': '#00bcd4',
                          'Kimya': '#009688',
                          'Biyoloji': '#4caf50',
                          'Edebiyat': '#ff9800',
                          'Tarih-1': '#795548',
                          'Coğrafya-1': '#607d8b',
                          'Tarih-2': '#8d6e63',
                          'Coğrafya-2': '#78909c',
                          'Felsefe': '#9c27b0',
                          'Din Kültürü': '#f44336',
                          'Yabancı Dil': '#e91e63'
                        };
                        
                        const color = subjectColors[item.subject] || '#3f51b5';
                        const isSelected = selectedGraphSubject === item.subject;
                        
                        return (
                          <Button 
                            key={item.subject}
                            variant={isSelected ? "contained" : "outlined"}
                            onClick={() => setSelectedGraphSubject(item.subject)}
                            sx={{
                              borderRadius: 2,
                              px: 2,
                              py: 1,
                              fontWeight: 600,
                              borderColor: isSelected ? color : `${color}50`,
                              color: isSelected ? 'white' : color,
                              backgroundColor: isSelected ? color : 'transparent',
                              '&:hover': {
                                backgroundColor: isSelected ? color : `${color}15`,
                                borderColor: color,
                              },
                              boxShadow: isSelected ? `0 4px 12px ${color}40` : 'none',
                            }}
                          >
                            {item.subject}
                          </Button>
                        );
                      })}
                    </Box>
                    
                    {/* Seçilen dersin grafiği */}
                    {selectedGraphSubject ? (
                      (() => {
                        const selectedData = chartData.find(item => item.subject === selectedGraphSubject);
                        if (!selectedData || selectedData.data.length === 0) {
                          return (
                            <Paper 
                              elevation={0}
                              sx={{ 
                                p: 5, 
                                borderRadius: 2, 
                                textAlign: 'center',
                                bgcolor: 'rgba(0,0,0,0.02)',
                                border: '1px dashed rgba(0,0,0,0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2
                              }}
                            >
                              <Box sx={{ 
                                width: 80, 
                                height: 80, 
                                borderRadius: '50%', 
                                bgcolor: 'rgba(0,0,0,0.04)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <HelpOutlineIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                              </Box>
                              <Typography color="text.secondary" fontWeight={500} fontSize="1.1rem">
                                {selectedGraphSubject} dersine ait net verisi bulunamadı.
                              </Typography>
                              <Typography color="text.disabled" fontSize="0.9rem" sx={{ maxWidth: 400 }}>
                                Bu ders için net kaydı oluşturmak için sol taraftaki formu kullanabilirsiniz.
                              </Typography>
                            </Paper>
                          );
                        }
                        
                        const subjectColors = {
                          'Türkçe': '#3f51b5',
                          'Sosyal Bilimler': '#673ab7',
                          'Temel Matematik': '#2196f3',
                          'Fen Bilimleri': '#009688',
                          'Matematik': '#2196f3',
                          'Fizik': '#00bcd4',
                          'Kimya': '#009688',
                          'Biyoloji': '#4caf50',
                          'Edebiyat': '#ff9800',
                          'Tarih-1': '#795548',
                          'Coğrafya-1': '#607d8b',
                          'Tarih-2': '#8d6e63',
                          'Coğrafya-2': '#78909c',
                          'Felsefe': '#9c27b0',
                          'Din Kültürü': '#f44336',
                          'Yabancı Dil': '#e91e63'
                        };
                        
                        const color = subjectColors[selectedData.subject] || '#3f51b5';
                        const lightColor = `${color}20`;
                        
                        return (
                          <Card 
                            sx={{ 
                              borderRadius: 2,
                              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                              border: `1px solid ${color}30`,
                              overflow: 'hidden',
                              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 32px rgba(0,0,0,0.12)'
                              }
                            }}
                          >
                            <Box sx={{ 
                              p: 0.5, 
                              background: `linear-gradient(90deg, ${color} 0%, ${color}90 100%)`,
                            }} />
                            <CardContent sx={{ p: 2.5 }}>
                              <Typography 
                                variant="subtitle1" 
                                gutterBottom
                                sx={{ 
                                  fontWeight: 700, 
                                  color: color,
                                  fontFamily: 'Poppins, Quicksand, sans-serif',
                                  fontSize: '1.1rem',
                                  mb: 2
                                }}
                              >
                                {selectedData.subject} Net Gelişimi
                              </Typography>
                              
                              <Box sx={{ 
                                height: 350, 
                                background: `linear-gradient(145deg, #ffffff 0%, ${lightColor} 100%)`,
                                borderRadius: 2,
                                p: 2,
                                boxShadow: 'inset 0 1px 8px rgba(0,0,0,0.05)'
                              }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={selectedData.data}
                                    margin={{
                                      top: 5,
                                      right: 30,
                                      left: 20,
                                      bottom: 5,
                                    }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                      dataKey="name" 
                                      angle={-45} 
                                      textAnchor="end"
                                      height={70}
                                      tick={{ fontSize: 12, fill: '#666' }}
                                      axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                                    />
                                    <YAxis 
                                      domain={[0, 40]}
                                      allowDecimals={false}
                                      tick={{ fontSize: 12, fill: '#666' }}
                                      axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                                    />
                                    <RechartsTooltip />
                                    <Tooltip 
                                      formatter={(value) => [Math.round(value), 'Net']}
                                      contentStyle={{ 
                                        borderRadius: 8, 
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)', 
                                        border: 'none' 
                                      }} 
                                    />
                                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                                    <Bar 
                                      dataKey="net" 
                                      name="Net" 
                                      fill={color} 
                                      radius={[6, 6, 0, 0]} 
                                      barSize={30}
                                      animationDuration={1500}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })()
                    ) : (
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 5, 
                          borderRadius: 2, 
                          textAlign: 'center',
                          bgcolor: 'rgba(63, 81, 181, 0.05)',
                          border: '1px dashed rgba(63, 81, 181, 0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2
                        }}
                      >
                        <Box sx={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: '50%', 
                          bgcolor: 'rgba(63, 81, 181, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <QueryStatsIcon sx={{ fontSize: 40, color: '#3f51b5' }} />
                        </Box>
                        <Typography color="primary" fontWeight={600} fontSize="1.1rem">
                          Lütfen grafik görmek istediğiniz dersi yukarıdan seçin.
                        </Typography>
                        <Typography color="text.secondary" fontSize="0.9rem" sx={{ maxWidth: 400 }}>
                          Ders butonlarına tıklayarak ilgili dersin net gelişim grafiğini görebilirsiniz.
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
      </Box>

      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            fontWeight: 500,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TytAytNetTakibi;
