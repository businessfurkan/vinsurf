import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormHelperText,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DeleteIcon from '@mui/icons-material/Delete';

import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
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

const TytAytNetTakibi = () => {
  const [user] = useAuthState(auth);
  const [examType, setExamType] = useState('TYT');
  const [subject, setSubject] = useState('');
  const [correctCount, setCorrectCount] = useState('');
  const [incorrectCount, setIncorrectCount] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [errors, setErrors] = useState({});
  const [netRecords, setNetRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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

  // Fetch existing net records
  useEffect(() => {
    const fetchNetRecords = async () => {
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
    <Box sx={{ p: 3, pt: 5, pb: 4, background: '#FFFFF0', minHeight: '100vh' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)' }} />
      <Typography 
        variant="h5" 
        fontWeight="bold"
        gutterBottom
        sx={{ 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center', 
          '&::before': { 
            content: '""', 
            width: 5, 
            height: 24, 
            backgroundColor: 'primary.main', 
            borderRadius: 4, 
            marginRight: 1.5 
          },
          fontFamily: 'Poppins, Quicksand, sans-serif',
        }}
      >
        TYT-AYT Net Takibi
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              background: 'linear-gradient(145deg, #ffffff 0%, #f5f8ff 100%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(63, 81, 181, 0.15)',
              border: '1px solid rgba(63, 81, 181, 0.1)',
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
              background: 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)' 
            }} />
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 700, 
                mb: 2,
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
              Yeni Net Ekle
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Sınav Türü</InputLabel>
              <Select
                value={examType}
                onChange={(e) => {
                  setExamType(e.target.value);
                  setSubject('');
                }}
                label="Sınav Türü"
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(63, 81, 181, 0.2)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(63, 81, 181, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3f51b5' },
                  '& .MuiSelect-select': { fontWeight: 500 }
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
                <MenuItem value="TYT" sx={{ borderRadius: 1, my: 0.5, mx: 0.5, fontWeight: examType === 'TYT' ? 600 : 400 }}>TYT</MenuItem>
                <MenuItem value="AYT" sx={{ borderRadius: 1, my: 0.5, mx: 0.5, fontWeight: examType === 'AYT' ? 600 : 400 }}>AYT</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" error={!!errors.subject}>
              <InputLabel>Ders</InputLabel>
              <Select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                label="Ders"
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(63, 81, 181, 0.2)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(63, 81, 181, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3f51b5' },
                  '& .MuiSelect-select': { fontWeight: 500 }
                }}
                MenuProps={{ 
                  PaperProps: { 
                    sx: { 
                      borderRadius: 2, 
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)', 
                      mt: 0.5,
                      maxHeight: 300
                    } 
                  } 
                }}
              >
                {examType === 'TYT' 
                  ? tytSubjects.map(subj => (
                      <MenuItem 
                        key={subj} 
                        value={subj}
                        sx={{
                          borderRadius: 1, 
                          my: 0.5, 
                          mx: 0.5, 
                          fontWeight: subject === subj ? 600 : 400,
                          borderLeft: subject === subj ? '3px solid #3f51b5' : 'none',
                          pl: subject === subj ? 1.5 : 2
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
                          fontWeight: subject === subj ? 600 : 400,
                          borderLeft: subject === subj ? '3px solid #3f51b5' : 'none',
                          pl: subject === subj ? 1.5 : 2
                        }}
                      >
                        {subj}
                      </MenuItem>
                    ))
                }
              </Select>
              {errors.subject && <FormHelperText>{errors.subject}</FormHelperText>}
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
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
                    inputProps: { min: 0 },
                    sx: { 
                      borderRadius: 2,
                      '& input': { fontWeight: 600, textAlign: 'center', fontSize: '1.1rem', color: '#4caf50' }
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#4caf50' }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
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
                    inputProps: { min: 0 },
                    sx: { 
                      borderRadius: 2,
                      '& input': { fontWeight: 600, textAlign: 'center', fontSize: '1.1rem', color: '#f44336' }
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f44336' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f44336' },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#f44336' }
                  }}
                />
              </Grid>
            </Grid>

            <Box 
              sx={{ 
                p: 2.5, 
                background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.08) 0%, rgba(63, 81, 181, 0.15) 100%)', 
                borderRadius: 3, 
                mt: 3, 
                mb: 3,
                border: '1px solid rgba(63, 81, 181, 0.2)',
                boxShadow: '0 4px 12px rgba(63, 81, 181, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                NET SONUÇ
              </Typography>
              <Typography 
                variant="h4" 
                align="center" 
                sx={{ 
                  fontWeight: 800, 
                  color: '#3f51b5',
                  fontFamily: 'Poppins, Quicksand, sans-serif',
                }}
              >
                {calculateNet(correctCount, incorrectCount)}
              </Typography>
            </Box>

            <TextField
              label="Deneme Adı"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              fullWidth
              margin="normal"
              error={!!errors.examName}
              helperText={errors.examName}
              InputProps={{ 
                sx: { 
                  borderRadius: 2,
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(63, 81, 181, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3f51b5' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3f51b5' }
              }}
            />

            <TextField
              label="Tarih"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={!!errors.examDate}
              helperText={errors.examDate}
              InputProps={{ 
                sx: { 
                  borderRadius: 2,
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(63, 81, 181, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3f51b5' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3f51b5' }
              }}
            />

            <Button
              variant="contained"
              onClick={handleSubmit}
              fullWidth
              sx={{ 
                mt: 3,
                borderRadius: 2,
                py: 1.5,
                fontFamily: 'Poppins, Quicksand, sans-serif',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
                boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  boxShadow: '0 6px 16px rgba(63, 81, 181, 0.4)', 
                  transform: 'translateY(-2px)'
                },
                '&:active': { 
                  transform: 'translateY(0)', 
                  boxShadow: '0 2px 8px rgba(63, 81, 181, 0.3)' 
                },
              }}
            >
              Kaydet
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
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
              background: 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)' 
            }} />
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontWeight: 700, 
                mb: 2,
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

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : netRecords.length === 0 ? (
              <Box sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
                <Typography variant="body1">Henüz net kaydı bulunmuyor.</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Denemelere girip netlerinizi takip etmek için yukarıdaki formu doldurun.
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer sx={{ mb: 4, borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.08) 0%, rgba(63, 81, 181, 0.15) 100%)' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#3f51b5', py: 1.5 }}>Deneme</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#3f51b5', py: 1.5 }}>Sınav Türü</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#3f51b5', py: 1.5 }}>Ders</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#4caf50', py: 1.5 }}>Doğru</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#f44336', py: 1.5 }}>Yanlış</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#3f51b5', py: 1.5 }}>Net</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#3f51b5', py: 1.5 }}>Tarih</TableCell>
                        <TableCell sx={{ py: 1.5 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {netRecords.map((record, index) => (
                        <TableRow key={record.id} hover>
                          <TableCell>{record.examName}</TableCell>
                          <TableCell>
                            <Chip 
                              label={record.examType} 
                              size="small" 
                              sx={{ 
                                fontWeight: 600, 
                                bgcolor: record.examType === 'TYT' ? 'rgba(63, 81, 181, 0.1)' : 'rgba(156, 39, 176, 0.1)',
                                color: record.examType === 'TYT' ? '#3f51b5' : '#9c27b0',
                                border: record.examType === 'TYT' ? '1px solid rgba(63, 81, 181, 0.2)' : '1px solid rgba(156, 39, 176, 0.2)',
                                borderRadius: 1
                              }} 
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{record.subject}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#4caf50' }}>{record.correctCount}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#f44336' }}>{record.incorrectCount}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#3f51b5' }}>{record.net}</TableCell>
                          <TableCell>{record.date instanceof Date ? record.date.toLocaleDateString('tr-TR') : formatDate(record.date)}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDelete(record.id)}
                              sx={{
                                color: 'rgba(244, 67, 54, 0.7)',
                                '&:hover': {
                                  bgcolor: 'rgba(244, 67, 54, 0.1)',
                                  color: '#f44336'
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
                    
                    {chartData.map((item, index) => {
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
                      const lightColor = `${color}20`;
                      
                      return (
                        <Card 
                          key={item.subject} 
                          sx={{ 
                            mb: 3, 
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
                              {item.subject}
                            </Typography>
                            
                            <Box sx={{ 
                              height: 300, 
                              background: `linear-gradient(145deg, #ffffff 0%, ${lightColor} 100%)`,
                              borderRadius: 2,
                              p: 2,
                              boxShadow: 'inset 0 1px 8px rgba(0,0,0,0.05)'
                            }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={item.data}
                                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                  <XAxis 
                                    dataKey="name" 
                                    angle={-45} 
                                    textAnchor="end"
                                    height={70}
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                                  />
                                  <YAxis 
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                                  />
                                  <Tooltip 
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
                    })}
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
      
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
