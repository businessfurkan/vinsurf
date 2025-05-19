import React, { useState, useEffect, useCallback } from 'react';
import Collapse from '@mui/material/Collapse';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { dataService } from '../services/dataService';

// Kategori renkleri
const categoryColors = {
  'Matematik': '#4285F4',
  'Fizik': '#0F9D58',
  'Kimya': '#DB4437',
  'Biyoloji': '#F4B400',
  'Edebiyat': '#673AB7',
  'Tarih': '#FF6D00',
  'Coğrafya': '#00ACC1',
  'Felsefe': '#9E9E9E',
  'Din Kültürü': '#795548',
  'İngilizce': '#607D8B',
  'Deneme': '#E91E63',
  'Soru': '#009688',
  'Genel': '#3F51B5',
  'Ders': '#8BC34A',
  'default': '#3f51b5'
};

// Kategori için renk döndüren yardımcı fonksiyon
const getCategoryColor = (category) => {
  if (!category) return categoryColors.Genel;
  
  // Tam eşleşme varsa direkt döndür
  if (categoryColors[category]) return categoryColors[category];
  
  // Kısmi eşleşme ara
  const key = Object.keys(categoryColors).find(
    key => category.toLowerCase().includes(key.toLowerCase())
  );
  
  return key ? categoryColors[key] : categoryColors.default;
};

// Stil tanımlamaları
const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  marginBottom: theme.spacing(4),
  position: 'relative',
  padding: theme.spacing(2, 2, 2, 2),
  background: 'rgba(255,255,255,0.98)',
  borderRadius: 18,
  boxShadow: '0 4px 24px rgba(60,60,80,0.07)',
  border: '1px solid #f1f1f4',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '120px',
    height: '4px',
    background: 'linear-gradient(to right, #4285F4, #34A853, #FBBC05, #EA4335)',
    bottom: 8,
    left: theme.spacing(2)
  }
}));

const HeaderRow = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

const SearchBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(0.8, 2),
  display: 'flex',
  alignItems: 'center',
  borderRadius: 16,
  marginBottom: theme.spacing(3),
  backgroundColor: '#aee1f5',
  boxShadow: '0 8px 25px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.07)',
  border: '1px solid rgba(0,0,0,0.04)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 30px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.08)',
    transform: 'translateY(-2px)'
  }
}));

const NoteListItem = styled(ListItem)(({ theme, categorycolor }) => ({
  borderRadius: 12,
  marginBottom: theme.spacing(1.5),
  padding: 0,
  overflow: 'hidden',
  transition: 'all 0.25s ease',
  boxShadow: '0 4px 15px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05)',
  backgroundColor: '#aee1f5',
  border: '1px solid rgba(0,0,0,0.03)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    height: '100%',
    width: '5px',
    left: 0,
    top: 0,
    backgroundColor: categorycolor || theme.palette.primary.main,
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1), 0 2px 10px rgba(0,0,0,0.06)',
  }
}));

const NoteListItemContent = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%',
  alignItems: 'flex-start',
}));

const CategoryChip = styled(Chip)(({ theme, categorycolor }) => ({
  fontWeight: 600,
  backgroundColor: `${categorycolor}15`,
  color: categorycolor,
  border: `1px solid ${categorycolor}30`,
  boxShadow: `0 2px 8px ${categorycolor}20`,
  height: 26,
  '&:hover': {
    backgroundColor: `${categorycolor}25`,
  }
}));

const NoteTitleText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}));

const NoteDate = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: alpha(theme.palette.text.secondary, 0.85),
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
}));

const NewNoteButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 8px 20px rgba(63, 81, 181, 0.25)',
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  transition: 'all 0.3s',
  textTransform: 'none',
  fontSize: '0.95rem',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 28px rgba(63, 81, 181, 0.4)',
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 20,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    overflow: 'hidden'
  },
  '& .MuiDialogTitle-root': {
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    padding: theme.spacing(2.5, 3),
    backgroundColor: alpha(theme.palette.background.default, 0.6),
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1.5, 3),
    borderTop: '1px solid rgba(0,0,0,0.1)',
    backgroundColor: alpha(theme.palette.background.default, 0.6),
  }
}));

const CategoryButton = styled(Button)(({ theme, categorycolor }) => ({
  borderRadius: 12,
  padding: theme.spacing(1, 2),
  margin: theme.spacing(0.5),
  color: categorycolor,
  backgroundColor: `${categorycolor}10`,
  border: `1px solid ${categorycolor}30`,
  boxShadow: `0 4px 12px ${categorycolor}20`,
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.25s ease',
  '&:hover': {
    backgroundColor: `${categorycolor}20`,
    boxShadow: `0 6px 15px ${categorycolor}30`,
    transform: 'translateY(-2px)'
  }
}));

const NotDefterim = () => {
  const theme = useTheme();
  
  const [user] = useAuthState(auth);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({
    title: '',
    content: '',
    category: '',
    date: null,
    userId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Eksik state'ler ve fonksiyonlar (no-undef hatası için)
  const [viewingNote, setViewingNote] = useState(null);
  const [viewNoteDialog, setViewNoteDialog] = useState(false);
  const [noteMenuAnchorEl, setNoteMenuAnchorEl] = useState(null);
  const [selectedMenuNote, setSelectedMenuNote] = useState(null);

  // Menü açma fonksiyonu
  const handleMenuOpen = (event, note) => {
    setNoteMenuAnchorEl(event.currentTarget);
    setSelectedMenuNote(note);
  };

  // Menü kapama fonksiyonu
  const handleMenuClose = () => {
    setNoteMenuAnchorEl(null);
    setSelectedMenuNote(null);
  };

  // Filtrelenmiş notları al
  const getFilteredNotes = () => {
    return notes.filter(note => {
      const matchesSearch = searchTerm === '' || 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || note.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  // Notları göster
  const showNotification = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  }, []);

  // Firebase'den notları çek
  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // dataService kullanarak notları çek
      const userId = user ? user.uid : 'anonymous';
      const fetchedNotes = await dataService.fetchData('notes', userId, 'date', 'desc');
      
      console.log("Çekilen not sayısı:", fetchedNotes.length);
      
      // Notları state'e kaydet
      setNotes(fetchedNotes);
      
      // Kategorileri çıkar
      const uniqueCategories = new Set();
      fetchedNotes.forEach(note => {
        if (note.category) {
          uniqueCategories.add(note.category);
        }
      });
      setCategories(Array.from(uniqueCategories));
      
      // Çevrimdışı kayıtları senkronize et
      if (user) {
        dataService.syncOfflineRecords('notes', user.uid);
      }
    } catch (error) {
      console.error('Notlar çekilirken hata oluştu:', error);
      console.error('Hata detayı:', error.message);
      showNotification('Notlar yüklenirken bir hata oluştu: ' + error.message, 'error');
    }
    
    setIsLoading(false);
  }, [user, showNotification]);

  // Sayfa yüklendiğinde notları çek
  useEffect(() => {
    fetchNotes();
  }, [user, fetchNotes]);

  // Dialog'ları açma işlevleri
  const handleOpenDialog = () => {
    setCurrentNote({
      title: '',
      content: '',
      category: '',
      date: null,
      userId: user.uid
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (note) => {
    setCurrentNote(note);
    setEditDialogOpen(true);
  };

  const handleOpenConfirmDialog = (noteId) => {
    setSelectedNoteId(noteId);
    setConfirmDialogOpen(true);
  };

  // Dialog'ları kapatma işlevleri
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedNoteId(null);
  };

  // Form girişlerini izle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentNote({
      ...currentNote,
      [name]: value
    });
  };

  // Not kaydetme işlevi
  const handleSaveNote = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Not içeriğini hazırla
      const noteData = {
        title: currentNote.title,
        content: currentNote.content,
        category: currentNote.category || "",
        date: new Date(),
      };
      
      console.log("Kaydedilecek not verisi:", noteData);
      
      // dataService kullanarak notu kaydet
      const userId = user ? user.uid : 'anonymous';
      const savedNote = await dataService.addData('notes', noteData, userId);
      
      console.log("Not başarıyla kaydedildi. ID:", savedNote.id);
      
      // State güncelle - yeni notu başa ekle
      setNotes(prevNotes => [savedNote, ...prevNotes]);
      
      // Kategorileri güncelle
      if (noteData.category && !categories.includes(noteData.category)) {
        setCategories([...categories, noteData.category]);
      }
      
      // Formu temizle ve kapat
      setDialogOpen(false);
      setCurrentNote({
        title: '',
        content: '',
        category: '',
        date: null,
        userId: userId
      });
      
      showNotification('Notunuz başarıyla kaydedildi.');
    } catch (error) {
      console.error('Not kaydedilirken hata oluştu:', error);
      console.error('Hata detayı:', error.message);
      showNotification('Not kaydedilirken bir hata oluştu: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Not güncelleme işlevi
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Not içeriğini hazırla
      const noteData = {
        title: currentNote.title,
        content: currentNote.content,
        category: currentNote.category || "",
        date: new Date(),
      };
      
      // dataService kullanarak notu güncelle
      const userId = user ? user.uid : 'anonymous';
      const updatedNote = await dataService.updateData('notes', currentNote.id, noteData, userId);
      
      console.log("Not başarıyla güncellendi");
      
      // State'i güncelle
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === currentNote.id ? updatedNote : note)
      );
      
      // Kategorileri güncelle
      if (noteData.category && !categories.includes(noteData.category)) {
        setCategories([...categories, noteData.category]);
      }
      
      // Formu kapat
      setEditDialogOpen(false);
      setCurrentNote({
        title: '',
        content: '',
        category: '',
        date: null,
        userId: userId
      });
      
      showNotification('Notunuz başarıyla güncellendi.');
    } catch (error) {
      console.error('Not güncellenirken hata oluştu:', error);
      console.error('Hata detayı:', error.message);
      showNotification('Not güncellenirken bir hata oluştu: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Not silme işlevi
  const handleDeleteNote = async () => {
    try {
      setIsLoading(true);
      
      // dataService kullanarak notu sil
      const userId = user ? user.uid : 'anonymous';
      await dataService.deleteData('notes', selectedNoteId, userId);
      
      console.log("Not başarıyla silindi");
      
      // State'i güncelle
      const updatedNotes = notes.filter(note => note.id !== selectedNoteId);
      setNotes(updatedNotes);
      
      // Kategorileri güncelle
      const remainingCategories = new Set();
      updatedNotes.forEach(note => {
        if (note.category) {
          remainingCategories.add(note.category);
        }
      });
      setCategories(Array.from(remainingCategories));
      
      // Dialogs kapat
      setConfirmDialogOpen(false);
      setSelectedNoteId(null);
      
      showNotification('Not başarıyla silindi.');
    } catch (error) {
      console.error('Not silinirken hata oluştu:', error);
      console.error('Hata detayı:', error.message);
      showNotification('Not silinirken bir hata oluştu: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Not görüntüleme diyaloğunu aç
  const handleOpenViewDialog = (note) => {
    setViewingNote(note);
    setViewNoteDialog(true);
  };

  // Not görüntüleme diyaloğunu kapat
  const handleCloseViewDialog = () => {
    setViewNoteDialog(false);
    setViewingNote(null);
  };

  // Tarihi formatla
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      try {
        date = new Date(timestamp);
      } catch (e) {
        return 'Geçersiz tarih';
      }
    }
    
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <PageContainer>
      <PageHeader>
        <HeaderRow>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontWeight={800} 
            color="primary"
            sx={{
              fontSize: { xs: '1.2rem', md: '2rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              letterSpacing: '0.5px',
              mb: 0
            }}
          >
            <EventNoteIcon fontSize="large" sx={{ color: '#4285F4' }} />
            Not Defterim
          </Typography>
          <NewNoteButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{
              mt: { xs: 0, md: 0 },
              py: 1.2,
              px: 3,
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              fontWeight: 700,
              boxShadow: '0 2px 12px #4285F455',
              background: 'linear-gradient(90deg, #4285F4 0%, #34A853 100%)',
              color: '#fff',
              borderRadius: 3,
              textTransform: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                background: 'linear-gradient(90deg, #34A853 0%, #4285F4 100%)',
                boxShadow: '0 4px 16px #4285F433',
              }
            }}
          >
            Not Ekle
          </NewNoteButton>
        </HeaderRow>
      </PageHeader>
      
      <SearchBar elevation={3} sx={{ backgroundColor: '#aee1f5 !important' }}>
        <SearchIcon sx={{ mr: 1, color: 'primary.main' }} />
        <TextField
          fullWidth
          variant="standard"
          placeholder="Not ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            disableUnderline: true,
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')} sx={{ color: 'text.secondary' }}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ 
            '& .MuiInputBase-root': {
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        />
      </SearchBar>

      {/* Kategori butonları */}
      <Box sx={{ mb: 3, mt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600} color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon fontSize="small" />
            Kategoriler
          </Typography>
          
          <Button 
            variant="outlined" 
            color="primary"
            size="small"
            endIcon={showCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowCategories(!showCategories)}
            sx={{ 
              borderRadius: 8, 
              textTransform: 'none',
              fontSize: '0.8rem',
              padding: '4px 10px',
              boxShadow: '0 3px 8px rgba(0,0,0,0.08)'
            }}
          >
            {showCategories ? 'Kategorileri Gizle' : 'Kategorileri Göster'}
          </Button>
        </Box>
        
        <Collapse in={showCategories} timeout="auto" unmountOnExit>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <CategoryButton
              variant={selectedCategory === '' ? "contained" : "outlined"}
              categorycolor={categoryColors.default}
              onClick={() => setSelectedCategory('')}
              startIcon={<FilterListIcon />}
            >
              Tüm Notlar
            </CategoryButton>
            
            {categories.map((category) => (
              <CategoryButton
                key={category}
                variant={selectedCategory === category ? "contained" : "outlined"}
                categorycolor={getCategoryColor(category)}
                onClick={() => setSelectedCategory(category)}
                startIcon={
                  <Box component="span" 
                    sx={{ 
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: getCategoryColor(category),
                      boxShadow: `0 0 0 2px ${alpha(getCategoryColor(category), 0.3)}`
                    }} 
                  />
                }
              >
                {category}
              </CategoryButton>
            ))}
          </Box>
        </Collapse>
      </Box>

      {/* Not görüntüleme */}
      {isLoading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px', 
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={40} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Notlar yükleniyor...
          </Typography>
        </Box>
      ) : getFilteredNotes().length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '250px',
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            borderRadius: 3,
            border: '1px dashed rgba(0,0,0,0.1)',
            p: 4
          }}
        >
          <NoteAddIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm || selectedCategory ? 'Aramanıza uygun not bulunamadı' : 'Henüz not eklenmemiş'}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 400 }}>
            {searchTerm || selectedCategory
              ? 'Farklı arama kriterleri deneyebilir veya filtreleri kaldırabilirsiniz.'
              : 'Notlarınızı eklemek için "Not Ekle" butonuna tıklayabilirsiniz.'}
          </Typography>
          
          {(searchTerm || selectedCategory) ? (
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<FilterListIcon />}
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Filtreleri Temizle
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              İlk Notunuzu Ekleyin
            </Button>
          )}
        </Box>
      ) : (
        <List sx={{ padding: 0 }}>
          {getFilteredNotes().map((note) => (
            <NoteListItem key={note.id} categorycolor={getCategoryColor(note.category)} style={{backgroundColor: '#aee1f5'}}>
              <NoteListItemContent onClick={() => handleOpenViewDialog(note)}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryChip categorycolor={getCategoryColor(note.category)} label={note.category || "Genel"} size="small" />
                    <NoteTitleText>
                      {note.title}
                    </NoteTitleText>
                  </Box>
                  <NoteDate>
                    <AccessTimeIcon sx={{ fontSize: '0.9rem' }} />
                    {formatDate(note.date)}
                  </NoteDate>
                </Box>
              </NoteListItemContent>
              <IconButton 
                edge="end" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOpen(e, note);
                }}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </NoteListItem>
          ))}
        </List>
      )}
      
      {/* Not işlem menüsü */}
      <Menu
        anchorEl={noteMenuAnchorEl}
        open={Boolean(noteMenuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            mt: 0.5
          }
        }}
      >
        <MenuItem 
          onClick={() => handleOpenEditDialog(selectedMenuNote)}
          sx={{
            '&:hover': {
              backgroundColor: alpha(theme.palette.info.main, 0.1)
            }
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText>Düzenle</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleOpenConfirmDialog(selectedMenuNote?.id)}
          sx={{
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.1)
            }
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Sil</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Not ekleme/düzenleme diyalogları */}
      
      {/* Dialog for creating a new note */}
      <StyledDialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={handleSaveNote}>
          <Box sx={{
            p: 2.5,
            background: `linear-gradient(45deg, ${alpha('#536DFE', 0.9)} 0%, ${alpha('#3949AB', 0.7)} 100%)`,
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
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <NoteAddIcon sx={{ fontSize: '1.3rem' }} /> Yeni Not Ekle
            </Typography>
          </Box>
          <DialogContent sx={{ p: 3, pt: 3 }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}>
              <Paper elevation={0} sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: 'rgba(83, 109, 254, 0.05)',
                border: '1px solid rgba(83, 109, 254, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <TitleIcon sx={{ mt: 1.5, color: '#536DFE' }} />
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Başlık"
                    name="title"
                    fullWidth
                    variant="outlined"
                    value={currentNote.title}
                    onChange={handleInputChange}
                    required
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#D9D4BB',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#536DFE',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#536DFE'
                      } 
                    }}
                  />
                </Box>
              </Paper>
              
              <Paper elevation={0} sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: 'rgba(83, 109, 254, 0.05)',
                border: '1px solid rgba(83, 109, 254, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <CategoryIcon sx={{ mt: 1.5, color: '#536DFE' }} />
                  <TextField
                    margin="dense"
                    label="Kategori"
                    name="category"
                    fullWidth
                    variant="outlined"
                    value={currentNote.category}
                    onChange={handleInputChange}
                    placeholder="İsterseniz bir kategori ekleyin"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#D9D4BB',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#536DFE',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#536DFE'
                      } 
                    }}
                  />
                </Box>
              </Paper>
              
              <Paper elevation={0} sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: 'rgba(83, 109, 254, 0.05)',
                border: '1px solid rgba(83, 109, 254, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <DescriptionIcon sx={{ mt: 1.5, color: '#536DFE' }} />
                  <TextField
                    margin="dense"
                    label="İçerik"
                    name="content"
                    fullWidth
                    variant="outlined"
                    value={currentNote.content}
                    onChange={handleInputChange}
                    required
                    multiline
                    rows={8}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#D9D4BB',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#536DFE',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#536DFE'
                      } 
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
            <Button 
              onClick={handleCloseDialog}
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
              İptal
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={isLoading}
              sx={{ 
                borderRadius: 2,
                px: 3,
                boxShadow: `0 4px 12px ${alpha('#536DFE', 0.3)}`,
                background: `linear-gradient(45deg, #536DFE 0%, ${alpha('#3949AB', 0.85)} 100%)`,
                textTransform: 'none',
                fontWeight: 500,
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: `0 6px 16px ${alpha('#536DFE', 0.4)}`,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Kaydet'}
            </Button>
          </DialogActions>
        </form>
      </StyledDialog>
      
      {/* Dialog for editing a note */}
      <StyledDialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={handleUpdateNote}>
          <Box sx={{
            p: 2.5,
            background: '#5db6d9',
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
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <EditNoteIcon sx={{ fontSize: '1.3rem' }} /> Notu Düzenle
            </Typography>
          </Box>
          <DialogContent sx={{ p: 3, pt: 3 }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}>
              <Paper elevation={0} sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: 'rgba(255, 152, 0, 0.05)',
                border: '1px solid rgba(255, 152, 0, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <TitleIcon sx={{ mt: 1.5, color: '#FF9800' }} />
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Başlık"
                    name="title"
                    fullWidth
                    variant="outlined"
                    value={currentNote.title}
                    onChange={handleInputChange}
                    required
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#D9D4BB',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FF9800',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#FF9800'
                      } 
                    }}
                  />
                </Box>
              </Paper>
              
              <Paper elevation={0} sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: 'rgba(255, 152, 0, 0.05)',
                border: '1px solid rgba(255, 152, 0, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <CategoryIcon sx={{ mt: 1.5, color: '#FF9800' }} />
                  <TextField
                    margin="dense"
                    label="Kategori"
                    name="category"
                    fullWidth
                    variant="outlined"
                    value={currentNote.category || ''}
                    onChange={handleInputChange}
                    placeholder="İsterseniz bir kategori ekleyin"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#D9D4BB',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FF9800',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#FF9800'
                      } 
                    }}
                  />
                </Box>
              </Paper>
              
              <Paper elevation={0} sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: 'rgba(255, 152, 0, 0.05)',
                border: '1px solid rgba(255, 152, 0, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <DescriptionIcon sx={{ mt: 1.5, color: '#FF9800' }} />
                  <TextField
                    margin="dense"
                    label="İçerik"
                    name="content"
                    fullWidth
                    variant="outlined"
                    value={currentNote.content}
                    onChange={handleInputChange}
                    required
                    multiline
                    rows={8}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#D9D4BB',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FF9800',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#FF9800'
                      } 
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
            <Button 
              onClick={handleCloseEditDialog}
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
              İptal
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={isLoading}
              sx={{ 
                borderRadius: 2,
                px: 3,
                boxShadow: `0 4px 12px ${alpha('#FF9800', 0.3)}`,
                background: `linear-gradient(45deg, #FF9800 0%, ${alpha('#FF5722', 0.85)} 100%)`,
                textTransform: 'none',
                fontWeight: 500,
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: `0 6px 16px ${alpha('#FF9800', 0.4)}`,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Güncelle'}
            </Button>
          </DialogActions>
        </form>
      </StyledDialog>
      
      {/* Silme onaylama diyaloğu */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            background: 'linear-gradient(to bottom, #ffffff, #f9fafc)',
            overflow: 'hidden',
            maxWidth: '400px'
          }
        }}
      >
        <Box sx={{
          p: 2.5,
          background: `linear-gradient(45deg, ${alpha('#f44336', 0.9)} 0%, ${alpha('#d32f2f', 0.7)} 100%)`,
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
          <Typography 
            variant="h6" 
            component="div" 
            fontWeight={600}
            sx={{ 
              position: 'relative',
              zIndex: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <DeleteIcon sx={{ fontSize: '1.3rem' }} /> Notu Sil
          </Typography>
        </Box>
        <DialogContent sx={{ mt: 2, p: 3 }}>
          <Typography variant="body1">
            Bu notu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
          <Button 
            onClick={handleCloseConfirmDialog}
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
            İptal
          </Button>
          <Button 
            onClick={handleDeleteNote}
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
            disabled={isLoading}
            sx={{ 
              borderRadius: 2,
              px: 3,
              boxShadow: `0 4px 12px ${alpha('#f44336', 0.3)}`,
              background: `linear-gradient(45deg, #f44336 0%, ${alpha('#d32f2f', 0.85)} 100%)`,
              textTransform: 'none',
              fontWeight: 500,
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha('#f44336', 0.4)}`,
                transform: 'translateY(-1px)'
              }
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Not Görüntüleme Diyaloğu */}
      <Dialog 
        open={viewNoteDialog} 
        onClose={handleCloseViewDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {viewingNote?.title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseViewDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {viewingNote?.category && (
            <CategoryChip categorycolor={getCategoryColor(viewingNote.category)} label={viewingNote.category} size="small" />
          )}
          <Typography 
            variant="body1" 
            component="div" 
            sx={{ 
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            {viewingNote?.content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            handleCloseViewDialog();
            handleOpenEditDialog(viewingNote);
          }}>
            Düzenle
          </Button>
          <Button onClick={handleCloseViewDialog}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default NotDefterim;