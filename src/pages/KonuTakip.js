import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
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
  CardContent,
  CardActionArea,
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
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 700,
        color: '#333',
        mb: 4,
        textAlign: 'center'
      }}>
        Konu Takip Sistemi
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <Tabs 
            value={sinavTipi} 
            onChange={(e, newValue) => setSinavTipi(newValue)}
            sx={{ 
              minHeight: 48,
              '& .MuiTabs-indicator': {
                backgroundColor: '#5ec837',
                height: 3
              },
              '& .MuiTab-root': {
                fontWeight: 'bold',
                minWidth: 100
              }
            }}
          >
            <Tab value="TYT" label="TYT" />
            <Tab value="AYT" label="AYT" />
          </Tabs>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={filter === 'all' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setFilter('all')}
            size="small"
            sx={{ 
              bgcolor: filter === 'all' ? '#5ec837' : 'transparent',
              fontWeight: 'bold',
              minWidth: 80
            }}
          >
            Tümü
          </Button>
          <Button
            variant={filter === 'completed' ? 'contained' : 'outlined'}
            color="success"
            onClick={() => setFilter('completed')}
            size="small"
            startIcon={<CheckCircleIcon />}
            sx={{ 
              bgcolor: filter === 'completed' ? '#4caf50' : 'transparent',
              fontWeight: 'bold',
              minWidth: 120
            }}
          >
            Tamamlanan
          </Button>
          <Button
            variant={filter === 'inProgress' ? 'contained' : 'outlined'}
            color="warning"
            onClick={() => setFilter('inProgress')}
            size="small"
            startIcon={<AccessTimeIcon />}
            sx={{ 
              bgcolor: filter === 'inProgress' ? '#ff9800' : 'transparent',
              fontWeight: 'bold',
              minWidth: 120
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
        <Grid container spacing={3} sx={{ justifyContent: 'flex-start', px: 1 }}>
          {filteredDersler.map((ders) => {
            const ilerleme = getKonuIlerleme(ders.id);
            const durumFiltresi = filter === 'all' || 
              (filter === 'completed' && ilerleme === 100) || 
              (filter === 'inProgress' && ilerleme > 0 && ilerleme < 100);
            
            if (!durumFiltresi) return null;
            
            return (
              <Grid item xs={12} sm={6} md={3} key={ders.id} sx={{ mb: 2 }}>
                <Card 
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    },
                    borderRadius: '8px',
                    overflow: 'hidden',
                    bgcolor: 'white',
                    border: '1px solid #eaeaea',
                    minWidth: 250,
                    mx: 'auto',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <CardActionArea onClick={() => handleDersClick(ders)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%' }}>
                    <Box sx={{ 
                      bgcolor: ders.color, 
                      py: 2, 
                      px: 3, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 2
                    }}>
                      <Avatar sx={{ 
                        bgcolor: 'white', 
                        color: ders.color,
                        width: 40, 
                        height: 40,
                        '& .MuiSvgIcon-root': { fontSize: '1.5rem' }
                      }}>
                        {getDersIcon(ders.ad)}
                      </Avatar>
                      <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                          fontSize: '1.2rem', 
                          fontWeight: 700,
                          color: 'white'
                        }}
                      >
                        {ders.ad}
                      </Typography>
                    </Box>
                    
                    <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#555' }}>
                          Toplam: {ders.konular.length} konu
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 'auto' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={ilerleme} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            mb: 1.5,
                            bgcolor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: ders.color
                            }
                          }} 
                        />
                        
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                          {Math.round(ilerleme * ders.konular.length / 100)} konu tamamlandı
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        {selectedDers && (
          <>
            <DialogTitle sx={{ 
              bgcolor: '#bbb38a',
              display: 'flex',
              alignItems: 'center',
              p: 2
            }}>
              <Avatar sx={{ bgcolor: selectedDers.color, mr: 2, width: 45, height: 45 }}>
                {getDersIcon(selectedDers.ad)}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{selectedDers.ad} - Konular</Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: '#f5f5f0', p: 0 }}>
              <List sx={{ p: 0 }}>
                {selectedDers.konular.map((konu, index) => {
                  const konuKey = `${selectedDers.id}-${index}`;
                  const durum = konuDurumu[selectedDers.id]?.[index] || 'notStarted';
                  
                  return (
                    <ListItem 
                      key={konuKey} 
                      divider 
                      sx={{ 
                        p: 2,
                        '&:hover': { bgcolor: '#e8e8e0' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <ListItemText 
                        primary={konu} 
                        primaryTypographyProps={{ 
                          fontWeight: durum === 'completed' || durum === 'completedNeedsReview' ? 'bold' : 'normal',
                          color: durum === 'completed' || durum === 'completedNeedsReview' ? 'text.primary' : 'text.secondary',
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
                              sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                            />
                          }
                          label="Tamamlandı"
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
                              sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                            />
                          }
                          label="Tekrar Edilecek"
                          sx={{ m: 0 }}
                        />
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#bbb38a', justifyContent: 'space-between' }}>
              <Button 
                onClick={handleDialogClose}
                variant="outlined"
                sx={{ 
                  borderColor: '#555',
                  color: '#333',
                  '&:hover': { borderColor: '#333', bgcolor: 'rgba(0,0,0,0.05)' }
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
                color="primary"
                startIcon={<SaveIcon />}
                sx={{ 
                  bgcolor: '#5ec837',
                  '&:hover': { bgcolor: '#4eb02c' },
                  px: 3
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