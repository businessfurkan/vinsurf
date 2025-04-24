import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Fade,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LanguageIcon from '@mui/icons-material/Language';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CelebrationIcon from '@mui/icons-material/Celebration';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReactConfetti from 'react-confetti';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

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
  // State tanımlamaları
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProvince, setSelectedProvince] = useState('');
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
      history: { correct: 0, wrong: 0, empty: 0 },
      geography: { correct: 0, wrong: 0, empty: 0 },
      philosophy: { correct: 0, wrong: 0, empty: 0 }
    }
  });

  // İl seçimi değiştiğinde çalışacak fonksiyon
  const handleProvinceChange = (event) => {
    setSelectedProvince(event.target.value);
    setFormData({
      ...formData,
      province: event.target.value
    });
  };

  // İlerle butonuna tıklandığında çalışacak fonksiyon
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Geri butonuna tıklandığında çalışacak fonksiyon
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Skor değişikliklerini işleyen fonksiyon
  const handleScoreChange = (examType, subject, field, value) => {
    if (examType === 'tyt') {
      setFormData({
        ...formData,
        tytScores: {
          ...formData.tytScores,
          [subject]: {
            ...formData.tytScores[subject],
            [field]: value
          }
        }
      });
    } else if (examType === 'ayt') {
      setFormData({
        ...formData,
        aytScores: {
          ...formData.aytScores,
          [subject]: {
            ...formData.aytScores[subject],
            [field]: value
          }
        }
      });
    }
  };
  
  // TYT net hesaplama
  const calculateTYTNet = (subject) => {
    // Undefined kontrolü ekliyoruz
    if (!formData.tytScores[subject]) return "0.00";
    
    const correct = Number(formData.tytScores[subject].correct || 0);
    const wrong = Number(formData.tytScores[subject].wrong || 0);
    return Math.max(0, correct - (wrong * 0.25)).toFixed(2);
  };
  
  // AYT net hesaplama
  const calculateAYTNet = (subject) => {
    // Undefined kontrolü ekliyoruz
    if (!formData.aytScores[subject]) return "0.00";
    
    const correct = Number(formData.aytScores[subject].correct || 0);
    const wrong = Number(formData.aytScores[subject].wrong || 0);
    return Math.max(0, correct - (wrong * 0.25)).toFixed(2);
  };
  
  // Toplam TYT neti hesaplama
  const calculateTotalTYTNet = () => {
    return (
      parseFloat(calculateTYTNet('turkish')) +
      parseFloat(calculateTYTNet('social')) +
      parseFloat(calculateTYTNet('mathTYT')) +
      parseFloat(calculateTYTNet('science'))
    ).toFixed(2);
  };
  
  // Toplam AYT neti hesaplama
  const calculateTotalAYTNet = () => {
    return (
      parseFloat(calculateAYTNet('mathAYT')) +
      parseFloat(calculateAYTNet('physics')) +
      parseFloat(calculateAYTNet('chemistry')) +
      parseFloat(calculateAYTNet('biology'))
    ).toFixed(2);
  };
  
  // RekaNET karşılaştırma durumu
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  // Tema renkleri için
  const theme = useTheme();
  
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
  
  // Konfeti efektini başlat
  const startConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000); // 5 saniye sonra konfeti efektini kapat
  };

  // Adımlar
  const steps = [
    'İl Seçimi',
    'TYT Netleri',
    'AYT Netleri',
    'Sonuçlar'
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <LanguageIcon 
          sx={{ 
            fontSize: 60, 
            color: '#3F51B5',
            mr: 2,
            filter: 'drop-shadow(0 4px 6px rgba(63, 81, 181, 0.3))'
          }} 
        />
        <Box>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 800,
              color: '#3F51B5',
              textShadow: '2px 2px 4px rgba(63, 81, 181, 0.2)',
              lineHeight: 1.2
            }}
          >
            RekaNET
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(63, 81, 181, 0.8)',
              fontWeight: 500
            }}
          >
            Yapay Zeka Destekli Soru Çözüm Platformu
          </Typography>
        </Box>
      </Box>
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => {
          return (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      
      {/* Content */}
      <Card 
        elevation={3}
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4,
          boxShadow: '0 10px 30px rgba(63, 81, 181, 0.1)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* İl Seçimi Adımı */}
          {activeStep === 0 && (
            <Fade in={activeStep === 0} timeout={500}>
              <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#3F51B5' }}>
                  Hangi ilde yaşıyorsunuz?
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                  Size en doğru önerileri sunabilmemiz için lütfen yaşadığınız ili seçin.
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <InputLabel id="province-select-label">İl Seçiniz</InputLabel>
                  <Select
                    labelId="province-select-label"
                    id="province-select"
                    value={selectedProvince}
                    label="İl Seçiniz"
                    onChange={handleProvinceChange}
                  >
                    {turkeyProvinces.map((province) => (
                      <MenuItem key={province} value={province}>
                        {province}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    endIcon={<NavigateNextIcon />}
                    onClick={handleNext}
                    disabled={!selectedProvince}
                    sx={{
                      bgcolor: '#3F51B5',
                      '&:hover': {
                        bgcolor: '#303F9F'
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'rgba(63, 81, 181, 0.3)'
                      }
                    }}
                  >
                    İlerle
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}
          
          {/* TYT Netleri Adımı */}
          {activeStep === 1 && (
            <Fade in={activeStep === 1} timeout={500}>
              <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#3F51B5' }}>
                  TYT Sonuçlarınız
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                  Son girdiğiniz TYT denemesindeki doğru, yanlış ve boş sayılarınızı giriniz.
                </Typography>
                
                <Grid container spacing={4}>
                  {/* Türkçe */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#3F51B5', fontWeight: 600 }}>
                        Türkçe (40 Soru)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <TextField
                            label="Doğru"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 40 } }}
                            value={formData.tytScores.turkish.correct}
                            onChange={(e) => handleScoreChange('tyt', 'turkish', 'correct', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Yanlış"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 40 } }}
                            value={formData.tytScores.turkish.wrong}
                            onChange={(e) => handleScoreChange('tyt', 'turkish', 'wrong', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Boş"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 40 } }}
                            value={formData.tytScores.turkish.empty}
                            onChange={(e) => handleScoreChange('tyt', 'turkish', 'empty', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(63, 81, 181, 0.1)', borderRadius: 1 }}>
                        <Typography variant="body2">
                          Net: <strong>{calculateTYTNet('turkish')}</strong>
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                  
                  {/* Sosyal Bilimler */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#3F51B5', fontWeight: 600 }}>
                        Sosyal Bilimler (20 Soru)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <TextField
                            label="Doğru"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 20 } }}
                            value={formData.tytScores.social.correct}
                            onChange={(e) => handleScoreChange('tyt', 'social', 'correct', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Yanlış"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 20 } }}
                            value={formData.tytScores.social.wrong}
                            onChange={(e) => handleScoreChange('tyt', 'social', 'wrong', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Boş"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 20 } }}
                            value={formData.tytScores.social.empty}
                            onChange={(e) => handleScoreChange('tyt', 'social', 'empty', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(63, 81, 181, 0.1)', borderRadius: 1 }}>
                        <Typography variant="body2">
                          Net: <strong>{calculateTYTNet('social')}</strong>
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                  
                  {/* Matematik */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#3F51B5', fontWeight: 600 }}>
                        Matematik (40 Soru)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <TextField
                            label="Doğru"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 40 } }}
                            value={formData.tytScores.math.correct}
                            onChange={(e) => handleScoreChange('tyt', 'math', 'correct', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Yanlış"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 40 } }}
                            value={formData.tytScores.math.wrong}
                            onChange={(e) => handleScoreChange('tyt', 'math', 'wrong', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Boş"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 40 } }}
                            value={formData.tytScores.math.empty}
                            onChange={(e) => handleScoreChange('tyt', 'math', 'empty', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(63, 81, 181, 0.1)', borderRadius: 1 }}>
                        <Typography variant="body2">
                          Net: <strong>{calculateTYTNet('math')}</strong>
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                  
                  {/* Fen Bilimleri */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#3F51B5', fontWeight: 600 }}>
                        Fen Bilimleri (20 Soru)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <TextField
                            label="Doğru"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 20 } }}
                            value={formData.tytScores.science.correct}
                            onChange={(e) => handleScoreChange('tyt', 'science', 'correct', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Yanlış"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 20 } }}
                            value={formData.tytScores.science.wrong}
                            onChange={(e) => handleScoreChange('tyt', 'science', 'wrong', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Boş"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 20 } }}
                            value={formData.tytScores.science.empty}
                            onChange={(e) => handleScoreChange('tyt', 'science', 'empty', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(63, 81, 181, 0.1)', borderRadius: 1 }}>
                        <Typography variant="body2">
                          Net: <strong>{calculateTYTNet('science')}</strong>
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{
                      borderColor: '#3F51B5',
                      color: '#3F51B5',
                      '&:hover': {
                        borderColor: '#303F9F',
                        bgcolor: 'rgba(63, 81, 181, 0.05)'
                      }
                    }}
                  >
                    Geri
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<NavigateNextIcon />}
                    onClick={handleNext}
                    sx={{
                      bgcolor: '#3F51B5',
                      '&:hover': {
                        bgcolor: '#303F9F'
                      }
                    }}
                  >
                    İlerle
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}
          
          {/* AYT Netleri Adımı */}
          {activeStep === 2 && (
            <Fade in={activeStep === 2} timeout={500}>
              <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#3F51B5' }}>
                  AYT Sonuçlarınız
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                  Son girdiğiniz AYT denemesindeki doğru, yanlış ve boş sayılarınızı giriniz.
                </Typography>
                
                <Grid container spacing={4}>
                  {/* Matematik */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#3F51B5', fontWeight: 600 }}>
                        Matematik (40 Soru)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <TextField
                            label="Doğru"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 40 } }}
                            value={formData.aytScores.mathAYT.correct}
                            onChange={(e) => handleScoreChange('ayt', 'mathAYT', 'correct', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Yanlış"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 40 } }}
                            value={formData.aytScores.mathAYT.wrong}
                            onChange={(e) => handleScoreChange('ayt', 'mathAYT', 'wrong', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Boş"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 40 } }}
                            value={formData.aytScores.mathAYT.empty}
                            onChange={(e) => handleScoreChange('ayt', 'mathAYT', 'empty', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(63, 81, 181, 0.1)', borderRadius: 1 }}>
                        <Typography variant="body2">
                          Net: <strong>{calculateAYTNet('mathAYT')}</strong>
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                  
                  {/* Fizik */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#3F51B5', fontWeight: 600 }}>
                        Fizik (14 Soru)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <TextField
                            label="Doğru"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 14 } }}
                            value={formData.aytScores.physics.correct}
                            onChange={(e) => handleScoreChange('ayt', 'physics', 'correct', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Yanlış"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 14 } }}
                            value={formData.aytScores.physics.wrong}
                            onChange={(e) => handleScoreChange('ayt', 'physics', 'wrong', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Boş"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 14 } }}
                            value={formData.aytScores.physics.empty}
                            onChange={(e) => handleScoreChange('ayt', 'physics', 'empty', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(63, 81, 181, 0.1)', borderRadius: 1 }}>
                        <Typography variant="body2">
                          Net: <strong>{calculateAYTNet('physics')}</strong>
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                  
                  {/* Kimya */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#3F51B5', fontWeight: 600 }}>
                        Kimya (13 Soru)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <TextField
                            label="Doğru"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 13 } }}
                            value={formData.aytScores.chemistry.correct}
                            onChange={(e) => handleScoreChange('ayt', 'chemistry', 'correct', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Yanlış"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 13 } }}
                            value={formData.aytScores.chemistry.wrong}
                            onChange={(e) => handleScoreChange('ayt', 'chemistry', 'wrong', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Boş"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 13 } }}
                            value={formData.aytScores.chemistry.empty}
                            onChange={(e) => handleScoreChange('ayt', 'chemistry', 'empty', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(63, 81, 181, 0.1)', borderRadius: 1 }}>
                        <Typography variant="body2">
                          Net: <strong>{calculateAYTNet('chemistry')}</strong>
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                  
                  {/* Biyoloji */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={1} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#3F51B5', fontWeight: 600 }}>
                        Biyoloji (13 Soru)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <TextField
                            label="Doğru"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 13 } }}
                            value={formData.aytScores.biology.correct}
                            onChange={(e) => handleScoreChange('ayt', 'biology', 'correct', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Yanlış"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 13 } }}
                            value={formData.aytScores.biology.wrong}
                            onChange={(e) => handleScoreChange('ayt', 'biology', 'wrong', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Boş"
                            type="number"
                            InputProps={{ inputProps: { min: 0, max: 13 } }}
                            value={formData.aytScores.biology.empty}
                            onChange={(e) => handleScoreChange('ayt', 'biology', 'empty', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(63, 81, 181, 0.1)', borderRadius: 1 }}>
                        <Typography variant="body2">
                          Net: <strong>{calculateAYTNet('biology')}</strong>
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{
                      borderColor: '#3F51B5',
                      color: '#3F51B5',
                      '&:hover': {
                        borderColor: '#303F9F',
                        bgcolor: 'rgba(63, 81, 181, 0.05)'
                      }
                    }}
                  >
                    Geri
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<NavigateNextIcon />}
                    onClick={handleNext}
                    sx={{
                      bgcolor: '#3F51B5',
                      '&:hover': {
                        bgcolor: '#303F9F'
                      }
                    }}
                  >
                    İlerle
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}
          
          {/* Sonuçlar Adımı */}
          {activeStep === 3 && (
            <Fade in={activeStep === 3} timeout={500}>
              <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#3F51B5' }}>
                  Sonuçlarınız
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                  Girdiğiniz bilgilere göre sonuçlarınız aşağıda görüntülenmektedir.
                </Typography>
                
                <Card elevation={2} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: '#3F51B5', p: 2, color: 'white' }}>
                    <Typography variant="h6">
                      Kişisel Bilgiler
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Bulunduğunuz İl:</strong> {formData.province}
                    </Typography>
                  </Box>
                </Card>
                
                <Card elevation={2} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: '#3F51B5', p: 2, color: 'white' }}>
                    <Typography variant="h6">
                      TYT Sonuçlarınız
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Türkçe:</strong> {calculateTYTNet('turkish')} net
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Sosyal Bilimler:</strong> {calculateTYTNet('social')} net
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Matematik:</strong> {calculateTYTNet('mathTYT')} net
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Fen Bilimleri:</strong> {calculateTYTNet('science')} net
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#3F51B5' }}>
                      Toplam TYT Neti: {calculateTotalTYTNet()}
                    </Typography>
                  </Box>
                </Card>
                
                <Card elevation={2} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: '#3F51B5', p: 2, color: 'white' }}>
                    <Typography variant="h6">
                      AYT Sonuçlarınız
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Matematik:</strong> {calculateAYTNet('mathAYT')} net
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Fizik:</strong> {calculateAYTNet('physics')} net
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Kimya:</strong> {calculateAYTNet('chemistry')} net
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Biyoloji:</strong> {calculateAYTNet('biology')} net
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#3F51B5' }}>
                      Toplam Sayısal AYT Neti: {calculateTotalAYTNet()}
                    </Typography>
                  </Box>
                </Card>
                
                {/* Konfeti efekti */}
                {showConfetti && (
                  <ReactConfetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.1}
                    colors={[
                      '#3F51B5', '#4CAF50', '#FFC107', '#F44336', '#9C27B0', 
                      '#2196F3', '#FF9800', '#00BCD4', '#E91E63', '#FFEB3B'
                    ]}
                  />
                )}
                
                {/* Karşılaştırma sonucu */}
                {comparisonResult && (
                  <Card 
                    elevation={4} 
                    sx={{ 
                      mb: 4, 
                      borderRadius: 3, 
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(63, 81, 181, 0.15)',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 28px rgba(63, 81, 181, 0.25)'
                      }
                    }}
                  >
                    {/* Başlık */}
                    <Box 
                      sx={{ 
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        p: 2.5, 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 1.5, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          RekaNET Sıralamanız
                        </Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          bgcolor: 'rgba(255,255,255,0.15)',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 4
                        }}
                      >
                        <LanguageIcon sx={{ mr: 1, fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {comparisonResult.province}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* İçerik */}
                    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                      <Grid container spacing={4} alignItems="stretch">
                        {/* Sol Kısım - Sıralama */}
                        <Grid item xs={12} md={7}>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 3, 
                              height: '100%',
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                          >
                            {/* Sıralama Bilgisi */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                              <Box 
                                sx={{ 
                                  bgcolor: '#FFD700', 
                                  p: 1.5, 
                                  borderRadius: '50%',
                                  display: 'flex',
                                  mr: 2,
                                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                                }}
                              >
                                <EmojiEventsIcon sx={{ fontSize: 40, color: 'white' }} />
                              </Box>
                              <Box>
                                <Typography 
                                  variant="h4" 
                                  sx={{ 
                                    color: theme.palette.primary.main, 
                                    fontWeight: 800,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  {comparisonResult.rank}. Sırada
                                </Typography>
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{ 
                                    color: theme.palette.text.secondary, 
                                    mt: 0.5,
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  <BarChartIcon sx={{ mr: 1, fontSize: 18 }} />
                                  Toplam {comparisonResult.totalUsers + 1} katılımcı arasında
                                </Typography>
                              </Box>
                            </Box>
                            
                            {/* Açıklama */}
                            <Box 
                              sx={{ 
                                bgcolor: 'white', 
                                p: 2.5, 
                                borderRadius: 2, 
                                mb: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                flex: 1
                              }}
                            >
                              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                                <strong style={{ color: theme.palette.primary.main }}>YKSTRACKER</strong> sistemimizi kullanan ve <strong>{comparisonResult.province}</strong> ilinde yaşayan diğer <strong>{comparisonResult.totalUsers}</strong> kullanıcımız arasından {comparisonResult.comparisonType === "TYT" ? "TYT" : "TYT+AYT"} netlerinizle bu sıralamayı elde ettiniz.
                              </Typography>
                            </Box>
                            
                            {/* Kutla Butonu */}
                            <Button
                              variant="contained"
                              color="secondary"
                              size="large"
                              startIcon={<CelebrationIcon />}
                              onClick={startConfetti}
                              sx={{
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                                '&:hover': {
                                  boxShadow: '0 6px 16px rgba(156, 39, 176, 0.4)',
                                  background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`
                                }
                              }}
                            >
                              Başarını Kutla!
                            </Button>
                          </Paper>
                        </Grid>
                        
                        {/* Sağ Kısım - Net Bilgileri */}
                        <Grid item xs={12} md={5}>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              height: '100%',
                              borderRadius: 3,
                              overflow: 'hidden',
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                            }}
                          >
                            {/* Net Bilgileri Başlık */}
                            <Box 
                              sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.9),
                                p: 2,
                                color: 'white'
                              }}
                            >
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <TrendingUpIcon sx={{ mr: 1 }} />
                                Net Bilgileriniz
                              </Typography>
                            </Box>
                            
                            {/* Net Detayları */}
                            <Box sx={{ p: 3, bgcolor: 'white' }}>
                              <Grid container spacing={3}>
                                {/* TYT Net */}
                                <Grid item xs={6}>
                                  <Box 
                                    sx={{ 
                                      p: 2,
                                      borderRadius: 2,
                                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                                      height: '100%'
                                    }}
                                  >
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: theme.palette.text.secondary,
                                        mb: 1,
                                        fontWeight: 500
                                      }}
                                    >
                                      TYT Netiniz:
                                    </Typography>
                                    <Typography 
                                      variant="h5" 
                                      sx={{ 
                                        fontWeight: 700, 
                                        color: theme.palette.primary.main,
                                        display: 'flex',
                                        alignItems: 'center'
                                      }}
                                    >
                                      {comparisonResult.tytNet}
                                    </Typography>
                                  </Box>
                                </Grid>
                                
                                {/* AYT Net */}
                                <Grid item xs={6}>
                                  <Box 
                                    sx={{ 
                                      p: 2,
                                      borderRadius: 2,
                                      bgcolor: comparisonResult.comparisonType === "TYT" ? 
                                        alpha(theme.palette.grey[300], 0.5) : 
                                        alpha(theme.palette.primary.main, 0.05),
                                      height: '100%'
                                    }}
                                  >
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: theme.palette.text.secondary,
                                        mb: 1,
                                        fontWeight: 500 
                                      }}
                                    >
                                      AYT Netiniz:
                                    </Typography>
                                    <Typography 
                                      variant="h5" 
                                      sx={{ 
                                        fontWeight: 700, 
                                        color: comparisonResult.comparisonType === "TYT" ? 
                                          theme.palette.text.disabled : 
                                          theme.palette.primary.main
                                      }}
                                    >
                                      {comparisonResult.aytNet}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                              
                              <Divider sx={{ my: 3 }} />
                              
                              {/* Toplam Net */}
                              <Box 
                                sx={{ 
                                  p: 2.5, 
                                  borderRadius: 2, 
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                  mb: 3
                                }}
                              >
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: theme.palette.success.dark,
                                    mb: 0.5,
                                    fontWeight: 500 
                                  }}
                                >
                                  Toplam Netiniz:
                                </Typography>
                                <Typography 
                                  variant="h3" 
                                  sx={{ 
                                    fontWeight: 800, 
                                    color: theme.palette.success.dark,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  {comparisonResult.userNet}
                                </Typography>
                              </Box>
                              
                              {/* En Yüksek Net */}
                              <Box 
                                sx={{ 
                                  p: 2, 
                                  borderRadius: 2, 
                                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                                  border: `1px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: theme.palette.warning.dark,
                                    fontWeight: 500 
                                  }}
                                >
                                  Sıralamadaki en yüksek net:
                                </Typography>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    color: theme.palette.warning.dark,
                                    ml: 1
                                  }}
                                >
                                  {comparisonResult.highestNet}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>
                )}
                
                {/* Hata mesajı */}
                {error && (
                  <Alert severity="warning" sx={{ mb: 4 }}>
                    {error}
                  </Alert>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{
                      borderColor: '#3F51B5',
                      color: '#3F51B5',
                      '&:hover': {
                        borderColor: '#303F9F',
                        bgcolor: 'rgba(63, 81, 181, 0.05)'
                      }
                    }}
                  >
                    Geri
                  </Button>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        try {
                          // Verileri Firestore'a kaydet
                          // Kullanıcının AYT netleri girip girmediğini kontrol et
                          const hasAYTScores = Object.values(formData.aytScores).some(score => 
                            parseInt(score.correct) > 0 || parseInt(score.wrong) > 0
                          );
                          
                          await addDoc(collection(db, "rekanet_scores"), {
                            province: formData.province,
                            tytScores: formData.tytScores,
                            aytScores: formData.aytScores,
                            totalTYTNet: calculateTotalTYTNet(),
                            totalAYTNet: hasAYTScores ? calculateTotalAYTNet() : "0",
                            hasAYTScores: hasAYTScores,
                            timestamp: new Date()
                          });
                          alert('Bilgileriniz başarıyla kaydedildi!');
                        } catch (error) {
                          console.error("Error adding document: ", error);
                          alert('Bilgileriniz kaydedilirken bir hata oluştu!');
                        }
                      }}
                      sx={{
                        bgcolor: '#4CAF50',
                        '&:hover': {
                          bgcolor: '#388E3C'
                        }
                      }}
                    >
                      Kaydet
                    </Button>
                    <Button
                      variant="contained"
                      disabled={loading}
                      onClick={async () => {
                        setLoading(true);
                        setError(null);
                        setComparisonResult(null);
                        
                        try {
                          // İl seçilip seçilmediğini kontrol et
                          if (!formData.province) {
                            setError("Lütfen önce bir il seçiniz.");
                            setLoading(false);
                            return;
                          }
                          
                          // Seçilen ildeki diğer kullanıcıların verilerini çek
                          try {
                            const q = query(collection(db, "rekanet_scores"), where("province", "==", formData.province));
                            const querySnapshot = await getDocs(q);
                            
                            // Veri yoksa uyarı göster
                            if (querySnapshot.empty) {
                              setError(`${formData.province} ilinde henüz net bilgisi girilmemiş. İlk kaydeden siz olabilirsiniz!`);
                              setLoading(false);
                              return;
                            }
                            
                            // Kullanıcının AYT netleri girip girmediğini kontrol et
                            const hasAYTScores = Object.values(formData.aytScores).some(score => 
                              parseInt(score.correct) > 0 || parseInt(score.wrong) > 0
                            );
                            
                            // Kullanıcı netleri
                            const userTYTNet = parseFloat(calculateTotalTYTNet());
                            const userAYTNet = hasAYTScores ? parseFloat(calculateTotalAYTNet()) : 0;
                            
                            // Karşılaştırma türünü belirle
                            const comparisonType = hasAYTScores ? "TYT+AYT" : "TYT";
                            
                            // Tüm kullanıcıların netlerini topla
                            const allScores = [];
                            const allUserData = [];
                            
                            querySnapshot.forEach((doc) => {
                              const data = doc.data();
                              
                              // Veri doğrulama
                              if (!data.totalTYTNet) {
                                return; // Geçersiz veriyi atla
                              }
                              
                              let totalNet;
                              
                              if (comparisonType === "TYT") {
                                // Sadece TYT karşılaştırması yapılıyorsa
                                totalNet = parseFloat(data.totalTYTNet || 0);
                              } else {
                                // TYT+AYT karşılaştırması yapılıyorsa
                                totalNet = parseFloat(data.totalTYTNet || 0) + 
                                         (data.totalAYTNet ? parseFloat(data.totalAYTNet) : 0);
                              }
                              
                              // Geçerli bir sayı mı kontrol et
                              if (!isNaN(totalNet)) {
                                allScores.push(totalNet);
                                allUserData.push({
                                  id: doc.id,
                                  totalNet: totalNet,
                                  tytNet: parseFloat(data.totalTYTNet || 0),
                                  aytNet: data.totalAYTNet ? parseFloat(data.totalAYTNet) : 0,
                                  timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
                                });
                              }
                            });
                            
                            // Veri yoksa uyarı göster
                            if (allScores.length === 0) {
                              setError(`${formData.province} ilinde geçerli net bilgisi bulunamadı.`);
                              setLoading(false);
                              return;
                            }
                            
                            // Kullanıcının toplam neti
                            const userTotalNet = comparisonType === "TYT" ? userTYTNet : (userTYTNet + userAYTNet);
                            
                            // Kullanıcının sıralamasını bul
                            allScores.push(userTotalNet);
                            const sortedScores = [...allScores].sort((a, b) => b - a); // Büyükten küçüğe sırala
                            const userRank = sortedScores.indexOf(userTotalNet) + 1;
                            
                            // Sonucu göster
                            setComparisonResult({
                              province: formData.province,
                              totalUsers: allScores.length - 1,
                              rank: userRank,
                              userNet: userTotalNet.toFixed(2),
                              highestNet: sortedScores[0].toFixed(2),
                              comparisonType: comparisonType,
                              tytNet: userTYTNet.toFixed(2),
                              aytNet: hasAYTScores ? userAYTNet.toFixed(2) : "0.00"
                            });
                          } catch (firestoreError) {
                            console.error("Firestore error: ", firestoreError);
                            setError(`Veritabanı sorgusu sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.`);
                            setLoading(false);
                            return;
                          }
                        } catch (error) {
                          console.error("Error comparing scores: ", error);
                          setError("Karşılaştırma yapılırken bir hata oluştu.");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      sx={{
                        bgcolor: '#3F51B5',
                        '&:hover': {
                          bgcolor: '#303F9F'
                        }
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'RekaNET Hesapla'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RekaNET;
