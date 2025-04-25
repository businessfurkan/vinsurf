import React, { useEffect, useState } from 'react';
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
import { useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import InsightsIcon from '@mui/icons-material/Insights';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(7)} + 1px)`,
  },
  background: '#FFFFF0',
  borderRight: 'none',
  boxShadow: '2px 0 15px 0 rgba(0,0,0,0.1)',
  position: 'relative',
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

const Sidebar = ({ open, handleDrawerToggle }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Mobile cihazlarda sidebar varsayılan olarak kapalı olsun
  useEffect(() => {
    if (isMobile && open) {
      handleDrawerToggle();
    }
  }, [isMobile, open, handleDrawerToggle]);
  
  // Admin erişimi artık sadece profil menüsünden şifre ile yapılacak

  // Menü öğeleri
  const menuItems = [
    { text: 'Anasayfa', icon: <HomeIcon />, path: '/', color: '#4285F4' }, // Google Mavi
    { text: 'Pomodoro', icon: <TimerIcon />, path: '/pomodoro', color: '#EA4335' }, // Google Kırmızı
    { text: 'TYT/AYT Net', icon: <AssessmentIcon />, path: '/tyt-ayt-net-takibi', color: '#FBBC05' }, // Google Sarı - Shortened for better display
    { text: 'Ders Programı', icon: <CalendarMonthIcon />, path: '/performans', color: '#FF9800' }, // Turuncu
    { text: 'Analizler', icon: <InsightsIcon />, path: '/analiz', color: '#00BCD4' }, // Turkuaz - Shortened for better display
    { text: 'Not Defterim', icon: <NoteAltIcon />, path: '/not-defterim', color: '#9C27B0' }, // Mor
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
        px: 2, 
        py: 1.5, 
        display: 'flex', 
        justifyContent: 'center',
        background: '#FFFFF0',
        mb: 1,
        position: 'relative'
      }}>
        <Box sx={{ 
          fontWeight: 800, 
          fontSize: '1.2rem', 
          color: '#4285F4',
          textAlign: 'center',
          letterSpacing: '-0.5px',
          fontFamily: 'Montserrat, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.9,
          transition: 'all 0.2s ease',
        }}>
          YKS
        </Box>
        
        {open && (
          <Box sx={{
            position: 'absolute',
            left: '60px',
            fontWeight: 800,
            fontSize: '1.5rem',
            color: '#4285F4',
            fontFamily: 'Montserrat, sans-serif',
            opacity: 1,
            transition: 'all 0.3s ease',
          }}>
            Çalışma Asistanı
          </Box>
        )}
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
                  position: 'relative',
                }}
                onMouseEnter={() => !open && setHoveredItem(item.text)}
                onMouseLeave={() => !open && setHoveredItem(null)}
              >
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 50,
                    justifyContent: 'center',
                    px: 2,
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
                      minWidth: 0,
                      mr: 0,
                      justifyContent: 'center',
                      color: getIconColor(isActive, item.color),
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </ListItemButton>
                
                {!open && hoveredItem === item.text && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 'calc(100% + 8px)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'white',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      zIndex: 1500,
                      whiteSpace: 'nowrap',
                      fontWeight: 500,
                      color: '#2e3856',
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.9rem',
                      border: `1px solid ${item.color}30`,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '-6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '6px solid transparent',
                        borderBottom: '6px solid transparent',
                        borderRight: '6px solid white',
                        zIndex: 2
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: '-7px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '7px solid transparent',
                        borderBottom: '7px solid transparent',
                        borderRight: `7px solid ${item.color}30`,
                        zIndex: 1
                      },
                      animation: 'fadeIn 0.2s ease-in-out',
                      '@keyframes fadeIn': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateY(-50%) translateX(-10px)'
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateY(-50%) translateX(0)'
                        }
                      }
                    }}
                  >
                    {item.text}
                  </Box>
                )}
                
                {open && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      position: 'absolute',
                      left: '60px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      opacity: 1,
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
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Box 
        sx={{
          px: 1,
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
          position: 'relative',
        }}
      >
        YKS
        {open && (
          <Box sx={{
            position: 'absolute',
            left: '50px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontWeight: 500,
            fontSize: '0.8rem',
            color: '#2e3856aa',
            fontFamily: 'Montserrat, sans-serif',
            opacity: 1,
            transition: 'all 0.3s ease',
          }}>
            ÇALIŞMA © 2025
          </Box>
        )}
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar;
