import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
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
  Grid,
  Container,
  Card,
  CardContent,
  Fade,
  Zoom
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  QuestionAnswer as QuestionIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  LocalOffer as LocalOfferIcon,
  Edit as EditIcon,
  Star as StarIcon
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

// Clean Header Card
const HeaderCard = styled(Card)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  marginBottom: theme.spacing(4),
  border: '1px solid rgba(0, 0, 0, 0.05)'
}));

// Control Panel Card
const ControlCard = styled(Card)(({ theme }) => ({
  background: '#566e99',
  borderRadius: '16px',
  marginBottom: theme.spacing(3),
  color: 'white',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
}));

// Simple Post Card
const PostCard = styled(Card)(({ theme }) => ({
  background: '#566e99',
  color: 'white',
  borderRadius: '12px',
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(85, 179, 217, 0.3)',
    borderColor: '#55b3d9'
  }
}));

// Modern Chip
const ModernChip = styled(Chip)(({ theme }) => ({
  borderRadius: '20px',
  fontWeight: 600,
  backgroundColor: 'rgba(85, 179, 217, 0.1)',
  color: '#55b3d9',
  border: '1px solid rgba(85, 179, 217, 0.2)',
  '&:hover': {
    backgroundColor: 'rgba(85, 179, 217, 0.2)',
    transform: 'translateY(-1px)'
  }
}));

// Modern Button
const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  background: 'linear-gradient(135deg, #55b3d9 0%, #3498db 100%)',
  boxShadow: '0 4px 12px rgba(85, 179, 217, 0.3)',
  border: 'none',
  color: 'white',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(85, 179, 217, 0.4)'
  }
}));

// Clean Search Field
const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'white',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.8)'
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white'
    }
  },
  '& .MuiInputBase-input': {
    color: '#1e293d',
    '&::placeholder': {
      color: 'rgba(30, 41, 61, 0.6)',
      opacity: 1
    }
  }
}));

// Clean Dialog
const CleanDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
  }
}));

// Form Field
const FormField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.1)'
    },
    '&:hover fieldset': {
      borderColor: '#55b3d9'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#55b3d9'
    }
  },
  '& .MuiInputLabel-root': {
    color: '#1e293d',
    '&.Mui-focused': {
      color: '#55b3d9'
    }
  }
}));

// Modern Tabs
const ModernTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    height: '3px',
    borderRadius: '3px',
    backgroundColor: 'white'
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.7)',
    minWidth: 100,
    padding: '8px 16px',
    marginRight: '12px',
    '&.Mui-selected': {
      color: 'white'
    },
    '&:last-child': {
      marginRight: 0
    }
  }
}));

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
      showNotification('Gönderiler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }, [tabValue]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Calculate popular tags
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

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Dialog handlers
  const handleOpenPostDialog = () => {
    if (!user) {
      showNotification('Soru sormak için giriş yapmalısınız', 'warning');
      return;
    }
    setOpenPostDialog(true);
  };

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
    setIsUploading(false);
  };

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Image selection handler
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showNotification('Sadece JPEG, PNG ve WebP formatları desteklenmektedir', 'error');
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
    }
  };

  // Create new post
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      showNotification('Başlık ve açıklama alanları zorunludur', 'warning');
      return;
    }

    if (!user) {
      showNotification('Giriş yapmalısınız', 'warning');
      return;
    }

    setIsUploading(true);
    
    try {
      let imageUrl = null;
      
      // Upload image if exists
      if (newPost.image) {
        const imageRef = ref(storage, `forum-images/${Date.now()}-${newPost.image.name}`);
        const uploadTask = uploadBytesResumable(imageRef, newPost.image);
        
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
              try {
                imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                resolve();
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      }
      
      // Parse tags
      const tags = newPost.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Create post object
      const postData = {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        tags: tags,
        userId: user.uid,
        userName: user.displayName || 'Anonim',
        userPhotoURL: user.photoURL || null,
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
        likeCount: 0,
        commentCount: 0
      };
      
      // Add to Firestore
      await addDoc(collection(db, 'forumPosts'), postData);
      
      showNotification('Sorunuz başarıyla paylaşıldı!', 'success');
      handleClosePostDialog();
      fetchPosts(); // Refresh posts
      
    } catch (error) {
      console.error('Error creating post:', error);
      showNotification('Gönderi oluşturulurken hata oluştu', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Snackbar close handler
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Navigate to post detail
  const handleViewPost = (postId) => {
    navigate(`/soru-forum/${postId}`);
  };

  // Search term change handler
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 14 }}>
      {/* Clean Header */}
      <Fade in={true} timeout={800}>
        <HeaderCard>
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <QuestionIcon sx={{ fontSize: 40, color: '#55b3d9', mr: 2 }} />
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  color: '#1e293d'
                }}
              >
                Soru Forum
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                color: 'rgba(30, 41, 61, 0.7)', 
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Sorularınızı paylaşın, diğer öğrencilerle tartışın ve birlikte öğrenin.
            </Typography>
            
            {/* New Post Button */}
            <Zoom in={true} timeout={1000}>
              <ModernButton
                onClick={handleOpenPostDialog}
                disabled={!user}
                startIcon={<EditIcon />}
                size="large"
              >
                Yeni Soru Sor
              </ModernButton>
            </Zoom>
          </CardContent>
        </HeaderCard>
      </Fade>
      
      {/* Control Panel */}
      <Fade in={true} timeout={1000}>
        <ControlCard>
          <CardContent sx={{ py: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <ModernTabs value={tabValue} onChange={handleTabChange}>
                  <Tab 
                    icon={<AccessTimeIcon />} 
                    label="En Yeni" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<TrendingUpIcon />} 
                    label="En Popüler" 
                    iconPosition="start"
                  />
                </ModernTabs>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <SearchField
                  placeholder="Soruları ara..."
                  size="medium"
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#55b3d9' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </ControlCard>
      </Fade>
      
      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <Fade in={true} timeout={1200}>
          <Card sx={{ 
            mb: 4, 
            borderRadius: '12px',
            backgroundColor: '#566e99',
            color: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ py: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalOfferIcon sx={{ mr: 1, color: 'white' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                  Popüler Etiketler
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {popularTags.map((tag, index) => (
                  <ModernChip 
                    key={index} 
                    label={tag} 
                    clickable
                    onClick={() => setSearchTerm(tag)}
                    icon={<StarIcon />}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}
      
      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={50} sx={{ color: '#55b3d9' }} />
        </Box>
      ) : posts.length === 0 ? (
        <Fade in={true} timeout={1400}>
          <Card sx={{ 
            borderRadius: '16px',
            textAlign: 'center',
            py: 6,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent>
              <QuestionIcon sx={{ fontSize: 80, color: '#55b3d9', mb: 3, opacity: 0.7 }} />
              <Typography variant="h4" sx={{ mb: 2, color: '#1e293d', fontWeight: 700 }}>
                Henüz soru yok
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, color: 'rgba(30, 41, 61, 0.6)' }}>
                İlk soruyu sormak için yukarıdaki butonu kullanın.
              </Typography>
              {user ? (
                <ModernButton
                  onClick={handleOpenPostDialog}
                  startIcon={<SendIcon />}
                  size="large"
                >
                  İlk Soruyu Sor
                </ModernButton>
              ) : (
                <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'rgba(30, 41, 61, 0.5)' }}>
                  Soru sormak için giriş yapmalısınız.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Fade>
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
          }).map((post, index) => (
            <Fade in={true} timeout={600 + index * 100} key={post.id}>
              <PostCard onClick={() => handleViewPost(post.id)}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* User Avatar */}
                    <Avatar 
                      src={post.userPhotoURL} 
                      alt={post.userName}
                      sx={{ 
                        width: 50, 
                        height: 50,
                        backgroundColor: '#55b3d9',
                        color: 'white',
                        fontWeight: 700
                      }}
                    >
                      {post.userName?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    
                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          color: '#ffffff',
                          mb: 1,
                          lineHeight: 1.3,
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {post.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#f0f4ff',
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.5,
                          fontSize: '0.9rem'
                        }}
                      >
                        {post.content}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        {/* User Info and Stats */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#87ceeb',
                              fontWeight: 700,
                              fontSize: '0.85rem'
                            }}
                          >
                            {post.userName}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ThumbUpIcon sx={{ fontSize: '1rem', color: '#ffffff' }} />
                              <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8rem' }}>
                                {post.likeCount || 0}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CommentIcon sx={{ fontSize: '1rem', color: '#ffffff' }} />
                              <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8rem' }}>
                                {post.commentCount || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Date and Tags */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#e8f4f8',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          >
                            {new Date(post.createdAt).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </Typography>
                          
                          {post.tags && post.tags.length > 0 && (
                            <Chip 
                              label={post.tags[0]} 
                              size="small"
                              sx={{ 
                                height: 24,
                                backgroundColor: '#87ceeb',
                                color: '#1e293d',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                border: '1px solid #ffffff',
                                '&:hover': {
                                  backgroundColor: '#add8e6'
                                }
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </PostCard>
            </Fade>
          ))}
        </Box>
      )}
      
      {/* Clean Dialog */}
      <CleanDialog 
        open={openPostDialog} 
        onClose={handleClosePostDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          py: 3,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EditIcon sx={{ color: '#55b3d9' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293d' }}>
              Yeni Soru Sor
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClosePostDialog} 
            size="small"
            sx={{ color: '#1e293d' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ px: 4, py: 3 }}>
          <FormField
            autoFocus
            margin="dense"
            name="title"
            label="Soru Başlığı"
            type="text"
            fullWidth
            variant="outlined"
            value={newPost.title}
            onChange={handleInputChange}
            sx={{ mb: 3 }}
            placeholder="Sorunuzu kısa ve açık bir şekilde yazın..."
          />
          
          <FormField
            margin="dense"
            name="content"
            label="Detaylı Açıklama"
            multiline
            rows={5}
            fullWidth
            variant="outlined"
            value={newPost.content}
            onChange={handleInputChange}
            sx={{ mb: 3 }}
            placeholder="Sorunuzu detaylı bir şekilde açıklayın..."
          />
          
          <FormField
            margin="dense"
            name="tags"
            label="Etiketler"
            type="text"
            fullWidth
            variant="outlined"
            value={newPost.tags}
            onChange={handleInputChange}
            placeholder="matematik, geometri, fizik"
            sx={{ mb: 3 }}
            helperText="Virgülle ayırarak etiket ekleyin"
          />
          
          <Box sx={{ mb: 3 }}>
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            
            <Button
              variant="outlined"
              startIcon={<AddPhotoIcon />}
              onClick={() => fileInputRef.current.click()}
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                borderColor: '#55b3d9',
                color: '#55b3d9',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#3498db',
                  backgroundColor: 'rgba(85, 179, 217, 0.05)'
                }
              }}
            >
              Fotoğraf Ekle
            </Button>
            
            {imagePreview && (
              <Box sx={{ position: 'relative', mt: 2 }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '300px', 
                    objectFit: 'contain',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'white',
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
              <Box sx={{ width: '100%', mt: 2 }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#55b3d9', fontWeight: 600 }}>
                  Yükleniyor: {Math.round(uploadProgress)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress}
                  sx={{
                    borderRadius: '4px',
                    height: '6px',
                    backgroundColor: 'rgba(85, 179, 217, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#55b3d9',
                      borderRadius: '4px'
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 4, pb: 4, gap: 2 }}>
          <Button 
            onClick={handleClosePostDialog}
            sx={{ 
              borderRadius: '12px',
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              color: '#1e293d',
              '&:hover': {
                backgroundColor: 'rgba(30, 41, 61, 0.05)'
              }
            }}
          >
            İptal
          </Button>
          <ModernButton
            onClick={handleCreatePost}
            disabled={isUploading || !newPost.title.trim() || !newPost.content.trim()}
            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          >
            {isUploading ? 'Yükleniyor...' : 'Paylaş'}
          </ModernButton>
        </DialogActions>
      </CleanDialog>
      
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
          sx={{ 
            borderRadius: '12px',
            fontWeight: 600
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SoruForum;
