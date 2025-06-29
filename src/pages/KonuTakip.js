import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Checkbox,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScienceIcon from '@mui/icons-material/Science';
import SaveIcon from '@mui/icons-material/Save';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import BiotechIcon from '@mui/icons-material/Biotech';
import PublicIcon from '@mui/icons-material/Public';
import TranslateIcon from '@mui/icons-material/Translate';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalculateIcon from '@mui/icons-material/Calculate';
import HistoryIcon from '@mui/icons-material/History';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TempleBuddhistIcon from '@mui/icons-material/TempleHindu';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import yksData from '../utils/yksData';

// yksData'dan ders verilerini oluştur
const createDerslerFromYksData = () => {
  const dersler = [];
  
  // TYT dersleri
  Object.entries(yksData.TYT).forEach(([dersAd, dersData]) => {
    dersler.push({
      id: `${dersAd.toLowerCase().replace(/\s+/g, '-').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')}-tyt`,
      ad: dersAd,
      color: dersData.color,
      type: 'TYT',
      konular: dersData.topics
    });
  });
  
  // AYT dersleri
  Object.entries(yksData.AYT).forEach(([dersAd, dersData]) => {
    dersler.push({
      id: `${dersAd.toLowerCase().replace(/\s+/g, '-').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')}-ayt`,
      ad: dersAd,
      color: dersData.color,
      type: 'AYT',
      konular: dersData.topics
    });
  });
  
  return dersler;
};

const dersler = createDerslerFromYksData();

const KonuTakip = () => {
  const [user] = useAuthState(auth);
  const [selectedDers, setSelectedDers] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [konuDurumu, setKonuDurumu] = useState({});
  const [tabValue, setTabValue] = useState(0); // 0 for TYT, 1 for AYT
  const [sinavTipi, setSinavTipi] = useState('TYT'); // 'TYT' veya 'AYT'

  useEffect(() => {
    if (user) {
      const fetchKonuDurumu = async () => {
        try {
          const docRef = doc(db, 'konuDurumu', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setKonuDurumu(docSnap.data().durumlar || {});
          } else {
            // Yeni kullanıcı için boş durum oluştur
            await setDoc(docRef, { durumlar: {}, updatedAt: serverTimestamp() });
          }
        } catch (error) {
          console.error('Konu durumu yüklenirken hata oluştu:', error);
          setSnackbarMessage('Konu durumu yüklenirken bir hata oluştu.');
          setSnackbarOpen(true);
        }
      };
      
      fetchKonuDurumu();
    }
  }, [user]);

  const handleDersClick = (ders) => {
    setSelectedDers(ders);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedDers(null);
  };

  const handleKonuDurumuChange = (dersId, konuIndex, durum) => {
    setKonuDurumu(prevDurum => {
      const newDurum = { ...prevDurum };
      if (!newDurum[dersId]) {
        newDurum[dersId] = {};
      }
      newDurum[dersId][konuIndex] = durum;
      return newDurum;
    });
  };
  
  const handleTekrarDurumuChange = (dersId, konuIndex, tekrarEdilecek) => {
    setKonuDurumu(prevDurum => {
      const newDurum = { ...prevDurum };
      if (!newDurum[dersId]) {
        newDurum[dersId] = {};
      }
      
      // Eğer mevcut durum yoksa, notStarted olarak ayarla
      const mevcutDurum = newDurum[dersId][konuIndex] || 'notStarted';
      
      // Tekrar edilecek durumunu ekle
      newDurum[dersId][konuIndex] = tekrarEdilecek ? 
        mevcutDurum === 'completed' ? 'completedNeedsReview' : 'needsReview' : 
        mevcutDurum === 'completedNeedsReview' ? 'completed' : 'notStarted';
      
      return newDurum;
    });
  };

  const saveKonuDurumu = async () => {
    if (!user) return;
    
    try {
      const docRef = doc(db, 'konuDurumu', user.uid);
      await updateDoc(docRef, { 
        durumlar: konuDurumu,
        updatedAt: serverTimestamp()
      });
      setSnackbarMessage('Konu durumu başarıyla kaydedildi.');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Konu durumu kaydedilirken hata oluştu:', error);
      setSnackbarMessage('Konu durumu kaydedilirken bir hata oluştu.');
      setSnackbarOpen(true);
    }
  };

  const getDersIcon = (dersAd) => {
    const normalizedName = dersAd.toLowerCase();
    
    if (normalizedName.includes('türkçe') || normalizedName.includes('edebiyat')) {
      return <MenuBookIcon />;
    }
    if (normalizedName.includes('matematik') || normalizedName.includes('temel matematik')) {
      return <CalculateIcon />;
    }
    if (normalizedName.includes('fizik') || normalizedName.includes('kimya') || normalizedName.includes('fen bilimleri')) {
      return <ScienceIcon />;
    }
    if (normalizedName.includes('biyoloji')) {
      return <BiotechIcon />;
    }
    if (normalizedName.includes('tarih')) {
      return <HistoryIcon />;
    }
    if (normalizedName.includes('coğrafya')) {
      return <PublicIcon />;
    }
    if (normalizedName.includes('felsefe')) {
      return <PsychologyIcon />;
    }
    if (normalizedName.includes('din kültürü')) {
      return <TempleBuddhistIcon />;
    }
    if (normalizedName.includes('yabancı dil')) {
      return <TranslateIcon />;
    }
    if (normalizedName.includes('geometri')) {
      return <SquareFootIcon />;
    }
    
    return <MenuBookIcon />;
  };

  const getKonuIlerleme = (dersId) => {
    if (!konuDurumu[dersId]) return { completed: 0, needsReview: 0, total: 0, percentage: 0 };
    
    const ders = dersler.find(d => d.id === dersId);
    if (!ders) return { completed: 0, needsReview: 0, total: 0, percentage: 0 };
    
    const durumlar = Object.values(konuDurumu[dersId]);
    const completed = durumlar.filter(durum => durum === 'completed' || durum === 'completedNeedsReview').length;
    const needsReview = durumlar.filter(durum => durum === 'needsReview' || durum === 'completedNeedsReview').length;
    const total = ders.konular.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, needsReview, total, percentage };
  };

  const filteredDersler = dersler.filter(ders => ders.type === sinavTipi);

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: 14, 
        minHeight: '100vh',
        backgroundColor: '#1a0545',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.02)',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.02)',
          zIndex: 0
        }}
      />

      {/* Header */}
      <Typography 
        variant="h3" 
        component="h1" 
        sx={{ 
          textAlign: 'center', 
          mb: 1,
          color: 'white',
          fontWeight: 700,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          position: 'relative',
          zIndex: 1
        }}
      >
        Konu Takip Sistemi
      </Typography>
      
      <Typography 
        variant="h6" 
        sx={{ 
          textAlign: 'center', 
          mb: 4,
          color: 'rgba(255,255,255,0.8)',
          fontWeight: 400,
          position: 'relative',
          zIndex: 1
        }}
      >
        Çalışmalarını takip edin ve ilerlemelerini görün
      </Typography>

      {/* Tabs Container */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mb: 4,
        position: 'relative',
        zIndex: 1
      }}>
        <Box sx={{
          display: 'flex',
          gap: 2,
          p: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Button
            onClick={() => {
              setTabValue(0);
              setSinavTipi('TYT');
            }}
            sx={{
              minWidth: 80,
              py: 1,
              px: 3,
              borderRadius: 2,
              backgroundColor: tabValue === 0 ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
              color: tabValue === 0 ? '#1a0545' : 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
              '&:hover': {
                backgroundColor: tabValue === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            TYT
          </Button>
          <Button
            onClick={() => {
              setTabValue(1);
              setSinavTipi('AYT');
            }}
            sx={{
              minWidth: 80,
              py: 1,
              px: 3,
              borderRadius: 2,
              backgroundColor: tabValue === 1 ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
              color: tabValue === 1 ? '#1a0545' : 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
              '&:hover': {
                backgroundColor: tabValue === 1 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            AYT
          </Button>
        </Box>
      </Box>

      {/* Subject Cards Grid */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(3, 1fr)', 
          lg: 'repeat(4, 1fr)' 
        },
        gap: 3,
        position: 'relative',
        zIndex: 1
      }}>
        {filteredDersler.map((ders) => {
          const ilerleme = getKonuIlerleme(ders.id);
          const completedCount = ilerleme.completed;
          const totalCount = ders.konular.length;
          const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
          
          return (
            <Card
              key={ders.id}
              onClick={() => handleDersClick(ders)}
              sx={{
                cursor: 'pointer',
                borderRadius: '24px',
                overflow: 'hidden',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: `
                  0 8px 32px rgba(0,0,0,0.12),
                  0 2px 8px rgba(0,0,0,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.15)
                `,
                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${ders.color}15 0%, transparent 50%, ${ders.color}08 100%)`,
                  pointerEvents: 'none',
                  zIndex: 1,
                  borderRadius: '24px'
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  background: `linear-gradient(135deg, ${ders.color}40 0%, transparent 50%, ${ders.color}20 100%)`,
                  borderRadius: '26px',
                  zIndex: -1,
                  opacity: 0,
                  transition: 'opacity 0.4s ease'
                },
                '&:hover': {
                  transform: 'translateY(-12px) scale(1.02)',
                  boxShadow: `
                    0 20px 60px rgba(0,0,0,0.2),
                    0 8px 24px rgba(0,0,0,0.15),
                    inset 0 1px 0 rgba(255,255,255,0.2),
                    0 0 0 1px ${ders.color}30
                  `,
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.12) 100%)',
                  '&::after': {
                    opacity: 1
                  },
                  '& .subject-header': {
                    transform: 'scale(1.03)',
                    '&::before': {
                      opacity: 0.8
                    }
                  },
                  '& .progress-section': {
                    transform: 'translateY(-2px)'
                  },
                  '& .shimmer-overlay': {
                    animation: 'shimmer 2s infinite'
                  }
                },
                '&:active': {
                  transform: 'translateY(-8px) scale(1.01)'
                },
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' }
                }
              }}
            >
              {/* Subject Header */}
              <Box
                className="subject-header"
                sx={{
                  background: `linear-gradient(135deg, ${ders.color} 0%, ${ders.color}cc 50%, ${ders.color}aa 100%)`,
                  p: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  zIndex: 2,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      linear-gradient(135deg, 
                        rgba(255,255,255,0.2) 0%, 
                        rgba(255,255,255,0.1) 30%,
                        transparent 60%,
                        rgba(255,255,255,0.05) 100%
                      )
                    `,
                    pointerEvents: 'none',
                    opacity: 0.6,
                    transition: 'opacity 0.4s ease'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transition: 'left 0.6s ease',
                    zIndex: 1
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    background: `
                      linear-gradient(135deg, 
                        rgba(255,255,255,0.25) 0%, 
                        rgba(255,255,255,0.15) 100%
                      )
                    `,
                    backdropFilter: 'blur(10px)',
                    color: '#ffffff',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    border: '2px solid rgba(255,255,255,0.4)',
                    boxShadow: `
                      0 8px 24px rgba(0,0,0,0.15),
                      inset 0 1px 0 rgba(255,255,255,0.3)
                    `,
                    position: 'relative',
                    zIndex: 3,
                    transition: 'all 0.3s ease',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                      borderRadius: '50%',
                      zIndex: -1,
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }
                  }}
                >
                  {getDersIcon(ders.ad)}
                </Avatar>
                <Box sx={{ flex: 1, zIndex: 3, position: 'relative' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '1.4rem',
                      textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      lineHeight: 1.2,
                      mb: 0.5,
                      background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                    }}
                  >
                    {ders.ad}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.95)',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {ders.type} Dersi
                  </Typography>
                </Box>
              </Box>

              {/* Shimmer Overlay */}
              <Box
                className="shimmer-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  zIndex: 4,
                  pointerEvents: 'none'
                }}
              />

              {/* Progress Section */}
              <Box 
                className="progress-section"
                sx={{ 
                  p: 4, 
                  position: 'relative',
                  zIndex: 2,
                  transition: 'transform 0.3s ease'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 3,
                  p: 2,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                  >
                    İlerleme Durumu
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    background: `linear-gradient(135deg, ${ders.color}20 0%, ${ders.color}10 100%)`,
                    px: 2,
                    py: 1,
                    borderRadius: '12px',
                    border: `1px solid ${ders.color}30`
                  }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: ders.color,
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      {completedCount}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    >
                      / {totalCount}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2
                }}>
                  <Box sx={{ flex: 1, position: 'relative' }}>
                    {/* Custom Progress Bar */}
                    <Box sx={{
                      height: 12,
                      borderRadius: '8px',
                      background: `
                        linear-gradient(135deg, 
                          rgba(0,0,0,0.4) 0%, 
                          rgba(0,0,0,0.3) 50%,
                          rgba(0,0,0,0.35) 100%
                        )
                      `,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${ders.color}60`,
                      overflow: 'hidden',
                      boxShadow: `inset 0 2px 4px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.1)`,
                      position: 'relative'
                    }}>
                      {/* Progress Fill */}
                                             <Box sx={{
                         height: '100%',
                         width: `${progressPercentage}%`,
                         background: `linear-gradient(90deg, ${ders.color} 0%, ${ders.color}dd 50%, ${ders.color} 100%)`,
                         borderRadius: '8px',
                         boxShadow: `0 0 16px ${ders.color}60, inset 0 1px 0 rgba(255,255,255,0.4)`,
                         transition: 'width 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)'
                       }} />
                    </Box>
                  </Box>
                  <Box sx={{
                    background: `linear-gradient(135deg, ${ders.color}25 0%, ${ders.color}15 100%)`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${ders.color}30`,
                    borderRadius: '10px',
                    px: 2,
                    py: 0.5,
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    <Typography sx={{
                      color: ders.color,
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}>
                      %{Math.round(progressPercentage)}
                    </Typography>
                  </Box>
                </Box>
                

              </Box>

              {/* Status Indicators */}
              <Box sx={{ 
                px: 4, 
                pb: 4,
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2
              }}>
                {ilerleme.needsReview > 0 && (
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.1) 100%)',
                      backdropFilter: 'blur(10px)',
                      color: '#ff9800',
                      px: 3,
                      py: 1.5,
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: '1px solid rgba(255, 152, 0, 0.3)',
                      boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(255, 152, 0, 0.3)'
                      }
                    }}
                  >
                    ⚡ {ilerleme.needsReview} Tekrar
                  </Box>
                )}
                {completedCount === totalCount && (
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(76, 175, 80, 0.15) 100%)',
                      backdropFilter: 'blur(10px)',
                      color: '#4caf50',
                      px: 3,
                      py: 1.5,
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: '1px solid rgba(76, 175, 80, 0.4)',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)'
                      }
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: '1rem' }} />
                    ✨ Tamamlandı
                  </Box>
                )}
              </Box>
            </Card>
          );
        })}
      </Box>
      
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            borderRadius: '32px',
            overflow: 'hidden',
            background: `
              linear-gradient(145deg, 
                rgba(26, 5, 69, 0.95) 0%, 
                rgba(26, 5, 69, 0.98) 50%,
                rgba(26, 5, 69, 0.95) 100%
              )
            `,
            backdropFilter: 'blur(40px)',
            boxShadow: `
              0 32px 80px rgba(0,0,0,0.6),
              0 8px 32px rgba(0,0,0,0.4),
              inset 0 1px 0 rgba(255,255,255,0.1),
              0 0 0 1px rgba(255,255,255,0.05)
            `,
            border: '1px solid rgba(255,255,255,0.15)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%)',
              pointerEvents: 'none',
              zIndex: 1
            }
          }
        }}
      >
        {selectedDers && (
          <>
            <DialogTitle sx={{ 
              background: `linear-gradient(135deg, ${selectedDers.color} 0%, ${selectedDers.color}cc 50%, ${selectedDers.color}aa 100%)`,
              display: 'flex',
              alignItems: 'center',
              p: 5,
              position: 'relative',
              overflow: 'hidden',
              zIndex: 2,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  linear-gradient(135deg, 
                    rgba(255,255,255,0.15) 0%, 
                    rgba(255,255,255,0.08) 30%,
                    transparent 60%,
                    rgba(255,255,255,0.05) 100%
                  )
                `,
                pointerEvents: 'none'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
              }
            }}>
              {/* Decorative background elements */}
              <Box sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                zIndex: 0
              }} />
              <Box sx={{
                position: 'absolute',
                bottom: -20,
                left: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                zIndex: 0
              }} />
              
              <Avatar sx={{ 
                background: `
                  linear-gradient(135deg, 
                    rgba(255,255,255,0.95) 0%, 
                    rgba(255,255,255,0.85) 100%
                  )
                `,
                backdropFilter: 'blur(10px)',
                color: selectedDers.color, 
                mr: 4, 
                width: 80, 
                height: 80,
                boxShadow: `
                  0 8px 32px rgba(0,0,0,0.3),
                  0 2px 8px rgba(0,0,0,0.2),
                  inset 0 1px 0 rgba(255,255,255,0.5)
                `,
                zIndex: 3,
                border: '3px solid rgba(255,255,255,0.4)',
                fontSize: '2rem',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: `
                    0 12px 40px rgba(0,0,0,0.4),
                    0 4px 12px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `
                }
              }}>
                {getDersIcon(selectedDers.ad)}
              </Avatar>
              <Box sx={{ zIndex: 3, flex: 1 }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  color: 'white',
                  textShadow: '0 3px 8px rgba(0,0,0,0.4)',
                  mb: 1,
                  fontSize: '2.2rem',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}>
                  {selectedDers.ad}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.95)',
                  fontWeight: 600,
                  fontSize: '1.3rem',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  letterSpacing: '0.5px'
                }}>
                  📚 Toplam {selectedDers.konular.length} Konu
                </Typography>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ 
              background: 'transparent',
              p: 0,
              position: 'relative',
              zIndex: 2
            }}>
              {/* Stats Header */}
              <Box sx={{ 
                p: 4, 
                background: `
                  linear-gradient(135deg, 
                    rgba(255,255,255,0.12) 0%, 
                    rgba(255,255,255,0.08) 50%,
                    rgba(255,255,255,0.05) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.15)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
                }
              }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  mb: 3,
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                }}>
                  📋 Konu Listesi
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  gap: 4,
                  flexWrap: 'wrap'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1.5,
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(76, 175, 80, 0.15) 100%)', 
                    px: 3, 
                    py: 2, 
                    borderRadius: '16px',
                    border: '1px solid rgba(76, 175, 80, 0.4)',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)'
                    }
                  }}>
                    <CheckCircleIcon sx={{ 
                      color: '#4caf50', 
                      fontSize: 24,
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                    }} />
                    <Typography variant="body1" sx={{ 
                      fontWeight: 700, 
                      color: '#4caf50',
                      fontSize: '1rem',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      ✅ Tamamlanan: {Object.values(konuDurumu[selectedDers.id] || {}).filter(durum => durum === 'completed' || durum === 'completedNeedsReview').length}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1.5,
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.25) 0%, rgba(255, 152, 0, 0.15) 100%)', 
                    px: 3, 
                    py: 2, 
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 152, 0, 0.4)',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(255, 152, 0, 0.3)'
                    }
                  }}>
                    <AccessTimeIcon sx={{ 
                      color: '#ff9800', 
                      fontSize: 24,
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                    }} />
                    <Typography variant="body1" sx={{ 
                      fontWeight: 700, 
                      color: '#ff9800',
                      fontSize: '1rem',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      ⚡ Tekrar: {Object.values(konuDurumu[selectedDers.id] || {}).filter(durum => durum === 'needsReview' || durum === 'completedNeedsReview').length}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ 
                p: 3, 
                maxHeight: '500px', 
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.4)'
                  }
                }
              }}>
                {selectedDers.konular.map((konu, index) => {
                  const konuKey = `${selectedDers.id}-${index}`;
                  const durum = konuDurumu[selectedDers.id]?.[index] || 'notStarted';
                  

                  
                  return (
                    <Box
                      key={konuKey} 
                      sx={{ 
                        p: 3,
                        mb: 2,
                        borderRadius: '20px',
                        background: `
                          linear-gradient(135deg, 
                            ${durum === 'completed' ? 'rgba(76, 175, 80, 0.15)' : 
                              durum === 'completedNeedsReview' ? 'rgba(255, 152, 0, 0.15)' : 
                              durum === 'needsReview' ? 'rgba(255, 152, 0, 0.1)' : 
                              'rgba(255,255,255,0.08)'} 0%, 
                            ${durum === 'completed' ? 'rgba(76, 175, 80, 0.08)' : 
                              durum === 'completedNeedsReview' ? 'rgba(255, 152, 0, 0.08)' : 
                              durum === 'needsReview' ? 'rgba(255, 152, 0, 0.05)' : 
                              'rgba(255,255,255,0.04)'} 100%
                          )
                        `,
                        backdropFilter: 'blur(15px)',
                        border: `1px solid ${
                          durum === 'completed' ? 'rgba(76, 175, 80, 0.3)' : 
                          durum === 'completedNeedsReview' ? 'rgba(255, 152, 0, 0.3)' : 
                          durum === 'needsReview' ? 'rgba(255, 152, 0, 0.2)' : 
                          'rgba(255,255,255,0.15)'
                        }`,
                        boxShadow: `
                          0 4px 16px ${
                            durum === 'completed' ? 'rgba(76, 175, 80, 0.1)' : 
                            durum === 'completedNeedsReview' ? 'rgba(255, 152, 0, 0.1)' : 
                            durum === 'needsReview' ? 'rgba(255, 152, 0, 0.05)' : 
                            'rgba(0,0,0,0.1)'
                          },
                          inset 0 1px 0 rgba(255,255,255,0.1)
                        `,
                        '&:hover': { 
                          transform: 'translateY(-4px) scale(1.01)',
                          boxShadow: `
                            0 8px 32px ${
                              durum === 'completed' ? 'rgba(76, 175, 80, 0.2)' : 
                              durum === 'completedNeedsReview' ? 'rgba(255, 152, 0, 0.2)' : 
                              durum === 'needsReview' ? 'rgba(255, 152, 0, 0.1)' : 
                              'rgba(0,0,0,0.15)'
                            },
                            inset 0 1px 0 rgba(255,255,255,0.15)
                          `,
                          background: `
                            linear-gradient(135deg, 
                              ${durum === 'completed' ? 'rgba(76, 175, 80, 0.2)' : 
                                durum === 'completedNeedsReview' ? 'rgba(255, 152, 0, 0.2)' : 
                                durum === 'needsReview' ? 'rgba(255, 152, 0, 0.15)' : 
                                'rgba(255,255,255,0.12)'} 0%, 
                              ${durum === 'completed' ? 'rgba(76, 175, 80, 0.12)' : 
                                durum === 'completedNeedsReview' ? 'rgba(255, 152, 0, 0.12)' : 
                                durum === 'needsReview' ? 'rgba(255, 152, 0, 0.08)' : 
                                'rgba(255,255,255,0.08)'} 100%
                            )
                          `
                        },
                        transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                          transition: 'left 0.6s ease',
                          pointerEvents: 'none'
                        },
                        '&:hover::before': {
                          left: '100%'
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        gap: 4
                      }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            color: durum === 'completed' ? '#4caf50' : 
                                  durum === 'completedNeedsReview' ? '#ff9800' : 
                                  durum === 'needsReview' ? '#ffb74d' : 'rgba(255,255,255,0.98)',
                            fontSize: '1.3rem',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            lineHeight: 1.2,
                            position: 'relative',
                            zIndex: 2,
                            background: durum === 'notStarted' ? 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)' : 'none',
                            backgroundClip: durum === 'notStarted' ? 'text' : 'unset',
                            WebkitBackgroundClip: durum === 'notStarted' ? 'text' : 'unset',
                            WebkitTextFillColor: durum === 'notStarted' ? 'transparent' : 'unset',
                            filter: durum === 'notStarted' ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none'
                          }}
                        >
                          {durum === 'completed' && '✅ '}
                          {durum === 'completedNeedsReview' && '⚡ '}
                          {durum === 'needsReview' && '🔄 '}
                          {durum === 'notStarted' && '📝 '}
                          {konu}
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          position: 'relative',
                          zIndex: 2,
                          flexShrink: 0
                        }}>
                        <Box sx={{
                          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.08) 100%)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          border: '1px solid rgba(76, 175, 80, 0.3)',
                          padding: '8px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.12) 100%)',
                            transform: 'scale(1.02)'
                          }
                        }}>
                          <Checkbox
                            checked={durum === 'completed' || durum === 'completedNeedsReview'}
                            onChange={(e) => handleKonuDurumuChange(
                              selectedDers.id, 
                              index, 
                              e.target.checked ? 
                                durum === 'needsReview' || durum === 'completedNeedsReview' ? 'completedNeedsReview' : 'completed' : 
                                durum === 'needsReview' || durum === 'completedNeedsReview' ? 'needsReview' : 'notStarted'
                            )}
                            sx={{ 
                              '& .MuiSvgIcon-root': { fontSize: 20 },
                              color: 'rgba(76, 175, 80, 0.7)',
                              '&.Mui-checked': {
                                color: '#4caf50',
                              },
                              p: 0
                            }}
                          />
                          <Typography sx={{ 
                            fontWeight: 600, 
                            color: '#4caf50', 
                            fontSize: '0.85rem',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}>
                            Tamamlandı
                          </Typography>
                        </Box>
                        <Box sx={{
                          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.08) 100%)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 152, 0, 0.3)',
                          padding: '8px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.12) 100%)',
                            transform: 'scale(1.02)'
                          }
                        }}>
                          <Checkbox
                            checked={durum === 'needsReview' || durum === 'completedNeedsReview'}
                            onChange={(e) => handleTekrarDurumuChange(
                              selectedDers.id, 
                              index, 
                              e.target.checked
                            )}
                            sx={{ 
                              '& .MuiSvgIcon-root': { fontSize: 20 },
                              color: 'rgba(255, 152, 0, 0.7)',
                              '&.Mui-checked': {
                                color: '#ff9800',
                              },
                              p: 0
                            }}
                          />
                          <Typography sx={{ 
                            fontWeight: 600, 
                            color: '#ff9800', 
                            fontSize: '0.85rem',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}>
                            Tekrar Edilecek
                          </Typography>
                        </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </DialogContent>
            <DialogActions sx={{ 
              p: 4, 
              background: `
                linear-gradient(135deg, 
                  rgba(255,255,255,0.08) 0%, 
                  rgba(255,255,255,0.04) 100%
                )
              `,
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              zIndex: 2,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
              }
            }}>
              <Button 
                onClick={handleDialogClose}
                variant="outlined"
                sx={{ 
                  borderColor: 'rgba(255,255,255,0.4)',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 700,
                  px: 6,
                  py: 2,
                  borderRadius: '16px',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  '&:hover': { 
                    borderColor: 'rgba(255,255,255,0.6)', 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                }}
              >
                🚪 Kapat
              </Button>
              <Button 
                onClick={() => {
                  saveKonuDurumu();
                  handleDialogClose();
                }}
                variant="contained" 
                startIcon={<SaveIcon sx={{ fontSize: '1.2rem' }} />}
                sx={{ 
                  background: `linear-gradient(135deg, ${selectedDers.color} 0%, ${selectedDers.color}cc 50%, ${selectedDers.color}aa 100%)`,
                  fontWeight: 700,
                  px: 6,
                  py: 2,
                  borderRadius: '16px',
                  fontSize: '1rem',
                  boxShadow: `
                    0 8px 32px ${selectedDers.color}30,
                    0 4px 16px rgba(0,0,0,0.2),
                    inset 0 1px 0 rgba(255,255,255,0.2)
                  `,
                  border: '1px solid rgba(255,255,255,0.2)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  '&:hover': { 
                    background: `linear-gradient(135deg, ${selectedDers.color}dd 0%, ${selectedDers.color}bb 50%, ${selectedDers.color}99 100%)`,
                    transform: 'translateY(-3px) scale(1.02)',
                    boxShadow: `
                      0 12px 40px ${selectedDers.color}40,
                      0 6px 20px rgba(0,0,0,0.3),
                      inset 0 1px 0 rgba(255,255,255,0.3)
                    `
                  },
                  '&:active': {
                    transform: 'translateY(-1px) scale(1.01)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                }}
              >
                💾 Kaydet
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default KonuTakip;
