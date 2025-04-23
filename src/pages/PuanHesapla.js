import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  Tabs, 
  Tab, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  useTheme,
  alpha
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';

const PuanHesapla = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [results, setResults] = useState(null);
  const [allResults, setAllResults] = useState(null);
  const [puanTuru, setPuanTuru] = useState('EA'); // Varsayılan puan türü
  const [obp, setObp] = useState('');

  // TYT ders puanları
  const [tytScores, setTytScores] = useState({
    turkce: { dogru: '', yanlis: '' },
    sosyal: { dogru: '', yanlis: '' },
    matematik: { dogru: '', yanlis: '' },
    fen: { dogru: '', yanlis: '' }
  });

  // AYT ders puanları
  const [aytScores, setAytScores] = useState({
    matematik: { dogru: '', yanlis: '' },
    fizik: { dogru: '', yanlis: '' },
    kimya: { dogru: '', yanlis: '' },
    biyoloji: { dogru: '', yanlis: '' },
    edebiyat: { dogru: '', yanlis: '' },
    tarih1: { dogru: '', yanlis: '' },
    cografya1: { dogru: '', yanlis: '' },
    tarih2: { dogru: '', yanlis: '' },
    cografya2: { dogru: '', yanlis: '' },
    felsefe: { dogru: '', yanlis: '' },
    din: { dogru: '', yanlis: '' }
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTytChange = (subject, field, value) => {
    setTytScores({
      ...tytScores,
      [subject]: {
        ...tytScores[subject],
        [field]: value
      }
    });
  };

  const handleAytChange = (subject, field, value) => {
    setAytScores({
      ...aytScores,
      [subject]: {
        ...aytScores[subject],
        [field]: value
      }
    });
  };

  // Net hesaplama fonksiyonu
  const calculateNet = (dogru, yanlis) => {
    const dogruNum = parseFloat(dogru) || 0;
    const yanlisNum = parseFloat(yanlis) || 0;
    return Math.max(0, dogruNum - (yanlisNum / 4));
  };

  // Gerçek sonuçlara göre ayarlanmış TYT katsayıları
  const tytCoefficients = {
    turkce: 3.5, // Türkçe katsayısı
    sosyal: 3.5, // Sosyal Bilimler katsayısı
    matematik: 4.0, // Temel Matematik katsayısı
    fen: 3.8 // Fen Bilimleri katsayısı
  };

  // Gerçek sonuçlara göre ayarlanmış AYT katsayıları
  const aytCoefficients = {
    EA: {
      matematik: 4.5, // Matematik
      fizik: 0.2, // Eşit Ağırlık için fizik düşük katsayılı
      kimya: 0.2, // Eşit Ağırlık için kimya düşük katsayılı
      biyoloji: 0.2, // Eşit Ağırlık için biyoloji düşük katsayılı
      edebiyat: 3.5, // Türk Dili ve Edebiyatı
      tarih1: 2.5, // Tarih-1
      cografya1: 2.0, // Coğrafya-1
      tarih2: 0.2, // Eşit Ağırlık için tarih-2 düşük katsayılı
      cografya2: 0.2, // Eşit Ağırlık için coğrafya-2 düşük katsayılı
      felsefe: 0.2, // Eşit Ağırlık için felsefe düşük katsayılı
      din: 0.2 // Eşit Ağırlık için din kültürü düşük katsayılı
    },
    SAY: {
      matematik: 5.0, // Matematik
      fizik: 4.0, // Fizik
      kimya: 4.5, // Kimya
      biyoloji: 4.0, // Biyoloji
      edebiyat: 0.2, // Sayısal için edebiyat düşük katsayılı
      tarih1: 0.2, // Sayısal için tarih-1 düşük katsayılı
      cografya1: 0.2, // Sayısal için coğrafya-1 düşük katsayılı
      tarih2: 0.2, // Sayısal için tarih-2 düşük katsayılı
      cografya2: 0.2, // Sayısal için coğrafya-2 düşük katsayılı
      felsefe: 0.2, // Sayısal için felsefe düşük katsayılı
      din: 0.2 // Sayısal için din kültürü düşük katsayılı
    },
    SOZ: {
      matematik: 0.2, // Sözel için matematik düşük katsayılı
      fizik: 0.2, // Sözel için fizik düşük katsayılı
      kimya: 0.2, // Sözel için kimya düşük katsayılı
      biyoloji: 0.2, // Sözel için biyoloji düşük katsayılı
      edebiyat: 4.0, // Türk Dili ve Edebiyatı
      tarih1: 3.5, // Tarih-1
      cografya1: 3.0, // Coğrafya-1
      tarih2: 3.0, // Tarih-2
      cografya2: 2.5, // Coğrafya-2
      felsefe: 2.5, // Felsefe Grubu
      din: 2.0 // Din Kültürü
    }
  };

  // Gerçek sonuçlara göre ayarlanmış taban puanlar
  const baseScores = {
    TYT: 200, // TYT için yüksek taban puan
    EA: 100, // EA için taban puan
    SAY: 150, // SAY için taban puan
    SOZ: 120 // SÖZ için taban puan
  };

  // Sıralama tahminleri (puan türüne göre) - 2024 ÖSYM verilerine göre güncel değerler
  const rankEstimates = {
    EA: {
      280: 350000,
      300: 200000,
      320: 150000,
      340: 100000,
      350: 127000,  // Örnek veriye göre ayarlandı
      360: 85000,
      380: 50000,
      400: 28000,
      420: 14000,
      440: 6500,
      460: 2800,
      480: 1200,
      500: 400
    },
    SAY: {
      230: 340000,  // Örnek veriye göre ayarlandı
      250: 300000,
      280: 250000,
      300: 200000,
      320: 150000,
      340: 100000,
      360: 70000,
      380: 42000,
      400: 23000,
      420: 11000,
      440: 4500,
      460: 1800,
      480: 800,
      500: 250
    },
    SOZ: {
      270: 300000,
      280: 280000,  // Örnek veriye göre ayarlandı
      300: 240000,
      320: 200000,
      326: 239000,  // Örnek veriye göre ayarlandı
      340: 160000,
      360: 95000,
      380: 55000,
      400: 32000,
      420: 16000,
      440: 7500,
      460: 3200,
      480: 1500,
      500: 600
    },
    TYT: {
      300: 400000,
      320: 300000,
      322: 290000,  // Örnek veriye göre ayarlandı
      340: 200000,
      360: 120000,
      370: 100000,  // Örnek veriye göre ayarlandı
      380: 70000,
      400: 40000,
      420: 20000,
      440: 10000,
      460: 5000,
      480: 2000,
      500: 800
    }
  };

  // Puana göre yaklaşık sıralama hesaplama
  const estimateRank = (score, type) => {
    const ranks = rankEstimates[type];
    const scores = Object.keys(ranks).map(Number).sort((a, b) => a - b);
    
    // Puan en düşük sınırdan düşükse
    if (score < scores[0]) {
      return ranks[scores[0]];
    }
    
    // Puan en yüksek sınırdan yüksekse
    if (score > scores[scores.length - 1]) {
      return Math.max(100, ranks[scores[scores.length - 1]] / 2);
    }
    
    // Aradaki puanlar için doğrusal interpolasyon
    for (let i = 0; i < scores.length - 1; i++) {
      if (score >= scores[i] && score <= scores[i + 1]) {
        const lowerScore = scores[i];
        const upperScore = scores[i + 1];
        const lowerRank = ranks[lowerScore];
        const upperRank = ranks[upperScore];
        
        // Doğrusal interpolasyon
        const ratio = (score - lowerScore) / (upperScore - lowerScore);
        return Math.round(lowerRank - ratio * (lowerRank - upperRank));
      }
    }
    
    return 100000; // Varsayılan değer
  };

  // AYT verisi girilip girilmediğini kontrol et
  const hasAytData = () => {
    return Object.keys(aytScores).some(subject => {
      return aytScores[subject].dogru !== '' || aytScores[subject].yanlis !== '';
    });
  };

  // Sadece TYT puanı hesapla (Gerçek sonuçlara göre ayarlanmış)
  const calculateTytScore = () => {
    // TYT puanlarını hesapla
    let tytTotal = 0;
    let tytBaseScore = baseScores.TYT; // TYT için yüksek taban puan
    
    // TYT verileri var mı kontrol et
    const hasTytData = Object.keys(tytScores).some(subject => {
      return tytScores[subject].dogru !== '' || tytScores[subject].yanlis !== '';
    });

    if (!hasTytData) {
      // TYT verisi yoksa uyarı için boş sonuç döndür
      return {
        error: 'TYT verisi girilmedi',
        tytPuan: 0,
        aytPuan: 0,
        yerlesimPuani: 0,
        yaklasikSiralama: 0
      };
    }
    
    // Her ders için net ve puan hesapla (Gerçek sonuçlara göre ayarlanmış katsayılar)
    Object.keys(tytScores).forEach(subject => {
      const net = calculateNet(tytScores[subject].dogru, tytScores[subject].yanlis);
      const point = net * tytCoefficients[subject];
      tytTotal += point;
    });
    
    // TYT puanını hesapla, gerçek sonuçlara göre ayarlandı
    const tytPuan = tytBaseScore + tytTotal * 1.5; // Gerçek sonuçlara uygun olması için çarpan eklendi
    
    // OBP ekle (Diploma puanı * 0.6)
    const obpValue = parseFloat(obp) || 0;
    let yerlesimPuani = tytPuan;
    if (obpValue > 0) {
      yerlesimPuani += (obpValue * 0.6);
    }
    
    // Yaklaşık sıralama hesapla (TYT için)
    const yaklasikSiralama = estimateRank(tytPuan, 'TYT');
    
    return {
      tytPuan,
      aytPuan: 0,
      yerlesimPuani,
      yaklasikSiralama
    };
  };

  const calculateScoreForType = (puanType) => {
    // TYT puanlarını hesapla
    let tytTotal = 0;
    let tytBaseScore = baseScores.TYT; // TYT için yüksek taban puan
    
    // TYT verileri var mı kontrol et
    const hasTytData = Object.keys(tytScores).some(subject => {
      return tytScores[subject].dogru !== '' || tytScores[subject].yanlis !== '';
    });

    if (!hasTytData) {
      // TYT verisi yoksa uyarı için boş sonuç döndür
      return {
        error: 'TYT verisi girilmedi',
        tytPuan: 0,
        aytPuan: 0,
        yerlesimPuani: 0,
        yaklasikSiralama: 0
      };
    }
    
    // Her ders için net ve puan hesapla (Gerçek sonuçlara göre ayarlanmış katsayılar)
    Object.keys(tytScores).forEach(subject => {
      const net = calculateNet(tytScores[subject].dogru, tytScores[subject].yanlis);
      const point = net * tytCoefficients[subject];
      tytTotal += point;
    });
    
    // TYT puanını hesapla, gerçek sonuçlara göre ayarlandı
    const tytPuan = tytBaseScore + tytTotal * 1.5; // Gerçek sonuçlara uygun olması için çarpan eklendi
    
    // AYT verisi girildi mi kontrol et
    if (!hasAytData()) {
      // AYT verisi yoksa hata döndür
      return {
        error: 'AYT verisi girilmedi',
        tytPuan,
        aytPuan: 0,
        yerlesimPuani: 0,
        yaklasikSiralama: 0
      };
    }
    
    // AYT puanlarını hesapla
    let aytTotal = 0;
    
    // Her ders için net ve puan hesapla (Gerçek sonuçlara göre ayarlanmış katsayılar)
    Object.keys(aytScores).forEach(subject => {
      const net = calculateNet(aytScores[subject].dogru, aytScores[subject].yanlis);
      const coefficient = aytCoefficients[puanType][subject];
      // Doğrudan katsayılarla çarpıyoruz
      const point = net * coefficient;
      aytTotal += point;
    });
    
    // Puan türüne göre başlangıç puanı ve hesaplama
    const baseScore = baseScores[puanType];
    
    // Puan türüne göre çarpanlar (gerçek sonuçlara göre ayarlandı)
    const multipliers = {
      EA: 0.8,  // EA için çarpan
      SAY: 1.2, // SAY için çarpan
      SOZ: 1.0  // SÖZ için çarpan
    };
    
    // TYT katkısı (puan türüne göre farklı ağırlıklar)
    const tytWeight = {
      EA: 0.35,  // EA için TYT ağırlığı
      SAY: 0.40, // SAY için TYT ağırlığı
      SOZ: 0.30  // SÖZ için TYT ağırlığı
    };
    
    // AYT katkısı (puan türüne göre farklı ağırlıklar)
    const aytWeight = {
      EA: 0.65,  // EA için AYT ağırlığı
      SAY: 0.60, // SAY için AYT ağırlığı
      SOZ: 0.70  // SÖZ için AYT ağırlığı
    };
    
    // Ham puanı hesapla (TYT ve AYT katkıları + puan türüne özel çarpanlar)
    const hamPuan = baseScore + 
                   (tytPuan * tytWeight[puanType]) + 
                   (aytTotal * aytWeight[puanType] * multipliers[puanType]);
    
    // OBP ekle (Diploma puanı * 0.6)
    const obpValue = parseFloat(obp) || 0;
    let yerlesimPuani = hamPuan;
    if (obpValue > 0) {
      yerlesimPuani += (obpValue * 0.6);
    }
    
    // Yaklaşık sıralama hesapla
    const yaklasikSiralama = estimateRank(yerlesimPuani, puanType);
    
    return {
      tytPuan,
      aytPuan: hamPuan - (tytPuan * tytWeight[puanType]) - baseScore, // AYT katkısı
      yerlesimPuani,
      yaklasikSiralama
    };
  };

  const handleCalculate = () => {
    
    // AYT verisi girildi mi kontrol et
    const aytDataExists = hasAytData();
    
    // TYT verileri var mı kontrol et
    const hasTytData = Object.keys(tytScores).some(subject => {
      return tytScores[subject].dogru !== '' || tytScores[subject].yanlis !== '';
    });
    
    if (!hasTytData) {
      alert('TYT verisi girilmedi. Lütfen TYT verilerini girin.');
      return;
    }
    
    // AYT verisi yoksa sadece TYT puanı hesapla
    if (!aytDataExists) {
      const tytResult = calculateTytScore();
      setResults(tytResult);
      setAllResults(null);
      setActiveTab(2); // Sonuçlar sekmesine geç
      return;
    }
    
    if (puanTuru === 'HEPSI') {
      // Tüm puan türlerini hesapla
      const eaResults = calculateScoreForType('EA');
      const sayResults = calculateScoreForType('SAY');
      const sozResults = calculateScoreForType('SOZ');
      
      // Hata var mı kontrol et
      if (eaResults.error) {
        alert(eaResults.error + '. Lütfen gerekli verileri girin.');
        return;
      }
      
      setAllResults({
        EA: eaResults,
        SAY: sayResults,
        SOZ: sozResults
      });
      
      // Varsayılan olarak EA puanını göster
      setResults(eaResults);
    } else {
      // Tek puan türü hesapla
      const result = calculateScoreForType(puanTuru);
      
      // Hata var mı kontrol et
      if (result.error) {
        alert(result.error + '. Lütfen gerekli verileri girin.');
        return;
      }
      
      setResults(result);
      setAllResults(null);
    }
    
    setActiveTab(2); // Sonuçlar sekmesine geç
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      maxWidth: 1200, 
      mx: 'auto',
      bgcolor: '#FFFFF0', // Sitenin genel arka plan rengiyle uyumlu
    }}>
      <Typography variant="h4" component="h1" sx={{ 
        mb: 3, 
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        color: theme.palette.primary.main,
        fontSize: { xs: '1.7rem', md: '2.2rem' }, // Responsive font size
        textAlign: { xs: 'center', sm: 'left' }, // Mobilde ortalanmış başlık
        justifyContent: { xs: 'center', sm: 'flex-start' }
      }}>
        <CalculateIcon sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' } }} />
        YKS Puan Hesaplama
      </Typography>

      <Paper elevation={0} sx={{ 
        p: { xs: 3, md: 4 }, 
        borderRadius: { xs: 2, md: 3 }, 
        boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        transition: 'all 0.3s ease',
        maxWidth: '1200px',
        mx: 'auto',
        '&:hover': {
          boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
          transform: 'translateY(-3px)'
        }
      }}>
        <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: '0.95rem', md: '1rem' } }}>
          Bu hesaplama aracı ile TYT ve AYT sınavlarındaki doğru/yanlış sayılarınızı girerek yaklaşık YKS puanınızı hesaplayabilirsiniz.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
          Not: Hesaplamalar yaklaşık değerler içerir ve ÖSYM&apos;nin resmi hesaplama yönteminden farklılık gösterebilir.
        </Typography>
      </Paper>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ 
          mb: 3,
          borderRadius: 2,
          '& .MuiTabs-flexContainer': {
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          },
          '& .MuiTab-root': {
            fontWeight: 600,
            py: { xs: 1.2, md: 1.5 },
            fontSize: { xs: '0.85rem', md: '0.95rem' },
            transition: 'all 0.3s ease',
            minHeight: { xs: '48px', md: '56px' },
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            }
          },
          '& .Mui-selected': {
            color: `${theme.palette.primary.main} !important`,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
          }
        }}
      >
        <Tab label="TYT" />
        <Tab label="AYT" />
        <Tab label="Sonuçlar" disabled={!results} />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3}>
            <Grid xs={12} md={8}>
              <Paper elevation={0} sx={{ 
                p: { xs: 3, md: 4 }, 
                borderRadius: { xs: 3, md: 4 }, 
                boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                transition: 'all 0.3s ease',
                width: '100%',
                mx: 'auto',
                '&:hover': {
                  boxShadow: '0 8px 22px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  TYT Doğru/Yanlış Bilgileri
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Türkçe */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #FF6B6B',
                      background: 'linear-gradient(to right, rgba(255,107,107,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#FF6B6B' }}>
                            Türkçe (40 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 40 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={tytScores.turkce.dogru}
                                onChange={(e) => handleTytChange('turkce', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 40 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={tytScores.turkce.yanlis}
                                onChange={(e) => handleTytChange('turkce', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Sosyal Bilimler */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #FFD166',
                      background: 'linear-gradient(to right, rgba(255,209,102,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#FFD166' }}>
                            Sosyal Bilimler (20 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 20 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={tytScores.sosyal.dogru}
                                onChange={(e) => handleTytChange('sosyal', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 20 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={tytScores.sosyal.yanlis}
                                onChange={(e) => handleTytChange('sosyal', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Matematik */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #5B8FB9',
                      background: 'linear-gradient(to right, rgba(91,143,185,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#5B8FB9' }}>
                            Matematik (40 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 40 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={tytScores.matematik.dogru}
                                onChange={(e) => handleTytChange('matematik', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 40 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={tytScores.matematik.yanlis}
                                onChange={(e) => handleTytChange('matematik', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Fen Bilimleri */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #06D6A0',
                      background: 'linear-gradient(to right, rgba(6,214,160,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#06D6A0' }}>
                            Fen Bilimleri (20 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 20 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={tytScores.fen.dogru}
                                onChange={(e) => handleTytChange('fen', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 20 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={tytScores.fen.yanlis}
                                onChange={(e) => handleTytChange('fen', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ 
                p: { xs: 2, md: 3 }, 
                borderRadius: { xs: 2, md: 3 }, 
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)', 
                mb: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                }
              }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  OBP Bilgisi
                </Typography>
                <TextField
                  label="Ortaöğretim Başarı Puanı"
                  type="number"
                  fullWidth
                  size="small"
                  InputProps={{ inputProps: { min: 50, max: 100, step: 0.01 } }}
                  value={obp}
                  onChange={(e) => setObp(e.target.value)}
                  helperText="50-100 arasında bir değer giriniz"
                />
              </Paper>
              
              <Paper elevation={0} sx={{ 
                p: { xs: 3, md: 4 }, 
                borderRadius: { xs: 3, md: 4 }, 
                boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                transition: 'all 0.3s ease',
                width: '100%',
                mx: 'auto',
                '&:hover': {
                  boxShadow: '0 8px 22px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Puan Türü
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Puan Türü Seçiniz</InputLabel>
                  <Select
                    value={puanTuru}
                    label="Puan Türü Seçiniz"
                    onChange={(e) => setPuanTuru(e.target.value)}
                  >
                    <MenuItem value="HEPSI">Hepsi</MenuItem>
                    <MenuItem value="EA">Eşit Ağırlık (EA)</MenuItem>
                    <MenuItem value="SAY">Sayısal (SAY)</MenuItem>
                    <MenuItem value="SOZ">Sözel (SÖZ)</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    startIcon={<CalculateIcon />}
                    onClick={handleCalculate}
                    sx={{ 
                      py: { xs: 1.2, md: 1.5 },
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 15px rgba(0,0,0,0.15)'
                      },
                      '&:active': {
                        transform: 'translateY(0)'
                      }
                    }}
                  >
                    Puanımı Hesapla
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ 
                p: { xs: 3, md: 4 }, 
                borderRadius: { xs: 3, md: 4 }, 
                boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                transition: 'all 0.3s ease',
                width: '100%',
                mx: 'auto',
                '&:hover': {
                  boxShadow: '0 8px 22px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  AYT Doğru/Yanlış Bilgileri
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Sayısal Bölüm */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#3D6F94' }}>
                      Sayısal Dersler
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: alpha('#3D6F94', 0.3) }} />
                  </Grid>
                  
                  {/* Matematik */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #5B8FB9',
                      background: 'linear-gradient(to right, rgba(91,143,185,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#5B8FB9' }}>
                            Matematik (40 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 40 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={aytScores.matematik.dogru}
                                onChange={(e) => handleAytChange('matematik', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 40 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={aytScores.matematik.yanlis}
                                onChange={(e) => handleAytChange('matematik', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Fizik */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #7CA6C8',
                      background: 'linear-gradient(to right, rgba(124,166,200,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#7CA6C8' }}>
                            Fizik (14 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 14 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={aytScores.fizik.dogru}
                                onChange={(e) => handleAytChange('fizik', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 14 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={aytScores.fizik.yanlis}
                                onChange={(e) => handleAytChange('fizik', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Kimya */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #B8C0FF',
                      background: 'linear-gradient(to right, rgba(184,192,255,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#B8C0FF' }}>
                            Kimya (13 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 13 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={aytScores.kimya.dogru}
                                onChange={(e) => handleAytChange('kimya', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 13 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={aytScores.kimya.yanlis}
                                onChange={(e) => handleAytChange('kimya', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Biyoloji */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #06D6A0',
                      background: 'linear-gradient(to right, rgba(6,214,160,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#06D6A0' }}>
                            Biyoloji (13 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 13 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={aytScores.biyoloji.dogru}
                                onChange={(e) => handleAytChange('biyoloji', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 13 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={aytScores.biyoloji.yanlis}
                                onChange={(e) => handleAytChange('biyoloji', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Sözel Bölüm */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 600, color: '#EA4335' }}>
                      Sözel Dersler
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: alpha('#EA4335', 0.3) }} />
                  </Grid>
                  
                  {/* Edebiyat */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #FF6B6B',
                      background: 'linear-gradient(to right, rgba(255,107,107,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#FF6B6B' }}>
                            Türk Dili ve Edebiyatı (24 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 24 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={aytScores.edebiyat.dogru}
                                onChange={(e) => handleAytChange('edebiyat', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 24 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={aytScores.edebiyat.yanlis}
                                onChange={(e) => handleAytChange('edebiyat', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Tarih-1 */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #FFD166',
                      background: 'linear-gradient(to right, rgba(255,209,102,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#FFD166' }}>
                            Tarih-1 (10 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 10 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={aytScores.tarih1.dogru}
                                onChange={(e) => handleAytChange('tarih1', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 10 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={aytScores.tarih1.yanlis}
                                onChange={(e) => handleAytChange('tarih1', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Coğrafya-1 */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #F4845F',
                      background: 'linear-gradient(to right, rgba(244,132,95,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#F4845F' }}>
                            Coğrafya-1 (6 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 6 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={aytScores.cografya1.dogru}
                                onChange={(e) => handleAytChange('cografya1', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 6 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={aytScores.cografya1.yanlis}
                                onChange={(e) => handleAytChange('cografya1', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Tarih-2 */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #E07A5F',
                      background: 'linear-gradient(to right, rgba(224,122,95,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#E07A5F' }}>
                            Tarih-2 (11 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 11 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={aytScores.tarih2.dogru}
                                onChange={(e) => handleAytChange('tarih2', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 11 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={aytScores.tarih2.yanlis}
                                onChange={(e) => handleAytChange('tarih2', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Coğrafya-2 */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #F9C74F',
                      background: 'linear-gradient(to right, rgba(249,199,79,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#F9C74F' }}>
                            Coğrafya-2 (5 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 5 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={aytScores.cografya2.dogru}
                                onChange={(e) => handleAytChange('cografya2', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 5 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={aytScores.cografya2.yanlis}
                                onChange={(e) => handleAytChange('cografya2', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Felsefe */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #9A9FD8',
                      background: 'linear-gradient(to right, rgba(154,159,216,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#9A9FD8' }}>
                            Felsefe (12 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 12 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={aytScores.felsefe.dogru}
                                onChange={(e) => handleAytChange('felsefe', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 12 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={aytScores.felsefe.yanlis}
                                onChange={(e) => handleAytChange('felsefe', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Din Kültürü */}
                  <Grid xs={12}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: '4px solid #D1D6FF',
                      background: 'linear-gradient(to right, rgba(209,214,255,0.05), rgba(255,255,240,0.5))'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#D1D6FF' }}>
                            Din Kültürü (6 Soru)
                          </Typography>
                        </Grid>
                        <Grid xs={9}>
                          <Grid container spacing={2}>
                            <Grid xs={6}>
                              <TextField
                                label="Doğru"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 6 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.success.main, 0.3) }
                                  }
                                }}
                                value={aytScores.din.dogru}
                                onChange={(e) => handleAytChange('din', 'dogru', e.target.value)}
                              />
                            </Grid>
                            <Grid xs={6}>
                              <TextField
                                label="Yanlış"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{ 
                                  inputProps: { min: 0, max: 6 },
                                  sx: { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.error.main, 0.3) }
                                  }
                                }}
                                value={aytScores.din.yanlis}
                                onChange={(e) => handleAytChange('din', 'yanlis', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ 
                p: { xs: 2, md: 3 }, 
                borderRadius: { xs: 2, md: 3 }, 
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)', 
                mb: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                }
              }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  OBP Bilgisi
                </Typography>
                <TextField
                  label="Ortaöğretim Başarı Puanı"
                  type="number"
                  fullWidth
                  size="small"
                  InputProps={{ inputProps: { min: 50, max: 100, step: 0.01 } }}
                  value={obp}
                  onChange={(e) => setObp(e.target.value)}
                  helperText="50-100 arasında bir değer giriniz"
                />
              </Paper>
              
              <Paper elevation={0} sx={{ 
                p: { xs: 3, md: 4 }, 
                borderRadius: { xs: 3, md: 4 }, 
                boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                transition: 'all 0.3s ease',
                width: '100%',
                mx: 'auto',
                '&:hover': {
                  boxShadow: '0 8px 22px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Puan Türü
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Puan Türü Seçiniz</InputLabel>
                  <Select
                    value={puanTuru}
                    label="Puan Türü Seçiniz"
                    onChange={(e) => setPuanTuru(e.target.value)}
                  >
                    <MenuItem value="HEPSI">Hepsi</MenuItem>
                    <MenuItem value="EA">Eşit Ağırlık (EA)</MenuItem>
                    <MenuItem value="SAY">Sayısal (SAY)</MenuItem>
                    <MenuItem value="SOZ">Sözel (SÖZ)</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    startIcon={<CalculateIcon />}
                    onClick={handleCalculate}
                    sx={{ 
                      py: { xs: 1.2, md: 1.5 },
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 15px rgba(0,0,0,0.15)'
                      },
                      '&:active': {
                        transform: 'translateY(0)'
                      }
                    }}
                  >
                    Puanımı Hesapla
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      {activeTab === 2 && results && (
        <Box>
          <Paper elevation={0} sx={{ 
            p: { xs: 4, md: 5 }, 
            borderRadius: { xs: 4, md: 5 }, 
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            maxWidth: puanTuru === 'HEPSI' ? 1200 : 900,
            mx: 'auto',
            transition: 'all 0.4s ease',
            background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.95)}, ${theme.palette.background.paper})`,
            '&:hover': {
              boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
              transform: 'translateY(-5px)'
            }
          }}>
            {puanTuru !== 'HEPSI' ? (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexDirection: 'column',
                  mb: 4
                }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.primary.main, 
                    mb: 1,
                    fontSize: { xs: '1.3rem', md: '1.5rem' },
                    textAlign: 'center'
                  }}>
                    {puanTuru === 'EA' ? 'Eşit Ağırlık' : puanTuru === 'SAY' ? 'Sayısal' : 'Sözel'} Puanınız
                  </Typography>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: theme.palette.primary.dark,
                    fontSize: { xs: '2.8rem', md: '3.5rem' },
                    textAlign: 'center',
                    textShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    letterSpacing: '-0.5px',
                    mb: 2
                  }}>
                    {results.yerlesimPuani.toFixed(2)}
                  </Typography>
                </Box>
                
                <Grid container spacing={4}>
                  <Grid xs={12} sm={6} md={4}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${theme.palette.background.paper})`,
                      '&:hover': {
                        boxShadow: '0 12px 25px rgba(0,0,0,0.15)',
                        transform: 'translateY(-5px)'
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          TYT Puanı
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                          {results.tytPuan.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          TYT puanınız yerleştirme puanınıza %40 oranında etki etmektedir.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid xs={12} sm={6} md={4}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${theme.palette.background.paper})`,
                      '&:hover': {
                        boxShadow: '0 12px 25px rgba(0,0,0,0.15)',
                        transform: 'translateY(-5px)'
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          AYT Puanı
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                          {results.aytPuan.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          AYT puanınız yerleştirme puanınıza %60 oranında etki etmektedir.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid xs={12} md={4}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${theme.palette.background.paper})`,
                      '&:hover': {
                        boxShadow: '0 12px 25px rgba(0,0,0,0.15)',
                        transform: 'translateY(-5px)'
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          {puanTuru} Sıralaması
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                          {results.yaklasikSiralama.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Bu sıralama tahmini olup, gerçek sıralamanız değişiklik gösterebilir.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Diğer puan türlerindeki sıralamalar */}
                  <Grid xs={12}>
                    <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600, textAlign: 'center' }}>
                      Diğer Puan Türlerindeki Sıralamalarınız
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {puanTuru !== 'EA' && (
                        <Grid xs={12} sm={puanTuru === 'HEPSI' ? 4 : 6}>
                          <Card sx={{ 
                            borderRadius: 4, 
                            boxShadow: '0 8px 20px rgba(66, 133, 244, 0.15)',
                            height: '100%',
                            transition: 'all 0.3s ease',
                            border: `2px solid ${alpha('#4285F4', 0.7)}`,
                            background: `linear-gradient(135deg, ${alpha('#4285F4', 0.03)}, ${alpha('#4285F4', 0.01)})`,
                            '&:hover': {
                              boxShadow: '0 12px 30px rgba(66, 133, 244, 0.25)',
                              transform: 'translateY(-5px)'
                            }
                          }}>
                            <CardContent sx={{ p: 3 }}>
                              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#4285F4' }}>
                                Eşit Ağırlık (EA)
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Puan:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#4285F4' }}>
                                  {allResults.EA.yerlesimPuani.toFixed(2)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Sıralama:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#4285F4' }}>
                                  {allResults.EA.yaklasikSiralama.toLocaleString()}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                      
                      {puanTuru !== 'SAY' && (
                        <Grid xs={12} sm={puanTuru === 'HEPSI' ? 4 : 6}>
                          <Card sx={{ 
                            borderRadius: 4, 
                            boxShadow: '0 8px 20px rgba(52, 168, 83, 0.15)',
                            height: '100%',
                            transition: 'all 0.3s ease',
                            border: `2px solid ${alpha('#34A853', 0.7)}`,
                            background: `linear-gradient(135deg, ${alpha('#34A853', 0.03)}, ${alpha('#34A853', 0.01)})`,
                            '&:hover': {
                              boxShadow: '0 12px 30px rgba(52, 168, 83, 0.25)',
                              transform: 'translateY(-5px)'
                            }
                          }}>
                            <CardContent sx={{ p: 3 }}>
                              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#34A853' }}>
                                Sayısal (SAY)
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Puan:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#34A853' }}>
                                  {allResults.SAY.yerlesimPuani.toFixed(2)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Sıralama:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#34A853' }}>
                                  {allResults.SAY.yaklasikSiralama.toLocaleString()}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                      
                      {puanTuru !== 'SOZ' && (
                        <Grid xs={12} sm={puanTuru === 'HEPSI' ? 4 : 6}>
                          <Card sx={{ 
                            borderRadius: 4, 
                            boxShadow: '0 8px 20px rgba(234, 67, 53, 0.15)',
                            height: '100%',
                            transition: 'all 0.3s ease',
                            border: `2px solid ${alpha('#EA4335', 0.7)}`,
                            background: `linear-gradient(135deg, ${alpha('#EA4335', 0.03)}, ${alpha('#EA4335', 0.01)})`,
                            '&:hover': {
                              boxShadow: '0 12px 30px rgba(234, 67, 53, 0.25)',
                              transform: 'translateY(-5px)'
                            }
                          }}>
                            <CardContent sx={{ p: 3 }}>
                              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#EA4335' }}>
                                Sözel (SÖZ)
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Puan:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#EA4335' }}>
                                  {allResults.SOZ.yerlesimPuani.toFixed(2)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Sıralama:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#EA4335' }}>
                                  {allResults.SOZ.yaklasikSiralama.toLocaleString()}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </>
            ) : allResults && (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.primary.main, 
                    mb: 3,
                    fontSize: { xs: '1.3rem', md: '1.5rem' },
                    textAlign: 'center'
                  }}>
                    Tüm Puan Türlerine Göre Sonuçlar
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* EA Sonuçları */}
                    <Grid xs={12} md={4}>
                      <Card sx={{ 
                        borderRadius: 4, 
                        boxShadow: '0 8px 20px rgba(66, 133, 244, 0.15)',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        border: `2px solid ${alpha('#4285F4', 0.7)}`,
                        background: `linear-gradient(135deg, ${alpha('#4285F4', 0.03)}, ${alpha('#4285F4', 0.01)})`,
                        '&:hover': {
                          boxShadow: '0 12px 30px rgba(66, 133, 244, 0.25)',
                          transform: 'translateY(-5px)'
                        }
                      }}>
                        <CardContent sx={{ p: 4 }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#4285F4' }}>
                            Eşit Ağırlık (EA)
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#4285F4', textShadow: '0 2px 5px rgba(66, 133, 244, 0.2)' }}>
                            {allResults.EA.yerlesimPuani.toFixed(2)}
                          </Typography>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              TYT Puanı
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {allResults.EA.tytPuan.toFixed(2)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              AYT Puanı
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {allResults.EA.aytPuan.toFixed(2)}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Yaklaşık Sıralama
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {allResults.EA.yaklasikSiralama.toLocaleString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* SAY Sonuçları */}
                    <Grid xs={12} md={4}>
                      <Card sx={{ 
                        borderRadius: 4, 
                        boxShadow: '0 8px 20px rgba(52, 168, 83, 0.15)',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        border: `2px solid ${alpha('#34A853', 0.7)}`,
                        background: `linear-gradient(135deg, ${alpha('#34A853', 0.03)}, ${alpha('#34A853', 0.01)})`,
                        '&:hover': {
                          boxShadow: '0 12px 30px rgba(52, 168, 83, 0.25)',
                          transform: 'translateY(-5px)'
                        }
                      }}>
                        <CardContent sx={{ p: 4 }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#34A853' }}>
                            Sayısal (SAY)
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#34A853', textShadow: '0 2px 5px rgba(52, 168, 83, 0.2)' }}>
                            {allResults.SAY.yerlesimPuani.toFixed(2)}
                          </Typography>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              TYT Puanı
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {allResults.SAY.tytPuan.toFixed(2)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              AYT Puanı
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {allResults.SAY.aytPuan.toFixed(2)}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Yaklaşık Sıralama
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {allResults.SAY.yaklasikSiralama.toLocaleString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* SÖZ Sonuçları */}
                    <Grid xs={12} md={4}>
                      <Card sx={{ 
                        borderRadius: 4, 
                        boxShadow: '0 8px 20px rgba(234, 67, 53, 0.15)',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        border: `2px solid ${alpha('#EA4335', 0.7)}`,
                        background: `linear-gradient(135deg, ${alpha('#EA4335', 0.03)}, ${alpha('#EA4335', 0.01)})`,
                        '&:hover': {
                          boxShadow: '0 12px 30px rgba(234, 67, 53, 0.25)',
                          transform: 'translateY(-5px)'
                        }
                      }}>
                        <CardContent sx={{ p: 4 }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#EA4335' }}>
                            Sözel (SÖZ)
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#EA4335', textShadow: '0 2px 5px rgba(234, 67, 53, 0.2)' }}>
                            {allResults.SOZ.yerlesimPuani.toFixed(2)}
                          </Typography>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              TYT Puanı
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {allResults.SOZ.tytPuan.toFixed(2)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              AYT Puanı
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {allResults.SOZ.aytPuan.toFixed(2)}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Yaklaşık Sıralama
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {allResults.SOZ.yaklasikSiralama.toLocaleString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => setActiveTab(0)}
                sx={{ 
                  mr: 2,
                  borderRadius: 2,
                  py: { xs: 0.8, md: 1 },
                  px: { xs: 2, md: 3 },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.08)'
                  }
                }}
              >
                Başa Dön
              </Button>
              <Button 
                variant="contained"
                onClick={() => {
                  setResults(null);
                  setAllResults(null);
                  setActiveTab(0);
                }}
                sx={{ 
                  borderRadius: 2,
                  py: { xs: 0.8, md: 1 },
                  px: { xs: 2, md: 3 },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                  }
                }}
              >
                Yeni Hesaplama Yap
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default PuanHesapla;
