import React from 'react';
import { 
  Box, 
  useMediaQuery,
  Grid,
  Paper,
  Typography
} from '@mui/material';
import RankingGoals from '../components/RankingGoals';
import AnalyticalStopwatch from '../components/AnalyticalStopwatch';

const Home = () => {
  
  const isMobile = useMediaQuery('(max-width:600px)');

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
      background: '#FFFFF0',
      boxShadow: '0 4px 18px 0 rgba(0,0,0,0.08) !important',
      position: 'relative',
      minHeight: 220
    }}
  >
    <Box 
      sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200
      }}
    >
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom 
        className="heading-font"
        sx={{ 
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: '#2e3856',
          mb: 1.5,
          fontSize: { xs: '1.5rem', sm: '1.7rem', md: '2rem' },
          textShadow: '0 2px 8px #fff5',
          letterSpacing: 1
        }}
      >
        🎯 Sıralama Hedeflerim
      </Typography>
      <Typography 
        variant="body1"
        sx={{ color: '#4b5c6b', fontSize: { xs: '1rem', sm: '1.1rem' }, mb: 2, fontWeight: 500, textAlign: 'center' }}
      >
        Hedeflediğin sıralamaları kaydet, motivasyonunu artır!
      </Typography>
      <RankingGoals />
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
              mb: { xs: 3, sm: 4, md: 5 },
              background: '#FFFFF0',
              boxShadow: '0 4px 18px 0 rgba(0,0,0,0.08) !important',
              position: 'relative',
              minHeight: 220
            }}
          >
            <Box 
              sx={{ 
                p: { xs: 2, sm: 3, md: 4 },
                bgcolor: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200
              }}
            >
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom 
                className="heading-font"
                sx={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  color: '#2e3856',
                  mb: 1.5,
                  fontSize: { xs: '1.5rem', sm: '1.7rem', md: '2rem' },
                  textShadow: '0 2px 8px #fff5',
                  letterSpacing: 1
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
