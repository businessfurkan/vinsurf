import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Card,
  CardContent,
  CardMedia,
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
  DialogActions
} from '@mui/material';
import {

  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
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
  deleteDoc, 
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
  background: '#FFFFFF',
  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
  },
}));

const StyledChip = styled(Chip)(({ theme, colorIndex, label }) => {
  // Renkli etiketler için renk paleti
  const colors = [
    { bg: '#E3F2FD', color: '#55b3d9' }, // Mavi
    { bg: '#E8F5E9', color: '#2E7D32' }, // Yeşil
    { bg: '#FFF8E1', color: '#F57F17' }, // Sarı
    { bg: '#F3E5F5', color: '#7B1FA2' }, // Mor
    { bg: '#FFEBEE', color: '#C62828' }, // Kırmızı
    { bg: '#E0F7FA', color: '#00838F' }, // Turkuaz
  ];
  
  // Hash fonksiyonu ile tag'e göre renk seçimi
  const getColorIndex = (tag) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % colors.length;
  };
  
  // Eğer colorIndex belirtilmemişse ve label varsa, label'a göre renk seç
  const index = colorIndex !== undefined ? colorIndex : (label ? getColorIndex(label) : 0);
  const colorObj = colors[index];
  
  return {
    borderRadius: '20px',
    fontWeight: 600,
    fontSize: '0.75rem',
    backgroundColor: colorObj.bg,
    color: colorObj.color,
    border: `1px solid ${alpha(colorObj.color, 0.2)}`,
    '&:hover': {
      backgroundColor: alpha(colorObj.color, 0.15)
    },
    margin: theme.spacing(0.5),
    transition: 'all 0.2s ease',
    padding: '4px 10px'
  };
});

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px',
  padding: '8px 24px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
  },
  '&.MuiButton-containedPrimary': {
    background: 'linear-gradient(45deg, #4285F4 30%, #5C9CFF 90%)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '& fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.2),
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.5),
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.95rem',
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.95rem',
  },
}));

const CommentCard = styled(Paper)(({ theme, isReply }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2.5),
  marginLeft: isReply ? theme.spacing(6) : 0,
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  backgroundColor: isReply ? '#F8FAFF' : '#FFFFFF',
  position: 'relative',
  boxShadow: isReply ? 'none' : '0 4px 15px rgba(0,0,0,0.05)',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: isReply ? 'none' : '0 6px 20px rgba(0,0,0,0.08)',
    borderColor: alpha(theme.palette.primary.main, 0.2)
  },
  '&::before': isReply ? {
    content: '""',
    position: 'absolute',
    left: '-20px',
    top: '20px',
    width: '20px',
    height: '2px',
    backgroundColor: alpha(theme.palette.primary.main, 0.2)
  } : {}
}));

// Main SoruForumDetail component
const SoruForumDetail = () => {
  const { postId } = useParams();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPostData, setEditPostData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Fetch post from Firestore
  const fetchPost = async () => {
    try {
      const postDoc = await getDoc(doc(db, 'forumPosts', postId));
      
      if (!postDoc.exists()) {
        showNotification('Gönderi bulunamadı', 'error');
        navigate('/soru-forum');
        return;
      }
      
      const postData = { id: postDoc.id, ...postDoc.data() };
      
      // Convert Firestore timestamp to JS Date
      if (postData.createdAt) {
        postData.createdAt = postData.createdAt.toDate();
      }
      
      // Get user info
      if (postData.userId) {
        const userDoc = await getDoc(doc(db, 'users', postData.userId));
        if (userDoc.exists()) {
          postData.userInfo = userDoc.data();
        }
      }
      
      setPost(postData);
    } catch (error) {
      console.error('Error fetching post:', error);
      showNotification('Gönderi yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments from Firestore
  const fetchComments = async () => {
    try {
      const commentsQuery = query(
        collection(db, 'forumComments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(commentsQuery);
      const commentsData = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const commentData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Convert Firestore timestamp to JS Date
        if (commentData.createdAt) {
          commentData.createdAt = commentData.createdAt.toDate();
        }
        
        // Get user info
        if (commentData.userId) {
          const userDoc = await getDoc(doc(db, 'users', commentData.userId));
          if (userDoc.exists()) {
            commentData.userInfo = userDoc.data();
          }
        }
        
        commentsData.push(commentData);
      }
      
      // Organize comments into threads
      const organizedComments = organizeComments(commentsData);
      setComments(organizedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      showNotification('Yorumlar yüklenirken bir hata oluştu', 'error');
    }
  };

  // Organize comments into threads
  const organizeComments = (commentsArray) => {
    const commentMap = {};
    const rootComments = [];
    
    // First pass: create a map of all comments
    commentsArray.forEach(comment => {
      commentMap[comment.id] = {
        ...comment,
        replies: []
      };
    });
    
    // Second pass: organize into parent-child relationships
    commentsArray.forEach(comment => {
      if (comment.parentId) {
        // This is a reply
        if (commentMap[comment.parentId]) {
          commentMap[comment.parentId].replies.push(commentMap[comment.id]);
        } else {
          // Parent comment not found, treat as root
          rootComments.push(commentMap[comment.id]);
        }
      } else {
        // This is a root comment
        rootComments.push(commentMap[comment.id]);
      }
    });
    
    return rootComments;
  };

  // Load post and comments on component mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!user) {
      showNotification('Yorum yapmak için giriş yapmalısınız', 'warning');
      return;
    }
    
    if (!commentText.trim()) {
      showNotification('Lütfen bir yorum yazın', 'error');
      return;
    }
    
    try {
      // Create comment document
      const commentData = {
        postId: postId,
        content: commentText.trim(),
        userId: user.uid,
        userName: user.displayName || 'İsimsiz Kullanıcı',
        userPhotoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likeCount: 0,
        likedBy: []
      };
      
      await addDoc(collection(db, 'forumComments'), commentData);
      
      // Update post comment count
      const postRef = doc(db, 'forumPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });
      
      showNotification('Yorum başarıyla eklendi', 'success');
      setCommentText('');
      fetchComments();
      fetchPost(); // Refresh post to update comment count
    } catch (error) {
      console.error('Error adding comment:', error);
      showNotification('Yorum eklenirken bir hata oluştu', 'error');
    }
  };

  // Handle adding a reply to a comment
  const handleAddReply = async () => {
    if (!user) {
      showNotification('Yanıt vermek için giriş yapmalısınız', 'warning');
      return;
    }
    
    if (!replyText.trim() || !replyingTo) {
      showNotification('Lütfen bir yanıt yazın', 'error');
      return;
    }
    
    try {
      // Create reply document
      const replyData = {
        postId: postId,
        parentId: replyingTo.id,
        content: replyText.trim(),
        userId: user.uid,
        userName: user.displayName || 'İsimsiz Kullanıcı',
        userPhotoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likeCount: 0,
        likedBy: []
      };
      
      await addDoc(collection(db, 'forumComments'), replyData);
      
      // Update post comment count
      const postRef = doc(db, 'forumPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });
      
      showNotification('Yanıt başarıyla eklendi', 'success');
      setReplyText('');
      setReplyingTo(null);
      fetchComments();
      fetchPost(); // Refresh post to update comment count
    } catch (error) {
      console.error('Error adding reply:', error);
      showNotification('Yanıt eklenirken bir hata oluştu', 'error');
    }
  };

  // Handle editing a comment
  const handleEditComment = async () => {
    if (!user || !editingComment) {
      return;
    }
    
    if (!editText.trim()) {
      showNotification('Yorum boş olamaz', 'error');
      return;
    }
    
    try {
      const commentRef = doc(db, 'forumComments', editingComment.id);
      
      await updateDoc(commentRef, {
        content: editText.trim(),
        updatedAt: serverTimestamp(),
        isEdited: true
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

  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    if (!user) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'forumComments', commentId));
      
      // Update post comment count
      const postRef = doc(db, 'forumPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(-1)
      });
      
      showNotification('Yorum başarıyla silindi', 'success');
      fetchComments();
      fetchPost(); // Refresh post to update comment count
    } catch (error) {
      console.error('Error deleting comment:', error);
      showNotification('Yorum silinirken bir hata oluştu', 'error');
    }
  };

  // Handle liking a comment
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
      const isLiked = commentData.likedBy && commentData.likedBy.includes(user.uid);
      
      if (isLiked) {
        // Unlike
        await updateDoc(commentRef, {
          likeCount: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
      } else {
        // Like
        await updateDoc(commentRef, {
          likeCount: increment(1),
          likedBy: arrayUnion(user.uid)
        });
      }
      
      fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
      showNotification('İşlem sırasında bir hata oluştu', 'error');
    }
  };

  // Check if post can be edited (within 2 hours of creation)
  const canEditPost = () => {
    if (!post || !user || user.uid !== post.userId) return false;
    
    const now = new Date();
    const postTime = post.createdAt;
    const timeDiff = now - postTime; // time difference in milliseconds
    const hoursDiff = timeDiff / (1000 * 60 * 60); // convert to hours
    
    return hoursDiff <= 2; // can edit if less than 2 hours old
  };

  // Handle opening edit dialog
  const handleOpenEditDialog = () => {
    if (!canEditPost()) {
      showNotification('Gönderi düzenleme süresi dolmuştur (2 saat)', 'warning');
      return;
    }
    
    setEditPostData({
      title: post.title,
      content: post.content,
      tags: post.tags ? post.tags.join(', ') : ''
    });
    setEditDialogOpen(true);
  };

  // Handle closing edit dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  // Handle edit input change
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditPostData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle saving edited post
  const handleSaveEditedPost = async () => {
    if (!user || !post) return;
    
    if (!editPostData.title.trim()) {
      showNotification('Lütfen bir başlık girin', 'error');
      return;
    }
    
    if (!editPostData.content.trim()) {
      showNotification('Lütfen bir açıklama girin', 'error');
      return;
    }
    
    try {
      // Process tags
      const tagsArray = editPostData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const postRef = doc(db, 'forumPosts', postId);
      await updateDoc(postRef, {
        title: editPostData.title.trim(),
        content: editPostData.content.trim(),
        tags: tagsArray,
        updatedAt: serverTimestamp(),
        isEdited: true
      });
      
      showNotification('Gönderi başarıyla güncellendi', 'success');
      setEditDialogOpen(false);
      fetchPost(); // Refresh post data
    } catch (error) {
      console.error('Error updating post:', error);
      showNotification('Gönderi güncellenirken bir hata oluştu', 'error');
    }
  };

  // Handle deleting post
  const handleDeletePost = async () => {
    if (!user || !post || user.uid !== post.userId) {
      showNotification('Bu gönderiyi silme yetkiniz yok', 'error');
      return;
    }
    
    try {
      // Delete the post document
      await deleteDoc(doc(db, 'forumPosts', postId));
      
      // Delete all comments associated with this post
      const commentsQuery = query(
        collection(db, 'forumComments'),
        where('postId', '==', postId)
      );
      
      const querySnapshot = await getDocs(commentsQuery);
      const batch = writeBatch(db);
      
      querySnapshot.forEach(docSnapshot => {
        batch.delete(docSnapshot.ref);
      });
      
      await batch.commit();
      
      showNotification('Gönderi başarıyla silindi', 'success');
      navigate('/soru-forum');
    } catch (error) {
      console.error('Error deleting post:', error);
      showNotification('Gönderi silinirken bir hata oluştu', 'error');
    }
  };

  // Handle liking the post
  const handleLikePost = async () => {
    if (!user || !post) {
      showNotification('Beğenmek için giriş yapmalısınız', 'warning');
      return;
    }
    
    try {
      const postRef = doc(db, 'forumPosts', postId);
      const isLiked = post.likedBy && post.likedBy.includes(user.uid);
      
      if (isLiked) {
        // Unlike
        await updateDoc(postRef, {
          likeCount: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
      } else {
        // Like
        await updateDoc(postRef, {
          likeCount: increment(1),
          likedBy: arrayUnion(user.uid)
        });
      }
      
      fetchPost();
    } catch (error) {
      console.error('Error liking post:', error);
      showNotification('İşlem sırasında bir hata oluştu', 'error');
    }
  };

  // Handle opening comment menu
  const handleOpenMenu = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  // Handle closing comment menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  // Show notification
  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return formatDistance(date, new Date(), { addSuffix: true, locale: tr });
  };

  // Render comment with replies
  const renderComment = (comment, isReply = false) => (
    <Box key={comment.id}>
      <CommentCard isReply={isReply} elevation={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={comment.userInfo?.photoURL || comment.userPhotoURL} 
              alt={comment.userInfo?.displayName || comment.userName}
              sx={{ 
                width: 36, 
                height: 36, 
                mr: 1.5,
                border: isReply ? '1px solid #4285F4' : '2px solid #4285F4',
                boxShadow: isReply ? 'none' : '0 2px 6px rgba(66, 133, 244, 0.15)'
              }}
            />
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#2e3856',
                  fontSize: '0.9rem'
                }}
              >
                {comment.userInfo?.displayName || comment.userName || 'İsimsiz Kullanıcı'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    backgroundColor: comment.isEdited ? '#FFA000' : '#4CAF50',
                    display: 'inline-block'
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
                '&:hover': {
                  backgroundColor: alpha('#000', 0.04),
                  color: '#616161'
                }
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
              rows={2}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              variant="outlined"
              sx={{ 
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#FFFFFF'
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                size="small"
                onClick={() => {
                  setEditingComment(null);
                  setEditText('');
                }}
                sx={{
                  borderRadius: '20px',
                  px: 2,
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                İptal
              </Button>
              <Button 
                size="small"
                variant="contained"
                color="primary"
                onClick={handleEditComment}
                sx={{
                  borderRadius: '20px',
                  px: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(45deg, #4285F4 30%, #5C9CFF 90%)'
                }}
              >
                Kaydet
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1.5, 
              mb: 2.5, 
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              color: '#424242',
              fontSize: '0.95rem'
            }}
          >
            {comment.content}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button 
            size="small" 
            startIcon={
              <ThumbUpIcon 
                color={comment.likedBy?.includes(user?.uid) ? 'primary' : 'action'} 
                fontSize="small" 
              />
            }
            onClick={() => handleLikeComment(comment.id)}
            sx={{ 
              color: comment.likedBy?.includes(user?.uid) ? 'primary.main' : 'text.secondary',
              fontWeight: 600,
              borderRadius: '20px',
              px: 1.5,
              backgroundColor: comment.likedBy?.includes(user?.uid) ? alpha('#4285F4', 0.08) : 'transparent',
              '&:hover': {
                backgroundColor: comment.likedBy?.includes(user?.uid) ? alpha('#4285F4', 0.12) : alpha('#000', 0.04)
              }
            }}
          >
            {comment.likeCount || 0}
          </Button>
          
          {!isReply && (
            <Button 
              size="small" 
              startIcon={<ReplyIcon fontSize="small" />}
              onClick={() => setReplyingTo(comment)}
              sx={{ 
                color: 'text.secondary', 
                fontWeight: 600,
                borderRadius: '20px',
                px: 1.5,
                '&:hover': {
                  backgroundColor: alpha('#000', 0.04)
                }
              }}
            >
              Yanıtla
            </Button>
          )}
        </Box>
      </CommentCard>
      
      {/* Reply form */}
      {replyingTo && replyingTo.id === comment.id && (
        <Box 
          sx={{ 
            ml: 6, 
            mb: 3, 
            mt: 1,
            p: 2,
            borderRadius: '12px',
            border: '1px solid rgba(66, 133, 244, 0.15)',
            backgroundColor: alpha('#F8FAFF', 0.7)
          }}
        >
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1.5, 
              color: '#2e3856',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <ReplyIcon fontSize="small" sx={{ color: '#4285F4' }} />
            Yanıt yazıyorsunuz
          </Typography>
          
          <StyledTextField
            fullWidth
            multiline
            rows={2}
            placeholder="Yanıtınızı yazın..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            variant="outlined"
            sx={{ 
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF'
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              size="small"
              onClick={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
              sx={{
                borderRadius: '20px',
                px: 2,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              İptal
            </Button>
            <StyledButton 
              size="small"
              variant="contained"
              color="primary"
              onClick={handleAddReply}
              disabled={!replyText.trim()}
              sx={{
                borderRadius: '20px',
                px: 2,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Yanıtla
            </StyledButton>
          </Box>
        </Box>
      )}
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ ml: isReply ? 0 : 5 }}>
          {comment.replies.map(reply => renderComment(reply, true))}
        </Box>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Gönderi bulunamadı</Typography>
        <Button 
          component={Link} 
          to="/soru-forum"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/soru-forum" style={{ textDecoration: 'none', color: '#2e3856' }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
            Forum
          </Typography>
        </Link>
        <Typography variant="body2" color="text.secondary">
          {post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title}
        </Typography>
      </Breadcrumbs>
      
      {/* Post card */}
      <StyledCard sx={{ mb: 4, position: 'relative', overflow: 'visible' }}>
        {/* Renkli üst şerit */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: '8px', 
            background: 'linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            zIndex: 1
          }}
        />
        
        {post.imageUrl && (
          <CardMedia
            component="img"
            height="350"
            image={post.imageUrl}
            alt={post.title}
            sx={{ 
              objectFit: 'contain', 
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid rgba(0,0,0,0.06)'
            }}
          />
        )}
        <CardContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            pb: 2,
            borderBottom: '1px dashed rgba(0,0,0,0.08)'
          }}>
            <Avatar 
              src={post.userInfo?.photoURL || post.userPhotoURL} 
              alt={post.userInfo?.displayName || post.userName}
              sx={{ 
                width: 48, 
                height: 48, 
                mr: 2,
                border: '2px solid #4285F4',
                boxShadow: '0 2px 8px rgba(66, 133, 244, 0.2)'
              }}
            />
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#2e3856',
                  fontSize: '1.1rem'
                }}
              >
                {post.userInfo?.displayName || post.userName || 'İsimsiz Kullanıcı'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: '#4CAF50',
                    display: 'inline-block'
                  }} 
                />
                {formatDate(post.createdAt)}
              </Typography>
            </Box>
          </Box>
          
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              mb: 2.5,
              color: '#2e3856',
              lineHeight: 1.3,
              fontSize: { xs: '1.5rem', sm: '1.8rem' }
            }}
          >
            {post.title}
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{
              mb: 3.5,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              color: '#424242',
              fontSize: '1rem',
              letterSpacing: '0.01em'
            }}
          >
            {post.content}
          </Typography>
          
          {post.tags && post.tags.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {post.tags.map((tag, index) => (
                <StyledChip 
                  key={tag} 
                  label={tag} 
                  size="small"
                  icon={<TagIcon fontSize="small" />}
                />
              ))}
            </Box>
          )}
        </CardContent>
        
        <Divider sx={{ opacity: 0.6 }} />
        
        <CardActions sx={{ px: { xs: 2, sm: 3 }, py: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              startIcon={
                <ThumbUpIcon 
                  color={post.likedBy?.includes(user?.uid) ? 'primary' : 'action'} 
                  fontSize="small"
                />
              }
              onClick={handleLikePost}
              sx={{ 
                color: post.likedBy?.includes(user?.uid) ? 'primary.main' : 'text.secondary',
                fontWeight: 600,
                borderRadius: '20px',
                px: 2,
                backgroundColor: post.likedBy?.includes(user?.uid) ? alpha('#4285F4', 0.1) : 'transparent',
                '&:hover': {
                  backgroundColor: post.likedBy?.includes(user?.uid) ? alpha('#4285F4', 0.15) : alpha('#000', 0.04)
                }
              }}
            >
              {post.likeCount || 0} Beğeni
            </Button>
            
            <Button 
              startIcon={<CommentIcon fontSize="small" />}
              sx={{ 
                color: 'text.secondary', 
                fontWeight: 600,
                borderRadius: '20px',
                px: 2,
                '&:hover': {
                  backgroundColor: alpha('#000', 0.04)
                }
              }}
            >
              {post.commentCount || 0} Yorum
            </Button>
          </Box>

          {user && user.uid === post.userId && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                startIcon={<EditIcon fontSize="small" />}
                onClick={handleOpenEditDialog}
                sx={{ 
                  color: canEditPost() ? 'primary.main' : 'text.disabled',
                  fontWeight: 600,
                  borderRadius: '20px',
                  px: 2,
                  backgroundColor: canEditPost() ? alpha('#4285F4', 0.1) : 'transparent',
                  '&:hover': {
                    backgroundColor: canEditPost() ? alpha('#4285F4', 0.15) : 'transparent'
                  }
                }}
                disabled={!canEditPost()}
              >
                Düzenle
              </Button>
              
              <Button 
                startIcon={<DeleteIcon fontSize="small" />}
                onClick={() => setDeleteConfirmOpen(true)}
                sx={{ 
                  color: 'error.main',
                  fontWeight: 600,
                  borderRadius: '20px',
                  px: 2,
                  backgroundColor: alpha('#f44336', 0.1),
                  '&:hover': {
                    backgroundColor: alpha('#f44336', 0.15)
                  }
                }}
              >
                Sil
              </Button>
            </Box>
          )}
        </CardActions>
      </StyledCard>
      
      {/* Comments section */}
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          mb: 3,
          mt: 4,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: '60px',
            height: '3px',
            backgroundColor: '#4285F4',
            borderRadius: '10px'
          }
        }}
      >
        <CommentIcon 
          sx={{ 
            color: '#4285F4', 
            mr: 1.5,
            fontSize: '1.8rem'
          }} 
        />
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            color: '#2e3856',
            fontSize: '1.5rem'
          }}
        >
          Yorumlar ({post.commentCount || 0})
        </Typography>
      </Box>
      
      {/* Comment form */}
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
      
      {/* Comments list */}
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
        <Box sx={{ mt: 2 }}>
          {comments.map(comment => renderComment(comment))}
        </Box>
      )}
      
      {/* Comment menu */}
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
      
      {/* Edit Post Dialog */}
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

      {/* Delete Confirmation Dialog */}
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

      {/* Snackbar for notifications */}
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
    </Box>
  );
};

export default SoruForumDetail;
