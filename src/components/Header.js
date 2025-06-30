import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Badge,
  Avatar,
  useTheme,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';

import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format, subWeeks, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import yksData from '../utils/yksData';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
        backgroundColor: 'var(--appbar-bg-color, #1a0545)',
  boxShadow: '0 2px 10px var(--shadow-color, rgba(0,0,0,0.08))',
  zIndex: theme.zIndex.drawer + 1,
  color: 'var(--text-primary, #333333)',
  transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 38,
  height: 38,
  cursor: 'pointer',
  border: `2px solid ${theme.palette.primary.main}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.secondary.main,
    transform: 'scale(1.05)'
  }
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#FF4444',
    color: '#FFF',
    fontWeight: '600',
    fontSize: '0.7rem',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    boxShadow: `0 2px 8px rgba(255, 68, 68, 0.3), 0 0 0 2px ${theme.palette.background.paper}`,
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
      '0%': {
        transform: 'scale(1)',
        boxShadow: `0 2px 8px rgba(255, 68, 68, 0.3), 0 0 0 2px ${theme.palette.background.paper}`,
      },
      '50%': {
        transform: 'scale(1.1)',
        boxShadow: `0 4px 12px rgba(255, 68, 68, 0.5), 0 0 0 2px ${theme.palette.background.paper}`,
      },
      '100%': {
        transform: 'scale(1)',
        boxShadow: `0 2px 8px rgba(255, 68, 68, 0.3), 0 0 0 2px ${theme.palette.background.paper}`,
      }
    }
  },
}));

const ModernNotificationButton = styled(IconButton)(({ theme, hasNotifications }) => ({
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  backgroundColor: hasNotifications ? 'rgba(138, 43, 226, 0.1)' : 'rgba(255, 255, 255, 0.05)',
  border: hasNotifications ? '1px solid rgba(138, 43, 226, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: hasNotifications 
      ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(255, 20, 147, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
    borderRadius: '12px',
    zIndex: -1,
    transition: 'all 0.3s ease',
  },
  
  '&:hover': {
    transform: 'translateY(-2px) scale(1.05)',
    backgroundColor: hasNotifications ? 'rgba(138, 43, 226, 0.15)' : 'rgba(255, 255, 255, 0.1)',
    border: hasNotifications ? '1px solid rgba(138, 43, 226, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: hasNotifications 
      ? '0 8px 25px rgba(138, 43, 226, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)'
      : '0 8px 25px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)',
    
    '&:before': {
      background: hasNotifications 
        ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(255, 20, 147, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    },
    
    '& .MuiSvgIcon-root': {
      transform: 'scale(1.1)',
      color: hasNotifications ? '#8A2BE2' : '#2a5956',
    }
  },
  
  '&:active': {
    transform: 'translateY(0) scale(1.02)',
  },
  
  '& .MuiSvgIcon-root': {
    fontSize: '1.3rem',
    color: hasNotifications ? '#8A2BE2' : '#2a5956',
    transition: 'all 0.3s ease',
    filter: hasNotifications ? 'drop-shadow(0 2px 4px rgba(138, 43, 226, 0.3))' : 'none',
  }
}));

const ModernReportButton = styled(IconButton)(({ theme, generating }) => ({
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  backgroundColor: generating ? 'rgba(255, 87, 34, 0.15)' : 'rgba(255, 87, 34, 0.1)',
  border: generating ? '1px solid rgba(255, 87, 34, 0.3)' : '1px solid rgba(255, 87, 34, 0.2)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  marginRight: '12px',
  
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: generating 
      ? 'linear-gradient(135deg, rgba(255, 87, 34, 0.2) 0%, rgba(255, 193, 7, 0.2) 100%)'
      : 'linear-gradient(135deg, rgba(255, 87, 34, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
    borderRadius: '12px',
    zIndex: -1,
    transition: 'all 0.3s ease',
  },
  
  '&:hover': {
    transform: 'translateY(-2px) scale(1.05)',
    backgroundColor: 'rgba(255, 87, 34, 0.2)',
    border: '1px solid rgba(255, 87, 34, 0.4)',
    boxShadow: '0 8px 25px rgba(255, 87, 34, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)',
    
    '&:before': {
      background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.25) 0%, rgba(255, 193, 7, 0.25) 100%)',
    },
    
    '& .MuiSvgIcon-root': {
      transform: 'scale(1.1)',
      color: '#FF5722',
    }
  },
  
  '&:active': {
    transform: 'translateY(0) scale(1.02)',
  },
  
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  },
  
  '& .MuiSvgIcon-root': {
    fontSize: '1.3rem',
    color: '#FF5722',
    transition: 'all 0.3s ease',
    filter: 'drop-shadow(0 2px 4px rgba(255, 87, 34, 0.3))',
  }
}));

const Header = ({ handleDrawerToggle, sidebarOpen }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [userName, setUserName] = useState('');
  
  // Admin panel variables
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  
  // PDF rapor variables
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  

  
  // Bildirim sistemini kullan
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          setUserPhotoURL(user.photoURL);
          setUserName(user.displayName || user.email?.split('@')[0] || 'Kullanıcı');
          
          // Sadece belirli email adresine admin yetkisi ver
          if (user.email === 'businessfrkn@gmail.com') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      });
      
      return () => unsubscribe();
    };

    checkAdminStatus();
  }, []);
  
  // Handle admin login
  const handleAdminLogin = () => {
    setShowAdminDialog(true);
    setAdminPassword('');
    setAdminError('');
  };

  // Handle admin password submit
  const handleAdminPasswordSubmit = () => {
    if (adminPassword === 'Arzu280521!@!') {
      setShowAdminDialog(false);
      navigate('/admin-panel');
    } else {
      setAdminError('Hatalı şifre!');
    }
  };

  // Handle admin dialog close
  const handleAdminDialogClose = () => {
    setShowAdminDialog(false);
    setAdminPassword('');
    setAdminError('');
  };
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };
  
  const handleReadNotification = (notificationId) => {
    markAsRead(notificationId);
    setNotificationAnchor(null);
  };
  
  const handleReadAllNotifications = () => {
    markAllAsRead();
    setNotificationAnchor(null);
  };
  
  const handleProfileClick = () => {
    navigate('/profil');
    handleClose();
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yaparken hata oluştu:', error);
    }
    handleClose();
  };

  // İlk harfi büyüt
  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "K";
  };

  // PDF rapor oluşturma fonksiyonları
  const generateReport = async (period) => {
    setReportGenerating(true);
    setShowReportDialog(false);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Kullanıcı girişi gereklidir.');
        return;
      }

      console.log('Rapor oluşturma başladı:', { period, userUid: user.uid });

      const now = new Date();
      const startDate = period === 'week' ? subWeeks(now, 1) : subMonths(now, 1);
      
      console.log('Tarih aralığı:', { startDate, endDate: now });
      
      // Verileri topla
      const reportData = await collectReportData(user.uid, startDate, now);
      
      // Veri kontrolü
      if (!reportData) {
        throw new Error('Veri toplanamadı');
      }
      
      // PDF oluştur
      await createPDF(reportData, period, startDate, now);
      
      console.log('Rapor başarıyla tamamlandı');
      
    } catch (error) {
      console.error('Rapor oluşturma hatası:', error);
      alert(`Rapor oluşturulurken bir hata oluştu: ${error.message}\n\nLütfen konsolu kontrol edin ve geliştiriciye bildirin.`);
    } finally {
      setReportGenerating(false);
    }
  };

  const collectReportData = async (userId, startDate, endDate) => {
    const data = {
      studyRecords: [],
      netRecords: [],
      topicProgress: []
    };

    try {
      console.log('Rapor verileri toplanıyor...', { userId, startDate, endDate });

      // Analizli kronometre verilerini çek (studyRecords)
      try {
        const studyQuery = query(
          collection(db, 'studyRecords'),
          where('userId', '==', userId)
        );
        const studySnapshot = await getDocs(studyQuery);
        const allStudyRecords = studySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Tarih aralığında filtrele
        data.studyRecords = allStudyRecords.filter(record => {
          try {
            const recordDate = record.timestamp?.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
            return recordDate >= startDate && recordDate <= endDate;
          } catch (e) {
            console.warn('Çalışma kaydı tarih hatası:', e);
            return false;
          }
        });
        
        console.log(`${data.studyRecords.length} analizli kronometre kaydı bulundu`);
      } catch (studyError) {
        console.warn('Çalışma kayıtları çekilemedi:', studyError);
      }

      // Net takibi verilerini çek (TYT AYT net takibi)
      try {
        const netQuery = query(
          collection(db, 'netRecords'),
          where('userId', '==', userId)
        );
        const netSnapshot = await getDocs(netQuery);
        const allNetRecords = netSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Tarih aralığında filtrele
        data.netRecords = allNetRecords.filter(record => {
          try {
            const examDate = record.date?.toDate ? record.date.toDate() : new Date(record.date);
            return examDate >= startDate && examDate <= endDate;
          } catch (e) {
            console.warn('Net kaydı tarih hatası:', e);
            return false;
          }
        });
        
        console.log(`${data.netRecords.length} net kaydı bulundu`);
      } catch (netError) {
        console.warn('Net records çekilemedi:', netError);
      }

      // Konu takip verilerini çek (konuDurumu)
      try {
        const topicDocRef = doc(db, 'konuDurumu', userId);
        const topicSnapshot = await getDoc(topicDocRef);
        
        if (topicSnapshot.exists()) {
          const topicData = topicSnapshot.data();
          const durumlar = topicData.durumlar || {};
          
          // Durumları işle
          Object.entries(durumlar).forEach(([key, durum]) => {
            if (key.includes('_')) {
              const [dersId, konuIndex] = key.split('_');
              
              // yksData'dan ders ve konu ismini bul
              let dersAdi = dersId;
              let konuAdi = `Konu ${konuIndex}`;
              
              // TYT ve AYT'de ara
              Object.entries(yksData.TYT).forEach(([name, data]) => {
                if (data.topics && data.topics[parseInt(konuIndex)]) {
                  dersAdi = name;
                  konuAdi = data.topics[parseInt(konuIndex)];
                }
              });
              
              Object.entries(yksData.AYT).forEach(([name, data]) => {
                if (data.topics && data.topics[parseInt(konuIndex)]) {
                  dersAdi = name;
                  konuAdi = data.topics[parseInt(konuIndex)];
                }
              });
              
              data.topicProgress.push({
                subject: dersAdi,
                topic: konuAdi,
                status: durum,
                completed: durum === 'completed' || durum === 'completedNeedsReview',
                needsReview: durum === 'needsReview' || durum === 'completedNeedsReview'
              });
            }
          });
        }
        
        console.log(`${data.topicProgress.length} konu durumu bulundu`);
      } catch (topicError) {
        console.warn('Konu takip verileri çekilemedi:', topicError);
      }

      console.log('Toplanan veri özeti:', {
        studyRecords: data.studyRecords.length,
        netRecords: data.netRecords.length,
        topicProgress: data.topicProgress.length
      });

    } catch (error) {
      console.error('Veri toplama genel hatası:', error);
      alert(`Veri toplama hatası: ${error.message}`);
    }

    return data;
  };

  const createPDF = async (data, period, startDate, endDate) => {
    try {
      console.log('PDF oluşturuluyor...', data);
      
      // HTML içeriği oluştur
      const htmlContent = createPDFContent(data, period, startDate, endDate);
      
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
        const user = auth.currentUser;
        const periodText = period === 'week' ? 'Haftalik' : 'Aylik';
        const fileName = `${user?.displayName || 'YKS_Öğrenci'}_Çalışma_Raporu_${periodText}_${format(new Date(), 'dd-MM-yyyy', { locale: tr })}.pdf`;
        doc.save(fileName);
        
        console.log('PDF başarıyla oluşturuldu:', fileName);
        
      } catch (error) {
        console.error('PDF oluşturma hatası:', error);
        alert(`PDF oluşturulurken bir hata oluştu: ${error.message}`);
        throw error;
      } finally {
                 // Geçici div'i temizle
         document.body.removeChild(tempDiv);
       }
     } catch (pdfError) {
       console.error('PDF oluşturma hatası:', pdfError);
       alert(`PDF oluşturulurken hata oluştu: ${pdfError.message}`);
       throw pdfError;
     }
  };

  const createPDFContent = (data, period, startDate, endDate) => {
    const user = auth.currentUser;
    const periodText = period === 'week' ? 'Haftalık' : 'Aylık';
    
    // Çalışma verilerini işle
    const totalStudyHours = data.studyRecords.reduce((sum, record) => sum + (record.duration || 0), 0) / 3600; // saniye to saat
    const completedTopics = data.topicProgress.filter(topic => topic.completed);
    const pendingTopics = data.topicProgress.filter(topic => topic.needsReview);
    
    // Ders bazında çalışma saatleri
    const studyBySubject = {};
    data.studyRecords.forEach(record => {
      const subject = record.subject || 'Bilinmiyor';
      if (!studyBySubject[subject]) studyBySubject[subject] = 0;
      studyBySubject[subject] += (record.duration || 0) / 3600; // saniye to saat
    });
    
    // Net ortalama hesapla
    const averageNet = data.netRecords.length > 0 ? 
      data.netRecords.reduce((sum, record) => {
        const net = (record.correctCount || 0) - ((record.incorrectCount || 0) * 0.25);
        return sum + net;
      }, 0) / data.netRecords.length : 0;

    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8A2BE2 0%, #4B0082 100%); color: white; padding: 30px 20px; margin: -40px -40px 30px -40px; text-align: center; border-radius: 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎯 YKS Çalışma Asistanı</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 18px; font-weight: normal;">📊 ${periodText} Çalışma Raporu</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">👤 ${user?.displayName || user?.email?.split('@')[0] || 'YKS Adayı'}</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">${format(startDate, 'dd/MM/yyyy', { locale: tr })} - ${format(endDate, 'dd/MM/yyyy', { locale: tr })}</p>
        </div>

        <!-- Analizli Kronometre Bilgileri -->
        <div style="margin-bottom: 30px;">
          <div style="background: #4CAF50; color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: bold;">⏱️ ANALİZLİ KRONOMETRE VERİLERİ</h3>
          </div>
          <div style="padding: 0 20px;">
            <p><strong>📚 Toplam Çalışma Süresi:</strong> ${totalStudyHours.toFixed(1)} saat</p>
            <p><strong>📝 Çalışma Oturumu:</strong> ${data.studyRecords.length} oturum</p>
            <p><strong>⚡ Günlük Ortalama:</strong> ${(totalStudyHours / (period === 'week' ? 7 : 30)).toFixed(1)} saat</p>
            
            <h4 style="color: #4CAF50; margin-top: 20px;">📊 Ders Bazında Çalışma Saatleri:</h4>
            ${Object.entries(studyBySubject).map(([subject, hours]) => 
              `<p style="margin: 5px 0;"><strong>${subject}:</strong> ${hours.toFixed(1)} saat (${(hours / totalStudyHours * 100).toFixed(1)}%)</p>`
            ).join('')}
            
            <h4 style="color: #4CAF50; margin-top: 20px;">🎯 Detaylı Çalışma Kayıtları:</h4>
            <div style="max-height: 200px; overflow-y: auto;">
              ${data.studyRecords.map(record => {
                const duration = Math.round((record.duration || 0) / 60); // dakika
                const date = record.timestamp?.toDate ? 
                  format(record.timestamp.toDate(), 'dd/MM/yyyy', { locale: tr }) : 
                  'Bilinmiyor';
                return `<p style="margin: 3px 0; font-size: 13px; background: #f5f5f5; padding: 5px 10px; border-radius: 5px;">
                  <strong>${record.subject || 'Ders'}</strong> - ${record.topic || 'Konu'} | ${duration} dk | ${date}
                </p>`;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- TYT AYT Net Takibi -->
        ${data.netRecords.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <div style="background: #FF9800; color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: bold;">📈 TYT AYT NET TAKİBİ</h3>
          </div>
          <div style="padding: 0 20px;">
            <p><strong>📊 Toplam Deneme Sayısı:</strong> ${data.netRecords.length} deneme</p>
            <p><strong>🎯 Ortalama Net:</strong> ${averageNet.toFixed(2)} net</p>
            
            <h4 style="color: #FF9800; margin-top: 20px;">📋 Deneme Sonuçları:</h4>
            ${data.netRecords.map(record => {
              const net = (record.correctCount || 0) - ((record.incorrectCount || 0) * 0.25);
              const date = record.date?.toDate ? 
                format(record.date.toDate(), 'dd/MM/yyyy', { locale: tr }) : 
                'Bilinmiyor';
              return `<p style="margin: 5px 0; background: #fff3e0; padding: 8px 12px; border-radius: 5px; border-left: 4px solid #FF9800;">
                <strong>${record.examName || 'Deneme'}</strong> (${record.examType || 'TYT'}) | 
                <span style="color: #4CAF50;">${record.correctCount || 0} doğru</span>, 
                <span style="color: #f44336;">${record.incorrectCount || 0} yanlış</span> | 
                <strong>${net.toFixed(2)} net</strong> | ${date}
              </p>`;
            }).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Konu Takip Bilgileri -->
        ${data.topicProgress.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <div style="background: #E91E63; color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: bold;">📚 KONU TAKİP BİLGİLERİ</h3>
          </div>
          <div style="padding: 0 20px;">
            <p><strong>✅ Tamamlanan Konular:</strong> ${completedTopics.length} konu</p>
            <p><strong>🔄 Tekrar Edilecek Konular:</strong> ${pendingTopics.length} konu</p>
            <p><strong>📊 Başarı Oranı:</strong> ${data.topicProgress.length > 0 ? Math.round((completedTopics.length / data.topicProgress.length) * 100) : 0}%</p>
            
            ${completedTopics.length > 0 ? `
            <h4 style="color: #4CAF50; margin-top: 20px;">✅ Tamamlanan Konular:</h4>
            ${completedTopics.slice(0, 10).map(topic => 
              `<p style="margin: 3px 0; color: #4CAF50;">✓ <strong>${topic.subject}:</strong> ${topic.topic}</p>`
            ).join('')}
            ${completedTopics.length > 10 ? `<p style="color: #666; font-style: italic;">...ve ${completedTopics.length - 10} konu daha</p>` : ''}
            ` : ''}
            
            ${pendingTopics.length > 0 ? `
            <h4 style="color: #FF9800; margin-top: 20px;">🔄 Tekrar Edilecek Konular:</h4>
            ${pendingTopics.slice(0, 10).map(topic => 
              `<p style="margin: 3px 0; color: #FF9800;">⚡ <strong>${topic.subject}:</strong> ${topic.topic}</p>`
            ).join('')}
            ${pendingTopics.length > 10 ? `<p style="color: #666; font-style: italic;">...ve ${pendingTopics.length - 10} konu daha</p>` : ''}
            ` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Koçluk Önerileri -->
        <div style="margin-bottom: 30px;">
          <div style="background: #9C27B0; color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: bold;">💡 KOÇLUK ÖNERİLERİ</h3>
          </div>
          <div style="padding: 0 20px;">
            <p>• ${totalStudyHours > 20 ? 'Mükemmel! Çalışma disiplininiz harika devam edin.' : 'Çalışma sürenizi artırmanız gerekiyor. Günde en az 4 saat hedefleyin.'}</p>
            <p>• ${completedTopics.length > pendingTopics.length ? 'Konu tamamlama oranınız iyi, böyle devam edin.' : 'Daha fazla konuyu tamamlamaya odaklanın.'}</p>
            <p>• ${data.netRecords.length > 5 ? 'Deneme çözme düzeniniz iyi.' : 'Daha sık deneme çözmeye odaklanın.'}</p>
            <p>• ${averageNet > 80 ? 'Net ortalamanız çok iyi!' : averageNet > 50 ? 'Net ortalamanız orta seviyede, geliştirebilirsiniz.' : 'Net ortalamanızı yükseltmek için eksik konularınızı çalışın.'}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #8A2BE2; text-align: center; color: #666; font-size: 12px;">
          <p>🎯 YKS Çalışma Asistanı - Kişisel Gelişim Raporu</p>
          <p>📅 Oluşturulma Tarihi: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: tr })}</p>
          <p>💪 Başarılar dileriz!</p>
        </div>
      </div>
    `;
  };


  return (
    <StyledAppBar position="fixed">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              color: '#2a5956',
              display: { xs: 'none', sm: 'block' },
              fontFamily: 'Poppins, Montserrat, sans-serif',
              letterSpacing: '-0.5px'
            }}
          >
            YKS Çalışma Asistanı
          </Typography>
          

        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Rapor Çıkart" placement="bottom">
            <ModernReportButton
              aria-label="create report"
              onClick={() => setShowReportDialog(true)}
              generating={reportGenerating}
              disabled={reportGenerating}
            >
              <PictureAsPdfIcon />
            </ModernReportButton>
          </Tooltip>
          
          <Tooltip title="Bildirimler" placement="bottom">
            <ModernNotificationButton
              aria-label="show new notifications"
              onClick={handleNotificationClick}
              hasNotifications={unreadCount > 0}
            >
              <StyledBadge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                <NotificationsIcon />
              </StyledBadge>
            </ModernNotificationButton>
          </Tooltip>
          
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 0,
              sx: {
                borderRadius: '16px',
                minWidth: 320,
                mt: 1.5,
                overflow: 'visible',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(138, 43, 226, 0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 10px 20px rgba(138, 43, 226, 0.1)',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 20,
                  width: 12,
                  height: 12,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(138, 43, 226, 0.1)',
                  borderBottom: 'none',
                  borderRight: 'none',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <Box sx={{ 
              p: 2.5, 
              pb: 1.5, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.05) 0%, rgba(255, 20, 147, 0.05) 100%)',
              borderRadius: '16px 16px 0 0'
            }}>
              <Typography 
                variant="subtitle1" 
                fontWeight={700}
                sx={{ 
                  color: '#2a5956',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                🔔 Bildirimler
                {unreadCount > 0 && (
                  <Box sx={{
                    backgroundColor: '#FF4444',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    px: 1,
                    py: 0.3,
                    borderRadius: '12px',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {unreadCount}
                  </Box>
                )}
              </Typography>
              {unreadCount > 0 && (
                <Tooltip title="Tümünü okundu işaretle" placement="left">
                  <IconButton 
                    size="small" 
                    onClick={handleReadAllNotifications}
                    sx={{
                      backgroundColor: 'rgba(138, 43, 226, 0.1)',
                      color: '#8A2BE2',
                      '&:hover': {
                        backgroundColor: 'rgba(138, 43, 226, 0.2)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <DoneAllIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Divider />
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <MenuItem 
                  key={notification.id} 
                  sx={{ 
                    py: 1.5,
                    bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.light, 0.1)
                  }} 
                  onClick={() => handleReadNotification(notification.id)}
                >
                  <ListItemIcon sx={{ 
                    color: notification.type === 'warning' ? theme.palette.warning.main :
                           notification.type === 'error' ? theme.palette.error.main :
                           notification.type === 'success' ? theme.palette.success.main :
                           theme.palette.primary.main
                  }}>
                    {notification.type === 'warning' ? <WarningIcon /> :
                     notification.type === 'error' ? <ErrorIcon /> :
                     notification.type === 'success' ? <CheckCircleIcon /> :
                     <InfoIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                        {notification.message}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.createdAt).toLocaleString('tr-TR', { 
                          day: '2-digit', 
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    }
                  />
                </MenuItem>
              ))
            ) : (
              <Box sx={{ 
                py: 5, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5
              }}>
                <Box sx={{
                  fontSize: '3rem',
                  opacity: 0.3,
                  filter: 'grayscale(1)'
                }}>
                  🔕
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  }}
                >
                  Henüz bildirim bulunmuyor
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.disabled"
                  sx={{ 
                    fontSize: '0.8rem',
                    maxWidth: '200px',
                    lineHeight: 1.4
                  }}
                >
                  Yeni bildirimler burada görünecek
                </Typography>
              </Box>
            )}
          </Menu>
          
          <Tooltip title={userName || "Profil"}>
            <Box sx={{ ml: 1.5 }}>
              <ProfileAvatar 
                onClick={handleMenuClick} 
                src={userPhotoURL}
                sx={{ bgcolor: userPhotoURL ? 'transparent' : theme.palette.primary.main }}
              >
                {!userPhotoURL && getInitials(userName)}
              </ProfileAvatar>
            </Box>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 0,
              sx: {
                borderRadius: '24px',
                minWidth: 320,
                mt: 1.5,
                overflow: 'visible',
                background: 'linear-gradient(135deg, rgba(26, 5, 69, 0.95) 0%, rgba(45, 15, 90, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 10px 20px rgba(138, 43, 226, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 20,
                  width: 16,
                  height: 16,
                  background: 'linear-gradient(135deg, rgba(26, 5, 69, 0.95) 0%, rgba(45, 15, 90, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(138, 43, 226, 0.3)',
                  borderBottom: 'none',
                  borderRight: 'none',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '24px',
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
              },
            }}
          >
            {/* Premium Header Section */}
            <Box sx={{ 
              p: 3, 
              pb: 2,
              background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(30, 144, 255, 0.2) 100%)',
              borderRadius: '24px 24px 0 0',
              position: 'relative',
              overflow: 'hidden',
              borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
                animation: 'headerShine 3s ease-in-out infinite'
              },
              '@keyframes headerShine': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' }
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    right: -4,
                    bottom: -4,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #8A2BE2, #1E90FF, #FF1493)',
                    animation: 'avatarGlow 2s ease-in-out infinite alternate',
                    filter: 'blur(8px)',
                    opacity: 0.8
                  },
                  '@keyframes avatarGlow': {
                    '0%': { opacity: 0.6, transform: 'scale(1)' },
                    '100%': { opacity: 1, transform: 'scale(1.1)' }
                  }
                }}>
                  <ProfileAvatar 
                    src={userPhotoURL}
                    sx={{ 
                      bgcolor: userPhotoURL ? 'transparent' : theme.palette.primary.main,
                      width: 56,
                      height: 56,
                      position: 'relative',
                      zIndex: 1,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }}
                  >
                    {!userPhotoURL && getInitials(userName)}
                  </ProfileAvatar>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h6" 
                    fontWeight={700}
                    sx={{
                      color: '#ffffff',
                      fontSize: '1.1rem',
                      mb: 0.5,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {userName}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    {auth.currentUser?.email}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Menu Items */}
            <Box sx={{ p: 1 }}>
              <MenuItem 
                onClick={handleProfileClick} 
                sx={{ 
                  py: 2, 
                  px: 3,
                  borderRadius: '16px',
                  mb: 1,
                  background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(30, 144, 255, 0.15) 100%)',
                  border: '1px solid rgba(138, 43, 226, 0.2)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.25) 0%, rgba(30, 144, 255, 0.25) 100%)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 8px 25px rgba(138, 43, 226, 0.4), 0 4px 12px rgba(30, 144, 255, 0.2)',
                    border: '1px solid rgba(138, 43, 226, 0.4)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #8A2BE2 0%, #1E90FF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(138, 43, 226, 0.3)'
                  }}>
                    <PersonIcon sx={{ fontSize: '1.1rem', color: 'white' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary="Profil" 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontWeight: 600,
                      color: '#ffffff'
                    } 
                  }} 
                />
              </MenuItem>

              <MenuItem 
                onClick={handleClose} 
                sx={{ 
                  py: 2, 
                  px: 3,
                  borderRadius: '16px',
                  mb: 1,
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(139, 195, 74, 0.15) 100%)',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(139, 195, 74, 0.25) 100%)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4), 0 4px 12px rgba(139, 195, 74, 0.2)',
                    border: '1px solid rgba(76, 175, 80, 0.4)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                  }}>
                    <SettingsIcon sx={{ fontSize: '1.1rem', color: 'white' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary="Ayarlar" 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontWeight: 600,
                      color: '#ffffff'
                    } 
                  }} 
                />
              </MenuItem>

              {isAdmin && (
                <MenuItem 
                  onClick={() => {
                    handleAdminLogin();
                    handleClose();
                  }} 
                  sx={{ 
                    py: 2, 
                    px: 3,
                    borderRadius: '16px',
                    mb: 1,
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 193, 7, 0.15) 100%)',
                    border: '1px solid rgba(255, 152, 0, 0.2)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.25) 0%, rgba(255, 193, 7, 0.25) 100%)',
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: '0 8px 25px rgba(255, 152, 0, 0.4), 0 4px 12px rgba(255, 193, 7, 0.2)',
                      border: '1px solid rgba(255, 152, 0, 0.4)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                    }}>
                      <LockIcon sx={{ fontSize: '1.1rem', color: 'white' }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Admin Girişi" 
                    sx={{ 
                      '& .MuiTypography-root': { 
                        fontWeight: 600,
                        color: '#ffffff'
                      } 
                    }} 
                  />
                </MenuItem>
              )}

              {/* Divider */}
              <Box sx={{ 
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.3), transparent)',
                my: 1.5,
                mx: 2,
                boxShadow: '0 0 10px rgba(138, 43, 226, 0.2)'
              }} />

              <MenuItem 
                onClick={handleLogout} 
                sx={{ 
                  py: 2, 
                  px: 3,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(233, 30, 99, 0.15) 100%)',
                  border: '1px solid rgba(244, 67, 54, 0.2)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.25) 0%, rgba(233, 30, 99, 0.25) 100%)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 8px 25px rgba(244, 67, 54, 0.4), 0 4px 12px rgba(233, 30, 99, 0.2)',
                    border: '1px solid rgba(244, 67, 54, 0.4)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #F44336 0%, #E91E63 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                  }}>
                    <LogoutIcon sx={{ fontSize: '1.1rem', color: 'white' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary="Çıkış Yap" 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontWeight: 600,
                      color: '#ffffff'
                    } 
                  }} 
                />
              </MenuItem>
            </Box>
          </Menu>

      {/* Admin Giriş Dialog */}
      <Dialog open={showAdminDialog} onClose={handleAdminDialogClose}>
        <DialogTitle>Admin Girişi</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Admin Şifresi"
            type="password"
            fullWidth
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAdminDialogClose}>İptal</Button>
          <Button onClick={handleAdminPasswordSubmit} variant="contained" color="primary">
            Giriş
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rapor Çıkart Dialog */}
      <Dialog 
        open={showReportDialog} 
        onClose={() => setShowReportDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: 480,
            width: '100%',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2, 
          pt: 3,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(255, 87, 34, 0.4)'
            }}>
              <PictureAsPdfIcon sx={{ fontSize: '1.5rem', color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '1.3rem' }}>
                📊 Rapor Çıkart
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                Çalışma verilerinizi PDF olarak indirin
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
          <Typography variant="body1" sx={{ 
            color: 'rgba(255,255,255,0.9)', 
            mb: 3,
            textAlign: 'center',
            lineHeight: 1.6
          }}>
            Hangi süre aralığındaki verilerinizi rapor olarak almak istiyorsunuz?
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              onClick={() => generateReport('week')} 
              variant="contained"
              disabled={reportGenerating}
              sx={{ 
                py: 2,
                px: 4,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                },
                '&:disabled': {
                  opacity: 0.6,
                  cursor: 'not-allowed'
                }
              }}
            >
              📅 Son 1 Hafta
            </Button>
            
            <Button 
              onClick={() => generateReport('month')} 
              variant="contained"
              disabled={reportGenerating}
              sx={{ 
                py: 2,
                px: 4,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                },
                '&:disabled': {
                  opacity: 0.6,
                  cursor: 'not-allowed'
                }
              }}
            >
              📆 Son 1 Ay
            </Button>
          </Box>
          
          {reportGenerating && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 500
              }}>
                🔄 Rapor hazırlanıyor, lütfen bekleyin...
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowReportDialog(false)} 
            disabled={reportGenerating}
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: '10px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff'
              },
              '&:disabled': {
                opacity: 0.5
              }
            }}
          >
            ❌ İptal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
