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
  background: '#566e99',
  borderRadius: 18,
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '120px',
    height: '4px',
    background: 'linear-gradient(to right, #55b3d9, #3498db)',
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
  backgroundColor: '#566e99',
  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 30px rgba(85, 179, 217, 0.3)',
    transform: 'translateY(-2px)'
  }
}));

const NoteListItem = styled(ListItem)(({ theme, categorycolor }) => ({
  borderRadius: 16,
  marginBottom: theme.spacing(2),
  padding: 0,
  overflow: 'hidden',
  transition: 'all 0.25s ease',
  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
  backgroundColor: '#566e99',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  position: 'relative',
  minHeight: '80px',
  '&::before': {
    content: '""',
    position: 'absolute',
    height: '100%',
    width: '6px',
    left: 0,
    top: 0,
    backgroundColor: categorycolor || '#55b3d9',
    borderRadius: '16px 0 0 16px',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 30px rgba(85, 179, 217, 0.25)',
  }
}));

const NoteListItemContent = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  width: '100%',
  alignItems: 'flex-start',
}));

const CategoryChip = styled(Chip)(({ theme, categorycolor }) => ({
  fontWeight: 700,
  fontSize: '0.75rem',
  backgroundColor: `${categorycolor}20`,
  color: categorycolor,
  border: `1px solid ${categorycolor}40`,
  boxShadow: `0 3px 12px ${categorycolor}25`,
  height: 28,
  borderRadius: 14,
  '& .MuiChip-label': {
    paddingX: '12px',
    fontWeight: 700,
  },
  '&:hover': {
    backgroundColor: `${categorycolor}30`,
    transform: 'scale(1.05)',
  }
}));

const NoteTitleText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.1rem',
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: 'white',
  letterSpacing: '0.3px'
}));

const NoteDate = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: 'rgba(255, 255, 255, 0.8)',
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
    // notes array'inin güvenli olduğundan emin ol
    if (!Array.isArray(notes)) return [];
    
    return notes.filter(note => {
      // Güvenlik kontrolü - note undefined değilse işlem yap
      if (!note || !note.id) return false;
      
      const matchesSearch = searchTerm === '' || 
        (note.title && note.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()));
      
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
        if (note && note.category) {
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
            sx={{
              fontSize: { xs: '1.2rem', md: '2rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              letterSpacing: '0.5px',
              mb: 0,
              color: 'white'
            }}
          >
            <EventNoteIcon fontSize="large" sx={{ color: '#55b3d9' }} />
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
      
      <SearchBar elevation={3}>
        <SearchIcon sx={{ mr: 1, color: '#55b3d9' }} />
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
                <IconButton size="small" onClick={() => setSearchTerm('')} sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ 
            '& .MuiInputBase-root': {
              fontSize: '1rem',
              fontWeight: 500,
              color: 'white'
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255, 255, 255, 0.7)',
              opacity: 1
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
          {getFilteredNotes().filter(note => note && note.id).map((note) => (
            <NoteListItem key={note.id} categorycolor={getCategoryColor(note?.category)}>
              <NoteListItemContent onClick={() => handleOpenViewDialog(note)}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  width: '100%',
                  gap: 2
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CategoryChip 
                        categorycolor={getCategoryColor(note?.category)} 
                        label={note?.category || "Genel"} 
                        size="small" 
                      />
                    </Box>
                    <NoteTitleText sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {note?.title || 'Başlıksız Not'}
                    </NoteTitleText>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-end',
                    minWidth: 'auto'
                  }}>
                    <NoteDate sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      <AccessTimeIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                      {formatDate(note?.date)}
                    </NoteDate>
                  </Box>
                </Box>
              </NoteListItemContent>
              <IconButton 
                edge="end" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOpen(e, note);
                }}
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
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
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <form onSubmit={handleSaveNote}>
          {/* Simple Header */}
          <Box sx={{
            p: 3,
            backgroundColor: '#566e99',
            color: 'white'
          }}>
            <Typography 
              variant="h6" 
              component="div" 
              fontWeight={600}
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <NoteAddIcon /> Yeni Not Ekle
            </Typography>
          </Box>

          {/* Clean Content */}
          <DialogContent sx={{ p: 3, backgroundColor: '#566e99' }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}>
              {/* Title Field */}
              <TextField
                autoFocus
                label="Not Başlığı"
                name="title"
                fullWidth
                variant="outlined"
                value={currentNote.title}
                onChange={handleInputChange}
                required
                placeholder="Notunuz için bir başlık girin..."
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#566e99',
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#55b3d9',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&.Mui-focused': {
                      color: '#55b3d9'
                    }
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.6)'
                  }
                }}
              />
              
              {/* Category Field */}
              <TextField
                label="Kategori"
                name="category"
                fullWidth
                variant="outlined"
                value={currentNote.category}
                onChange={handleInputChange}
                placeholder="Matematik, Fizik, Genel vb."
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#566e99',
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#55b3d9',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&.Mui-focused': {
                      color: '#55b3d9'
                    }
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.6)'
                  }
                }}
              />
              
              {/* Content Field */}
              <TextField
                label="Not İçeriği"
                name="content"
                fullWidth
                variant="outlined"
                value={currentNote.content}
                onChange={handleInputChange}
                required
                multiline
                rows={6}
                placeholder="Not içeriğinizi buraya yazın..."
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#566e99',
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#55b3d9',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&.Mui-focused': {
                      color: '#55b3d9'
                    }
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.6)'
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1, backgroundColor: '#566e99' }}>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                textTransform: 'none',
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.5)'
                }
              }}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={isLoading || !currentNote.title || !currentNote.content}
              sx={{ 
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #566e99 0%, #4a5f85 100%)',
                boxShadow: '0 4px 12px rgba(86, 110, 153, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4a5f85 0%, #3d4f6b 100%)',
                  boxShadow: '0 6px 16px rgba(86, 110, 153, 0.4)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Kaydet'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
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
            background: '#566e99',
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
          <DialogContent sx={{ p: 3, pt: 3, backgroundColor: '#566e99' }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}>
              <Paper elevation={0} sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: '#566e99',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <TitleIcon sx={{ mt: 1.5, color: '#55b3d9' }} />
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
                        backgroundColor: '#566e99',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#55b3d9',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&.Mui-focused': {
                          color: '#55b3d9'
                        }
                      }
                    }}
                  />
                </Box>
              </Paper>
              
              <Paper elevation={0} sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: '#566e99',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <CategoryIcon sx={{ mt: 1.5, color: '#55b3d9' }} />
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
                        backgroundColor: '#566e99',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#55b3d9',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&.Mui-focused': {
                          color: '#55b3d9'
                        }
                      },
                      '& .MuiOutlinedInput-input::placeholder': {
                        color: 'rgba(255, 255, 255, 0.6)'
                      }
                    }}
                  />
                </Box>
              </Paper>
              
              <Paper elevation={0} sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: '#566e99',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <DescriptionIcon sx={{ mt: 1.5, color: '#55b3d9' }} />
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
                        backgroundColor: '#566e99',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#55b3d9',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&.Mui-focused': {
                          color: '#55b3d9'
                        }
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1, backgroundColor: '#566e99' }}>
            <Button 
              onClick={handleCloseEditDialog}
              sx={{ 
                borderRadius: 2,
                px: 3,
                color: 'white',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
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
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            maxHeight: '90vh'
          }
        }}
      >
        {/* Simple Header */}
        <Box sx={{
          backgroundColor: '#566e99',
          color: 'white',
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <DescriptionIcon />
            Not Detayları
          </Typography>
          
          {/* Close Button */}
          <IconButton
            onClick={handleCloseViewDialog}
            sx={{
              color: 'rgba(255,255,255,0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 3 Ayrı Bileşen */}
        <DialogContent sx={{ 
          p: 3,
          backgroundColor: '#566e99',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          {/* 1. Not Başlığı */}
          <Paper elevation={2} sx={{ 
            p: 3, 
            borderRadius: 2,
            backgroundColor: '#566e99',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{
                backgroundColor: '#55b3d9',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TitleIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                Not Başlığı
              </Typography>
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 500,
                color: 'white',
                lineHeight: 1.3,
                wordBreak: 'break-word'
              }}
            >
              {viewingNote?.title || 'Başlıksız Not'}
            </Typography>
          </Paper>

          {/* 2. Not İçeriği */}
          <Paper elevation={2} sx={{ 
            p: 3, 
            borderRadius: 2,
            backgroundColor: '#566e99',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{
                backgroundColor: '#55b3d9',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DescriptionIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                Not İçeriği
              </Typography>
            </Box>
            <Typography 
              variant="body1" 
              component="div" 
              sx={{ 
                whiteSpace: 'pre-line',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: 1.6,
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
                minHeight: '80px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                p: 2,
                borderRadius: 1,
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              {viewingNote?.content || 'İçerik bulunamadı.'}
            </Typography>
          </Paper>

          {/* 3. Not Kategorisi */}
          <Paper elevation={2} sx={{ 
            p: 3, 
            borderRadius: 2,
            backgroundColor: '#566e99',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{
                backgroundColor: '#55b3d9',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CategoryIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                Kategori
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {viewingNote?.category ? (
                <Chip 
                  label={viewingNote.category}
                  sx={{
                    backgroundColor: getCategoryColor(viewingNote.category) + '40',
                    color: 'white',
                    border: `1px solid ${getCategoryColor(viewingNote.category)}60`,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    height: 32
                  }}
                />
              ) : (
                <Chip 
                  label="Kategori Yok"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    height: 32
                  }}
                />
              )}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.85rem'
              }}>
                <AccessTimeIcon sx={{ fontSize: '1rem' }} />
                {formatDate(viewingNote?.date)}
              </Box>
            </Box>
          </Paper>
        </DialogContent>

        {/* Simple Action Buttons */}
        <DialogActions sx={{ 
          p: 3, 
          gap: 2,
          backgroundColor: '#566e99',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Button 
            onClick={handleCloseViewDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            Kapat
          </Button>
          
          <Button 
            onClick={() => {
              handleCloseViewDialog();
              handleOpenEditDialog(viewingNote);
            }}
            variant="contained"
            startIcon={<EditIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: '#566e99',
              '&:hover': {
                backgroundColor: '#4a5f85'
              }
            }}
          >
            Düzenle
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
