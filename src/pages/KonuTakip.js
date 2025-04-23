import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
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
  Snackbar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScienceIcon from '@mui/icons-material/Science';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
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
  {
    id: 'matematik',
    ad: 'Matematik',
    color: '#4285F4',
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
      'Problemler',
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
      'İntegral'
    ]
  },
  {
    id: 'geometri',
    ad: 'Geometri',
    color: '#EA4335',
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
      'Deltoid',
      'Çemberde Açılar',
      'Çemberde Uzunluk',
      'Dairede Alan',
      'Prizmalar',
      'Piramitler',
      'Küre',
      'Silindir',
      'Koni',
      'Koordinat Düzlemi',
      'Analitik Geometri'
    ]
  },
  {
    id: 'fizik',
    ad: 'Fizik',
    color: '#FBBC05',
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
      'Elektrik',
      'Manyetizma',
      'Dalgalar',
      'Optik',
      'Modern Fizik',
      'Atom Fiziği',
      'Nükleer Fizik'
    ]
  },
  {
    id: 'kimya',
    ad: 'Kimya',
    color: '#34A853',
    konular: [
      'Kimya Bilimi',
      'Atom ve Yapısı',
      'Periyodik Sistem',
      'Kimyasal Türler Arası Etkileşimler',
      'Kimyasal Tepkimeler',
      'Kimyasal Hesaplamalar',
      'Karışımlar',
      'Asit, Baz ve Tuzlar',
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
      'Organik Kimya'
    ]
  },
  {
    id: 'biyoloji',
    ad: 'Biyoloji',
    color: '#FF9800',
    konular: [
      'Biyoloji Bilimi',
      'Canlıların Ortak Özellikleri',
      'Canlıların Temel Bileşenleri',
      'Hücre ve Yapısı',
      'Hücre Zarından Madde Geçişleri',
      'Canlıların Sınıflandırılması',
      'Mitoz ve Eşeysiz Üreme',
      'Mayoz ve Eşeyli Üreme',
      'Kalıtım',
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
      'Bitki Biyolojisi'
    ]
  },
  {
    id: 'turkce',
    ad: 'Türkçe',
    color: '#9C27B0',
    konular: [
      'Sözcükte Anlam',
      'Cümlede Anlam',
      'Paragrafta Anlam',
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
    id: 'edebiyat',
    ad: 'Edebiyat',
    color: '#E91E63',
    konular: [
      'Giriş (Edebiyat, Sanat, Metin)',
      'Şiir Bilgisi',
      'Öykü-Roman',
      'Tiyatro',
      'Destan-Efsane',
      'Masal-Fabl',
      'Anı-Gezi-Biyografi-Otobiyografi',
      'Mektup-Günlük',
      'Halk Edebiyatı',
      'Divan Edebiyatı',
      'Tanzimat Edebiyatı',
      'Servet-i Fünun Edebiyatı',
      'Fecr-i Ati Edebiyatı',
      'Milli Edebiyat',
      'Cumhuriyet Dönemi Edebiyatı'
    ]
  },
  {
    id: 'tarih',
    ad: 'Tarih',
    color: '#00BCD4',
    konular: [
      'Tarih Bilimi',
      'İlk Uygarlıklar',
      'İlk Türk Devletleri',
      'İslamiyet Öncesi Türk Tarihi',
      'İslam Tarihi',
      'Türk-İslam Devletleri',
      'Türkiye Tarihi (Osmanlı Öncesi)',
      'Osmanlı Devleti Kuruluş Dönemi',
      'Osmanlı Devleti Yükselme Dönemi',
      'Osmanlı Devleti Duraklama Dönemi',
      'Osmanlı Devleti Gerileme Dönemi',
      'Osmanlı Devleti Dağılma Dönemi',
      'XX. Yüzyıl Başlarında Osmanlı Devleti',
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
    id: 'cografya',
    ad: 'Coğrafya',
    color: '#4CAF50',
    konular: [
      'Doğa ve İnsan',
      'Dünyanın Şekli ve Hareketleri',
      'Coğrafi Konum',
      'Harita Bilgisi',
      'Atmosfer ve Sıcaklık',
      'İklimler',
      'Basınç ve Rüzgârlar',
      'Nem, Yağış ve Buharlaşma',
      'İç Kuvvetler / Dış Kuvvetler',
      'Su-Toprak-Bitki',
      'Nüfus',
      'Göç',
      'Yerleşme',
      'Türkiyenin Yer Şekilleri',
      'Türkiyenin İklimi',
      'Türkiyenin Bitki Örtüsü',
      'Türkiyede Nüfus ve Yerleşme',
      'Türkiye Ekonomisi',
      'Bölgesel Kalkınma Projeleri',
      'Uluslararası Ulaşım Hatları',
      'Türkiyenin Jeopolitik Konumu',
      'Doğal Kaynaklar',
      'Ekonomik Faaliyetler',
      'Bölgeler'
    ]
  },
  {
    id: 'felsefe',
    ad: 'Felsefe',
    color: '#795548',
    konular: [
      'Felsefenin Konusu',
      'Bilgi Felsefesi',
      'Varlık Felsefesi',
      'Ahlak Felsefesi',
      'Sanat Felsefesi',
      'Din Felsefesi',
      'Siyaset Felsefesi',
      'Bilim Felsefesi'
    ]
  }
];

const KonuTakip = () => {
  const [user] = useAuthState(auth);
  const [selectedDers, setSelectedDers] = useState(null);
  const [konuDurumu, setKonuDurumu] = useState({});
  const [isLoading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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

  // Ders seçimi
  const handleDersSelect = (ders) => {
    setSelectedDers(ders);
  };

  // Konu durumu değişikliği
  const handleKonuDurumuChange = (konu, durum, value) => {
    setKonuDurumu(prevState => {
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

        <Grid container spacing={3}>
          {/* Dersler Listesi */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                height: '100%',
                backgroundColor: '#FFFFF8',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <Typography 
                variant="h6" 
                component="h2" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  color: '#2e3856',
                  mb: 2,
                  borderBottom: '2px solid #f0f0f0',
                  pb: 1
                }}
              >
                Dersler
              </Typography>
              
              <List sx={{ width: '100%' }}>
                {dersler.map((ders) => (
                  <ListItem 
                    key={ders.id}
                    disablePadding
                    sx={{ mb: 1 }}
                  >
                    <Button
                      fullWidth
                      variant={selectedDers?.id === ders.id ? "contained" : "outlined"}
                      onClick={() => handleDersSelect(ders)}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: selectedDers?.id === ders.id ? ders.color : 'transparent',
                        color: selectedDers?.id === ders.id ? 'white' : ders.color,
                        borderColor: ders.color,
                        '&:hover': {
                          backgroundColor: selectedDers?.id === ders.id ? ders.color : `${ders.color}22`
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, mr: 2 }}>
                          {ders.ad}
                        </Typography>
                        <Chip 
                          label={`${calculateProgress(ders.id)}%`} 
                          size="small"
                          sx={{ 
                            backgroundColor: selectedDers?.id === ders.id ? 'rgba(255,255,255,0.2)' : ders.color,
                            color: selectedDers?.id === ders.id ? 'white' : 'white',
                            fontWeight: 'bold',
                            minWidth: '48px'
                          }}
                        />
                      </Box>
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Konular Listesi */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                minHeight: 400,
                backgroundColor: '#FFFFF8',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {isLoading ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 400
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Yükleniyor...
                  </Typography>
                </Box>
              ) : selectedDers ? (
                <>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    pb: 1,
                    borderBottom: '2px solid #f0f0f0'
                  }}>
                    <Typography 
                      variant="h6" 
                      component="h2"
                      sx={{ 
                        fontWeight: 600,
                        color: selectedDers.color
                      }}
                    >
                      {selectedDers.ad} Konuları
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => setSelectedDers(null)}
                        sx={{
                          borderColor: selectedDers.color,
                          color: selectedDers.color,
                          '&:hover': {
                            borderColor: selectedDers.color,
                            backgroundColor: `${selectedDers.color}10`,
                          }
                        }}
                      >
                        İptal
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={saveChanges}
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
                    </Box>
                  </Box>

                  <List>
                    {selectedDers.konular.map((konu, index) => {
                      const konuKey = `${selectedDers.id}_${konu}`;
                      const konuData = konuDurumu[konuKey] || {
                        ogrendim: false,
                        testCozdüm: false,
                        denemedeCozdüm: false
                      };
                      
                      return (
                        <React.Fragment key={konuKey}>
                          {index > 0 && <Divider component="li" />}
                          <ListItem 
                            sx={{ 
                              py: 1.5,
                              backgroundColor: konuData.ogrendim ? `${selectedDers.color}10` : 'transparent',
                              borderRadius: 1
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
                </>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: 400
                  }}
                >
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Lütfen sol taraftan bir ders seçin
                  </Typography>
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
                    Ders seçtikten sonra konuları görüntüleyebilir ve ilerleme durumunuzu kaydedebilirsiniz.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

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
