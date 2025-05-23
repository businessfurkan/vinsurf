import React from 'react';
import { Box, Typography } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SummarizeIcon from '@mui/icons-material/Summarize';

// Modern adım göstergesi bileşeni
const ModernStepper = ({ activeStep }) => {
  
  // Adım bilgileri
  const steps = [
    { 
      id: 1, 
      label: 'Deneme Adı', 
      sublabel: 'Deneme sınavınızın adını girin',
      icon: AssignmentIcon,
      color: '#4a6cf7'
    },
    { 
      id: 2, 
      label: 'Tarih', 
      sublabel: 'Sınavın tarihini seçin',
      icon: CalendarTodayIcon,
      color: '#2ecc71'
    },
    { 
      id: 3, 
      label: 'Sınav Türü', 
      sublabel: 'TYT veya AYT seçin',
      icon: CategoryIcon,
      color: '#f39c12'
    },
    { 
      id: 4, 
      label: 'Ders Bilgileri', 
      sublabel: 'Doğru, yanlış ve boş sayılarını girin',
      icon: MenuBookIcon,
      color: '#e74c3c'
    },
    { 
      id: 5, 
      label: 'Özet', 
      sublabel: 'Girilen bilgileri kontrol edin',
      icon: SummarizeIcon,
      color: '#9b59b6'
    }
  ];

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      position: 'relative',
      width: '100%',
      mb: 4,
      p: 2,
      bgcolor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(8px)',
      overflow: 'hidden'
    }}>
      {/* Bağlantı çizgisi */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '10%',
        right: '10%',
        height: '4px',
        bgcolor: 'rgba(0, 0, 0, 0.08)',
        zIndex: 0,
        transform: 'translateY(-50%)'
      }} />
      
      {/* Adımlar */}
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;
        
        return (
          <Box key={step.id} sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            width: '20%'
          }}>
            <Box sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              background: isActive 
                ? `linear-gradient(135deg, ${step.color}, ${step.color}dd)` 
                : isCompleted 
                  ? 'linear-gradient(135deg, #4CAF50, #2E7D32)' 
                  : 'linear-gradient(135deg, #9e9e9e, #757575)',
              boxShadow: isActive || isCompleted 
                ? `0 8px 16px ${step.color}40` 
                : '0 4px 8px rgba(0,0,0,0.1)',
              transform: isActive ? 'scale(1.2)' : 'scale(1)'
            }}>
              {isCompleted ? <CheckCircleIcon /> : index + 1}
            </Box>
            <Typography sx={{
              fontWeight: isActive || isCompleted ? 700 : 500,
              color: isActive ? step.color : isCompleted ? '#4CAF50' : '#757575',
              textAlign: 'center',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}>
              {step.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default ModernStepper;
