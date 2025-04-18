import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogContent,
  MenuItem,
  Select,
  FormControl,
  Grid,
  Snackbar,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Avatar,
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
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { scheduleService } from '../services/scheduleService';
import { dataService } from '../services/dataService';

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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'medium',
  padding: '8px 12px',
  fontSize: '0.825rem',
}));

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: theme.palette.text.primary,
  fontWeight: 'bold',
  padding: '16px',
  fontSize: '1rem',
  textAlign: 'center',
  width: '14.28%', // 100% / 7 days
  position: 'relative',
  overflow: 'visible',
  boxShadow: 'none',
  borderBottom: 'none',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '20%',
    width: '60%',
    height: '3px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px',
  }
}));

const DayCircle = styled(Box)(({ theme, day }) => {
  // Assign different gradient colors for each day
  const dayColors = {
    'Pazartesi': 'linear-gradient(135deg, #4285F4, #34A853)',
    'Salı': 'linear-gradient(135deg, #0F9D58, #4285F4)',
    'Çarşamba': 'linear-gradient(135deg, #DB4437, #F4B400)',
    'Perşembe': 'linear-gradient(135deg, #F4B400, #0F9D58)',
    'Cuma': 'linear-gradient(135deg, #673AB7, #4285F4)',
    'Cumartesi': 'linear-gradient(135deg, #FF6D00, #F4B400)',
    'Pazar': 'linear-gradient(135deg, #9C27B0, #673AB7)',
  };

  return {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: dayColors[day] || 'linear-gradient(135deg, #3f51b5, #2196f3)',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    marginBottom: '8px'
  };
});

const ClassCell = styled(TableCell)(({ theme, isEmpty }) => ({
  backgroundColor: isEmpty ? alpha('#f9fafc', 0.8) : theme.palette.background.paper,
  color: isEmpty ? theme.palette.text.secondary : theme.palette.text.primary,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: isEmpty 
      ? alpha(theme.palette.action.hover, 0.05)
      : alpha(theme.palette.action.hover, 0.1),
  },
  transition: 'background-color 0.3s, transform 0.2s',
  padding: '20px',
  minHeight: '200px',
  verticalAlign: 'top',
  borderRadius: '12px',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  margin: '8px',
}));

const ClassCard = styled(Paper)(({ theme, color = '#3f51b5' }) => ({
  padding: '14px',
  borderRadius: '10px',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  position: 'relative',
  overflow: 'hidden',
  marginBottom: '12px',
  cursor: 'pointer',
  boxShadow: '0 3px 12px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
    transform: 'translateY(-3px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: `linear-gradient(to right, ${color}, ${alpha(color, 0.7)})`,
  }
}));

const AddButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.9),
  color: theme.palette.primary.contrastText,
  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    transform: 'scale(1.08)',
    boxShadow: '0 6px 14px rgba(0,0,0,0.2)',
  },
  transition: 'all 0.2s',
  width: '40px',
  height: '40px',
}));

const FilterBar = styled(Paper)(({ theme }) => ({
  padding: '18px 22px',
  borderRadius: '16px',
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  marginBottom: '28px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f9fafc 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: 'linear-gradient(to right, #4285F4, #34A853, #FBBC05, #EA4335)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(63, 81, 181, 0.03) 0%, rgba(63, 81, 181, 0) 70%)',
    zIndex: 0
  }
}));

const SearchInput = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: 12,
    backgroundColor: 'white',
    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)'
    },
    '&.Mui-focused': {
      boxShadow: '0 8px 20px rgba(63, 81, 181, 0.15)',
      transform: 'translateY(-2px)'
    }
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.08)'
  },
  '& .MuiInputBase-input': {
    padding: '12px 14px'
  }
}));

const FilterChip = styled(Chip)(({ theme, selected }) => ({
  margin: '0 6px 6px 0',
  fontWeight: selected ? '600' : '400',
  boxShadow: selected ? '0 3px 8px rgba(0,0,0,0.12)' : 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  }
}));

const FilterButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: 'none',
  padding: '8px 16px',
  backgroundColor: '#f5f8ff',
  color: theme.palette.primary.main,
  fontWeight: 500,
  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  border: '1px solid rgba(63, 81, 181, 0.12)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#eef2ff',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)'
  }
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 12,
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    padding: theme.spacing(1),
    backgroundColor: alpha(theme.palette.background.paper, 0.97)
  }
}));

const StyledMenuItem = styled(MenuItem)(({ theme, selected }) => ({
  borderRadius: 8,
  margin: '2px 0',
  transition: 'background-color 0.2s',
  padding: '6px 16px',
  fontSize: '0.95rem',
  backgroundColor: selected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
  '&:hover': {
    backgroundColor: selected ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.action.hover, 0.1)
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

  const handleOpenViewDialog = (day, classItem, e) => {
    e.stopPropagation(); // Hücrenin onClick olayını engelle
    setViewingDay(day);
    setViewingClass(classItem);
    setViewClassDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewClassDialog(false);
    setViewingClass(null);
    setViewingDay('');
  };

  const handleViewClass = (day, classItem) => {
    setViewingDay(day);
    setViewingClass(classItem);
    setViewClassDialog(true);
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

  const handleEditClass = async (day, classId, updatedClass) => {
    try {
      const userId = user ? user.uid : 'anonymous';
      
      // scheduleService ile sınıf güncelle
      const updatedSchedule = scheduleService.updateClass(schedule, day, classId, updatedClass);
      setSchedule(updatedSchedule);
      
      // Firestore ve localStorage'a kaydet
      if (user) {
        const success = await scheduleService.saveSchedule(updatedSchedule, userId);
        if (success) {
          showNotification('Ders başarıyla güncellendi.');
        }
      } else {
        // Anonim kullanıcı için sadece localStorage'a kaydet
        localStorage.setItem('weeklySchedule_anonymous', JSON.stringify(updatedSchedule));
        showNotification('Ders başarıyla güncellendi.');
      }
    } catch (error) {
      console.error('Ders güncellenirken hata oluştu:', error);
      showNotification('Ders güncellenirken bir hata oluştu.', 'error');
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

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

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
    <Box sx={{ p: 3, pt: 5, pb: 4 }}>
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

      <FilterBar>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="600" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon fontSize="small" /> Ders Arama ve Filtreleme
          </Typography>
          <Chip 
            label={`Toplam ${Object.values(schedule).reduce((total, day) => total + day.length, 0)} ders`}
            color="primary" 
            variant="outlined"
            size="small"
            sx={{ fontWeight: 500, borderRadius: 8, boxShadow: '0 2px 5px rgba(0,0,0,0.06)' }}
          />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <SearchInput
              fullWidth
              placeholder="Ders, öğretmen veya konu ara..."
              value={searchText}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchText('')} sx={{ color: 'text.secondary' }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight="600" sx={{ mr: 1.5, color: 'text.secondary' }}>
                Konu Filtresi:
              </Typography>
              
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
                <Box sx={{ px: 1, pb: 1, mb: 1, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Ders Konuları
                  </Typography>
                </Box>
                {getUniqueSubjects().map((subject) => (
                  <StyledMenuItem
                    key={subject}
                    selected={selectedSubjects.includes(subject)}
                    onClick={() => handleFilterToggle(subject)}
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
                  </StyledMenuItem>
                ))}
                {selectedSubjects.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, pt: 1, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
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
              
              {selectedSubjects.length > 0 && (
                <Tooltip title="Filtreleri Temizle">
                  <IconButton 
                    size="small" 
                    onClick={() => setSelectedSubjects([])}
                    sx={{ ml: 1, color: 'text.secondary' }}
                  >
                    <FilterListOffIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Grid>
        </Grid>
      </FilterBar>
      
      {isLoading ? (
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          <LinearProgress sx={{ width: '50%', borderRadius: 1 }} />
        </Box>
      ) : (
        <TableContainer 
          component={Paper} 
          elevation={0}
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 5px 25px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.04)',
            background: 'linear-gradient(to bottom, #ffffff, #f9fafc)'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                {daysOfWeek.map(day => (
                  <HeaderTableCell key={day} align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <DayCircle day={day}>
                        {day.charAt(0)}
                      </DayCircle>
                      {day}
                    </Box>
                  </HeaderTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {daysOfWeek.map(day => (
                  <ClassCell 
                    key={day} 
                    isEmpty={!filteredSchedule[day] || filteredSchedule[day].length === 0} 
                    onClick={() => handleAddClass(day)}
                  >
                    {filteredSchedule[day] && filteredSchedule[day].length > 0 ? (
                      <Box>
                        {filteredSchedule[day].map((classItem, index) => (
                          <ClassCard 
                            key={classItem.id || index} 
                            color={getSubjectColor(classItem.subject)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewClass(day, classItem);
                            }}
                          >
                            <Box sx={{ position: 'relative' }}>
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  fontWeight: 600, 
                                  color: getSubjectColor(classItem.subject),
                                  mb: 0.5,
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '50%', 
                                    backgroundColor: getSubjectColor(classItem.subject),
                                    mr: 1,
                                    boxShadow: `0 0 0 2px ${alpha(getSubjectColor(classItem.subject), 0.2)}`
                                  }} 
                                />
                                {classItem.subject}
                              </Typography>
                              
                              {classItem.teacher && (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 0.5 
                                  }}
                                >
                                  <SchoolIcon fontSize="small" sx={{ opacity: 0.7, fontSize: '0.9rem' }} />
                                  {classItem.teacher}
                                </Typography>
                              )}
                              
                              {classItem.notes && (
                                <Tooltip title={classItem.notes}>
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      gap: 1,
                                      mb: 0.5,
                                      maxWidth: '100%',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    <NotesIcon fontSize="small" sx={{ opacity: 0.7, fontSize: '0.9rem' }} />
                                    {classItem.notes}
                                  </Typography>
                                </Tooltip>
                              )}
                              
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end',
                                mt: 1
                              }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingDay(day);
                                    setViewingClass(classItem);
                                    setOpenDialog(true);
                                    setCurrentDay(day);
                                    setClassDetails(classItem);
                                  }}
                                  sx={{ 
                                    p: 0.5,
                                    color: alpha(getSubjectColor(classItem.subject), 0.8),
                                    backgroundColor: alpha(getSubjectColor(classItem.subject), 0.1),
                                    mr: 1,
                                    '&:hover': {
                                      backgroundColor: alpha(getSubjectColor(classItem.subject), 0.2),
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClass(day, classItem.id);
                                  }}
                                  sx={{ 
                                    p: 0.5,
                                    color: '#f44336',
                                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(244, 67, 54, 0.2)',
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </ClassCard>
                        ))}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                          <AddButton onClick={(e) => {
                            e.stopPropagation();
                            handleAddClass(day);
                          }}>
                            <AddCircleOutlineIcon />
                          </AddButton>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        justifyContent: 'center', 
                        height: '100%',
                        minHeight: 200
                      }}>
                        <AddButton onClick={(e) => {
                          e.stopPropagation();
                          handleAddClass(day);
                        }}>
                          <AddCircleOutlineIcon />
                        </AddButton>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          align="center"
                          sx={{ mt: 2, opacity: 0.7, fontWeight: 500 }}
                        >
                          {searchText || selectedSubjects.length > 0 
                            ? 'Filtreye uygun ders bulunamadı'
                            : 'Ders eklemek için tıklayın'}
                        </Typography>
                      </Box>
                    )}
                  </ClassCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
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
          background: `linear-gradient(45deg, ${alpha(getSubjectColor(classDetails.subject || 'default'), 0.9)} 0%, ${alpha(getSubjectColor(classDetails.subject || 'default'), 0.7)} 100%)`,
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
            borderRadius: 2.5,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            background: 'linear-gradient(to bottom, #ffffff, #f9fafc)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{
          p: 2.5,
          background: viewingClass ? `linear-gradient(45deg, ${alpha(getSubjectColor(viewingClass.subject), 0.9)} 0%, ${alpha(getSubjectColor(viewingClass.subject), 0.7)} 100%)` : 'linear-gradient(45deg, #3f51b5, #2196f3)',
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
              fontWeight={600}
              sx={{
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {viewingClass?.subject}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleCloseViewDialog}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
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
            {viewingDay}
          </Typography>
        </Box>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2.5
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <SchoolIcon sx={{ color: 'primary.main', opacity: 0.7, mr: 2, fontSize: '1.8rem' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Öğretmen
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {viewingClass?.teacher || 'Belirtilmemiş'}
                </Typography>
              </Box>
            </Box>
            
            {viewingClass?.location && (
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <LocationOnIcon sx={{ color: '#e53935', opacity: 0.7, mr: 2, fontSize: '1.8rem' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ders Videosu
                  </Typography>
                  {viewingClass.location ? (
                    <a 
                      href={viewingClass.location.startsWith('http') ? viewingClass.location : `https://${viewingClass.location}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        color: '#1976d2',
                        textDecoration: 'none',
                        fontWeight: 500
                      }}
                    >
                      {viewingClass.location}
                    </a>
                  ) : (
                    <Typography variant="body1" fontWeight={500}>
                      Belirtilmemiş
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
            
            {viewingClass?.notes && (
              <Box sx={{ 
                p: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <NotesIcon sx={{ color: '#ff9800', opacity: 0.7, mr: 1.5, fontSize: '1.5rem' }} />
                  <Typography variant="body2" color="text.secondary">
                    Konu adı
                  </Typography>
                </Box>
                <Typography 
                  variant="body1" 
                  component="div" 
                  fontWeight={500}
                  sx={{ 
                    p: 2,
                    borderRadius: 1.5,
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.07)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {viewingClass.notes}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            p: 2.5,
            background: 'rgba(0,0,0,0.02)',
            borderTop: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Button 
            onClick={handleCloseViewDialog}
            sx={{ 
              borderRadius: 2,
              px: 3,
              color: 'rgba(0,0,0,0.6)',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.05)'
              }
            }}
          >
            Kapat
          </Button>
          <Box>
            <Button 
              onClick={() => {
                handleStartEdit();
                handleCloseViewDialog();
              }}
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{ 
                borderRadius: 2,
                mr: 1.5,
                px: 2.5,
                fontWeight: 500,
                textTransform: 'none',
                borderColor: 'rgba(0,0,0,0.2)',
                color: 'rgba(0,0,0,0.7)'
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
                borderRadius: 2,
                px: 2.5,
                textTransform: 'none',
                fontWeight: 500,
                bgcolor: '#f44336',
                '&:hover': {
                  bgcolor: '#d32f2f'
                }
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
