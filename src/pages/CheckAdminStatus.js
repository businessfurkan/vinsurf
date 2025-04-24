/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { 
  doc, 
  getDoc, 
  updateDoc,
  setDoc
} from 'firebase/firestore';

const CheckAdminStatus = () => {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'userProfiles', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setError('Kullanıcı profili bulunamadı.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Kullanıcı verileri alınırken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const makeAdmin = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userRef = doc(db, 'userProfiles', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          role: "admin"
        });
        setSuccess('Admin yetkisi başarıyla eklendi! Sayfayı yenileyin ve tekrar deneyin.');
        
        // Refresh user data
        const updatedDoc = await getDoc(userRef);
        setUserData(updatedDoc.data());
      } else {
        // Create user profile if it doesn't exist
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
          photoURL: user.photoURL || '',
          role: "admin",
          createdAt: new Date()
        });
        setSuccess('Kullanıcı profili oluşturuldu ve admin yetkisi eklendi! Sayfayı yenileyin ve tekrar deneyin.');
        
        // Refresh user data
        const updatedDoc = await getDoc(userRef);
        setUserData(updatedDoc.data());
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      setError('Admin yetkisi eklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="warning">
          Bu sayfayı görüntülemek için giriş yapmanız gerekmektedir.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Admin Durumu Kontrol Paneli
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Kullanıcı Bilgileri:
          </Typography>
          <Typography variant="body1">
            <strong>Kullanıcı ID:</strong> {user.uid}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {user.email}
          </Typography>
          <Typography variant="body1">
            <strong>İsim:</strong> {user.displayName || "Belirtilmemiş"}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Firestore Profil Bilgileri:
          </Typography>
          {userData ? (
            <>
              <Typography variant="body1">
                <strong>Rol:</strong> {userData.role || "Belirtilmemiş"}
              </Typography>
              <Typography variant="body1" color={userData.role === "admin" ? "success.main" : "error.main"} fontWeight="bold">
                {userData.role === "admin" 
                  ? "✅ Bu kullanıcı admin yetkisine sahip!" 
                  : "❌ Bu kullanıcı admin yetkisine sahip değil!"}
              </Typography>
            </>
          ) : (
            <Typography variant="body1" color="error.main">
              Firestore'da kullanıcı profili bulunamadı.
            </Typography>
          )}
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={makeAdmin}
            disabled={userData?.role === "admin"}
          >
            {userData?.role === "admin" ? "Zaten Admin Yetkisine Sahipsiniz" : "Admin Yetkisi Ekle"}
          </Button>
        </Box>
        
        <Alert severity="info">
          <Typography variant="body2">
            Admin yetkisi eklendikten sonra, sayfayı yenileyin ve şu yöntemlerden birini deneyin:
          </Typography>
          <ul>
            <li>Sağ üstteki profil fotoğrafınıza 3 saniye içinde 7 kez tıklayın</li>
            <li>Sol alt köşedeki YKS ÇALIŞMA © 2025 yazısına 4 saniye içinde 7 kez tıklayın</li>
            <li>Doğrudan <code>/admin-x1f9wz</code> adresine gidin</li>
          </ul>
        </Alert>
      </Paper>
    </Container>
  );
};

export default CheckAdminStatus;
