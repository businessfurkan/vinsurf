import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Card, 
  CardContent, 
  Grid, 
  Divider, 
  CircularProgress,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const YapayZeka = () => {
  // Hardcoded API key - no need for user input
  const API_KEY = 'AIzaSyCStus-nYNRRx2GFJwy3ogGDi4jK4ezQGk';
  
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const responseRef = useRef(null);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(response);
    setSnackbar({
      open: true,
      message: 'Cevap panoya kopyalandı!',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setSnackbar({
        open: true,
        message: 'Lütfen bir soru veya komut girin',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Make API call to Google Gemini using the API key in the URL as provided by Google
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API isteği başarısız oldu');
      }

      const data = await response.json();
      
      // Extract the response text from the Gemini API response
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Boş yanıt alındı';
      
      setResponse(responseText);
      
      // Scroll to the response
      if (responseRef.current) {
        responseRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error calling Gemini API:', err);
      setError(err.message || 'Gemini API çağrısı sırasında bir hata oluştu');
      setSnackbar({
        open: true,
        message: `Hata: ${err.message || 'API isteği başarısız oldu'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
  minHeight: '100vh',
  py: 4,
  px: { xs: 1, sm: 2, md: 4 },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255,255,255,0.35)',
    backdropFilter: 'blur(8px)',
    zIndex: 0,
  },
  zIndex: 1,
}}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 3, 
          mt: 2, 
          fontWeight: 'bold', 
          color: 'primary.main', 
          display: 'flex', 
          alignItems: 'center',
          position: 'relative',
          pl: 1.5,
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '30%',
            height: '3px',
            backgroundColor: '#34A853',
            bottom: -8,
            left: 0
          }
        }}
      >
        <SmartToyIcon sx={{ mr: 1.5, fontSize: 32, color: '#34A853' }} />
        Yapay Zeka Asistanı
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{
  height: '100%',
  borderRadius: 4,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
  background: 'linear-gradient(135deg, #ffffff 60%, #e0e7ff 100%)',
  position: 'relative',
  overflow: 'hidden',
  backdropFilter: 'blur(10px)',
  border: '1.5px solid rgba(255,255,255,0.25)',
  transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
  '&:hover': {
    transform: 'translateY(-6px) scale(1.025)',
    boxShadow: '0 12px 24px 0 rgba(31, 38, 135, 0.18)',
    borderColor: '#34A85399',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255,255,255,0.12)',
    pointerEvents: 'none',
    zIndex: 1,
  }
}}>
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '6px',
                background: 'linear-gradient(to right, #4285F4, #34A853)'
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2.5, 
                  fontWeight: '600', 
                  color: '#4285F4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <SendIcon fontSize="small" /> Soru veya Komut
              </Typography>
              
              <TextField
  label="Yapay zekaya sorunuzu sorun"
  placeholder="Örnek: YKS hazırlığı için etkili çalışma teknikleri nelerdir?"
  multiline
  rows={10}
  value={prompt}
  onChange={handlePromptChange}
  fullWidth
  sx={{
    mb: 2.5,
    '& .MuiInputBase-root': {
      fontWeight: 500,
      borderRadius: 3,
      background: 'rgba(255,255,255,0.85)',
      boxShadow: '0 2px 12px rgba(31,38,135,0.10)',
      backdropFilter: 'blur(3px)',
      '&.Mui-focused': {
        boxShadow: '0 4px 16px rgba(52, 168, 83, 0.18)'
      }
    },
    '& .MuiInputLabel-root': {
      fontWeight: 500
    },
    '& .MuiOutlinedInput-root': {
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4285F4',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#4285F4'
                  }
                }}
              />
              
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                sx={{ 
                  mt: 1, 
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
                  background: 'linear-gradient(45deg, #4285F4 0%, #34A853 130%)',
                  textTransform: 'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(66, 133, 244, 0.4)',
                    transform: 'translateY(-1px)',
                    background: 'linear-gradient(45deg, #4285F4 0%, #34A853 150%)'
                  }
                }}
              >
                {loading ? 'Yanıt Alınıyor...' : 'Gönder'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
              background: 'linear-gradient(to bottom, #ffffff, #f9fafc)',
              position: 'relative',
              overflow: 'hidden'
            }} 
            ref={responseRef}
          >
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '6px',
                background: 'linear-gradient(to right, #EA4335, #FBBC05)'
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: '600', 
                    color: '#EA4335',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <SmartToyIcon fontSize="small" /> Yapay Zeka Yanıtı
                </Typography>
                
                {response && (
                  <IconButton 
                    onClick={handleCopyToClipboard} 
                    size="small"
                    title="Yanıtı Kopyala"
                    sx={{
                      color: '#EA4335',
                      backgroundColor: 'rgba(234, 67, 53, 0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(234, 67, 53, 0.15)',
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              
              <Divider sx={{ mb: 2.5, borderColor: 'rgba(0,0,0,0.08)' }} />
              
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  minHeight: '300px', 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.08)',
                  bgcolor: 'rgba(255,255,255,0.8)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  fontSize: '1rem',
                  lineHeight: 1.6
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress sx={{ color: '#EA4335' }} />
                  </Box>
                ) : error ? (
                  <Typography color="error" sx={{ fontWeight: 500 }}>
                    {error}
                  </Typography>
                ) : response ? (
                  <Typography sx={{ 
                    fontWeight: 400,
                    color: 'rgba(0,0,0,0.85)',
                    fontSize: '0.95rem',
                    '& p': {
                      marginBottom: '1em'
                    },
                    '& ul, & ol': {
                      paddingLeft: '1.5em',
                      marginBottom: '1em'
                    },
                    '& li': {
                      marginBottom: '0.5em'
                    },
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      marginTop: '1.5em',
                      marginBottom: '0.75em',
                      fontWeight: 600,
                      color: 'rgba(0,0,0,0.9)',
                      lineHeight: 1.3
                    }
                  }}>
                    {response}
                  </Typography>
                ) : (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 2,
                    opacity: 0.7
                  }}>
                    <SmartToyIcon sx={{ fontSize: 48, color: 'rgba(0,0,0,0.2)' }}/>
                    <Typography 
                      color="text.secondary" 
                      align="center"
                      sx={{ 
                        fontStyle: 'italic', 
                        fontWeight: 500,
                        maxWidth: '80%'
                      }}
                    >
                      Yapay zeka yanıtları burada görüntülenecek. Bir soru sorun ve "Gönder" düğmesine tıklayın.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            '& .MuiAlert-message': { 
              fontWeight: 500 
            } 
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default YapayZeka;