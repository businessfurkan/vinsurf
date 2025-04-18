import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  keyframes
} from '@mui/material';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  collection, 
  addDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LoginIcon from '@mui/icons-material/Login';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';

// Create pulse/explode animation
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(91, 143, 185, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(91, 143, 185, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(91, 143, 185, 0);
  }
`;

const LoginTracker = () => {
  const [user] = useAuthState(auth);
  const [loginRecords, setLoginRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // Format date as DD.MM.YYYY HH:MM
  const formatDate = (date) => {
    try {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Tarih biçimlendirme hatası";
    }
  };

  // Record a new login
  const recordLogin = async () => {
    if (!user) return;
    
    try {
      // Get current date/time
      const now = new Date();
      
      // Add the login record to local state immediately
      const newRecord = {
        id: `local-${Date.now()}`,
        timestamp: now,
        userName: user.displayName || 'Öğrenci'
      };
      
      setLoginRecords(prev => [newRecord, ...prev]);
      
      // Try to save to Firestore (but we don't need to wait for it)
      addDoc(collection(db, 'loginRecords'), {
        userId: user.uid,
        userName: user.displayName || 'Öğrenci',
        timestamp: now
      });
      
      // Show success message
      setLoginSuccess(true);
      setTimeout(() => setLoginSuccess(false), 3000);
    } catch (error) {
      console.error('Error recording login:', error);
    }
  };

  // Open the login history dialog
  const handleOpenDialog = () => {
    // Start pulsing animation
    setIsPulsing(true);
    
    // If we don't have any records yet, add today's record
    if (loginRecords.length === 0) {
      const now = new Date();
      setLoginRecords([{
        id: `dialog-${Date.now()}`,
        timestamp: now,
        userName: user?.displayName || 'Öğrenci'
      }]);
    }
    
    // Add a short delay before opening the dialog to complete animation
    setTimeout(() => {
      setOpenDialog(true);
      setIsPulsing(false);
    }, 400);
  };

  // Close the login history dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Load login records when the component mounts
  useEffect(() => {
    if (!user) return;
    
    const fetchRecords = async () => {
      try {
        setLoading(true);
        
        // Create a base record with current time
        const now = new Date();
        const baseRecords = [{
          id: `base-${Date.now()}`,
          timestamp: now,
          userName: user.displayName || 'Öğrenci'
        }];
        
        // Try to get records from Firestore
        try {
          const q = query(
            collection(db, 'loginRecords'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc')
          );
          
          const querySnapshot = await getDocs(q);
          const records = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            let timestamp;
            if (data.timestamp && typeof data.timestamp.toDate === 'function') {
              timestamp = data.timestamp.toDate();
            } else if (data.timestamp) {
              timestamp = new Date(data.timestamp);
            } else {
              timestamp = new Date();
            }
            
            records.push({
              id: doc.id,
              timestamp: timestamp,
              userName: data.userName || 'Öğrenci'
            });
          });
          
          if (records.length > 0) {
            setLoginRecords(records);
          } else {
            setLoginRecords(baseRecords);
          }
        } catch (error) {
          console.error('Firestore error:', error);
          setLoginRecords(baseRecords);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };
    
    fetchRecords();
  }, [user]);

  return (
    <Box sx={{ 
      width: '100%', 
      mx: 'auto', 
      maxWidth: '100%', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      py: 2
    }}>
      {loginSuccess && (
        <Alert 
          severity="success" 
          sx={{ width: '100%', mb: 2 }}
        >
          Giriş kaydınız başarıyla oluşturuldu!
        </Alert>
      )}
      
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={10} md={8} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Öğrenci Giriş Takibi
            </Typography>
          </Box>
          
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<LoginIcon />}
                onClick={recordLogin}
                sx={{ 
                  py: 1.5, 
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                Sisteme Giriş Yaptım
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                fullWidth
                startIcon={<HistoryIcon />}
                onClick={handleOpenDialog}
                sx={{ 
                  py: 1.5, 
                  fontWeight: 600,
                  borderRadius: 2,
                  animation: isPulsing ? `${pulseAnimation} 0.4s cubic-bezier(0.11, 0.82, 0.83, 1.09)` : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.03)',
                  }
                }}
              >
                Hangi günler çalıştım?
              </Button>
            </Grid>
          </Grid>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
            Her gün çalışmaya başladığınızda kayıt oluşturun
          </Typography>
        </Grid>
      </Grid>

      {/* Login History Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          pr: 6, 
          pb: 1, 
          display: 'flex', 
          alignItems: 'center',
          fontWeight: 600
        }}>
          <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
          Giriş Kayıtları
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Kayıtlar yükleniyor...
            </Typography>
          ) : (
            <List>
              {loginRecords.map((record, index) => (
                <React.Fragment key={record.id || index}>
                  <ListItem>
                    <ListItemText
                      primary={formatDate(record.timestamp)}
                      secondary={`${record.userName || 'Öğrenci'} giriş yaptı`}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItem>
                  {index < loginRecords.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginTracker;
