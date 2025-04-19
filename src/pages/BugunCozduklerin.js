import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  useTheme,
  TextField,
  Snackbar,
  Alert,
  Stack,
  Chip,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BookIcon from '@mui/icons-material/Book';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import yksData from '../utils/yksData';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  Timestamp, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy 
} from 'firebase/firestore';

const BugunCozduklerin = () => {
  const theme = useTheme();
  const [user] = useAuthState(auth);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [problemStats, setProblemStats] = useState({
    correct: 0,
    incorrect: 0,
    empty: 0
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [solvedProblems, setSolvedProblems] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSolvedProblems();
    }
  }, [user]);

  const fetchSolvedProblems = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Calculate today at 04:00 AM (Turkish time)
      const todayCutoff = new Date();
      if (todayCutoff.getHours() < 4) {
        // If current time is before 4 AM, use previous day at 4 AM
        todayCutoff.setDate(todayCutoff.getDate() - 1);
      }
      // Set time to 04:00:00
      todayCutoff.setHours(4, 0, 0, 0);
      
      const solvedProblemsQuery = query(
        collection(db, 'solvedProblems'),
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(solvedProblemsQuery);
      const problems = {};

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Filter locally for today's problems (after 4 AM cutoff)
        const problemDate = data.date?.toDate();
        if (!problemDate || problemDate < todayCutoff) {
          return; // Skip entries from before the cutoff time
        }
        
        if (!problems[data.subject]) {
          problems[data.subject] = {};
        }
        
        problems[data.subject][data.topic] = {
          id: docSnap.id,
          correct: data.correct || 0,
          incorrect: data.incorrect || 0,
          empty: data.empty || 0,
          total: (data.correct || 0) + (data.incorrect || 0) + (data.empty || 0),
          timestamp: data.date
        };
      });

      setSolvedProblems(problems);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching solved problems:', error);
      showSnackbar('Çözülen soru bilgileri yüklenirken hata oluştu', 'error');
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (subject) => {
    setSelectedSubject(subject);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenTopicDialog = (topic) => {
    setSelectedTopic(topic);
    
    // Check if we already have data for this topic and pre-fill the form
    if (
      solvedProblems[selectedSubject] && 
      solvedProblems[selectedSubject][topic]
    ) {
      setProblemStats({
        correct: solvedProblems[selectedSubject][topic].correct,
        incorrect: solvedProblems[selectedSubject][topic].incorrect,
        empty: solvedProblems[selectedSubject][topic].empty
      });
    } else {
      // Reset form if no existing data
      setProblemStats({
        correct: 0,
        incorrect: 0,
        empty: 0
      });
    }
    
    setTopicDialogOpen(true);
  };

  const handleCloseTopicDialog = () => {
    setTopicDialogOpen(false);
    setSelectedTopic(null);
  };

  const handleInputChange = (field, value) => {
    // Ensure value is a non-negative integer
    const numValue = value === '' ? 0 : parseInt(value);
    if (numValue < 0 || isNaN(numValue)) return;

    setProblemStats(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSaveStats = async () => {
    if (!user) {
      showSnackbar('Lütfen giriş yapın', 'warning');
      return;
    }

    try {
      setIsLoading(true);
      const total = problemStats.correct + problemStats.incorrect + problemStats.empty;
      
      if (total === 0) {
        // If all values are 0, delete the record if it exists
        if (
          solvedProblems[selectedSubject] && 
          solvedProblems[selectedSubject][selectedTopic] &&
          solvedProblems[selectedSubject][selectedTopic].id
        ) {
          await deleteDoc(doc(db, 'solvedProblems', solvedProblems[selectedSubject][selectedTopic].id));
          
          // Update local state
          const updatedProblems = {...solvedProblems};
          if (updatedProblems[selectedSubject]) {
            delete updatedProblems[selectedSubject][selectedTopic];
            if (Object.keys(updatedProblems[selectedSubject]).length === 0) {
              delete updatedProblems[selectedSubject];
            }
          }
          setSolvedProblems(updatedProblems);
          
          showSnackbar('Kayıt silindi', 'info');
        } else {
          showSnackbar('Lütfen en az bir soru girin', 'warning');
          setIsLoading(false);
          return;
        }
      } else {
        // Data to save
        const problemData = {
          userId: user.uid,
          subject: selectedSubject,
          topic: selectedTopic,
          correct: problemStats.correct || 0,
          incorrect: problemStats.incorrect || 0,
          empty: problemStats.empty || 0,
          date: Timestamp.now()
        };
        
        // Check if we're updating or creating
        if (
          solvedProblems[selectedSubject] && 
          solvedProblems[selectedSubject][selectedTopic] &&
          solvedProblems[selectedSubject][selectedTopic].id
        ) {
          // Update existing record
          const docRef = doc(db, 'solvedProblems', solvedProblems[selectedSubject][selectedTopic].id);
          await updateDoc(docRef, problemData);
        } else {
          // Create new record
          await addDoc(collection(db, 'solvedProblems'), problemData);
        }
        
        showSnackbar('Çözdüğün sorular kaydedildi', 'success');
      }
      
      // Refresh data
      await fetchSolvedProblems();
      handleCloseTopicDialog();
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error saving solved problems:', error);
      showSnackbar('Kayıt sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'), 'error');
      setIsLoading(false);
    }
  };

  const getTopicStats = (subject, topic) => {
    if (
      solvedProblems[subject] && 
      solvedProblems[subject][topic]
    ) {
      const stats = solvedProblems[subject][topic];
      return {
        correct: stats.correct,
        incorrect: stats.incorrect,
        empty: stats.empty,
        total: stats.total
      };
    }
    return null;
  };

  return (
    <Box sx={{ backgroundColor: '#fff', mb: 4 }}>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Çözdüğün soruları kaydetmek için ders kutucuklarına tıklayabilirsin.
        </Typography>

        <Grid container spacing={3}>
          {Object.keys(yksData).map((subject) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={subject}>
              <Card 
                onClick={() => handleOpenDialog(subject)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: 2,
                  height: '100%',
                  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  border: `1px solid ${yksData[subject].color}25`,
                }}
              >
                <CardContent sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  p: 3
                }}>
                  <Box
                    sx={{
                      backgroundColor: `${yksData[subject].color}15`,
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <BookIcon sx={{ color: yksData[subject].color, fontSize: 28 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {subject}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mt: 1,
                    }}
                  >
                    {yksData[subject].topics.length} Konu
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Dialog for showing topics */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        {selectedSubject && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              bgcolor: `${yksData[selectedSubject].color}15`,
              pb: 2,
              pt: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    backgroundColor: `${yksData[selectedSubject].color}25`,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <BookIcon sx={{ color: yksData[selectedSubject].color, fontSize: 22 }} />
                </Box>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  {selectedSubject} Konuları
                </Typography>
              </Box>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleCloseDialog}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <List>
                {yksData[selectedSubject].topics.map((topic, index) => (
                  <React.Fragment key={topic}>
                    <ListItem 
                      sx={{ py: 1.5 }}
                      button 
                      onClick={() => handleOpenTopicDialog(topic)}
                    >
                      <ListItemText 
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {topic}
                          </Typography>
                        } 
                      />
                      {getTopicStats(selectedSubject, topic) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                          <Chip 
                            label={`D:${getTopicStats(selectedSubject, topic).correct} Y:${getTopicStats(selectedSubject, topic).incorrect} B:${getTopicStats(selectedSubject, topic).empty}`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            sx={{ 
                              fontWeight: 500,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      )}
                    </ListItem>
                    {index < yksData[selectedSubject].topics.length - 1 && (
                      <Divider component="li" sx={{ opacity: 0.6 }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={handleCloseDialog} 
                variant="outlined" 
                color="primary"
                sx={{ borderRadius: 2 }}
              >
                Kapat
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog for entering problem statistics */}
      <Dialog
        open={topicDialogOpen}
        onClose={handleCloseTopicDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        {selectedSubject && selectedTopic && (
          <>
            <DialogTitle sx={{ 
              pb: 2,
              pt: 2 
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  Çözdüğün Soruları Gir
                </Typography>
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleCloseTopicDialog}
                  aria-label="close"
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                {selectedSubject} - {selectedTopic}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  label="Doğru"
                  type="number"
                  fullWidth
                  value={problemStats.correct}
                  onChange={(e) => handleInputChange('correct', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                    ),
                  }}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Yanlış"
                  type="number"
                  fullWidth
                  value={problemStats.incorrect}
                  onChange={(e) => handleInputChange('incorrect', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <CancelIcon sx={{ color: 'error.main', mr: 1 }} />
                    ),
                  }}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Boş"
                  type="number"
                  fullWidth
                  value={problemStats.empty}
                  onChange={(e) => handleInputChange('empty', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    ),
                  }}
                  inputProps={{ min: 0 }}
                />

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: 'background.default',
                  p: 2,
                  borderRadius: 1
                }}>
                  <Typography variant="body1" fontWeight={500}>
                    Toplam Soru:
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="primary.main">
                    {problemStats.correct + problemStats.incorrect + problemStats.empty}
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={handleCloseTopicDialog} 
                variant="outlined"
                color="inherit"
                sx={{ borderRadius: 2 }}
              >
                İptal
              </Button>
              <Button 
                onClick={handleSaveStats} 
                variant="contained" 
                color="primary"
                sx={{ borderRadius: 2 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Kaydet'
                )}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  </Box>
);

export default BugunCozduklerin;
