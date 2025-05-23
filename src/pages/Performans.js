import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  IconButton,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { auth, db } from '../firebase';
import { collection, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

// Removed unused StyledTableCell component

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  padding: '14px 16px',
  fontSize: '0.9rem',
  textAlign: 'center',
  width: '14.28%', // 100% / 7 days
}));

const ClassCell = styled(TableCell)(({ theme, isEmpty }) => ({
  backgroundColor: isEmpty ? 'transparent' : theme.palette.secondary.light,
  color: isEmpty ? theme.palette.text.secondary : theme.palette.text.primary,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: isEmpty 
      ? theme.palette.action.hover 
      : theme.palette.secondary.main,
  },
  transition: 'background-color 0.2s',
  padding: '16px',
  minHeight: '200px',
  verticalAlign: 'top',
}));

const Performans = () => {
  const [user] = useAuthState(auth);
  const [schedule, setSchedule] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDay, setCurrentDay] = useState('');
  const [classDetails, setClassDetails] = useState({
    subject: '',
    teacher: '',
    location: '',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  // Auto-save functionality removed as it's not being used
  const [autoSaveTimeout] = useState(null);

  // Use useMemo to prevent the array from being recreated on every render
  const daysOfWeek = useMemo(() => [
    'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'
  ], []);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const scheduleRef = collection(userDocRef, 'schedule');
      
      // Initialize with empty schedule if not exists
      const initializeSchedule = async () => {
        const scheduleDoc = await getDoc(doc(scheduleRef, 'weeklySchedule'));
        if (!scheduleDoc.exists()) {
          const emptySchedule = {};
          daysOfWeek.forEach(day => {
            emptySchedule[day] = [];
          });
          await setDoc(doc(scheduleRef, 'weeklySchedule'), emptySchedule);
          setSchedule(emptySchedule);
        } else {
          // Migrate old format to new format if needed
          const currentData = scheduleDoc.data();
          let needsUpdate = false;
          const updatedData = { ...currentData };
          
          // Check each day and convert if needed
          for (const day of daysOfWeek) {
            if (currentData[day] && !Array.isArray(currentData[day])) {
              // Old format detected, convert to array format
              updatedData[day] = [];
              const dayData = currentData[day];
              
              // Convert old time-slot based data to array items
              for (const timeSlot in dayData) {
                if (dayData[timeSlot]) {
                  updatedData[day].push({
                    id: Date.now() + Math.random().toString().slice(2, 8),
                    ...dayData[timeSlot],
                    timeSlot // Keep the original time information
                  });
                }
              }
              
              needsUpdate = true;
            } else if (!currentData[day]) {
              // Ensure each day has an array
              updatedData[day] = [];
              needsUpdate = true;
            }
          }
          
          // Update the database if migration was needed
          if (needsUpdate) {
            try {
              await setDoc(doc(scheduleRef, 'weeklySchedule'), updatedData);
              console.log('Schedule data migrated to new format');
            } catch (error) {
              console.error('Error migrating schedule data:', error);
            }
          }
        }
      };
      
      initializeSchedule();
      
      // Listen for schedule changes
      const unsubscribe = onSnapshot(doc(scheduleRef, 'weeklySchedule'), (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          
          // Ensure all days have arrays
          const safeData = { ...data };

          // Validate data structure - ensure each day exists and is an array
          const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
          days.forEach(day => {
            if (!Array.isArray(safeData[day])) {
              safeData[day] = [];
            }
          });

          setSchedule(safeData);
        }
      });
      
      return () => unsubscribe();
    }
  }, [user, daysOfWeek]);

  const handleCellClick = (day) => {
    setCurrentDay(day);
    setClassDetails({
      subject: '',
      teacher: '',
      location: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Function to handle input changes and trigger auto-save
  const handleInputChange = (field, value) => {
    const updatedDetails = { ...classDetails, [field]: value };
    setClassDetails(updatedDetails);
    
    // Clear any existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
  };
  
  // Function to save class data
  const saveClassData = async () => {
    if (!user || !currentDay) return;

    const updatedSchedule = { ...schedule };
    
    if (!updatedSchedule[currentDay]) {
      updatedSchedule[currentDay] = [];
    }
    
    // Add new class item to the day's array
    updatedSchedule[currentDay].push({
      id: Date.now().toString(), // Generate a unique ID
      ...classDetails
    });
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const scheduleRef = collection(userDocRef, 'schedule');
      await setDoc(doc(scheduleRef, 'weeklySchedule'), updatedSchedule);
      
      setSnackbar({
        open: true,
        message: 'Ders programı başarıyla kaydedildi!',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error saving schedule:", error);
      setSnackbar({
        open: true,
        message: 'Ders programı kaydedilirken bir hata oluştu.',
        severity: 'error'
      });
    }
  };

  const handleSaveClass = () => {
    saveClassData();
    setOpenDialog(false);
  };

  const handleDeleteClass = async (day, classId) => {
    if (!user) return;

    const updatedSchedule = { ...schedule };
    
    if (updatedSchedule[day] && Array.isArray(updatedSchedule[day])) {
      updatedSchedule[day] = updatedSchedule[day].filter(item => item.id !== classId);
      
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const scheduleRef = collection(userDocRef, 'schedule');
        await setDoc(doc(scheduleRef, 'weeklySchedule'), updatedSchedule);
        
        setSnackbar({
          open: true,
          message: 'Ders başarıyla silindi!',
          severity: 'success'
        });
      } catch (error) {
        console.error("Error deleting class:", error);
        setSnackbar({
          open: true,
          message: 'Ders silinirken bir hata oluştu.',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderClassCell = (day) => {
    const classes = schedule[day] || [];
    // Eğer classes bir dizi değilse (eski format), boş dizi olarak ayarla
    const classArray = Array.isArray(classes) ? classes : [];
    const isEmpty = classArray.length === 0;

    return (
      <ClassCell 
        key={day}
        isEmpty={isEmpty}
      >
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'stretch'
        }}>
          {classArray.map(classItem => (
            <Card 
              key={classItem.id} 
              sx={{ 
                mb: 2, 
                p: 1.5, 
                backgroundColor: '#f5f5f5',
                boxShadow: '0px 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {classItem.subject}
                </Typography>
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => handleDeleteClass(day, classItem.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              
              {classItem.location && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 0.5, 
                    color: 'primary.main', 
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    // Check if the link has http:// or https:// prefix
                    let url = classItem.location;
                    if (!/^https?:\/\//i.test(url)) {
                      url = 'https://' + url;
                    }
                    window.open(url, '_blank');
                  }}
                >
                  {classItem.location}
                </Typography>
              )}
              
              {classItem.teacher && (
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {classItem.teacher}
                </Typography>
              )}
              
              {classItem.notes && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {classItem.notes}
                </Typography>
              )}
            </Card>
          ))}
          
          <Button 
            variant="outlined" 
            color="primary" 
            fullWidth 
            startIcon={<AddCircleOutlineIcon />} 
            onClick={() => handleCellClick(day)}
            sx={{ mt: 'auto' }}
          >
            Ders Ekle
          </Button>
        </Box>
      </ClassCell>
    );
  };

  return (
    <Box sx={{ p: 3, pt: 5, pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, mt: 2, fontWeight: 'bold', color: 'primary.main' }}>
        Haftalık Ders Programı
      </Typography>
      
      <Card sx={{ mb: 4, overflow: 'visible' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  {daysOfWeek.map(day => (
                    <HeaderTableCell key={day}>{day}</HeaderTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {daysOfWeek.map(day => renderClassCell(day))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentDay ? `${currentDay} - Yeni Ders Ekle` : 'Yeni Ders Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Ders Adı"
                fullWidth
                value={classDetails.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Öğretmen"
                fullWidth
                value={classDetails.teacher}
                onChange={(e) => handleInputChange('teacher', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Link"
                fullWidth
                value={classDetails.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="ornek.com"
                helperText="Tıklanabilir link (http:// olmadan da girebilirsiniz)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notlar"
                fullWidth
                multiline
                rows={3}
                value={classDetails.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">İptal</Button>
          <Button 
            onClick={handleSaveClass} 
            color="primary" 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Performans;
