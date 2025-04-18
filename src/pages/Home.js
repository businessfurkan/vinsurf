import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LoginTrackerCompact from '../components/LoginTrackerCompact';
import EmptySpace from '../components/EmptySpace';
import AnalyticalStopwatch from '../components/AnalyticalStopwatch';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        width: '100%',
        minHeight: '100vh',
        pt: { xs: 2, sm: 3, md: 4 },
        pb: { xs: 4, sm: 5, md: 6 },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            className="home-card card-hover"
            sx={{ 
              borderRadius: '16px !important', 
              overflow: 'hidden',
              mb: { xs: 3, sm: 4, md: 5 },
              backgroundColor: '#FFFFFF !important',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05) !important'
            }}
          >
            <Box 
              sx={{ 
                p: { xs: 2, sm: 3, md: 4 },
                bgcolor: 'background.paper'
              }}
            >
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom 
                className="heading-font"
                sx={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#303545',
                  mb: 2,
                  fontSize: { xs: '1.3rem', sm: '1.4rem', md: '1.6rem' }
                }}
              >
                Öğrenci Çalışma Ortamı
              </Typography>
              
              <Typography 
                variant="body1" 
                className="body-font"
                paragraph
                sx={{ 
                  fontFamily: 'Glacial Indifference, Montserrat, sans-serif',
                  color: '#5F6477',
                  mb: 2,
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                  maxWidth: '800px',
                  lineHeight: 1.5
                }}
              >
                Giriş kaydınızı oluşturarak çalışma günlerinizi takip edin. YouTube entegrasyonu ile çalışırken
                motivasyon müziklerini dinleyebilirsiniz.
              </Typography>
              
              <Box sx={{ 
                width: '100%', 
                mx: 'auto', 
                maxWidth: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'center', sm: 'flex-start' },
                gap: { xs: 3, sm: 2 }
              }}>
                <LoginTrackerCompact />
                <EmptySpace />
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            className="home-card card-hover"
            sx={{ 
              borderRadius: '16px !important', 
              overflow: 'hidden',
              backgroundColor: '#FFFFFF !important',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05) !important'
            }}
          >
            <Box 
              sx={{ 
                p: { xs: 2, sm: 3, md: 4 },
                bgcolor: 'background.paper'
              }}
            >
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom 
                className="heading-font"
                sx={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#303545',
                  mb: 2,
                  fontSize: { xs: '1.4rem', sm: '1.5rem', md: '1.8rem' }
                }}
              >
                Analitik Kronometre: Detaylı Çalışma Takibi
              </Typography>
              
              <Typography 
                variant="body1" 
                className="body-font"
                paragraph
                sx={{ 
                  fontFamily: 'Glacial Indifference, Montserrat, sans-serif',
                  color: '#5F6477',
                  mb: 3,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  maxWidth: '800px',
                  lineHeight: 1.6
                }}
              >
                Analitik kronometre ile ders ve konu bazlı çalışmalarınızı kaydedin. 
                İlerlemenizi takip edin ve her derste ne kadar zaman harcadığınızı görün.
              </Typography>
              
              <Box sx={{ 
                width: '100%', 
                mx: 'auto', 
                maxWidth: '100%'
              }}>
                <AnalyticalStopwatch />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
