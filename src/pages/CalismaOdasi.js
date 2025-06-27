import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent,
  Box,
  TextField,
  Button,
  Paper,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  Fade,
  CircularProgress,
  Slide,
  Zoom,
  Avatar,
  Badge,
  styled,
  keyframes
} from '@mui/material';
import {
  Send as SendIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  WorkspacesOutlined as WorkspacesIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Reply as ReplyIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  Bolt as BoltIcon,
  Star as StarIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

// Animasyonlar ve stil tanımları
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 20px rgba(33, 150, 243, 0.3); }
  50% { box-shadow: 0 0 30px rgba(33, 150, 243, 0.5), 0 0 40px rgba(33, 150, 243, 0.3); }
  100% { box-shadow: 0 0 20px rgba(33, 150, 243, 0.3); }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Styled components
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: '24px',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover::before': {
    left: '100%',
  },
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
  }
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: '16px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 30px rgba(33, 150, 243, 0.5)',
    background: 'linear-gradient(135deg, #42A5F5 0%, #2196F3 100%)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  }
}));

const AnimatedChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderRadius: '12px',
  animation: `${pulseAnimation} 2s infinite`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
}));

const MessageBubble = styled(Paper)(({ theme }) => ({
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateX(5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
    '& .message-actions': {
      opacity: 1,
      transform: 'translateX(0)',
    }
  }
}));

const CalismaOdasi = () => {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomActive, setRoomActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);

  // Admin kontrolü
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        setIsAdmin(adminDoc.exists() && adminDoc.data().isAdmin === true);
      } catch (error) {
        console.error('Admin kontrolü hatası:', error);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Oda durumunu dinle
  useEffect(() => {
    const roomRef = doc(db, 'studyRoom', 'roomStatus');
    
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        setRoomActive(doc.data().active || false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Mesajları dinle
  useEffect(() => {
    if (!roomActive) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, 'studyRoom', 'activeSession', 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = [];
      
      snapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() });
      });
      
      setMessages(messageList);
    });

    return () => unsubscribe();
  }, [roomActive, messages.length, user]);

  // Online kullanıcıları dinle
  useEffect(() => {
    if (!roomActive || !user) {
      setOnlineUsers([]);
      return;
    }

    // Kullanıcının online durumunu güncelle
    const updateUserPresence = async () => {
      const userPresenceRef = doc(db, 'studyRoom', 'activeSession', 'onlineUsers', user.uid);
      await setDoc(userPresenceRef, {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonim',
        lastSeen: serverTimestamp(),
        online: true
      });
    };

    updateUserPresence();
    const presenceInterval = setInterval(updateUserPresence, 30000); // 30 saniyede bir güncelle

    // Online kullanıcıları dinle
    const onlineUsersRef = collection(db, 'studyRoom', 'activeSession', 'onlineUsers');
    const unsubscribe = onSnapshot(onlineUsersRef, (snapshot) => {
      const userList = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        const now = new Date();
        const lastSeen = userData.lastSeen?.toDate() || new Date(0);
        const isOnline = (now - lastSeen) < 60000; // 1 dakika içinde aktifse online
        
        if (isOnline) {
          userList.push({ id: doc.id, ...userData });
        }
      });
      setOnlineUsers(userList);
    });

    return () => {
      clearInterval(presenceInterval);
      unsubscribe();
    };
  }, [roomActive, user]);

  // Online kullanıcıları takip et
  useEffect(() => {
    if (!roomActive || !user) {
      setOnlineUsers([]);
      return;
    }

    // Basit online user tracking - her 30 saniyede presence güncelle
    const updatePresence = async () => {
      try {
        const userRef = doc(db, 'studyRoom', 'activeSession', 'onlineUsers', user.uid);
        await setDoc(userRef, {
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0] || 'Anonim',
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error('Presence update error:', error);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000);

    // Online kullanıcıları dinle
    const usersRef = collection(db, 'studyRoom', 'activeSession', 'onlineUsers');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        const lastSeen = userData.lastSeen?.toDate() || new Date(0);
        const now = new Date();
        
        // 2 dakika içinde aktifse online say
        if ((now - lastSeen) < 120000) {
          users.push({ id: doc.id, ...userData });
        }
      });
      setOnlineUsers(users);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [roomActive, user]);

  // Mesajları otomatik scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Oda başlat/durdur
  const toggleRoom = async () => {
    if (!isAdmin) return;

    try {
      const roomRef = doc(db, 'studyRoom', 'roomStatus');
      await setDoc(roomRef, {
        active: !roomActive,
        lastUpdated: serverTimestamp(),
        updatedBy: user.uid
      });

      showNotification(
        roomActive ? 'Çalışma odası durduruldu' : 'Çalışma odası başlatıldı',
        'success'
      );
    } catch (error) {
      console.error('Oda durumu değiştirme hatası:', error);
      showNotification('İşlem başarısız', 'error');
    }
  };

  // Mesaj gönder
  const sendMessage = async () => {
    if (!newMessage.trim() || !roomActive || !user) return;

    // Spam koruması - 1 dakika limit
    const now = Date.now();
    const timeDiff = now - lastMessageTime;
    if (timeDiff < 60000 && !isAdmin) { // Admin'ler için limit yok
      const remainingTime = Math.ceil((60000 - timeDiff) / 1000);
      showNotification(`${remainingTime} saniye sonra mesaj gönderebilirsiniz`, 'warning');
      return;
    }

    setSending(true);
    try {
      const messagesRef = collection(db, 'studyRoom', 'activeSession', 'messages');
      const messageData = {
        text: newMessage.trim(),
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonim',
        userEmail: user.email,
        timestamp: serverTimestamp()
      };

      // Reply varsa ekle
      if (replyingTo) {
        messageData.replyTo = {
          messageId: replyingTo.id,
          text: replyingTo.text,
          userName: replyingTo.userName
        };
      }

      await addDoc(messagesRef, messageData);

      setNewMessage('');
      setReplyingTo(null);
      setLastMessageTime(now);
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      showNotification('Mesaj gönderilemedi', 'error');
    } finally {
      setSending(false);
    }
  };

  // Mesaj sil
  const deleteMessage = async (messageId, messageUserId) => {
    if (messageUserId !== user.uid && !isAdmin) return;

    try {
      await deleteDoc(doc(db, 'studyRoom', 'activeSession', 'messages', messageId));
      showNotification('Mesaj silindi', 'success');
    } catch (error) {
      console.error('Mesaj silme hatası:', error);
      showNotification('Mesaj silinemedi', 'error');
    }
  };

  // Mesaja yanıt ver
  const replyToMessage = (message) => {
    setReplyingTo(message);
    // Input'a focus ver
    setTimeout(() => {
      const input = document.querySelector('textarea');
      if (input) input.focus();
    }, 100);
  };

  // Bildirim göster
  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Enter tuşu ile mesaj gönder
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Zaman formatla
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Kullanıcı rengi üret
  const getUserColor = (userId) => {
    const colors = ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ 
        py: 4, 
        mt: 14,
        bgcolor: '#1a0545',
        minHeight: '100vh'
      }}>
        <GlassCard sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 3 
          }}>
            <Box sx={{ 
              animation: `${floatAnimation} 2s ease-in-out infinite`,
              position: 'relative'
            }}>
              <ChatIcon sx={{ 
                fontSize: 80, 
                color: '#2196F3',
                filter: 'drop-shadow(0 4px 8px rgba(33, 150, 243, 0.3))'
              }} />
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120px',
                height: '120px',
                border: '3px solid rgba(33, 150, 243, 0.3)',
                borderRadius: '50%',
                animation: `${pulseAnimation} 2s infinite`
              }} />
            </Box>
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{ 
                color: '#2196F3',
                animation: `${glowAnimation} 2s infinite`
              }} 
            />
            <Typography variant="h5" sx={{ 
              color: '#ffffff', 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3, #42A5F5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Çalışma Odası Yükleniyor...
            </Typography>
            <Typography sx={{ 
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              Arkadaşlarınla birlikte çalışabileceğin, sohbet edebileceğin modern çalışma ortamın hazırlanıyor ✨
            </Typography>
          </Box>
        </GlassCard>
      </Container>
    );
  }

  return (
            <Container maxWidth="lg" sx={{ 
          py: 4, 
          mt: 14,
          bgcolor: '#1a0545',
          minHeight: '100vh'
        }}>
      {/* Modern Header */}
      <Zoom in={true} timeout={800}>
        <GlassCard sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ 
                  position: 'relative',
                  animation: `${floatAnimation} 3s ease-in-out infinite`
                }}>
                  <WorkspacesIcon sx={{ 
                    fontSize: 50, 
                    color: '#2196F3',
                    filter: 'drop-shadow(0 4px 8px rgba(33, 150, 243, 0.4))'
                  }} />
                  <AutoAwesomeIcon sx={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    fontSize: 20,
                    color: '#FFD700',
                    animation: `${pulseAnimation} 1.5s infinite`
                  }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 800, 
                    color: '#ffffff',
                    background: 'linear-gradient(45deg, #2196F3, #42A5F5, #FFD700)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}>
                    Çalışma Odası ✨
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <AnimatedChip
                      label={roomActive ? '🟢 AKTİF' : '🔴 PASİF'}
                      size="medium"
                      sx={{
                        backgroundColor: roomActive ? 
                          'linear-gradient(135deg, #4CAF50, #66BB6A)' : 
                          'linear-gradient(135deg, #757575, #9E9E9E)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    />
                    <Chip
                      icon={<ChatIcon />}
                      label={`${messages.length} mesaj`}
                      size="medium"
                      sx={{
                        backgroundColor: 'rgba(33, 150, 243, 0.2)',
                        color: '#2196F3',
                        border: '1px solid rgba(33, 150, 243, 0.3)',
                        fontWeight: 600
                      }}
                    />
                    {roomActive && (
                      <Tooltip title="Şu anda online olan kullanıcılar" arrow>
                        <Badge 
                          badgeContent={onlineUsers.length} 
                          color="success"
                          sx={{
                            '& .MuiBadge-badge': {
                              animation: `${pulseAnimation} 2s infinite`
                            }
                          }}
                        >
                          <Chip
                            icon={<PeopleIcon />}
                            label="Online"
                            size="medium"
                            sx={{
                              backgroundColor: 'rgba(76, 175, 80, 0.2)',
                              color: '#4CAF50',
                              border: '1px solid rgba(76, 175, 80, 0.3)',
                              fontWeight: 600
                            }}
                          />
                        </Badge>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Modern Admin Kontrolleri */}
              {isAdmin && (
                <Slide direction="left" in={true} timeout={1000}>
                  <ModernButton
                    startIcon={roomActive ? <StopIcon /> : <StartIcon />}
                    onClick={toggleRoom}
                    sx={{
                      background: roomActive ? 
                        'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' : 
                        'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                      animation: `${glowAnimation} 3s infinite`,
                      minWidth: '160px'
                    }}
                  >
                    {roomActive ? '⏹️ Durdur' : '▶️ Başlat'}
                  </ModernButton>
                </Slide>
              )}
            </Box>
          </CardContent>
        </GlassCard>
      </Zoom>

      {/* Modern Admin Oda Başlatma Uyarısı */}
      {isAdmin && !roomActive && (
        <Slide direction="up" in={true} timeout={1200}>
          <GlassCard sx={{ 
            mb: 3,
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(102, 187, 106, 0.2) 100%)',
            border: '2px solid rgba(76, 175, 80, 0.4)',
            animation: `${glowAnimation} 2s infinite`
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 3 
              }}>
                <Box sx={{ 
                  position: 'relative',
                  animation: `${floatAnimation} 2s ease-in-out infinite`
                }}>
                  <BoltIcon sx={{ 
                    fontSize: 60, 
                    color: '#4CAF50',
                    filter: 'drop-shadow(0 4px 8px rgba(76, 175, 80, 0.4))'
                  }} />
                  <StarIcon sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    fontSize: 25,
                    color: '#FFD700',
                    animation: `${pulseAnimation} 1s infinite`
                  }} />
                </Box>
                <Typography variant="h5" sx={{ 
                  color: '#ffffff', 
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  🚀 Admin Paneli
                </Typography>
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  maxWidth: '500px',
                  lineHeight: 1.6
                }}>
                  Çalışma odası şu anda kapalı. Kullanıcıların birlikte çalışabilmesi ve sohbet edebilmesi için odayı başlatın.
                </Typography>
                <ModernButton
                  size="large"
                  startIcon={<StartIcon />}
                  onClick={toggleRoom}
                  sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                    color: '#4CAF50',
                    fontSize: '1.2rem',
                    px: 5,
                    py: 2,
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 12px 35px rgba(76, 175, 80, 0.5)',
                    }
                  }}
                >
                  🎯 Çalışma Odasını Başlat
                </ModernButton>
              </Box>
            </CardContent>
          </GlassCard>
        </Slide>
      )}

      {/* Modern Admin Oda Aktif Bilgisi */}
      {isAdmin && roomActive && (
        <Slide direction="down" in={true} timeout={1000}>
          <GlassCard sx={{ 
            mb: 3,
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(25, 118, 210, 0.2) 100%)',
            border: '2px solid rgba(33, 150, 243, 0.4)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ 
                    animation: `${pulseAnimation} 2s infinite`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <BoltIcon sx={{ fontSize: 30, color: '#2196F3' }} />
                    <Typography variant="h6" sx={{ 
                      color: '#ffffff', 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #2196F3, #64B5F6)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      ⚡ Admin: Oda Aktif
                    </Typography>
                  </Box>
                  <AnimatedChip
                    icon={<PeopleIcon />}
                    label={`${onlineUsers.length} kullanıcı online`}
                    size="medium"
                    sx={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                      color: '#2196F3',
                      fontWeight: 700,
                      border: '2px solid rgba(33, 150, 243, 0.3)'
                    }}
                  />
                </Box>
                <ModernButton
                  startIcon={<StopIcon />}
                  onClick={toggleRoom}
                  size="medium"
                  sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                    color: '#2196F3',
                    boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                    minWidth: '140px'
                  }}
                >
                  🛑 Durdur
                </ModernButton>
              </Box>
            </CardContent>
          </GlassCard>
        </Slide>
      )}

      {/* Modern Chat Area */}
      <Fade in={true} timeout={1500}>
        <GlassCard sx={{ 
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
          <Box sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(25, 118, 210, 0.2) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ChatIcon sx={{ 
                fontSize: 28, 
                color: '#2196F3',
                animation: `${pulseAnimation} 2s infinite`
              }} />
              <Typography variant="h6" sx={{
                color: '#ffffff',
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2196F3, #42A5F5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                💬 Canlı Sohbet
              </Typography>
            </Box>
            {roomActive && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#4CAF50',
                  animation: `${pulseAnimation} 1s infinite`
                }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                  Bağlantı Aktif
                </Typography>
              </Box>
            )}
          </Box>

          {/* Mesajlar Alanı */}
          <Box sx={{ 
            flexGrow: 1, 
            p: 3, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(45deg, #2196F3, #42A5F5)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'linear-gradient(45deg, #42A5F5, #2196F3)',
            }
          }}>
            {!roomActive ? (
              <Fade in={true} timeout={1000}>
                <Box sx={{ 
                  textAlign: 'center', 
                  mt: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <Box sx={{ 
                    animation: `${floatAnimation} 3s ease-in-out infinite`,
                    opacity: 0.6
                  }}>
                    <ChatIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.3)' }} />
                  </Box>
                  <Typography variant="h6" sx={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontWeight: 600,
                    mb: 1
                  }}>
                    🔒 Çalışma odası şu anda kapalı
                  </Typography>
                  <Typography sx={{ 
                    color: 'rgba(255,255,255,0.5)',
                    maxWidth: '400px',
                    lineHeight: 1.6
                  }}>
                    Admin tarafından oda açıldığında arkadaşlarınla sohbet edebilir, birlikte çalışabilirsin
                  </Typography>
                </Box>
              </Fade>
            ) : messages.length === 0 ? (
              <Fade in={true} timeout={1000}>
                <Box sx={{ 
                  textAlign: 'center', 
                  mt: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <Box sx={{ 
                    animation: `${floatAnimation} 2s ease-in-out infinite`,
                    position: 'relative'
                  }}>
                    <ChatIcon sx={{ fontSize: 60, color: '#2196F3' }} />
                    <AutoAwesomeIcon sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      fontSize: 25,
                      color: '#FFD700',
                      animation: `${pulseAnimation} 1.5s infinite`
                    }} />
                  </Box>
                  <Typography variant="h6" sx={{ 
                    color: '#ffffff', 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #2196F3, #42A5F5)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    🎉 Sohbet başlasın!
                  </Typography>
                  <Typography sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '1.1rem'
                  }}>
                    Henüz mesaj yok. İlk mesajı sen at ve arkadaşlarınla buluş! 💬✨
                  </Typography>
                </Box>
              </Fade>
            ) : (
             messages.map((message, index) => (
               <Slide key={message.id} direction="up" in={true} timeout={300 + index * 50}>
                 <MessageBubble
                   sx={{
                     p: 3,
                     mb: 2,
                     position: 'relative',
                     '&:hover .message-actions': {
                       opacity: 1,
                       transform: 'translateX(0)',
                     }
                   }}
                 >
                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                       <Avatar sx={{ 
                         width: 32, 
                         height: 32, 
                         backgroundColor: getUserColor(message.userId),
                         fontSize: '0.8rem',
                         fontWeight: 700,
                         border: '2px solid rgba(255, 255, 255, 0.2)'
                       }}>
                         {message.userName.charAt(0).toUpperCase()}
                       </Avatar>
                       <Box>
                         <Typography variant="subtitle2" sx={{ 
                           color: '#ffffff', 
                           fontWeight: 700,
                           lineHeight: 1.2
                         }}>
                           {message.userName}
                         </Typography>
                         <Typography variant="caption" sx={{ 
                           color: 'rgba(255,255,255,0.6)',
                           fontSize: '0.75rem'
                         }}>
                           {formatTime(message.timestamp)}
                         </Typography>
                       </Box>
                     </Box>
                     
                     {/* Modern Action butonları */}
                     <Box 
                       className="message-actions"
                       sx={{ 
                         display: 'flex', 
                         gap: 1,
                         opacity: 0,
                         transform: 'translateX(10px)',
                         transition: 'all 0.3s ease'
                       }}
                     >
                       <Tooltip title="💬 Yanıtla" arrow>
                         <IconButton
                           size="small"
                           onClick={() => replyToMessage(message)}
                           sx={{
                             backgroundColor: 'rgba(33, 150, 243, 0.2)',
                             color: '#2196F3',
                             border: '1px solid rgba(33, 150, 243, 0.3)',
                             '&:hover': {
                               backgroundColor: 'rgba(33, 150, 243, 0.3)',
                               transform: 'scale(1.1)'
                             }
                           }}
                         >
                           <ReplyIcon fontSize="small" />
                         </IconButton>
                       </Tooltip>

                       {(message.userId === user?.uid || isAdmin) && (
                         <Tooltip title="🗑️ Sil" arrow>
                           <IconButton
                             size="small"
                             onClick={() => deleteMessage(message.id, message.userId)}
                             sx={{
                               backgroundColor: 'rgba(244, 67, 54, 0.2)',
                               color: '#f44336',
                               border: '1px solid rgba(244, 67, 54, 0.3)',
                               '&:hover': {
                                 backgroundColor: 'rgba(244, 67, 54, 0.3)',
                                 transform: 'scale(1.1)'
                               }
                             }}
                           >
                             <DeleteIcon fontSize="small" />
                           </IconButton>
                         </Tooltip>
                       )}
                     </Box>
                   </Box>
                     
                     {/* Reply gösterimi */}
                     {message.replyTo && (
                       <Box sx={{ 
                         mt: 1, 
                         p: 1, 
                         backgroundColor: 'rgba(255,255,255,0.05)',
                         borderRadius: '8px',
                         borderLeft: '3px solid #2196F3'
                       }}>
                         <Typography variant="caption" sx={{ color: '#2196F3', fontWeight: 600 }}>
                           {message.replyTo.userName} kullanıcısına yanıt:
                         </Typography>
                         <Typography variant="caption" sx={{ 
                           color: 'rgba(255,255,255,0.7)', 
                           display: 'block',
                           fontStyle: 'italic',
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           whiteSpace: 'nowrap'
                         }}>
                           {message.replyTo.text}
                         </Typography>
                       </Box>
                     )}
                     
                     <Typography sx={{ 
                       color: '#ffffff', 
                       fontSize: '1rem',
                       lineHeight: 1.5,
                       mt: message.replyTo ? 2 : 1,
                       wordBreak: 'break-word'
                     }}>
                       {message.text}
                     </Typography>
                 </MessageBubble>
               </Slide>
             ))
           )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Modern Mesaj Input */}
                 <Box sx={{ 
           p: 3, 
           background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(25, 118, 210, 0.1) 100%)',
           borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
         }}>
          {/* Modern Reply Preview */}
          {replyingTo && (
            <Slide direction="down" in={Boolean(replyingTo)} timeout={300}>
              <Box sx={{ 
                mb: 2, 
                p: 2, 
                background: 'rgba(33, 150, 243, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderLeft: '4px solid #2196F3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: '#2196F3', 
                    fontWeight: 700,
                    mb: 0.5
                  }}>
                    💬 {replyingTo.userName} kullanıcısına yanıt veriyorsunuz:
                  </Typography>
                  <Typography sx={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontStyle: 'italic',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '0.9rem'
                  }}                     >
                       &ldquo;{replyingTo.text}&rdquo;
                     </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setReplyingTo(null)}
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Slide>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={roomActive ? "✨ Mesajınızı yazın..." : "🔒 Oda kapalı"}
              disabled={!roomActive}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '& fieldset': { 
                    border: 'none'
                  },
                                     '&:hover': { 
                     background: 'rgba(255, 255, 255, 0.15)',
                     border: '1px solid rgba(33, 150, 243, 0.3)',
                     transform: 'translateY(-2px)'
                   },
                   '&.Mui-focused': { 
                     background: 'rgba(255, 255, 255, 0.15)',
                     border: '2px solid rgba(33, 150, 243, 0.5)',
                     boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)'
                   }
                },
                '& .MuiInputBase-input': {
                  color: '#ffffff',
                  fontSize: '1rem',
                  padding: '16px 20px',
                  '&::placeholder': { 
                    color: 'rgba(255,255,255,0.6)',
                    fontWeight: 500
                  }
                }
              }}
            />
            <ModernButton
              onClick={sendMessage}
              disabled={!newMessage.trim() || !roomActive || sending}
              sx={{
                minWidth: '60px',
                height: '60px',
                borderRadius: '50%',
                p: 0,
                                 background: newMessage.trim() && roomActive && !sending ? 
                   'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' : 
                   'rgba(255, 255, 255, 0.1)',
                 boxShadow: newMessage.trim() && roomActive && !sending ? 
                   '0 4px 20px rgba(33, 150, 243, 0.4)' : 'none',
                animation: newMessage.trim() && roomActive ? `${glowAnimation} 2s infinite` : 'none',
                '&:hover': {
                  transform: newMessage.trim() && roomActive && !sending ? 'scale(1.1)' : 'none'
                }
              }}
            >
              {sending ? (
                <CircularProgress size={24} sx={{ color: '#ffffff' }} />
              ) : (
                <SendIcon sx={{ fontSize: 24 }} />
              )}
            </ModernButton>
          </Box>
        </Box>
        </GlassCard>
      </Fade>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CalismaOdasi; 
