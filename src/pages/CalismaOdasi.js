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
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  WorkspacesOutlined as WorkspacesIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Reply as ReplyIcon,
  Close as CloseIcon
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
      <Container maxWidth="lg" sx={{ py: 4, mt: 14 }}>
        <Card sx={{ borderRadius: '16px', backgroundColor: '#2d4870', p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: '#ffffff' }}>Yükleniyor...</Typography>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 14 }}>
      {/* Header */}
      <Card sx={{ 
        borderRadius: '16px',
        backgroundColor: '#2d4870',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        border: '4px solid #2d4870',
        mb: 2
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WorkspacesIcon sx={{ fontSize: 40, color: '#E91E63' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
                  Çalışma Odası
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip
                    label={roomActive ? 'AKTİF' : 'PASİF'}
                    size="small"
                    sx={{
                      backgroundColor: roomActive ? '#4CAF50' : '#757575',
                      color: '#ffffff',
                      fontWeight: 600
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {messages.length} mesaj
                  </Typography>
                  {roomActive && (
                    <Tooltip title="Online kullanıcılar">
                      <Chip
                        icon={<PeopleIcon />}
                        label={onlineUsers.length}
                        size="small"
                        sx={{
                          backgroundColor: '#4CAF50',
                          color: '#ffffff',
                          fontWeight: 600,
                          ml: 1
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Admin Kontrolleri */}
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={roomActive ? <StopIcon /> : <StartIcon />}
                onClick={toggleRoom}
                sx={{
                  backgroundColor: roomActive ? '#f44336' : '#4CAF50',
                  '&:hover': {
                    backgroundColor: roomActive ? '#d32f2f' : '#45a049'
                  }
                }}
              >
                {roomActive ? 'Odayı Durdur' : 'Odayı Başlat'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Admin Oda Başlatma Uyarısı */}
      {isAdmin && !roomActive && (
        <Card sx={{ 
          borderRadius: '16px',
          backgroundColor: '#4CAF50',
          border: '4px solid #4CAF50',
          mb: 2,
          animation: 'pulse 2s infinite'
        }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>
              🚀 Admin Paneli
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
              Çalışma odası kapalı. Kullanıcılar sohbet edebilmesi için odayı başlatmanız gerekiyor.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<StartIcon />}
              onClick={toggleRoom}
              sx={{
                backgroundColor: '#ffffff',
                color: '#4CAF50',
                fontWeight: 700,
                fontSize: '1.1rem',
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s'
              }}
            >
              Çalışma Odasını Başlat
            </Button>
          </CardContent>
        </Card>
             )}

      {/* Admin Oda Aktif Bilgisi */}
      {isAdmin && roomActive && (
        <Card sx={{ 
          borderRadius: '16px',
          backgroundColor: '#2196F3',
          border: '4px solid #2196F3',
          mb: 2
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                  ⚡ Admin: Oda Aktif
                </Typography>
                <Chip
                  label={`${onlineUsers.length} kullanıcı online`}
                  size="small"
                  sx={{
                    backgroundColor: '#ffffff',
                    color: '#2196F3',
                    fontWeight: 600
                  }}
                />
              </Box>
              <Button
                variant="contained"
                startIcon={<StopIcon />}
                onClick={toggleRoom}
                size="small"
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#2196F3',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                Odayı Durdur
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Chat Area */}
      <Card sx={{ 
        borderRadius: '16px',
        backgroundColor: '#2d4870',
        border: '4px solid #2d4870',
        height: '500px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Mesajlar */}
        <Box sx={{ 
          flexGrow: 1, 
          p: 2, 
          overflowY: 'auto',
          maxHeight: '400px'
        }}>
          {!roomActive ? (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
                Çalışma odası şu anda kapalı
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                Admin tarafından oda açıldığında mesajlaşabilirsiniz
              </Typography>
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Henüz mesaj yok. İlk mesajı sen at! 💬
              </Typography>
            </Box>
                     ) : (
             messages.map((message) => (
               <Fade key={message.id} in={true} timeout={500}>
                 <Paper
                   sx={{
                     p: 2,
                     mb: 1,
                     backgroundColor: '#1b293d',
                     borderRadius: '12px',
                     border: '1px solid rgba(255,255,255,0.1)',
                     position: 'relative',
                     '&:hover .delete-btn': {
                       opacity: 1
                     }
                   }}
                 >
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                     <Chip
                       label={message.userName}
                       size="small"
                       sx={{
                         backgroundColor: getUserColor(message.userId),
                         color: '#ffffff',
                         fontWeight: 600,
                         fontSize: '0.75rem'
                       }}
                     />
                     <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                       {formatTime(message.timestamp)}
                     </Typography>
                     
                     {/* Action butonları */}
                     <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                       {/* Reply butonu */}
                       <Tooltip title="Yanıtla">
                         <IconButton
                           className="delete-btn"
                           size="small"
                           onClick={() => replyToMessage(message)}
                           sx={{
                             opacity: 0,
                             transition: 'opacity 0.2s',
                             color: '#2196F3',
                             '&:hover': {
                               backgroundColor: 'rgba(33, 150, 243, 0.1)'
                             }
                           }}
                         >
                           <ReplyIcon fontSize="small" />
                         </IconButton>
                       </Tooltip>

                       {/* Silme butonu - sadece mesaj sahibi veya admin görebilir */}
                       {(message.userId === user?.uid || isAdmin) && (
                         <Tooltip title="Mesajı sil">
                           <IconButton
                             className="delete-btn"
                             size="small"
                             onClick={() => deleteMessage(message.id, message.userId)}
                             sx={{
                               opacity: 0,
                               transition: 'opacity 0.2s',
                               color: '#f44336',
                               '&:hover': {
                                 backgroundColor: 'rgba(244, 67, 54, 0.1)'
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
                     
                     <Typography sx={{ color: '#ffffff', fontSize: '0.95rem', mt: message.replyTo ? 1 : 0 }}>
                       {message.text}
                     </Typography>
                 </Paper>
               </Fade>
             ))
           )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Mesaj Input */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Reply Preview */}
          {replyingTo && (
            <Box sx={{ 
              mb: 1, 
              p: 1, 
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderRadius: '8px',
              borderLeft: '3px solid #2196F3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: '#2196F3', fontWeight: 600 }}>
                  {replyingTo.userName} kullanıcısına yanıt veriyorsunuz:
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  display: 'block',
                  fontStyle: 'italic',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {replyingTo.text}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setReplyingTo(null)}
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={roomActive ? "Mesajınızı yazın..." : "Oda kapalı"}
              disabled={!roomActive}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#1b293d',
                  borderRadius: '12px',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#E91E63' }
                },
                '& .MuiInputBase-input': {
                  color: '#ffffff',
                  '&::placeholder': { color: 'rgba(255,255,255,0.5)' }
                }
              }}
            />
                         <IconButton
               onClick={sendMessage}
               disabled={!newMessage.trim() || !roomActive || sending}
               sx={{
                 backgroundColor: '#E91E63',
                 color: '#ffffff',
                 '&:hover': { backgroundColor: '#C2185B' },
                 '&:disabled': { backgroundColor: 'rgba(255,255,255,0.1)' }
               }}
             >
               {sending ? (
                 <CircularProgress size={20} sx={{ color: '#ffffff' }} />
               ) : (
                 <SendIcon />
               )}
             </IconButton>
          </Box>
        </Box>
      </Card>

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