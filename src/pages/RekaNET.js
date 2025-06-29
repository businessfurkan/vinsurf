import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Fade,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Container,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LanguageIcon from '@mui/icons-material/Language';
import ReactConfetti from 'react-confetti';
import { db } from '../firebase';
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

// Türkiye'deki 81 il listesi
const turkeyProvinces = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
  'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
  'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
  'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
  'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
  'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
  'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye',
  'Düzce'
];

const RekaNET = () => {
  const [user] = useAuthState(auth);
  
  // Şifre sistemi
  const [competitionActive, setCompetitionActive] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  
  // Yarışma durumu
  const [competitionStatus, setCompetitionStatus] = useState({
    active: false,
    endTime: null,
    timeLeft: null
  });
  
  // Şifre kontrolü
  const COMPETITION_PASSWORD = "rekanet2024";

  // State tanımlamaları
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [includeNationalRanking, setIncludeNationalRanking] = useState(false);
  const [formData, setFormData] = useState({
    province: '',
    tytScores: {
      turkish: { correct: 0, wrong: 0, empty: 0 },
      social: { correct: 0, wrong: 0, empty: 0 },
      math: { correct: 0, wrong: 0, empty: 0 },
      science: { correct: 0, wrong: 0, empty: 0 }
    },
    aytScores: {
      mathAYT: { correct: 0, wrong: 0, empty: 0 },
      physics: { correct: 0, wrong: 0, empty: 0 },
      chemistry: { correct: 0, wrong: 0, empty: 0 },
      biology: { correct: 0, wrong: 0, empty: 0 },
      literature: { correct: 0, wrong: 0, empty: 0 },
      history1: { correct: 0, wrong: 0, empty: 0 },
      geography1: { correct: 0, wrong: 0, empty: 0 },
      history2: { correct: 0, wrong: 0, empty: 0 },
      geography2: { correct: 0, wrong: 0, empty: 0 },
      philosophy: { correct: 0, wrong: 0, empty: 0 },
      religion: { correct: 0, wrong: 0, empty: 0 }
    }
  });

  // RekaNET karşılaştırma durumu
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Şifre kontrolü fonksiyonu
  const handlePasswordSubmit = () => {
    if (passwordInput === COMPETITION_PASSWORD) {
      setCompetitionActive(true);
      setShowPasswordDialog(false);
      setPasswordError('');
    } else {
      setPasswordError('Yanlış şifre! Lütfen doğru şifreyi girin.');
      setPasswordInput('');
    }
  };

  // İl seçimi değiştiğinde çalışacak fonksiyon
  const handleProvinceChange = (event) => {
    setSelectedProvince(event.target.value);
    setFormData({
      ...formData,
      province: event.target.value
    });
  };

  // Türkiye geneli checkbox değiştiğinde çalışacak fonksiyon
  const handleNationalRankingChange = (event) => {
    setIncludeNationalRanking(event.target.checked);
  };

  // İlerle butonuna tıklandığında çalışacak fonksiyon
  const handleNext = async () => {
    // İl seçimi adımından sonraki adımlarda veri kaydet
    if (activeStep === 0 && selectedProvince) {
      await saveSubmissionData();
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Form verilerini Firebase'e kaydet
  const saveSubmissionData = async () => {
    if (!user || !competitionStatus.active) return;

    try {
      const submissionData = {
        userId: user.uid,
        province: selectedProvince,
        includeNationalRanking: includeNationalRanking,
        tytScores: formData.tytScores,
        aytScores: formData.aytScores,
        submittedAt: serverTimestamp(),
        competitionId: `competition_${new Date().toISOString().split('T')[0]}` // Günlük yarışma ID'si
      };

      await addDoc(collection(db, 'rekaNetSubmissions'), submissionData);
      
      // Başarılı gönderim mesajı
      console.log('Veri başarıyla kaydedildi');
      setShowConfetti(true);
      
      // Konfeti'yi 5 saniye sonra kapat
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
    } catch (error) {
      console.error('Veri kaydetme hatası:', error);
    }
  };

  // Geri butonuna tıklandığında çalışacak fonksiyon
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Yarışma durumunu takip et
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'rekaNet', 'competitionStatus'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const isActive = data.active || false;
        let endTime = null;
        
        if (isActive && data.actualEndTime) {
          endTime = data.actualEndTime;
        }
        
        setCompetitionStatus({
          active: isActive,
          endTime: endTime,
          timeLeft: null
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sayaç için useEffect
  useEffect(() => {
    let interval;
    
    if (competitionStatus.active && competitionStatus.endTime) {
      interval = setInterval(() => {
        const now = new Date();
        const endTime = new Date(competitionStatus.endTime);
        const timeLeft = endTime - now;
        
        if (timeLeft <= 0) {
          setCompetitionStatus(prev => ({
            ...prev,
            timeLeft: '00:00:00'
          }));
        } else {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          
          setCompetitionStatus(prev => ({
            ...prev,
            timeLeft: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          }));
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [competitionStatus.active, competitionStatus.endTime]);

  // Pencere boyutunu takip et
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adımlar
  const steps = [
    'İl Seçimi',
    'TYT Netleri',
    'AYT Netleri',
    'Sonuçlar'
  ];

  // Şifre giriş ekranı veya yarışma kapalı ekranı
  if (showPasswordDialog && !competitionActive) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(1deg)' },
          '66%': { transform: 'translateY(-10px) rotate(-1deg)' }
        },
        '@keyframes pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.05)', opacity: 0.8 }
        },
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        '@keyframes glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(78, 205, 196, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(78, 205, 196, 0.6), 0 0 60px rgba(78, 205, 196, 0.4)' }
        }
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Card sx={{
            borderRadius: '32px',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(30px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
            position: 'relative',
            animation: 'glow 3s ease-in-out infinite',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              animation: 'shimmer 3s infinite'
            }
          }}>
            <CardContent sx={{ p: 6, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              {/* Ana logo ve ikon */}
              <Box sx={{ 
                display: 'inline-block',
                animation: 'pulse 2s infinite',
                mb: 4,
                position: 'relative'
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(78, 205, 196, 0.2) 0%, transparent 70%)',
                  animation: 'pulse 2s infinite reverse'
                }} />
                <LanguageIcon sx={{ 
                  fontSize: 140, 
                  color: '#4ECDC4',
                  filter: 'drop-shadow(0 10px 20px rgba(78, 205, 196, 0.4))',
                  position: 'relative',
                  zIndex: 1
                }} />
              </Box>

              {/* Ana başlık */}
              <Typography variant="h1" sx={{
                fontWeight: 900,
                background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 50%, #093637 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontFamily: '"Satoshi", "Inter", sans-serif',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                letterSpacing: '-0.02em'
              }}>
                🏆 RekaNET
              </Typography>

              <Typography variant="h4" sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 4,
                fontWeight: 700,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}>
                Yarışma Platformu
              </Typography>

              {/* Uyarı mesajı */}
              <Alert severity="warning" sx={{
                mb: 4,
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '16px',
                '& .MuiAlert-message': {
                  color: '#FFC107',
                  fontWeight: 600
                }
              }}>
                {!competitionStatus.active 
                  ? '🚫 RekaNET yarışması şu anda aktif değil. Admin tarafından başlatılması bekleniyor.'
                  : '⚠️ Bu platform şu anda kapalıdır. Sisteme erişim için özel şifre gereklidir.'
                }
              </Alert>

              {/* Şifre giriş formu */}
              <Box sx={{
                p: 4,
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                mb: 4
              }}>
                <Typography variant="h6" sx={{
                  color: '#ffffff',
                  mb: 3,
                  fontWeight: 700
                }}>
                  🔐 Erişim Şifresi Girin
                </Typography>

                <TextField
                  fullWidth
                  type="password"
                  label="Şifre"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordSubmit();
                    }
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(78, 205, 196, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4ECDC4',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: '#ffffff',
                    },
                  }}
                />

                {passwordError && (
                  <Alert severity="error" sx={{
                    mb: 2,
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    borderRadius: '12px',
                    '& .MuiAlert-message': {
                      color: '#ff5252'
                    }
                  }}>
                    {passwordError}
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePasswordSubmit}
                  sx={{
                    py: 2,
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                    boxShadow: '0 8px 25px rgba(78, 205, 196, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #44A08D 0%, #4ECDC4 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(78, 205, 196, 0.4)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  🚀 Sisteme Giriş Yap
                </Button>
              </Box>

              {/* Bilgi mesajı */}
              <Typography variant="body2" sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.9rem',
                fontStyle: 'italic'
              }}>
                💡 Şifre için lütfen yöneticinize başvurunuz
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Ana RekaNET içeriği (şifre girildikten sonra)
  return (
    <Box sx={{ 
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Konfeti efekti */}
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 6, 
          mt: 16,
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <Box sx={{ position: 'relative' }}>
            <LanguageIcon 
              sx={{ 
                fontSize: 80, 
                color: '#ffffff',
                mb: 2,
                filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))',
                animation: 'pulse 2s infinite'
              }} 
            />
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 900,
                color: '#ffffff',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                lineHeight: 1.2,
                mb: 1,
                fontFamily: '"Satoshi", "Inter", sans-serif'
              }}
            >
              RekaNET
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 600,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                mb: 2
              }}
            >
              Yarışma Platformu
            </Typography>
            
            {/* Sayaç */}
            {competitionStatus.active && competitionStatus.timeLeft && (
              <Box sx={{
                mt: 3,
                p: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
                animation: 'pulse 2s infinite'
              }}>
                <Typography variant="body2" sx={{ 
                  color: '#ffffff', 
                  fontWeight: 600,
                  mb: 1,
                  opacity: 0.9
                }}>
                  ⏰ Yarışma Bitiş Süresi
                </Typography>
                <Typography variant="h3" sx={{ 
                  color: '#ffffff', 
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}>
                  {competitionStatus.timeLeft}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontWeight: 500,
                  mt: 1
                }}>
                  Saat:Dakika:Saniye
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      
        {/* Modern Stepper */}
        <Box sx={{ 
          mb: 6,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          flexWrap: 'wrap'
        }}>
          {steps.map((label, index) => (
            <Box key={label} sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                background: activeStep >= index 
                  ? 'linear-gradient(135deg, #16a34a 0%, #38f9d7 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: activeStep >= index 
                  ? '0 8px 25px rgba(22, 163, 74, 0.4)'
                  : '0 4px 15px rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '2px',
                  left: '2px',
                  right: '2px',
                  bottom: '2px',
                  borderRadius: '50%',
                  background: activeStep >= index 
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                }
              }}>
                <Typography variant="h6" sx={{
                  color: '#ffffff',
                  fontWeight: 800,
                  position: 'relative',
                  zIndex: 1
                }}>
                  {index + 1}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{
                color: activeStep >= index ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                fontWeight: activeStep >= index ? 700 : 500,
                textAlign: 'center',
                fontSize: '0.8rem',
                transition: 'all 0.3s ease'
              }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {/* Modern Content Card */}
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: '24px',
            overflow: 'hidden',
            mb: 4,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
            }
          }}
        >
          <CardContent sx={{ p: 6 }}>
            {/* Adım 1: İl Seçimi */}
            {activeStep === 0 && (
              <Fade in={activeStep === 0} timeout={800}>
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mb: 4 
                  }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 3,
                      boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '2px',
                        left: '2px',
                        right: '2px',
                        height: '50%',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                        borderRadius: '18px 18px 0 0'
                      }
                    }}>
                      <LanguageIcon sx={{ 
                        color: '#ffffff', 
                        fontSize: '2.5rem',
                        position: 'relative',
                        zIndex: 1
                      }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ 
                        mb: 1, 
                        fontWeight: 800, 
                        color: '#ffffff',
                        fontFamily: '"Satoshi", "Inter", sans-serif'
                      }}>
                        Hangi ilde yaşıyorsunuz?
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 500
                      }}>
                        Size en doğru önerileri sunabilmemiz için lütfen yaşadığınız ili seçin.
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    maxWidth: 600, 
                    mx: 'auto',
                    mb: 4
                  }}>
                    <FormControl 
                      fullWidth 
                      sx={{ 
                        mb: 4,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '16px',
                          background: '#1e293d',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          '&:hover': {
                            border: '2px solid rgba(255, 255, 255, 0.5)',
                          },
                          '&.Mui-focused': {
                            border: '2px solid #4ECDC4',
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontWeight: 600,
                          '&.Mui-focused': {
                            color: '#4ECDC4',
                          }
                        },
                        '& .MuiSelect-select': {
                          color: '#ffffff',
                          py: 2
                        },
                        '& .MuiSelect-icon': {
                          color: 'rgba(255, 255, 255, 0.8)',
                        }
                      }}
                    >
                      <InputLabel>İl Seçiniz</InputLabel>
                      <Select
                        value={selectedProvince}
                        label="İl Seçiniz"
                        onChange={handleProvinceChange}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: '#1e293d',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '12px',
                              '& .MuiMenuItem-root': {
                                color: '#ffffff',
                                '&:hover': {
                                  bgcolor: 'rgba(78, 205, 196, 0.1)',
                                },
                                '&.Mui-selected': {
                                  bgcolor: 'rgba(78, 205, 196, 0.2)',
                                  '&:hover': {
                                    bgcolor: 'rgba(78, 205, 196, 0.3)',
                                  }
                                }
                              }
                            }
                          }
                        }}
                      >
                        {turkeyProvinces.map((province) => (
                          <MenuItem key={province} value={province}>
                            {province}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Türkiye geneli hesaplama checkbox */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={includeNationalRanking}
                          onChange={handleNationalRankingChange}
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-checked': {
                              color: '#4ECDC4',
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: '1.5rem',
                            }
                          }}
                        />
                      }
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="body1" sx={{
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '1.1rem'
                          }}>
                            🇹🇷 Türkiye geneli de hesaplama yap
                          </Typography>
                          <Typography variant="body2" sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            mt: 0.5
                          }}>
                            Hem şehrinizdeki hem de Türkiye genelindeki sıralamanızı görün
                          </Typography>
                        </Box>
                      }
                      sx={{
                        alignItems: 'flex-start',
                        mt: 3,
                        mb: 2,
                        p: 3,
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(78, 205, 196, 0.3)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(78, 205, 196, 0.1)',
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                    <Button
                      variant="contained"
                      endIcon={<NavigateNextIcon />}
                      onClick={handleNext}
                      disabled={!selectedProvince}
                      sx={{
                        borderRadius: '16px',
                        py: 2,
                        px: 4,
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        background: selectedProvince 
                          ? 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'
                          : 'rgba(255, 255, 255, 0.1)',
                        color: selectedProvince ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                        boxShadow: selectedProvince 
                          ? '0 8px 25px rgba(78, 205, 196, 0.3)'
                          : 'none',
                        '&:hover': {
                          background: selectedProvince 
                            ? 'linear-gradient(135deg, #44A08D 0%, #4ECDC4 100%)'
                            : 'rgba(255, 255, 255, 0.1)',
                          transform: selectedProvince ? 'translateY(-2px)' : 'none',
                          boxShadow: selectedProvince 
                            ? '0 12px 35px rgba(78, 205, 196, 0.4)'
                            : 'none',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      İlerle
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}

            {/* Diğer adımlar - placeholder */}
            {activeStep > 0 && (
              <Fade in={activeStep > 0} timeout={800}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#ffffff', mb: 4, textAlign: 'center' }}>
                    Bu bölümler geliştiriliyor...
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', mb: 4 }}>
                    TYT/AYT net giriş sistemleri yakında eklenecek.
                  </Typography>
                  
                  {/* Seçilen ayarları göster */}
                  <Box sx={{ 
                    p: 4, 
                    borderRadius: '16px', 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    mb: 4,
                    textAlign: 'center'
                  }}>
                    <Typography variant="h6" sx={{ color: '#4ECDC4', mb: 2 }}>
                      📊 Hesaplama Ayarlarınız
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                      📍 Seçilen İl: <strong>{selectedProvince}</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ffffff' }}>
                      🇹🇷 Türkiye Geneli: <strong>{includeNationalRanking ? 'Evet' : 'Hayır'}</strong>
                    </Typography>
                    {includeNationalRanking && (
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 2, fontStyle: 'italic' }}>
                        ✨ Hem {selectedProvince} hem de Türkiye geneli sıralamanız hesaplanacak!
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={handleBack}
                      sx={{
                        borderColor: '#4ECDC4',
                        color: '#4ECDC4',
                        '&:hover': {
                          borderColor: '#44A08D',
                          bgcolor: 'rgba(78, 205, 196, 0.1)'
                        }
                      }}
                    >
                      Geri
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default RekaNET;
