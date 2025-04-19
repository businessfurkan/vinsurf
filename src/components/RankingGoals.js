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
    if (!user) return;
    setLoading(true);
    setError('');
    const fetchGoals = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'profile', 'rankingGoals');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGoals(data.goals || initialGoals);
          setSchools(data.schools || initialSchools);
        }
      } catch (err) {
        setError('Hedefler yüklenirken hata oluştu.');
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
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.8)', minWidth: 270, maxWidth: 420 }}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" mb={2}>
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
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, justifyContent: 'center', alignItems: 'flex-start' }}>
            {/* Sıralama hedefleri sol */}
            <Stack spacing={2} sx={{ minWidth: 220, flex: 1 }}>
              <Typography fontWeight={600} fontSize={17} color="#2e3856">Sıralama Hedeflerin</Typography>
              {['EA', 'SAY', 'SÖZ'].map((key) => (
                <TextField
                  key={key}
                  label={key}
                  value={goals[key]}
                  onChange={e => handleChange(key, e.target.value.replace(/\D/g, ''))}
                  placeholder={`Örn: ${key === 'EA' ? '80000' : key === 'SAY' ? '150000' : '45000'}`}
                  InputProps={{
                    sx: { fontWeight: 700, color: goalColors[key], fontSize: 18 },
                    inputProps: { maxLength: 7 }
                  }}
                  variant="outlined"
                  fullWidth
                  sx={{
                    background: `${goalColors[key]}11`,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: `${goalColors[key]}55` },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: goalColors[key] },
                    '& .MuiInputLabel-root': { color: goalColors[key] }
                  }}
                />
              ))}
            </Stack>
            {/* Okul hedefleri sağ */}
            <Stack spacing={2} sx={{ minWidth: 220, flex: 1 }}>
              <Typography fontWeight={600} fontSize={17} color="#2e3856">Hedef Okul ve Bölümler</Typography>
              {schools.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    label={`Okul #${idx+1}`}
                    value={item.university}
                    onChange={e => {
                      const arr = [...schools];
                      arr[idx].university = e.target.value;
                      setSchools(arr);
                    }}
                    placeholder="Üniversite"
                    variant="outlined"
                    fullWidth
                    sx={{ background: '#f7fafc', borderRadius: 2 }}
                  />
                  <TextField
                    label={`Bölüm #${idx+1}`}
                    value={item.department}
                    onChange={e => {
                      const arr = [...schools];
                      arr[idx].department = e.target.value;
                      setSchools(arr);
                    }}
                    placeholder="Bölüm"
                    variant="outlined"
                    fullWidth
                    sx={{ background: '#f7fafc', borderRadius: 2 }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
          <Button type="submit" variant="contained" color="success" sx={{ fontWeight: 700, borderRadius: 2, mt: 3 }} disabled={loading}>
            Kaydet
          </Button>
        </Box>
      ) : (
        <Fade in>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, justifyContent: 'center', alignItems: 'stretch', width: '100%' }}>
            {/* Sıralama hedefleri sol */}
            <Stack spacing={2} alignItems="flex-start" justifyContent="center" sx={{ minWidth: 220, flex: 1 }}>
              <Typography fontWeight={600} fontSize={17} color="#2e3856">Sıralama Hedeflerin</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="flex-start" width="100%" flexWrap="wrap">
                {['EA', 'SAY', 'SÖZ'].map((key) => (
                  <Chip
                    key={key}
                    label={<span style={{ fontWeight: 700, fontSize: 18, wordBreak: 'break-all', textAlign: 'center', width: '100%', display: 'inline-block' }}>{key}: {goals[key] ? goals[key].replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '—'}</span>}
                    sx={{
                      bgcolor: `${goalColors[key]}22`,
                      color: goalColors[key],
                      fontWeight: 700,
                      fontSize: 18,
                      px: 2.5,
                      py: 1.2,
                      borderRadius: 2,
                      border: `2px solid ${goalColors[key]}55`,
                      minWidth: 110,
                      maxWidth: 220,
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
              {schools.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
                  <Chip
                    label={<span style={{ fontWeight: 600, fontSize: 16 }}>{item.university || '—'} <span style={{ color: '#888' }}>/</span> {item.department || '—'}</span>}
                    sx={{
                      bgcolor: '#f7fafc',
                      color: '#2e3856',
                      fontWeight: 600,
                      fontSize: 16,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      border: '1.5px solid #e0e0e0',
                      minWidth: 110,
                      maxWidth: 300,
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
              ))}
            </Stack>
          </Box>
          <Button onClick={() => setEdit(true)} variant="outlined" color="primary" sx={{ mt: 3, borderRadius: 2, fontWeight: 600 }}>
            Hedefleri Düzenle
          </Button>
          {saved && (
            <Typography color="success.main" fontWeight={600} fontSize={14} sx={{ mt: 1 }}>
              ✔️ Kaydedildi!
            </Typography>
          )}
        </Fade>
      )}
    </Paper>
  );
};

export default RankingGoals;
