import React from 'react';
import { 
  Box, 
  Container,
  Paper,
  Typography
} from '@mui/material';
import RankingGoals from '../components/RankingGoals';
import AnalyticalStopwatch from '../components/AnalyticalStopwatch';

const Home = () => {

  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        width: '100%',
        minHeight: '100vh',
        pt: { xs: 2, sm: 3, md: 4 },
        pb: { xs: 4, sm: 5, md: 6 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
      }}
    >
      <Container 
        maxWidth={false}
        sx={{ 
          width: '100%',
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: { xs: '100%', lg: '90%', xl: '1800px' }
        }}
      >
        {/* Sıralama Hedeflerim Section */}
        <Paper 
          elevation={0} 
          className="home-card card-hover"
          sx={{ 
            borderRadius: '16px', 
            overflow: 'hidden',
            mb: { xs: 4, sm: 5, md: 6 },
            background: '#FFFFF0',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
            position: 'relative',
            minHeight: 220,
            width: '100%',
            mx: 'auto',
            transform: 'translateZ(0)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 3px 12px rgba(0, 0, 0, 0.1)',
              transform: 'translateY(-2px) translateZ(0)'
            }
          }}
        >
          <Box 
            sx={{ 
              p: { xs: 3, sm: 4, md: 5 },
              bgcolor: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              className="heading-font"
              sx={{ 
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                color: '#2e3856',
                mb: 2,
                fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.2rem' },
                textShadow: '0 2px 8px rgba(255, 255, 255, 0.5)',
                letterSpacing: 1,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  width: '80px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #4285F4, #0F9D58)',
                  transform: 'translateX(-50%)'
                }
              }}
            >
              🎯 Sıralama Hedeflerim
            </Typography>
            <Typography 
              variant="body1"
              sx={{ 
                color: '#4b5c6b', 
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, 
                mb: 3, 
                fontWeight: 500, 
                textAlign: 'center',
                maxWidth: '800px'
              }}
            >
              Hedeflediğin sıralamaları kaydet, motivasyonunu artır!
            </Typography>
            <RankingGoals />
          </Box>
        </Paper>

        {/* Analitik Kronometre Section */}
        <Paper 
          elevation={0} 
          className="home-card card-hover"
          sx={{ 
            borderRadius: '16px', 
            overflow: 'hidden',
            mb: { xs: 4, sm: 5, md: 6 },
            background: '#FFFFF0',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
            position: 'relative',
            minHeight: 220,
            width: '100%',
            mx: 'auto',
            transform: 'translateZ(0)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 3px 12px rgba(0, 0, 0, 0.1)',
              transform: 'translateY(-2px) translateZ(0)'
            }
          }}
        >
          <Box 
            sx={{ 
              p: { xs: 3, sm: 4, md: 5 },
              bgcolor: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200
            }}
          >
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              className="heading-font"
              sx={{ 
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                color: '#2e3856',
                mb: 2,
                fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.2rem' },
                textShadow: '0 2px 8px rgba(255, 255, 255, 0.5)',
                letterSpacing: 1,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  width: '80px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #43C6AC, #F8FFAE)',
                  transform: 'translateX(-50%)'
                }
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
                mb: 4,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                maxWidth: '800px',
                lineHeight: 1.6,
                textAlign: 'center'
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
      </Container>
    </Box>
  );
};

export default Home;
