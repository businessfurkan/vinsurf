import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Grid,
  Chip,
  Card,
  CardContent,
  Container,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Forum as ForumIcon,
  Settings as SettingsIcon,
  WorkspacesOutlined as StudyRoomIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Storage as DatabaseIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Visibility as VisibilityIcon,
  EmojiEvents as RekaNetIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../firebase';
import { collection, query, getDocs, doc, setDoc, serverTimestamp, onSnapshot, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    activeUsers: 0
  });
  
  // Çalışma Odası State'leri
  const [studyRoomActive, setStudyRoomActive] = useState(false);
  const [studyRoomStats, setStudyRoomStats] = useState({
    onlineUsers: 0,
    totalMessages: 0,
    activeSession: null
  });

  // RekaNET State'leri
  const [rekaNetActive, setRekaNetActive] = useState(false);
  const [rekaNetCountdown, setRekaNetCountdown] = useState(null);
  const [rekaNetStats, setRekaNetStats] = useState({
    totalParticipants: 0,
    totalSubmissions: 0,
    lastActivated: null,
    activatedBy: null,
    competitionEndTime: null
  });
  const [rekaNetSubmissions, setRekaNetSubmissions] = useState([]);
  

  
  // Bildirimler
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  const navigate = useNavigate();

  // Çalışma Odası istatistiklerini getir
  const fetchStudyRoomStats = useCallback(async () => {
    try {
      // Online kullanıcıları say
      const onlineUsersRef = collection(db, 'studyRoom', 'activeSession', 'onlineUsers');
      const onlineSnapshot = await getDocs(onlineUsersRef);
      let onlineCount = 0;
      
      onlineSnapshot.forEach((doc) => {
        const userData = doc.data();
        const lastSeen = userData.lastSeen?.toDate() || new Date(0);
        const now = new Date();
        if ((now - lastSeen) < 120000) {
          onlineCount++;
        }
      });

      // Toplam mesaj sayısını al
      const messagesRef = collection(db, 'studyRoom', 'activeSession', 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      
      setStudyRoomStats(prev => ({
        ...prev,
        onlineUsers: onlineCount,
        totalMessages: messagesSnapshot.size
      }));
    } catch (error) {
      console.error('Study room stats error:', error);
    }
  }, []);

  // RekaNET istatistiklerini getir
  const fetchRekaNetStats = useCallback(async () => {
    try {
      // RekaNET yarışma verilerini al
      const rekaNetRef = collection(db, 'rekaNetSubmissions');
      const submissionsSnapshot = await getDocs(rekaNetRef);
      
      const totalSubmissions = submissionsSnapshot.size;
      const uniqueParticipants = new Set();
      const submissionsData = [];
      
      // Kullanıcı profillerini almak için
      const userProfilesRef = collection(db, 'userProfiles');
      const userProfilesSnapshot = await getDocs(userProfilesRef);
      const userProfiles = {};
      
      userProfilesSnapshot.forEach((doc) => {
        userProfiles[doc.id] = doc.data();
      });

      submissionsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId) {
          uniqueParticipants.add(data.userId);
          
          // Kullanıcı bilgilerini ekle
          const userProfile = userProfiles[data.userId];
          submissionsData.push({
            id: doc.id,
            ...data,
            userName: userProfile?.displayName || 'Bilinmeyen Kullanıcı',
            userEmail: userProfile?.email || 'Bilinmeyen Email',
            submittedAt: data.submittedAt?.toDate() || new Date()
          });
        }
      });

      // Tarihe göre sırala (en yeni önce)
      submissionsData.sort((a, b) => b.submittedAt - a.submittedAt);

      setRekaNetStats(prev => ({
        ...prev,
        totalParticipants: uniqueParticipants.size,
        totalSubmissions: totalSubmissions
      }));
      
      setRekaNetSubmissions(submissionsData);
    } catch (error) {
      console.error('RekaNET stats error:', error);
    }
  }, []);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      // Get total users from userProfiles collection
      const usersQuery = query(collection(db, 'userProfiles'));
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;

      // Get active users (logged in within last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      let activeUsers = 0;
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const lastLogin = userData.lastLogin?.toDate();
        if (lastLogin && lastLogin >= sevenDaysAgo) {
          activeUsers++;
        }
      });

      // Get total forum posts
      const postsQuery = query(collection(db, 'forumPosts'));
      const postsSnapshot = await getDocs(postsQuery);
      const totalPosts = postsSnapshot.size;

      // Get total forum comments
      const commentsQuery = query(collection(db, 'forumComments'));
      const commentsSnapshot = await getDocs(commentsQuery);
      const totalComments = commentsSnapshot.size;

      console.log('Dashboard Stats:', {
        totalUsers,
        activeUsers,
        totalPosts,
        totalComments,
        studyRoomActive
      });

      setStats({
        totalUsers,
        activeUsers,
        totalPosts,
        totalComments
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Hata durumunda varsayılan değerler
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalPosts: 0,
        totalComments: 0
      });
    }
  }, [studyRoomActive]);

  // RekaNET durumunu takip et
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'rekaNet', 'competitionStatus'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setRekaNetActive(data.active || false);
        
        if (data.active && data.actualEndTime) {
          const endTime = new Date(data.actualEndTime);
          const now = new Date();
          
          if (endTime > now) {
            setRekaNetStats(prev => ({
              ...prev,
              lastActivated: data.lastActivated,
              activatedBy: data.activatedBy,
              competitionEndTime: endTime
            }));
          } else {
            // Süre dolmuş, yarışmayı otomatik kapat
            setDoc(doc.ref, { ...data, active: false });
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sayaç için useEffect
  useEffect(() => {
    let interval;
    
    if (rekaNetActive && rekaNetStats.competitionEndTime) {
      interval = setInterval(() => {
        const now = new Date();
        const endTime = rekaNetStats.competitionEndTime;
        const timeLeft = endTime - now;
        
        if (timeLeft <= 0) {
          setRekaNetCountdown('00:00:00');
          // Yarışmayı otomatik kapat
          const rekaNetRef = doc(db, 'rekaNet', 'competitionStatus');
          setDoc(rekaNetRef, { active: false }, { merge: true });
        } else {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          
          setRekaNetCountdown(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
        }
      }, 1000);
    } else {
      setRekaNetCountdown(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rekaNetActive, rekaNetStats.competitionEndTime]);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      if (user.email === 'businessfrkn@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  // Çalışma Odası durumunu dinle
  useEffect(() => {
    if (!isAdmin) return;

    const roomRef = doc(db, 'studyRoom', 'roomStatus');
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStudyRoomActive(data.active || false);
        setStudyRoomStats(prev => ({
          ...prev,
          activeSession: data.active ? {
            startTime: data.lastUpdated?.toDate(),
            updatedBy: data.updatedBy
          } : null
        }));
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // RekaNET durumunu dinle
  useEffect(() => {
    if (!isAdmin) return;

    const rekaNetRef = doc(db, 'rekaNet', 'competitionStatus');
    const unsubscribe = onSnapshot(rekaNetRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRekaNetActive(data.active || false);
        setRekaNetStats(prev => ({
          ...prev,
          lastActivated: data.lastActivated?.toDate(),
          activatedBy: data.activatedBy
        }));
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Fetch data when tab changes
  useEffect(() => {
    if (isAdmin) {
      if (tabValue === 0) {
        fetchDashboardStats();
        fetchStudyRoomStats();
        fetchRekaNetStats();
      } else if (tabValue === 4) {
        fetchStudyRoomStats();
      } else if (tabValue === 5) {
        fetchRekaNetStats();
        }
    }
  }, [tabValue, isAdmin, fetchDashboardStats, fetchStudyRoomStats, fetchRekaNetStats]);

  // Çalışma Odası toggle fonksiyonu
  const toggleStudyRoom = async () => {
    try {
      const roomRef = doc(db, 'studyRoom', 'roomStatus');
      const newActiveState = !studyRoomActive;
      
      await setDoc(roomRef, {
        active: newActiveState,
        lastUpdated: serverTimestamp(),
        updatedBy: user.uid
      });

      // Eğer oda kapatılıyorsa, mevcut mesajları ve online kullanıcıları temizle
      if (!newActiveState) {
        // Mesajları temizle
        const messagesRef = collection(db, 'studyRoom', 'activeSession', 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        const deletePromises = messagesSnapshot.docs.map(messageDoc => 
          deleteDoc(messageDoc.ref)
        );
        
        // Online kullanıcıları temizle
        const onlineUsersRef = collection(db, 'studyRoom', 'activeSession', 'onlineUsers');
        const onlineSnapshot = await getDocs(onlineUsersRef);
        const deleteOnlinePromises = onlineSnapshot.docs.map(userDoc => 
          deleteDoc(userDoc.ref)
        );
        
        await Promise.all([...deletePromises, ...deleteOnlinePromises]);
      }

      setSnackbar({
        open: true,
        message: newActiveState 
          ? '✅ Çalışma Odası başlatıldı! Kullanıcılar artık katılabilir.' 
          : '🛑 Çalışma Odası durduruldu ve temizlendi.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Study room toggle error:', error);
      setSnackbar({
        open: true,
        message: '❌ İşlem başarısız oldu!',
        severity: 'error'
      });
    }
  };

  // Çalışma Odası temizleme fonksiyonu
  const clearStudyRoomData = async () => {
    try {
      // Mesajları temizle
      const messagesRef = collection(db, 'studyRoom', 'activeSession', 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(messageDoc.ref)
      );
      
      await Promise.all(deletePromises);
      await fetchStudyRoomStats();

      setSnackbar({
        open: true,
        message: '🧹 Çalışma Odası verileri temizlendi!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Clear data error:', error);
      setSnackbar({
        open: true,
        message: '❌ Temizleme işlemi başarısız!',
        severity: 'error'
      });
    }
  };

  // RekaNET yarışması toggle fonksiyonu
  const toggleRekaNet = async () => {
    try {
      const rekaNetRef = doc(db, 'rekaNet', 'competitionStatus');
      const newActiveState = !rekaNetActive;
      
      let competitionEndTime = null;
      if (newActiveState) {
        // 24 saat sonrası için bitiş zamanı belirle
        competitionEndTime = new Date();
        competitionEndTime.setHours(competitionEndTime.getHours() + 24);
      }

      await setDoc(rekaNetRef, {
        active: newActiveState,
        lastActivated: serverTimestamp(),
        activatedBy: user.uid,
        activatedByEmail: user.email,
        competitionEndTime: competitionEndTime ? serverTimestamp() : null,
        // Gerçek bitiş zamanı için timestamp
        actualEndTime: competitionEndTime
      });

      setSnackbar({
        open: true,
        message: newActiveState 
          ? '🎯 RekaNET Yarışması başlatıldı! 24 saatlik süreç başladı.' 
          : '🛑 RekaNET Yarışması durduruldu.',
        severity: 'success'
      });

      // İstatistikleri güncelle
      await fetchRekaNetStats();
    } catch (error) {
      console.error('RekaNET toggle error:', error);
      setSnackbar({
        open: true,
        message: '❌ RekaNET işlemi başarısız oldu!',
        severity: 'error'
      });
    }
  };

  // RekaNET verilerini temizleme fonksiyonu
  const clearRekaNetData = async () => {
    try {
      // Tüm katılımcı verilerini temizle
      const submissionsRef = collection(db, 'rekaNetSubmissions');
      const submissionsSnapshot = await getDocs(submissionsRef);
      const deletePromises = submissionsSnapshot.docs.map(submissionDoc => 
        deleteDoc(submissionDoc.ref)
      );
      
      await Promise.all(deletePromises);
      await fetchRekaNetStats();

      setSnackbar({
        open: true,
        message: '🧹 RekaNET yarışma verileri temizlendi!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Clear RekaNET data error:', error);
      setSnackbar({
        open: true,
        message: '❌ RekaNET temizleme işlemi başarısız!',
        severity: 'error'
      });
    }
  };

  // Bildirimleri kapat
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, mt: 14 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress size={60} sx={{ color: '#E91E63' }} />
        </Box>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ py: 4, mt: 14 }}>
        <Card sx={{ 
          borderRadius: '20px',
          backgroundColor: '#2d4870',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <SecurityIcon sx={{ fontSize: 80, color: '#f44336', mb: 3 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff', mb: 2 }}>
              Yetkisiz Erişim
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 4 }}>
              Bu sayfaya erişim yetkiniz bulunmamaktadır.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/')} 
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                backgroundColor: '#E91E63',
                '&:hover': {
                  backgroundColor: '#C2185B',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 14 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 800, 
            color: '#ffffff',
            mb: 2,
            background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          🚀 Admin Kontrol Paneli
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Sistem yönetimi ve kontrol merkezi
        </Typography>
      </Box>

      {/* Modern Tab Navigation */}
      <Card sx={{ 
        borderRadius: '20px',
        backgroundColor: '#2d4870',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        mb: 4
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': {
              py: 3,
              px: 4,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              transition: 'all 0.3s ease',
              borderRadius: '16px',
              margin: '8px',
              minHeight: 'auto',
              '&.Mui-selected': {
                color: '#ffffff',
                backgroundColor: '#E91E63',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)'
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-1px)'
              }
            },
            '& .MuiTabs-indicator': {
              display: 'none'
            },
            '& .MuiTabs-scroller': {
              padding: '16px'
            }
          }}
        >
          <Tab icon={<DashboardIcon />} label="Dashboard" iconPosition="start" />
          <Tab icon={<PeopleIcon />} label="Kullanıcılar" iconPosition="start" />
          <Tab icon={<ForumIcon />} label="Forum" iconPosition="start" />
          <Tab icon={<SettingsIcon />} label="Ayarlar" iconPosition="start" />
          <Tab icon={<StudyRoomIcon />} label="Çalışma Odası" iconPosition="start" />
          <Tab icon={<RekaNetIcon />} label="RekaNET" iconPosition="start" />
          <Tab icon={<DatabaseIcon />} label="RekaNET Verileri" iconPosition="start" />
        </Tabs>
      </Card>

      {/* Dashboard Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Sistem Genel Bakış */}
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ 
              mb: 3, 
              fontWeight: 700, 
              color: '#ffffff',
              textAlign: 'center'
            }}>
              📊 Sistem Genel Bakış
            </Typography>
          </Grid>
          
          {/* Ana İstatistikler */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '16px',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-8px)' },
              height: '200px'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <PeopleIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h6" gutterBottom>Toplam Kullanıcı</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.totalUsers}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {stats.activeUsers} aktif (7 gün)
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: '16px',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-8px)' },
              height: '200px'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <ForumIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h6" gutterBottom>Forum Gönderileri</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.totalPosts}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {stats.totalComments} yorum
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              background: studyRoomActive 
                ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: 'white',
              borderRadius: '16px',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-8px)' },
              height: '200px'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <StudyRoomIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h6" gutterBottom>Çalışma Odası</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {studyRoomActive ? 'AKTİF' : 'PASİF'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {studyRoomStats.onlineUsers} online kullanıcı
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              background: rekaNetActive 
                ? 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)'
                : 'linear-gradient(135deg, #757575 0%, #424242 100%)',
              color: 'white',
              borderRadius: '16px',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-8px)' },
              height: '200px'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <RekaNetIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h6" gutterBottom>RekaNET Yarışması</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {rekaNetActive ? 'AKTİF' : 'PASİF'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {rekaNetStats.totalParticipants} katılımcı
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Hızlı Kontroller */}
          <Grid item xs={12}>
            <Card sx={{
              backgroundColor: '#2d4870',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ 
                  color: '#ffffff', 
                  fontWeight: 700, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  ⚡ Hızlı Kontroller
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={studyRoomActive ? <StopIcon /> : <StartIcon />}
                      onClick={toggleStudyRoom}
                      sx={{
                        py: 2,
                        backgroundColor: studyRoomActive ? '#f44336' : '#4CAF50',
                        fontWeight: 700,
                        '&:hover': {
                          backgroundColor: studyRoomActive ? '#d32f2f' : '#45a049',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {studyRoomActive ? 'Odayı Durdur' : 'Odayı Başlat'}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={rekaNetActive ? <StopIcon /> : <RekaNetIcon />}
                      onClick={toggleRekaNet}
                      sx={{
                        py: 2,
                        backgroundColor: rekaNetActive ? '#757575' : '#FF9800',
                        fontWeight: 700,
                        '&:hover': {
                          backgroundColor: rekaNetActive ? '#616161' : '#F57C00',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {rekaNetActive ? 'RekaNET Durdur' : 'RekaNET Başlat'}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<AnalyticsIcon />}
                      onClick={fetchDashboardStats}
                      sx={{
                        py: 2,
                        borderColor: '#E91E63',
                        color: '#E91E63',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: 'rgba(233, 30, 99, 0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      İstatistik Yenile
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<ForumIcon />}
                      onClick={() => setTabValue(2)}
                      sx={{
                        py: 2,
                        borderColor: '#9C27B0',
                        color: '#9C27B0',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: 'rgba(156, 39, 176, 0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Forum Yönet
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<PeopleIcon />}
                      onClick={() => setTabValue(1)}
                      sx={{
                        py: 2,
                        borderColor: '#2196F3',
                        color: '#2196F3',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Kullanıcılar
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Kullanıcılar Tab */}
      {tabValue === 1 && (
        <Card sx={{ 
          borderRadius: '20px',
          backgroundColor: '#2d4870',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 80, color: '#2196F3', mb: 3 }} />
            <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>
              👥 Kullanıcı Yönetimi
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
              Kullanıcı listesi, ban yönetimi ve kullanıcı istatistikleri
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Bu özellik yakında eklenecek...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Forum Tab */}
      {tabValue === 2 && (
        <Card sx={{ 
          borderRadius: '20px',
          backgroundColor: '#2d4870',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <ForumIcon sx={{ fontSize: 80, color: '#9C27B0', mb: 3 }} />
            <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>
              💬 Forum Yönetimi
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
              Gönderi moderasyonu, yorum yönetimi ve içerik denetimi
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Bu özellik yakında eklenecek...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Ayarlar Tab */}
      {tabValue === 3 && (
        <Card sx={{ 
          borderRadius: '20px',
          backgroundColor: '#2d4870',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <SettingsIcon sx={{ fontSize: 80, color: '#FF9800', mb: 3 }} />
            <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>
              ⚙️ Sistem Ayarları
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
              Genel sistem ayarları, güvenlik ve performans ayarları
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Bu özellik yakında eklenecek...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* RekaNET Tab */}
      {tabValue === 5 && (
        <Grid container spacing={3}>
          {/* RekaNET Başlık */}
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ 
              mb: 3, 
              fontWeight: 700, 
              color: '#ffffff',
              textAlign: 'center'
            }}>
              🎯 RekaNET Yarışma Kontrol Merkezi
            </Typography>
          </Grid>

          {/* Ana Kontrol Kartı */}
          <Grid item xs={12} md={8}>
            <Card sx={{
              background: rekaNetActive 
                ? 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)'
                : 'linear-gradient(135deg, #757575 0%, #424242 100%)',
              color: 'white',
              borderRadius: '24px',
              height: '280px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
                pointerEvents: 'none'
              }
            }}>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ mb: 3 }}>
                  <Chip 
                    icon={<RekaNetIcon />}
                    label={rekaNetActive ? 'YARIŞMA AKTİF' : 'YARIŞMA PASİF'}
                    size="large"
                    sx={{ 
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      px: 3,
                      py: 1
                    }}
                  />
                </Box>

                <Typography variant="h3" sx={{ 
                  color: '#ffffff', 
                  fontWeight: 900, 
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {rekaNetActive ? 'REKANET AKTİF' : 'YARIŞMA KAPALI'}
                </Typography>

                {/* Sayaç gösterimi */}
                {rekaNetActive && rekaNetCountdown && (
                  <Box sx={{ 
                    mb: 3, 
                    p: 2, 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      mb: 1 
                    }}>
                      ⏰ Kalan Süre
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      color: '#ffffff', 
                      fontWeight: 900,
                      fontFamily: 'monospace'
                    }}>
                      {rekaNetCountdown}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.7)' 
                    }}>
                      Saat:Dakika:Saniye
                    </Typography>
                  </Box>
                )}

                <Typography variant="body1" sx={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  mb: 4,
                  maxWidth: 400,
                  mx: 'auto'
                }}>
                  {rekaNetActive 
                    ? 'Öğrenciler şu anda net verilerini girebilir ve karşılaştırma yapabilir.'
                    : 'RekaNET yarışmasını başlatarak öğrencilerin katılmasını sağlayın.'
                  }
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={rekaNetActive ? <StopIcon /> : <RekaNetIcon />}
                  onClick={toggleRekaNet}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    backgroundColor: '#ffffff',
                    color: rekaNetActive ? '#b71c1c' : '#e65100',
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {rekaNetActive ? '🛑 Yarışmayı Durdur' : '🚀 Yarışmayı Başlat'}
                </Button>

                {rekaNetActive && rekaNetStats.lastActivated && (
                  <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Son Aktivasyon: {rekaNetStats.lastActivated?.toLocaleString('tr-TR')}
                    </Typography>
                    {rekaNetStats.activatedBy && (
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Tarafından: Admin
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* İstatistikler ve Kontroller */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {/* Yarışma İstatistikleri */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#1a0545', borderRadius: '16px' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ 
                      color: '#ffffff', 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      📊 Yarışma Verileri
                    </Typography>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <GroupIcon sx={{ color: '#FF9800' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Toplam Katılımcı"
                          secondary={`${rekaNetStats.totalParticipants} kişi`}
                          primaryTypographyProps={{ color: '#ffffff', fontWeight: 600 }}
                          secondaryTypographyProps={{ color: '#FF9800', fontWeight: 700 }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <AnalyticsIcon sx={{ color: '#4CAF50' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Toplam Gönderim"
                          secondary={`${rekaNetStats.totalSubmissions} net verisi`}
                          primaryTypographyProps={{ color: '#ffffff', fontWeight: 600 }}
                          secondaryTypographyProps={{ color: '#4CAF50', fontWeight: 700 }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Yönetim Butonları */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#2d4870', borderRadius: '16px' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                      🔧 RekaNET Yönetimi
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<AnalyticsIcon />}
                        onClick={fetchRekaNetStats}
                        sx={{ 
                          borderColor: '#FF9800',
                          color: '#FF9800',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 152, 0, 0.1)'
                          }
                        }}
                      >
                        İstatistikleri Yenile
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={clearRekaNetData}
                        sx={{ 
                          borderColor: '#f44336',
                          color: '#f44336',
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.1)'
                          }
                        }}
                      >
                        Yarışma Verilerini Temizle
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate('/rekanet')}
                        sx={{ 
                          borderColor: '#4CAF50',
                          color: '#4CAF50',
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.1)'
                          }
                        }}
                      >
                        RekaNET&apos;i Görüntüle
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Çalışma Odası Tab */}
      {tabValue === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ 
              color: '#ffffff', 
              fontWeight: 700, 
              mb: 3,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}>
              <StudyRoomIcon sx={{ color: '#E91E63', fontSize: 40 }} />
              Çalışma Odası Kontrol Merkezi
            </Typography>
          </Grid>

          {/* Ana Kontrol Paneli */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              backgroundColor: studyRoomActive ? '#1b5e20' : '#b71c1c',
              borderRadius: '20px',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    Çalışma Odası Durumu
                  </Typography>
                  <Chip 
                    label={studyRoomActive ? '🟢 AKTİF' : '🔴 PASİF'}
                    size="large"
                    sx={{ 
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      px: 3,
                      py: 1
                    }}
                  />
                </Box>

                <Typography variant="h3" sx={{ 
                  color: '#ffffff', 
                  fontWeight: 900, 
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {studyRoomActive ? 'ÇALIŞMA AKTIF' : 'ODA KAPALI'}
                </Typography>

                <Typography variant="body1" sx={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  mb: 4,
                  maxWidth: 400,
                  mx: 'auto'
                }}>
                  {studyRoomActive 
                    ? 'Öğrenciler şu anda odaya katılabilir ve sohbet edebilir.'
                    : 'Çalışma odasını başlatarak öğrencilerin katılmasını sağlayın.'
                  }
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={studyRoomActive ? <StopIcon /> : <StartIcon />}
                  onClick={toggleStudyRoom}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    backgroundColor: '#ffffff',
                    color: studyRoomActive ? '#b71c1c' : '#1b5e20',
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {studyRoomActive ? '🛑 Odayı Durdur' : '🚀 Odayı Başlat'}
                </Button>

                {studyRoomActive && studyRoomStats.activeSession && (
                  <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Oturum Başlangıç: {studyRoomStats.activeSession.startTime?.toLocaleString('tr-TR')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* İstatistikler ve Kontroller */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {/* Anlık İstatistikler */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#1a0545', borderRadius: '16px' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ 
                      color: '#ffffff', 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      📊 Anlık Veriler
                    </Typography>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <GroupIcon sx={{ color: '#4CAF50' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Online Kullanıcılar"
                          secondary={`${studyRoomStats.onlineUsers} kişi`}
                          primaryTypographyProps={{ color: '#ffffff', fontWeight: 600 }}
                          secondaryTypographyProps={{ color: '#4CAF50', fontWeight: 700 }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <MessageIcon sx={{ color: '#2196F3' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Toplam Mesajlar"
                          secondary={`${studyRoomStats.totalMessages} mesaj`}
                          primaryTypographyProps={{ color: '#ffffff', fontWeight: 600 }}
                          secondaryTypographyProps={{ color: '#2196F3', fontWeight: 700 }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Yönetim Butonları */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#2d4870', borderRadius: '16px' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                      🔧 Yönetim Araçları
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<AnalyticsIcon />}
                        onClick={fetchStudyRoomStats}
                        sx={{ 
                          borderColor: '#E91E63',
                          color: '#E91E63',
                          '&:hover': {
                            backgroundColor: 'rgba(233, 30, 99, 0.1)'
                          }
                        }}
                      >
                        İstatistikleri Yenile
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<DatabaseIcon />}
                        onClick={clearStudyRoomData}
                        disabled={!studyRoomActive}
                        sx={{ 
                          borderColor: '#FF9800',
                          color: '#FF9800',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 152, 0, 0.1)'
                          },
                          '&:disabled': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.3)'
                          }
                        }}
                      >
                        Verileri Temizle
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate('/calisma-odasi')}
                        sx={{ 
                          borderColor: '#4CAF50',
                          color: '#4CAF50',
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.1)'
                          }
                        }}
                      >
                        Odayı Görüntüle
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* RekaNET Verileri Tab */}
      {tabValue === 6 && (
        <Grid container spacing={3}>
          {/* Başlık */}
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ 
              mb: 3, 
              fontWeight: 700, 
              color: '#ffffff',
              textAlign: 'center'
            }}>
              📊 Bugünkü RekaNET Verileri
            </Typography>
          </Grid>

          {/* Özet İstatistikler */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#1a0545', borderRadius: '16px' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <GroupIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                    <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 900 }}>
                      {rekaNetStats.totalParticipants}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      Toplam Katılımcı
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#1a0545', borderRadius: '16px' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <AnalyticsIcon sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
                    <Typography variant="h4" sx={{ color: '#FF9800', fontWeight: 900 }}>
                      {rekaNetStats.totalSubmissions}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      Toplam Gönderim
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#1a0545', borderRadius: '16px' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <RekaNetIcon sx={{ fontSize: 40, color: '#E91E63', mb: 1 }} />
                    <Typography variant="h4" sx={{ color: '#E91E63', fontWeight: 900 }}>
                      {rekaNetActive ? 'AKTİF' : 'PASİF'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      Yarışma Durumu
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#1a0545', borderRadius: '16px' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" sx={{ color: '#2196F3', mb: 1 }}>⏰</Typography>
                    <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 900, fontSize: '1.2rem' }}>
                      {rekaNetCountdown || '--:--:--'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      Kalan Süre
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Katılımcı Verileri Tablosu */}
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: '#2d4870', borderRadius: '16px' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>
                    👥 Katılımcı Detayları
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AnalyticsIcon />}
                    onClick={fetchRekaNetStats}
                    sx={{ 
                      borderColor: '#4CAF50',
                      color: '#4CAF50',
                      '&:hover': {
                        backgroundColor: 'rgba(76, 175, 80, 0.1)'
                      }
                    }}
                  >
                    Yenile
                  </Button>
                </Box>

                {rekaNetSubmissions.length > 0 ? (
                  <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {rekaNetSubmissions.map((submission, index) => {
                      // TYT ve AYT toplamlarını hesapla
                      const tytTotal = Object.values(submission.tytScores || {}).reduce((sum, subject) => {
                        return sum + (subject.correct || 0);
                      }, 0);
                      
                      const aytTotal = Object.values(submission.aytScores || {}).reduce((sum, subject) => {
                        return sum + (subject.correct || 0);
                      }, 0);

                      return (
                        <Card key={submission.id} sx={{ 
                          mb: 2, 
                          backgroundColor: '#1a0545',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <CardContent sx={{ p: 3 }}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} md={3}>
                                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>
                                  {submission.userName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                  {submission.userEmail}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                  📍 {submission.province || 'Belirtilmemiş'}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12} md={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 900 }}>
                                    {tytTotal}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#ffffff' }}>
                                    TYT Net Toplamı
                                  </Typography>
                                </Box>
                              </Grid>
                              
                              <Grid item xs={12} md={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h4" sx={{ color: '#FF9800', fontWeight: 900 }}>
                                    {aytTotal}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#ffffff' }}>
                                    AYT Net Toplamı
                                  </Typography>
                                </Box>
                              </Grid>
                              
                              <Grid item xs={12} md={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h4" sx={{ color: '#E91E63', fontWeight: 900 }}>
                                    {tytTotal + aytTotal}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#ffffff' }}>
                                    Toplam Net
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 1 }}>
                                    {submission.submittedAt.toLocaleString('tr-TR')}
                                  </Typography>
                                  {submission.includeNationalRanking && (
                                    <Chip 
                                      label="🇹🇷 Türkiye Geneli" 
                                      size="small" 
                                      sx={{ 
                                        mt: 1,
                                        backgroundColor: 'rgba(78, 205, 196, 0.2)',
                                        color: '#4ECDC4'
                                      }} 
                                    />
                                  )}
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <DatabaseIcon sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                      Henüz veri bulunmuyor
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      RekaNET yarışması başlatıldığında katılımcı verileri burada görünecek.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanel; 
