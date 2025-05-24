import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  Box, 
  Drawer, 
  List, 
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


const drawerWidth = 70;



const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `${drawerWidth}px`,
  background: 'var(--sidebar-bg-color, #f4f2f5)',
  borderRight: 'none',
  boxShadow: '2px 0 15px 0 var(--shadow-color, rgba(0,0,0,0.1))',
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
  const menuItems = React.useMemo(() => [
    { text: 'Anasayfa', icon: <HomeIcon />, path: '/', color: '#2196F3' }, // Canlı Mavi
    { text: 'Pomodoro', icon: <TimerIcon />, path: '/pomodoro', color: '#E91E63' }, // Canlı Pembe
    { text: 'TYT/AYT Net', icon: <AssessmentIcon />, path: '/tyt-ayt-net-takibi', color: '#FFC107' }, // Canlı Sarı
    { text: 'Ders Programı', icon: <CalendarMonthIcon />, path: '/performans', color: '#FF9800' }, // Canlı Turuncu
    { text: 'Analizler', icon: <InsightsIcon />, path: '/analiz', color: '#4CAF50' }, // Canlı Yeşil
    { text: 'Not Defterim', icon: <NoteAltIcon />, path: '/not-defterim', color: '#9C27B0' }, // Canlı Mor
    { text: 'Konu Takip', icon: <CheckCircleOutlineIcon />, path: '/konu-takip', color: '#8BC34A' }, // Canlı Açık Yeşil
    { text: 'SoruForum', icon: <SmartToyIcon />, path: '/soru-forum', color: '#F44336' }, // Canlı Kırmızı
    { text: 'Benimle Çalış', icon: <HandshakeIcon />, path: '/benimle-calis', color: '#673AB7' }, // Canlı Mor
    { text: 'RekaNET', icon: <LanguageIcon />, path: '/rekanet', color: '#03A9F4' } // Canlı Açık Mavi
  ], []);
  
  // Sayfa yüklendiğinde veya rota değiştiğinde aktif öğeyi güncelle
  useEffect(() => {
    // Not: Aktif öğe durumu artık isActive değişkeni ile kontrol ediliyor
    // location.pathname ve menuItems değişikliklerini takip ediyoruz
  }, [location.pathname, menuItems]);

  return (
    <StyledDrawer
      variant="permanent"
      open={false}
    >
      <DrawerHeader sx={{ 
        py: 2,
        display: 'flex', 
        justifyContent: 'center',
        background: 'var(--background-color)',
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
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '2px',
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.05) 20%, rgba(0,0,0,0.05) 80%, transparent)',
          transform: 'translateX(-50%)',
          zIndex: 0,
        }
      }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Box 
              key={item.text} 
              id={`sidebar-item-${item.text}`}
            >
              <ListItemButton
                id={`sidebar-item-${item.text}`}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredItem(item.text)}
                onMouseLeave={() => setHoveredItem(null)}
                sx={{
                  minHeight: 42,
                  justifyContent: 'center',
                  p: 0.5,
                  borderRadius: '10px',
                  position: 'relative',
                  zIndex: 1,
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${item.color}10, ${item.color}20)`,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    zIndex: -1,
                    borderRadius: '14px',
                  },
                  '&:hover': {
                    '&::before': {
                      opacity: 1,
                    },
                    backgroundColor: 'rgba(0,0,0,0.03)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: item.color,
                    fontSize: 28,
                    opacity: isActive ? 1 : 0.9,
                    filter: isActive ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))' : 'none',
                    backgroundColor: '#f4f2f5',
                    position: 'relative',
                    zIndex: 1,
                    padding: '8px',
                    borderRadius: '50%',
                    border: isActive ? `1px solid ${item.color}40` : '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.2s ease',
                    minWidth: 'auto', // Minimum genişliği kaldır
                    '& .MuiSvgIcon-root': {
                      fontSize: 28,
                    }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              </ListItemButton>
              
              {hoveredItem === item.text && (() => {
                // Element kontrolünü ReactDOM.createPortal'dan önce yapıyoruz
                const element = document.getElementById(`sidebar-item-${item.text}`);
                if (!element) return null; // Element yoksa tooltip gösterme
                
                const rect = element.getBoundingClientRect();
                const topPosition = rect.top + rect.height/2 - 15;
                
                return ReactDOM.createPortal(
                <Box
                  sx={{
                    position: 'fixed',
                    left: `${drawerWidth + 10}px`,
                    top: topPosition, // Hesaplanmış değeri doğrudan kullanıyoruz
                    transform: 'translateY(-50%)',
                    background: `linear-gradient(135deg, ${item.color}15, ${item.color}25)`,
                    boxShadow: `0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.12)`,
                    border: `1px solid ${item.color}40`,
                    backdropFilter: 'blur(8px)',
                    borderRadius: '14px',
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
                      boxShadow: isActive ? `0 4px 12px ${item.color}30` : '0 2px 8px rgba(0,0,0,0.03)',
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
                        background: isActive ? `${item.color}30` : 'rgba(255,255,255,0.1)',
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
              );
              })()}
            </Box>
          );
        })}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
