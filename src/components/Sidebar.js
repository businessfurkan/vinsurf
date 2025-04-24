import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  useTheme, useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import InsightsIcon from '@mui/icons-material/Insights';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';


const drawerWidth = 290;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  background: '#FFFFF0',
  borderRight: 'none',
  boxShadow: '2px 0 15px 0 rgba(0,0,0,0.1)',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(8)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
  background: '#FFFFF0',
  borderRight: 'none',
  boxShadow: '2px 0 15px 0 rgba(0,0,0,0.1)',
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Admin panel secret access variables
  const [, setClickCount] = useState(0); // Sadece setter'ı kullanıyoruz
  const clickTimerRef = useRef(null);
  const ADMIN_URL = '/admin-x1f9wz'; // Secret admin URL

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
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
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  // Handle secret admin access with 7 clicks in 4 seconds
  const handleSecretAdminAccess = () => {
    // Increment click count
    setClickCount(prevCount => {
      const newCount = prevCount + 1;
      
      // Clear existing timer
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      
      // Set timer to reset click count after 4 seconds
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 4000);
      
      // Check if we've reached 7 clicks and user is admin
      if (newCount >= 7 && isAdmin) {
        // Navigate to admin panel
        navigate(ADMIN_URL);
        return 0; // Reset count after successful navigation
      }
      
      // For debugging
      console.log(`Click count: ${newCount}`);
      
      return newCount;
    });
  };

  // Menü öğeleri
  const menuItems = [
    { text: 'Anasayfa', icon: <HomeIcon />, path: '/', color: '#4285F4' }, // Google Mavi
    { text: 'Pomodoro', icon: <TimerIcon />, path: '/pomodoro', color: '#EA4335' }, // Google Kırmızı
    { text: 'TYT/AYT Net', icon: <AssessmentIcon />, path: '/tyt-ayt-net-takibi', color: '#FBBC05' }, // Google Sarı - Shortened for better display
    { text: 'Yapay Zeka', icon: <SmartToyIcon />, path: '/yapay-zeka', color: '#34A853' }, // Google Yeşil
    { text: 'Ders Programı', icon: <CalendarMonthIcon />, path: '/performans', color: '#FF9800' }, // Turuncu
    { text: 'Analizler', icon: <InsightsIcon />, path: '/analiz', color: '#00BCD4' }, // Turkuaz - Shortened for better display
    { text: 'Not Defterim', icon: <NoteAltIcon />, path: '/not-defterim', color: '#9C27B0' }, // Mor
    { text: 'Kaç Gün Kaldı', icon: <HourglassEmptyIcon />, path: '/kac-gun-kaldi', color: '#E91E63' }, // Pembe
    { text: 'Konu Takip', icon: <CheckCircleOutlineIcon />, path: '/konu-takip', color: '#4CAF50' }, // Yeşil
    { text: 'SoruForum', icon: <SmartToyIcon />, path: '/soru-forum', color: '#FF5722' }, // Turuncu-Kırmızı
    // Teneffüs sekmesi kaldırıldı.
  ];

  // İkon rengini belirleme fonksiyonu
  const getIconColor = (isActive, iconColor) => {
    if (isActive) {
      return iconColor;
    }
    // Aktif değilse hafif soluk görünsün ama yine de renkli olsun
    return `${iconColor}99`; // %60 opaklık için renk koduna 99 ekliyoruz
  };

  return (
    <StyledDrawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={isMobile ? handleDrawerToggle : undefined}
    >
      <DrawerHeader sx={{ 
        height: 70, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#FFFFF0',
        mb: 1
      }}>
        <Box sx={{ 
          fontWeight: 800, 
          fontSize: open ? '1.5rem' : '1.2rem', 
          color: '#4285F4',
          textAlign: 'center',
          letterSpacing: '-0.5px',
          fontFamily: 'Montserrat, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: open ? 1 : 0.9,
          transition: 'all 0.2s ease',
        }}>
          {open ? 'YKS Çalışma Asistanı' : 'YKS'}
        </Box>
      </DrawerHeader>
      
      <Box sx={{ px: open ? 2 : 1, py: 1 }}>
        <List sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1.5,
          mt: 1
        }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem
                key={item.text}
                disablePadding
                sx={{
                  display: 'block',
                  padding: 0,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: isActive ? `0 4px 12px ${item.color}30` : 'none',
                }}
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    minHeight: 50,
                    justifyContent: open ? 'initial' : 'center',
                    px: open ? 2.5 : 2,
                    py: 1.2,
                    borderRadius: 2,
                    background: isActive ? `${item.color}08` : 'transparent',
                    border: isActive ? `1px solid ${item.color}30` : '1px solid transparent',
                    color: isActive ? '#2e3856' : '#2e3856cc',
                    transition: 'all 0.2s ease',
                    fontWeight: isActive ? 600 : 500,
                    width: '100%',
                    '&:hover': {
                      background: `${item.color}15`,
                      color: '#2e3856',
                      borderColor: `${item.color}40`,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      mr: open ? 1.5 : 'auto',
                      justifyContent: 'center',
                      color: getIconColor(isActive, item.color),
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: open ? 1 : 0,
                      width: '100%',
                      '& .MuiTypography-root': {
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#2e3856' : '#2e3856cc',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        width: '100%',
                        display: 'block',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      
      <Box sx={{ flexGrow: 1 }} />
      
      {isAdmin ? (
        <Box 
          component="button"
          onClick={handleSecretAdminAccess}
          sx={{
            px: open ? 3 : 1,
            py: 2,
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#2e3856aa',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            opacity: 0.9,
            userSelect: 'none',
            mx: 2,
            mb: 2,
            borderRadius: 2,
            background: '#FFFFF0',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.05)',
            cursor: 'pointer',
            width: '100%',
            outline: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              opacity: 1,
              boxShadow: 'inset 0 0 12px rgba(0,0,0,0.05)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            }
          }}
        >
          {open ? 'YKS ÇALIŞMA © 2025' : 'YKS'}
        </Box>
      ) : (
        <Box 
          sx={{
            px: open ? 3 : 1,
            py: 2,
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#2e3856aa',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            opacity: 0.9,
            userSelect: 'none',
            mx: 2,
            mb: 2,
            borderRadius: 2,
            background: '#FFFFF0',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          {open ? 'YKS ÇALIŞMA © 2025' : 'YKS'}
        </Box>
      )}
    </StyledDrawer>
  );
};

export default Sidebar;
