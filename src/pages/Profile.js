import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Button, 
  TextField, 
  Grid, 
  Divider, 
  IconButton, 
  Alert, 
  Snackbar,
  Card,
  CardContent,
  useTheme,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { auth, db, storage } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { playClickSound } from '../utils/soundUtils';

// Styled components
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  margin: '0 auto 24px',
  position: 'relative',
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const CameraIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  bottom: 0,
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  marginBottom: theme.spacing(4),
  backgroundColor: '#FFFFF0',
}));

const Profile = () => {
  const [user, loading] = useAuthState(auth);
  const theme = useTheme();
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    school: '',
    grade: '',
    targetUniversity: '',
    targetDepartment: '',
    bio: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData(prevState => ({
        ...prevState,
        displayName: user.displayName || '',
        email: user.email || '',
      }));
      
      // Fetch additional user data from Firestore
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfileData(prevState => ({
              ...prevState,
              ...userData,
            }));
          } else {
            // Create a default user document if it doesn't exist
            await setDoc(doc(db, 'users', user.uid), {
              displayName: user.displayName || '',
              email: user.email || '',
              school: '',
              grade: '',
              targetUniversity: '',
              targetDepartment: '',
              bio: '',
              createdAt: new Date(),
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Kullanıcı verileri alınırken bir hata oluştu.');
          setOpenSnackbar(true);
        }
      };
      
      fetchUserData();
    }
  }, [user]);

  const handleProfilePictureChange = (e) => {
    playClickSound();
    const file = e.target.files[0];
    if (file && user) {
      setIsUploading(true);
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading profile picture:', error);
          setError('Profil resmi yüklenirken bir hata oluştu.');
          setOpenSnackbar(true);
          setIsUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateProfile(user, { photoURL: downloadURL });
            
            // Update the user document in Firestore
            await updateDoc(doc(db, 'users', user.uid), {
              photoURL: downloadURL,
              updatedAt: new Date(),
            });
            
            setSuccess('Profil resmi başarıyla güncellendi.');
            setOpenSnackbar(true);
          } catch (error) {
            console.error('Error updating profile with new picture:', error);
            setError('Profil resmi güncellenirken bir hata oluştu.');
            setOpenSnackbar(true);
          } finally {
            setIsUploading(false);
          }
        }
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    playClickSound();
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    playClickSound();
    if (user) {
      try {
        // Update displayName in Firebase Auth
        await updateProfile(user, { displayName: profileData.displayName });
        
        // Update user data in Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: profileData.displayName,
          school: profileData.school,
          grade: profileData.grade,
          targetUniversity: profileData.targetUniversity,
          targetDepartment: profileData.targetDepartment,
          bio: profileData.bio,
          updatedAt: new Date(),
        });
        
        setSuccess('Profil başarıyla güncellendi.');
        setOpenSnackbar(true);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating profile:', error);
        setError('Profil güncellenirken bir hata oluştu.');
        setOpenSnackbar(true);
      }
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', backgroundColor: '#FFFFF0' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, px: 2, backgroundColor: '#FFFFF0' }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        align="center"
        sx={{ 
          fontWeight: 700, 
          mb: 4,
          color: theme.palette.primary.main
        }}
      >
        Profilim
      </Typography>
      
      <Grid container spacing={4} justifyContent="center">
        {/* Profile Photo and Edit Button Section */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <StyledPaper elevation={0} sx={{ width: '100%' }}>
            <Box sx={{ textAlign: 'center', position: 'relative' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <ProfileAvatar 
                  src={user?.photoURL} 
                  alt={user?.displayName || 'Kullanıcı'}
                >
                  {!user?.photoURL && (user?.displayName?.[0] || 'K')}
                </ProfileAvatar>
                <CameraIconButton 
                  component="label" 
                  aria-label="upload picture"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <CircularProgress size={24} color="inherit" variant="determinate" value={uploadProgress} />
                  ) : (
                    <PhotoCameraIcon />
                  )}
                  <VisuallyHiddenInput type="file" accept="image/*" onChange={handleProfilePictureChange} />
                </CameraIconButton>
              </Box>
              
              <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                {user?.displayName || 'Kullanıcı'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {user?.email}
              </Typography>
              
              <Button 
                variant={isEditing ? "contained" : "outlined"}
                color={isEditing ? "success" : "primary"}
                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                onClick={isEditing ? handleSaveProfile : handleEditToggle}
                sx={{ borderRadius: 2, px: 3 }}
              >
                {isEditing ? 'Kaydet' : 'Profili Düzenle'}
              </Button>
            </Box>
          </StyledPaper>
        </Grid>
        
        {/* Personal Information Section - Centered in the page */}
        <Grid item xs={12}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={8}>
              <StyledPaper elevation={0}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, borderBottom: '2px solid #4285F4', paddingBottom: '8px', textAlign: 'center' }}>
                    Kişisel Bilgiler
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ad Soyad"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="E-posta"
                      name="email"
                      value={profileData.email}
                      disabled={true} // Email cannot be changed
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Okul"
                      name="school"
                      value={profileData.school}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Sınıf"
                      name="grade"
                      value={profileData.grade}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Hedef Üniversite"
                      name="targetUniversity"
                      value={profileData.targetUniversity}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Hedef Bölüm"
                      name="targetDepartment"
                      value={profileData.targetDepartment}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Hakkımda"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      multiline
                      rows={4}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </StyledPaper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
