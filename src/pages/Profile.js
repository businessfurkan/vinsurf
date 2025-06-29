import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Button, 
  TextField, 
  Grid, 
  IconButton, 
  Alert, 
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

import { auth, db, storage } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { playClickSound } from '../utils/soundUtils';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { playClickSound } from '../utils/soundUtils';

// Styled components
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  border: '4px solid rgba(138, 43, 226, 0.5)',
  boxShadow: '0 8px 32px rgba(138, 43, 226, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3)',
  margin: '0 auto 24px',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #8A2BE2, #1E90FF, #FF1493)',
    animation: 'avatarGlow 2s ease-in-out infinite alternate',
    filter: 'blur(12px)',
    opacity: 0.7,
    zIndex: -1
  },
  '@keyframes avatarGlow': {
    '0%': { opacity: 0.5, transform: 'scale(1)' },
    '100%': { opacity: 0.9, transform: 'scale(1.1)' }
  }
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
  background: 'linear-gradient(135deg, #8A2BE2 0%, #1E90FF 100%)',
  color: 'white',
  width: 48,
  height: 48,
  borderRadius: '12px',
  border: '2px solid rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 16px rgba(138, 43, 226, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #9A32F2 0%, #2E9AFF 100%)',
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 12px 24px rgba(138, 43, 226, 0.6)',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '24px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 10px 20px rgba(138, 43, 226, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
  marginBottom: theme.spacing(4),
  background: 'linear-gradient(135deg, rgba(26, 5, 69, 0.95) 0%, rgba(45, 15, 90, 0.9) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(138, 43, 226, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(138, 43, 226, 0.1) 0%, rgba(30, 144, 255, 0.1) 50%, rgba(255, 20, 147, 0.1) 100%)',
    zIndex: -1,
    animation: 'profileShimmer 3s ease-in-out infinite alternate'
  },
  '@keyframes profileShimmer': {
    '0%': {
      background: 'linear-gradient(45deg, rgba(138, 43, 226, 0.1) 0%, rgba(30, 144, 255, 0.1) 50%, rgba(255, 20, 147, 0.1) 100%)'
    },
    '100%': {
      background: 'linear-gradient(45deg, rgba(255, 20, 147, 0.1) 0%, rgba(138, 43, 226, 0.1) 50%, rgba(30, 144, 255, 0.1) 100%)'
    }
  }
}));

const ModernTextField = styled(TextField)({
  marginBottom: '16px',
  '& .MuiOutlinedInput-root': {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
    backdropFilter: 'blur(15px)',
    borderRadius: '16px',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 500,
    border: '1px solid rgba(138, 43, 226, 0.2)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
      border: '1px solid rgba(138, 43, 226, 0.4)',
      boxShadow: '0 6px 16px rgba(138, 43, 226, 0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
      transform: 'translateY(-1px)',
    },
    '&.Mui-focused': {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
      border: '1px solid #8A2BE2',
      boxShadow: '0 8px 20px rgba(138, 43, 226, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
      transform: 'translateY(-2px)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 500,
    fontSize: '0.95rem',
    '&.Mui-focused': {
      color: '#ffffff',
      fontWeight: 600,
    },
  },
  '& .MuiOutlinedInput-input': {
    color: '#ffffff',
    fontWeight: 500,
    '&::placeholder': {
      color: 'rgba(255,255,255,0.5)',
    },
  },
});

const Profile = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    // Temel Bilgiler
    birthDate: '',
    age: '',
    isGraduated: false,
    // Hedef Bilgileri
    targetField: '', // Sayısal / Sözel / Eşit Ağırlık / Dil
    targetUniversityDepartment: '',
    whyThisDepartment: '',
    backupPlan: '',
    // Akademik Durum
    gpa: '',
    tytAverage: '',
    aytAverage: '',
    strongSubjects: '',
    weakSubjects: '',
    // Psikolojik & Motivasyonel Bilgiler
    motivationFactors: '',
    copingStrategies: '',
    studyEnvironment: '',
    examAnxiety: '',
    // Sağlık ve Özel Durumlar
    healthConditions: '',
    sleepProblems: '',
  });
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
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
              // Temel Bilgiler
              birthDate: '',
              age: '',
              isGraduated: false,
              // Hedef Bilgileri
              targetField: '',
              targetUniversityDepartment: '',
              whyThisDepartment: '',
              backupPlan: '',
              // Akademik Durum
              gpa: '',
              tytAverage: '',
              aytAverage: '',
              strongSubjects: '',
              weakSubjects: '',
              // Psikolojik & Motivasyonel Bilgiler
              motivationFactors: '',
              copingStrategies: '',
              studyEnvironment: '',
              examAnxiety: '',
              // Sağlık ve Özel Durumlar
              healthConditions: '',
              sleepProblems: '',
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

  const handlePersonalInfoEditToggle = () => {
    playClickSound();
    setIsEditingPersonalInfo(!isEditingPersonalInfo);
  };

  const handleSavePersonalInfo = async () => {
    playClickSound();
    if (user) {
      try {
        // Update displayName in Firebase Auth
        await updateProfile(user, { displayName: profileData.displayName });
        
        // Update user data in Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: profileData.displayName,
          // Temel Bilgiler
          birthDate: profileData.birthDate,
          age: profileData.age,
          isGraduated: profileData.isGraduated,
          // Hedef Bilgileri
          targetField: profileData.targetField,
          targetUniversityDepartment: profileData.targetUniversityDepartment,
          whyThisDepartment: profileData.whyThisDepartment,
          backupPlan: profileData.backupPlan,
          // Akademik Durum
          gpa: profileData.gpa,
          tytAverage: profileData.tytAverage,
          aytAverage: profileData.aytAverage,
          strongSubjects: profileData.strongSubjects,
          weakSubjects: profileData.weakSubjects,
          // Psikolojik & Motivasyonel Bilgiler
          motivationFactors: profileData.motivationFactors,
          copingStrategies: profileData.copingStrategies,
          studyEnvironment: profileData.studyEnvironment,
          examAnxiety: profileData.examAnxiety,
          // Sağlık ve Özel Durumlar
          healthConditions: profileData.healthConditions,
          sleepProblems: profileData.sleepProblems,
          updatedAt: new Date(),
        });
        
        setSuccess('Kişisel bilgiler başarıyla güncellendi.');
        setOpenSnackbar(true);
        setIsEditingPersonalInfo(false);
      } catch (error) {
        console.error('Error updating personal info:', error);
        setError('Kişisel bilgiler güncellenirken bir hata oluştu.');
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



  // Admin şifre kontrolü
  const handleAdminPasswordSubmit = () => {
    if (adminPassword === 'Arzu280521!@!') {
      setShowAdminDialog(false);
      navigate('/admin-panel');
    } else {
      setAdminError('Hatalı şifre!');
    }
  };

  // Admin dialog kapatma
  const handleAdminDialogClose = () => {
    setShowAdminDialog(false);
    setAdminPassword('');
    setAdminError('');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh', 
        backgroundColor: '#1a0545',
        minHeight: '100vh'
      }}>
        <CircularProgress sx={{ color: '#8A2BE2' }} size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      mt: 4, 
      px: 2, 
      backgroundColor: '#1a0545',
      minHeight: '100vh',
      pb: 4
    }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        align="center"
        sx={{ 
          fontWeight: 700, 
          mb: 4,
          background: 'linear-gradient(45deg, #8A2BE2 30%, #1E90FF 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 8px rgba(138, 43, 226, 0.3)',
          fontSize: '2.5rem'
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
              
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mt: 2,
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {user?.displayName || 'Kullanıcı'}
              </Typography>
              <Typography variant="body2" sx={{ 
                mb: 3,
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.95rem'
              }}>
                {user?.email}
              </Typography>
              
              <Button 
                variant="contained"
                startIcon={<PhotoCameraIcon />}
                sx={{ 
                  borderRadius: '16px', 
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 16px rgba(255, 107, 107, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FF7B7B 0%, #FF9E63 100%)',
                    transform: 'translateY(-2px) scale(1.05)',
                    boxShadow: '0 12px 24px rgba(255, 107, 107, 0.6)',
                  }
                }}
              >
                Profil Fotoğrafı
              </Button>
            </Box>
          </StyledPaper>
        </Grid>
        
        {/* Personal Information Section - Centered in the page */}
        <Grid item xs={12}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={8}>
              <StyledPaper elevation={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    background: 'linear-gradient(45deg, #8A2BE2 30%, #1E90FF 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    borderBottom: '2px solid rgba(138, 43, 226, 0.5)', 
                    paddingBottom: '8px', 
                    fontSize: '1.3rem'
                  }}>
                    Kişisel Bilgiler
                  </Typography>
                  
                  <Button 
                    variant="contained"
                    startIcon={isEditingPersonalInfo ? <SaveIcon /> : <EditIcon />}
                    onClick={isEditingPersonalInfo ? handleSavePersonalInfo : handlePersonalInfoEditToggle}
                    sx={{ 
                      borderRadius: '16px', 
                      px: 3,
                      py: 1.2,
                      background: isEditingPersonalInfo ? 
                        'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)' :
                        'linear-gradient(135deg, #8A2BE2 0%, #1E90FF 100%)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: isEditingPersonalInfo ?
                        '0 8px 16px rgba(76, 175, 80, 0.4)' :
                        '0 8px 16px rgba(138, 43, 226, 0.4)',
                      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      '&:hover': {
                        background: isEditingPersonalInfo ?
                          'linear-gradient(135deg, #5CBF60 0%, #9CD44A 100%)' :
                          'linear-gradient(135deg, #9A32F2 0%, #2E9AFF 100%)',
                        transform: 'translateY(-2px) scale(1.05)',
                        boxShadow: isEditingPersonalInfo ?
                          '0 12px 24px rgba(76, 175, 80, 0.6)' :
                          '0 12px 24px rgba(138, 43, 226, 0.6)',
                      }
                    }}
                  >
                    {isEditingPersonalInfo ? 'Kaydet' : 'Düzenle'}
                  </Button>
                </Box>
                
                {/* Temel Bilgiler Accordion */}
                <Accordion 
                  defaultExpanded 
                  sx={{ 
                    mb: 2,
                    background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(30, 144, 255, 0.1) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px !important',
                    border: '1px solid rgba(138, 43, 226, 0.2)',
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}
                    sx={{ 
                      '& .MuiAccordionSummary-content': { 
                        alignItems: 'center',
                        gap: 2
                      }
                    }}
                  >
                    <PersonIcon sx={{ color: '#8A2BE2' }} />
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                      Temel Bilgiler
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <ModernTextField
                          fullWidth
                          label="Ad Soyad"
                          name="displayName"
                          value={profileData.displayName}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ModernTextField
                          fullWidth
                          label="E-posta"
                          name="email"
                          value={profileData.email}
                          disabled={true}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ModernTextField
                          fullWidth
                          label="Doğum Tarihi"
                          name="birthDate"
                          type="date"
                          value={profileData.birthDate}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ModernTextField
                          fullWidth
                          label="Yaş"
                          name="age"
                          type="number"
                          value={profileData.age}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={profileData.isGraduated}
                              onChange={(e) => setProfileData(prev => ({ ...prev, isGraduated: e.target.checked }))}
                              disabled={!isEditingPersonalInfo}
                              sx={{
                                color: 'rgba(255,255,255,0.7)',
                                '&.Mui-checked': { color: '#8A2BE2' }
                              }}
                            />
                          }
                          label={<Typography sx={{ color: '#ffffff', fontWeight: 500 }}>Mezun musun?</Typography>}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Hedef Bilgileri Accordion */}
                <Accordion 
                  sx={{ 
                    mb: 2,
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px !important',
                    border: '1px solid rgba(76, 175, 80, 0.2)',
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}
                    sx={{ 
                      '& .MuiAccordionSummary-content': { 
                        alignItems: 'center',
                        gap: 2
                      }
                    }}
                  >
                    <SchoolIcon sx={{ color: '#4CAF50' }} />
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                      Hedef Bilgileri
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth disabled={!isEditingPersonalInfo}>
                          <InputLabel id="target-field-label" sx={{ color: 'rgba(255,255,255,0.8)' }}>Hedeflenen Alan</InputLabel>
                          <Select
                            labelId="target-field-label"
                            value={profileData.targetField}
                            name="targetField"
                            onChange={handleInputChange}
                            label="Hedeflenen Alan"
                            sx={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                              borderRadius: '16px',
                              color: '#ffffff',
                              border: '1px solid rgba(76, 175, 80, 0.2)',
                              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                              '& .MuiSvgIcon-root': { color: '#ffffff' }
                            }}
                          >
                            <MenuItem value="Sayısal">Sayısal</MenuItem>
                            <MenuItem value="Sözel">Sözel</MenuItem>
                            <MenuItem value="Eşit Ağırlık">Eşit Ağırlık</MenuItem>
                            <MenuItem value="Dil">Dil</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ModernTextField
                          fullWidth
                          label="Hedeflenen Üniversite ve Bölüm"
                          name="targetUniversityDepartment"
                          value={profileData.targetUniversityDepartment}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          variant="outlined"
                          placeholder="örn: Hacettepe Tıp, İstanbul Hukuk"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ModernTextField
                          fullWidth
                          label="Neden Bu Bölüm?"
                          name="whyThisDepartment"
                          value={profileData.whyThisDepartment}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          multiline
                          rows={3}
                          variant="outlined"
                          placeholder="İstekli mi, aile baskısı mı, alternatif planları var mı?"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ModernTextField
                          fullWidth
                          label="Yedek Planı"
                          name="backupPlan"
                          value={profileData.backupPlan}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          multiline
                          rows={2}
                          variant="outlined"
                          placeholder="Açıköğretim, tekrar hazırlanma, yurtdışı gibi"
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Akademik Durum Accordion */}
                <Accordion 
                  sx={{ 
                    mb: 2,
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px !important',
                    border: '1px solid rgba(255, 152, 0, 0.2)',
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}
                    sx={{ 
                      '& .MuiAccordionSummary-content': { 
                        alignItems: 'center',
                        gap: 2
                      }
                    }}
                  >
                    <SchoolIcon sx={{ color: '#FF9800' }} />
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                      Akademik Durum
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <ModernTextField
                          fullWidth
                          label="Son OBP (Okul Başarı Puanı)"
                          name="gpa"
                          type="number"
                          value={profileData.gpa}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          variant="outlined"
                          inputProps={{ step: "0.01", min: "0", max: "100" }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <ModernTextField
                          fullWidth
                          label="TYT Deneme Net Ortalaması"
                          name="tytAverage"
                          type="number"
                          value={profileData.tytAverage}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          variant="outlined"
                          inputProps={{ step: "0.1", min: "0", max: "120" }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <ModernTextField
                          fullWidth
                          label="AYT Deneme Net Ortalaması"
                          name="aytAverage"
                          type="number"
                          value={profileData.aytAverage}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          variant="outlined"
                          inputProps={{ step: "0.1", min: "0", max: "80" }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ModernTextField
                          fullWidth
                          label="En Güçlü Dersler"
                          name="strongSubjects"
                          value={profileData.strongSubjects}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          variant="outlined"
                          placeholder="Matematik, Fizik, Türkçe..."
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ModernTextField
                          fullWidth
                          label="En Zayıf Dersler"
                          name="weakSubjects"
                          value={profileData.weakSubjects}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          variant="outlined"
                          placeholder="Kimya, Tarih, Coğrafya..."
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Psikolojik & Motivasyonel Bilgiler Accordion */}
                <Accordion 
                  sx={{ 
                    mb: 2,
                    background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px !important',
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}
                    sx={{ 
                      '& .MuiAccordionSummary-content': { 
                        alignItems: 'center',
                        gap: 2
                      }
                    }}
                  >
                    <PsychologyIcon sx={{ color: '#E91E63' }} />
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                      Psikolojik & Motivasyonel Bilgiler
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <ModernTextField
                          fullWidth
                          label="Motive Olduğu Şeyler / Cümleler"
                          name="motivationFactors"
                          value={profileData.motivationFactors}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          multiline
                          rows={3}
                          variant="outlined"
                          placeholder="Hayalindeki ev, ailesini mutlu etmek, hayalindeki şehir..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ModernTextField
                          fullWidth
                          label="Zorlandığında Ne Yapar? Nasıl Motive Olur?"
                          name="copingStrategies"
                          value={profileData.copingStrategies}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          multiline
                          rows={3}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ModernTextField
                          fullWidth
                          label="Çalışma Ortamı"
                          name="studyEnvironment"
                          value={profileData.studyEnvironment}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          multiline
                          rows={2}
                          variant="outlined"
                          placeholder="Evde destek var mı, sessiz mi?"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ModernTextField
                          fullWidth
                          label="Sınav Fobisi / Dikkat Eksikliği / Öğrenme Zorluğu"
                          name="examAnxiety"
                          value={profileData.examAnxiety}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          multiline
                          rows={2}
                          variant="outlined"
                          placeholder="Varsa belirtiniz..."
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Sağlık ve Özel Durumlar Accordion */}
                <Accordion 
                  sx={{ 
                    mb: 2,
                    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px !important',
                    border: '1px solid rgba(244, 67, 54, 0.2)',
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}
                    sx={{ 
                      '& .MuiAccordionSummary-content': { 
                        alignItems: 'center',
                        gap: 2
                      }
                    }}
                  >
                    <HealthAndSafetyIcon sx={{ color: '#F44336' }} />
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                      Sağlık ve Özel Durumlar (İsteğe Bağlı)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <ModernTextField
                          fullWidth
                          label="Dikkat Eksikliği / Kaygı Bozukluğu / Özel Durumlar"
                          name="healthConditions"
                          value={profileData.healthConditions}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          multiline
                          rows={3}
                          variant="outlined"
                          placeholder="Varsa koçun bilmesi faydalı olur..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ModernTextField
                          fullWidth
                          label="Sık Hastalanma / Uyku Problemleri"
                          name="sleepProblems"
                          value={profileData.sleepProblems}
                          onChange={handleInputChange}
                          disabled={!isEditingPersonalInfo}
                          multiline
                          rows={2}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </StyledPaper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      


      {/* Admin Giriş Dialog */}
      <Dialog 
        open={showAdminDialog} 
        onClose={handleAdminDialogClose}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(26, 5, 69, 0.95) 0%, rgba(45, 15, 90, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 10px 20px rgba(138, 43, 226, 0.2)',
            color: '#ffffff'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LockIcon sx={{ mr: 1, color: '#FF6B6B' }} />
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
              Admin Girişi
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <ModernTextField
            autoFocus
            margin="dense"
            label="Admin Şifresi"
            type="password"
            fullWidth
            variant="outlined"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            error={!!adminError}
            helperText={adminError}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAdminPasswordSubmit();
              }
            }}
            sx={{
              '& .MuiFormHelperText-root': {
                color: '#FF6B6B',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleAdminDialogClose}
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleAdminPasswordSubmit} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #8A2BE2 0%, #1E90FF 100%)',
              borderRadius: '12px',
              '&:hover': {
                background: 'linear-gradient(135deg, #9A32F2 0%, #2E9AFF 100%)',
              }
            }}
          >
            Giriş
          </Button>
        </DialogActions>
      </Dialog>

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
