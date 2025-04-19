import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper,
  useMediaQuery
} from '@mui/material';
import PomodoroTimer from '../components/PomodoroTimer';

const PomodoroPage = () => {

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
      <Container maxWidth="xl" sx={{ height: '100%' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700, 
            color: 'primary.main',
            mb: { xs: 2, sm: 3, md: 4 },
            fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.2rem' },
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          Pomodoro Tekniği
        </Typography>

        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: { xs: 4, sm: 6, md: 8 }, 
            overflow: 'hidden',
            mb: { xs: 3, sm: 4, md: 5 },
            background: 'linear-gradient(135deg, #F8FFAE 0%, #43C6AC 100%)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px 0 rgba(67,198,172,0.18)',
            border: '1.5px solid #43C6AC33',
          }}
        >
          <Box 
            sx={{ 
              p: { xs: 3, sm: 4, md: 5 },
              background: 'rgba(255,255,255,0.20)',
              borderRadius: { xs: 4, sm: 6, md: 8 },
              boxShadow: '0 2px 8px #43C6AC11',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1.4rem', sm: '1.5rem', md: '1.8rem' }
              }}
            >
              Pomodoro Tekniği ile Verimli Çalışma
            </Typography>
            
            <Typography 
              variant="body1" 
              color="textSecondary" 
              paragraph
              sx={{ 
                mb: 3,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                maxWidth: '800px'
              }}
            >
              Pomodoro tekniği, 25 dakikalık odaklanmış çalışma ve 5 dakikalık kısa molalardan oluşan bir zaman yönetimi metodudur. 
              Bu metodu kullanarak daha verimli çalışabilir ve uzun süre konsantrasyonunuzu koruyabilirsiniz.
            </Typography>
            
            <Box sx={{ 
               width: '100%', 
               mx: 'auto', 
               maxWidth: 420,
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               background: 'rgba(255,255,255,0.28)',
               borderRadius: 7,
               boxShadow: '0 4px 24px #43C6AC22',
               p: { xs: 2, sm: 3 },
               mt: 2,
               mb: 2
             }}>
               <PomodoroTimer />
             </Box>
          </Box>
        </Paper>

        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: { xs: 4, sm: 6, md: 8 }, 
            overflow: 'hidden',
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
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
              sx={{ 
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1.4rem', sm: '1.5rem', md: '1.8rem' }
              }}
            >
              Pomodoro Tekniği Hakkında
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                mb: 2,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Pomodoro Tekniği, 1980'li yıllarda Francesco Cirillo tarafından geliştirilen bir zaman yönetimi metodudur. 
              İtalyanca &quot;domates&quot; anlamına gelen &quot;pomodoro&quot; kelimesi, Cirillo&apos;nun üniversite öğrencisiyken kullandığı domates şeklindeki mutfak zamanlayıcısından gelmektedir.
            </Typography>
            
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                mt: 3,
                mb: 1
              }}
            >
              Pomodoro Tekniğinin Adımları:
            </Typography>
            
            <Box component="ol" sx={{ pl: 2, mb: 3 }}>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                <strong>Görev Belirleme:</strong> Yapmak istediğiniz görevi belirleyin.
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                <strong>Zamanlayıcıyı Ayarlama:</strong> Zamanlayıcıyı 25 dakikaya ayarlayın (bir pomodoro).
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                <strong>Çalışma:</strong> Zamanlayıcı çalana kadar göreve odaklanın. Bu süre içinde dikkat dağıtıcı şeylerden uzak durun.
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                <strong>Kısa Mola:</strong> Zamanlayıcı çaldığında 5 dakikalık bir mola verin.
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                <strong>Tekrarlama:</strong> Dört pomodoro tamamlandıktan sonra, 15-30 dakikalık daha uzun bir mola verin.
              </Typography>
            </Box>
            
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                mt: 3,
                mb: 1
              }}
            >
              Pomodoro Tekniğinin Faydaları:
            </Typography>
            
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Dikkat dağınıklığını azaltır ve odaklanmayı artırır.
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Zaman yönetimi becerilerini geliştirir.
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Erteleme davranışını azaltır.
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Çalışma sürecini daha yönetilebilir parçalara böler.
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Zihinsel yorgunluğu azaltır ve verimliliği artırır.
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                İş-mola dengesini sağlayarak motivasyonu yüksek tutar.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PomodoroPage;
