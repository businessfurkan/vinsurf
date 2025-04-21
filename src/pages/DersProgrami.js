import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogContent,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
  LinearProgress,
  IconButton,
  styled,
  alpha,
  InputAdornment,
  Menu,
  Badge,
  Checkbox,
  TextField
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotesIcon from '@mui/icons-material/Notes';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { scheduleService } from '../services/scheduleService';

const handleViewClass = () => {};

// Renk paleti - ders konularına göre
const subjectColors = {
  'Matematik': '#4285F4',
  'Geometri': '#34A853',
  'Fizik': '#0F9D58',
  'Kimya': '#DB4437',
  'Biyoloji': '#F4B400',
  'Edebiyat': '#673AB7',
  'Türk Dili': '#9C27B0',
  'Dil Bilgisi': '#8E24AA',
  'Tarih': '#FF6D00',
  'İnkılap': '#FF9800',
  'Coğrafya': '#00ACC1',
  'Felsefe': '#9E9E9E',
  'Sosyoloji': '#607D8B',
  'Psikoloji': '#795548',
  'Din Kültürü': '#795548',
  'İngilizce': '#0288D1',
  'Almanca': '#0097A7',
  'Fransızca': '#26A69A',
  'Arapça': '#4CAF50',
  'Ders Çalışma': '#5C6BC0',
  'Tekrar': '#7986CB',
  'Test Çözme': '#3949AB',
  'Deneme': '#283593',
  'default': '#3f51b5'
};

// Ders konusu için renk döndüren yardımcı fonksiyon
const getSubjectColor = (subject) => {
  const defaultColor = subjectColors.default;
  if (!subject) return defaultColor;
  
  const key = Object.keys(subjectColors).find(
    key => subject.toLowerCase().includes(key.toLowerCase())
  );
  
  return key ? subjectColors[key] : defaultColor;
};


// Styled components for table elements

// Day styling is now handled directly in the component

// Artık kullanılmayan bileşen

const ClassCard = styled(Paper)(({ theme, color = '#3f51b5' }) => ({
  padding: '16px',
  borderRadius: '12px',
  backgroundColor: alpha('#FFFFFF', 0.95),
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(255,255,255,0.5)',
  margin: '8px 0',
  '&:hover': {
    boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
    transform: 'translateY(-3px) scale(1.02)',
    backgroundColor: alpha('#FFFFFF', 0.99),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
    boxShadow: `0 2px 8px ${alpha(color, 0.4)}`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '5px',
    right: '10px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(color, 0.1)} 0%, transparent 70%)`,
    pointerEvents: 'none',
  }
}));

const FilterButton = styled(Button)(({ theme }) => ({
  backgroundColor: alpha('#3f51b5', 0.1),
  color: '#3f51b5',
  border: `1px solid ${alpha('#3f51b5', 0.2)}`,
  borderRadius: '30px',
  padding: '8px 16px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 10px rgba(63, 81, 181, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha('#3f51b5', 0.15),
    boxShadow: '0 6px 12px rgba(63, 81, 181, 0.15)',
    transform: 'translateY(-2px)',
  }
}));

const DayHeader = styled(Box)(({ theme, isToday, dayIndex = 0 }) => {
  // Her gün için farklı renkler
  const dayColors = [
    '#FF9A8B', // Pazartesi
    '#FAD0C4', // Salı
    '#FEE140', // Çarşamba
    '#A0E7E5', // Perşembe
    '#B5EAD7', // Cuma
    '#C7CEEA', // Cumartesi
    '#FFDAC1'  // Pazar
  ];
  
  const dayColor = dayColors[dayIndex % dayColors.length];
  
  return {
    padding: '16px 10px',
    borderRadius: '16px 16px 0 0',
    background: `linear-gradient(135deg, ${dayColor} 0%, ${alpha(dayColor, 0.7)} 100%)`,
    color: '#333',
    fontWeight: 700,
    fontSize: '1.1rem',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255,255,255,0.2)',
    borderBottom: 'none',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at top right, rgba(255,255,255,0.3) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '10%',
      width: '80%',
      height: '3px',
      background: 'rgba(255,255,255,0.7)',
      borderRadius: '3px',
    }
  };
});

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    padding: '12px',
    backgroundColor: alpha('#FFFFFF', 0.98),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha('#3f51b5', 0.1)}`,
    minWidth: '220px',
    maxWidth: '300px',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '4px',
      background: 'linear-gradient(90deg, #3f51b5, #5c6bc0)',
    }
  }
}));

const DersProgrami = () => {
  const [user] = useAuthState(auth);
  const [schedule, setSchedule] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDay, setCurrentDay] = useState('');
  const [classDetails, setClassDetails] = useState({
    subject: '',
    teacher: '',
    location: '',
    notes: ''
  });
  const [viewClassDialog, setViewClassDialog] = useState(false);
  const [viewingClass, setViewingClass] = useState(null);
  const [viewingDay, setViewingDay] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  
  // Filtreleme menüsü için state ekleyelim
  const [anchorEl, setAnchorEl] = useState(null);
  const openFilterMenu = Boolean(anchorEl);
  
  const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  // Bildirim gösterme
  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  useEffect(() => {
    if (user) {
      const loadSchedule = async () => {
        try {
          setIsLoading(true);
          const userId = user.uid;
          
          // Ders programını yükle
          const scheduleData = await scheduleService.loadSchedule(userId);
          
          if (scheduleData) {
            // Veri yapısını doğrula - her gün için bir dizi olduğundan emin ol
            const safeData = { ...scheduleData };
            daysOfWeek.forEach(day => {
              if (!Array.isArray(safeData[day])) {
                safeData[day] = [];
              }
            });
            
            setSchedule(safeData);
          } else {
            // Ders programı yoksa boş bir program oluştur
            const emptySchedule = scheduleService.createEmptySchedule(daysOfWeek);
            setSchedule(emptySchedule);
            
            // Boş programı kaydet
            await scheduleService.saveSchedule(emptySchedule, userId);
          }
        } catch (error) {
          console.error('Ders programı yüklenirken hata oluştu:', error);
          showNotification('Ders programı yüklenirken bir hata oluştu.', 'error');
          
          // Hata durumunda localStorage'dan yüklemeyi dene
          const cachedSchedule = localStorage.getItem(`weeklySchedule_${user.uid}`);
          if (cachedSchedule) {
            try {
              const parsedSchedule = JSON.parse(cachedSchedule);
              setSchedule(parsedSchedule);
              showNotification('Ders programı önbelleğinizden yüklendi.', 'info');
            } catch (e) {
              console.error('Önbellekten yükleme hatası:', e);
            }
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      loadSchedule();
    } else {
      // Kullanıcı oturum açmamışsa, anonim veriye bak
      const cachedSchedule = localStorage.getItem('weeklySchedule_anonymous');
      if (cachedSchedule) {
        try {
          const parsedSchedule = JSON.parse(cachedSchedule);
          setSchedule(parsedSchedule);
        } catch (e) {
          console.error('Anonim önbellekten yükleme hatası:', e);
        }
      } else {
        // Boş program oluştur
        const emptySchedule = scheduleService.createEmptySchedule(daysOfWeek);
        setSchedule(emptySchedule);
      }
    }
  }, [user]);

  const handleCloseViewDialog = () => {
    setViewClassDialog(false);
    setViewingClass(null);
    setViewingDay('');
  };

  const handleStartEdit = () => {
    // Düzenleme moduna geç
    setOpenDialog(true);
    setCurrentDay(viewingDay);
    setClassDetails(viewingClass);
    handleCloseViewDialog();
  };

  // Function to handle input changes and trigger auto-save
  const handleInputChange = (field, value) => {
    const updatedDetails = { ...classDetails, [field]: value };
    setClassDetails(updatedDetails);
    
    // Clear any existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Set a new timeout for auto-saving
    const newTimeout = setTimeout(() => {
      // Auto-save logic could be implemented here
    }, 1000); // 1 second delay
    
    setAutoSaveTimeout(newTimeout);
  };

  const handleUrlClick = (url) => {
    if (!url) return;
    
    // URL'nin http veya https ile başlayıp başlamadığını kontrol et
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(formattedUrl, '_blank');
  };

  const handleAddClass = (day) => {
    setCurrentDay(day);
    setClassDetails({
      subject: '',
      teacher: '',
      location: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleSaveClass = async () => {
    if (!classDetails.subject) {
      showNotification('Lütfen en azından ders adını girin.', 'warning');
      return;
    }

    try {
      const userId = user ? user.uid : 'anonymous';
      
      // scheduleService ile sınıf ekle
      const updatedSchedule = scheduleService.addClass(schedule, currentDay, classDetails);
      setSchedule(updatedSchedule);
      setOpenDialog(false);
      
      // Firestore ve localStorage'a kaydet
      if (user) {
        const success = await scheduleService.saveSchedule(updatedSchedule, userId);
        if (success) {
          showNotification('Ders başarıyla eklendi.');
        }
      } else {
        // Anonim kullanıcı için sadece localStorage'a kaydet
        localStorage.setItem('weeklySchedule_anonymous', JSON.stringify(updatedSchedule));
        showNotification('Ders başarıyla eklendi.');
      }
    } catch (error) {
      console.error('Ders eklenirken hata oluştu:', error);
      showNotification('Ders eklenirken bir hata oluştu.', 'error');
    }
  };

  const handleDeleteClass = async (day, classId) => {
    try {
      const userId = user ? user.uid : 'anonymous';
      
      // scheduleService ile sınıf sil
      const updatedSchedule = scheduleService.deleteClass(schedule, day, classId);
      setSchedule(updatedSchedule);
      
      // Firestore ve localStorage'a kaydet
      if (user) {
        const success = await scheduleService.saveSchedule(updatedSchedule, userId);
        if (success) {
          showNotification('Ders başarıyla silindi.');
        }
      } else {
        // Anonim kullanıcı için sadece localStorage'a kaydet
        localStorage.setItem('weeklySchedule_anonymous', JSON.stringify(updatedSchedule));
        showNotification('Ders başarıyla silindi.');
      }
    } catch (error) {
      console.error('Ders silinirken hata oluştu:', error);
      showNotification('Ders silinirken bir hata oluştu.', 'error');
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const getAllClasses = () => {
    const allClasses = [];
    Object.entries(schedule).forEach(([day, classes]) => {
      classes.forEach(classItem => {
        allClasses.push({ ...classItem, day });
      });
    });
    return allClasses;
  };

  const getUniqueSubjects = () => {
    const subjects = new Set();
    getAllClasses().forEach(classItem => {
      if (classItem.subject) {
        subjects.add(classItem.subject);
      }
    });
    return Array.from(subjects);
  };

  const handleFilterToggle = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(item => item !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

    // Search functionality is handled directly in the TextField onChange

  const getFilteredSchedule = () => {
    if (!searchText && selectedSubjects.length === 0) {
      return schedule;
    }

    const filteredSchedule = {};
    Object.entries(schedule).forEach(([day, classes]) => {
      const filteredClasses = classes.filter(classItem => {
        const matchesSearch = searchText === '' || 
          (classItem.subject && classItem.subject.toLowerCase().includes(searchText.toLowerCase())) ||
          (classItem.notes && classItem.notes.toLowerCase().includes(searchText.toLowerCase())) ||
          (classItem.teacher && classItem.teacher.toLowerCase().includes(searchText.toLowerCase()));

        const matchesSubjects = selectedSubjects.length === 0 || 
          (classItem.subject && selectedSubjects.includes(classItem.subject));

        return matchesSearch && matchesSubjects;
      });

      if (filteredClasses.length > 0) {
        filteredSchedule[day] = filteredClasses;
      } else {
        filteredSchedule[day] = [];
      }
    });

    return filteredSchedule;
  };

  const filteredSchedule = getFilteredSchedule();

  // Menüyü açma/kapama için handler
  const handleFilterMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleFilterMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        px: { xs: 1, sm: 2, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(255, 154, 139, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 154, 139, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,154,139,0.1) 0%, rgba(255,154,139,0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
        zIndex: 1,
      }}
    >
      <Box sx={{ p: 3, pt: 5, pb: 4, width: '100%', position: 'relative', zIndex: 2 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4, 
            mt: 2, 
            fontWeight: 'bold', 
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            pl: 1,
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '30%',
              height: '3px',
              backgroundColor: '#3f51b5',
              bottom: -8,
              left: 0
            }
          }}
        >
          <MenuBookIcon sx={{ mr: 1.5, fontSize: 32 }} />
          Ders Programı
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
          backgroundColor: alpha('#FFFFF0', 0.8),
          padding: '16px 20px',
          borderRadius: '20px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
          border: '1px solid rgba(63, 81, 181, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #3f51b5, #5c6bc0, #3f51b5)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite linear',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '0% 0%' },
              '100%': { backgroundPosition: '200% 0%' }
            }
          }} />
          
          <Typography variant="h5" component="h1" sx={{ 
            fontWeight: 700, 
            color: '#3f51b5',
            display: 'flex',
            alignItems: 'center',
            '& svg': {
              fontSize: '1.8rem',
              marginRight: '10px'
            }
          }}>
            <CalendarMonthIcon />
            Ders Programı
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              placeholder="Ders Arama ve Filtreleme"
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchText('')}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '30px',
                  backgroundColor: alpha('#fff', 0.9),
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(63, 81, 181, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.95),
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                    transform: 'translateY(-2px)'
                  }
                }
              }}
              sx={{ minWidth: { xs: '100%', sm: '260px' } }}
            />
            <FilterButton
              aria-controls={openFilterMenu ? 'subject-filter-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openFilterMenu ? 'true' : undefined}
              onClick={handleFilterMenuClick}
              endIcon={selectedSubjects.length > 0 ? <Badge color="primary" badgeContent={selectedSubjects.length}>
                <FilterListIcon />
              </Badge> : <FilterListIcon />}
            >
              {selectedSubjects.length > 0 ? 'Seçili Filtreler' : 'Konuları Filtrele'}
            </FilterButton>
          </Box>
        </Box>
        <StyledMenu
          id="subject-filter-menu"
          anchorEl={anchorEl}
          open={openFilterMenu}
          onClose={handleFilterMenuClose}
          MenuListProps={{
            'aria-labelledby': 'filter-button',
            sx: { maxHeight: 300 }
          }}
        >
          <Box sx={{ px: 2, pb: 1, mb: 1, borderBottom: '1px solid rgba(63, 81, 181, 0.1)' }}>
            <Typography variant="subtitle1" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
              Ders Konuları
            </Typography>
          </Box>
          {getUniqueSubjects().map((subject) => (
            <MenuItem
              key={subject}
              selected={selectedSubjects.includes(subject)}
              onClick={() => handleFilterToggle(subject)}
              sx={{
                borderRadius: '10px',
                margin: '3px 0',
                padding: '8px 10px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha('#3f51b5', 0.08),
                  transform: 'translateX(2px)',
                },
                '&.Mui-selected': {
                  backgroundColor: alpha('#3f51b5', 0.12),
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: alpha('#3f51b5', 0.16),
                  },
                },
              }}
            >
              <Checkbox 
                checked={selectedSubjects.includes(subject)} 
                color="primary" 
                size="small"
                sx={{ mr: 1, p: 0.5 }}
              />
              <Box 
                component="span" 
                sx={{ 
                  display: 'inline-block', 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: getSubjectColor(subject),
                  mr: 1,
                  boxShadow: `0 0 0 2px ${alpha(getSubjectColor(subject), 0.2)}`
                }} 
              />
              {subject}
            </MenuItem>
          ))}
          {selectedSubjects.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, pt: 1, borderTop: '1px solid rgba(63, 81, 181, 0.1)' }}>
              <Button 
                size="small" 
                color="primary" 
                startIcon={<FilterListOffIcon />}
                onClick={() => {
                  setSelectedSubjects([]);
                  handleFilterMenuClose();
                }}
                sx={{ textTransform: 'none' }}
              >
                Filtreleri Temizle
              </Button>
            </Box>
          )}
        </StyledMenu>
      </Box>
      
      {isLoading ? (
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          <LinearProgress sx={{ width: '50%', borderRadius: 1 }} />
        </Box>
      ) : (
        <Box sx={{ width: '100%', mt: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3, 
            justifyContent: 'center',
            width: '100%',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50px',
              left: '-50px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,154,139,0.2) 0%, transparent 70%)',
              zIndex: 0
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(199,206,234,0.2) 0%, transparent 70%)',
              zIndex: 0
            }
          }}>
            {daysOfWeek.map(day => (
              <Box 
                key={day}
                sx={{
                  width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)', lg: 'calc(14.28% - 16px)' },
                  minWidth: { xs: '100%', sm: '280px', md: '220px' },
                  display: 'flex',
                  flexDirection: 'column',
                  mb: 3,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(getSubjectColor(day) || '#3f51b5', 0.2)} 0%, transparent 70%)`,
                    zIndex: 0
                  }
                }}
              >
                <DayHeader isToday={false} dayIndex={daysOfWeek.indexOf(day)} sx={{ mb: 0 }}>
                  {day}
                </DayHeader>
                
                <Paper
                  sx={{
                    borderRadius: '0 0 16px 16px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderTop: 'none',
                    height: '100%',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Box sx={{ 
                    p: 2, 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflowY: 'auto',
                    maxHeight: '500px'
                  }}>
                    {filteredSchedule[day] && filteredSchedule[day].length > 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2,
                        height: '100%'
                      }}>
                        {filteredSchedule[day].map(classItem => (
                          <ClassCard 
                            key={classItem.id}
                            color={getSubjectColor(classItem.subject)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewClass(day, classItem);
                            }}
                            sx={{ 
                              cursor: 'pointer',
                              position: 'relative',
                              '&::after': classItem.location ? {
                                content: '""',
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#4caf50',
                                boxShadow: '0 0 0 2px rgba(76, 175, 80, 0.3)'
                              } : {}
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="600" sx={{ 
                                color: getSubjectColor(classItem.subject),
                                display: 'flex',
                                alignItems: 'center',
                                mb: 0.5
                              }}>
                                <SchoolIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
                                {classItem.subject || 'Belirtilmemiş'}
                              </Typography>
                              <Box>
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEdit(day, classItem);
                                  }}
                                  sx={{ mr: 0.5 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClass(day, classItem.id);
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                            {classItem.time && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  mb: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  fontSize: '0.85rem'
                                }}
                              >
                                <AccessTimeIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                                {classItem.time}
                              </Typography>
                            )}
                            {classItem.location && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  mb: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  fontSize: '0.85rem'
                                }}
                              >
                                <LocationOnIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                                {classItem.location}
                              </Typography>
                            )}
                            {classItem.teacher && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  mb: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  fontSize: '0.85rem'
                                }}
                              >
                                <PersonIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                                {classItem.teacher}
                              </Typography>
                            )}
                            {classItem.notes && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  fontSize: '0.85rem',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  mt: 1,
                                  pt: 1,
                                  borderTop: '1px dashed rgba(0,0,0,0.1)'
                                }}
                              >
                                <NotesIcon sx={{ mr: 0.5, fontSize: '0.9rem', verticalAlign: 'text-top' }} />
                                {classItem.notes}
                              </Typography>
                            )}
                          </ClassCard>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        minHeight: '300px'
                      }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            textAlign: 'center',
                            maxWidth: '80%',
                            mb: 2
                          }}
                        >
                          Bu gün için ders bulunmuyor
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <Button
                      variant="contained"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={() => handleAddClass(day)}
                      sx={{ 
                        borderRadius: '30px',
                        textTransform: 'none',
                        padding: '8px 20px',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        backgroundColor: getSubjectColor(day) || '#3f51b5',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        '&:hover': {
                          backgroundColor: getSubjectColor(day) || '#3f51b5',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Ders Ekle
                    </Button>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {/* Ders Ekleme/Düzenleme Diyaloğu */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            background: 'linear-gradient(to bottom, #ffffff, #f9fafc)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{
          p: 3,
          background: classDetails.subject ? `linear-gradient(45deg, ${alpha(getSubjectColor(classDetails.subject), 0.9)} 0%, ${alpha(getSubjectColor(classDetails.subject), 0.7)} 100%)` : 'linear-gradient(45deg, #3f51b5, #2196f3)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box 
            sx={{
              position: 'absolute',
              top: -15,
              right: -15,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              zIndex: 0
            }}
          />
          <Box 
            sx={{
              position: 'absolute',
              bottom: -20,
              left: -20,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              zIndex: 0
            }}
          />
          <Typography 
            variant="h6" 
            component="div" 
            fontWeight={600} 
            sx={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {classDetails.id ? (
              <>
                <EditIcon fontSize="small" /> Dersi Düzenle
              </>
            ) : (
              <>
                <AddCircleOutlineIcon fontSize="small" /> Yeni Ders Ekle
              </>
            )}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{
              opacity: 0.9,
              mt: 0.5,
              textTransform: 'capitalize',
              position: 'relative',
              zIndex: 1
            }}
          >
            {currentDay}
          </Typography>
        </Box>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth>
              <TextField
                label="Ders Adı"
                placeholder="Ör: Matematik"
                value={classDetails.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                variant="outlined"
                required
                sx={{ 
                  mb: 1,
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }
                }}
              />
            </FormControl>
            
            <FormControl fullWidth>
              <TextField
                label="Öğretmen"
                placeholder="Ör: Ahmet Hoca"
                value={classDetails.teacher}
                onChange={(e) => handleInputChange('teacher', e.target.value)}
                variant="outlined"
                sx={{ 
                  mb: 1,
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }
                }}
              />
            </FormControl>
            
            <FormControl fullWidth>
              <TextField
                label="Konu Url (YouTube veya diğer video bağlantıları)"
                placeholder="Ör: youtube.com/watch?v=..."
                value={classDetails.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                variant="outlined"
                sx={{ 
                  mb: 1,
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }
                }}
              />
            </FormControl>
            
            <FormControl fullWidth>
              <TextField
                label="Konu Adı / Notlar"
                placeholder="Ör: Türev - Tanım ve Formüller"
                value={classDetails.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                variant="outlined"
                multiline
                rows={3}
                sx={{ 
                  mb: 1,
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }
                }}
              />
            </FormControl>
          </Box>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              color: 'text.secondary',
              borderColor: 'rgba(0,0,0,0.12)',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderColor: 'rgba(0,0,0,0.2)',
              }
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleSaveClass}
            variant="contained"
            startIcon={classDetails.id ? <SaveIcon /> : <AddCircleIcon />}
            disabled={!classDetails.subject}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: `0 4px 12px ${alpha(getSubjectColor(classDetails.subject || 'default'), 0.3)}`,
              background: `linear-gradient(45deg, ${getSubjectColor(classDetails.subject || 'default')} 0%, ${alpha(getSubjectColor(classDetails.subject || 'default'), 0.85)} 100%)`,
              textTransform: 'none',
              fontWeight: 500,
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(getSubjectColor(classDetails.subject || 'default'), 0.4)}`,
                transform: 'translateY(-1px)'
              }
            }}
          >
            {classDetails.id ? 'Güncelle' : 'Ekle'}
          </Button>
        </Box>
      </Dialog>
      
      {/* Ders Detayları Görüntüleme Diyaloğu */}
      <Dialog 
        open={viewClassDialog} 
        onClose={handleCloseViewDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
            background: 'linear-gradient(to bottom, #ffffff, #f9fafc)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{
          p: 3,
          background: viewingClass ? `linear-gradient(45deg, ${alpha(getSubjectColor(viewingClass?.subject || 'default'), 0.9)} 0%, ${alpha(getSubjectColor(viewingClass?.subject || 'default'), 0.7)} 100%)` : 'linear-gradient(45deg, #3f51b5, #2196f3)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Dekoratif elementler */}
          <Box 
            sx={{
              position: 'absolute',
              top: -15,
              right: -15,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              zIndex: 0
            }}
          />
          <Box 
            sx={{
              position: 'absolute',
              bottom: -20,
              left: -20,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              zIndex: 0
            }}
          />
          
          {/* Başlık ve Kapat Butonu */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h5" 
              component="div" 
              fontWeight={700}
              sx={{
                textShadow: '0 2px 4px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <SchoolIcon fontSize="large" />
              {viewingClass?.subject || 'Ders Detayları'}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleCloseViewDialog}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  transform: 'rotate(90deg)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Gün Bilgisi */}
          <Typography 
            variant="body1" 
            sx={{
              opacity: 0.9,
              mt: 1,
              textTransform: 'capitalize',
              position: 'relative',
              zIndex: 1,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <CalendarMonthIcon fontSize="small" />
            {viewingDay}
          </Typography>
        </Box>
        
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2.5
          }}>
            {/* Öğretmen Bilgisi */}
            <Paper elevation={0} sx={{ 
              p: 2.5,
              borderRadius: '16px',
              backgroundColor: alpha('#f5f5f5', 0.5),
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                backgroundColor: alpha('#f5f5f5', 0.7),
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  backgroundColor: alpha(getSubjectColor(viewingClass?.subject || 'default'), 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <PersonIcon sx={{ color: getSubjectColor(viewingClass?.subject || 'default'), fontSize: '1.8rem' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Öğretmen
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {viewingClass?.teacher || 'Belirtilmemiş'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            {/* Video URL */}
            {viewingClass?.location && (
              <Paper elevation={0} sx={{ 
                p: 2.5,
                borderRadius: '16px',
                backgroundColor: alpha('#f5f5f5', 0.5),
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                cursor: viewingClass.location ? 'pointer' : 'default',
                '&:hover': viewingClass.location ? {
                  boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                  backgroundColor: alpha('#f0f7ff', 0.7),
                  transform: 'translateY(-2px)'
                } : {}
              }}
              onClick={() => viewingClass?.location && handleUrlClick(viewingClass.location)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: alpha('#f44336', 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <LocationOnIcon sx={{ color: '#f44336', fontSize: '1.8rem' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Video URL
                    </Typography>
                    <Typography 
                      variant="h6" 
                      fontWeight={600}
                      sx={{
                        color: viewingClass.location ? '#1976d2' : 'text.primary',
                        textDecoration: viewingClass.location ? 'none' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        '&:hover': viewingClass.location ? {
                          textDecoration: 'underline'
                        } : {}
                      }}
                    >
                      {viewingClass.location ? (
                        <>
                          {viewingClass.location.length > 40 
                            ? `${viewingClass.location.substring(0, 40)}...` 
                            : viewingClass.location}
                          <Box component="span" sx={{ color: '#1976d2', display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </Box>
                        </>
                      ) : (
                        'Belirtilmemiş'
                      )}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
            
            {/* Zaman Bilgisi */}
            {viewingClass?.time && (
              <Paper elevation={0} sx={{ 
                p: 2.5,
                borderRadius: '16px',
                backgroundColor: alpha('#f5f5f5', 0.5),
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                  backgroundColor: alpha('#f5f5f5', 0.7),
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: alpha('#4caf50', 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <AccessTimeIcon sx={{ color: '#4caf50', fontSize: '1.8rem' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Ders Saati
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {viewingClass.time}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
            
            {/* Notlar */}
            {viewingClass?.notes && (
              <Paper elevation={0} sx={{ 
                p: 2.5,
                borderRadius: '16px',
                backgroundColor: alpha('#f5f5f5', 0.5),
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                  backgroundColor: alpha('#f5f5f5', 0.7),
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: alpha('#ff9800', 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    mt: 0.5
                  }}>
                    <NotesIcon sx={{ color: '#ff9800', fontSize: '1.8rem' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Notlar
                    </Typography>
                    <Typography 
                      variant="body1" 
                      component="div" 
                      sx={{ 
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(0,0,0,0.07)',
                        whiteSpace: 'pre-line',
                        fontWeight: 500,
                        lineHeight: 1.6
                      }}
                    >
                      {viewingClass.notes}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        </DialogContent>
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            p: 3,
            borderTop: '1px solid rgba(0,0,0,0.05)',
            background: 'linear-gradient(to bottom, rgba(245,245,245,0.5), rgba(250,250,250,0.8))'
          }}
        >
          <Button 
            onClick={handleCloseViewDialog}
            sx={{ 
              borderRadius: '30px',
              px: 3,
              py: 1,
              color: 'rgba(0,0,0,0.6)',
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: 'rgba(0,0,0,0.03)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.06)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Kapat
          </Button>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {viewingClass?.location && (
              <Button 
                onClick={() => viewingClass?.location && handleUrlClick(viewingClass.location)}
                variant="contained"
                startIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>}
                sx={{ 
                  borderRadius: '30px',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Videoyu Aç
              </Button>
            )}
            <Button 
              onClick={() => {
                handleStartEdit();
                handleCloseViewDialog();
              }}
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{ 
                borderRadius: '30px',
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                borderColor: alpha('#3f51b5', 0.5),
                color: '#3f51b5',
                '&:hover': {
                  borderColor: '#3f51b5',
                  backgroundColor: alpha('#3f51b5', 0.05),
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Düzenle
            </Button>
            <Button 
              onClick={() => {
                handleDeleteClass(viewingDay, viewingClass.id);
                handleCloseViewDialog();
              }}
              variant="contained"
              startIcon={<DeleteIcon />}
              sx={{ 
                borderRadius: '30px',
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                bgcolor: '#f44336',
                '&:hover': {
                  bgcolor: '#d32f2f',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Sil
            </Button>
          </Box>
        </Box>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {isLoading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 1000 }}>
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};

export default DersProgrami;
