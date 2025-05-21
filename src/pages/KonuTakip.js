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
  Tab,
  Tabs,
  Card,
  Paper,
  LinearProgress,
  Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScienceIcon from '@mui/icons-material/Science';
import SaveIcon from '@mui/icons-material/Save';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FunctionsIcon from '@mui/icons-material/Functions';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import BiotechIcon from '@mui/icons-material/Biotech';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import PublicIcon from '@mui/icons-material/Public';
import PsychologyAltIcon from '@mui/icons-material/Psychology';
import TranslateIcon from '@mui/icons-material/Translate';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Ders ve konu verileri
const dersler = [
  // TYT Dersleri
  {
    id: 'turkce',
    ad: 'Türkçe',
    color: '#9C27B0',
    type: 'TYT',
    konular: [
      'Ses Bilgisi',
      'Yazım Kuralları',
      'Noktalama İşaretleri',
      'Sözcük Yapısı',
      'Sözcük Türleri',
      'Fiilimsiler',
      'Cümlenin Ögeleri',
      'Cümle Türleri',
      'Anlatım Bozuklukları'
    ]
  },
  {
    id: 'temel-matematik',
    ad: 'Temel Matematik',
    color: '#4285F4',
    type: 'TYT',
    konular: [
      'Temel Kavramlar',
      'Sayı Basamakları',
      'Bölme ve Bölünebilme',
      'EBOB-EKOK',
      'Rasyonel Sayılar',
      'Basit Eşitsizlikler',
      'Mutlak Değer',
      'Üslü Sayılar',
      'Köklü Sayılar',
      'Çarpanlara Ayırma',
      'Oran-Orantı',
      'Denklem Çözme',
      'Problemler'
    ]
  },
  {
    id: 'geometri-tyt',
    ad: 'Geometri',
    color: '#EA4335',
    type: 'TYT',
    konular: [
      'Doğruda Açılar',
      'Üçgende Açılar',
      'Özel Üçgenler',
      'Dik Üçgen',
      'İkizkenar Üçgen',
      'Eşkenar Üçgen',
      'Açıortay',
      'Kenarortay',
      'Üçgende Alan',
      'Dörtgenler',
      'Paralelkenar',
      'Eşkenar Dörtgen',
      'Dikdörtgen',
      'Kare',
      'Yamuk',
      'Deltoid'
    ]
  },
  {
    id: 'fizik-tyt',
    ad: 'Fizik',
    color: '#FBBC05',
    type: 'TYT',
    konular: [
      'Fizik Bilimine Giriş',
      'Madde ve Özellikleri',
      'Sıvıların Kaldırma Kuvveti',
      'Basınç',
      'Isı, Sıcaklık ve Genleşme',
      'Hareket',
      'Kuvvet',
      'Dinamik',
      'İş, Güç ve Enerji',
      'Elektrik'
    ]
  },
  {
    id: 'kimya-tyt',
    ad: 'Kimya',
    color: '#34A853',
    type: 'TYT',
    konular: [
      'Kimya Bilimi',
      'Atom ve Yapısı',
      'Periyodik Sistem',
      'Kimyasal Türler Arası Etkileşimler',
      'Kimyasal Tepkimeler',
      'Kimyasal Hesaplamalar',
      'Karışımlar',
      'Asit, Baz ve Tuzlar'
    ]
  },
  {
    id: 'biyoloji-tyt',
    ad: 'Biyoloji',
    color: '#FF9800',
    type: 'TYT',
    konular: [
      'Biyoloji Bilimi',
      'Canlıların Ortak Özellikleri',
      'Canlıların Temel Bileşenleri',
      'Hücre ve Yapısı',
      'Hücre Zarından Madde Geçişleri',
      'Canlıların Sınıflandırılması',
      'Mitoz ve Eşeysiz Üreme',
      'Mayoz ve Eşeyli Üreme',
      'Kalıtım'
    ]
  },
  {
    id: 'tarih-tyt',
    ad: 'Tarih',
    color: '#00BCD4',
    type: 'TYT',
    konular: [
      'Tarih Bilimi',
      'İlk Uygarlıklar',
      'İlk Türk Devletleri',
      'İslamiyet Öncesi Türk Tarihi',
      'İslamiyet Sonrası Türk Tarihi',
      'Türkiye Tarihi',
      'Osmanlı Devleti Kuruluş Dönemi',
      'Osmanlı Devleti Yükselme Dönemi',
      'Osmanlı Devleti Duraklama Dönemi',
      'Osmanlı Devleti Gerileme Dönemi',
      'Osmanlı Devleti Dağılma Dönemi',
      'I. Dünya Savaşı',
      'Kurtuluş Savaşı'
    ]
  },
  {
    id: 'cografya-tyt',
    ad: 'Coğrafya',
    color: '#4CAF50',
    type: 'TYT',
    konular: [
      'Doğa ve İnsan',
      'Dünyanın Şekli ve Hareketleri',
      'Harita Bilgisi',
      'Atmosfer ve Sıcaklık',
      'İklimler',
      'Basınç ve Rüzgarlar',
      'Nem, Yağış ve Buharlaşma',
      'İç Kuvvetler / Dış Kuvvetler',
      'Su - Toprak ve Bitkiler',
      'Nüfus',
      'Göç',
      'Yerleşme',
      'Türkiyenin Yer Şekilleri'
    ]
  },
  {
    id: 'felsefe-tyt',
    ad: 'Felsefe',
    color: '#795548',
    type: 'TYT',
    konular: [
      'Felsefenin Konusu',
      'Bilgi Felsefesi',
      'Varlık Felsefesi',
      'Ahlak Felsefesi'
    ]
  },
  // AYT Dersleri
  {
    id: 'matematik-ayt',
    ad: 'Matematik',
    color: '#4285F4',
    type: 'AYT',
    konular: [
      'Kümeler',
      'Kartezyen Çarpım',
      'Fonksiyonlar',
      'Polinomlar',
      'Permütasyon',
      'Kombinasyon',
      'Binom',
      'Olasılık',
      'İstatistik',
      'Karmaşık Sayılar',
      'İkinci Dereceden Denklemler',
      'Parabol',
      'Logaritma',
      'Diziler',
      'Limit',
      'Türev',
      'İntegral'
    ]
  },
  {
    id: 'geometri-ayt',
    ad: 'Geometri',
    color: '#EA4335',
    type: 'AYT',
    konular: [
      'Doğrunun Analitik İncelenmesi',
      'Çemberin Analitik İncelenmesi',
      'Dönüşümler',
      'Katı Cisimler',
      'Uzay Geometri',
      'Çember ve Daire',
      'Trigonometri'
    ]
  },
  {
    id: 'fizik-ayt',
    ad: 'Fizik',
    color: '#FBBC05',
    type: 'AYT',
    konular: [
      'Manyetizma',
      'Dalgalar',
      'Optik',
      'Modern Fizik',
      'Atom Fiziği',
      'Nükleer Fizik',
      'Elektromanyetik İndüksiyon',
      'Alternatif Akım',
      'Kuantum Fiziği',
      'Görelilik'
    ]
  },
  {
    id: 'kimya-ayt',
    ad: 'Kimya',
    color: '#34A853',
    type: 'AYT',
    konular: [
      'Maddenin Halleri',
      'Gazlar',
      'Çözeltiler',
      'Kimya ve Enerji',
      'Kimyasal Tepkimelerde Hız',
      'Kimyasal Tepkimelerde Denge',
      'Asit-Baz Dengesi',
      'Çözünürlük Dengesi',
      'Elektrokimya',
      'Organik Kimyaya Giriş',
      'Hidrokarbonlar',
      'Organik Bileşikler',
      'Endüstride Organik Bileşikler'
    ]
  },
  {
    id: 'biyoloji-ayt',
    ad: 'Biyoloji',
    color: '#FF9800',
    type: 'AYT',
    konular: [
      'Sinir Sistemi',
      'Endokrin Sistem',
      'Duyu Organları',
      'Destek ve Hareket Sistemi',
      'Sindirim Sistemi',
      'Dolaşım ve Bağışıklık Sistemi',
      'Solunum Sistemi',
      'Boşaltım Sistemi',
      'Üreme Sistemi ve Embriyonik Gelişim',
      'Bitki Biyolojisi',
      'Genetik Mühendisliği',
      'Biyoteknoloji'
    ]
  },
  {
    id: 'edebiyat-ayt',
    ad: 'Edebiyat',
    color: '#E91E63',
    type: 'AYT',
    konular: [
      'Giriş (Edebiyat, Sanat, Metin)',
      'Şiir Bilgisi',
      'Öykü-Roman',
      'Tiyatro',
      'Destan-Efsane',
      'Masal-Fabl',
      'Halk Edebiyatı',
      'Divan Edebiyatı',
      'Tanzimat Edebiyatı',
      'Servet-i Fünun Edebiyatı',
      'Fecr-i Ati Edebiyatı',
      'Milli Edebiyat',
      'Cumhuriyet Dönemi Edebiyatı',
      'Cumhuriyet Dönemi Şiiri',
      'Cumhuriyet Dönemi Romanı',
      'Cumhuriyet Dönemi Tiyatrosu'
    ]
  },
  {
    id: 'cografya-ayt',
    ad: 'Coğrafya',
    color: '#4CAF50',
    type: 'AYT',
    konular: [
      'Doğal Sistemler',
      'Beşeri Sistemler',
      'Mekansal Sentez: Türkiye',
      'Küresel Ortam: Bölgeler ve Ülkeler',
      'Çevre ve Toplum',
      'Türkiyenin Fiziki Coğrafyası',
      'Türkiyenin Beşeri ve Ekonomik Coğrafyası',
      'Türkiyenin Bölgesel Coğrafyası',
      'Türkiyenin İklimi',
      'Türkiyenin Bitki Örtüsü',
      'Türkiyenin Nüfusu ve Yerleşmesi',
      'Ekonomik Faaliyetler',
      'Bölgesel Kalkınma Projeleri',
      'Uluslararası Ulaşım Hatları',
      'Türkiyenin Jeopolitik Konumu'
    ]
  },
  {
    id: 'tarih-2-ayt',
    ad: 'Tarih-2',
    color: '#00BCD4',
    type: 'AYT',
    konular: [
      'II. Dünya Savaşı',
      'Soğuk Savaş Dönemi',
      'Yumuşama Dönemi',
      'Küreselleşen Dünya',
      'Türkiye Cumhuriyeti Tarihi',
      'Atatürk İlkeleri',
      'Atatürk İnkılapları',
      'Türk İnkılabının Temel İlkeleri',
      'Cumhuriyet Dönemi Gelişmeleri',
      'Türkiye Ekonomisi',
      'Türk Dış Politikası'
    ]
  },
  {
    id: 'felsefe-ayt',
    ad: 'Felsefe',
    color: '#795548',
    type: 'AYT',
    konular: [
      'MÖ 6. Yüzyıl-MS 2. Yüzyıl Felsefesi',
      'MS 2. Yüzyıl-MS 15. Yüzyıl Felsefesi',
      '15. Yüzyıl-17. Yüzyıl Felsefesi',
      '18. Yüzyıl-19. Yüzyıl Felsefesi',
      '20. Yüzyıl Felsefesi',
      'Bilgi Felsefesi',
      'Varlık Felsefesi',
      'Ahlak Felsefesi',
      'Sanat Felsefesi',
      'Din Felsefesi',
      'Siyaset Felsefesi',
      'Bilim Felsefesi'
    ]
  },
  {
    id: 'yabanci-dil-ayt',
    ad: 'Yabancı Dil',
    color: '#9E9E9E',
    type: 'AYT',
    konular: [
      'Kelime Bilgisi',
      'Dil Bilgisi',
      'Cümle Tamamlama',
      'Paragraf',
      'Diyalog Tamamlama',
      'Çeviri',
      'Okuma Parçası'
    ]
  },
  {
    id: 'yabanci-dil-tyt',
    ad: 'Yabancı Dil',
    color: '#9C27B0',
    type: 'TYT',
    konular: [
      'Kelime Bilgisi',
      'Dil Bilgisi',
      'Cümle Tamamlama',
      'Cümlede Anlam',
      'Paragraf',
      'Diyalog Tamamlama',
      'Anlam Bütünlüğünü Bozan Cümleyi Bulma',
      'Verilen Durumda Söylenecek İfade'
    ]
  }
];

const KonuTakip = () => {
  const [user] = useAuthState(auth);
  const [selectedDers, setSelectedDers] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [konuDurumu, setKonuDurumu] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'inProgress'
  const [sinavTipi, setSinavTipi] = useState('TYT'); // 'TYT' veya 'AYT'

  useEffect(() => {
    if (user) {
      const fetchKonuDurumu = async () => {
        try {
          setLoading(true);
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
        } finally {
          setLoading(false);
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

  const getDersIcon = (dersAdi) => {
    switch(dersAdi.toLowerCase()) {
      case 'türkçe': return <MenuBookIcon />;
      case 'temel matematik': return <FunctionsIcon />;
      case 'geometri': return <SquareFootIcon />;
      case 'fizik': return <ScienceIcon />;
      case 'kimya': return <BiotechIcon />;
      case 'biyoloji': return <BiotechIcon />;
      case 'tarih': return <HistoryEduIcon />;
      case 'coğrafya': return <PublicIcon />;
      case 'felsefe': return <PsychologyAltIcon />;
      case 'din kültürü': return <AutoStoriesIcon />;
      case 'yabancı dil': return <TranslateIcon />;
      default: return <MenuBookIcon />;
    }
  };

  const getKonuIlerleme = (dersId) => {
    if (!konuDurumu[dersId]) return 0;
    
    const ders = dersler.find(d => d.id === dersId);
    if (!ders) return 0;
    
    const tamamlananKonuSayisi = Object.values(konuDurumu[dersId]).filter(
      durum => durum === 'completed' || durum === 'completedNeedsReview'
    ).length;
    return (tamamlananKonuSayisi / ders.konular.length) * 100;
  };

  const filteredDersler = dersler.filter(ders => ders.type === sinavTipi);

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Konu takibi yapabilmek için giriş yapmalısınız.
          </Typography>
          <Button 
            variant="contained" 
            href="/login"
            sx={{ bgcolor: '#5ec837', '&:hover': { bgcolor: '#4eb02c' } }}
          >
            Giriş Yap
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        textAlign: 'center', 
        mb: 5,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '4px',
          backgroundColor: '#5ec837',
          borderRadius: '2px'
        }
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 800,
          color: '#333',
          mb: 1,
          fontSize: { xs: '1.8rem', sm: '2.2rem' },
          textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
        }}>
          Konu Takip Sistemi
        </Typography>
        <Typography variant="subtitle1" sx={{ 
          color: '#666',
          fontWeight: 500
        }}>
          Çalışmalarınızı takip edin ve ilerlemenizi görün
        </Typography>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 4, 
        flexWrap: 'wrap', 
        alignItems: 'center',
        gap: 2,
        px: { xs: 1, sm: 2 }
      }}>
        <Box sx={{ 
          bgcolor: 'white', 
          borderRadius: 3, 
          overflow: 'hidden', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0'
        }}>
          <Tabs 
            value={sinavTipi} 
            onChange={(e, newValue) => setSinavTipi(newValue)}
            sx={{ 
              minHeight: 52,
              '& .MuiTabs-indicator': {
                backgroundColor: '#5ec837',
                height: 4,
                borderRadius: '4px 4px 0 0'
              },
              '& .MuiTab-root': {
                fontWeight: 700,
                minWidth: 120,
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: '#5ec837'
                }
              }
            }}
          >
            <Tab value="TYT" label="TYT" />
            <Tab value="AYT" label="AYT" />
          </Tabs>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 1.5,
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          width: { xs: '100%', sm: 'auto' },
          mt: { xs: 1, sm: 0 }
        }}>
          <Button
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
            size="medium"
            sx={{ 
              bgcolor: filter === 'all' ? '#5662f6' : 'transparent',
              color: filter === 'all' ? 'white' : '#5662f6',
              borderColor: '#5662f6',
              fontWeight: 600,
              minWidth: 100,
              borderRadius: 2,
              px: 2,
              '&:hover': {
                bgcolor: filter === 'all' ? '#4a53d6' : 'rgba(86, 98, 246, 0.08)',
                borderColor: '#4a53d6'
              }
            }}
          >
            Tümü
          </Button>
          <Button
            variant={filter === 'completed' ? 'contained' : 'outlined'}
            onClick={() => setFilter('completed')}
            size="medium"
            startIcon={<CheckCircleIcon />}
            sx={{ 
              bgcolor: filter === 'completed' ? '#4caf50' : 'transparent',
              color: filter === 'completed' ? 'white' : '#4caf50',
              borderColor: '#4caf50',
              fontWeight: 600,
              minWidth: 140,
              borderRadius: 2,
              px: 2,
              '&:hover': {
                bgcolor: filter === 'completed' ? '#43a047' : 'rgba(76, 175, 80, 0.08)',
                borderColor: '#43a047'
              }
            }}
          >
            Tamamlanan
          </Button>
          <Button
            variant={filter === 'inProgress' ? 'contained' : 'outlined'}
            onClick={() => setFilter('inProgress')}
            size="medium"
            startIcon={<AccessTimeIcon />}
            sx={{ 
              bgcolor: filter === 'inProgress' ? '#ff9800' : 'transparent',
              color: filter === 'inProgress' ? 'white' : '#ff9800',
              borderColor: '#ff9800',
              fontWeight: 600,
              minWidth: 140,
              borderRadius: 2,
              px: 2,
              '&:hover': {
                bgcolor: filter === 'inProgress' ? '#f57c00' : 'rgba(255, 152, 0, 0.08)',
                borderColor: '#f57c00'
              }
            }}
          >
            Devam Eden
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, px: 1 }}>
          {filteredDersler.map((ders) => {
            const ilerleme = getKonuIlerleme(ders.id);
            const durumFiltresi = filter === 'all' || 
              (filter === 'completed' && ilerleme === 100) || 
              (filter === 'inProgress' && ilerleme > 0 && ilerleme < 100);
            
            if (!durumFiltresi) return null;
            
            // Tamamlanan konu sayısı
            const tamamlananKonuSayisi = Math.round(ilerleme * ders.konular.length / 100);
            
            return (
              <Card
                key={ders.id}
                elevation={0}
                onClick={() => handleDersClick(ders)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: '16px',
                  background: '#ffffff',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  border: `1px solid ${ders.color}30`,
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: `0 15px 30px rgba(0,0,0,0.1), 0 8px 15px ${ders.color}30`
                  },
                  position: 'relative'
                }}
              >
                {/* Ders Başlık Bölümü */}
                <Box sx={{
                  background: ders.color,
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '30%',
                    height: '100%',
                    background: `linear-gradient(to right, transparent, ${ders.color}90)`,
                    zIndex: 1
                  }
                }}>
                  <Avatar
                    sx={{
                      bgcolor: '#ffffff',
                      color: ders.color,
                      width: 52,
                      height: 52,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      zIndex: 2,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'rotate(10deg) scale(1.1)'
                      }
                    }}
                  >
                    {getDersIcon(ders.ad)}
                  </Avatar>
                  <Typography 
                    variant="h6"
                    sx={{ 
                      fontWeight: 900, 
                      color: '#ffffff',
                      textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      zIndex: 2,
                      fontSize: '1.25rem',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {ders.ad}
                  </Typography>
                </Box>
                
                {/* İçerik Bölümü */}
                <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  {/* Konu Bilgisi */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1.5, 
                    borderRadius: '10px',
                    bgcolor: '#f8f9fa',
                    border: '1px solid #eaecef',
                    mb: 2.5
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormatListBulletedIcon sx={{ color: ders.color, mr: 1.5, fontSize: '1.2rem' }} />
                      <Typography sx={{ fontWeight: 700, color: '#495057', fontSize: '0.95rem' }}>
                        Toplam Konu
                      </Typography>
                    </Box>
                    <Typography sx={{ 
                      fontWeight: 800, 
                      color: ders.color, 
                      fontSize: '1.1rem',
                      bgcolor: `${ders.color}15`,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '30px'
                    }}>
                      {ders.konular.length}
                    </Typography>
                  </Box>
                  
                  {/* İlerleme Bölümü */}
                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mb: 1.5
                    }}>
                      <Typography sx={{ fontWeight: 600, color: '#495057', fontSize: '0.9rem' }}>
                        İlerleme Durumu
                      </Typography>
                      <Box sx={{ 
                        bgcolor: ilerleme > 0 ? (ilerleme === 100 ? '#4caf5020' : '#ff980020') : '#e0e0e020',
                        color: ilerleme > 0 ? (ilerleme === 100 ? '#2e7d32' : '#e65100') : '#757575',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        {ilerleme > 0 ? (
                          ilerleme === 100 ? (
                            <>
                              <CheckCircleIcon fontSize="small" />
                              Tamamlandı
                            </>
                          ) : (
                            <>
                              <AccessTimeIcon fontSize="small" />
                              Devam Ediyor
                            </>
                          )
                        ) : (
                          'Başlanmadı'
                        )}
                      </Box>
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={ilerleme} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        mb: 2,
                        bgcolor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': {
                          background: ilerleme === 100 
                            ? 'linear-gradient(90deg, #4caf50, #81c784)' 
                            : `linear-gradient(90deg, ${ders.color}, ${ders.color}90)`,
                          borderRadius: 5
                        }
                      }} 
                    />
                    
                    {/* Tamamlanan Konu Sayacı */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: '#f8f9fa',
                      border: `2px solid ${ders.color}30`,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${ilerleme}%`,
                        height: '100%',
                        background: `linear-gradient(to right, ${ders.color}10, ${ders.color}20)`,
                        zIndex: 0
                      }
                    }}>
                      <Typography sx={{ 
                        fontWeight: 800, 
                        color: '#495057', 
                        fontSize: '1rem',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <span style={{ 
                          color: ders.color, 
                          fontWeight: 900, 
                          fontSize: '1.2rem',
                          textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                          {tamamlananKonuSayisi}
                        </span> 
                        / {ders.konular.length} Konu Tamamlandı
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
      
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }
        }}
      >
        {selectedDers && (
          <>
            <DialogTitle sx={{ 
              bgcolor: selectedDers.color,
              display: 'flex',
              alignItems: 'center',
              p: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <Avatar sx={{ 
                bgcolor: 'white', 
                color: selectedDers.color, 
                mr: 2, 
                width: 60, 
                height: 60,
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                '& .MuiSvgIcon-root': { fontSize: '2rem' }
              }}>
                {getDersIcon(selectedDers.ad)}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 900, 
                  color: '#b4c0d6',
                  textShadow: '0px 1px 2px rgba(0,0,0,0.2)'
                }}>
                  {selectedDers.ad}
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500
                }}>
                  Toplam {selectedDers.konular.length} Konu
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: '#f4f2f5', p: 0 }}>
              <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#444' }}>
                  Konu Listesi
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#e8f5e9', px: 1.5, py: 0.5, borderRadius: 2 }}>
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18, mr: 0.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                      Tamamlanan: {Object.values(konuDurumu[selectedDers.id] || {}).filter(durum => durum === 'completed' || durum === 'completedNeedsReview').length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#fff3e0', px: 1.5, py: 0.5, borderRadius: 2 }}>
                    <AccessTimeIcon sx={{ color: '#ff9800', fontSize: 18, mr: 0.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#e65100' }}>
                      Tekrar Edilecek: {Object.values(konuDurumu[selectedDers.id] || {}).filter(durum => durum === 'needsReview' || durum === 'completedNeedsReview').length}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <List sx={{ p: 0 }}>
                {selectedDers.konular.map((konu, index) => {
                  const konuKey = `${selectedDers.id}-${index}`;
                  const durum = konuDurumu[selectedDers.id]?.[index] || 'notStarted';
                  
                  const getBgColor = () => {
                    if (durum === 'completed') return 'rgba(76, 175, 80, 0.08)';
                    if (durum === 'completedNeedsReview') return 'rgba(255, 152, 0, 0.08)';
                    if (durum === 'needsReview') return 'rgba(255, 152, 0, 0.05)';
                    return 'white';
                  };
                  
                  return (
                    <ListItem 
                      key={konuKey} 
                      divider 
                      sx={{ 
                        p: 2.5,
                        bgcolor: getBgColor(),
                        '&:hover': { bgcolor: durum === 'completed' ? 'rgba(76, 175, 80, 0.12)' : 
                                    durum === 'completedNeedsReview' ? 'rgba(255, 152, 0, 0.12)' : 
                                    durum === 'needsReview' ? 'rgba(255, 152, 0, 0.08)' : 
                                    'rgba(0, 0, 0, 0.02)' },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ListItemText 
                        primary={konu} 
                        primaryTypographyProps={{ 
                          fontWeight: durum === 'completed' || durum === 'completedNeedsReview' ? 700 : 500,
                          color: durum === 'completed' ? '#2e7d32' : 
                                durum === 'completedNeedsReview' ? '#e65100' : 
                                durum === 'needsReview' ? '#f57c00' : '#555',
                          fontSize: '1rem'
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                              color="success"
                              sx={{ 
                                '& .MuiSvgIcon-root': { fontSize: 28 },
                                color: '#4caf50',
                                '&.Mui-checked': {
                                  color: '#2e7d32',
                                }
                              }}
                            />
                          }
                          label={<Typography sx={{ fontWeight: 600, color: '#444' }}>Tamamlandı</Typography>}
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
                              color="warning"
                              sx={{ 
                                '& .MuiSvgIcon-root': { fontSize: 28 },
                                color: '#ff9800',
                                '&.Mui-checked': {
                                  color: '#e65100',
                                }
                              }}
                            />
                          }
                          label={<Typography sx={{ fontWeight: 600, color: '#444' }}>Tekrar Edilecek</Typography>}
                          sx={{ m: 0 }}
                        />
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f4f2f5', justifyContent: 'space-between', borderTop: '1px solid #e0e0e0' }}>
              <Button 
                onClick={handleDialogClose}
                variant="outlined"
                sx={{ 
                  borderColor: '#bdbdbd',
                  color: '#555',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': { borderColor: '#9e9e9e', bgcolor: 'rgba(0,0,0,0.03)' }
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
                  bgcolor: selectedDers.color,
                  fontWeight: 600,
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  '&:hover': { bgcolor: selectedDers.color, filter: 'brightness(90%)' }
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