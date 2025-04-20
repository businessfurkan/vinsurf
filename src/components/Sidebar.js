import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, useTheme, useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import InsightsIcon from '@mui/icons-material/Insights';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';





const drawerWidth = 240;

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
    width: `calc(${theme.spacing(8)} + 1px)`,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Menü öğeleri
  const menuItems = [
    { text: 'Anasayfa', icon: <HomeIcon />, path: '/', color: '#4285F4' }, // Google Mavi
    { text: 'Pomodoro', icon: <TimerIcon />, path: '/pomodoro', color: '#EA4335' }, // Google Kırmızı
    { text: 'TYT/AYT Net Takibi', icon: <AssessmentIcon />, path: '/tyt-ayt-net-takibi', color: '#FBBC05' }, // Google Sarı
    { text: 'Yapay Zeka', icon: <SmartToyIcon />, path: '/yapay-zeka', color: '#34A853' }, // Google Yeşil
    { text: 'Ders Programı', icon: <CalendarMonthIcon />, path: '/performans', color: '#FF9800' }, // Turuncu
    { text: 'Çalışma Analizleri', icon: <InsightsIcon />, path: '/analiz', color: '#00BCD4' }, // Turkuaz
    { text: 'Bugün Çözdüklerin', icon: <AssignmentTurnedInIcon />, path: '/bugun-cozduklerin', color: '#FF5722' }, // Koyu Turuncu
    { text: 'Not Defterim', icon: <NoteAltIcon />, path: '/not-defterim', color: '#9C27B0' }, // Mor
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
      <DrawerHeader>
        {/* Add logo or header content here if needed */}
      </DrawerHeader>
      
      <Divider sx={{ mb: 1 }} />
      
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.text}
              disablePadding
              sx={{
                display: 'block',
                mb: 0.7,
                mx: 0.5,
              }}
            >
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: open ? 2.7 : 1.2,
                  borderRadius: 99,
                  background: isActive ? '#FFFFF0' : '#FFFFF0',
                  boxShadow: '0 3px 10px 0 rgba(0,0,0,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: isActive ? '#2e3856' : '#222',
                  transition: 'all 0.18s',
                  fontWeight: isActive ? 700 : 500,
                  '&:hover': {
                    background: '#FFFFF0',
                    color: '#2e3856',
                    boxShadow: '0 4px 18px 0 rgba(0,0,0,0.15)',
                  },
                  mb: 0.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: getIconColor(isActive, item.color),
                    fontSize: 25,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: open ? 1 : 0,
                    ml: open ? 0.5 : 0,
                    '& .MuiTypography-root': {
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#2e3856' : theme.palette.text.primary,
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '1.09rem',
                      letterSpacing: 0.1,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ mt: 2, mb: 1, mx: 2, borderColor: '#43C6AC44', borderRadius: 99, boxShadow: '0 2px 12px #43C6AC11' }} />
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{
        px: open ? 2 : 0.5,
        py: 1.6,
        textAlign: open ? 'left' : 'center',
        fontSize: '0.93rem',
        color: '#2e3856b0',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 500,
        letterSpacing: 0.3,
        opacity: 0.85,
        userSelect: 'none',
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        background: '#fff',
        boxShadow: '0 -2px 16px #43C6AC08',
      }}>
        <span>vinsurf YKS &copy; 2025</span>
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar;
