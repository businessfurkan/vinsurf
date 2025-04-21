import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import PomodoroTimer from '../components/PomodoroTimer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';

const PomodoroPage = () => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        width: '100%',
        minHeight: '100vh',
        pt: { xs: 2, sm: 3, md: 4 },
        pb: { xs: 4, sm: 5, md: 6 },
        px: { xs: 1, sm: 2, md: 3 },
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
      }}
    >
      <Container maxWidth="xl" sx={{ height: '100%' }}>
        <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'flex-start' },
            mb: { xs: 3, sm: 4, md: 5 },
            gap: 2
          }}
        >
          <TimerIcon 
            sx={{ 
              fontSize: { xs: 32, sm: 40, md: 48 },
              color: theme.palette.primary.main,
              filter: `drop-shadow(0 4px 8px ${alpha(theme.palette.primary.main, 0.4)})`,
            }} 
          />
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              color: 'primary.main',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.6rem' },
              textAlign: { xs: 'center', md: 'left' },
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              letterSpacing: '-0.5px',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: '60px',
                height: '4px',
                borderRadius: '2px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                display: { xs: 'none', md: 'block' }
              }
            }}
          >
            Pomodoro Tekniği
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Timer Card */}
          <Grid item xs={12} md={7}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                overflow: 'hidden',
                boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.08)}`,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 15px 50px ${alpha(theme.palette.common.black, 0.12)}`,
                },
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                  <LocalFireDepartmentIcon 
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontSize: 28,
                      filter: `drop-shadow(0 2px 5px ${alpha(theme.palette.primary.main, 0.4)})`,
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '1.4rem', sm: '1.6rem' },
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Pomodoro Zamanlayıcı
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 2,
                  px: { xs: 2, sm: 4 },
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.5)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                  boxShadow: `inset 0 1px 8px ${alpha(theme.palette.common.black, 0.03)}`,
                  mb: 3,
                }}>
                  <PomodoroTimer />
                </Box>
                
                <Typography 
                  variant="body1"
                  sx={{ 
                    textAlign: 'center',
                    color: alpha(theme.palette.text.primary, 0.8),
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    mt: 1,
                  }}
                >
                  Zamanlayıcıyı başlatın, odaklanın ve verimliliğinizi artırın!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Info Card */}
          <Grid item xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.light, 0.03)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                overflow: 'hidden',
                boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.08)}`,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 15px 50px ${alpha(theme.palette.common.black, 0.12)}`,
                },
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                  <SelfImprovementIcon 
                    sx={{ 
                      color: theme.palette.secondary.main,
                      fontSize: 28,
                      filter: `drop-shadow(0 2px 5px ${alpha(theme.palette.secondary.main, 0.4)})`,
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '1.4rem', sm: '1.6rem' },
                      background: `linear-gradient(90deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Verimli Çalışma
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha(theme.palette.text.primary, 0.8),
                    mb: 2,
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                  }}
                >
                  Pomodoro tekniği, 25 dakikalık odaklanmış çalışma ve 5 dakikalık kısa molalardan oluşan bilimsel bir zaman yönetimi metodudur.
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexWrap: 'wrap', 
                  mb: 2,
                  justifyContent: 'center' 
                }}>
                  <Chip 
                    label="Odaklanma" 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      borderRadius: '12px',
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                    }}
                  />
                  <Chip 
                    label="Verimlilik" 
                    color="secondary" 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      borderRadius: '12px',
                      boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.15)}`,
                    }}
                  />
                  <Chip 
                    label="Motivasyon" 
                    color="success" 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      borderRadius: '12px',
                      boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.15)}`,
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha(theme.palette.text.primary, 0.8),
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                  }}
                >
                  Bu metodu kullanarak daha verimli çalışabilir, konsantrasyonunuzu artırabilir ve zihinsel yorgunluğu azaltabilirsiniz.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Pomodoro Bilgi Kartı */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.7)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                overflow: 'hidden',
                boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.06)}`,
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3, 
                  gap: 1.5,
                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  pb: 2
                }}>
                  <AccessTimeIcon 
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontSize: 28,
                      filter: `drop-shadow(0 2px 5px ${alpha(theme.palette.primary.main, 0.3)})`,
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '1.4rem', sm: '1.6rem' },
                      color: theme.palette.primary.main,
                    }}
                  >
                    Pomodoro Tekniği Hakkında
                  </Typography>
                </Box>
                
                <Grid container spacing={4}>
                  {/* Sol Taraf - Açıklama */}
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: alpha(theme.palette.text.primary, 0.9),
                        mb: 3,
                        fontSize: '0.95rem',
                        lineHeight: 1.7,
                        position: 'relative',
                        pl: { md: 2 },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '3px',
                          borderRadius: '3px',
                          background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          display: { xs: 'none', md: 'block' }
                        }
                      }}
                    >
                      Pomodoro Tekniği, 1980&apos;li yıllarda Francesco Cirillo tarafından geliştirilen bir zaman yönetimi metodudur. 
                      İtalyanca &quot;domates&quot; anlamına gelen &quot;pomodoro&quot; kelimesi, Cirillo&apos;nun üniversite öğrencisiyken kullandığı domates şeklindeki mutfak zamanlayıcısından gelmektedir.
                    </Typography>
                    
                    <Box sx={{ 
                      p: 2.5, 
                      borderRadius: 3, 
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      mb: 3
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          mb: 2,
                          color: theme.palette.primary.main,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <EmojiEventsIcon fontSize="small" />
                        Pomodoro Tekniğinin Faydaları
                      </Typography>
                      
                      <Grid container spacing={1}>
                        {[
                          "Dikkat dağınıklığını azaltır",
                          "Zaman yönetimini geliştirir",
                          "Erteleme davranışını azaltır",
                          "Verimliliği artırır",
                          "Motivasyonu yüksek tutar",
                          "Zihinsel yorgunluğu azaltır"
                        ].map((benefit, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5,
                              mb: 1
                            }}>
                              <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: theme.palette.primary.main,
                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
                              }} />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 500,
                                  color: alpha(theme.palette.text.primary, 0.9),
                                }}
                              >
                                {benefit}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Grid>
                  
                  {/* Sağ Taraf - Adımlar */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 2.5, 
                      borderRadius: 3, 
                      bgcolor: alpha(theme.palette.secondary.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                      height: '100%'
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          mb: 2.5,
                          color: theme.palette.secondary.main,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <TimerIcon fontSize="small" />
                        Pomodoro Tekniğinin Adımları
                      </Typography>
                      
                      {[
                        {
                          title: "Görev Belirleme",
                          desc: "Yapmak istediğiniz görevi belirleyin."
                        },
                        {
                          title: "Zamanlayıcıyı Ayarlama",
                          desc: "Zamanlayıcıyı 25 dakikaya ayarlayın (bir pomodoro)."
                        },
                        {
                          title: "Çalışma",
                          desc: "Zamanlayıcı çalana kadar göreve odaklanın. Bu süre içinde dikkat dağıtıcı şeylerden uzak durun."
                        },
                        {
                          title: "Kısa Mola",
                          desc: "Zamanlayıcı çaldığında 5 dakikalık bir mola verin."
                        },
                        {
                          title: "Tekrarlama",
                          desc: "Dört pomodoro tamamlandıktan sonra, 15-30 dakikalık daha uzun bir mola verin."
                        }
                      ].map((step, index) => (
                        <Box key={index} sx={{ 
                          mb: 2, 
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 2
                        }}>
                          <Box sx={{ 
                            width: 28, 
                            height: 28, 
                            borderRadius: '50%', 
                            bgcolor: alpha(theme.palette.secondary.main, 0.15),
                            color: theme.palette.secondary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            flexShrink: 0,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.secondary.main, 0.1)}`
                          }}>
                            {index + 1}
                          </Box>
                          <Box>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                mb: 0.5,
                                color: theme.palette.secondary.main
                              }}
                            >
                              {step.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: alpha(theme.palette.text.primary, 0.8),
                                fontSize: '0.9rem',
                                lineHeight: 1.5
                              }}
                            >
                              {step.desc}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PomodoroPage;
