import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Chip, 
  Stack, 
  Paper, 
  Fade, 
  Alert,
  Grid
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ThemeContext } from '../context/ThemeContext';

const goalColors = {
  EA: '#4285F4',
  SAY: '#0F9D58',
  SÖZ: '#DB4437'
};

const initialGoals = { EA: '', SAY: '', SÖZ: '' };
const initialSchools = [
  { university: '', department: '' },
  { university: '', department: '' },
  { university: '', department: '' },
];

const RankingGoals = () => {
  const { darkMode } = useContext(ThemeContext);
  
  const [user] = useAuthState(auth);
  const [goals, setGoals] = useState(initialGoals);
  const [schools, setSchools] = useState(initialSchools);
  // Firestore'dan hedefleri çek
  useEffect(() => {
    if (!user) {
      setGoals(initialGoals);
      setSchools(initialSchools);
      return;
    }
    const fetchGoals = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'profile', 'rankingGoals');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGoals(data && data.goals ? data.goals : initialGoals);
          setSchools(Array.isArray(data && data.schools) ? data.schools : initialSchools);
        } else {
          setGoals(initialGoals);
          setSchools(initialSchools);
        }
      } catch (err) {
        setErrorGoals('Hedefler yüklenirken hata oluştu.');
        setErrorSchools('Hedefler yüklenirken hata oluştu.');
      }
    };
    fetchGoals();
  }, [user]);

  const handleChange = (key, value) => {
    if (/^\d{0,7}$/.test(value.replace(/\./g, ''))) {
      setGoals({ ...goals, [key]: value });
    }
  };

  // Bağımsız state'ler
  const [editGoals, setEditGoals] = useState(false);
  const [editSchools, setEditSchools] = useState(false);
  const [savedGoals, setSavedGoals] = useState(false);
  const [savedSchools, setSavedSchools] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [errorGoals, setErrorGoals] = useState('');
  const [errorSchools, setErrorSchools] = useState('');

  // Sıralama hedeflerini kaydet
  const handleSaveGoals = async () => {
    if (!user) return;
    setLoadingGoals(true);
    setErrorGoals('');
    try {
      const docRef = doc(db, 'users', user.uid, 'profile', 'rankingGoals');
      await setDoc(docRef, { goals }, { merge: true });
      setSavedGoals(true);
      setEditGoals(false);
      setTimeout(() => setSavedGoals(false), 2000);
    } catch (err) {
      setErrorGoals('Sıralama hedefleri kaydedilirken hata oluştu.');
    } finally {
      setLoadingGoals(false);
    }
  };
  // Okul hedeflerini kaydet
  const handleSaveSchools = async () => {
    if (!user) return;
    setLoadingSchools(true);
    setErrorSchools('');
    try {
      const docRef = doc(db, 'users', user.uid, 'profile', 'rankingGoals');
      await setDoc(docRef, { schools }, { merge: true });
      setSavedSchools(true);
      setEditSchools(false);
      setTimeout(() => setSavedSchools(false), 2000);
    } catch (err) {
      setErrorSchools('Okul hedefleri kaydedilirken hata oluştu.');
    } finally {
      setLoadingSchools(false);
    }
  };


  return (
    <Grid container spacing={3} sx={{ width: '100%', mt: 1 }}>
      {/* Sıralama Hedefleri Kartı */}
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            borderRadius: 4, 
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)', 
            backdropFilter: 'blur(10px)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: darkMode ? 
              '0 8px 32px rgba(0, 0, 0, 0.2)' : 
              '0 8px 32px rgba(85, 179, 217, 0.1)',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '6px',
              height: '100%',
              background: 'linear-gradient(to bottom, #55b3d9, #abe7ff)',
              borderTopLeftRadius: '4px',
              borderBottomLeftRadius: '4px'
            }
          }}
        >
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <EmojiEventsIcon sx={{ color: '#F4B400', fontSize: 28 }} />
          <Typography fontWeight={700} color="#2e3856" fontSize={18}>
            Sıralama Hedeflerin
          </Typography>
        </Stack>
        {errorGoals && <Alert severity="error" sx={{ mb: 2 }}>{errorGoals}</Alert>}
        {!user ? (
          <Alert severity="info">Giriş yapmalısın.</Alert>
        ) : loadingGoals ? (
          <Typography color="text.secondary" align="center">Yükleniyor...</Typography>
        ) : editGoals ? (
          <Box>
            {['EA', 'SAY', 'SÖZ'].map((key) => (
              <TextField
                key={key}
                label={key}
                value={goals[key]}
                onChange={e => handleChange(key, e.target.value)}
                fullWidth
                sx={{ input: { fontWeight: 700, color: goalColors[key] }, mb: 1.5 }}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: <span style={{ color: goalColors[key], fontWeight: 700 }}>{key}:</span>
                }}
              />
            ))}
            <Button onClick={handleSaveGoals} variant="contained" color="primary" sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}>
              Kaydet
            </Button>
            <Button onClick={() => setEditGoals(false)} sx={{ mt: 2, ml: 1 }}>İptal</Button>
          </Box>
        ) : (
          <>
            <Stack spacing={1.5} mb={2}>
              {['EA', 'SAY', 'SÖZ'].map((key) => (
                <Chip
                  key={key}
                  label={<span style={{ fontWeight: 700, fontSize: 'clamp(15px, 4vw, 18px)', wordBreak: 'break-all', textAlign: 'center', width: '100%', display: 'inline-block' }}>{key}: {goals && goals[key] ? goals[key].replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '—'}</span>}
                  sx={{
                    bgcolor: `${goalColors[key]}22`,
                    color: goalColors[key],
                    fontWeight: 700,
                    fontSize: { xs: 15, sm: 18 },
                    px: { xs: 1.2, sm: 2.5 },
                    py: { xs: 0.8, sm: 1.2 },
                    borderRadius: 2,
                    border: `2px solid ${goalColors[key]}55`,
                    minWidth: { xs: 80, sm: 110 },
                    maxWidth: { xs: 160, sm: 220 },
                    width: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    overflow: 'visible',
                    whiteSpace: 'normal',
                  }}
                  variant="outlined"
                />
              ))}
            </Stack>
            <Button onClick={() => setEditGoals(true)} variant="outlined" color="primary" sx={{ borderRadius: 2, fontWeight: 600 }}>
              Hedefleri Düzenle
            </Button>
            {savedGoals && (
              <Fade in={!!savedGoals}>
                <Alert severity="success" sx={{ mt: 2 }}>
                  Sıralama hedeflerin kaydedildi!
                </Alert>
              </Fade>
            )}
          </>
        )}
      </Paper>
      {/* Okul ve Bölüm Hedefleri Kartı */}
      <Paper elevation={3} sx={{ flex: 1, minWidth: 260, maxWidth: 400, p: { xs: 2, md: 3 }, borderRadius: 4, background: '#fff', ml: { md: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <EmojiEventsIcon sx={{ color: '#0F9D58', fontSize: 28 }} />
          <Typography fontWeight={700} color="#2e3856" fontSize={18}>
            Hedef Okul ve Bölümler
          </Typography>
        </Stack>
        {errorSchools && <Alert severity="error" sx={{ mb: 2 }}>{errorSchools}</Alert>}
        {!user ? (
          <Alert severity="info">Giriş yapmalısın.</Alert>
        ) : loadingSchools ? (
          <Typography color="text.secondary" align="center">Yükleniyor...</Typography>
        ) : editSchools ? (
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {schools.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', flexDirection: 'row', gap: 1, mb: 1 }}>
                  <TextField
                    label="Üniversite"
                    value={item.university}
                    onChange={e => {
                      const updated = [...schools];
                      updated[idx].university = e.target.value;
                      setSchools(updated);
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <TextField
                    label="Bölüm"
                    value={item.department}
                    onChange={e => {
                      const updated = [...schools];
                      updated[idx].department = e.target.value;
                      setSchools(updated);
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Box>
              ))}
            </Box>
            <Button onClick={handleSaveSchools} variant="contained" color="primary" sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}>
              Kaydet
            </Button>
            <Button onClick={() => setEditSchools(false)} sx={{ mt: 2, ml: 1 }}>İptal</Button>
          </Box>
        ) : (
          <>
            <Stack spacing={1.5} mb={2}>
              {schools.map((item, idx) => (
                <Chip
                  key={idx}
                  label={<span style={{ fontWeight: 700, fontSize: 'clamp(15px, 4vw, 18px)', wordBreak: 'break-all', textAlign: 'center', display: 'inline-block' }}>{item.university} - {item.department}</span>}
                  sx={{
                    bgcolor: '#0F9D5822',
                    color: '#0F9D58',
                    fontWeight: 700,
                    fontSize: { xs: 15, sm: 18 },
                    px: { xs: 1.8, sm: 3 },
                    py: { xs: 0.8, sm: 1.2 },
                    borderRadius: 2,
                    border: '2px solid #0F9D5855',
                    width: 'fit-content',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    overflow: 'visible',
                    whiteSpace: 'normal',
                  }}
                  variant="outlined"
                />
              ))}
            </Stack>
            <Button onClick={() => setEditSchools(true)} variant="outlined" color="primary" sx={{ borderRadius: 2, fontWeight: 600 }}>
              Hedefleri Düzenle
            </Button>
            {savedSchools && (
              <Fade in={!!savedSchools}>
                <Alert severity="success" sx={{ mt: 2 }}>
                  Okul ve bölüm hedeflerin kaydedildi!
                </Alert>
              </Fade>
            )}
          </>
        )}
          </Paper>
        </Grid>
      </Grid>
    );
}

export default RankingGoals;
