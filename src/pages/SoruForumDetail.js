import React, { useState, useEffect, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  styled,
  alpha,
  Breadcrumbs
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../firebase';
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
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: '#FFFFFF',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: '20px',
  fontWeight: 500,
  fontSize: '0.75rem',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
  margin: theme.spacing(0.5),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px',
  padding: '8px 20px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
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
}));

const CommentCard = styled(Paper)(({ theme, isReply }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  marginLeft: isReply ? theme.spacing(5) : 0,
  borderRadius: '12px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  backgroundColor: isReply ? alpha(theme.palette.background.paper, 0.5) : theme.palette.background.paper,
  position: 'relative',
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
  
  // Load post and comments on component mount
  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  // Fetch post from Firestore
  const fetchPost = async () => {
    try {
      const postDoc = await getDoc(doc(firestore, 'forumPosts', postId));
      
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
        const userDoc = await getDoc(doc(firestore, 'users', postData.userId));
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
        collection(firestore, 'forumComments'),
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
          const userDoc = await getDoc(doc(firestore, 'users', commentData.userId));
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
      
      await addDoc(collection(firestore, 'forumComments'), commentData);
      
      // Update post comment count
      const postRef = doc(firestore, 'forumPosts', postId);
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
      
      await addDoc(collection(firestore, 'forumComments'), replyData);
      
      // Update post comment count
      const postRef = doc(firestore, 'forumPosts', postId);
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
      const commentRef = doc(firestore, 'forumComments', editingComment.id);
      
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
      await deleteDoc(doc(firestore, 'forumComments', commentId));
      
      // Update post comment count
      const postRef = doc(firestore, 'forumPosts', postId);
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
      const commentRef = doc(firestore, 'forumComments', commentId);
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

  // Handle liking the post
  const handleLikePost = async () => {
    if (!user || !post) {
      showNotification('Beğenmek için giriş yapmalısınız', 'warning');
      return;
    }
    
    try {
      const postRef = doc(firestore, 'forumPosts', postId);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={comment.userInfo?.photoURL || comment.userPhotoURL} 
              alt={comment.userInfo?.displayName || comment.userName}
              sx={{ width: 32, height: 32, mr: 1.5 }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e3856' }}>
                {comment.userInfo?.displayName || comment.userName || 'İsimsiz Kullanıcı'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.createdAt)}
                {comment.isEdited && ' (düzenlendi)'}
              </Typography>
            </Box>
          </Box>
          
          {user && (user.uid === comment.userId || user.uid === post?.userId) && (
            <IconButton 
              size="small"
              onClick={(e) => handleOpenMenu(e, comment)}
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
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                size="small"
                onClick={() => {
                  setEditingComment(null);
                  setEditText('');
                }}
              >
                İptal
              </Button>
              <Button 
                size="small"
                variant="contained"
                color="primary"
                onClick={handleEditComment}
              >
                Kaydet
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ mt: 1, mb: 2, whiteSpace: 'pre-wrap' }}>
            {comment.content}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              fontWeight: 500
            }}
          >
            {comment.likeCount || 0}
          </Button>
          
          {!isReply && (
            <Button 
              size="small" 
              startIcon={<ReplyIcon fontSize="small" />}
              onClick={() => setReplyingTo(comment)}
              sx={{ color: 'text.secondary', fontWeight: 500 }}
            >
              Yanıtla
            </Button>
          )}
        </Box>
      </CommentCard>
      
      {/* Reply form */}
      {replyingTo && replyingTo.id === comment.id && (
        <Box sx={{ ml: 5, mb: 3 }}>
          <StyledTextField
            fullWidth
            multiline
            rows={2}
            placeholder="Yanıtınızı yazın..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              size="small"
              onClick={() => {
                setReplyingTo(null);
                setReplyText('');
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
      <StyledCard sx={{ mb: 4 }}>
        {post.imageUrl && (
          <CardMedia
            component="img"
            height="300"
            image={post.imageUrl}
            alt={post.title}
            sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5' }}
          />
        )}
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar 
              src={post.userInfo?.photoURL || post.userPhotoURL} 
              alt={post.userInfo?.displayName || post.userName}
              sx={{ width: 40, height: 40, mr: 1.5 }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2e3856' }}>
                {post.userInfo?.displayName || post.userName || 'İsimsiz Kullanıcı'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(post.createdAt)}
              </Typography>
            </Box>
          </Box>
          
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              color: '#2e3856'
            }}
          >
            {post.title}
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{
              mb: 3,
              whiteSpace: 'pre-wrap'
            }}
          >
            {post.content}
          </Typography>
          
          {post.tags && post.tags.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap' }}>
              {post.tags.map(tag => (
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
        
        <Divider />
        
        <CardActions sx={{ px: 2, py: 1.5 }}>
          <Button 
            startIcon={
              <ThumbUpIcon 
                color={post.likedBy?.includes(user?.uid) ? 'primary' : 'action'} 
              />
            }
            onClick={handleLikePost}
            sx={{ 
              color: post.likedBy?.includes(user?.uid) ? 'primary.main' : 'text.secondary',
              fontWeight: 500
            }}
          >
            {post.likeCount || 0} Beğeni
          </Button>
          
          <Button 
            startIcon={<CommentIcon />}
            sx={{ color: 'text.secondary', fontWeight: 500 }}
          >
            {post.commentCount || 0} Yorum
          </Button>
        </CardActions>
      </StyledCard>
      
      {/* Comments section */}
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 3, 
          fontWeight: 600,
          color: '#2e3856'
        }}
      >
        Yorumlar ({post.commentCount || 0})
      </Typography>
      
      {/* Comment form */}
      {user ? (
        <Box sx={{ mb: 4 }}>
          <StyledTextField
            fullWidth
            multiline
            rows={3}
            placeholder="Yorumunuzu yazın..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
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
            p: 3, 
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: alpha('#4285F4', 0.05),
            border: `1px dashed ${alpha('#4285F4', 0.3)}`
          }}
        >
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Henüz yorum yapılmamış. İlk yorumu siz yapın!
          </Typography>
        </Paper>
      ) : (
        <Box>
          {comments.map(comment => renderComment(comment))}
        </Box>
      )}
      
      {/* Comment menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {selectedComment && user && user.uid === selectedComment.userId && (
          <MenuItem 
            onClick={() => {
              setEditingComment(selectedComment);
              setEditText(selectedComment.content);
              handleCloseMenu();
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Düzenle
          </MenuItem>
        )}
        {selectedComment && user && (user.uid === selectedComment.userId || user.uid === post.userId) && (
          <MenuItem 
            onClick={() => {
              handleDeleteComment(selectedComment.id);
              handleCloseMenu();
            }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Sil
          </MenuItem>
        )}
      </Menu>
      
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
