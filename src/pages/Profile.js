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
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { auth, db, storage } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { playClickSound } from '../utils/soundUtils';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

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

const QuestionBox = styled(Box)({
  marginBottom: '24px',
  padding: '20px',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
  backdropFilter: 'blur(15px)',
  borderRadius: '20px',
  border: '2px solid rgba(138, 43, 226, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
    border: '2px solid rgba(138, 43, 226, 0.35)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(138, 43, 226, 0.15)',
  }
});

const QuestionText = styled(Typography)({
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '1.1rem',
  marginBottom: '12px',
  letterSpacing: '0.3px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&::before': {
    content: '"❓"',
    fontSize: '1.2rem',
    marginRight: '4px',
  }
});

const AnswerTextField = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 500,
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.12) 100%)',
      border: '1px solid rgba(255,255,255,0.3)',
      boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)',
    },
    '&.Mui-focused': {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.2), 0 0 0 2px rgba(138, 43, 226, 0.3)',
    },
    '&.Mui-disabled': {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      opacity: 0.6,
    },
  },
  '& .MuiInputLabel-root': {
    display: 'none', // Hide label since we're using question format
  },
  '& .MuiOutlinedInput-input': {
    color: '#ffffff',
    fontWeight: 500,
    fontSize: '1rem',
    padding: '14px 16px',
    '&::placeholder': {
      color: 'rgba(255,255,255,0.5)',
      fontStyle: 'italic',
    },
  },
});

const AnswerSelect = styled(Select)({
  width: '100%',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  color: '#ffffff',
  fontSize: '1rem',
  fontWeight: 500,
  border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiSvgIcon-root': { 
    color: '#ffffff',
    fontSize: '1.5rem'
  },
  '& .MuiSelect-select': {
    padding: '14px 16px',
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.12) 100%)',
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)',
  },
  '&.Mui-focused': {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
    border: '1px solid rgba(255,255,255,0.4)',
    boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.2), 0 0 0 2px rgba(138, 43, 226, 0.3)',
  },
  '&.Mui-disabled': {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
    opacity: 0.6,
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
  const [originalProfileData, setOriginalProfileData] = useState({});
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
      
      // Google'dan gelen profil fotoğrafını Firebase Storage'a kopyala
      const copyGooglePhotoToStorage = async () => {
        if (user.photoURL && user.photoURL.includes('googleusercontent.com')) {
          try {
            // Google fotoğrafını fetch et
            const response = await fetch(user.photoURL);
            const blob = await response.blob();
            
            // Firebase Storage'a yükle
            const storageRef = ref(storage, `profile_pictures/${user.uid}`);
            await uploadBytesResumable(storageRef, blob);
            
            // Yeni URL'i al
            const downloadURL = await getDownloadURL(storageRef);
            
            // Firebase Auth profil bilgisini güncelle
            await updateProfile(user, { photoURL: downloadURL });
          } catch (error) {
            console.log('Google fotoğrafı kopyalanırken hata:', error);
          }
        }
      };
      
      // Fetch additional user data from Firestore
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const updatedProfileData = {
              ...profileData,
              ...userData,
            };
            setProfileData(updatedProfileData);
            setOriginalProfileData(updatedProfileData); // Orijinal verileri sakla
          } else {
            // Create a default user document if it doesn't exist
            const defaultData = {
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
            };
            await setDoc(doc(db, 'users', user.uid), defaultData);
            setProfileData(defaultData);
            setOriginalProfileData(defaultData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Kullanıcı verileri alınırken bir hata oluştu.');
          setOpenSnackbar(true);
        }
      };
      
      // İlk olarak Google fotoğrafını kopyala, sonra user data'yı fetch et
      copyGooglePhotoToStorage().then(() => {
        fetchUserData();
      });
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
    if (!isEditingPersonalInfo) {
      // Düzenleme moduna geçerken orijinal verileri sakla
      setOriginalProfileData({ ...profileData });
    }
    setIsEditingPersonalInfo(!isEditingPersonalInfo);
  };

  const handleCancelEdit = () => {
    playClickSound();
    // Düzenleme iptal edildiğinde orijinal verilere geri dön
    setProfileData({ ...originalProfileData });
    setIsEditingPersonalInfo(false);
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
        
        // Başarılı kaydetme sonrası orijinal verileri güncelle
        setOriginalProfileData({ ...profileData });
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

  const generatePDF = async () => {
    playClickSound();
    
    // HTML içeriği oluştur
    const htmlContent = createPDFContent();
    
    // Geçici div oluştur
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0px';
    tempDiv.style.width = '794px'; // A4 genişliği (pixel)
    tempDiv.style.background = 'white';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.color = 'black';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.6';
    tempDiv.style.padding = '40px';
    
    document.body.appendChild(tempDiv);
    
    try {
      // HTML2Canvas ile canvas oluştur
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123 // A4 yüksekliği
      });
      
      // PDF oluştur
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 genişliği mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Eğer içerik bir sayfadan fazlaysa, sayfa ekle
      if (imgHeight > 297) {
        let position = 297;
        while (position < imgHeight) {
          doc.addPage();
          doc.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
          position += 297;
        }
      }
      
      // PDF'i indir
      const fileName = `${profileData.displayName || 'Kullanici'}_Kisisel_Rapor_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.pdf`;
      doc.save(fileName);
      
      setSuccess('PDF başarıyla oluşturuldu ve indirildi!');
      setOpenSnackbar(true);
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      setError('PDF oluşturulurken bir hata oluştu.');
      setOpenSnackbar(true);
    } finally {
      // Geçici div'i temizle
      document.body.removeChild(tempDiv);
    }
  };
  
  const createPDFContent = () => {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <!-- Header -->
        <div style="background: #8A2BE2; color: white; padding: 30px 20px; margin: -40px -40px 30px -40px; text-align: center; border-radius: 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎯 YKS Çalışma Asistanı</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 18px; font-weight: normal;">📋 Kişisel Bilgi Raporu</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">👤 ${profileData.displayName || 'Öğrenci'}</p>
        </div>

        <!-- Temel Bilgiler -->
        <div style="margin-bottom: 30px;">
          <div style="background: #8A2BE2; color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: bold;">👤 TEMEL BİLGİLER</h3>
          </div>
          <div style="padding: 0 20px;">
            <p><strong>📝 Ad Soyad:</strong> ${profileData.displayName || 'Belirtilmemiş'}</p>
            <p><strong>📧 E-posta:</strong> ${profileData.email || 'Belirtilmemiş'}</p>
            <p><strong>🎂 Doğum Tarihi:</strong> ${profileData.birthDate || 'Belirtilmemiş'}</p>
            <p><strong>🔢 Yaş:</strong> ${profileData.age || 'Belirtilmemiş'}</p>
            <p><strong>🎓 Mezuniyet Durumu:</strong> ${profileData.isGraduated ? '✅ Mezun' : '⏳ Mezun Değil'}</p>
          </div>
        </div>

        <!-- Hedef Bilgileri -->
        <div style="margin-bottom: 30px;">
          <div style="background: #4CAF50; color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: bold;">🎯 HEDEF BİLGİLERİ</h3>
          </div>
          <div style="padding: 0 20px;">
            <p><strong>🎯 Hedeflenen Alan:</strong> ${profileData.targetField || 'Belirtilmemiş'}</p>
            <p><strong>🏛️ Hedef Üniversite/Bölüm:</strong> ${profileData.targetUniversityDepartment || 'Belirtilmemiş'}</p>
            ${profileData.whyThisDepartment ? `<p><strong>💡 Bölüm Seçim Nedeni:</strong> ${profileData.whyThisDepartment}</p>` : ''}
            ${profileData.backupPlan ? `<p><strong>🔄 Yedek Plan:</strong> ${profileData.backupPlan}</p>` : ''}
          </div>
        </div>

        <!-- Akademik Durum -->
        <div style="margin-bottom: 30px;">
          <div style="background: #FF9800; color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: bold;">📚 AKADEMİK DURUM</h3>
          </div>
          <div style="padding: 0 20px;">
            <p><strong>🎯 OBP (Okul Başarı Puanı):</strong> ${profileData.gpa || 'Belirtilmemiş'}</p>
            <p><strong>📊 TYT Net Ortalaması:</strong> ${profileData.tytAverage || 'Belirtilmemiş'}</p>
            <p><strong>📈 AYT Net Ortalaması:</strong> ${profileData.aytAverage || 'Belirtilmemiş'}</p>
            <p><strong>💪 Güçlü Dersler:</strong> ${profileData.strongSubjects || 'Belirtilmemiş'}</p>
            <p><strong>⚠️ Zayıf Dersler:</strong> ${profileData.weakSubjects || 'Belirtilmemiş'}</p>
          </div>
        </div>

        <!-- Psikolojik & Motivasyonel Bilgiler -->
        ${(profileData.motivationFactors || profileData.copingStrategies || profileData.studyEnvironment || profileData.examAnxiety) ? `
        <div style="margin-bottom: 30px;">
          <div style="background: #E91E63; color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: bold;">🧠 PSİKOLOJİK & MOTİVASYONEL BİLGİLER</h3>
          </div>
          <div style="padding: 0 20px;">
            ${profileData.motivationFactors ? `<p><strong>💪 Motivasyon Kaynakları:</strong> ${profileData.motivationFactors}</p>` : ''}
            ${profileData.copingStrategies ? `<p><strong>🛡️ Başa Çıkma Stratejileri:</strong> ${profileData.copingStrategies}</p>` : ''}
            ${profileData.studyEnvironment ? `<p><strong>🏠 Çalışma Ortamı:</strong> ${profileData.studyEnvironment}</p>` : ''}
            ${profileData.examAnxiety ? `<p><strong>😰 Sınav Kaygısı/Özel Durumlar:</strong> ${profileData.examAnxiety}</p>` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Sağlık Bilgileri -->
        ${(profileData.healthConditions || profileData.sleepProblems) ? `
        <div style="margin-bottom: 30px;">
          <div style="background: #F44336; color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: bold;">🏥 SAĞLIK & ÖZEL DURUMLAR</h3>
          </div>
          <div style="padding: 0 20px;">
            ${profileData.healthConditions ? `<p><strong>⚕️ Sağlık Durumları:</strong> ${profileData.healthConditions}</p>` : ''}
            ${profileData.sleepProblems ? `<p><strong>😴 Uyku Problemleri:</strong> ${profileData.sleepProblems}</p>` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #8A2BE2; text-align: center; color: #666; font-size: 12px;">
          <p>🎯 YKS Çalışma Asistanı - Kişisel Gelişim Raporu</p>
          <p>📅 Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
          })}</p>
        </div>
      </div>
              `;
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
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={generatePDF}
                      sx={{ 
                        borderRadius: '16px', 
                        px: 3,
                        py: 1.2,
                        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 16px rgba(255, 107, 107, 0.4)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #FF8E53 0%, #FF6B6B 100%)',
                          transform: 'translateY(-2px) scale(1.05)',
                          boxShadow: '0 12px 24px rgba(255, 107, 107, 0.6)',
                        }
                      }}
                    >
                      Koçuna At
                    </Button>
                    
                    {!isEditingPersonalInfo ? (
                      <Button 
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={handlePersonalInfoEditToggle}
                        sx={{ 
                          borderRadius: '16px', 
                          px: 3,
                          py: 1.2,
                          background: 'linear-gradient(135deg, #8A2BE2 0%, #1E90FF 100%)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 8px 16px rgba(138, 43, 226, 0.4)',
                          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #9A32F2 0%, #2E9AFF 100%)',
                            transform: 'translateY(-2px) scale(1.05)',
                            boxShadow: '0 12px 24px rgba(138, 43, 226, 0.6)',
                          }
                        }}
                      >
                        Düzenle
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                          variant="outlined"
                          onClick={handleCancelEdit}
                          sx={{ 
                            borderRadius: '16px', 
                            px: 3,
                            py: 1.2,
                            border: '2px solid rgba(255, 107, 107, 0.5)',
                            color: '#FF6B6B',
                            background: 'rgba(255, 107, 107, 0.1)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            '&:hover': {
                              background: 'rgba(255, 107, 107, 0.2)',
                              border: '2px solid rgba(255, 107, 107, 0.8)',
                              transform: 'translateY(-2px) scale(1.05)',
                            }
                          }}
                        >
                          İptal
                        </Button>
                        <Button 
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSavePersonalInfo}
                          sx={{ 
                            borderRadius: '16px', 
                            px: 3,
                            py: 1.2,
                            background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 16px rgba(76, 175, 80, 0.4)',
                            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5CBF60 0%, #9CD44A 100%)',
                              transform: 'translateY(-2px) scale(1.05)',
                              boxShadow: '0 12px 24px rgba(76, 175, 80, 0.6)',
                            }
                          }}
                        >
                          Kaydet
                        </Button>
                      </Box>
                    )}
                  </Box>
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
                        <QuestionBox>
                          <QuestionText>Adın ve soyadın nedir?</QuestionText>
                          <AnswerTextField
                            name="displayName"
                            value={profileData.displayName}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            placeholder="Örn: Ahmet Yılmaz"
                            variant="outlined"
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <QuestionBox>
                          <QuestionText>E-posta adresin nedir?</QuestionText>
                          <AnswerTextField
                            name="email"
                            value={profileData.email}
                            disabled={true}
                            placeholder="E-posta değiştirilemez"
                            variant="outlined"
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <QuestionBox>
                          <QuestionText>Doğum tarihin nedir?</QuestionText>
                          <AnswerTextField
                            name="birthDate"
                            type="date"
                            value={profileData.birthDate}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <QuestionBox>
                          <QuestionText>Kaç yaşındasın?</QuestionText>
                          <AnswerTextField
                            name="age"
                            type="number"
                            value={profileData.age}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            placeholder="Örn: 18"
                            variant="outlined"
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12}>
                        <QuestionBox>
                          <QuestionText>Liseden mezun oldun mu?</QuestionText>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={profileData.isGraduated}
                                onChange={(e) => setProfileData(prev => ({ ...prev, isGraduated: e.target.checked }))}
                                disabled={!isEditingPersonalInfo}
                                sx={{
                                  color: 'rgba(255,255,255,0.7)',
                                  padding: '8px',
                                  '&.Mui-checked': { 
                                    color: '#8A2BE2',
                                    '& .MuiSvgIcon-root': {
                                      filter: 'drop-shadow(0 0 8px rgba(138, 43, 226, 0.6))',
                                      fontSize: '1.5rem',
                                    }
                                  },
                                  '& .MuiSvgIcon-root': {
                                    fontSize: '1.5rem',
                                    transition: 'all 0.3s ease',
                                  },
                                  '&:hover': {
                                    backgroundColor: 'rgba(138, 43, 226, 0.1)',
                                    borderRadius: '8px',
                                  }
                                }}
                              />
                            }
                            label={
                              <Typography 
                                sx={{ 
                                  color: 'rgba(255,255,255,0.9)', 
                                  fontWeight: 500,
                                  fontSize: '1rem',
                                  marginLeft: '8px'
                                }}
                              >
                                Evet, mezun oldum
                              </Typography>
                            }
                          />
                        </QuestionBox>
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
                        <QuestionBox>
                          <QuestionText>Hangi alanda hedefliyorsun?</QuestionText>
                          <AnswerSelect
                            value={profileData.targetField}
                            name="targetField"
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            displayEmpty
                          >
                            <MenuItem value="" disabled>Bir alan seç...</MenuItem>
                            <MenuItem value="Sayısal">Sayısal</MenuItem>
                            <MenuItem value="Sözel">Sözel</MenuItem>
                            <MenuItem value="Eşit Ağırlık">Eşit Ağırlık</MenuItem>
                            <MenuItem value="Dil">Dil</MenuItem>
                          </AnswerSelect>
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <QuestionBox>
                          <QuestionText>Hangi üniversite ve bölümü hedefliyorsun?</QuestionText>
                          <AnswerTextField
                            name="targetUniversityDepartment"
                            value={profileData.targetUniversityDepartment}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            placeholder="Örn: Hacettepe Tıp, İTÜ Bilgisayar Mühendisliği"
                            variant="outlined"
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12}>
                        <QuestionBox>
                          <QuestionText>Neden bu bölümü seçtin? Gerçekten istediğin mi?</QuestionText>
                          <AnswerTextField
                            name="whyThisDepartment"
                            value={profileData.whyThisDepartment}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            multiline
                            rows={3}
                            placeholder="Kendi isteğin mi, aile baskısı mı, alternatif planların var mı? Açıkça yaz..."
                            variant="outlined"
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12}>
                        <QuestionBox>
                          <QuestionText>Hedeflediğin bölüme giremezsen yedek planın ne?</QuestionText>
                          <AnswerTextField
                            name="backupPlan"
                            value={profileData.backupPlan}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            multiline
                            rows={2}
                            placeholder="Açıköğretim, tekrar hazırlanma, yurtdışı, meslek lisesi vb..."
                            variant="outlined"
                          />
                        </QuestionBox>
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
                        <QuestionBox>
                          <QuestionText>Son OBP&apos;n (Okul Başarı Puanın) kaç?</QuestionText>
                          <AnswerTextField
                            name="gpa"
                            type="number"
                            value={profileData.gpa}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            placeholder="Örn: 85.50"
                            variant="outlined"
                            inputProps={{ step: "0.01", min: "0", max: "100" }}
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <QuestionBox>
                          <QuestionText>TYT deneme net ortalamanız kaç?</QuestionText>
                          <AnswerTextField
                            name="tytAverage"
                            type="number"
                            value={profileData.tytAverage}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            placeholder="Örn: 85.5"
                            variant="outlined"
                            inputProps={{ step: "0.1", min: "0", max: "120" }}
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <QuestionBox>
                          <QuestionText>AYT deneme net ortalamanız kaç?</QuestionText>
                          <AnswerTextField
                            name="aytAverage"
                            type="number"
                            value={profileData.aytAverage}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            placeholder="Örn: 65.5"
                            variant="outlined"
                            inputProps={{ step: "0.1", min: "0", max: "80" }}
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <QuestionBox>
                          <QuestionText>En güçlü olduğun dersler hangileri?</QuestionText>
                          <AnswerTextField
                            name="strongSubjects"
                            value={profileData.strongSubjects}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            placeholder="Örn: Matematik, Fizik, Türkçe"
                            variant="outlined"
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <QuestionBox>
                          <QuestionText>En zayıf olduğun dersler hangileri?</QuestionText>
                          <AnswerTextField
                            name="weakSubjects"
                            value={profileData.weakSubjects}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            placeholder="Örn: Kimya, Tarih, Coğrafya"
                            variant="outlined"
                          />
                        </QuestionBox>
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
                        <QuestionBox>
                          <QuestionText>Seni motive eden şeyler neler? Hangi cümleler seni harekete geçiriyor?</QuestionText>
                          <AnswerTextField
                            name="motivationFactors"
                            value={profileData.motivationFactors}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            multiline
                            rows={3}
                            placeholder="Örn: Hayalindeki ev, ailesini mutlu etmek, hayalindeki şehirde yaşamak..."
                            variant="outlined"
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12}>
                        <QuestionBox>
                          <QuestionText>Zorlandığında ne yapıyorsun? Kendini nasıl motive ediyorsun?</QuestionText>
                          <AnswerTextField
                            name="copingStrategies"
                            value={profileData.copingStrategies}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            multiline
                            rows={3}
                            placeholder="Örn: Müzik dinliyorum, spor yapıyorum, arkadaşlarımla konuşuyorum..."
                            variant="outlined"
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12}>
                        <QuestionBox>
                          <QuestionText>Çalışma ortamın nasıl? Evde destek var mı, sessiz mi?</QuestionText>
                          <AnswerTextField
                            name="studyEnvironment"
                            value={profileData.studyEnvironment}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            multiline
                            rows={2}
                            placeholder="Örn: Evde sessiz bir odam var, ailem destekliyor / Evde gürültü var, kendi odamda çalışamıyorum..."
                            variant="outlined"
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12}>
                        <QuestionBox>
                          <QuestionText>Sınav fobisn, dikkat eksikliğin veya öğrenme zorluğun var mı?</QuestionText>
                          <AnswerTextField
                            name="examAnxiety"
                            value={profileData.examAnxiety}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            multiline
                            rows={2}
                            placeholder="Varsa açıkla, yoksa 'yok' yaz..."
                            variant="outlined"
                          />
                        </QuestionBox>
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
                        <QuestionBox>
                          <QuestionText>Dikkat eksikliğin, kaygı bozukluğun veya özel durumların var mı? (İsteğe bağlı)</QuestionText>
                          <AnswerTextField
                            name="healthConditions"
                            value={profileData.healthConditions}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            multiline
                            rows={3}
                            placeholder="Varsa koçunun bilmesi faydalı olur. Yoksa boş bırakabilirsin..."
                            variant="outlined"
                          />
                        </QuestionBox>
                      </Grid>
                      <Grid item xs={12}>
                        <QuestionBox>
                          <QuestionText>Sık hastalanıyor musun? Uyku problemlerin var mı?</QuestionText>
                          <AnswerTextField
                            name="sleepProblems"
                            value={profileData.sleepProblems}
                            onChange={handleInputChange}
                            disabled={!isEditingPersonalInfo}
                            multiline
                            rows={2}
                            placeholder="Örn: Çok geç yatıyorum, sabah kalkmakta zorlanıyorum / Sık grip oluyorum..."
                            variant="outlined"
                          />
                        </QuestionBox>
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
          <AnswerTextField
            autoFocus
            margin="dense"
            type="password"
            placeholder="Admin şifresini gir..."
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
