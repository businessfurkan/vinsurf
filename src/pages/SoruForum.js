import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  styled,
  alpha,
  Grid,
  Container,
  Divider
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  QuestionAnswer as QuestionIcon
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { useNavigate } from 'react-router-dom';



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
  const [popularTags, setPopularTags] = useState([]);
  
  // Refs
  const fileInputRef = useRef(null);
  
  // Show notification
  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Fetch posts from Firestore
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let postsQuery;
      
      if (tabValue === 0) { // En yeni
        postsQuery = query(
          collection(db, 'forumPosts'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      } else { // En popüler
        postsQuery = query(
          collection(db, 'forumPosts'),
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
          const userDoc = await getDoc(doc(db, 'users', postData.userId));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue]);

  // Load posts on component mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
      // NOTE: All forum data (posts, comments, and images) are permanently stored in Firestore/Storage
      // and should NOT be automatically deleted. This data should persist indefinitely.
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
      
      await addDoc(collection(db, 'forumPosts'), postData);
      
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

  // Handle closing snackbar

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

  // Bu fonksiyon artık doğrudan render kısmında kullanılıyor

  // Popüler etiketleri hesapla
  useEffect(() => {
    if (posts.length > 0) {
      const tagsCount = {};
      posts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach(tag => {
            tagsCount[tag] = (tagsCount[tag] || 0) + 1;
          });
        }
      });
      
      // En popüler 5 etiketi al
      const sortedTags = Object.keys(tagsCount).sort((a, b) => tagsCount[b] - tagsCount[a]).slice(0, 5);
      setPopularTags(sortedTags);
    }
  }, [posts]);

  // Arama terimini değiştirme fonksiyonu
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <QuestionIcon color="primary" sx={{ fontSize: 36, mr: 1 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#2e3856' }}>
            Soru Forum
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary', fontWeight: 400 }}>
          Sorularınızı paylaşın, diğer öğrencilerle tartışın ve birlikte öğrenin.
        </Typography>
        <Divider sx={{ mb: 4 }} />
      </Box>
      
      {/* Action Bar */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid gridColumn={{xs: "span 12", md: "span 8"}}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#4285F4',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  minWidth: 100,
                  '&.Mui-selected': {
                    color: '#4285F4',
                  },
                },
              }}
            >
              <Tab label="En Yeni" />
              <Tab label="En Popüler" />
            </Tabs>
          </Box>
        </Grid>
        <Grid gridColumn={{xs: "span 12", md: "span 4"}}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <TextField
              placeholder="Ara..."
              size="small"
              value={searchTerm}
              onChange={handleSearchTermChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
              sx={{ width: '100%', maxWidth: 300 }}
            />
          </Box>
        </Grid>
      </Grid>
      
      {/* New Post Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenPostDialog}
          disabled={!user}
          startIcon={<SendIcon />}
          sx={{
            borderRadius: 8,
            py: 1.5,
            px: 4,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            background: 'linear-gradient(45deg, #4285F4 30%, #5C9CFF 90%)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            }
          }}
        >
          Yeni Soru Sor
        </Button>
      </Box>
      
      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Popüler Etiketler
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {popularTags.map((tag, index) => (
              <Chip 
                key={index} 
                label={tag} 
                clickable
                onClick={() => setSearchTerm(tag)}
                sx={{
                  borderRadius: '20px',
                  fontWeight: 500,
                  backgroundColor: alpha('#4285F4', 0.1),
                  color: '#4285F4',
                  '&:hover': {
                    backgroundColor: alpha('#4285F4', 0.2),
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: 4,
            background: 'linear-gradient(to right, #f9f9f9, #f0f4ff)',
            border: '1px dashed rgba(0,0,0,0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}
        >
          <QuestionIcon sx={{ fontSize: 70, color: '#4285F4', mb: 2, opacity: 0.7 }} />
          <Typography variant="h5" sx={{ mb: 1, color: '#2e3856', fontWeight: 700 }}>
            Henüz soru yok
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', fontSize: '1.1rem' }}>
            İlk soruyu sormak için &quot;Yeni Soru Sor&quot; butonuna tıklayın.
          </Typography>
          {user ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenPostDialog}
              startIcon={<SendIcon />}
              sx={{
                borderRadius: 8,
                py: 1.5,
                px: 4,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 8px 20px rgba(66, 133, 244, 0.3)',
                background: 'linear-gradient(45deg, #4285F4 30%, #5C9CFF 90%)',
                '&:hover': {
                  boxShadow: '0 10px 25px rgba(66, 133, 244, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Yeni Soru Sor
            </Button>
          ) : (
            <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary', fontSize: '1.05rem' }}>
              Soru sormak için giriş yapmalısınız.
            </Typography>
          )}
        </Paper>
      ) : (
        <Box>
          {posts.filter(post => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
              post.title.toLowerCase().includes(searchLower) ||
              post.content.toLowerCase().includes(searchLower) ||
              (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
          }).map(post => (
            <Paper
              key={post.id}
              elevation={0}
              sx={{
                mb: 1.5,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                border: '1px solid rgba(0,0,0,0.06)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                  backgroundColor: '#f0e8d3'
                },
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '10px 16px',
                backgroundColor: '#e8dec1'
              }}
              onClick={() => handleViewPost(post.id)}
            >
              {/* Left - User avatar */}
              <Avatar 
                src={post.userPhotoURL} 
                alt={post.userName}
                sx={{ 
                  width: 36, 
                  height: 36, 
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  mr: 2
                }}
              >
                {post.userName?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              
              {/* Middle - Post title only */}
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#2e3856',
                    fontSize: '0.95rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {post.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#555',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}
                  >
                    {post.userName}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <ThumbUpIcon sx={{ fontSize: '0.85rem', mr: 0.5, color: '#666' }} />
                    <Typography variant="caption" sx={{ color: '#666', mr: 1.5 }}>
                      {post.likeCount || 0}
                    </Typography>
                    
                    <CommentIcon sx={{ fontSize: '0.85rem', mr: 0.5, color: '#666' }} />
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {post.commentCount || 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Right - Post date and tag */}
              <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#555',
                    whiteSpace: 'nowrap',
                    fontSize: '0.75rem',
                    mb: 0.5
                  }}
                >
                  {new Date(post.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Typography>
                
                {post.tags && post.tags.length > 0 && (
                  <StyledChip 
                    label={post.tags[0]} 
                    size="small"
                    sx={{ 
                      height: 22, 
                      '& .MuiChip-label': { 
                        px: 1, 
                        py: 0, 
                        fontSize: '0.7rem' 
                      } 
                    }}
                  />
                )}
              </Box>
            </Paper>
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
    </Container>
  );
};

export default SoruForum;
