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
  background: '#FFFFF0',
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
  
  // Menü öğeleri
  const menuItems = [
    { text: 'Anasayfa', icon: <HomeIcon />, path: '/', color: '#4285F4' },
    { text: 'Pomodoro', icon: <TimerIcon />, path: '/pomodoro', color: '#EA4335' },
    { text: 'TYT/AYT Net', icon: <AssessmentIcon />, path: '/tyt-ayt-net-takibi', color: '#FBBC05' },
    { text: 'Ders Programı', icon: <CalendarMonthIcon />, path: '/performans', color: '#FF9800' },
    { text: 'Analizler', icon: <InsightsIcon />, path: '/analiz', color: '#00BCD4' },
    { text: 'Not Defterim', icon: <NoteAltIcon />, path: '/not-defterim', color: '#9C27B0' },
    { text: 'Konu Takip', icon: <CheckCircleOutlineIcon />, path: '/konu-takip', color: '#4CAF50' },
    { text: 'SoruForum', icon: <SmartToyIcon />, path: '/soru-forum', color: '#FF5722' },
    { text: 'Benimle Çalış', icon: <HandshakeIcon />, path: '/benimle-calis', color: '#8E24AA' },
    { text: 'RekaNET', icon: <LanguageIcon />, path: '/rekanet', color: '#3F51B5' },
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
        background: '#FFFFF0',
        mb: 1,
      }}>
        <Box sx={{ 
          fontWeight: 800, 
          fontSize: '1.2rem', 
          color: '#4285F4',
          textAlign: 'center',
          fontFamily: 'Montserrat, sans-serif',
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
              }}
              onMouseEnter={() => setHoveredItem(item.text)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <ListItemButton
                id={`sidebar-item-${item.text}`}
                onClick={() => navigate(item.path)}
                sx={{
                  height: 46,
                  width: 46,
                  minWidth: 46,
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 0,
                  mx: 'auto',
                  background: isActive ? `${item.color}15` : 'transparent',
                  border: isActive ? `2px solid ${item.color}` : '2px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: `${item.color}20`,
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    color: isActive ? item.color : `${item.color}99`,
                    transition: 'all 0.2s ease',
                    fontSize: 24,
                    '& .MuiSvgIcon-root': {
                      fontSize: 24,
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
                    background: `linear-gradient(135deg, ${item.color}10, ${item.color}30)`,
                    boxShadow: `0 8px 16px rgba(0,0,0,0.1), 0 2px 4px ${item.color}20`,
                    borderRadius: '12px',
                    padding: '10px 18px',
                    zIndex: 9999,
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                    color: '#2e3856',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.9rem',
                    letterSpacing: '0.3px',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${item.color}40`,
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
