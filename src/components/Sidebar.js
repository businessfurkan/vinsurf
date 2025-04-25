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
                    background: 'white',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    zIndex: 9999,
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                    color: '#2e3856',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.9rem',
                    border: `1px solid ${item.color}30`,
                    pointerEvents: 'none',
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
