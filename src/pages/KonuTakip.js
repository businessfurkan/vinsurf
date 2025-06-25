import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  LinearProgress,
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
        py: 4, 
        minHeight: '100vh',
        backgroundColor: '#1b293d',
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
              color: tabValue === 0 ? '#1b293d' : 'white',
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
              color: tabValue === 1 ? '#1b293d' : 'white',
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
                borderRadius: 4,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  '& .subject-header': {
                    transform: 'scale(1.02)'
                  }
                },
                '&:active': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              {/* Subject Header */}
              <Box
                className="subject-header"
                sx={{
                  background: `linear-gradient(135deg, ${ders.color} 0%, ${ders.color}dd 100%)`,
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  transition: 'transform 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    pointerEvents: 'none'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  {getDersIcon(ders.ad)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      lineHeight: 1.2
                    }}
                  >
                    {ders.ad}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 500,
                      fontSize: '0.9rem'
                    }}
                  >
                    {ders.type} Dersi
                  </Typography>
                </Box>
              </Box>

              {/* Progress Section */}
              <Box sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    İlerleme Durumu
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: ders.color,
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}
                  >
                    {completedCount}/{totalCount}
                  </Typography>
                </Box>
                
                <LinearProgress
                  variant="determinate"
                  value={progressPercentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(0,0,0,0.08)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${ders.color} 0%, ${ders.color}aa 100%)`,
                      transition: 'transform 0.4s ease'
                    }
                  }}
                />
                
                <Typography
                  variant="body2"
                  sx={{
                    color: '#888',
                    fontSize: '0.8rem',
                    mt: 1,
                    textAlign: 'center',
                    fontWeight: 500
                  }}
                >
                  %{Math.round(progressPercentage)} Tamamlandı
                </Typography>
              </Box>

              {/* Status Indicators */}
              <Box sx={{ 
                px: 3, 
                pb: 3,
                display: 'flex',
                gap: 1,
                justifyContent: 'center'
              }}>
                {ilerleme.needsReview > 0 && (
                  <Box
                    sx={{
                      bgcolor: '#fff3e0',
                      color: '#e65100',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid #ffcc02'
                    }}
                  >
                    {ilerleme.needsReview} Tekrar
                  </Box>
                )}
                {completedCount === totalCount && (
                  <Box
                    sx={{
                      bgcolor: '#e8f5e8',
                      color: '#2e7d32',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid #4caf50',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: '0.9rem' }} />
                    Tamamlandı
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
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: '#1b293d',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        {selectedDers && (
          <>
            <DialogTitle sx={{ 
              background: `linear-gradient(135deg, ${selectedDers.color} 0%, ${selectedDers.color}dd 100%)`,
              display: 'flex',
              alignItems: 'center',
              p: 3,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative background element */}
              <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                zIndex: 0
              }} />
              
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.9)', 
                color: selectedDers.color, 
                mr: 3, 
                width: 64, 
                height: 64,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                zIndex: 2,
                border: '3px solid rgba(255,255,255,0.3)'
              }}>
                {getDersIcon(selectedDers.ad)}
              </Avatar>
              <Box sx={{ zIndex: 2 }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 0.5
                }}>
                  {selectedDers.ad}
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500,
                  fontSize: '1.1rem'
                }}>
                  Toplam {selectedDers.konular.length} Konu
                </Typography>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ 
              bgcolor: '#1b293d', 
              p: 0,
              position: 'relative'
            }}>
              {/* Stats Header */}
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: 'white',
                  mb: 2,
                  textAlign: 'center'
                }}>
                  Konu Listesi
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  gap: 3,
                  flexWrap: 'wrap'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    bgcolor: 'rgba(76, 175, 80, 0.2)', 
                    px: 2, 
                    py: 1, 
                    borderRadius: 3,
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                      Tamamlanan: {Object.values(konuDurumu[selectedDers.id] || {}).filter(durum => durum === 'completed' || durum === 'completedNeedsReview').length}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    bgcolor: 'rgba(255, 152, 0, 0.2)', 
                    px: 2, 
                    py: 1, 
                    borderRadius: 3,
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <AccessTimeIcon sx={{ color: '#ff9800', fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800' }}>
                      Tekrar: {Object.values(konuDurumu[selectedDers.id] || {}).filter(durum => durum === 'needsReview' || durum === 'completedNeedsReview').length}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <List sx={{ p: 0, maxHeight: '400px', overflow: 'auto' }}>
                {selectedDers.konular.map((konu, index) => {
                  const konuKey = `${selectedDers.id}-${index}`;
                  const durum = konuDurumu[selectedDers.id]?.[index] || 'notStarted';
                  
                  const getBgColor = () => {
                    if (durum === 'completed') return 'rgba(76, 175, 80, 0.1)';
                    if (durum === 'completedNeedsReview') return 'rgba(255, 152, 0, 0.1)';
                    if (durum === 'needsReview') return 'rgba(255, 152, 0, 0.05)';
                    return 'rgba(255,255,255,0.02)';
                  };
                  
                  return (
                    <ListItem 
                      key={konuKey} 
                      sx={{ 
                        p: 3,
                        bgcolor: getBgColor(),
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        '&:hover': { 
                          bgcolor: durum === 'completed' ? 'rgba(76, 175, 80, 0.15)' : 
                                    durum === 'completedNeedsReview' ? 'rgba(255, 152, 0, 0.15)' : 
                                    durum === 'needsReview' ? 'rgba(255, 152, 0, 0.1)' : 
                                    'rgba(255,255,255,0.05)',
                          transform: 'translateX(4px)'
                        },
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                    >
                      <ListItemText 
                        primary={konu} 
                        primaryTypographyProps={{ 
                          fontWeight: durum === 'completed' || durum === 'completedNeedsReview' ? 600 : 500,
                          color: durum === 'completed' ? '#4caf50' : 
                                durum === 'completedNeedsReview' ? '#ff9800' : 
                                durum === 'needsReview' ? '#ffb74d' : 'rgba(255,255,255,0.9)',
                          fontSize: '1rem'
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <FormControlLabel
                          control={
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
                                '& .MuiSvgIcon-root': { fontSize: 24 },
                                color: 'rgba(76, 175, 80, 0.7)',
                                '&.Mui-checked': {
                                  color: '#4caf50',
                                }
                              }}
                            />
                          }
                          label={<Typography sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Tamamlandı</Typography>}
                          sx={{ m: 0 }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={durum === 'needsReview' || durum === 'completedNeedsReview'}
                              onChange={(e) => handleTekrarDurumuChange(
                                selectedDers.id, 
                                index, 
                                e.target.checked
                              )}
                              sx={{ 
                                '& .MuiSvgIcon-root': { fontSize: 24 },
                                color: 'rgba(255, 152, 0, 0.7)',
                                '&.Mui-checked': {
                                  color: '#ff9800',
                                }
                              }}
                            />
                          }
                          label={<Typography sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Tekrar Edilecek</Typography>}
                          sx={{ m: 0 }}
                        />
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            </DialogContent>
            <DialogActions sx={{ 
              p: 3, 
              bgcolor: 'rgba(255,255,255,0.05)', 
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <Button 
                onClick={handleDialogClose}
                variant="outlined"
                sx={{ 
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  '&:hover': { 
                    borderColor: 'rgba(255,255,255,0.5)', 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'white'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Kapat
              </Button>
              <Button 
                onClick={() => {
                  saveKonuDurumu();
                  handleDialogClose();
                }}
                variant="contained" 
                startIcon={<SaveIcon />}
                sx={{ 
                  background: `linear-gradient(135deg, ${selectedDers.color} 0%, ${selectedDers.color}dd 100%)`,
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  '&:hover': { 
                    background: `linear-gradient(135deg, ${selectedDers.color}dd 0%, ${selectedDers.color}bb 100%)`,
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Kaydet
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