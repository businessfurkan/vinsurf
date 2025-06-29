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
    backgroundColor: '#FF5722',
    color: '#FFF',
    fontWeight: 'bold',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
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
          <Tooltip title="Bildirimler">
            <IconButton
              size="large"
              aria-label="show new notifications"
              color="inherit"
              onClick={handleNotificationClick}
              sx={{ 
                color: unreadCount > 0 ? 'primary.main' : 'text.primary',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                } 
              }}
            >
              <StyledBadge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                <NotificationsIcon />
              </StyledBadge>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: {
                borderRadius: 2,
                minWidth: 280,
                mt: 1.5,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600}>Bildirimler</Typography>
              {unreadCount > 0 && (
                <Tooltip title="Tümünü okundu işaretle">
                  <IconButton size="small" onClick={handleReadAllNotifications}>
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
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Bildirim bulunmuyor
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
              elevation: 3,
              sx: {
                borderRadius: 2,
                minWidth: 200,
                mt: 1.5,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <Box sx={{ py: 1.5, px: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {userName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {auth.currentUser?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Profil" />
            </MenuItem>
            <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Ayarlar" />
            </MenuItem>
            {isAdmin && (
              <MenuItem onClick={() => {
                handleAdminLogin();
                handleClose();
              }} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <LockIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary="Admin Girişi" sx={{ color: 'error.main' }} />
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Çıkış Yap" sx={{ color: 'error.main' }} />
            </MenuItem>
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
