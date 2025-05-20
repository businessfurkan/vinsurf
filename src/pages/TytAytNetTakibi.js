import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import '../styles/tyt-ayt-modern.css';
import { styled } from '@mui/system';
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
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(145deg, #ffffff 0%, #f5f8ff 100%)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(85, 179, 217, 0.15)',
  border: '1px solid rgba(85, 179, 217, 0.1)',
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), 0 6px 12px rgba(85, 179, 217, 0.2)'
  }
}));

// Steps for the form
const steps = [
  'Deneme Adı',
  'Tarih',
  'Sınav Türü',
  'Ders Bilgileri',
  'Özet'
];

const TytAytNetTakibi = () => {
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
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch existing net records
  const fetchNetRecords = useCallback(async () => {
    try {
      setLoading(true);
      
      const q = query(
        collection(db, 'netRecords'),
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
    } catch (error) {
      console.error('Error fetching records:', error);
      showNotification('Kayıtlar yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification, setLoading, setNetRecords]);
  
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
            <Typography variant="h6" gutterBottom>
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
              placeholder="Örn: TYT Genel Deneme 5"
              sx={{ mt: 2 }}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
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
                    sx: { mt: 2 }
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sınav Türünü Seçin
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Sınav Türü</InputLabel>
              <Select
                value={examType}
                label="Sınav Türü"
                onChange={(e) => setExamType(e.target.value)}
              >
                <MenuItem value="TYT">TYT</MenuItem>
                <MenuItem value="AYT">AYT</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ders Bilgilerini Girin
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Ders Seçin</InputLabel>
                  <Select
                    value={currentSubject}
                    label="Ders Seçin"
                    onChange={(e) => handleSubjectSelect(e.target.value)}
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
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Doğru"
                      type="number"
                      InputProps={{ inputProps: { min: 0 } }}
                      value={correctCount}
                      onChange={(e) => setCorrectCount(e.target.value)}
                      error={!!errors.correctCount}
                      helperText={errors.correctCount}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Yanlış"
                      type="number"
                      InputProps={{ inputProps: { min: 0 } }}
                      value={incorrectCount}
                      onChange={(e) => setIncorrectCount(e.target.value)}
                      error={!!errors.incorrectCount}
                      helperText={errors.incorrectCount}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Boş"
                      type="number"
                      InputProps={{ inputProps: { min: 0 } }}
                      value={emptyCount}
                      onChange={(e) => setEmptyCount(e.target.value)}
                      error={!!errors.emptyCount}
                      helperText={errors.emptyCount}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      startIcon={<AddIcon />}
                    >
                      Dersi Ekle
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
            
            {Object.keys(subjectData).length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Eklenen Dersler
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ders</TableCell>
                        <TableCell align="right">Doğru</TableCell>
                        <TableCell align="right">Yanlış</TableCell>
                        <TableCell align="right">Boş</TableCell>
                        <TableCell align="right">Net</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(subjectData).map(([subject, data]) => (
                        <TableRow key={subject}>
                          <TableCell component="th" scope="row">
                            {subject}
                          </TableCell>
                          <TableCell align="right">{data.correctCount}</TableCell>
                          <TableCell align="right">{data.incorrectCount}</TableCell>
                          <TableCell align="right">{data.emptyCount}</TableCell>
                          <TableCell align="right">{data.net}</TableCell>
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
            <Typography variant="h6" gutterBottom>
              Deneme Bilgileri Özeti
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Deneme Adı:</Typography>
                <Typography variant="body1" gutterBottom>{examName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Tarih:</Typography>
                <Typography variant="body1" gutterBottom>
                  {format(examDate, 'dd MMMM yyyy', { locale: trLocale })}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Sınav Türü:</Typography>
                <Typography variant="body1" gutterBottom>{examType}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Dersler:</Typography>
                <TableContainer component={Paper} sx={{ mt: 1 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ders</TableCell>
                        <TableCell align="right">Doğru</TableCell>
                        <TableCell align="right">Yanlış</TableCell>
                        <TableCell align="right">Boş</TableCell>
                        <TableCell align="right">Net</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(subjectData).map(([subject, data]) => (
                        <TableRow key={subject}>
                          <TableCell component="th" scope="row">
                            {subject}
                          </TableCell>
                          <TableCell align="right">{data.correctCount}</TableCell>
                          <TableCell align="right">{data.incorrectCount}</TableCell>
                          <TableCell align="right">{data.emptyCount}</TableCell>
                          <TableCell align="right">{data.net}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  // Render the list of saved records
  const renderRecordsList = () => {
    if (netRecords.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">Henüz kaydedilmiş deneme sonucu bulunmamaktadır.</Typography>
        </Box>
      );
    }
    
    // Group records by exam name and date
    const groupedRecords = {};
    
    netRecords.forEach(record => {
      const key = `${record.examName}_${record.examDate?.toDate?.().getTime() || 'unknown'}`;
      
      if (!groupedRecords[key]) {
        groupedRecords[key] = {
          examName: record.examName,
          examDate: record.examDate,
          examType: record.examType,
          subjects: []
        };
      }
      
      groupedRecords[key].subjects.push({
        id: record.id,
        subject: record.subject,
        correctCount: record.correctCount,
        incorrectCount: record.incorrectCount,
        emptyCount: record.emptyCount,
        net: record.net
      });
    });
    
    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {Object.values(groupedRecords).map((group, index) => (
          <Grid item xs={12} md={6} key={index}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{group.examName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {group.examDate?.toDate ? format(group.examDate.toDate(), 'dd MMMM yyyy', { locale: trLocale }) : ''}
                  </Typography>
                </Box>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ders</TableCell>
                        <TableCell align="right">D</TableCell>
                        <TableCell align="right">Y</TableCell>
                        <TableCell align="right">B</TableCell>
                        <TableCell align="right">Net</TableCell>
                        <TableCell align="right">İşlem</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.subjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell component="th" scope="row">
                            {subject.subject}
                          </TableCell>
                          <TableCell align="right">{subject.correctCount}</TableCell>
                          <TableCell align="right">{subject.incorrectCount}</TableCell>
                          <TableCell align="right">{subject.emptyCount}</TableCell>
                          <TableCell align="right">{subject.net}</TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(subject.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    );
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
        <Typography variant="h4" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center',
          borderBottom: '2px solid #f0f0f0',
          pb: 2,
          mb: 4
        }}>
          <SchoolIcon sx={{ mr: 1 }} /> TYT-AYT Net Takibi
        </Typography>
        
        {/* Multi-step form */}
        <StyledCard sx={{ mb: 4 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ mt: 3 }}>
              {activeStep === steps.length ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Tüm adımlar tamamlandı
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    startIcon={<CheckCircleIcon />}
                    sx={{ mt: 2 }}
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
                      startIcon={<NavigateBeforeIcon />}
                    >
                      Geri
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      endIcon={<NavigateNextIcon />}
                      disabled={activeStep === 3 && Object.keys(subjectData).length === 0}
                    >
                      {activeStep === steps.length - 1 ? 'Bitir' : 'İleri'}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </CardContent>
        </StyledCard>
        
        {/* Records list */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Kaydedilmiş Denemeler
          </Typography>
          {renderRecordsList()}
        </Box>
        
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
