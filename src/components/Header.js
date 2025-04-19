import React, { useEffect, useState } from 'react';
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
  useMediaQuery,
  useTheme,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';

import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  zIndex: theme.zIndex.drawer + 1,
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

const Header = ({ handleDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserPhotoURL(user.photoURL);
        setUserName(user.displayName || user.email?.split('@')[0] || 'Kullanıcı');
      }
    });
    
    return () => unsubscribe();
  }, []);
  
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
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            color: 'text.primary',
            fontWeight: 700,
            display: { xs: isMobile ? 'none' : 'block', sm: 'block' },
          }}
        >
          YKS Çalışma Asistanı
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Bildirimler">
            <IconButton
              size="large"
              aria-label="show new notifications"
              color="inherit"
              onClick={handleNotificationClick}
              sx={{ 
                color: 'text.primary',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                } 
              }}
            >
              <StyledBadge badgeContent={3} color="error">
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
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>Bildirimler</Typography>
            </Box>
            <Divider />
            <MenuItem sx={{ py: 1.5 }} onClick={handleNotificationClose}>
              <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                <MoreVertIcon />
              </ListItemIcon>
              <ListItemText primary="Bugün 3 pomodoro tamamladınız!" />
            </MenuItem>
            <MenuItem sx={{ py: 1.5 }} onClick={handleNotificationClose}>
              <ListItemIcon sx={{ color: theme.palette.secondary.main }}>
                <MoreVertIcon />
              </ListItemIcon>
              <ListItemText primary="Yeni özellikler: Yapay Zeka eklendi" />
            </MenuItem>
            <MenuItem sx={{ py: 1.5 }} onClick={handleNotificationClose}>
              <ListItemIcon sx={{ color: '#FF9800' }}>
                <MoreVertIcon />
              </ListItemIcon>
              <ListItemText primary="Haftalık çalışma hedefinize ulaşmak için 2 saat kaldı" />
            </MenuItem>
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
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Çıkış Yap" sx={{ color: 'error.main' }} />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
