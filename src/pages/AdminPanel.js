import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,

  TextField,
  IconButton,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Collapse,
  CardMedia,
  Tooltip,
  Chip,
  Stack
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Forum as ForumIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    activeUsers: 0
  });
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'userProfiles', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Fetch data when tab changes
  useEffect(() => {
    if (isAdmin) {
      if (tabValue === 0) {
        fetchDashboardStats();
      } else if (tabValue === 1) {
        fetchUsers();
      } else if (tabValue === 2) {
        fetchPosts();
      }
    }
  }, [tabValue, isAdmin]);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      // Get total users
      const usersQuery = query(collection(db, 'userProfiles'));
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;

      // Get active users (logged in within last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeUsersQuery = query(
        collection(db, 'userProfiles'),
        where('lastLogin', '>=', sevenDaysAgo)
      );
      const activeUsersSnapshot = await getDocs(activeUsersQuery);
      const activeUsers = activeUsersSnapshot.size;

      // Get total posts
      const postsQuery = query(collection(db, 'forumPosts'));
      const postsSnapshot = await getDocs(postsQuery);
      const totalPosts = postsSnapshot.size;

      // Get total comments
      const commentsQuery = query(collection(db, 'forumComments'));
      const commentsSnapshot = await getDocs(commentsQuery);
      const totalComments = commentsSnapshot.size;

      setStats({
        totalUsers,
        activeUsers,
        totalPosts,
        totalComments
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const usersQuery = query(
        collection(db, 'userProfiles'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(usersQuery);
      const usersData = [];
      
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, 'forumPosts'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(postsQuery);
      const postsData = [];
      
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle deleting a post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bu gönderiyi silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      // Delete post
      await deleteDoc(doc(db, 'forumPosts', postId));
      
      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Gönderi silinirken bir hata oluştu.');
    }
  };

  // Handle toggling user admin status
  const handleToggleAdminStatus = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, 'userProfiles', userId);
      await updateDoc(userRef, {
        role: currentStatus === 'admin' ? 'user' : 'admin'
      });
      
      // Refresh users
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Kullanıcı rolü güncellenirken bir hata oluştu.');
    }
  };
  
  // Fetch user's posts
  const fetchUserPosts = useCallback(async (userId) => {
    try {
      const postsQuery = query(
        collection(db, 'forumPosts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(postsQuery);
      const postsData = [];
      
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      
      setUserPosts(postsData);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  }, []);
  
  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchUserPosts(user.id);
  };
  
  // Handle post visibility toggle
  const handleTogglePostVisibility = async (postId, currentVisibility) => {
    try {
      const postRef = doc(db, 'forumPosts', postId);
      await updateDoc(postRef, {
        isHidden: !currentVisibility
      });
      
      // Refresh user posts
      if (selectedUser) {
        fetchUserPosts(selectedUser.id);
      }
    } catch (error) {
      console.error('Error toggling post visibility:', error);
      alert('Gönderi görünürlüğü güncellenirken bir hata oluştu.');
    }
  };
  
  // Handle user expansion toggle
  const handleExpandUser = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show unauthorized message if not admin
  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Yetkisiz Erişim</Typography>
          <Typography variant="body1">
            Bu sayfayı görüntülemek için admin yetkilerine sahip olmanız gerekmektedir.
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Ana Sayfaya Dön
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700, color: '#2e3856' }}>
        Admin Paneli
      </Typography>
      
      <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2,
              px: 3
            }
          }}
        >
          <Tab icon={<DashboardIcon />} label="Dashboard" iconPosition="start" />
          <Tab icon={<PeopleIcon />} label="Kullanıcılar" iconPosition="start" />
          <Tab icon={<ForumIcon />} label="Forum Gönderileri" iconPosition="start" />
          <Tab icon={<SettingsIcon />} label="Ayarlar" iconPosition="start" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* Dashboard */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Toplam Kullanıcı
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                      {stats.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {stats.activeUsers} aktif kullanıcı (son 7 gün)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Toplam Gönderi
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                      {stats.totalPosts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Forum gönderileri
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Toplam Yorum
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                      {stats.totalComments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Forum yorumları
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Aktif Kullanıcı Oranı
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                      {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Son 7 gün içinde aktif
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Users */}
          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Kullanıcı Listesi
                </Typography>
                <TextField
                  placeholder="Kullanıcı ara..."
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              <Grid container spacing={3}>
                {/* User List */}
                <Grid item xs={12} md={selectedUser ? 6 : 12}>
                  <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <List sx={{ bgcolor: 'background.paper' }}>
                      {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                        <React.Fragment key={user.id}>
                          <ListItem
                            button
                            onClick={() => handleUserSelect(user)}
                            selected={selectedUser?.id === user.id}
                            secondaryAction={
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                  edge="end"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExpandUser(user.id);
                                  }}
                                >
                                  {expandedUser === user.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                                <Button
                                  variant="outlined"
                                  color={user.role === 'admin' ? 'error' : 'primary'}
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleAdminStatus(user.id, user.role);
                                  }}
                                  startIcon={user.role === 'admin' ? <BlockIcon /> : <CheckCircleIcon />}
                                >
                                  {user.role === 'admin' ? 'Admin Yetkisini Kaldır' : 'Admin Yap'}
                                </Button>
                              </Box>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar src={user.photoURL} alt={user.displayName}>
                                {user.displayName?.charAt(0) || 'U'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {user.displayName || 'İsimsiz Kullanıcı'}
                                  {user.role === 'admin' && (
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        ml: 1, 
                                        bgcolor: 'error.main', 
                                        color: 'white', 
                                        px: 1, 
                                        py: 0.5, 
                                        borderRadius: 1,
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      ADMIN
                                    </Typography>
                                  )}
                                </Box>
                              }
                              secondary={
                                <React.Fragment>
                                  <Typography component="span" variant="body2" color="text.primary">
                                    {user.email}
                                  </Typography>
                                  {user.lastLogin && (
                                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                      Son giriş: {new Date(user.lastLogin.seconds * 1000).toLocaleDateString()}
                                    </Typography>
                                  )}
                                </React.Fragment>
                              }
                            />
                          </ListItem>
                          
                          <Collapse in={expandedUser === user.id} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: alpha('#f5f5f5', 0.5) }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Kullanıcı Detayları
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">
                                    Kayıt Tarihi: {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Bilinmiyor'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">
                                    Hedef Sıralama: {user.targetRank || 'Belirtilmemiş'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Button 
                                    variant="contained" 
                                    size="small" 
                                    onClick={() => handleUserSelect(user)}
                                    startIcon={<VisibilityIcon />}
                                  >
                                    Kullanıcı İçeriğini Görüntüle
                                  </Button>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                          
                          <Divider component="li" />
                        </React.Fragment>
                      )) : (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Typography variant="body1" color="text.secondary">
                            Arama kriterlerine uygun kullanıcı bulunamadı.
                          </Typography>
                        </Box>
                      )}
                    </List>
                  </Paper>
                </Grid>
                
                {/* User Content */}
                {selectedUser && (
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">
                          {selectedUser.displayName || 'Kullanıcı'} İçeriği
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => setSelectedUser(null)}
                        >
                          Kapat
                        </Button>
                      </Box>
                      
                      {userPosts.length > 0 ? (
                        <Stack spacing={2}>
                          {userPosts.map(post => (
                            <Card key={post.id} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Typography variant="h6" gutterBottom>
                                    {post.title}
                                    {post.isHidden && (
                                      <Chip 
                                        label="Gizlenmiş" 
                                        size="small" 
                                        color="error" 
                                        sx={{ ml: 1 }} 
                                      />
                                    )}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {post.createdAt && new Date(post.createdAt.seconds * 1000).toLocaleString()}
                                  </Typography>
                                </Box>
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {post.content}
                                </Typography>
                                
                                {post.tags && post.tags.length > 0 && (
                                  <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {post.tags.map((tag, index) => (
                                      <Chip key={index} label={tag} size="small" variant="outlined" />
                                    ))}
                                  </Box>
                                )}
                                
                                {post.imageUrl && (
                                  <Box sx={{ mb: 2 }}>
                                    <CardMedia
                                      component="img"
                                      image={post.imageUrl}
                                      alt="Post image"
                                      sx={{ 
                                        height: 200, 
                                        objectFit: 'contain',
                                        borderRadius: 1,
                                        border: '1px solid #eee'
                                      }}
                                    />
                                  </Box>
                                )}
                                
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                  <Tooltip title={post.isHidden ? "Gönderiyi Göster" : "Gönderiyi Gizle"}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      color={post.isHidden ? "primary" : "warning"}
                                      startIcon={post.isHidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                      onClick={() => handleTogglePostVisibility(post.id, post.isHidden)}
                                    >
                                      {post.isHidden ? "Göster" : "Gizle"}
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="Gönderiyi Sil">
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      color="error"
                                      startIcon={<DeleteIcon />}
                                      onClick={() => handleDeletePost(post.id)}
                                    >
                                      Sil
                                    </Button>
                                  </Tooltip>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                        </Stack>
                      ) : (
                        <Box sx={{ p: 4, textAlign: 'center', bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 2 }}>
                          <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                          <Typography variant="body1" color="text.secondary">
                            Bu kullanıcı henüz forum gönderisi oluşturmamış.
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
          
          {/* Posts */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Forum Gönderileri
              </Typography>
              <List sx={{ bgcolor: 'background.paper' }}>
                {posts.map((post) => (
                  <React.Fragment key={post.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeletePost(post.id)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={post.title}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.secondary">
                              Yazar: {post.userName || 'İsimsiz Kullanıcı'} • 
                            </Typography>
                            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              {post.createdAt && new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
                            </Typography>
                            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              • {post.commentCount || 0} yorum • {post.likeCount || 0} beğeni
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
          
          {/* Settings */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Sistem Ayarları
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Bu bölüm henüz geliştirme aşamasındadır.
              </Alert>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminPanel;
