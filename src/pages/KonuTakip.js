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
  Divider,
  Chip,
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
  CardActionArea
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScienceIcon from '@mui/icons-material/Science';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SaveIcon from '@mui/icons-material/Save';
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
      'Osmanlı Devleti Gerileme Dönemi'
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
      'Coğrafi Konum',
      'Harita Bilgisi',
      'Atmosfer ve Sıcaklık',
      'İklimler',
      'Basınç ve Rüzgarlar',
      'Nem, Yağış ve Buharlaşma',
      'İklim Tipleri ve Bitki Örtüsü',
      'Nüfus',
      'Göç',
      'Yerleşme'
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
      'Logaritma',
      'Türev',
      'İntegral',
      'Limit',
      'Diziler',
      'Seriler'
    ]
  },
  {
    id: 'geometri-ayt',
    ad: 'Geometri',
    color: '#EA4335',
    type: 'AYT',
    konular: [
      'Çemberde Açılar',
      'Çemberde Uzunluk',
      'Dairede Alan',
      'Prizmalar',
      'Piramitler',
      'Küre',
      'Silindir',
      'Koni',
      'Koordinat Düzlemi',
      'Analitik Geometri',
      'Vektörler',
      'Uzay Geometri'
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
      'Çözünürlük Dengesi',
      'Asit-Baz Dengesi',
      'Kimya ve Elektrik',
      'Karbon Kimyasına Giriş',
      'Organik Kimya',
      'Karboksilli Asitler',
      'Esterler',
      'Aromatik Bileşikler'
    ]
  },
  {
    id: 'biyoloji-ayt',
    ad: 'Biyoloji',
    color: '#FF9800',
    type: 'AYT',
    konular: [
      'Ekosistem Ekolojisi',
      'Popülasyon Ekolojisi',
      'Komünite ve Biyom Ekolojisi',
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
      'Anı-Gezi Yazısı',
      'Biyografi-Otobiyografi',
      'Mektup-Günlük',
      'Halk Edebiyatı',
      'Divan Edebiyatı',
      'Tanzimat Edebiyatı',
      'Servet-i Fünun Edebiyatı',
      'Milli Edebiyat',
      'Cumhuriyet Dönemi Edebiyatı',
      'Dünya Edebiyatı'
    ]
  },
  {
    id: 'tarih-1-ayt',
    ad: 'Tarih-1',
    color: '#00BCD4',
    type: 'AYT',
    konular: [
      'Osmanlı Devleti Dağılma Dönemi',
      'I. Dünya Savaşı',
      'Kurtuluş Savaşı Hazırlık Dönemi',
      'Kurtuluş Savaşı',
      'Türk İnkılabı',
      'Atatürk Dönemi Türk Dış Politikası',
      'Atatürk İlkeleri',
      'Atatürk Dönemi İç ve Dış Politika'
    ]
  },
  {
    id: 'cografya-1-ayt',
    ad: 'Coğrafya-1',
    color: '#4CAF50',
    type: 'AYT',
    konular: [
      'Türkiyenin Yer Şekilleri',
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
      'Türkiye Cumhuriyeti Tarihi (1938-1980)',
      'Türkiye Cumhuriyeti Tarihi (1980 Sonrası)'
    ]
  },
  {
    id: 'cografya-2-ayt',
    ad: 'Coğrafya-2',
    color: '#4CAF50',
    type: 'AYT',
    konular: [
      'Doğal Sistemler',
      'Beşeri Sistemler',
      'Ekonomik Faaliyetler',
      'Çevre ve Toplum'
    ]
  },
  {
    id: 'felsefe-ayt',
    ad: 'Felsefe',
    color: '#795548',
    type: 'AYT',
    konular: [
      'Sanat Felsefesi',
      'Din Felsefesi',
      'Siyaset Felsefesi',
      'Bilim Felsefesi',
      'Mantık',
      'Psikoloji',
      'Sosyoloji'
    ]
  },
  {
    id: 'din-kulturu-ayt',
    ad: 'Din Kültürü',
    color: '#607D8B',
    type: 'AYT',
    konular: [
      'İslam ve İbadet',
      'İslam Düşüncesi',
      'İslam ve Ahlak',
      'İslam ve Bilim',
      'Yaşayan Dinler'
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
  }
];

const KonuTakip = () => {
  const [user] = useAuthState(auth);
  const [selectedDers, setSelectedDers] = useState(null);
  const [konuDurumu, setKonuDurumu] = useState({});
  const [, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [examType, setExamType] = useState('TYT');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Firestore'dan konu durumlarını yükle
  useEffect(() => {
    const loadKonuDurumu = async () => {
      if (!user) {
        // Kullanıcı giriş yapmamışsa localStorage'dan yükle
        try {
          const savedData = localStorage.getItem('konuDurumu_anonymous');
          if (savedData) {
            setKonuDurumu(JSON.parse(savedData));
          }
        } catch (error) {
          console.error('LocalStorage yükleme hatası:', error);
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Basit bir sorgu kullanarak indeks hatalarını önle
        const konuTakipRef = doc(db, 'konuTakip', user.uid);
        const docSnap = await getDoc(konuTakipRef);

        if (docSnap.exists()) {
          // Veri varsa konular alanını al, yoksa boş obje kullan
          const data = docSnap.data();
          setKonuDurumu(data?.konular || {});
        } else {
          // Döküman yoksa boş bir obje oluştur
          try {
            await setDoc(konuTakipRef, {
              userId: user.uid,
              konular: {},
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } catch (writeError) {
            console.error('Yeni döküman oluşturma hatası:', writeError);
          }
        }
      } catch (error) {
        console.error('Konu durumu yükleme hatası:', error);
        showSnackbar('Konu durumu yüklenirken bir hata oluştu', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadKonuDurumu();
  }, [user]);



  // Konu durumu değişikliği
  const handleKonuDurumuChange = (konu, durum, value) => {
    setKonuDurumu(prevState => {
      if (!selectedDers) return prevState;
      
      const dersId = selectedDers.id;
      const konuKey = `${dersId}_${konu}`;
      
      // Mevcut konu durumunu al veya yeni oluştur
      const prevKonuDurumu = prevState[konuKey] || {
        ogrendim: false,
        testCozdüm: false,
        denemedeCozdüm: false,
        lastUpdated: new Date().toISOString()
      };
      
      // Yeni durumu oluştur
      const newKonuDurumu = {
        ...prevKonuDurumu,
        [durum]: value,
        lastUpdated: new Date().toISOString()
      };
      
      return {
        ...prevState,
        [konuKey]: newKonuDurumu
      };
    });
  };

  // Değişiklikleri kaydet
  const saveChanges = async () => {
    if (!user) {
      // Kullanıcı giriş yapmamışsa localStorage'a kaydet
      try {
        localStorage.setItem('konuDurumu_anonymous', JSON.stringify(konuDurumu));
        showSnackbar('Değişiklikler kaydedildi', 'success');
      } catch (error) {
        console.error('LocalStorage kaydetme hatası:', error);
        showSnackbar('Değişiklikler kaydedilirken bir hata oluştu', 'error');
      }
      return;
    }

    try {
      const konuTakipRef = doc(db, 'konuTakip', user.uid);
      // Önce dökümanın var olup olmadığını kontrol et
      const docSnap = await getDoc(konuTakipRef);
      
      if (docSnap.exists()) {
        // Döküman varsa güncelle
        await updateDoc(konuTakipRef, {
          konular: konuDurumu,
          updatedAt: serverTimestamp()
        });
      } else {
        // Döküman yoksa oluştur
        await setDoc(konuTakipRef, {
          userId: user.uid,
          konular: konuDurumu,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      showSnackbar('Değişiklikler kaydedildi', 'success');
    } catch (error) {
      console.error('Firestore kaydetme hatası:', error);
      showSnackbar('Değişiklikler kaydedilirken bir hata oluştu', 'error');
    }
  };

  // Snackbar göster
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Konu tamamlanma yüzdesini hesapla
  const calculateProgress = (dersId) => {
    const dersKonulari = dersler.find(d => d.id === dersId)?.konular || [];
    if (dersKonulari.length === 0) return 0;
    
    let tamamlananKonuSayisi = 0;
    
    dersKonulari.forEach(konu => {
      const konuKey = `${dersId}_${konu}`;
      const konuData = konuDurumu[konuKey];
      if (konuData && konuData.ogrendim) {
        tamamlananKonuSayisi++;
      }
    });
    
    return Math.round((tamamlananKonuSayisi / dersKonulari.length) * 100);
  };

  // Handle dialog open/close
  const handleOpenDialog = (ders) => {
    setSelectedDers(ders);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Handle tab change between TYT and AYT
  const handleExamTypeChange = (event, newValue) => {
    setExamType(newValue);
  };

  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        p: 3,
        backgroundColor: '#FFFFF0',
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            fontWeight: 700,
            color: '#2e3856',
            textAlign: 'center',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              width: '80px',
              height: '3px',
              background: 'linear-gradient(90deg, #4285F4, #0F9D58)',
              transform: 'translateX(-50%)'
            }
          }}
        >
          Konu Takip Sistemi
        </Typography>

        {/* TYT/AYT Tab Selector */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={examType} 
            onChange={handleExamTypeChange} 
            centered
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: examType === 'TYT' ? '#4285F4' : '#E91E63',
                height: 3
              }
            }}
          >
            <Tab 
              label="TYT Dersleri" 
              value="TYT" 
              sx={{
                fontWeight: examType === 'TYT' ? 600 : 400,
                color: examType === 'TYT' ? '#4285F4' : 'text.secondary',
                '&.Mui-selected': {
                  color: examType === 'TYT' ? '#4285F4' : '#E91E63'
                }
              }}
            />
            <Tab 
              label="AYT Dersleri" 
              value="AYT" 
              sx={{
                fontWeight: examType === 'AYT' ? 600 : 400,
                color: examType === 'AYT' ? '#E91E63' : 'text.secondary',
                '&.Mui-selected': {
                  color: examType === 'AYT' ? '#E91E63' : '#4285F4'
                }
              }}
            />
          </Tabs>
        </Box>

        {/* Ders Kartları Grid */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Wrap the grid items in groups of 4 */}
          {(() => {
            const filteredDersler = dersler.filter(ders => ders.type === examType);
            const rows = [];
            
            for (let i = 0; i < filteredDersler.length; i += 4) {
              const rowItems = filteredDersler.slice(i, i + 4);
              rows.push(
                <Grid container item spacing={3} key={`row-${i}`} sx={{ mb: 3 }}>
                  {rowItems.map((ders) => (
                    <Grid item xs={12} sm={6} md={3} key={ders.id} sx={{ display: 'flex' }}>
                      <Card 
                        elevation={4}
                        sx={{ 
                          width: '100%',
                          height: 220, // Fixed height for consistency
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 3,
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 28px rgba(0,0,0,0.15)'
                          },
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(135deg, ${ders.color}05 0%, ${ders.color}15 100%)`,
                            zIndex: 0
                          }
                        }}
                      >
                        <CardActionArea 
                          onClick={() => handleOpenDialog(ders)}
                          sx={{ 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            justifyContent: 'flex-start',
                            zIndex: 1
                          }}
                        >
                          <Box 
                            sx={{ 
                              backgroundColor: ders.color,
                              color: 'white',
                              py: 2.5,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            <Typography variant="h6" component="h2" align="center" sx={{ fontWeight: 700 }}>
                              {ders.ad}
                            </Typography>
                          </Box>
                          <CardContent sx={{ 
                            flexGrow: 1, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            p: 3
                          }}>
                            <Typography 
                              variant="body1" 
                              color="text.primary" 
                              align="center" 
                              sx={{ 
                                mb: 2, 
                                fontWeight: 500,
                                fontSize: '1rem'
                              }}
                            >
                              {ders.konular.length} konu
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                              <Chip 
                                label={`${calculateProgress(ders.id)}% Tamamlandı`} 
                                sx={{ 
                                  backgroundColor: ders.color,
                                  color: 'white',
                                  fontWeight: 'bold',
                                  borderRadius: '20px',
                                  py: 0.5,
                                  px: 1
                                }}
                              />
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              );
            }
            
            return rows;
          })()}
        </Grid>
      </Container>

      {/* Konu Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh'
          }
        }}
      >
        {selectedDers && (
          <>
            <DialogTitle sx={{ 
              backgroundColor: selectedDers.color,
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2
            }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {selectedDers.ad} Konuları
              </Typography>
              <Chip 
                label={`${calculateProgress(selectedDers.id)}% Tamamlandı`} 
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
                {selectedDers.konular.map((konu, index) => {
                  const konuKey = `${selectedDers.id}_${konu}`;
                  const konuData = konuDurumu[konuKey] || {
                    ogrendim: false,
                    testCozdüm: false,
                    denemedeCozdüm: false
                  };
                  
                  return (
                    <React.Fragment key={konuKey}>
                      {index > 0 && <Divider />}
                      <ListItem 
                        sx={{ 
                          py: 1.5,
                          backgroundColor: konuData.ogrendim ? `${selectedDers.color}10` : 'transparent'
                        }}
                      >
                        <ListItemText 
                          primary={konu} 
                          sx={{ 
                            '& .MuiTypography-root': { 
                              fontWeight: konuData.ogrendim ? 600 : 400,
                              color: konuData.ogrendim ? selectedDers.color : 'inherit'
                            }
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={konuData.ogrendim} 
                                onChange={(e) => handleKonuDurumuChange(konu, 'ogrendim', e.target.checked)}
                                icon={<CheckCircleIcon />}
                                checkedIcon={<CheckCircleIcon />}
                                sx={{ 
                                  color: '#bdbdbd',
                                  '&.Mui-checked': {
                                    color: '#4CAF50'
                                  },
                                  '&:hover': {
                                    backgroundColor: 'rgba(76, 175, 80, 0.08)'
                                  }
                                }}
                              />
                            }
                            label="Öğrendim"
                            sx={{ 
                              mr: 1,
                              '& .MuiFormControlLabel-label': {
                                color: konuData.ogrendim ? '#4CAF50' : 'inherit',
                                fontWeight: konuData.ogrendim ? 600 : 400
                              }
                            }}
                          />
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={konuData.testCozdüm} 
                                onChange={(e) => handleKonuDurumuChange(konu, 'testCozdüm', e.target.checked)}
                                icon={<ScienceIcon />}
                                checkedIcon={<ScienceIcon />}
                                sx={{ 
                                  color: '#bdbdbd',
                                  '&.Mui-checked': {
                                    color: '#2196F3'
                                  },
                                  '&:hover': {
                                    backgroundColor: 'rgba(33, 150, 243, 0.08)'
                                  }
                                }}
                              />
                            }
                            label="Test Çözdüm"
                            sx={{ 
                              mr: 1,
                              '& .MuiFormControlLabel-label': {
                                color: konuData.testCozdüm ? '#2196F3' : 'inherit',
                                fontWeight: konuData.testCozdüm ? 600 : 400
                              }
                            }}
                          />
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={konuData.denemedeCozdüm} 
                                onChange={(e) => handleKonuDurumuChange(konu, 'denemedeCozdüm', e.target.checked)}
                                icon={<PsychologyIcon />}
                                checkedIcon={<PsychologyIcon />}
                                sx={{ 
                                  color: '#bdbdbd',
                                  '&.Mui-checked': {
                                    color: '#FF9800'
                                  },
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 152, 0, 0.08)'
                                  }
                                }}
                              />
                            }
                            label="Denemede Çözdüm"
                            sx={{ 
                              '& .MuiFormControlLabel-label': {
                                color: konuData.denemedeCozdüm ? '#FF9800' : 'inherit',
                                fontWeight: konuData.denemedeCozdüm ? 600 : 400
                              }
                            }}
                          />
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  );
                })}
              </List>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Button 
                onClick={handleCloseDialog} 
                color="inherit"
                sx={{ fontWeight: 500 }}
              >
                Kapat
              </Button>
              <Button 
                onClick={saveChanges} 
                variant="contained" 
                startIcon={<SaveIcon />}
                sx={{
                  backgroundColor: selectedDers.color,
                  '&:hover': {
                    backgroundColor: selectedDers.color,
                    opacity: 0.9
                  }
                }}
              >
                Kaydet
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Bildirim Snackbar */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={4000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KonuTakip;
