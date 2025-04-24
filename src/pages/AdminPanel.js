import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
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
  Grid,
  InputAdornment,
  Collapse,
  Tooltip,
  Chip
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
  Chat as ChatIcon,
  ThumbUp as ThumbUpIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../firebase';
import { collection, query, orderBy, getDocs, doc, where, deleteDoc, updateDoc, limit } from 'firebase/firestore';
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
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Sadece belirli email adresine admin yetkisi ver
      if (user.email === 'businessfrkn@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      setIsLoading(false);
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
    if (window.confirm('Bu gönderiyi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'forumPosts', postId));
        // Remove from posts list
        setPosts(posts.filter(post => post.id !== postId));
        // Also remove from userPosts if it exists there
        if (selectedUser) {
          setUserPosts(userPosts.filter(post => post.id !== postId));
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  // Handle toggling user admin status
  const handleToggleAdminStatus = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, 'userProfiles', userId);
      await updateDoc(userRef, {
        isAdmin: !currentStatus
      });
      
      // Update local state
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, isAdmin: !currentStatus };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating admin status:', error);
    }
  };

  // Fetch user posts
  const fetchUserPosts = async (userId) => {
    try {
      const userPostsQuery = query(
        collection(db, 'forumPosts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(userPostsQuery);
      const postsData = [];
      
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      
      setUserPosts(postsData);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

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
        isVisible: !currentVisibility
      });
      
      // Update local state
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return { ...post, isVisible: !currentVisibility };
        }
        return post;
      });
      
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error updating post visibility:', error);
    }
  };

  // Handle user expansion toggle
  const handleExpandUser = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" size={60} thickness={4} />
      </Box>
    );
  }

  // Not admin state
  if (!isAdmin) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', textAlign: 'center', mt: 8 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            py: 2,
            '& .MuiAlert-icon': {
              fontSize: '2rem'
            }
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Yetkisiz Erişim</Typography>
          <Typography variant="body1">Bu sayfaya erişim yetkiniz bulunmamaktadır.</Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')} 
          sx={{ 
            mt: 2,
            bgcolor: '#4285F4',
            '&:hover': {
              bgcolor: '#3367d6'
            }
          }}
        >
          Ana Sayfaya Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 4, 
          fontWeight: 800, 
          color: '#2e3856',
          display: 'flex',
          alignItems: 'center',
          '&::after': {
            content: '""',
            display: 'block',
            flexGrow: 1,
            height: 3,
            backgroundColor: alpha('#4285F4', 0.1),
            marginLeft: 2,
            borderRadius: 1
          }
        }}
      >
        <DashboardIcon sx={{ mr: 1, color: '#4285F4', fontSize: 32 }} /> Admin Paneli
      </Typography>
      
      <Paper 
        elevation={0}
        sx={{ 
          mb: 4, 
          borderRadius: 3, 
          overflow: 'hidden',
          boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2.5,
              px: 4,
              fontWeight: 600,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                color: '#4285F4',
                backgroundColor: alpha('#4285F4', 0.05),
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 1.5,
              backgroundColor: '#4285F4'
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
            <Box sx={{ p: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 700, 
                  color: '#2e3856',
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'block',
                    width: 5,
                    height: 30,
                    backgroundColor: '#4285F4',
                    marginRight: 2,
                    borderRadius: 1
                  }
                }}
              >
                <DashboardIcon sx={{ mr: 1 }} /> İstatistikler
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 10px 20px rgba(66, 133, 244, 0.15)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 30px rgba(66, 133, 244, 0.2)'
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 70%)',
                        zIndex: 1
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <PeopleIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, fontSize: '1.1rem' }}>Toplam Kullanıcı</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>{stats.totalUsers}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>{stats.activeUsers} aktif kullanıcı (son 7 gün)</Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #EA4335 0%, #FBBC05 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 10px 20px rgba(234, 67, 53, 0.15)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 30px rgba(234, 67, 53, 0.2)'
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 70%)',
                        zIndex: 1
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <ForumIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, fontSize: '1.1rem' }}>Toplam Gönderi</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>{stats.totalPosts}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>Forum gönderileri</Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #34A853 0%, #1E88E5 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 10px 20px rgba(52, 168, 83, 0.15)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 30px rgba(52, 168, 83, 0.2)'
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 70%)',
                        zIndex: 1
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <ChatIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, fontSize: '1.1rem' }}>Toplam Yorum</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>{stats.totalComments}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>Forum yorumları</Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 10px 20px rgba(156, 39, 176, 0.15)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 30px rgba(156, 39, 176, 0.2)'
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 70%)',
                        zIndex: 1
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <TrendingUpIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, fontSize: '1.1rem' }}>Aktif Kullanıcı Oranı</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>{stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>Son 7 gün içinde aktif</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Users */}
          {tabValue === 1 && (
            <Box sx={{ p: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 700, 
                  color: '#2e3856',
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'block',
                    width: 5,
                    height: 30,
                    backgroundColor: '#EA4335',
                    marginRight: 2,
                    borderRadius: 1
                  }
                }}
              >
                <PeopleIcon sx={{ mr: 1 }} /> Kullanıcı Yönetimi
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TextField
                  placeholder="Kullanıcı Ara..."
                  variant="outlined"
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    maxWidth: 400,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#4285F4',
                        borderWidth: 2
                      }
                    }
                  }}
                />
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={selectedUser ? 6 : 12}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}
                  >
                    <List sx={{ p: 0 }}>
                      {filteredUsers.map((user) => (
                        <React.Fragment key={user.id}>
                          <ListItem
                            button
                            onClick={() => handleUserSelect(user)}
                            selected={selectedUser && selectedUser.id === user.id}
                            sx={{
                              transition: 'all 0.2s',
                              '&.Mui-selected': {
                                backgroundColor: alpha('#4285F4', 0.1),
                              },
                              '&:hover': {
                                backgroundColor: alpha('#4285F4', 0.05),
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar 
                                src={user.photoURL} 
                                alt={user.displayName || 'Kullanıcı'}
                                sx={{ 
                                  width: 50, 
                                  height: 50,
                                  border: '2px solid #f0f0f0',
                                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}
                              >
                                {!user.photoURL && (user.displayName ? user.displayName[0].toUpperCase() : 'U')}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {user.displayName || 'İsimsiz Kullanıcı'}
                                  </Typography>
                                  {user.isAdmin && (
                                    <Chip 
                                      size="small" 
                                      label="Admin" 
                                      color="primary" 
                                      sx={{ ml: 1, fontWeight: 600, fontSize: '0.7rem' }} 
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <React.Fragment>
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    {user.email}
                                  </Typography>
                                  <Typography variant="body2" component="div" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Kayıt: {user.createdAt && new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                                  </Typography>
                                </React.Fragment>
                              }
                              sx={{ ml: 1 }}
                            />
                            <IconButton edge="end" onClick={(e) => {
                              e.stopPropagation();
                              handleExpandUser(user.id);
                            }}>
                              {expandedUser === user.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </ListItem>
                          
                          <Collapse in={expandedUser === user.id} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: alpha('#f5f5f5', 0.5) }}>
                              <Button
                                variant="outlined"
                                color={user.isAdmin ? "error" : "primary"}
                                startIcon={user.isAdmin ? <BlockIcon /> : <CheckCircleIcon />}
                                onClick={() => handleToggleAdminStatus(user.id, user.isAdmin)}
                                size="small"
                                sx={{ mr: 1, borderRadius: 2 }}
                              >
                                {user.isAdmin ? "Admin Yetkisini Kaldır" : "Admin Yap"}
                              </Button>
                            </Box>
                          </Collapse>
                          
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                
                {selectedUser && (
                  <Grid item xs={12} md={6}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        height: '100%'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar 
                          src={selectedUser.photoURL} 
                          alt={selectedUser.displayName || 'Kullanıcı'}
                          sx={{ 
                            width: 60, 
                            height: 60,
                            mr: 2,
                            border: '2px solid #f0f0f0',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                          }}
                        >
                          {!selectedUser.photoURL && (selectedUser.displayName ? selectedUser.displayName[0].toUpperCase() : 'U')}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {selectedUser.displayName || 'İsimsiz Kullanıcı'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedUser.email}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        <ForumIcon sx={{ mr: 1, fontSize: 20, color: '#EA4335' }} /> Kullanıcının Gönderileri
                      </Typography>
                      
                      {userPosts.length > 0 ? (
                        <List sx={{ p: 0 }}>
                          {userPosts.map((post) => (
                            <React.Fragment key={post.id}>
                              <ListItem
                                sx={{
                                  borderRadius: 2,
                                  mb: 1,
                                  bgcolor: alpha('#f5f5f5', 0.5),
                                  '&:hover': {
                                    bgcolor: alpha('#f5f5f5', 0.8),
                                  }
                                }}
                                secondaryAction={
                                  <Box>
                                    <IconButton edge="end" onClick={() => handleTogglePostVisibility(post.id, post.isVisible)}>
                                      {post.isVisible ? <VisibilityIcon color="primary" /> : <VisibilityOffIcon color="error" />}
                                    </IconButton>
                                    <IconButton edge="end" onClick={() => handleDeletePost(post.id)}>
                                      <DeleteIcon color="error" />
                                    </IconButton>
                                  </Box>
                                }
                              >
                                <ListItemText
                                  primary={
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      {post.title}
                                    </Typography>
                                  }
                                  secondary={
                                    <React.Fragment>
                                      <Typography variant="body2" color="text.secondary">
                                        {post.createdAt && new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                          <ChatIcon sx={{ fontSize: 16, mr: 0.5 }} /> {post.commentCount || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                          <ThumbUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> {post.likeCount || 0}
                                        </Typography>
                                      </Box>
                                    </React.Fragment>
                                  }
                                />
                              </ListItem>
                            </React.Fragment>
                          ))}
                        </List>
                      ) : (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          Bu kullanıcının henüz gönderisi bulunmamaktadır.
                        </Alert>
                      )}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
          
          {/* Posts */}
          {tabValue === 2 && (
            <Box sx={{ p: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 700, 
                  color: '#2e3856',
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'block',
                    width: 5,
                    height: 30,
                    backgroundColor: '#FBBC05',
                    marginRight: 2,
                    borderRadius: 1
                  }
                }}
              >
                <ForumIcon sx={{ mr: 1 }} /> Forum Gönderileri
              </Typography>
              
              <Paper 
                elevation={0}
                sx={{ 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <List sx={{ p: 0 }}>
                  {posts.map((post) => (
                    <React.Fragment key={post.id}>
                      <ListItem
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: alpha('#f5f5f5', 0.5),
                          },
                          pl: 3,
                          pr: 2,
                          py: 2
                        }}
                        secondaryAction={
                          <Box>
                            <Tooltip title={post.isVisible ? "Gönderimi Gizle" : "Gönderimi Göster"}>
                              <IconButton edge="end" onClick={() => handleTogglePostVisibility(post.id, post.isVisible)}>
                                {post.isVisible ? <VisibilityIcon color="primary" /> : <VisibilityOffIcon color="error" />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Gönderiyi Sil">
                              <IconButton edge="end" onClick={() => handleDeletePost(post.id)}>
                                <DeleteIcon color="error" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {post.title}
                              </Typography>
                              {!post.isVisible && (
                                <Chip 
                                  size="small" 
                                  label="Gizli" 
                                  color="error" 
                                  sx={{ ml: 1, fontWeight: 600, fontSize: '0.7rem' }} 
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Avatar 
                                  src={post.userPhotoURL} 
                                  alt={post.userName || 'Kullanıcı'}
                                  sx={{ width: 24, height: 24, mr: 1 }}
                                >
                                  {!post.userPhotoURL && (post.userName ? post.userName[0].toUpperCase() : 'U')}
                                </Avatar>
                                {post.userName || 'İsimsiz Kullanıcı'} • 
                                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                  {post.createdAt && new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
                                </Typography>
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                  <ChatIcon sx={{ fontSize: 16, mr: 0.5 }} /> {post.commentCount || 0} yorum
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <ThumbUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> {post.likeCount || 0} beğeni
                                </Typography>
                              </Box>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
          
          {/* Settings */}
          {tabValue === 3 && (
            <Box sx={{ p: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 700, 
                  color: '#2e3856',
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'block',
                    width: 5,
                    height: 30,
                    backgroundColor: '#34A853',
                    marginRight: 2,
                    borderRadius: 1
                  }
                }}
              >
                <SettingsIcon sx={{ mr: 1 }} /> Sistem Ayarları
              </Typography>
              
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: '2rem',
                    opacity: 0.8
                  }
                }}
                icon={<SettingsIcon fontSize="inherit" />}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Geliştirme Aşamasında</Typography>
                <Typography variant="body1">
                  Bu bölüm henüz geliştirme aşamasındadır. Yakında burada sistem ayarlarını yönetebileceksiniz.
                </Typography>
              </Alert>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminPanel;
