import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Chip, Stack, Paper, Fade, Alert } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

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
  const [user] = useAuthState(auth);
  const [goals, setGoals] = useState(initialGoals);
  const [schools, setSchools] = useState(initialSchools);
  const [edit, setEdit] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Firestore'dan hedefleri çek
  useEffect(() => {
    if (!user) {
      setGoals(initialGoals);
      setSchools(initialSchools);
      return;
    }
    setLoading(true);
    setError('');
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
        setError('Hedefler yüklenirken hata oluştu.');
        setGoals(initialGoals);
        setSchools(initialSchools);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, [user]);

  const handleChange = (key, value) => {
    if (/^\d{0,7}$/.test(value.replace(/\./g, ''))) {
      setGoals({ ...goals, [key]: value });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const docRef = doc(db, 'users', user.uid, 'profile', 'rankingGoals');
      await setDoc(docRef, { goals, schools }, { merge: true });
      setSaved(true);
      setEdit(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError('Hedefler kaydedilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ 
  p: { xs: 1.5, sm: 2, md: 3 }, 
  borderRadius: { xs: 2, md: 4 }, 
  background: 'rgba(255,255,255,0.8)', 
  minWidth: { xs: '90vw', sm: 270 }, 
  maxWidth: { xs: '98vw', sm: 420 }, 
  width: { xs: '100%', sm: 'auto' },
  mx: { xs: 'auto', md: 0 }
}}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} alignItems="center" justifyContent="center" mb={{ xs: 1, sm: 2 }} gap={0.5}>
        <EmojiEventsIcon sx={{ color: '#F4B400', fontSize: 32 }} />
        <Typography fontWeight={700} color="#2e3856" fontSize={18}>
          Hedef Sıralamalarım
        </Typography>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!user ? (
        <Alert severity="info">Hedeflerini kaydetmek için giriş yapmalısın.</Alert>
      ) : loading ? (
        <Typography color="text.secondary" align="center">Yükleniyor...</Typography>
      ) : edit ? (
        <Box component="form" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, sm: 3, md: 4 },
            justifyContent: 'center',
            alignItems: { xs: 'stretch', md: 'flex-start' },
            width: '100%'
          }}>
            {/* Sıralama hedefleri sol ayrı kart */}
            <Paper elevation={2} sx={{ flex: 1, minWidth: 220, p: { xs: 2, md: 3 }, borderRadius: 3, mb: { xs: 2, md: 0 } }}>
              <Typography fontWeight={700} fontSize={17} color="#2e3856" mb={1}>
                Sıralama Hedeflerin
              </Typography>
              {['EA', 'SAY', 'SÖZ'].map((key) => (
                <TextField
                  key={key}
                  label={key}
                  value={goals[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  fullWidth
                  sx={{
                    input: { fontWeight: 700, color: goalColors[key] },
                    mb: 1.5,
                  }}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: <span style={{ color: goalColors[key], fontWeight: 700 }}>{key}:</span>
                  }}
                />
              ))}
            </Paper>
            {/* Okul hedefleri sağ ayrı kart */}
            <Paper elevation={2} sx={{ flex: 1, minWidth: 220, p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Typography fontWeight={700} fontSize={17} color="#2e3856" mb={1}>
                Hedef Okul ve Bölümler
              </Typography>
              {schools.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
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
                    sx={{ mb: 1 }}
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
                    sx={{ mb: 1 }}
                  />
                </Box>
              ))}
            </Paper>
          </Box>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 3, borderRadius: 2, fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}>
            Kaydet
          </Button>
        </Box>
      ) : (
        <>
          {saved && (
            <Fade in={!!saved}>
              <Alert severity="success" sx={{ mt: 2 }}>
                Hedefler başarıyla kaydedildi!
              </Alert>
            </Fade>
          )}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: { xs: 2, sm: 3, md: 4 }, 
            justifyContent: 'center', 
            alignItems: { xs: 'stretch', md: 'stretch' },
            width: '100%' 
          }}>
            {/* Sıralama hedefleri sol */}
            <Stack spacing={2} alignItems="flex-start" justifyContent="center" sx={{ minWidth: 220, flex: 1 }}>
              <Typography fontWeight={600} fontSize={17} color="#2e3856">Sıralama Hedeflerin</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="flex-start" width="100%" flexWrap="wrap">
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
            </Stack>
            {/* Okul hedefleri sağ */}
            <Stack spacing={2} alignItems="flex-start" justifyContent="center" sx={{ minWidth: 220, flex: 1 }}>
              <Typography fontWeight={600} fontSize={17} color="#2e3856">Hedef Okul ve Bölümler</Typography>
              {Array.isArray(schools) && schools.length > 0 ? schools.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 1 }, alignItems: { xs: 'stretch', sm: 'center' }, width: '100%' }}>
                  <Chip
                    label={<span style={{ fontWeight: 600, fontSize: 'clamp(13px, 3vw, 16px)' }}>{item.university || '—'} <span style={{ color: '#888' }}>/</span> {item.department || '—'}</span>}
                    sx={{
                      bgcolor: '#f7fafc',
                      color: '#2e3856',
                      fontWeight: 600,
                      fontSize: { xs: 13, sm: 16 },
                      px: { xs: 1, sm: 2 },
                      py: { xs: 0.7, sm: 1 },
                      borderRadius: 2,
                      border: '1.5px solid #e0e0e0',
                      minWidth: { xs: 80, sm: 110 },
                      maxWidth: { xs: 200, sm: 300 },
                      width: 'auto',
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      textAlign: 'left',
                      overflow: 'visible',
                      whiteSpace: 'normal',
                    }}
                    variant="outlined"
                  />
                </Box>
              )) : null}
            </Stack>
          </Box>
          <Button onClick={() => setEdit(true)} variant="outlined" color="primary" sx={{ mt: 3, borderRadius: 2, fontWeight: 600 }}>
            Hedefleri Düzenle
          </Button>
        </>
      )}
    </Paper>
  );
}

export default RankingGoals;
