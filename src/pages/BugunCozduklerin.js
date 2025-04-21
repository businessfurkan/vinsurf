import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
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
  IconButton,
  Chip,
  Stack,
  TextField,
  CircularProgress,
  Snackbar,
  Paper,
  alpha,
  Select,
  MenuItem,
  FormControl
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
  deleteDoc 
} from 'firebase/firestore';

const BugunCozduklerin = () => {
  const [user] = useAuthState(auth);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedHistorySubject, setSelectedHistorySubject] = useState('');
  const [problemStats, setProblemStats] = useState({
    correct: 0,
    incorrect: 0,
    empty: 0
  });
  const [solvedProblems, setSolvedProblems] = useState({});
  const [historicalProblems, setHistoricalProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    
    // Only show the snackbar for 5 seconds
    setTimeout(() => {
      setSnackbarOpen(false);
    }, 5000);
  }, []);

  const fetchSolvedProblems = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Get today's date at 4 AM (cutoff for "today")
      const todayCutoff = new Date();
      if (todayCutoff.getHours() < 4) {
        // If current time is before 4 AM, use previous day at 4 AM
        todayCutoff.setDate(todayCutoff.getDate() - 1);
      }
      todayCutoff.setHours(4, 0, 0, 0);
      
      try {
        // Create a query to get solved problems without requiring composite indexes
        const q = query(
          collection(db, 'solvedProblems'),
          where('userId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const solvedProblemsData = {};
        
        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          // Tarih alanını doğru şekilde dönüştürme
          let recordDate;
          try {
            // Firestore Timestamp nesnesini Date'e çevirme
            if (data.date) {
              if (data.date.toDate) {
                recordDate = data.date.toDate();
              } else if (data.date.seconds) {
                recordDate = new Date(data.date.seconds * 1000);
              } else {
                recordDate = new Date(data.date);
              }
            } else {
              recordDate = new Date();
            }
          } catch (error) {
            console.error('Date conversion error:', error);
            // Hata durumunda geçerli bir tarih kullan
            recordDate = new Date();
          }
          
          // JavaScript tarafında son 30 günlük kayıtları filtreleme
          if (recordDate >= todayCutoff) {
            if (!solvedProblemsData[data.subject]) {
              solvedProblemsData[data.subject] = {};
            }
            
            solvedProblemsData[data.subject][data.topic] = {
              correct: data.correct || 0,
              incorrect: data.incorrect || 0,
              empty: data.empty || 0,
              date: recordDate,
              id: docSnapshot.id
            };
          }
        });
        
        setSolvedProblems(solvedProblemsData);
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        showSnackbar('Veritabanı bağlantısında hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Error fetching solved problems:', error);
      showSnackbar('Çözülen soru bilgileri yüklenirken hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, showSnackbar]);

  // Fetch last 30 days of solved problems for the history panel
  const fetchHistoricalSolvedProblems = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get date 30 days ago at 4 AM
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(4, 0, 0, 0);
      
      // CORS hatalarını önlemek için try-catch bloğu içinde sorgulama yapıyoruz
      // Bu şekilde composite index gerektiren bir sorgu yapmıyoruz
      const q = query(
        collection(db, 'solvedProblems'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const allData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
          // Tarih alanını doğru şekilde dönüştürme
          let recordDate;
          try {
            // Firestore Timestamp nesnesini Date'e çevirme
            if (data.date) {
              if (data.date.toDate) {
                recordDate = data.date.toDate();
              } else if (data.date.seconds) {
                recordDate = new Date(data.date.seconds * 1000);
              } else {
                recordDate = new Date(data.date);
              }
            } else {
              recordDate = new Date();
            }
          } catch (error) {
            console.error('Date conversion error:', error);
            // Hata durumunda geçerli bir tarih kullan
            recordDate = new Date();
          }
        
        // JavaScript tarafında son 30 günlük kayıtları filtreleme
        if (recordDate >= thirtyDaysAgo) {
          allData.push({
            id: doc.id,
            subject: data.subject,
            topic: data.topic,
            correct: data.correct || 0,
            incorrect: data.incorrect || 0,
            empty: data.empty || 0,
            date: recordDate,
            net: Math.max(0, (data.correct || 0) - ((data.incorrect || 0) / 4))
          });
        }
      });
      
      // allData zaten son 30 günlük verileri içeriyor, tekrar filtrelemeye gerek yok
      setHistoricalProblems(allData);
      
      // Verileri tarihe göre sırala (en yeniden en eskiye)
      allData.sort((a, b) => b.date - a.date);
    } catch (error) {
      console.error('Error fetching historical solved problems:', error);
      // Don't show error message here to avoid confusion
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSolvedProblems();
      fetchHistoricalSolvedProblems();
    }
  }, [fetchSolvedProblems, fetchHistoricalSolvedProblems, user]);

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
    // Boş veya geçersiz değerleri kontrol et
    let numValue = 0;
    if (value !== undefined && value !== null && value !== '') {
      numValue = parseInt(value, 10) || 0;
    }
    
    // Negatif değerleri önle
    numValue = Math.max(0, numValue);
    
    setProblemStats(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Save solved problems to Firebase - Bu fonksiyon composite index hatasını önlemek için yeniden düzenlendi
  const saveSolvedProblems = useCallback(async (subject, topic, correct, incorrect, empty) => {
    if (!user) return;

    try {
      // Burada composite index hatasını önlemek için farklı bir yaklaşım kullanıyoruz
      // Önce tüm kayıtları çekip JavaScript tarafında filtreleme yapacağız
      const q = query(
        collection(db, 'solvedProblems'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      // JavaScript tarafında subject ve topic eşleşmesini kontrol ediyoruz
      const matchingDoc = querySnapshot.docs.find(doc => {
        const data = doc.data();
        return data.subject === subject && data.topic === topic;
      });
      
      if (matchingDoc) {
        // Update existing record
        const docRef = doc(db, 'solvedProblems', matchingDoc.id);
        const existingData = matchingDoc.data();
        
        await updateDoc(docRef, {
          correct: (existingData.correct || 0) + correct,
          incorrect: (existingData.incorrect || 0) + incorrect,
          empty: (existingData.empty || 0) + empty,
          date: Timestamp.now()
        });
      } else {
        // Create new record
        await addDoc(collection(db, 'solvedProblems'), {
          userId: user.uid,
          subject,
          topic,
          correct,
          incorrect,
          empty,
          date: Timestamp.now()
        });
      }
      
      // Refresh the data
      await fetchSolvedProblems();
      await fetchHistoricalSolvedProblems();
      
      showSnackbar('Sonuçlar kaydedildi', 'success');
    } catch (error) {
      console.error('Error saving solved problems:', error);
      showSnackbar('Sonuçlar kaydedilirken hata oluştu', 'error');
    }
  }, [user, fetchSolvedProblems, fetchHistoricalSolvedProblems, showSnackbar]);

  const getTopicStats = useCallback((subject, topic) => {
    if (
      solvedProblems[subject] && 
      solvedProblems[subject][topic]
    ) {
      const stats = solvedProblems[subject][topic];
      const correct = stats.correct || 0;
      const incorrect = stats.incorrect || 0;
      const empty = stats.empty || 0;
      
      // Calculate net score: correct - (incorrect / 4)
      const netScore = Math.max(0, correct - Math.floor(incorrect / 4));
      
      return {
        correct,
        incorrect,
        empty,
        total: correct + incorrect + empty,
        net: netScore
      };
    }
    return null;
  }, [solvedProblems]);

  const groupedSolvedProblems = useMemo(() => {
    const result = [];
    
    // Process each subject
    Object.keys(solvedProblems).forEach(subject => {
      let subjectTotal = {
        correct: 0,
        incorrect: 0,
        empty: 0,
        net: 0,
        topics: []
      };
      
      // Process each topic in the subject
      Object.keys(solvedProblems[subject]).forEach(topic => {
        const stats = getTopicStats(subject, topic);
        if (stats) {
          // Add to subject totals
          subjectTotal.correct += stats.correct;
          subjectTotal.incorrect += stats.incorrect;
          subjectTotal.empty += stats.empty;
          subjectTotal.net += stats.net;
          
          // Add topic details
          subjectTotal.topics.push({
            name: topic,
            ...stats
          });
        }
      });
      
      // Add to results
      if (subjectTotal.topics.length > 0) {
        result.push({
          name: subject,
          color: yksData[subject]?.color || '#4285F4',
          ...subjectTotal
        });
      }
    });
    
    return result;
  }, [solvedProblems, getTopicStats]);

  const overallTotals = useMemo(() => {
    return groupedSolvedProblems.reduce((totals, subject) => {
      totals.correct += subject.correct;
      totals.incorrect += subject.incorrect;
      totals.empty += subject.empty;
      totals.net += subject.net;
      totals.total = totals.correct + totals.incorrect + totals.empty;
      return totals;
    }, { correct: 0, incorrect: 0, empty: 0, net: 0, total: 0 });
  }, [groupedSolvedProblems]);
  
  const processedHistoricalData = useMemo(() => {
    const subjectTopicMap = {};
    
    historicalProblems.filter(item => selectedHistorySubject ? item.subject === selectedHistorySubject : true).forEach(item => {
      const key = `${item.subject}-${item.topic}`;
      
      if (!subjectTopicMap[key]) {
        subjectTopicMap[key] = {
          subject: item.subject,
          topic: item.topic,
          correct: 0,
          incorrect: 0,
          empty: 0,
          net: 0,
          color: yksData[item.subject]?.color || '#4285F4',
          dates: [],
          lastUpdated: null
        };
      }
      
      subjectTopicMap[key].correct += item.correct;
      subjectTopicMap[key].incorrect += item.incorrect;
      subjectTopicMap[key].empty += item.empty;
      subjectTopicMap[key].net += item.net;
      subjectTopicMap[key].dates.push(item.date);
      
      // Track the most recent update
      if (!subjectTopicMap[key].lastUpdated || item.date > subjectTopicMap[key].lastUpdated) {
        subjectTopicMap[key].lastUpdated = item.date;
      }
    });
    
    return Object.values(subjectTopicMap).sort((a, b) => b.lastUpdated - a.lastUpdated);
  }, [historicalProblems, selectedHistorySubject]);

  // Handle saving problem stats
  const handleSaveStats = async () => {
    if (!user) {
      showSnackbar('Lütfen giriş yapın', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const total = problemStats.correct + problemStats.incorrect + problemStats.empty;
      
      if (total === 0) {
        // If all values are 0, delete the record if it exists
        if (
          solvedProblems && 
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
          
          // Show success message for deletion
          showSnackbar('Kayıt başarıyla silindi', 'info');
        } else {
          showSnackbar('Lütfen en az bir soru girin', 'error');
          setIsLoading(false);
          return;
        }
      } else {
        try {
          // Composite index hatasını önlemek için saveSolvedProblems fonksiyonunu kullan
          await saveSolvedProblems(
            selectedSubject,
            selectedTopic,
            problemStats.correct || 0,
            problemStats.incorrect || 0,
            problemStats.empty || 0
          );
          
          // Show success message
          showSnackbar('Çözdüğün sorular kaydedildi', 'success');
          
          // Update local state immediately with the new data
          const updatedProblems = {...solvedProblems};
          if (!updatedProblems[selectedSubject]) {
            updatedProblems[selectedSubject] = {};
          }
          
          updatedProblems[selectedSubject][selectedTopic] = {
            correct: problemStats.correct,
            incorrect: problemStats.incorrect,
            empty: problemStats.empty,
            date: new Date(),
            // We'll add the ID after fetching
          };
          
          setSolvedProblems(updatedProblems);
        } catch (saveError) {
          console.error('Error saving to Firestore:', saveError);
          showSnackbar('Veritabanına kaydederken hata oluştu', 'error');
          setIsLoading(false);
          return;
        }
      }
      
      // Refresh both current and historical data
      try {
        await fetchSolvedProblems();
        await fetchHistoricalSolvedProblems();
        handleCloseTopicDialog();
      } catch (fetchError) {
        console.error('Error refreshing data:', fetchError);
        // We don't show an error here since the data was already saved
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error in handleSaveStats:', error);
      showSnackbar('Beklenmeyen bir hata oluştu', 'error');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ backgroundColor: '#FFFFF0', mb: 4, p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3, 
            fontWeight: 700, 
            color: '#2e3856',
            textAlign: 'center',
            pb: 1,
            borderBottom: '2px solid #f0f0f0'
          }}
        >
          Bugün Çözdüklerin
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            fontSize: '1.05rem',
            color: '#4b5c6b',
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          Çözdüğün soruları kaydetmek için ders kutucuklarına tıklayabilirsin.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3 }}>
          {Object.keys(yksData).reduce((rows, subject, index) => {
            // Create rows of 4 items instead of 5
            if (index % 4 === 0) rows.push([]);
            rows[rows.length - 1].push(subject);
            return rows;
          }, []).map((row, rowIndex) => (
            <Box key={`row-${rowIndex}`} sx={{ 
              display: 'flex', 
              width: '100%', 
              justifyContent: 'center',
              gap: 3,
              mb: 3 
            }}>
              {row.map((subject) => (
                <Card 
                  key={subject}
                  onClick={() => handleOpenDialog(subject)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: 3,
                    height: 240, // Increased fixed height for all cards
                    width: 220, // Fixed width for all cards
                    flexShrink: 0, // Prevent shrinking
                    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0px 14px 28px rgba(0, 0, 0, 0.15)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    border: `1px solid ${yksData[subject].color}25`,
                    backgroundColor: '#FFFFF0',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '6px',
                      backgroundColor: yksData[subject].color,
                      opacity: 0.9
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '30%',
                      height: '30%',
                      background: `radial-gradient(circle at bottom right, ${yksData[subject].color}10, transparent 70%)`,
                      borderTopLeftRadius: '50%',
                      opacity: 0.7,
                      zIndex: 0
                    }
                  }}
                >
                  <CardContent sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    p: 3,
                    height: '100%',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <Box
                      sx={{
                        backgroundColor: `${yksData[subject].color}15`,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        boxShadow: `0 6px 16px ${yksData[subject].color}40`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'rotate(5deg) scale(1.05)',
                        }
                      }}
                    >
                      <BookIcon sx={{ color: yksData[subject].color, fontSize: 38 }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#2e3856',
                        fontSize: '1.3rem',
                        letterSpacing: '0.3px',
                        mb: 1.5
                      }}
                    >
                      {subject}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#4b5c6b',
                        fontWeight: 600,
                        fontSize: '1rem',
                        backgroundColor: `${yksData[subject].color}15`,
                        px: 2.5,
                        py: 0.8,
                        borderRadius: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      <BookIcon sx={{ fontSize: 16 }} />
                      {yksData[subject].topics.length} Konu
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ÇÖZDÜKLERİM Panel */}
      {groupedSolvedProblems.length > 0 && (
        <Box sx={{ backgroundColor: '#FFFFF0', mb: 4, p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 1, borderBottom: '2px solid #f0f0f0' }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: '#2e3856',
              }}
            >
              Çözdüğün Sorular
            </Typography>
            
            <Box sx={{ minWidth: 200 }}>
              <FormControl fullWidth variant="outlined" size="small">
                <Select
                  value={selectedHistorySubject}
                  onChange={(e) => setSelectedHistorySubject(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(63, 81, 181, 0.2)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(63, 81, 181, 0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3f51b5' },
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
                    <em>Tüm Dersler</em>
                  </MenuItem>
                  {groupedSolvedProblems.map((subject) => (
                    <MenuItem 
                      key={subject.name} 
                      value={subject.name}
                      sx={{
                        borderRadius: 1, 
                        my: 0.5, 
                        mx: 0.5, 
                        fontWeight: selectedHistorySubject === subject.name ? 600 : 400,
                        borderLeft: selectedHistorySubject === subject.name ? `3px solid ${subject.color}` : 'none',
                        pl: selectedHistorySubject === subject.name ? 1.5 : 2
                      }}
                    >
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          {/* Overall Stats Summary */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 3, 
            mb: 4,
            flexWrap: 'wrap',
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(66, 133, 244, 0.08)',
          }}>
            <Box sx={{ textAlign: 'center', minWidth: 100 }}>
              <Typography variant="h6" fontWeight={700} color="primary.main">{overallTotals.total}</Typography>
              <Typography variant="body2" color="text.secondary">Toplam Soru</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 100 }}>
              <Typography variant="h6" fontWeight={700} color="success.main">{overallTotals.correct}</Typography>
              <Typography variant="body2" color="text.secondary">Doğru</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 100 }}>
              <Typography variant="h6" fontWeight={700} color="error.main">{overallTotals.incorrect}</Typography>
              <Typography variant="body2" color="text.secondary">Yanlış</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 100 }}>
              <Typography variant="body2" color="text.secondary">{overallTotals.empty}</Typography>
              <Typography variant="body2" color="text.secondary">Boş</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 100 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#34A853' }}>{overallTotals.net}</Typography>
              <Typography variant="body2" color="text.secondary">Net</Typography>
            </Box>
          </Box>
          
          {/* Subject Cards */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
            {groupedSolvedProblems
              .filter(subject => selectedHistorySubject ? subject.name === selectedHistorySubject : true)
              .map((subject) => (
              <Card 
                key={subject.name}
                sx={{
                  width: 280,
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  border: `1px solid ${subject.color}25`,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    backgroundColor: subject.color,
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        backgroundColor: `${subject.color}15`,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}
                    >
                      <BookIcon sx={{ color: subject.color, fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600}>{subject.name}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Toplam</Typography>
                      <Typography variant="body1" fontWeight={600}>{subject.correct + subject.incorrect + subject.empty}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Doğru</Typography>
                      <Typography variant="body1" fontWeight={600} color="success.main">{subject.correct}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Yanlış</Typography>
                      <Typography variant="body1" fontWeight={600} color="error.main">{subject.incorrect}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Net</Typography>
                      <Typography variant="body1" fontWeight={700} sx={{ color: '#34A853' }}>{subject.net}</Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Konular</Typography>
                  <List dense disablePadding>
                    {subject.topics.map((topic, index) => (
                      <ListItem key={topic.name} disablePadding sx={{ 
                        py: 0.5,
                        borderBottom: index < subject.topics.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}>
                        <ListItemText 
                          primary={topic.name} 
                          secondary={
                            <Typography variant="caption" component="span">
                              D:{topic.correct} Y:{topic.incorrect} B:{topic.empty} | Net: <span style={{ fontWeight: 700, color: '#34A853' }}>{topic.net}</span>
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
      
      {/* 30-Day History Panel */}
      <Box sx={{ 
        backgroundColor: '#FFFFF0', 
        mt: 4, 
        mb: 4, 
        p: 4, 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)' 
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 2, 
            fontWeight: 700, 
            color: '#2e3856',
            textAlign: 'center',
            pb: 1,
            borderBottom: '2px solid #f0f0f0'
          }}
        >
          Çözdüğün Sorular
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3, 
            textAlign: 'center',
            fontSize: '1rem',
            color: '#4b5c6b',
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          Son 30 gün içinde kaydettiğin net skorlar
        </Typography>
        
        {processedHistoricalData.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {historicalProblems
              .filter(item => selectedHistorySubject ? item.subject === selectedHistorySubject : true)
              .map((item, index) => (
              <Paper 
                key={index} 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: item.color,
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                  },
                  '&:hover': {
                    backgroundColor: alpha(item.color, 0.03),
                  }
                }}
              >
                <Box sx={{ 
                  flex: 2, 
                  pl: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}>
                  <Typography variant="subtitle1" fontWeight={600} color="#2e3856">
                    {item.subject}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.topic}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  flex: 3, 
                  display: 'flex', 
                  gap: 2, 
                  justifyContent: { xs: 'flex-start', sm: 'center' },
                  flexWrap: 'wrap',
                  mt: { xs: 1, sm: 0 }
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Doğru</Typography>
                    <Chip 
                      label={item.correct} 
                      size="small" 
                      sx={{ 
                        mt: 0.5,
                        backgroundColor: alpha('#4caf50', 0.1),
                        color: '#4caf50',
                        fontWeight: 600,
                        minWidth: 40
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Yanlış</Typography>
                    <Chip 
                      label={item.incorrect} 
                      size="small" 
                      sx={{ 
                        mt: 0.5,
                        backgroundColor: alpha('#f44336', 0.1),
                        color: '#f44336',
                        fontWeight: 600,
                        minWidth: 40
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Boş</Typography>
                    <Chip 
                      label={item.empty} 
                      size="small" 
                      sx={{ 
                        mt: 0.5,
                        backgroundColor: alpha('#9e9e9e', 0.1),
                        color: '#9e9e9e',
                        fontWeight: 600,
                        minWidth: 40
                      }} 
                    />
                  </Box>
                </Box>
                
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'center',
                  mt: { xs: 1, sm: 0 }
                }}>
                  <Typography variant="caption" color="text.secondary">Net</Typography>
                  <Box sx={{ 
                    mt: 0.5,
                    backgroundColor: alpha('#2196f3', 0.1), 
                    color: '#2196f3',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    minWidth: 60,
                    textAlign: 'center'
                  }}>
                    {item.net.toFixed(2)}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4, 
            color: '#6c757d',
            backgroundColor: alpha('#f8f9fa', 0.5),
            borderRadius: 2,
            border: '1px dashed #dee2e6'
          }}>
            {selectedHistorySubject ? (
              <>
                <Typography variant="body1">
                  {selectedHistorySubject} dersine ait kaydedilmiş soru çözümü bulunmamaktadır.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#adb5bd' }}>
                  Yukarıdaki {selectedHistorySubject} kartına tıklayarak soru çözümlerini kaydetmeye başlayabilirsin.
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body1">
                  Henüz kaydedilmiş soru çözümü bulunmamaktadır.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#adb5bd' }}>
                  Yukarıdaki kartlara tıklayarak soru çözümlerini kaydetmeye başlayabilirsin.
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>

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
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, gap: 1 }}>
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
                          <Chip 
                            label={`Net: ${getTopicStats(selectedSubject, topic).net}`}
                            size="small" 
                            color="success"
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              backgroundColor: '#34A853',
                              color: 'white'
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
                  sx={{ mb: 2 }}
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
                  sx={{ mb: 2 }}
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
                  sx={{ mb: 2 }}
                />

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1,
                  bgcolor: 'background.default',
                  p: 2,
                  borderRadius: 1
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight={500}>
                      Toplam Soru:
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="primary.main">
                      {problemStats.correct + problemStats.incorrect + problemStats.empty}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" fontWeight={500} color="text.secondary">
                      Net Puan Hesaplama:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {problemStats.correct} Doğru - ({problemStats.incorrect} Yanlış ÷ 4) = 
                      </Typography>
                      <Typography variant="body1" fontWeight={700} color="success.main">
                        {Math.max(0, problemStats.correct - Math.floor(problemStats.incorrect / 4))} Net
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                      * Her 4 yanlış 1 doğruyu götürür.
                    </Typography>
                  </Box>
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: snackbarSeverity === 'error' ? 'rgba(211, 47, 47, 0.9)' : 'rgba(46, 125, 50, 0.9)',
            color: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            borderRadius: 2,
            fontWeight: 500
          }
        }}
        message={snackbarMessage}
      />
    </>
  );
}

export default BugunCozduklerin;
