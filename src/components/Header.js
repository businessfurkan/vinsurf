import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Badge,
  Avatar,
  useTheme,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';

import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
        backgroundColor: 'var(--appbar-bg-color, #1a0545)',
  boxShadow: '0 2px 10px var(--shadow-color, rgba(0,0,0,0.08))',
  zIndex: theme.zIndex.drawer + 1,
  color: 'var(--text-primary, #333333)',
  transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 38,
  height: 38,
  cursor: 'pointer',
  border: `2px solid ${theme.palette.primary.main}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.secondary.main,
    transform: 'scale(1.05)'
  }
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#FF4444',
    color: '#FFF',
    fontWeight: '600',
    fontSize: '0.7rem',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    boxShadow: `0 2px 8px rgba(255, 68, 68, 0.3), 0 0 0 2px ${theme.palette.background.paper}`,
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
      '0%': {
        transform: 'scale(1)',
        boxShadow: `0 2px 8px rgba(255, 68, 68, 0.3), 0 0 0 2px ${theme.palette.background.paper}`,
      },
      '50%': {
        transform: 'scale(1.1)',
        boxShadow: `0 4px 12px rgba(255, 68, 68, 0.5), 0 0 0 2px ${theme.palette.background.paper}`,
      },
      '100%': {
        transform: 'scale(1)',
        boxShadow: `0 2px 8px rgba(255, 68, 68, 0.3), 0 0 0 2px ${theme.palette.background.paper}`,
      }
    }
  },
}));

const ModernNotificationButton = styled(IconButton)(({ theme, hasNotifications }) => ({
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  backgroundColor: hasNotifications ? 'rgba(138, 43, 226, 0.1)' : 'rgba(255, 255, 255, 0.05)',
  border: hasNotifications ? '1px solid rgba(138, 43, 226, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: hasNotifications 
      ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(255, 20, 147, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
    borderRadius: '12px',
    zIndex: -1,
    transition: 'all 0.3s ease',
  },
  
  '&:hover': {
    transform: 'translateY(-2px) scale(1.05)',
    backgroundColor: hasNotifications ? 'rgba(138, 43, 226, 0.15)' : 'rgba(255, 255, 255, 0.1)',
    border: hasNotifications ? '1px solid rgba(138, 43, 226, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: hasNotifications 
      ? '0 8px 25px rgba(138, 43, 226, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)'
      : '0 8px 25px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)',
    
    '&:before': {
      background: hasNotifications 
        ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(255, 20, 147, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    },
    
    '& .MuiSvgIcon-root': {
      transform: 'scale(1.1)',
      color: hasNotifications ? '#8A2BE2' : '#2a5956',
    }
  },
  
  '&:active': {
    transform: 'translateY(0) scale(1.02)',
  },
  
  '& .MuiSvgIcon-root': {
    fontSize: '1.3rem',
    color: hasNotifications ? '#8A2BE2' : '#2a5956',
    transition: 'all 0.3s ease',
    filter: hasNotifications ? 'drop-shadow(0 2px 4px rgba(138, 43, 226, 0.3))' : 'none',
  }
}));

const Header = ({ handleDrawerToggle, sidebarOpen }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [userName, setUserName] = useState('');
  
  // Admin panel variables
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  

  
  // Bildirim sistemini kullan
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          setUserPhotoURL(user.photoURL);
          setUserName(user.displayName || user.email?.split('@')[0] || 'Kullanıcı');
          
          // Sadece belirli email adresine admin yetkisi ver
          if (user.email === 'businessfrkn@gmail.com') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      });
      
      return () => unsubscribe();
    };

    checkAdminStatus();
  }, []);
  
  // Handle admin login
  const handleAdminLogin = () => {
    setShowAdminDialog(true);
    setAdminPassword('');
    setAdminError('');
  };

  // Handle admin password submit
  const handleAdminPasswordSubmit = () => {
    if (adminPassword === 'Arzu280521!@!') {
      setShowAdminDialog(false);
      navigate('/admin-panel');
    } else {
      setAdminError('Hatalı şifre!');
    }
  };

  // Handle admin dialog close
  const handleAdminDialogClose = () => {
    setShowAdminDialog(false);
    setAdminPassword('');
    setAdminError('');
  };
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };
  
  const handleReadNotification = (notificationId) => {
    markAsRead(notificationId);
    setNotificationAnchor(null);
  };
  
  const handleReadAllNotifications = () => {
    markAllAsRead();
    setNotificationAnchor(null);
  };
  
  const handleProfileClick = () => {
    navigate('/profil');
    handleClose();
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yaparken hata oluştu:', error);
    }
    handleClose();
  };

  // İlk harfi büyüt
  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "K";
  };

  return (
    <StyledAppBar position="fixed">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              color: '#2a5956',
              display: { xs: 'none', sm: 'block' },
              fontFamily: 'Poppins, Montserrat, sans-serif',
              letterSpacing: '-0.5px'
            }}
          >
            YKS Çalışma Asistanı
          </Typography>
          

        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Bildirimler" placement="bottom">
            <ModernNotificationButton
              aria-label="show new notifications"
              onClick={handleNotificationClick}
              hasNotifications={unreadCount > 0}
            >
              <StyledBadge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                <NotificationsIcon />
              </StyledBadge>
            </ModernNotificationButton>
          </Tooltip>
          
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 0,
              sx: {
                borderRadius: '16px',
                minWidth: 320,
                mt: 1.5,
                overflow: 'visible',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(138, 43, 226, 0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 10px 20px rgba(138, 43, 226, 0.1)',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 20,
                  width: 12,
                  height: 12,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(138, 43, 226, 0.1)',
                  borderBottom: 'none',
                  borderRight: 'none',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <Box sx={{ 
              p: 2.5, 
              pb: 1.5, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.05) 0%, rgba(255, 20, 147, 0.05) 100%)',
              borderRadius: '16px 16px 0 0'
            }}>
              <Typography 
                variant="subtitle1" 
                fontWeight={700}
                sx={{ 
                  color: '#2a5956',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                🔔 Bildirimler
                {unreadCount > 0 && (
                  <Box sx={{
                    backgroundColor: '#FF4444',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    px: 1,
                    py: 0.3,
                    borderRadius: '12px',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {unreadCount}
                  </Box>
                )}
              </Typography>
              {unreadCount > 0 && (
                <Tooltip title="Tümünü okundu işaretle" placement="left">
                  <IconButton 
                    size="small" 
                    onClick={handleReadAllNotifications}
                    sx={{
                      backgroundColor: 'rgba(138, 43, 226, 0.1)',
                      color: '#8A2BE2',
                      '&:hover': {
                        backgroundColor: 'rgba(138, 43, 226, 0.2)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <DoneAllIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Divider />
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <MenuItem 
                  key={notification.id} 
                  sx={{ 
                    py: 1.5,
                    bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.light, 0.1)
                  }} 
                  onClick={() => handleReadNotification(notification.id)}
                >
                  <ListItemIcon sx={{ 
                    color: notification.type === 'warning' ? theme.palette.warning.main :
                           notification.type === 'error' ? theme.palette.error.main :
                           notification.type === 'success' ? theme.palette.success.main :
                           theme.palette.primary.main
                  }}>
                    {notification.type === 'warning' ? <WarningIcon /> :
                     notification.type === 'error' ? <ErrorIcon /> :
                     notification.type === 'success' ? <CheckCircleIcon /> :
                     <InfoIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                        {notification.message}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.createdAt).toLocaleString('tr-TR', { 
                          day: '2-digit', 
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    }
                  />
                </MenuItem>
              ))
            ) : (
              <Box sx={{ 
                py: 5, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5
              }}>
                <Box sx={{
                  fontSize: '3rem',
                  opacity: 0.3,
                  filter: 'grayscale(1)'
                }}>
                  🔕
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  }}
                >
                  Henüz bildirim bulunmuyor
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.disabled"
                  sx={{ 
                    fontSize: '0.8rem',
                    maxWidth: '200px',
                    lineHeight: 1.4
                  }}
                >
                  Yeni bildirimler burada görünecek
                </Typography>
              </Box>
            )}
          </Menu>
          
          <Tooltip title={userName || "Profil"}>
            <Box sx={{ ml: 1.5 }}>
              <ProfileAvatar 
                onClick={handleMenuClick} 
                src={userPhotoURL}
                sx={{ bgcolor: userPhotoURL ? 'transparent' : theme.palette.primary.main }}
              >
                {!userPhotoURL && getInitials(userName)}
              </ProfileAvatar>
            </Box>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 0,
              sx: {
                borderRadius: '24px',
                minWidth: 320,
                mt: 1.5,
                overflow: 'visible',
                background: 'linear-gradient(135deg, rgba(26, 5, 69, 0.95) 0%, rgba(45, 15, 90, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 10px 20px rgba(138, 43, 226, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 20,
                  width: 16,
                  height: 16,
                  background: 'linear-gradient(135deg, rgba(26, 5, 69, 0.95) 0%, rgba(45, 15, 90, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(138, 43, 226, 0.3)',
                  borderBottom: 'none',
                  borderRight: 'none',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '24px',
                  background: 'linear-gradient(45deg, rgba(138, 43, 226, 0.1) 0%, rgba(30, 144, 255, 0.1) 50%, rgba(255, 20, 147, 0.1) 100%)',
                  zIndex: -1,
                  animation: 'profileShimmer 3s ease-in-out infinite alternate'
                },
                '@keyframes profileShimmer': {
                  '0%': {
                    background: 'linear-gradient(45deg, rgba(138, 43, 226, 0.1) 0%, rgba(30, 144, 255, 0.1) 50%, rgba(255, 20, 147, 0.1) 100%)'
                  },
                  '100%': {
                    background: 'linear-gradient(45deg, rgba(255, 20, 147, 0.1) 0%, rgba(138, 43, 226, 0.1) 50%, rgba(30, 144, 255, 0.1) 100%)'
                  }
                }
              },
            }}
          >
            {/* Premium Header Section */}
            <Box sx={{ 
              p: 3, 
              pb: 2,
              background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(30, 144, 255, 0.2) 100%)',
              borderRadius: '24px 24px 0 0',
              position: 'relative',
              overflow: 'hidden',
              borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
                animation: 'headerShine 3s ease-in-out infinite'
              },
              '@keyframes headerShine': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' }
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    right: -4,
                    bottom: -4,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #8A2BE2, #1E90FF, #FF1493)',
                    animation: 'avatarGlow 2s ease-in-out infinite alternate',
                    filter: 'blur(8px)',
                    opacity: 0.8
                  },
                  '@keyframes avatarGlow': {
                    '0%': { opacity: 0.6, transform: 'scale(1)' },
                    '100%': { opacity: 1, transform: 'scale(1.1)' }
                  }
                }}>
                  <ProfileAvatar 
                    src={userPhotoURL}
                    sx={{ 
                      bgcolor: userPhotoURL ? 'transparent' : theme.palette.primary.main,
                      width: 56,
                      height: 56,
                      position: 'relative',
                      zIndex: 1,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }}
                  >
                    {!userPhotoURL && getInitials(userName)}
                  </ProfileAvatar>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h6" 
                    fontWeight={700}
                    sx={{
                      color: '#ffffff',
                      fontSize: '1.1rem',
                      mb: 0.5,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {userName}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    {auth.currentUser?.email}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Menu Items */}
            <Box sx={{ p: 1 }}>
              <MenuItem 
                onClick={handleProfileClick} 
                sx={{ 
                  py: 2, 
                  px: 3,
                  borderRadius: '16px',
                  mb: 1,
                  background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(30, 144, 255, 0.15) 100%)',
                  border: '1px solid rgba(138, 43, 226, 0.2)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.25) 0%, rgba(30, 144, 255, 0.25) 100%)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 8px 25px rgba(138, 43, 226, 0.4), 0 4px 12px rgba(30, 144, 255, 0.2)',
                    border: '1px solid rgba(138, 43, 226, 0.4)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #8A2BE2 0%, #1E90FF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(138, 43, 226, 0.3)'
                  }}>
                    <PersonIcon sx={{ fontSize: '1.1rem', color: 'white' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary="Profil" 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontWeight: 600,
                      color: '#ffffff'
                    } 
                  }} 
                />
              </MenuItem>

              <MenuItem 
                onClick={handleClose} 
                sx={{ 
                  py: 2, 
                  px: 3,
                  borderRadius: '16px',
                  mb: 1,
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(139, 195, 74, 0.15) 100%)',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(139, 195, 74, 0.25) 100%)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4), 0 4px 12px rgba(139, 195, 74, 0.2)',
                    border: '1px solid rgba(76, 175, 80, 0.4)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                  }}>
                    <SettingsIcon sx={{ fontSize: '1.1rem', color: 'white' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary="Ayarlar" 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontWeight: 600,
                      color: '#ffffff'
                    } 
                  }} 
                />
              </MenuItem>

              {isAdmin && (
                <MenuItem 
                  onClick={() => {
                    handleAdminLogin();
                    handleClose();
                  }} 
                  sx={{ 
                    py: 2, 
                    px: 3,
                    borderRadius: '16px',
                    mb: 1,
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 193, 7, 0.15) 100%)',
                    border: '1px solid rgba(255, 152, 0, 0.2)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.25) 0%, rgba(255, 193, 7, 0.25) 100%)',
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: '0 8px 25px rgba(255, 152, 0, 0.4), 0 4px 12px rgba(255, 193, 7, 0.2)',
                      border: '1px solid rgba(255, 152, 0, 0.4)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                    }}>
                      <LockIcon sx={{ fontSize: '1.1rem', color: 'white' }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Admin Girişi" 
                    sx={{ 
                      '& .MuiTypography-root': { 
                        fontWeight: 600,
                        color: '#ffffff'
                      } 
                    }} 
                  />
                </MenuItem>
              )}

              {/* Divider */}
              <Box sx={{ 
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.3), transparent)',
                my: 1.5,
                mx: 2,
                boxShadow: '0 0 10px rgba(138, 43, 226, 0.2)'
              }} />

              <MenuItem 
                onClick={handleLogout} 
                sx={{ 
                  py: 2, 
                  px: 3,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(233, 30, 99, 0.15) 100%)',
                  border: '1px solid rgba(244, 67, 54, 0.2)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.25) 0%, rgba(233, 30, 99, 0.25) 100%)',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 8px 25px rgba(244, 67, 54, 0.4), 0 4px 12px rgba(233, 30, 99, 0.2)',
                    border: '1px solid rgba(244, 67, 54, 0.4)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #F44336 0%, #E91E63 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                  }}>
                    <LogoutIcon sx={{ fontSize: '1.1rem', color: 'white' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary="Çıkış Yap" 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontWeight: 600,
                      color: '#ffffff'
                    } 
                  }} 
                />
              </MenuItem>
            </Box>
          </Menu>

      {/* Admin Giriş Dialog */}
      <Dialog open={showAdminDialog} onClose={handleAdminDialogClose}>
        <DialogTitle>Admin Girişi</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Admin Şifresi"
            type="password"
            fullWidth
            variant="outlined"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            error={!!adminError}
            helperText={adminError}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAdminPasswordSubmit();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAdminDialogClose}>İptal</Button>
          <Button onClick={handleAdminPasswordSubmit} variant="contained" color="primary">
            Giriş
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
