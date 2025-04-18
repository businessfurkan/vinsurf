import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  IconButton,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import InsightsIcon from '@mui/icons-material/Insights';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  backgroundColor: theme.palette.background.paper,
  borderRight: '1px solid rgba(0, 0, 0, 0.05)',
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
  backgroundColor: theme.palette.background.paper,
  borderRight: '1px solid rgba(0, 0, 0, 0.05)',
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: open ? 'space-between' : 'center',
            px: open ? 2 : 0,
          }}
        >
          {open && (
            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              YKS Asistan
            </Typography>
          )}
          <IconButton onClick={handleDrawerToggle}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
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
                mb: 0.5,
              }}
            >
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  mx: 1,
                  borderRadius: 1,
                  backgroundColor: isActive ? 'rgba(91, 143, 185, 0.12)' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(91, 143, 185, 0.20)' : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: getIconColor(isActive, item.color),
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    '& .MuiTypography-root': {
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? item.color : theme.palette.text.primary,
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
