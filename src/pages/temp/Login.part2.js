const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLaptop = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  // Stats data
  const stats = [
    { 
      label: "Ders Kategorisi", 
      value: "25+", 
      icon: <MenuBookIcon />,
      color: theme.palette.primary.main
    },
    { 
      label: "Analitik Rapor", 
      value: "10+", 
      icon: <AssessmentIcon />,
      color: theme.palette.secondary.main
    },
    { 
      label: "Aktif Kullanıcı", 
      value: "1000+", 
      icon: <EmojiEventsIcon />,
      color: theme.palette.success.main
    }
  ];

  // Features data
  const features = [
    {
      title: "Pomodoro Tekniği",
      description: "Odaklanmış çalışma ve dinlenme döngüleriyle verimliliğinizi artırın",
      icon: <TimerIcon />,
      color: theme.palette.primary.main
    },
    {
      title: "Detaylı Analitik",
      description: "Ders ve konu bazlı çalışma sürenizi takip edin ve raporlayın",
      icon: <BarChartIcon />,
      color: theme.palette.secondary.main
    },
    {
      title: "YKS Odaklı",
      description: "TYT ve AYT konularına göre başarınızı not tutun ve raporlayın",
      icon: <AutoStoriesIcon />,
      color: theme.palette.success.main
    },
    {
      title: "Akıllı Hatırlatıcılar",
      description: "Çalışma hedeflerinize ulaşmanız için kişiselleştirilmiş bildirimler",
      icon: <PsychologyIcon />,
      color: theme.palette.error.main
    }
  ];

  return (
    <LoginContainer>
      {/* Decorative floating shapes - only visible on larger screens */}
      <FloatingShape size="120px" top="10%" left="5%" delay="0s" color="linear-gradient(135deg, rgba(91, 143, 185, 0.2), rgba(91, 143, 185, 0.1))" />
      <FloatingShape size="80px" top="20%" right="10%" delay="1s" color="linear-gradient(135deg, rgba(184, 192, 255, 0.2), rgba(184, 192, 255, 0.1))" />
      <FloatingShape size="150px" bottom="10%" left="15%" delay="2s" color="linear-gradient(135deg, rgba(6, 214, 160, 0.1), rgba(6, 214, 160, 0.05))" />
      <FloatingShape size="100px" bottom="20%" right="5%" delay="3s" color="linear-gradient(135deg, rgba(255, 209, 102, 0.1), rgba(255, 209, 102, 0.05))" />

      <Container 
        maxWidth="lg" 
        sx={{ 
          py: { xs: 2, sm: 3, md: 4 }, 
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative', 
          zIndex: 2,
          overflow: 'hidden'
        }}
      >
        <Grid 
          container 
          spacing={{ xs: 2, sm: 3, md: 4 }} 
          alignItems="center" 
          justifyContent="center" 
          sx={{ 
            minHeight: { xs: 'auto', md: '90vh' },
            py: { xs: 4, md: 0 }
          }}
        >
          {/* Left side - Login form */}
          <Grid 
            item 
            xs={12} 
            md={5} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              position: 'relative',
              zIndex: 2,
              order: { xs: 2, md: 1 },
              mb: { xs: 4, md: 0 },
              mt: { xs: 2, md: 0 }
            }}
          >
            <Fade in={true} timeout={1000}>
              <Box 
                sx={{ 
                  position: 'relative', 
                  mb: { xs: 4, md: 6 },
                  width: '100%',
                  maxWidth: { xs: '100%', sm: 450 }
                }}
              >
                <GlowingCircle 
                  sx={{ 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)'
                  }} 
                />
                
                <LogoContainer>
                  <LogoIcon>
                    <SchoolIcon />
                  </LogoIcon>
                </LogoContainer>
                
                <GradientText 
                  variant="h3" 
                  component="h1" 
                  sx={{ 
                    mb: 1, 
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                    px: { xs: 2, sm: 0 }
                  }}
                >
                  YKS Çalışma Takip
                </GradientText>
                
                <AnimatedText 
                  variant="h6" 
                  sx={{ 
                    mb: { xs: 2, md: 4 },
                    fontWeight: 400,
                    color: theme.palette.text.secondary,
                    maxWidth: 450,
                    mx: 'auto',
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                    px: { xs: 2, sm: 0 }
                  }}
                  delay="0.3s"
                >
                  Başarının anahtarı etkili çalışmadır
                </AnimatedText>
                
                <AnimatedText 
                  variant="body1" 
                  sx={{ 
                    mb: { xs: 3, md: 4 },
                    color: theme.palette.text.secondary,
                    maxWidth: 450,
                    mx: 'auto',
                    lineHeight: 1.8,
                    fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
                    px: { xs: 2, sm: 0 }
                  }}
                  delay="0.5s"
                >
                  Pomodoro tekniği ve analitik çalışma takibi ile sınav 
                  başarınızı artırın. Düzenli çalışma ve detaylı istatistiklerle 
                  performansınızı maksimum seviyeye çıkarın.
                </AnimatedText>
                
                <Grow in={true} timeout={1500}>
                  <Box sx={{ position: 'relative', zIndex: 3 }}>
                    {loading ? (
                      <CircularProgress size={36} sx={{ color: theme.palette.primary.main }} />
                    ) : (
                      <GradientButton
                        variant="contained"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleLogin}
                        size={isMobile ? "medium" : "large"}
                        sx={{ 
                          px: { xs: 3, md: 4 }, 
                          py: { xs: 1, md: 1.5 },
                          fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' }
                        }}
                      >
                        Google ile Giriş Yap
                      </GradientButton>
                    )}
                  </Box>
                </Grow>
              </Box>
            </Fade>
          </Grid>
          
          {/* Right side - Features */}
          <Grid 
            item 
            xs={12} 
            md={7} 
            sx={{ 
              order: { xs: 1, md: 2 },
              mb: { xs: 2, md: 0 }
            }}
          >
            <Fade in={true} timeout={1200}>
              <Box 
                sx={{ 
                  mb: { xs: 3, md: 4 }, 
                  textAlign: { xs: 'center', md: 'left' },
                  px: { xs: 2, sm: 0 }
                }}
              >
                <AnimatedText 
                  variant="h4" 
                  sx={{ 
                    mb: { xs: 1, md: 2 },
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                  }}
                  delay="0.7s"
                >
                  Neden YKS Çalışma Takip?
                </AnimatedText>
                
                <AnimatedText 
                  variant="body1" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    maxWidth: 600,
                    fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
                    mx: { xs: 'auto', md: 0 }
                  }}
                  delay="0.9s"
                >
                  YKS Çalışma Takip uygulaması ile çalışma sürenizi optimize edin, 
                  performansınızı analiz edin ve hedeflerinize daha hızlı ulaşın.
                </AnimatedText>
              </Box>
            </Fade>
            
            <Grid 
              container 
              spacing={{ xs: 1, sm: 2, md: 3 }} 
              sx={{ 
                mb: { xs: 3, md: 4 },
                px: { xs: 1, sm: 0 }
              }}
            >
              {stats.map((stat, index) => (
                <Grid item xs={4} key={stat.label}>
                  <Grow in={true} timeout={1000 + (index * 300)}>
                    <StatsBox elevation={3}>
                      <Box sx={{ mb: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: stat.color,
                            width: { xs: 40, sm: 44, md: 48 },
                            height: { xs: 40, sm: 44, md: 48 },
                            mx: 'auto',
                            mb: { xs: 1, md: 2 },
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                            '& .MuiSvgIcon-root': { 
                              fontSize: { xs: 22, sm: 24, md: 28 } 
                            }
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                      </Box>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 800, 
                          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }, 
                          color: theme.palette.text.primary,
                          mb: 0.5,
                          textShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.9rem' }, 
                          color: theme.palette.text.secondary, 
                          fontWeight: 500
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </StatsBox>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          
            <Fade in={true} timeout={1800}>
              <Box 
                sx={{ 
                  width: '100%', 
                  overflow: 'visible',
                  px: { xs: 1, sm: 0 }
                }}
              >
                <Grid 
                  container 
                  spacing={{ xs: 2, sm: 2, md: 3 }}
                >
                  {features.map((feature, index) => (
                    <Grid 
                      item 
                      xs={12} 
                      sm={6} 
                      key={feature.title} 
                      sx={{ height: '100%' }}
                    >
                      <Grow in={true} timeout={1500 + (index * 200)}>
                        <FeatureCard 
                          elevation={4} 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column' 
                          }}
                        >
                          <CardContent 
                            sx={{ 
                              p: { xs: 2, sm: 2.5, md: 3 }, 
                              textAlign: 'center', 
                              flex: 1, 
                              display: 'flex', 
                              flexDirection: 'column', 
                              justifyContent: 'center' 
                            }}
                          >
                            <FeatureIcon 
                              color={feature.color}
                              size={isMobile ? 48 : isTablet ? 52 : 56}
                            >
                              {feature.icon}
                            </FeatureIcon>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700, 
                                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, 
                                mb: { xs: 1, md: 1.5 },
                                color: theme.palette.text.primary
                              }}
                            >
                              {feature.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.9rem' },
                                color: theme.palette.text.secondary,
                                fontWeight: 400,
                                lineHeight: 1.6
                              }}
                            >
                              {feature.description}
                            </Typography>
                          </CardContent>
                        </FeatureCard>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </LoginContainer>
  );
};

export default Login;
