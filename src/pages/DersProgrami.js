import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogContent,
  MenuItem,
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

import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { scheduleService } from '../services/scheduleService';
import yksData from '../utils/yksData';






// Styled components for table elements

// Day styling is now handled directly in the component

// Artık kullanılmayan bileşen

const ClassCard = styled(Paper)(({ theme, color = '#3f51b5' }) => ({
  padding: '12px',
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${alpha(color, 0.25)} 0%, ${alpha(color, 0.15)} 50%, #1a0545 100%)`,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: `0 10px 30px ${alpha(color, 0.2)}, 0 6px 10px rgba(0,0,0,0.08)`,
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  border: `2px solid ${alpha(color, 0.3)}`,
  margin: '0',
  backdropFilter: 'blur(8px)',
  '&:hover': {
    boxShadow: `0 15px 35px ${alpha(color, 0.3)}, 0 8px 12px ${alpha(color, 0.15)}`,
    transform: 'translateY(-5px)',
    background: `linear-gradient(135deg, ${alpha(color, 0.35)} 0%, ${alpha(color, 0.25)} 50%, #1a0545 100%)`,
    borderColor: `${alpha(color, 0.5)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '6px',
    background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
    boxShadow: `0 3px 10px ${alpha(color, 0.4)}`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '5px',
    right: '10px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
    pointerEvents: 'none',
  }
}));

const FilterButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'white',
  color: '#1a0545',
  border: `1px solid ${alpha('#55b3d9', 0.3)}`,
  borderRadius: '25px',
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 6px 16px rgba(85, 179, 217, 0.15)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    backgroundColor: alpha('#55b3d9', 0.1),
    boxShadow: '0 8px 20px rgba(85, 179, 217, 0.25)',
    transform: 'translateY(-3px)',
    border: `1px solid ${alpha('#55b3d9', 0.5)}`,
  }
}));

// data-* özelliklerini kullanarak DOM'a geçirilen özel nitelikleri düzenliyoruz
const DayHeader = styled(Box)(
  ({ theme }) => {
    // Her gün için farklı renkler - tema ile uyumlu
    const dayColors = [
      '#FF6B8A', // Pazartesi - Pembe
      '#FFB347', // Salı - Turuncu  
      '#87CEEB', // Çarşamba - Açık mavi
      '#98FB98', // Perşembe - Açık yeşil
      '#DDA0DD', // Cuma - Lila
      '#F0E68C', // Cumartesi - Açık sarı
      '#FFA07A'  // Pazar - Somon
    ];
    
    return props => {
      // data-day-index özelliğini kullanarak gün rengini belirliyoruz
      const dayIndex = props['data-day-index'] !== undefined ? parseInt(props['data-day-index'], 10) : 0;
      const dayColor = dayColors[dayIndex % dayColors.length];
      
      return {
        padding: '24px 16px',
        borderRadius: '16px 16px 0 0',
        background: `linear-gradient(135deg, ${dayColor} 0%, ${alpha(dayColor, 0.7)} 100%)`,
        color: '#333',
        fontWeight: 700,
        fontSize: '1.4rem',
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
    };
  }
);

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '20px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
    padding: '16px',
    backgroundColor: alpha('#FFFFFF', 0.98),
    backdropFilter: 'blur(15px)',
    border: `1px solid ${alpha('#55b3d9', 0.2)}`,
    minWidth: '250px',
    maxWidth: '320px',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '4px',
      background: 'linear-gradient(90deg, #55b3d9, #3498db, #55b3d9)',
    }
  }
}));

const DersProgrami = () => {
  const [user] = useAuthState(auth);
  const [schedule, setSchedule] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDay, setCurrentDay] = useState('');
  const [classDetails, setClassDetails] = useState({
    examType: '', // TYT veya AYT
    subject: '',
    topic: '',
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
  
  // yksData'dan ders ve konu bilgilerini alıyoruz
  const getSubjectColor = (subject, examType = null) => {
    // Eğer examType belirtilmişse ve yksData'da varsa o rengi kullan
    if (examType && yksData[examType] && yksData[examType][subject]) {
      return yksData[examType][subject].color;
    }
    
    // examType belirtilmemişse veya bulunamazsa, her iki sınav türünde de ara
    for (const type of ['TYT', 'AYT']) {
      if (yksData[type] && yksData[type][subject]) {
        return yksData[type][subject].color;
      }
    }
    
    // Hiçbir yerde bulunamazsa varsayılan renk
    return '#2196F3';
  };

  const getSubjectTopics = (subject, examType) => {
    if (examType && yksData[examType] && yksData[examType][subject]) {
      return yksData[examType][subject].topics;
    }
    return [];
  };

  // Konu adının uzunluğuna göre kart boyutunu hesapla
  const getCardWidth = (topic) => {
    const length = topic.length;
    if (length <= 10) return '160px';        // Çok kısa konular
    if (length <= 20) return '200px';        // Kısa konular
    if (length <= 35) return '260px';        // Orta konular  
    if (length <= 50) return '320px';        // Uzun konular
    return '380px';                          // Çok uzun konular
  };
  
  const daysOfWeek = useMemo(() => ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'], []);



  // Bildirim gösterme
  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Ders detaylarını görüntüleme fonksiyonu
  const handleViewClass = (day, classItem) => {
    setViewingDay(day);
    setViewingClass(classItem);
    setViewClassDialog(true);
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
  }, [user, daysOfWeek]);

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
      examType: '',
      subject: '',
      topic: '',
      teacher: '',
      location: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleSaveClass = async () => {
    if (!classDetails.examType) {
      showNotification('Lütfen bir sınav türü seçin (TYT veya AYT).', 'warning');
      return;
    }
    
    if (!classDetails.subject) {
      showNotification('Lütfen bir ders seçin.', 'warning');
      return;
    }
    
    if (!classDetails.topic) {
      showNotification('Lütfen bir konu seçin.', 'warning');
      return;
    }

    try {
      const userId = user ? user.uid : 'anonymous';
      let updatedSchedule;
      let successMessage;
      
      if (classDetails.id) {
        // Düzenle modu - mevcut dersi güncelle
        updatedSchedule = scheduleService.updateClass(schedule, currentDay, classDetails);
        successMessage = 'Ders başarıyla güncellendi.';
      } else {
        // Yeni ders ekleme modu
        updatedSchedule = scheduleService.addClass(schedule, currentDay, classDetails);
        successMessage = 'Ders başarıyla eklendi.';
      }
      
      setSchedule(updatedSchedule);
      setOpenDialog(false);
      
      // Düzenle modundan çıkış yap
      setClassDetails({
        id: null,
        examType: '',
        subject: '',
        topic: '',
        teacher: '',
        location: '',
        notes: '',
        time: ''
      });
      
      // Firestore ve localStorage'a kaydet
      if (user) {
        const success = await scheduleService.saveSchedule(updatedSchedule, userId);
        if (success) {
          showNotification(successMessage);
        }
      } else {
        // Anonim kullanıcı için sadece localStorage'a kaydet
        localStorage.setItem('weeklySchedule_anonymous', JSON.stringify(updatedSchedule));
        showNotification(successMessage);
      }
    } catch (error) {
      console.error('Ders kaydedilirken hata oluştu:', error);
      showNotification('Ders kaydedilirken bir hata oluştu.', 'error');
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
        background: '#1a0545',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      <Box sx={{ p: 3, pt: 5, pb: 4, width: '100%', position: 'relative', zIndex: 2 }}>
        <        Typography 
          variant="h3" 
          sx={{ 
            mb: 4, 
            mt: 2, 
            fontWeight: 800, 
            color: 'white',
            fontFamily: 'Poppins, Montserrat, sans-serif',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            pl: 1,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '40%',
              height: '4px',
              background: 'linear-gradient(90deg, #55b3d9, #3498db)',
              bottom: -12,
              left: 0,
              borderRadius: '2px',
              boxShadow: '0 2px 8px rgba(85, 179, 217, 0.4)'
            }
          }}
        >
          <MenuBookIcon sx={{ mr: 2, fontSize: 40, color: '#55b3d9' }} />
          Ders Programı
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
          backgroundColor: '#1a0545',
          padding: '24px 28px',
          borderRadius: '20px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.1), 0 8px 15px rgba(0,0,0,0.05)',
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(15px)',
        }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #55b3d9, #3498db, #55b3d9)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear', '@keyframes shimmer': { '0%': { backgroundPosition: '0% 0%' }, '100%': { backgroundPosition: '200% 0%' } } }} />
          
          <Typography variant="h5" component="h1" sx={{ 
            fontWeight: 700, 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            '& svg': {
              fontSize: '2rem',
              marginRight: '12px',
              color: '#55b3d9'
            }
          }}>
            <CalendarMonthIcon />
            Haftalık Program
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
                    borderRadius: '25px',
                    backgroundColor: 'white',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(85, 179, 217, 0.2)',
                    transition: 'all 0.3s ease',
                    color: '#1a0545',
                    '& input': {
                      color: '#1a0545 !important'
                    },
                    '&:hover': {
                      backgroundColor: 'white',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                      transform: 'translateY(-3px)',
                      border: '1px solid rgba(85, 179, 217, 0.3)'
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
                      <Box sx={{ px: 2, pb: 1, mb: 1, borderBottom: '1px solid rgba(85, 179, 217, 0.2)' }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#1a0545' }}>
              Ders Konuları
            </Typography>
          </Box>
          {getUniqueSubjects().map((subject) => (
            <MenuItem
              key={subject}
              selected={selectedSubjects.includes(subject)}
              onClick={() => handleFilterToggle(subject)}
              sx={{
                borderRadius: '12px',
                margin: '4px 0',
                padding: '10px 12px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: alpha('#55b3d9', 0.1),
                  transform: 'translateX(4px)',
                },
                '&.Mui-selected': {
                  backgroundColor: alpha('#55b3d9', 0.15),
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: alpha('#55b3d9', 0.2),
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
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, pt: 1, borderTop: '1px solid rgba(85, 179, 217, 0.2)' }}>
                              <Button 
                  size="small" 
                  startIcon={<FilterListOffIcon />}
                  onClick={() => {
                    setSelectedSubjects([]);
                    handleFilterMenuClose();
                  }}
                  sx={{ 
                    textTransform: 'none',
                    color: '#1a0545',
                    '&:hover': {
                      backgroundColor: alpha('#55b3d9', 0.1)
                    }
                  }}
                >
                Filtreleri Temizle
              </Button>
            </Box>
          )}
        </StyledMenu>
      </Box>
      
      {isLoading ? (
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          <LinearProgress 
            sx={{ 
              width: '60%', 
              borderRadius: '10px', 
              height: '8px',
              backgroundColor: alpha('#55b3d9', 0.2),
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(45deg, #55b3d9, #3498db)',
                borderRadius: '10px'
              }
            }} 
          />
        </Box>
      ) : (
        <Box sx={{ width: '100%', mt: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row',
            flexWrap: 'nowrap',
            gap: 2, 
            justifyContent: 'space-between',
            width: '100%',
            position: 'relative',
            overflowX: 'auto',
            pb: 2, // Scroll çubuğu için biraz padding
            '&::-webkit-scrollbar': {
              height: '10px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(85, 179, 217, 0.1)',
              borderRadius: '15px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(45deg, #55b3d9, #3498db)',
              borderRadius: '15px',
              '&:hover': {
                background: 'linear-gradient(45deg, #4a9bc9, #2980b9)',
              },
            },
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
                  flex: '1 0 auto',
                  width: { xs: '85%', sm: '250px', md: '200px', lg: '180px' },
                  minWidth: { xs: '85%', sm: '250px', md: '200px', lg: '180px' },
                  display: 'flex',
                  flexDirection: 'column',
                  mb: 1,
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
                    background: `radial-gradient(circle, ${alpha('#3f51b5', 0.2)} 0%, transparent 70%)`,
                    zIndex: 0
                  }
                }}
              >
                <DayHeader data-is-today={false} data-day-index={daysOfWeek.indexOf(day)} sx={{ mb: 0 }}>
                  {day}
                </DayHeader>
                
                <                Paper
                  sx={{
                    borderRadius: '0 0 20px 20px',
                    overflow: 'hidden',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderTop: 'none',
                    height: '100%',
                    minHeight: '450px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#1a0545',
                    backdropFilter: 'blur(15px)',
                  }}
                >
                  <Box sx={{ 
                    p: 2, 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflowY: 'auto',
                    maxHeight: '600px',
                    '&::-webkit-scrollbar': {
                      width: '8px'
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'linear-gradient(135deg, #55b3d9 0%, #3498db 100%)',
                      borderRadius: '10px',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4a9bc9 0%, #2980b9 100%)'
                      }
                    }
                  }}>
                    {filteredSchedule[day] && filteredSchedule[day].length > 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 1,
                        height: '100%'
                      }}>
                        {filteredSchedule[day].map(classItem => (
                          <ClassCard 
                            key={classItem.id}
                            color={getSubjectColor(classItem.subject, classItem.examType)}
                            onClick={() => handleViewClass(day, classItem)}
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
                            <Box>
                              <Typography variant="subtitle1" fontWeight="600" sx={{ 
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                mb: 0.5,
                                fontSize: '1rem'
                              }}>
                                <SchoolIcon sx={{ mr: 1, fontSize: '1rem', color: getSubjectColor(classItem.subject, classItem.examType) }} />
                                {classItem.examType ? `${classItem.examType} - ${classItem.subject}` : classItem.subject || 'Belirtilmemiş'}
                              </Typography>
                              {classItem.topic && (
                                <Typography variant="body2" sx={{ 
                                  color: alpha(getSubjectColor(classItem.subject, classItem.examType), 0.9),
                                  fontSize: '0.85rem',
                                  fontWeight: 500,
                                  display: 'flex',
                                  alignItems: 'center',
                                  ml: 2.5
                                }}>
                                  <Box sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    backgroundColor: getSubjectColor(classItem.subject, classItem.examType),
                                    mr: 1
                                  }} />
                                  {classItem.topic}
                                </Typography>
                              )}
                            </Box>
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
                        minHeight: '300px',
                        position: 'relative'
                      }}>
                        <Box sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          backgroundColor: alpha('#55b3d9', 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}>
                          <SchoolIcon sx={{ fontSize: 30, color: '#55b3d9' }} />
                        </Box>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            textAlign: 'center',
                            maxWidth: '80%',
                            mb: 1,
                            fontWeight: 600,
                            color: 'white'
                          }}
                        >
                          Bu gün için ders yok
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            textAlign: 'center',
                            maxWidth: '80%',
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.8)'
                          }}
                        >
                          Aşağıdaki butona tıklayarak ders ekleyebilirsiniz
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    background: '#1a0545',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <Button
                      variant="contained"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={() => handleAddClass(day)}
                      sx={{ 
                        borderRadius: '25px',
                        textTransform: 'none',
                        padding: '10px 24px',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        background: `linear-gradient(45deg, #55b3d9 0%, #3498db 100%)`,
                        boxShadow: '0 6px 16px rgba(85, 179, 217, 0.3)',
                        color: 'white',
                        '&:hover': {
                          background: `linear-gradient(45deg, #4a9bc9 0%, #2980b9 100%)`,
                          boxShadow: '0 8px 20px rgba(85, 179, 217, 0.4)',
                          transform: 'translateY(-3px)'
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
        maxWidth="lg"
        PaperProps={{
          sx: {
            borderRadius: '32px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 16px 40px rgba(0,0,0,0.15)',
            background: 'linear-gradient(145deg, rgba(26, 5, 69, 0.95) 0%, rgba(26, 5, 69, 0.98) 100%)',
            backdropFilter: 'blur(50px)',
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.15)',
            minHeight: '600px'
          }
        }}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(0,0,0,0.7)'
          }
        }}
      >
        <Box sx={{
          p: 4,
          background: classDetails.subject ? `linear-gradient(135deg, ${getSubjectColor(classDetails.subject, classDetails.examType)} 0%, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.8)} 100%)` : 'linear-gradient(135deg, #55b3d9 0%, #3498db 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box 
            sx={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              zIndex: 0
            }}
          />
          <Box 
            sx={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
              zIndex: 0
            }}
          />
          <Box 
            sx={{
              position: 'absolute',
              top: '50%',
              right: -50,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              zIndex: 0
            }}
          />
          <Typography 
            variant="h5" 
            component="div" 
            fontWeight={700} 
            sx={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {classDetails.id ? (
              <>
                <EditIcon fontSize="medium" /> Dersi Düzenle
              </>
            ) : (
              <>
                <AddCircleOutlineIcon fontSize="medium" /> Yeni Ders Ekle
              </>
            )}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{
              opacity: 0.95,
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
            {currentDay}
          </Typography>
        </Box>
        <DialogContent sx={{ px: 4, py: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1.3rem' }}>
                <SchoolIcon fontSize="medium" sx={{ color: '#55b3d9' }} />
                Ders Seçimi *
              </Typography>
              
              {/* Sınav Türü Seçimi - Küçük Butonlar */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center' }}>
                {/* TYT Butonu */}
                <Box 
                  onClick={() => {
                    setClassDetails(prev => ({
                      ...prev,
                      examType: 'TYT',
                      subject: '',
                      topic: ''
                    }));
                  }}
                  sx={{ 
                    p: 2, 
                    borderRadius: '16px',
                    background: classDetails.examType === 'TYT' ? 
                      'linear-gradient(145deg, rgba(33, 150, 243, 0.3) 0%, rgba(33, 150, 243, 0.2) 100%)' :
                      'linear-gradient(145deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
                    backdropFilter: 'blur(15px)',
                    border: classDetails.examType === 'TYT' ? 
                      '2px solid rgba(33, 150, 243, 0.6)' : 
                      '1px solid rgba(33, 150, 243, 0.3)',
                    boxShadow: classDetails.examType === 'TYT' ? 
                      '0 8px 25px rgba(33, 150, 243, 0.3)' :
                      '0 4px 15px rgba(33, 150, 243, 0.1)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    cursor: 'pointer',
                    minWidth: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.05)',
                      boxShadow: '0 12px 35px rgba(33, 150, 243, 0.4)',
                      background: 'linear-gradient(145deg, rgba(33, 150, 243, 0.25) 0%, rgba(33, 150, 243, 0.15) 100%)'
                    }
                  }}
                >
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                  }}>
                    📝
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#ffffff', 
                      lineHeight: 1
                    }}>
                      TYT
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.7rem'
                    }}>
                      Temel Test
                    </Typography>
                  </Box>
                  {classDetails.examType === 'TYT' && (
                    <Box sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      animation: 'pulse 2s infinite'
                    }}>
                      ✓
                    </Box>
                  )}
                </Box>

                {/* AYT Butonu */}
                <Box 
                  onClick={() => {
                    setClassDetails(prev => ({
                      ...prev,
                      examType: 'AYT',
                      subject: '',
                      topic: ''
                    }));
                  }}
                  sx={{ 
                    p: 2, 
                    borderRadius: '16px',
                    background: classDetails.examType === 'AYT' ? 
                      'linear-gradient(145deg, rgba(156, 39, 176, 0.3) 0%, rgba(156, 39, 176, 0.2) 100%)' :
                      'linear-gradient(145deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%)',
                    backdropFilter: 'blur(15px)',
                    border: classDetails.examType === 'AYT' ? 
                      '2px solid rgba(156, 39, 176, 0.6)' : 
                      '1px solid rgba(156, 39, 176, 0.3)',
                    boxShadow: classDetails.examType === 'AYT' ? 
                      '0 8px 25px rgba(156, 39, 176, 0.3)' :
                      '0 4px 15px rgba(156, 39, 176, 0.1)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    cursor: 'pointer',
                    minWidth: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.05)',
                      boxShadow: '0 12px 35px rgba(156, 39, 176, 0.4)',
                      background: 'linear-gradient(145deg, rgba(156, 39, 176, 0.25) 0%, rgba(156, 39, 176, 0.15) 100%)'
                    }
                  }}
                >
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
                  }}>
                    🎯
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#ffffff', 
                      lineHeight: 1
                    }}>
                      AYT
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.7rem'
                    }}>
                      Alan Testi
                    </Typography>
                  </Box>
                  {classDetails.examType === 'AYT' && (
                    <Box sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      animation: 'pulse 2s infinite'
                    }}>
                      ✓
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Ders Seçimi - Animasyonlu */}
              {classDetails.examType && (
                <Box sx={{ 
                  mb: 4,
                  animation: 'slideInUp 0.6s ease-out',
                  '@keyframes slideInUp': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(30px)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  }
                }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1.1rem' }}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: classDetails.examType === 'TYT' ? 
                        'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' :
                        'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      animation: 'bounce 2s infinite'
                    }}>
                      📚
                    </Box>
                    {classDetails.examType} Dersleri Seçin
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: 2,
                    '@keyframes bounce': {
                      '0%, 20%, 50%, 80%, 100%': {
                        transform: 'translateY(0)'
                      },
                      '40%': {
                        transform: 'translateY(-5px)'
                      },
                      '60%': {
                        transform: 'translateY(-3px)'
                      }
                    }
                  }}>
                    {Object.keys(yksData[classDetails.examType] || {}).map((subject, index) => (
                      <Box
                        key={`${classDetails.examType}-${subject}`}
                        onClick={() => {
                          setClassDetails(prev => ({
                            ...prev,
                            subject: subject,
                            topic: '' // Konu seçimini sıfırla
                          }));
                        }}
                        sx={{
                          p: 2.5,
                          borderRadius: '16px',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                          animation: `slideInRight 0.4s ease-out ${index * 0.1}s both`,
                          '@keyframes slideInRight': {
                            '0%': {
                              opacity: 0,
                              transform: 'translateX(50px)'
                            },
                            '100%': {
                              opacity: 1,
                              transform: 'translateX(0)'
                            }
                          },
                          ...(classDetails.subject === subject ? {
                            background: `linear-gradient(135deg, ${getSubjectColor(subject, classDetails.examType)} 0%, ${alpha(getSubjectColor(subject, classDetails.examType), 0.8)} 100%)`,
                            color: '#ffffff',
                            boxShadow: `0 8px 25px ${alpha(getSubjectColor(subject, classDetails.examType), 0.4)}`,
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            transform: 'scale(1.05)',
                            '&:hover': {
                              background: `linear-gradient(135deg, ${alpha(getSubjectColor(subject, classDetails.examType), 0.9)} 0%, ${getSubjectColor(subject, classDetails.examType)} 100%)`,
                              transform: 'scale(1.05)',
                              boxShadow: `0 8px 24px ${alpha(getSubjectColor(subject, classDetails.examType), 0.5)}`
                            }
                          } : {
                            color: 'rgba(255, 255, 255, 0.8)',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            '&:hover': {
                              background: `${alpha(getSubjectColor(subject, classDetails.examType), 0.15)}`,
                              borderColor: `${alpha(getSubjectColor(subject, classDetails.examType), 0.5)}`,
                              color: '#ffffff',
                              transform: 'scale(1.02)'
                            }
                          })
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '6px',
                            background: `linear-gradient(135deg, ${getSubjectColor(subject, classDetails.examType)} 0%, ${alpha(getSubjectColor(subject, classDetails.examType), 0.8)} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem'
                          }}>
                            📖
                          </Box>
                          <Typography sx={{ fontWeight: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
                            {subject}
                          </Typography>
                          {classDetails.subject === subject && (
                            <Box sx={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              ml: 'auto'
                            }}>
                              ✓
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              
              {classDetails.examType && classDetails.subject && (
                <Box sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.08) 100%)',
                  border: '2px solid rgba(76, 175, 80, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.1)'
                }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem'
                  }}>
                    ✓
                  </Box>
                  <Typography sx={{ color: '#ffffff', fontWeight: 600, fontSize: '1.1rem' }}>
                    Seçilen: <span style={{ color: '#4CAF50', fontWeight: 700 }}>{classDetails.examType} - {classDetails.subject}</span>
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Konu Seçimi - Animasyonlu */}
            {classDetails.examType && classDetails.subject && getSubjectTopics(classDetails.subject, classDetails.examType).length > 0 && (
              <Box sx={{ 
                position: 'relative',
                animation: 'slideInUp 0.6s ease-out 0.3s both',
                '@keyframes slideInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(30px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
              }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1.2rem' }}>
                  <Box sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${getSubjectColor(classDetails.subject, classDetails.examType)} 0%, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.8)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    animation: 'pulse 2s infinite'
                  }}>
                    🎯
                  </Box>
                  {classDetails.subject} Konularını Seçin
                </Typography>
                
                <Box sx={{ 
                  p: 4, 
                  borderRadius: '24px',
                  background: `linear-gradient(145deg, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.15)} 0%, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.08)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.2)}`,
                  boxShadow: `0 12px 40px ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.15)}`,
                  transition: 'all 0.3s ease',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: `linear-gradient(135deg, ${getSubjectColor(classDetails.subject, classDetails.examType)} 0%, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.8)} 100%)`,
                    borderRadius: '10px',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.9)} 0%, ${getSubjectColor(classDetails.subject, classDetails.examType)} 100%)`
                    }
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'flex-start',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.05)' },
                      '100%': { transform: 'scale(1)' }
                    }
                  }}>
                    {getSubjectTopics(classDetails.subject, classDetails.examType).map((topic, index) => (
                      <Box
                        key={topic}
                        onClick={() => {
                          setClassDetails(prev => ({
                            ...prev,
                            topic: topic
                          }));
                        }}
                        sx={{
                          p: topic.length > 40 ? 3 : topic.length > 25 ? 2.5 : 2,
                          borderRadius: '16px',
                          background: classDetails.topic === topic ? 
                            `linear-gradient(135deg, ${getSubjectColor(classDetails.subject, classDetails.examType)} 0%, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.8)} 100%)` :
                            'rgba(255, 255, 255, 0.05)',
                          border: classDetails.topic === topic ? 
                            '2px solid rgba(255, 255, 255, 0.3)' : 
                            '2px solid rgba(255, 255, 255, 0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`,
                          width: getCardWidth(topic),
                          minHeight: 'fit-content',
                          display: 'flex',
                          flexDirection: 'column',
                          '@keyframes slideInUp': {
                            '0%': {
                              opacity: 0,
                              transform: 'translateY(20px)'
                            },
                            '100%': {
                              opacity: 1,
                              transform: 'translateY(0)'
                            }
                          },
                          '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: classDetails.topic === topic ? '0%' : '-100%',
                            width: '100%',
                            height: '2px',
                            background: `linear-gradient(90deg, transparent, ${getSubjectColor(classDetails.subject, classDetails.examType)}, transparent)`,
                            transition: 'left 0.6s ease'
                          },
                          '&:hover': {
                            background: classDetails.topic === topic ? 
                              `linear-gradient(135deg, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.9)} 0%, ${getSubjectColor(classDetails.subject, classDetails.examType)} 100%)` :
                              `${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.15)}`,
                            borderColor: `${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.5)}`,
                            transform: 'translateY(-2px) scale(1.02)',
                            boxShadow: `0 8px 25px ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.2)}`,
                            '&:before': {
                              left: '100%'
                            }
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{
                            width: topic.length > 40 ? 32 : 28,
                            height: topic.length > 40 ? 32 : 28,
                            borderRadius: '8px',
                            background: classDetails.topic === topic ? 
                              'rgba(255, 255, 255, 0.2)' :
                              `linear-gradient(135deg, ${getSubjectColor(classDetails.subject, classDetails.examType)} 0%, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.8)} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            boxShadow: classDetails.topic === topic ? 
                              'inset 0 2px 4px rgba(0,0,0,0.2)' :
                              '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
★
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ 
                              color: '#ffffff', 
                              fontWeight: classDetails.topic === topic ? 700 : 600,
                              fontSize: topic.length > 50 ? '0.85rem' : topic.length > 30 ? '0.9rem' : '1rem',
                              textShadow: classDetails.topic === topic ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                              lineHeight: 1.4,
                              wordBreak: 'break-word',
                              hyphens: 'auto'
                            }}>
                              {topic}
                            </Typography>
                          </Box>
                          {classDetails.topic === topic && (
                            <Box sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem'
                            }}>
                              ✓
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
            
            {/* Seçilen Ders ve Konu Bilgileri */}
            {classDetails.examType && classDetails.subject && classDetails.topic && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 4 }}>
                {/* Ders Adı */}
                <Box sx={{ position: 'relative' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1.1rem' }}>
                    <SchoolIcon fontSize="medium" sx={{ color: getSubjectColor(classDetails.subject, classDetails.examType) }} />
                    Ders Adı
                  </Typography>
                  <Box sx={{
                    p: 3,
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.15)} 0%, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.08)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    border: `2px solid ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.3)}`,
                    boxShadow: `0 8px 25px ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.1)}`
                  }}>
                    <Typography sx={{ 
                      color: '#ffffff', 
                      fontSize: '1.1rem', 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Box sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        background: `linear-gradient(135deg, ${getSubjectColor(classDetails.subject, classDetails.examType)} 0%, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.8)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem'
                      }}>
                        📚
                      </Box>
                      {classDetails.examType} - {classDetails.subject}
                    </Typography>
                  </Box>
                </Box>

                {/* Konu */}
                <Box sx={{ position: 'relative' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1.1rem' }}>
                    <Box sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '6px',
                      background: `linear-gradient(135deg, ${getSubjectColor(classDetails.subject, classDetails.examType)} 0%, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.8)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem'
                    }}>
                      🎯
                    </Box>
                    Konu
                  </Typography>
                  <Box sx={{
                    p: 3,
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.15)} 0%, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.08)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    border: `2px solid ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.3)}`,
                    boxShadow: `0 8px 25px ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.1)}`
                  }}>
                    <Typography sx={{ 
                      color: '#ffffff', 
                      fontSize: '1.1rem', 
                      fontWeight: 600
                    }}>
                      {classDetails.topic}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            <Box sx={{ position: 'relative' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1.1rem' }}>
                <LocationOnIcon fontSize="medium" sx={{ color: '#55b3d9' }} />
                Video URL (YouTube veya diğer platformlar)
              </Typography>
              <TextField
                placeholder="Örn: youtube.com/watch?v=... veya zoom link..."
                value={classDetails.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                variant="outlined"
                fullWidth
                sx={{ 
                  '& .MuiInputBase-root': {
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(85, 179, 217, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'rgba(85, 179, 217, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)'
                    },
                    '&.Mui-focused': {
                      borderColor: '#55b3d9',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 0 20px rgba(85, 179, 217, 0.3)'
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  },
                  '& .MuiInputBase-input': {
                    color: 'white !important',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    padding: '16px 20px',
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.6)',
                      opacity: 1
                    }
                  }
                }}
              />
            </Box>
            
            {/* Notlar Kısmı - En Alta Taşındı */}
            <Box sx={{ position: 'relative' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1.2rem' }}>
                <NotesIcon fontSize="medium" sx={{ color: '#55b3d9' }} />
                Ek Notlar (Opsiyonel)
              </Typography>
              <Box sx={{
                p: 3,
                borderRadius: '20px',
                background: 'linear-gradient(145deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.08) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255, 193, 7, 0.2)',
                boxShadow: '0 8px 32px rgba(255, 193, 7, 0.1)'
              }}>
                <TextField
                  placeholder="Buraya dersinizle ilgili ek notlarınızı yazabilirsiniz... (Örn: Özel dikkat edilecek konular, tekrar edilecek bölümler, ödev detayları vb.)"
                  value={classDetails.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ 
                    '& .MuiInputBase-root': {
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 193, 7, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'rgba(255, 193, 7, 0.5)',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)'
                      },
                      '&.Mui-focused': {
                        borderColor: '#FFC107',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 20px rgba(255, 193, 7, 0.3)'
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '& .MuiInputBase-input': {
                      color: 'white !important',
                      fontSize: '1rem',
                      fontWeight: 500,
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        opacity: 1
                      }
                    },
                    '& textarea': {
                      color: 'white !important',
                      padding: '16px 20px !important'
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 4, 
          background: 'linear-gradient(135deg, rgba(26, 5, 69, 0.8) 0%, rgba(26, 5, 69, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: '2px solid rgba(255,255,255,0.1)' 
        }}>
          <Typography variant="body1" sx={{ 
            fontStyle: 'italic', 
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
            }} />
            * Zorunlu alanlar
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              variant="outlined"
              startIcon={<CloseIcon />}
              sx={{ 
                borderRadius: '20px',
                px: 5,
                py: 2,
                color: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              İptal
            </Button>
            <Button 
              onClick={handleSaveClass}
              variant="contained"
              startIcon={classDetails.id ? <SaveIcon /> : <AddCircleIcon />}
              disabled={!classDetails.examType || !classDetails.subject || !classDetails.topic}
              sx={{ 
                borderRadius: '20px',
                px: 6,
                py: 2,
                boxShadow: (classDetails.examType && classDetails.subject) ? `0 8px 32px ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.4)}` : '0 8px 32px rgba(85, 179, 217, 0.4)',
                background: (classDetails.examType && classDetails.subject) ? 
                  `linear-gradient(135deg, ${getSubjectColor(classDetails.subject, classDetails.examType)} 0%, ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.8)} 100%)` :
                  'linear-gradient(135deg, #55b3d9 0%, #3498db 100%)',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: '#ffffff',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  transition: 'left 0.6s ease'
                },
                '&:hover': {
                  boxShadow: (classDetails.examType && classDetails.subject) ? 
                    `0 16px 48px ${alpha(getSubjectColor(classDetails.subject, classDetails.examType), 0.5)}` : 
                    '0 16px 48px rgba(85, 179, 217, 0.5)',
                  transform: 'translateY(-3px) scale(1.02)',
                  background: (classDetails.examType && classDetails.subject) ? 
                    `linear-gradient(135deg, ${getSubjectColor(classDetails.subject, classDetails.examType)} 0%, ${getSubjectColor(classDetails.subject, classDetails.examType)} 100%)` :
                    'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                  '&:before': {
                    left: '100%'
                  }
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.4)',
                  boxShadow: 'none',
                  border: '2px solid rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              {classDetails.id ? 'Dersi Güncelle' : 'Dersi Ekle'}
            </Button>
          </Box>
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
            borderRadius: '24px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.25), 0 16px 40px rgba(0,0,0,0.15)',
            background: 'linear-gradient(145deg, rgba(26, 5, 69, 0.95) 0%, rgba(26, 5, 69, 0.98) 100%)',
            backdropFilter: 'blur(50px)',
            border: '2px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{
          p: 4,
          background: viewingClass ? `linear-gradient(135deg, ${getSubjectColor(viewingClass?.subject || 'default', viewingClass?.examType)} 0%, ${alpha(getSubjectColor(viewingClass?.subject || 'default', viewingClass?.examType), 0.8)} 100%)` : 'linear-gradient(135deg, #55b3d9 0%, #3498db 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '24px 24px 0 0'
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography 
                variant="h4" 
                component="div" 
                fontWeight={700}
                sx={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                }}>
                  <SchoolIcon sx={{ fontSize: '2rem' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {viewingClass?.examType ? `${viewingClass.examType} - ${viewingClass.subject}` : viewingClass?.subject || 'Ders Detayları'}
                  </Typography>
                  {viewingClass?.topic && (
                    <Typography variant="h6" sx={{ 
                      opacity: 0.9, 
                      fontWeight: 500,
                      mt: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.8)'
                      }} />
                      {viewingClass.topic}
                    </Typography>
                  )}
                </Box>
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={handleCloseViewDialog}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                width: 48,
                height: 48,
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  transform: 'scale(1.1) rotate(90deg)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}
            >
              <CloseIcon sx={{ fontSize: '1.5rem' }} />
            </IconButton>
          </Box>
          
          {/* Gün Bilgisi */}
          <Box sx={{ 
            mt: 3, 
            position: 'relative', 
            zIndex: 1,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Box sx={{
              px: 3,
              py: 1.5,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <CalendarMonthIcon sx={{ fontSize: '1.2rem' }} />
              <Typography 
                variant="h6" 
                sx={{
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  letterSpacing: '0.5px'
                }}
              >
                {viewingDay}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <DialogContent sx={{ px: 3, py: 3, bgcolor: '#1a0545' }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2.5
          }}>

            {/* Video URL */}
            {viewingClass?.location && (
              <Paper elevation={0} sx={{ 
                p: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(85, 179, 217, 0.15) 0%, rgba(85, 179, 217, 0.08) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(85, 179, 217, 0.3)',
                boxShadow: '0 8px 25px rgba(85, 179, 217, 0.15)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #55b3d9, transparent)',
                  transition: 'left 0.6s ease'
                },
                '&:hover': {
                  boxShadow: '0 12px 35px rgba(85, 179, 217, 0.25)',
                  transform: 'translateY(-4px) scale(1.02)',
                  borderColor: 'rgba(85, 179, 217, 0.5)',
                  background: 'linear-gradient(135deg, rgba(85, 179, 217, 0.2) 0%, rgba(85, 179, 217, 0.12) 100%)',
                  '&:before': {
                    left: '100%'
                  }
                }
              }}
              onClick={() => viewingClass?.location && handleUrlClick(viewingClass.location)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #55b3d9 0%, #3498db 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 3,
                    boxShadow: '0 8px 20px rgba(85, 179, 217, 0.3)',
                    position: 'relative',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      inset: '2px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                      zIndex: 0
                    }
                  }}>
                    <VideoLibraryIcon sx={{ color: 'white', fontSize: '2rem', position: 'relative', zIndex: 1 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      mb: 1,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      📺 Video URL
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{
                        color: '#55b3d9',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {viewingClass.location.length > 35 
                        ? `${viewingClass.location.substring(0, 35)}...` 
                        : viewingClass.location}
                      <Box component="span" sx={{ 
                        color: '#55b3d9', 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        transition: 'transform 0.2s ease',
                        '&:hover': { transform: 'translateX(2px)' }
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </Box>
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
                backgroundColor: '#1a0545',
                border: '1px solid rgba(85, 179, 217, 0.2)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(85, 179, 217, 0.2)',
                  transform: 'translateY(-2px)',
                  borderColor: 'rgba(85, 179, 217, 0.4)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(85, 179, 217, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <AccessTimeIcon sx={{ color: '#55b3d9', fontSize: '1.8rem' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      mb: 0.5,
                      fontWeight: 500,
                      fontSize: '0.8rem'
                    }}>
                      Ders Saati
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600,
                      color: 'white',
                      fontSize: '1.1rem'
                    }}>
                      {viewingClass.time}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
            
            {/* Notlar */}
            {viewingClass?.notes && (
              <Paper elevation={0} sx={{ 
                p: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.08) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255, 193, 7, 0.3)',
                boxShadow: '0 8px 25px rgba(255, 193, 7, 0.15)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #FFC107, transparent)',
                  transition: 'left 0.6s ease'
                },
                '&:hover': {
                  boxShadow: '0 12px 35px rgba(255, 193, 7, 0.25)',
                  transform: 'translateY(-4px) scale(1.01)',
                  borderColor: 'rgba(255, 193, 7, 0.5)',
                  background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 193, 7, 0.12) 100%)',
                  '&:before': {
                    left: '100%'
                  }
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 3,
                    mt: 0.5,
                    boxShadow: '0 8px 20px rgba(255, 193, 7, 0.3)',
                    position: 'relative',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      inset: '2px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                      zIndex: 0
                    }
                  }}>
                    <NotesIcon sx={{ color: 'white', fontSize: '2rem', position: 'relative', zIndex: 1 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      mb: 1.5,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      📝 Konu Adı / Notlar
                    </Typography>
                    <Typography 
                      variant="body1" 
                      component="div" 
                      sx={{ 
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: '#1a0545',
                        border: '1px solid rgba(85, 179, 217, 0.1)',
                        whiteSpace: 'pre-line',
                        fontWeight: 500,
                        lineHeight: 1.6,
                        color: 'white',
                        fontSize: '0.95rem'
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
            alignItems: 'center',
            p: 4,
            borderTop: '2px solid rgba(255,255,255,0.1)',
            background: 'linear-gradient(135deg, rgba(26, 5, 69, 0.8) 0%, rgba(26, 5, 69, 0.9) 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <Button 
            onClick={handleCloseViewDialog}
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{ 
              borderRadius: '20px',
              px: 3,
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Kapat
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {viewingClass?.location && (
              <Button 
                onClick={() => viewingClass?.location && handleUrlClick(viewingClass.location)}
                variant="contained"
                startIcon={<VideoLibraryIcon />}
                sx={{ 
                  borderRadius: '20px',
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                  textTransform: 'none',
                  backgroundColor: '#55b3d9',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#4a9bc4',
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
              variant="contained"
              startIcon={<EditIcon />}
              sx={{ 
                borderRadius: '20px',
                px: 3,
                py: 1.2,
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: '#55b3d9',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#4a9bc4',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Düzenle
            </Button>
            <Button 
              onClick={() => {
                if (window.confirm('Bu dersi silmek istediğinizden emin misiniz?')) {
                  handleDeleteClass(viewingDay, viewingClass.id);
                  handleCloseViewDialog();
                }
              }}
              variant="outlined"
              startIcon={<DeleteIcon />}
              sx={{ 
                borderRadius: '20px',
                px: 3,
                py: 1.2,
                fontWeight: 600,
                textTransform: 'none',
                color: '#f44336',
                borderColor: 'rgba(244, 67, 54, 0.5)',
                '&:hover': {
                  backgroundColor: '#f44336',
                  borderColor: '#f44336',
                  color: 'white',
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
          sx={{ 
            borderRadius: 3,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            '& .MuiAlert-icon': {
              fontSize: '1.2rem'
            }
          }}
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
