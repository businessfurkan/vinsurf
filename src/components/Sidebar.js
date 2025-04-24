import React, { useState, useEffect } from 'react';
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
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import InsightsIcon from '@mui/icons-material/Insights';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LanguageIcon from '@mui/icons-material/Language';


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
  // navigate artık kullanılmıyor
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  
  // Admin erişimi artık sadece profil menüsünden şifre ile yapılacak

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);
  
  // Admin erişimi artık sadece Header.js içinde kontrol ediliyor

  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  // Admin erişimi artık sadece profil menüsünden şifre ile yapılacak

  // Menü öğeleri
  const menuItems = [
    { text: 'Anasayfa', icon: <HomeIcon />, path: '/', color: '#4285F4' }, // Google Mavi
    { text: 'Pomodoro', icon: <TimerIcon />, path: '/pomodoro', color: '#EA4335' }, // Google Kırmızı
    { text: 'TYT/AYT Net', icon: <AssessmentIcon />, path: '/tyt-ayt-net-takibi', color: '#FBBC05' }, // Google Sarı - Shortened for better display
    { text: 'Ders Programı', icon: <CalendarMonthIcon />, path: '/performans', color: '#FF9800' }, // Turuncu
    { text: 'Analizler', icon: <InsightsIcon />, path: '/analiz', color: '#00BCD4' }, // Turkuaz - Shortened for better display
    { text: 'Not Defterim', icon: <NoteAltIcon />, path: '/not-defterim', color: '#9C27B0' }, // Mor
    { text: 'Kaç Gün Kaldı', icon: <HourglassEmptyIcon />, path: '/kac-gun-kaldi', color: '#E91E63' }, // Pembe
    { text: 'Konu Takip', icon: <CheckCircleOutlineIcon />, path: '/konu-takip', color: '#4CAF50' }, // Yeşil
    { text: 'SoruForum', icon: <SmartToyIcon />, path: '/soru-forum', color: '#FF5722' }, // Turuncu-Kırmızı
    { text: 'Benimle Çalış', icon: <HandshakeIcon />, path: '/benimle-calis', color: '#8E24AA' }, // Mor
    { text: 'RekaNET', icon: <LanguageIcon />, path: '/rekanet', color: '#3F51B5' }, // Indigo
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
    </StyledDrawer>
  );
};

export default Sidebar;
