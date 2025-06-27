import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  Box, 
  Drawer, 
  List
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import InsightsIcon from '@mui/icons-material/Insights';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LanguageIcon from '@mui/icons-material/Language';
import WorkspacesIcon from '@mui/icons-material/Workspaces';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  ...theme.mixins.toolbar,
}));

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: 80,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: 80,
      boxSizing: 'border-box',
      backgroundColor: '#1a0545',
      color: '#ffffff',
      overflowX: 'hidden',
      borderRight: 'none',
      boxShadow: '2px 0 10px rgba(0, 0, 0, 0.3)',
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
    { text: 'TYT/AYT Net', icon: <AssessmentIcon />, path: '/tyt-ayt-net-takibi', color: '#FFC107' }, // Canlı Sarı
    { text: 'Ders Programı', icon: <CalendarMonthIcon />, path: '/performans', color: '#FF9800' }, // Canlı Turuncu
    { text: 'Analizler', icon: <InsightsIcon />, path: '/analiz', color: '#4CAF50' }, // Canlı Yeşil
    { text: 'Not Defterim', icon: <NoteAltIcon />, path: '/not-defterim', color: '#9C27B0' }, // Canlı Mor
    { text: 'Konu Takip', icon: <CheckCircleOutlineIcon />, path: '/konu-takip', color: '#8BC34A' }, // Canlı Açık Yeşil
    { text: 'SoruForum', icon: <SmartToyIcon />, path: '/soru-forum', color: '#F44336' }, // Canlı Kırmızı
    { text: 'RekaNET', icon: <LanguageIcon />, path: '/rekanet', color: '#03A9F4' }, // Canlı Açık Mavi
    { text: 'Çalışma Odası', icon: <WorkspacesIcon />, path: '/calisma-odasi', color: '#E91E63' } // Canlı Pembe
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
              sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '16px',
                padding: '12px 8px',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  '& .icon-container': {
                    transform: 'scale(1.1)',
                    background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                    boxShadow: `0 8px 25px ${item.color}30, 0 4px 10px rgba(0,0,0,0.1)`,
                  }
                }
              }}
              onMouseEnter={() => setHoveredItem(item.text)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => navigate(item.path)}
            >
              <Box
                className="icon-container"
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 52,
                  height: 52,
                  borderRadius: '16px',
                  background: isActive 
                    ? `linear-gradient(135deg, ${item.color}25, ${item.color}15)` 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isActive 
                    ? `2px solid ${item.color}50` 
                    : '2px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isActive 
                      ? `linear-gradient(45deg, ${item.color}15, transparent)` 
                      : 'transparent',
                    borderRadius: '14px',
                    transition: 'all 0.3s ease',
                  },
                  '&::after': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: '-2px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '70%',
                    background: `linear-gradient(to bottom, ${item.color}, ${item.color}80)`,
                    borderRadius: '0 2px 2px 0',
                    boxShadow: `0 0 12px ${item.color}60`,
                  } : {},
                }}
              >
                <Box
                  sx={{
                    color: isActive ? item.color : item.color,
                    fontSize: 28,
                    opacity: isActive ? 1 : 0.8,
                    filter: isActive ? `drop-shadow(0 3px 6px ${item.color}40)` : `drop-shadow(0 2px 4px ${item.color}20)`,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </Box>
              </Box>
              
              {hoveredItem === item.text && (() => {
                // Element kontrolünü ReactDOM.createPortal'dan önce yapıyoruz
                const element = document.getElementById(`sidebar-item-${item.text}`);
                if (!element) return null; // Element yoksa tooltip gösterme
                
                const rect = element.getBoundingClientRect();
                const topPosition = rect.top + rect.height/2;
                
                return ReactDOM.createPortal(
                <Box
                  sx={{
                    position: 'fixed',
                    left: `${80 + 16}px`,
                    top: `${topPosition}px`,
                    transform: 'translateY(-50%)',
                    background: `linear-gradient(135deg, 
                      ${item.color}E6 0%, 
                      ${item.color}CC 50%, 
                      ${item.color}E6 100%)`,
                    boxShadow: `
                      0 16px 48px ${item.color}35,
                      0 8px 24px ${item.color}25,
                      0 4px 12px rgba(0,0,0,0.15),
                      inset 0 1px 0 rgba(255,255,255,0.25),
                      inset 0 -1px 0 rgba(0,0,0,0.1)`,
                    border: `2px solid ${item.color}`,
                    backdropFilter: 'blur(20px) saturate(1.5)',
                    borderRadius: '20px',
                    padding: '14px 20px',
                    zIndex: 9999,
                    whiteSpace: 'nowrap',
                    fontWeight: 700,
                    color: '#ffffff',
                    fontFamily: 'Poppins, Montserrat, sans-serif',
                    fontSize: '1rem',
                    letterSpacing: '0.5px',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: '140px',
                    justifyContent: 'center',
                    textShadow: '0 2px 6px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.5)',
                    overflow: 'visible',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: '-10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderTop: '10px solid transparent',
                      borderBottom: '10px solid transparent',
                      borderRight: `10px solid ${item.color}`,
                      filter: 'drop-shadow(-2px 0 4px rgba(0,0,0,0.15))',
                      zIndex: 2
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '-2px',
                      left: '-2px',
                      right: '-2px',
                      bottom: '-2px',
                      background: `linear-gradient(135deg, 
                        ${item.color}40 0%, 
                        transparent 25%, 
                        transparent 75%, 
                        ${item.color}30 100%)`,
                      borderRadius: '22px',
                      zIndex: -1,
                      opacity: 0.6,
                    }
                  }}
                >
                  {item.text}
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
