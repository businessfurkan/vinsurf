import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon
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


const drawerWidth = 60;



const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `${drawerWidth}px`,
  background: '#D9D4BB',
  borderRight: 'none',
  boxShadow: '2px 0 15px 0 rgba(0,0,0,0.1)',
  position: 'relative',
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  ...theme.mixins.toolbar,
}));

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
      ...closedMixin(theme),
    },
  }),
);

const Sidebar = ({ open, handleDrawerToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Menü öğeleri - Canlı ve modern renkler
  const menuItems = [
    { text: 'Anasayfa', icon: <HomeIcon />, path: '/', color: '#2196F3' }, // Canlı Mavi
    { text: 'Pomodoro', icon: <TimerIcon />, path: '/pomodoro', color: '#E91E63' }, // Canlı Pembe
    { text: 'TYT/AYT Net', icon: <AssessmentIcon />, path: '/tyt-ayt-net-takibi', color: '#FFC107' }, // Canlı Sarı
    { text: 'Ders Programı', icon: <CalendarMonthIcon />, path: '/performans', color: '#FF9800' }, // Canlı Turuncu
    { text: 'Analizler', icon: <InsightsIcon />, path: '/analiz', color: '#4CAF50' }, // Canlı Yeşil
    { text: 'Not Defterim', icon: <NoteAltIcon />, path: '/not-defterim', color: '#9C27B0' }, // Canlı Mor
    { text: 'Konu Takip', icon: <CheckCircleOutlineIcon />, path: '/konu-takip', color: '#8BC34A' }, // Canlı Açık Yeşil
    { text: 'SoruForum', icon: <SmartToyIcon />, path: '/soru-forum', color: '#F44336' }, // Canlı Kırmızı
    { text: 'Benimle Çalış', icon: <HandshakeIcon />, path: '/benimle-calis', color: '#673AB7' }, // Canlı Mor
    { text: 'RekaNET', icon: <LanguageIcon />, path: '/rekanet', color: '#03A9F4' }, // Canlı Açık Mavi
  ];

  return (
    <StyledDrawer
      variant="permanent"
      open={false}
    >
      <DrawerHeader sx={{ 
        py: 2,
        display: 'flex', 
        justifyContent: 'center',
        background: '#D9D4BB',
        mb: 1,
      }}>
        <Box sx={{ 
          fontWeight: 800, 
          fontSize: '1.2rem', 
          color: '#2a5956',
          textAlign: 'center',
          fontFamily: 'Poppins, Montserrat, sans-serif',
        }}>
          YKS
        </Box>
      </DrawerHeader>
      
      <List sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
        px: 1,
        py: 1,
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
                position: 'relative',
                mb: 0.5,
              }}
              onMouseEnter={() => setHoveredItem(item.text)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <ListItemButton
                id={`sidebar-item-${item.text}`}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 42,
                  justifyContent: 'center',
                  px: 2.5,
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                  background: isActive ? `${item.color}15` : 'transparent',
                  '&:hover': {
                    background: `${item.color}10`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    color: isActive ? item.color : `${item.color}`,
                    transition: 'all 0.3s ease',
                    fontSize: 22,
                    opacity: isActive ? 1 : 0.9,
                    filter: isActive ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))' : 'none',
                    '& .MuiSvgIcon-root': {
                      fontSize: 22,
                    }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              </ListItemButton>
              
              {hoveredItem === item.text && ReactDOM.createPortal(
                <Box
                  sx={{
                    position: 'fixed',
                    left: `${drawerWidth + 8}px`,
                    top: (event) => {
                      const rect = document.getElementById(`sidebar-item-${item.text}`).getBoundingClientRect();
                      return rect.top + rect.height/2 - 15;
                    },
                    transform: 'translateY(-50%)',
                    background: `linear-gradient(135deg, ${item.color}15, ${item.color}25)`,
                    boxShadow: `0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.12)`,
                    border: `1px solid ${item.color}40`,
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    padding: '10px 18px',
                    zIndex: 9999,
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                    color: '#2a5956',
                    fontFamily: 'Poppins, Montserrat, sans-serif',
                    fontSize: '0.9rem',
                    letterSpacing: '0.3px',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: '120px',
                    justifyContent: 'center',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: '-8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderRight: `8px solid ${item.color}40`,
                      zIndex: 2
                    },
                    animation: 'tooltipFadeIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    '@keyframes tooltipFadeIn': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(-50%) translateX(-15px) scale(0.95)'
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(-50%) translateX(0) scale(1)'
                      }
                    }
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '100%',
                        height: '2px',
                        bottom: '-2px',
                        left: 0,
                        background: item.color,
                        transform: 'scaleX(0)',
                        transformOrigin: 'bottom right',
                        transition: 'transform 0.3s ease-out',
                      },
                      '&:hover::after': {
                        transform: 'scaleX(1)',
                        transformOrigin: 'bottom left',
                      },
                    }}
                  >
                    {item.text}
                  </Box>
                </Box>,
                document.body
              )}
            </ListItem>
          );
        })}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
