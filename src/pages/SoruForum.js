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
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  Alert,
  Snackbar,
  styled,
  alpha
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  LocalOffer as TagIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
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
  arrayRemove,
  limit
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
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  },
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

// Main SoruForum component
const SoruForum = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openPostDialog, setOpenPostDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // New post form state
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);

  // Load posts on component mount
  useEffect(() => {
    fetchPosts();
  }, [tabValue]);

  // Fetch posts from Firestore
  const fetchPosts = async () => {
    setLoading(true);
    try {
      let postsQuery;
      
      if (tabValue === 0) { // En yeni
        postsQuery = query(
          collection(firestore, 'forumPosts'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      } else { // En popüler
        postsQuery = query(
          collection(firestore, 'forumPosts'),
          orderBy('likeCount', 'desc'),
          limit(20)
        );
      }
      
      const querySnapshot = await getDocs(postsQuery);
      const postsData = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const postData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Get user info
        if (postData.userId) {
          const userDoc = await getDoc(doc(firestore, 'users', postData.userId));
          if (userDoc.exists()) {
            postData.userInfo = userDoc.data();
          }
        }
        
        // Convert Firestore timestamp to JS Date
        if (postData.createdAt) {
          postData.createdAt = postData.createdAt.toDate();
        }
        
        postsData.push(postData);
      }
      
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      showNotification('Gönderiler yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle opening post dialog
  const handleOpenPostDialog = () => {
    if (!user) {
      showNotification('Gönderi oluşturmak için giriş yapmalısınız', 'warning');
      return;
    }
    setOpenPostDialog(true);
  };

  // Handle closing post dialog
  const handleClosePostDialog = () => {
    setOpenPostDialog(false);
    setNewPost({
      title: '',
      content: '',
      tags: '',
      image: null
    });
    setImagePreview(null);
    setUploadProgress(0);
  };

  // Handle input change for new post form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      showNotification('Sadece JPG ve PNG formatları desteklenmektedir', 'error');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
      return;
    }
    
    setNewPost(prev => ({
      ...prev,
      image: file
    }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle creating a new post
  const handleCreatePost = async () => {
    if (!user) {
      showNotification('Gönderi oluşturmak için giriş yapmalısınız', 'warning');
      return;
    }
    
    if (!newPost.title.trim()) {
      showNotification('Lütfen bir başlık girin', 'error');
      return;
    }
    
    if (!newPost.content.trim()) {
      showNotification('Lütfen bir açıklama girin', 'error');
      return;
    }
    
    setIsUploading(true);
    
    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (newPost.image) {
        const storageRef = ref(storage, `forum_images/${Date.now()}_${newPost.image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, newPost.image);
        
        // Monitor upload progress
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }
      
      // Process tags
      const tagsArray = newPost.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Create post document
      const postData = {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        tags: tagsArray,
        imageUrl: imageUrl,
        userId: user.uid,
        userName: user.displayName || 'İsimsiz Kullanıcı',
        userPhotoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likeCount: 0,
        commentCount: 0,
        likedBy: []
      };
      
      await addDoc(collection(firestore, 'forumPosts'), postData);
      
      showNotification('Gönderi başarıyla oluşturuldu', 'success');
      handleClosePostDialog();
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      showNotification('Gönderi oluşturulurken bir hata oluştu', 'error');
    } finally {
      setIsUploading(false);
    }
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

  // Handle navigating to post detail
  const handleViewPost = (postId) => {
    navigate(`/soru-forum/${postId}`);
  };

  // Handle liking a post
  const handleLikePost = async (postId) => {
    if (!user) {
      showNotification('Beğenmek için giriş yapmalısınız', 'warning');
      return;
    }
    
    try {
      const postRef = doc(firestore, 'forumPosts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        showNotification('Gönderi bulunamadı', 'error');
        return;
      }
      
      const postData = postDoc.data();
      const isLiked = postData.likedBy && postData.likedBy.includes(user.uid);
      
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
      
      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const newLikedBy = isLiked
              ? post.likedBy.filter(id => id !== user.uid)
              : [...(post.likedBy || []), user.uid];
            
            return {
              ...post,
              likeCount: isLiked ? (post.likeCount - 1) : (post.likeCount + 1),
              likedBy: newLikedBy
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking post:', error);
      showNotification('İşlem sırasında bir hata oluştu', 'error');
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return formatDistance(date, new Date(), { addSuffix: true, locale: tr });
  };

  // Filter posts by search term
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 700, 
          mb: 1,
          color: '#2e3856',
          textAlign: 'center'
        }}>
          Soru Forum
        </Typography>
        <Typography variant="body1" sx={{ 
          color: 'text.secondary', 
          mb: 3, 
          textAlign: 'center',
          maxWidth: 700
        }}>
          Sorularınızı paylaşın, diğer öğrencilerle tartışın ve birlikte öğrenin.
        </Typography>
        
        {/* Search and filter bar */}
        <Box sx={{ 
          display: 'flex', 
          width: '100%', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2,
          mb: 3,
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' }
        }}>
          <StyledTextField
            placeholder="Gönderilerde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{ maxWidth: { sm: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <StyledButton
            variant="contained"
            color="primary"
            startIcon={<AddPhotoIcon />}
            onClick={handleOpenPostDialog}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Yeni Soru Sor
          </StyledButton>
        </Box>
        
        {/* Tabs for sorting */}
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ 
            mb: 3,
            '& .MuiTabs-indicator': {
              backgroundColor: '#4285F4',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#2e3856',
              '&.Mui-selected': {
                color: '#4285F4',
              },
            },
          }}
        >
          <Tab 
            icon={<ArrowDownwardIcon fontSize="small" />} 
            iconPosition="start" 
            label="En Yeni" 
          />
          <Tab 
            icon={<ThumbUpIcon fontSize="small" />} 
            iconPosition="start" 
            label="En Popüler" 
          />
        </Tabs>
      </Box>
      
      {/* Posts grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredPosts.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: alpha('#4285F4', 0.05),
            border: `1px dashed ${alpha('#4285F4', 0.3)}`
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, color: '#2e3856' }}>
            Henüz gönderi bulunmuyor
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            İlk gönderiyi oluşturmak için "Yeni Soru Sor" butonuna tıklayın
          </Typography>
          <StyledButton
            variant="contained"
            color="primary"
            startIcon={<AddPhotoIcon />}
            onClick={handleOpenPostDialog}
          >
            Yeni Soru Sor
          </StyledButton>
        </Paper>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3 
        }}>
          {filteredPosts.map(post => (
            <StyledCard key={post.id}>
              {post.imageUrl && (
                <CardMedia
                  component="img"
                  height="200"
                  image={post.imageUrl}
                  alt={post.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={post.userInfo?.photoURL || post.userPhotoURL} 
                    alt={post.userInfo?.displayName || post.userName}
                    sx={{ width: 36, height: 36, mr: 1.5 }}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e3856' }}>
                      {post.userInfo?.displayName || post.userName || 'İsimsiz Kullanıcı'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(post.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    color: '#2e3856',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {post.title}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {post.content}
                </Typography>
                
                {post.tags && post.tags.length > 0 && (
                  <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap' }}>
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
              
              <Divider sx={{ mx: 2 }} />
              
              <CardActions sx={{ px: 2, py: 1, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    startIcon={
                      <ThumbUpIcon 
                        color={post.likedBy?.includes(user?.uid) ? 'primary' : 'action'} 
                        fontSize="small" 
                      />
                    }
                    onClick={() => handleLikePost(post.id)}
                    sx={{ 
                      color: post.likedBy?.includes(user?.uid) ? 'primary.main' : 'text.secondary',
                      fontWeight: 500
                    }}
                  >
                    {post.likeCount || 0}
                  </Button>
                  
                  <Button 
                    size="small" 
                    startIcon={<CommentIcon fontSize="small" />}
                    sx={{ color: 'text.secondary', fontWeight: 500 }}
                  >
                    {post.commentCount || 0}
                  </Button>
                </Box>
                
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => handleViewPost(post.id)}
                  sx={{ fontWeight: 600 }}
                >
                  Detaylar
                </Button>
              </CardActions>
            </StyledCard>
          ))}
        </Box>
      )}
      
      {/* New Post Dialog */}
      <Dialog 
        open={openPostDialog} 
        onClose={handleClosePostDialog}
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
          <Typography variant="h5" component="div">Yeni Soru Sor</Typography>
          <IconButton onClick={handleClosePostDialog} size="small">
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
            value={newPost.title}
            onChange={handleInputChange}
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
            value={newPost.content}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          
          <StyledTextField
            margin="dense"
            name="tags"
            label="Etiketler (virgülle ayırın)"
            type="text"
            fullWidth
            variant="outlined"
            value={newPost.tags}
            onChange={handleInputChange}
            placeholder="matematik, geometri, fizik"
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ mb: 3 }}>
            <input
              type="file"
              accept="image/jpeg, image/png"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            
            <Button
              variant="outlined"
              startIcon={<AddPhotoIcon />}
              onClick={() => fileInputRef.current.click()}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                mb: 2
              }}
            >
              Fotoğraf Ekle
            </Button>
            
            {imagePreview && (
              <Box sx={{ position: 'relative', mb: 2 }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '200px', 
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }} 
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    }
                  }}
                  onClick={() => {
                    setNewPost(prev => ({ ...prev, image: null }));
                    setImagePreview(null);
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
            
            {isUploading && (
              <Box sx={{ width: '100%', mt: 1 }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                  Yükleniyor: {Math.round(uploadProgress)}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClosePostDialog}
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
            onClick={handleCreatePost}
            variant="contained"
            color="primary"
            disabled={isUploading || !newPost.title.trim() || !newPost.content.trim()}
            startIcon={isUploading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {isUploading ? 'Yükleniyor...' : 'Paylaş'}
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

export default SoruForum;
