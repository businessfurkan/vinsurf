import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
  styled,
  alpha,
  Breadcrumbs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container
} from '@mui/material';
import {
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalOffer as TagIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  border: 'none',
  background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
  },
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
}));

const StyledChip = styled(Chip)(({ theme, colorIndex, label }) => {
  const colors = [
    { bg: '#e3f2fd', color: '#1976d2', gradient: 'linear-gradient(135deg, #bbdefb, #e3f2fd)' },
    { bg: '#e8f5e9', color: '#2e7d32', gradient: 'linear-gradient(135deg, #c8e6c9, #e8f5e9)' },
    { bg: '#fff8e1', color: '#f57f17', gradient: 'linear-gradient(135deg, #ffecb3, #fff8e1)' },
    { bg: '#f3e5f5', color: '#7b1fa2', gradient: 'linear-gradient(135deg, #e1bee7, #f3e5f5)' },
    { bg: '#ffebee', color: '#c62828', gradient: 'linear-gradient(135deg, #ffcdd2, #ffebee)' },
    { bg: '#e0f7fa', color: '#00838f', gradient: 'linear-gradient(135deg, #b2ebf2, #e0f7fa)' },
  ];
  
  const getColorIndex = (tag) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % colors.length;
  };
  
  const index = colorIndex !== undefined ? colorIndex : (label ? getColorIndex(label) : 0);
  const colorObj = colors[index];
  
  return {
    borderRadius: '30px',
    fontWeight: 700,
    fontSize: '0.8rem',
    background: colorObj.gradient,
    color: colorObj.color,
    border: 'none',
    boxShadow: `0 2px 8px ${alpha(colorObj.color, 0.25)}`,
    '&:hover': {
      background: colorObj.gradient,
      boxShadow: `0 4px 12px ${alpha(colorObj.color, 0.35)}`,
      transform: 'translateY(-2px)'
    },
    margin: theme.spacing(0.5),
    transition: 'all 0.2s ease',
    padding: '6px 14px',
    height: '28px'
  };
});

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px',
  padding: '10px 28px',
  fontWeight: 700,
  fontSize: '0.95rem',
  textTransform: 'none',
  boxShadow: '0 6px 15px rgba(0,0,0,0.12)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
  },
  '&.MuiButton-containedPrimary': {
    background: 'linear-gradient(45deg, #5ec837, #4eb02c)',
    '&:hover': {
      background: 'linear-gradient(45deg, #4eb02c, #3d9020)',
    }
  },
  '&.MuiButton-outlined': {
    borderWidth: '2px',
    '&:hover': {
      borderWidth: '2px'
    }
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.15),
      borderWidth: '2px',
    },
    '&:hover': {
      backgroundColor: '#f0f2f5',
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.4),
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.15)}`,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '1rem',
    padding: '16px 20px',
    '&::placeholder': {
      fontStyle: 'italic',
      opacity: 0.7,
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '1rem',
    fontWeight: 500,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
  marginBottom: theme.spacing(2),
}));

const CommentCard = styled(Paper)(({ theme, isReply }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  marginLeft: isReply ? theme.spacing(7) : 0,
  borderRadius: '20px',
  border: 'none',
  backgroundColor: isReply ? 'linear-gradient(to right, #f8f9ff, #f0f4ff)' : 'linear-gradient(to right, #ffffff, #fafbfc)',
  boxShadow: isReply ? '0 4px 12px rgba(0,0,0,0.04)' : '0 6px 18px rgba(0,0,0,0.06)',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: isReply ? '0 5px 15px rgba(0,0,0,0.06)' : '0 8px 24px rgba(0,0,0,0.09)',
    transform: 'translateY(-2px)'
  },
  '&::before': isReply ? {
    content: '""',
    position: 'absolute',
    left: '-25px',
    top: '25px',
    width: '25px',
    height: '2px',
    backgroundColor: alpha(theme.palette.primary.main, 0.3),
    borderRadius: '2px'
  } : {}
}));

const SoruForumDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const commentInputRef = useRef(null);
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editPostData, setEditPostData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchPost = useCallback(async () => {
    console.log('Gönderi yükleniyor, postId:', postId);
    try {
      if (!postId) {
        console.error('PostId tanımlı değil!');
        setLoading(false);
        return;
      }

      const postRef = doc(db, 'forumPosts', postId);
      console.log('Gönderi referansı oluşturuldu:', postRef.path);
      
      const postDoc = await getDoc(postRef);
      console.log('Gönderi dökümanı alındı, var mı?', postDoc.exists());
      
      if (!postDoc.exists()) {
        console.error('Gönderi bulunamadı, postId:', postId);
        showNotification('Gönderi bulunamadı', 'error');
        navigate('/soru-forum');
        return;
      }
      
      const rawData = postDoc.data();
      console.log('Gönderi veri formatı:', JSON.stringify(rawData, null, 2));
      
      const postData = { id: postDoc.id, ...rawData };
      
      // createdAt alanını kontrol et ve dönüştür
      if (postData.createdAt && typeof postData.createdAt.toDate === 'function') {
        try {
          postData.createdAt = postData.createdAt.toDate();
        } catch (dateError) {
          console.error('Tarih dönüştürme hatası:', dateError);
          postData.createdAt = new Date(); // Varsayılan tarih
        }
      } else if (!postData.createdAt) {
        console.warn('Gönderi için createdAt alanı bulunamadı:', postDoc.id);
        postData.createdAt = new Date(); // Varsayılan tarih
      }
      
      // Kullanıcı bilgilerini getir
      if (postData.userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', postData.userId));
          if (userDoc.exists()) {
            postData.userInfo = userDoc.data();
            console.log('Kullanıcı bilgileri alındı:', postData.userId);
          } else {
            console.warn(`Kullanıcı bulunamadı: ${postData.userId}`);
            // Varsayılan kullanıcı bilgileri
            postData.userInfo = {
              displayName: 'İsimsiz Kullanıcı',
              photoURL: null
            };
          }
        } catch (userError) {
          console.error('Kullanıcı bilgisi alınırken hata:', userError);
          // Varsayılan kullanıcı bilgileri
          postData.userInfo = {
            displayName: 'İsimsiz Kullanıcı',
            photoURL: null
          };
        }
      } else {
        console.warn('Gönderi için userId alanı bulunamadı:', postDoc.id);
        // Varsayılan kullanıcı bilgileri
        postData.userInfo = {
          displayName: 'İsimsiz Kullanıcı',
          photoURL: null
        };
      }
      
      // Gerekli alanların varlığını kontrol et
      if (!postData.title) {
        console.warn('Gönderi başlığı bulunamadı:', postDoc.id);
        postData.title = 'Başlıksız Gönderi';
      }
      
      if (!postData.content) {
        console.warn('Gönderi içeriği bulunamadı:', postDoc.id);
        postData.content = '[Gönderi içeriği bulunamadı]';
      }
      
      if (!postData.likedBy) {
        postData.likedBy = [];
      }
      
      if (!postData.likeCount && postData.likeCount !== 0) {
        postData.likeCount = 0;
      }
      
      if (!postData.commentCount && postData.commentCount !== 0) {
        postData.commentCount = 0;
      }
      
      if (!postData.tags || !Array.isArray(postData.tags)) {
        postData.tags = [];
      }
      
      console.log('Gönderi verileri işlendi, state güncelleniyor');
      setPost(postData);
      setEditPostData({
        title: postData.title || '',
        content: postData.content || '',
        tags: postData.tags?.join(', ') || ''
      });
    } catch (error) {
      console.error('Gönderi yüklenirken hata oluştu:', error);
      console.error('Hata detayları:', error.message, error.stack);
      showNotification('Gönderi yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }, [postId, navigate]);

  // Yorumları yüklemek için optimize edilmiş fonksiyon
  const fetchComments = useCallback(async () => {
    // Sorgu sayısını azaltmak için yükleme durumunu kontrol et
    if (!postId || !post) {
      return;
    }

    try {
      // Yorumları tek bir sorguda al
      const commentsQuery = query(
        collection(db, 'forumComments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(commentsQuery);
      
      if (querySnapshot.empty) {
        // Yorum yoksa boş bir dizi ayarla ve işlemi sonlandır
        setComments([]);
        return;
      }
      
      // Tüm yorumları bir kerede işle
      const commentsData = [];
      
      // Önce tüm yorumları işle
      querySnapshot.docs.forEach(docSnapshot => {
        const rawData = docSnapshot.data();
        const commentData = { id: docSnapshot.id, ...rawData };
        
        // Tarih dönüştürme
        if (commentData.createdAt && typeof commentData.createdAt.toDate === 'function') {
          try {
            commentData.createdAt = commentData.createdAt.toDate();
          } catch {
            commentData.createdAt = new Date();
          }
        } else if (!commentData.createdAt) {
          commentData.createdAt = new Date();
        }
        
        // Varsayılan değerleri ayarla
        if (!commentData.content) {
          commentData.content = '[Yorum içeriği bulunamadı]';
        }
        
        if (!commentData.likedBy) {
          commentData.likedBy = [];
        }
        
        if (!commentData.likeCount && commentData.likeCount !== 0) {
          commentData.likeCount = 0;
        }
        
        // Varsayılan kullanıcı bilgilerini ayarla
        commentData.userInfo = {
          displayName: commentData.userName || 'İsimsiz Kullanıcı',
          photoURL: commentData.userPhotoURL || null
        };
        
        commentsData.push(commentData);
      });
      
      // Yorumları organize et (ana yorumlar ve yanıtlar)
      const organizeComments = (commentsArray) => {
        try {
          const commentMap = {};
          const rootComments = [];
          
          // Önce tüm yorumları map'e ekle
          commentsArray.forEach(comment => {
            if (comment && comment.id) {
              commentMap[comment.id] = { ...comment, replies: [] };
            }
          });
          
          // Sonra yanıtları düzenle
          commentsArray.forEach(comment => {
            if (!comment || !comment.id) return;
            
            if (comment.parentId && commentMap[comment.parentId]) {
              // Eğer üst yorum varsa, yanıt olarak ekle
              commentMap[comment.parentId].replies.push(commentMap[comment.id]);
            } else {
              // Üst yorum yoksa veya parentId yoksa, kök yorum olarak ekle
              rootComments.push(commentMap[comment.id]);
            }
          });
          
          return rootComments;
        } catch (organizeError) {
          // Hata durumunda düz bir liste döndür
          return commentsArray.filter(comment => !comment.parentId);
        }
      };
      
      const organizedComments = organizeComments(commentsData);
      
      // Organize edilmiş yorumları state'e kaydet (tek seferde güncelle)
      setComments(organizedComments);
      
      // Post'un yorum sayısını güncelle (UI için)
      if (post && post.commentCount !== commentsData.length) {
        setPost(prevPost => ({
          ...prevPost,
          commentCount: commentsData.length
        }));
      }
    } catch (error) {
      console.error('Yorumlar yüklenirken hata oluştu:', error);
      // Hata durumunda boş yorumlar gösterme
      setComments([]);
    }
  }, [postId, post]);

  // Sayfa yüklenirken verileri getir
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (postId && isMounted) {
        setLoading(true);
        await fetchPost();
        setLoading(false);
      }
    };
    
    loadData();
    
    // Temizleme fonksiyonu
    return () => {
      isMounted = false;
    };
  }, [postId, fetchPost]);
  
  // Post yüklendikten sonra yorumları getir
  useEffect(() => {
    if (post && !loading) {
      fetchComments();
    }
  }, [post, loading, fetchComments]);
  
  // Yorumların yüklenip yüklenmediğini kontrol etmek için debug bilgisi
  useEffect(() => {
    console.log('Yorumlar state güncellendi:', comments.length, 'yorum var');
    if (comments.length > 0) {
      console.log('İlk yorum örneği:', comments[0]);
    }
  }, [comments]);

  const handleAddComment = async () => {
    if (!user || commentText.trim() === '') {
      showNotification('Yorum yapmak için giriş yapmalısınız veya yorum boş olamaz', 'warning');
      return;
    }
    
    try {
      // Yorum verilerini hazırla
      const now = new Date();
      const serverNow = serverTimestamp();
      
      const commentData = {
        postId: postId,
        content: commentText.trim(),
        userId: user.uid,
        userName: user.displayName || 'İsimsiz Kullanıcı',
        userPhotoURL: user.photoURL || null,
        createdAt: serverNow,
        updatedAt: serverNow,
        likeCount: 0,
        likedBy: []
      };
      
      // Yorumu ekle
      const commentRef = await addDoc(collection(db, 'forumComments'), commentData);
      console.log('Yorum eklendi, ID:', commentRef.id);
      
      // Post'un yorum sayısını güncelle
      const postRef = doc(db, 'forumPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });
      
      // Gönderi sahibine bildirim gönder (eğer gönderi sahibi kendisi değilse)
      if (post.userId && post.userId !== user.uid) {
        try {
          const notificationRef = collection(db, 'notifications');
          await addDoc(notificationRef, {
            recipientId: post.userId,
            senderId: user.uid,
            senderName: user.displayName || 'Bir kullanıcı',
            type: 'newComment',
            postId: postId,
            commentId: commentRef.id,
            postTitle: post.title,
            commentContent: commentText.substring(0, 50) + (commentText.length > 50 ? '...' : ''),
            read: false,
            createdAt: serverNow
          });
          console.log('Gönderi sahibine bildirim gönderildi');
        } catch (notificationError) {
          console.error('Bildirim gönderilirken hata:', notificationError);
          // Bildirim gönderilemese bile devam et
        }
      }
      
      // Yorumu doğrudan state'e ekle (veritabanından tekrar yüklemeye gerek kalmadan)
      const newComment = {
        id: commentRef.id,
        ...commentData,
        createdAt: now, // JavaScript Date objesi olarak
        userInfo: {
          displayName: user.displayName || 'İsimsiz Kullanıcı',
          photoURL: user.photoURL,
          // Diğer kullanıcı bilgileri
        },
        replies: []
      };
      
      // Mevcut yorumlara yeni yorumu ekle
      setComments(prevComments => [...prevComments, newComment]);
      
      // Post'un yorum sayısını güncelle (UI için)
      if (post) {
        setPost(prevPost => ({
          ...prevPost,
          commentCount: (prevPost.commentCount || 0) + 1
        }));
      }
      
      showNotification('Yorum başarıyla eklendi', 'success');
      setCommentText('');
    } catch (error) {
      console.error('Yorum eklenirken hata:', error);
      showNotification('Yorum eklenirken bir hata oluştu', 'error');
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      showNotification('Beğenmek için giriş yapmalısınız', 'warning');
      return;
    }
    
    try {
      const commentRef = doc(db, 'forumComments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) {
        showNotification('Yorum bulunamadı', 'error');
        return;
      }
      
      const commentData = commentDoc.data();
      const isLiked = commentData.likedBy?.includes(user.uid);
      
      if (isLiked) {
        await updateDoc(commentRef, {
          likeCount: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
        showNotification('Yorum beğenisi kaldırıldı', 'info');
      } else {
        await updateDoc(commentRef, {
          likeCount: increment(1),
          likedBy: arrayUnion(user.uid)
        });
        
        if (commentData.userId !== user.uid) {
          const notificationRef = collection(db, 'notifications');
          await addDoc(notificationRef, {
            recipientId: commentData.userId,
            senderId: user.uid,
            senderName: user.displayName || 'Bir kullanıcı',
            type: 'commentLike',
            postId: postId,
            commentId: commentId,
            postTitle: post.title,
            read: false,
            createdAt: serverTimestamp()
          });
        }
        
        showNotification('Yorum beğenildi', 'success');
      }
      
      fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
      showNotification('İşlem sırasında bir hata oluştu', 'error');
    }
  };

  const handleAddReply = async () => {
    if (!user || !replyingTo || replyText.trim() === '') {
      showNotification('Yanıt vermek için giriş yapmalısınız veya yanıt boş olamaz', 'warning');
      return;
    }
    
    try {
      // Yanıt verilerini hazırla
      const now = new Date();
      const serverNow = serverTimestamp();
      
      const replyData = {
        postId,
        userId: user.uid,
        userName: user.displayName || 'İsimsiz Kullanıcı',
        userPhotoURL: user.photoURL || '',
        content: replyText,
        parentId: replyingTo.id,
        likeCount: 0,
        likedBy: [],
        createdAt: serverNow
      };
      
      // Yanıtı ekle
      const replyRef = await addDoc(collection(db, 'forumComments'), replyData);
      console.log('Yanıt eklendi, ID:', replyRef.id);
      
      // Post'un yorum sayısını güncelle
      const postRef = doc(db, 'forumPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });
      
      // Bildirim gönder (eğer yanıt başka bir kullanıcıya ise)
      if (replyingTo.userId !== user.uid) {
        try {
          const notificationRef = collection(db, 'notifications');
          await addDoc(notificationRef, {
            recipientId: replyingTo.userId,
            senderId: user.uid,
            senderName: user.displayName || 'Bir kullanıcı',
            type: 'commentReply',
            postId: postId,
            commentId: replyRef.id,
            parentCommentId: replyingTo.id,
            postTitle: post.title,
            commentContent: replyText.substring(0, 50) + (replyText.length > 50 ? '...' : ''),
            read: false,
            createdAt: serverNow
          });
          console.log('Yorum sahibine bildirim gönderildi');
        } catch (notificationError) {
          console.error('Bildirim gönderilirken hata:', notificationError);
          // Bildirim gönderilemese bile devam et
        }
      }
      
      // Yanıtı doğrudan state'e ekle
      const newReply = {
        id: replyRef.id,
        ...replyData,
        createdAt: now, // JavaScript Date objesi olarak
        userInfo: {
          displayName: user.displayName || 'İsimsiz Kullanıcı',
          photoURL: user.photoURL,
          // Diğer kullanıcı bilgileri
        },
        replies: []
      };
      
      // Mevcut yorumları güncelle, yanıtı ilgili yoruma ekle
      setComments(prevComments => {
        return prevComments.map(comment => {
          if (comment.id === replyingTo.id) {
            // Bu, yanıt verilen yorumsa, yanıtı ekle
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          } else if (comment.replies && comment.replies.length > 0) {
            // Alt yorumları kontrol et
            const hasReplyingComment = comment.replies.some(reply => reply.id === replyingTo.id);
            if (hasReplyingComment) {
              return {
                ...comment,
                replies: comment.replies.map(reply => {
                  if (reply.id === replyingTo.id) {
                    return {
                      ...reply,
                      replies: [...(reply.replies || []), newReply]
                    };
                  }
                  return reply;
                })
              };
            }
          }
          return comment;
        });
      });
      
      // Post'un yorum sayısını güncelle (UI için)
      if (post) {
        setPost(prevPost => ({
          ...prevPost,
          commentCount: (prevPost.commentCount || 0) + 1
        }));
      }
      
      setReplyText('');
      setReplyingTo(null);
      showNotification('Yanıt başarıyla eklendi', 'success');
    } catch (error) {
      console.error('Yanıt eklenirken hata:', error);
      showNotification('Yanıt eklenirken bir hata oluştu', 'error');
    }
  };

  const handleLikePost = async () => {
    if (!user) {
      showNotification('Beğenmek için giriş yapmalısınız', 'warning');
      return;
    }
    
    try {
      const postRef = doc(db, 'forumPosts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        showNotification('Gönderi bulunamadı', 'error');
        return;
      }
      
      const postData = postDoc.data();
      const isLiked = postData.likedBy?.includes(user.uid);
      
      if (isLiked) {
        await updateDoc(postRef, {
          likeCount: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
        showNotification('Gönderi beğenisi kaldırıldı', 'info');
      } else {
        await updateDoc(postRef, {
          likeCount: increment(1),
          likedBy: arrayUnion(user.uid)
        });
        
        if (postData.userId !== user.uid) {
          const notificationRef = collection(db, 'notifications');
          await addDoc(notificationRef, {
            recipientId: postData.userId,
            senderId: user.uid,
            senderName: user.displayName || 'Bir kullanıcı',
            type: 'postLike',
            postId: postId,
            postTitle: postData.title,
            read: false,
            createdAt: serverTimestamp()
          });
        }
        
        showNotification('Gönderi beğenildi', 'success');
      }
      
      fetchPost();
    } catch (error) {
      console.error('Error liking post:', error);
      showNotification('İşlem sırasında bir hata oluştu', 'error');
    }
  };

  const handleEditComment = async () => {
    if (!user || !editingComment || editText.trim() === '') {
      showNotification('Yorum düzenlemek için giriş yapmalısınız veya yorum boş olamaz', 'warning');
      return;
    }
    
    try {
      const commentRef = doc(db, 'forumComments', editingComment.id);
      await updateDoc(commentRef, {
        content: editText,
        isEdited: true,
        updatedAt: serverTimestamp()
      });
      
      showNotification('Yorum başarıyla düzenlendi', 'success');
      setEditingComment(null);
      setEditText('');
      fetchComments();
    } catch (error) {
      console.error('Error editing comment:', error);
      showNotification('Yorum düzenlenirken bir hata oluştu', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) {
      showNotification('Yorum silmek için giriş yapmalısınız', 'warning');
      return;
    }
    
    try {
      const commentRef = doc(db, 'forumComments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) {
        showNotification('Yorum bulunamadı', 'error');
        return;
      }
      
      const batch = writeBatch(db);
      
      batch.delete(commentRef);
      
      const repliesQuery = query(
        collection(db, 'forumComments'),
        where('parentId', '==', commentId)
      );
      const replySnapshot = await getDocs(repliesQuery);
      replySnapshot.forEach(reply => {
        batch.delete(doc(db, 'forumComments', reply.id));
      });
      
      const postRef = doc(db, 'forumPosts', postId);
      batch.update(postRef, {
        commentCount: increment(-(1 + replySnapshot.size))
      });
      
      await batch.commit();
      
      showNotification('Yorum ve yanıtları başarıyla silindi', 'success');
      fetchComments();
      fetchPost();
    } catch (error) {
      console.error('Error deleting comment:', error);
      showNotification('Yorum silinirken bir hata oluştu', 'error');
    }
  };

  const handleOpenMenu = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleOpenEditDialog = () => {
    if (!canEditPost()) {
      showNotification('Gönderi düzenleme süresi doldu', 'warning');
      return;
    }
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEditedPost = async () => {
    if (!user || !editPostData.title.trim() || !editPostData.content.trim()) {
      showNotification('Başlık ve içerik boş olamaz', 'warning');
      return;
    }
    
    try {
      const tagsArray = editPostData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      const postRef = doc(db, 'forumPosts', postId);
      await updateDoc(postRef, {
        title: editPostData.title,
        content: editPostData.content,
        tags: tagsArray,
        updatedAt: serverTimestamp(),
        isEdited: true
      });
      
      showNotification('Gönderi başarıyla düzenlendi', 'success');
      setEditDialogOpen(false);
      fetchPost();
    } catch (error) {
      console.error('Error editing post:', error);
      showNotification('Gönderi düzenlenirken bir hata oluştu', 'error');
    }
  };

  const handleDeletePost = async () => {
    if (!user) {
      showNotification('Gönderi silmek için giriş yapmalısınız', 'warning');
      return;
    }
    
    try {
      const batch = writeBatch(db);
      
      batch.delete(doc(db, 'forumPosts', postId));
      
      const commentsQuery = query(
        collection(db, 'forumComments'),
        where('postId', '==', postId)
      );
      const commentSnapshot = await getDocs(commentsQuery);
      commentSnapshot.forEach(comment => {
        batch.delete(doc(db, 'forumComments', comment.id));
      });
      
      await batch.commit();
      
      showNotification('Gönderi ve tüm yorumları başarıyla silindi', 'success');
      navigate('/soru-forum');
    } catch (error) {
      console.error('Error deleting post:', error);
      showNotification('Gönderi silinirken bir hata oluştu', 'error');
    }
  };

  const canEditPost = () => {
    if (!post || !post.createdAt) return false;
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    return (new Date() - post.createdAt) <= twoHoursInMs;
  };

  const formatDate = (date) => {
    if (!date) return 'Bilinmeyen tarih';
    return formatDistance(new Date(date), new Date(), { addSuffix: true, locale: tr });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Gönderi bulunamadı</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/soru-forum" style={{ textDecoration: 'none', color: '#4285F4' }}>
          Soru Forum
        </Link>
        <Typography color="text.primary">{post.title}</Typography>
      </Breadcrumbs>

      <StyledCard>
        <CardContent sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar 
              src={post.userInfo?.photoURL || ''} 
              sx={{ 
                width: 50, 
                height: 50, 
                mr: 2,
                border: '2px solid #ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                backgroundColor: '#f0f4ff'
              }}
            >
              {post.userInfo?.displayName?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#2e3856', 
                  fontSize: '1.1rem',
                  letterSpacing: '-0.01em'
                }}
              >
                {post.userInfo?.displayName || 'İsimsiz Kullanıcı'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.8,
                  fontSize: '0.85rem',
                  mt: 0.5
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: post.isEdited ? '#FFA000' : '#4CAF50',
                    display: 'inline-block',
                    boxShadow: '0 0 4px rgba(0,0,0,0.15)'
                  }} 
                />
                {formatDate(post.createdAt)}
                {post.isEdited && ' (düzenlendi)'}
              </Typography>
            </Box>
          </Box>

          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              color: '#1a2b4a',
              mt: 3,
              mb: 3,
              fontSize: { xs: '1.6rem', md: '2rem' },
              lineHeight: 1.3,
              background: 'linear-gradient(to right, #ffffff, #f8f9fa)',
              p: 3,
              borderRadius: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              borderLeft: '4px solid #5ec837',
              letterSpacing: '-0.02em',
              fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            }}
          >
            {post.title}
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#ffffff',
              mb: 4,
              whiteSpace: 'pre-wrap',
              fontSize: '1.05rem',
              lineHeight: 1.8,
              background: 'linear-gradient(to right, #f8f9ff, #f0f4ff)',
              p: 4,
              borderRadius: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              letterSpacing: '0.01em'
            }}
          >
            {post.content}
          </Typography>
          
          {post.tags && post.tags.length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {post.tags.map((tag, index) => (
                <StyledChip 
                  key={tag} 
                  label={tag} 
                  size="medium"
                  icon={<TagIcon sx={{ fontSize: '1rem' }} />}
                />
              ))}
            </Box>
          )}
        </CardContent>
        
        <Divider sx={{ opacity: 0.6 }} />
        
        <CardActions sx={{ px: { xs: 2, sm: 3 }, py: 3, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={
                <ThumbUpIcon 
                  sx={{ 
                    color: post.likedBy?.includes(user?.uid) ? '#5ec837' : '#9e9e9e',
                    fontSize: '1.2rem'
                  }} 
                />
              }
              onClick={handleLikePost}
              disabled={!user}
              sx={{ 
                textTransform: 'none',
                fontWeight: 700,
                color: post.likedBy?.includes(user?.uid) ? '#5ec837' : '#757575',
                backgroundColor: post.likedBy?.includes(user?.uid) ? 'rgba(94, 200, 55, 0.1)' : 'rgba(0,0,0,0.03)',
                borderRadius: '30px',
                px: 3,
                py: 1.2,
                '&:hover': { 
                  backgroundColor: post.likedBy?.includes(user?.uid) ? 'rgba(94, 200, 55, 0.15)' : 'rgba(0,0,0,0.06)',
                  transform: 'translateY(-2px)',
                  boxShadow: post.likedBy?.includes(user?.uid) ? '0 4px 12px rgba(94, 200, 55, 0.2)' : '0 4px 12px rgba(0,0,0,0.05)'
                },
                mr: 2,
                fontSize: '0.95rem',
                transition: 'all 0.2s ease'
              }}
            >
              {post.likeCount || 0} Beğeni
            </Button>
            
            <Button
              startIcon={
                <CommentIcon 
                  sx={{ 
                    color: '#4a6da7',
                    fontSize: '1.2rem'
                  }} 
                />
              }
              sx={{ 
                textTransform: 'none',
                fontWeight: 700,
                color: '#4a6da7',
                backgroundColor: 'rgba(25, 118, 210, 0.05)',
                borderRadius: '30px',
                px: 3,
                py: 1.2,
                fontSize: '0.95rem',
                '&:hover': { 
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
                },
                transition: 'all 0.2s ease'
              }}
              onClick={() => commentInputRef.current?.focus()}
            >
              {comments.length} Yorum
            </Button>
          </Box>

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ThumbUpIcon />}
              variant="contained"
              size="small"
              onClick={handleLikePost}
              disabled={!user}
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none',
                mr: 1,
                backgroundColor: post.likedBy?.includes(user?.uid) ? '#5ec837' : '#f0f0f0',
                color: post.likedBy?.includes(user?.uid) ? '#ffffff' : '#555555',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: post.likedBy?.includes(user?.uid) ? '#4eb02c' : '#e0e0e0',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }
              }}
            >
              {post.likedBy?.includes(user?.uid) ? 'Beğenildi' : 'Beğen'}
            </Button>
            
            {user && user.uid === post.userId && (
              <>
                <Button 
                  startIcon={<EditIcon fontSize="small" />}
                  variant="outlined"
                  size="small"
                  onClick={handleOpenEditDialog}
                  disabled={!canEditPost()}
                  sx={{ 
                    borderRadius: '20px',
                    textTransform: 'none',
                    mr: 1,
                    borderColor: alpha('#4285F4', 0.5),
                    color: '#4285F4',
                    '&:hover': {
                      borderColor: '#4285F4',
                      backgroundColor: alpha('#4285F4', 0.04)
                    }
                  }}
                >
                  Düzenle
                </Button>
                <Button 
                  startIcon={<DeleteIcon fontSize="small" />}
                  variant="outlined"
                  size="small"
                  onClick={() => setDeleteConfirmOpen(true)}
                  sx={{ 
                    borderRadius: '20px',
                    textTransform: 'none',
                    borderColor: alpha('#F44336', 0.5),
                    color: '#F44336',
                    '&:hover': {
                      borderColor: '#F44336',
                      backgroundColor: alpha('#F44336', 0.04)
                    }
                  }}
                >
                  Sil
                </Button>
              </>
            )}
          </Box>
        </CardActions>
      </StyledCard>
      
      <Box sx={{ mt: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3, 
            fontWeight: 700, 
            color: '#2e3856',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f5f5f0',
            p: 2,
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            '&::before': {
              content: '""',
              width: '4px',
              height: '24px',
              backgroundColor: '#5ec837',
              borderRadius: '4px',
              marginRight: '12px'
            }
          }}
        >
          Yorumlar ({post.commentCount || 0})
        </Typography>
      </Box>
      
      {user ? (
        <Box 
          sx={{ 
            mb: 4,
            mt: 3,
            p: 3,
            borderRadius: '16px',
            border: '1px solid rgba(66, 133, 244, 0.2)',
            backgroundColor: '#F8FAFF',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              src={user?.photoURL} 
              alt={user?.displayName}
              sx={{ 
                width: 36, 
                height: 36, 
                mr: 1.5,
                border: '2px solid #4285F4'
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e3856' }}>
              {user?.displayName || user?.email?.split('@')[0] || 'Kullanıcı'}
            </Typography>
          </Box>
          
          <StyledTextField
            inputRef={commentInputRef}
            fullWidth
            multiline
            rows={3}
            placeholder="Düşüncelerinizi paylaşın..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            variant="outlined"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF'
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <StyledButton 
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >
              Yorum Yap
            </StyledButton>
          </Box>
        </Box>
      ) : (
        <Alert 
          severity="info" 
          sx={{ mb: 3, borderRadius: 3 }}
        >
          Yorum yapmak için <Link to="/login" style={{ fontWeight: 600 }}>giriş yapın</Link>
        </Alert>
      )}
      
      {/* Yorumları görüntüle */}
      <Box sx={{ mt: 2 }}>
        {comments.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 4,
              backgroundColor: alpha('#4285F4', 0.05),
              border: `1px dashed ${alpha('#4285F4', 0.3)}`,
              mt: 2
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CommentIcon sx={{ fontSize: 40, color: alpha('#4285F4', 0.4) }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#2e3856', 
                  fontWeight: 600,
                  mb: 1
                }}
              >
                Henüz yorum yapılmamış
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: '80%' }}>
                Bu gönderiye ilk yorumu siz yapın ve tartışmayı başlatın!
              </Typography>
            </Box>
          </Paper>
        ) : (
          <>
            {/* Yorum sayısını göster */}
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#555' }}>
              Toplam {comments.length} yorum görüntüleniyor
            </Typography>
            
            {/* Tüm yorumları listele */}
            {comments.map((comment) => (
              <Box key={comment.id} sx={{ mb: 3 }}>
                <CommentCard isReply={false} elevation={0}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={comment.userPhotoURL || ''} 
                        sx={{ 
                          width: 45, 
                          height: 45, 
                          mr: 2,
                          border: '2px solid #ffffff',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                          backgroundColor: '#f0f4ff'
                        }}
                      >
                        {comment.userName?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 700, 
                            color: '#2e3856', 
                            fontSize: '1rem',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {comment.userName || 'İsimsiz Kullanıcı'}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.8,
                            fontSize: '0.8rem',
                            mt: 0.3
                          }}
                        >
                          <Box 
                            component="span" 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: comment.isEdited ? '#FFA000' : '#4CAF50',
                              display: 'inline-block',
                              boxShadow: '0 0 4px rgba(0,0,0,0.15)'
                            }} 
                          />
                          {formatDate(comment.createdAt)}
                          {comment.isEdited && ' (düzenlendi)'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {user && (user.uid === comment.userId || user.uid === post?.userId) && (
                      <IconButton 
                        size="small"
                        onClick={(e) => handleOpenMenu(e, comment)}
                        sx={{
                          color: '#9e9e9e',
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.08)',
                            color: '#616161'
                          },
                          width: 36,
                          height: 36
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  
                  {editingComment && editingComment.id === comment.id ? (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <StyledTextField
                        fullWidth
                        multiline
                        rows={3}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        variant="outlined"
                        placeholder="Yorumunuzu düzenleyin..."
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                        <Button 
                          onClick={() => {
                            setEditingComment(null);
                            setEditText('');
                          }}
                          sx={{
                            borderRadius: '30px',
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            textTransform: 'none'
                          }}
                        >
                          İptal
                        </Button>
                        <StyledButton 
                          variant="contained"
                          color="primary"
                          onClick={handleEditComment}
                          disabled={!editText.trim()}
                        >
                          Kaydet
                        </StyledButton>
                      </Box>
                    </Box>
                  ) : (
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mt: 2, 
                        mb: 3, 
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.7,
                        color: '#2c3e50',
                        fontSize: '1rem',
                        fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        letterSpacing: '0.01em'
                      }}
                    >
                      {comment.content}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <Button 
                      startIcon={
                        <ThumbUpIcon 
                          sx={{ 
                            color: comment.likedBy?.includes(user?.uid) ? '#5ec837' : '#9e9e9e',
                            fontSize: '1.1rem'
                          }} 
                        />
                      }
                      onClick={() => handleLikeComment(comment.id)}
                      sx={{ 
                        color: comment.likedBy?.includes(user?.uid) ? '#5ec837' : '#757575',
                        fontWeight: 600,
                        borderRadius: '30px',
                        px: 2.5,
                        py: 1,
                        backgroundColor: comment.likedBy?.includes(user?.uid) ? 'rgba(94, 200, 55, 0.08)' : 'rgba(0,0,0,0.03)',
                        '&:hover': {
                          backgroundColor: comment.likedBy?.includes(user?.uid) ? 'rgba(94, 200, 55, 0.15)' : 'rgba(0,0,0,0.06)',
                          transform: 'translateY(-2px)'
                        },
                        textTransform: 'none',
                        fontSize: '0.9rem'
                      }}
                      disabled={!user}
                    >
                      {comment.likeCount || 0} Beğeni
                    </Button>
                    
                    <Button 
                      startIcon={<ReplyIcon sx={{ color: '#4a6da7', fontSize: '1.1rem' }} />}
                      onClick={() => {
                        if (replyingTo?.id === comment.id) {
                          setReplyingTo(null);
                          setReplyText('');
                        } else {
                          setReplyingTo(comment);
                          setReplyText('');
                        }
                      }}
                      sx={{ 
                        color: replyingTo?.id === comment.id ? '#1976d2' : '#4a6da7',
                        fontWeight: 600,
                        borderRadius: '30px',
                        px: 2.5,
                        py: 1,
                        backgroundColor: replyingTo?.id === comment.id ? 'rgba(25, 118, 210, 0.1)' : 'rgba(0,0,0,0.03)',
                        '&:hover': {
                          backgroundColor: replyingTo?.id === comment.id ? 'rgba(25, 118, 210, 0.15)' : 'rgba(0,0,0,0.06)',
                          transform: 'translateY(-2px)'
                        },
                        textTransform: 'none',
                        fontSize: '0.9rem'
                      }}
                      disabled={!user}
                    >
                      {replyingTo?.id === comment.id ? 'Yanıtlamaktan Vazgeç' : 'Yanıtla'}
                    </Button>
                  </Box>
                  
                  {replyingTo?.id === comment.id && (
                    <Box sx={{ mt: 3, ml: { xs: 0, sm: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          src={user?.photoURL} 
                          alt={user?.displayName}
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1.5,
                            border: '2px solid #4285F4'
                          }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e3856' }}>
                          {user?.displayName || user?.email?.split('@')[0] || 'Kullanıcı'}
                        </Typography>
                      </Box>
                      
                      <StyledTextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder={`${comment.userName || 'Kullanıcı'}'a yanıt verin...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                        <Button 
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          sx={{
                            borderRadius: '30px',
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            textTransform: 'none'
                          }}
                        >
                          İptal
                        </Button>
                        <StyledButton 
                          variant="contained"
                          color="primary"
                          onClick={handleAddReply}
                          disabled={!replyText.trim()}
                          endIcon={<SendIcon />}
                        >
                          Yanıtla
                        </StyledButton>
                      </Box>
                    </Box>
                  )}
                  
                  {/* Yanıtları göster */}
                  {comment.replies && comment.replies.length > 0 && (
                    <Box sx={{ mt: 3, ml: { xs: 0, sm: 4 } }}>
                      {comment.replies.map((reply) => (
                        <CommentCard key={reply.id} isReply={true} elevation={0} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                src={reply.userPhotoURL || ''} 
                                sx={{ 
                                  width: 35, 
                                  height: 35, 
                                  mr: 1.5,
                                  border: '2px solid #ffffff',
                                  boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                                  backgroundColor: '#f0f4ff'
                                }}
                              >
                                {reply.userName?.charAt(0).toUpperCase() || 'U'}
                              </Avatar>
                              <Box>
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    color: '#2e3856', 
                                    fontSize: '0.95rem',
                                    letterSpacing: '-0.01em'
                                  }}
                                >
                                  {reply.userName || 'İsimsiz Kullanıcı'}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: 'text.secondary', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.8,
                                    fontSize: '0.75rem',
                                    mt: 0.3
                                  }}
                                >
                                  <Box 
                                    component="span" 
                                    sx={{ 
                                      width: 6, 
                                      height: 6, 
                                      borderRadius: '50%', 
                                      backgroundColor: reply.isEdited ? '#FFA000' : '#4CAF50',
                                      display: 'inline-block',
                                      boxShadow: '0 0 4px rgba(0,0,0,0.15)'
                                    }} 
                                  />
                                  {formatDate(reply.createdAt)}
                                  {reply.isEdited && ' (düzenlendi)'}
                                </Typography>
                              </Box>
                            </Box>
                            
                            {user && (user.uid === reply.userId || user.uid === post?.userId) && (
                              <IconButton 
                                size="small"
                                onClick={(e) => handleOpenMenu(e, reply)}
                                sx={{
                                  color: '#9e9e9e',
                                  backgroundColor: 'rgba(0,0,0,0.03)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0,0,0,0.08)',
                                    color: '#616161'
                                  },
                                  width: 32,
                                  height: 32
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          
                          {editingComment && editingComment.id === reply.id ? (
                            <Box sx={{ mt: 2, mb: 2 }}>
                              <StyledTextField
                                fullWidth
                                multiline
                                rows={3}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                variant="outlined"
                                placeholder="Yanıtınızı düzenleyin..."
                                sx={{ mb: 2 }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                                <Button 
                                  onClick={() => {
                                    setEditingComment(null);
                                    setEditText('');
                                  }}
                                  sx={{
                                    borderRadius: '30px',
                                    px: 3,
                                    py: 1,
                                    fontWeight: 600,
                                    textTransform: 'none'
                                  }}
                                >
                                  İptal
                                </Button>
                                <StyledButton 
                                  variant="contained"
                                  color="primary"
                                  onClick={handleEditComment}
                                  disabled={!editText.trim()}
                                >
                                  Kaydet
                                </StyledButton>
                              </Box>
                            </Box>
                          ) : (
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                mt: 1, 
                                mb: 2, 
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.6,
                                color: '#2c3e50',
                                fontSize: '0.95rem',
                                fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                letterSpacing: '0.01em'
                              }}
                            >
                              {reply.content}
                            </Typography>
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button 
                              startIcon={
                                <ThumbUpIcon 
                                  sx={{ 
                                    color: reply.likedBy?.includes(user?.uid) ? '#5ec837' : '#9e9e9e',
                                    fontSize: '1rem'
                                  }} 
                                />
                              }
                              onClick={() => handleLikeComment(reply.id)}
                              sx={{ 
                                color: reply.likedBy?.includes(user?.uid) ? '#5ec837' : '#757575',
                                fontWeight: 600,
                                borderRadius: '30px',
                                px: 2,
                                py: 0.75,
                                backgroundColor: reply.likedBy?.includes(user?.uid) ? 'rgba(94, 200, 55, 0.08)' : 'rgba(0,0,0,0.03)',
                                '&:hover': {
                                  backgroundColor: reply.likedBy?.includes(user?.uid) ? 'rgba(94, 200, 55, 0.15)' : 'rgba(0,0,0,0.06)',
                                  transform: 'translateY(-2px)'
                                },
                                textTransform: 'none',
                                fontSize: '0.85rem'
                              }}
                              disabled={!user}
                            >
                              {reply.likeCount || 0} Beğeni
                            </Button>
                          </Box>
                        </CommentCard>
                      ))}
                    </Box>
                  )}
                </CommentCard>
              </Box>
            ))}
          </>
        )}
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            mt: 0.5,
            '& .MuiList-root': {
              py: 1
            }
          }
        }}
      >
        {selectedComment && user && user.uid === selectedComment.userId && (
          <MenuItem 
            onClick={() => {
              setEditingComment(selectedComment);
              setEditText(selectedComment.content);
              handleCloseMenu();
            }}
            sx={{ 
              py: 1.2,
              px: 2,
              mx: 0.5,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: alpha('#4285F4', 0.08)
              }
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1.5, color: '#4285F4' }} />
            <Typography sx={{ fontWeight: 500 }}>Düzenle</Typography>
          </MenuItem>
        )}
        {selectedComment && user && (user.uid === selectedComment.userId || user.uid === post.userId) && (
          <MenuItem 
            onClick={() => {
              handleDeleteComment(selectedComment.id);
              handleCloseMenu();
            }}
            sx={{ 
              py: 1.2,
              px: 2,
              mx: 0.5,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: alpha('#f44336', 0.08)
              }
            }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: '#f44336' }} />
            <Typography sx={{ fontWeight: 500 }}>Sil</Typography>
          </MenuItem>
        )}
      </Menu>
      
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          pt: 3,
          px: 3,
          fontWeight: 700,
          color: '#2e3856',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h5" component="div">Gönderi Düzenle</Typography>
          <IconButton onClick={handleCloseEditDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, py: 2 }}>
          <StyledTextField
            autoFocus
            margin="dense"
            name="title"
            label="Başlık"
            type="text"
            fullWidth
            variant="outlined"
            value={editPostData.title}
            onChange={handleEditInputChange}
            sx={{ mb: 2 }}
          />
          
          <StyledTextField
            margin="dense"
            name="content"
            label="Açıklama"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={editPostData.content}
            onChange={handleEditInputChange}
            sx={{ mb: 2 }}
          />
          
          <StyledTextField
            margin="dense"
            name="tags"
            label="Etiketler (virgülle ayırın)"
            type="text"
            fullWidth
            variant="outlined"
            value={editPostData.tags}
            onChange={handleEditInputChange}
            placeholder="matematik, geometri, fizik"
            sx={{ mb: 1 }}
          />

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            * Gönderiler sadece oluşturulduktan sonraki 2 saat içinde düzenlenebilir.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseEditDialog}
            sx={{ 
              borderRadius: '30px',
              px: 3,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            İptal
          </Button>
          <StyledButton
            onClick={handleSaveEditedPost}
            variant="contained"
            color="primary"
            disabled={!editPostData.title.trim() || !editPostData.content.trim()}
          >
            Kaydet
          </StyledButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pt: 3,
          px: 3,
          fontWeight: 700,
          color: '#2e3856',
        }}>
          Gönderiyi Sil
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography variant="body1">
            Bu gönderiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm yorumlar da silinecektir.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ 
              borderRadius: '30px',
              px: 3,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            İptal
          </Button>
          <StyledButton
            onClick={handleDeletePost}
            variant="contained"
            color="error"
          >
            Sil
          </StyledButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SoruForumDetail;