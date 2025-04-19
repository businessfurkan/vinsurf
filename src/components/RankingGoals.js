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

const RankingGoals = () => {
  const [user] = useAuthState(auth);
  const [goals, setGoals] = useState({ EA: '', SAY: '', SÖZ: '' });
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
          setGoals(docSnap.data());
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
      await setDoc(docRef, goals, { merge: true });
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
          <Stack spacing={2}>
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
            <Button type="submit" variant="contained" color="success" sx={{ fontWeight: 700, borderRadius: 2 }} disabled={loading}>
              Kaydet
            </Button>
          </Stack>
        </Box>
      ) : (
        <Fade in>
          <Stack spacing={2} alignItems="center">
            <Stack direction="row" spacing={2}>
              {['EA', 'SAY', 'SÖZ'].map((key) => (
                <Chip
                  key={key}
                  label={
                    <span style={{ fontWeight: 700, fontSize: 18 }}>
                      {key}: {goals[key] ? goals[key].replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '—'}
                    </span>
                  }
                  sx={{
                    bgcolor: `${goalColors[key]}22`,
                    color: goalColors[key],
                    fontWeight: 700,
                    fontSize: 18,
                    px: 2.5,
                    py: 1.2,
                    borderRadius: 2,
                    border: `2px solid ${goalColors[key]}55`,
                  }}
                  variant="outlined"
                />
              ))}
            </Stack>
            <Button onClick={() => setEdit(true)} variant="outlined" color="primary" sx={{ mt: 1, borderRadius: 2, fontWeight: 600 }}>
              Hedefleri Düzenle
            </Button>
            {saved && (
              <Typography color="success.main" fontWeight={600} fontSize={14}>
                ✔️ Kaydedildi!
              </Typography>
            )}
          </Stack>
        </Fade>
      )}
    </Paper>
  );
};

export default RankingGoals;
