const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
      color: theme.palette.primary.main,
      tooltip: "YKS hazırlık için kapsamlı ders kategorileri"
    },
    { 
      label: "Analitik Rapor", 
      value: "10+", 
      icon: <AssessmentIcon />,
      color: theme.palette.secondary.main,
      tooltip: "Detaylı çalışma performans analizleri"
    },
    { 
      label: "Aktif Kullanıcı", 
      value: "1000+", 
      icon: <EmojiEventsIcon />,
      color: theme.palette.success.main,
      tooltip: "Büyüyen öğrenci topluluğumuza katılın"
    }
  ];

  // Features data
  const features = [
    {
      title: "Pomodoro Tekniği",
      description: "Odaklanmış çalışma ve dinlenme döngüleriyle verimliliğinizi artırın",
      icon: <TimerIcon />,
      color: "#5B8FB9"
    },
    {
      title: "Detaylı Analitik",
      description: "Ders ve konu bazlı çalışma sürenizi takip edin ve raporlayın",
      icon: <BarChartIcon />,
      color: "#B8C0FF"
    },
    {
      title: "YKS Odaklı",
      description: "TYT ve AYT konularına göre başarınızı not tutun ve raporlayın",
      icon: <AutoStoriesIcon />,
      color: "#06D6A0"
    },
    {
      title: "Akıllı Hatırlatıcılar",
      description: "Çalışma hedeflerinize ulaşmanız için kişiselleştirilmiş bildirimler",
      icon: <PsychologyIcon />,
      color: "#FFD166"
    }
  ];

  return (
    <LoginContainer>
      {/* Decorative floating shapes */}
      <FloatingShape size="100px" top="10%" left="5%" delay="0s" color="linear-gradient(135deg, rgba(91, 143, 185, 0.2), rgba(91, 143, 185, 0.1))" />
      <FloatingShape size="70px" top="20%" right="10%" delay="1s" color="linear-gradient(135deg, rgba(184, 192, 255, 0.2), rgba(184, 192, 255, 0.1))" />
      <FloatingShape size="120px" bottom="10%" left="15%" delay="2s" color="linear-gradient(135deg, rgba(6, 214, 160, 0.1), rgba(6, 214, 160, 0.05))" />
      <FloatingShape size="80px" bottom="20%" right="5%" delay="3s" color="linear-gradient(135deg, rgba(255, 209, 102, 0.1), rgba(255, 209, 102, 0.05))" />

      <Container 
        maxWidth="xl" 
        sx={{ 
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 2, sm: 3, md: 4 }, 
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative', 
          zIndex: 2
        }}
      >
        <RainbowBorder sx={{ width: '100%', height: { xs: 'auto', md: '85vh' } }}>
          <ContentBox>
            <Grid 
              container 
              spacing={3}
              sx={{ height: '100%' }}
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
                  height: { xs: 'auto', md: '100%' },
                  pb: { xs: 4, md: 0 }
                }}
              >
                <Fade in={true} timeout={1000}>
                  <Box 
                    sx={{ 
                      position: 'relative', 
                      width: '100%',
                      maxWidth: { xs: '100%', sm: 450 },
                      px: { xs: 2, md: 4 }
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
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
                      }}
                    >
                      YKS Çalışma Takip
                    </GradientText>
                    
                    <AnimatedText 
                      variant="h6" 
                      sx={{ 
                        mb: { xs: 2, md: 2 },
                        fontWeight: 500,
                        color: theme.palette.text.secondary,
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' }
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
                        lineHeight: 1.6,
                        fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' }
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
                    
                    <Grid 
                      container 
                      spacing={2} 
                      sx={{ 
                        mt: 4,
                        display: { xs: 'none', md: 'flex' } 
                      }}
                    >
                      {stats.map((stat, index) => (
                        <Grid item xs={4} key={stat.label}>
                          <Tooltip title={stat.tooltip} arrow placement="top">
                            <StatsBox 
                              elevation={2}
                              color={`linear-gradient(45deg, ${stat.color} 0%, ${stat.color}99 100%)`}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: stat.color,
                                  width: 40,
                                  height: 40,
                                  mx: 'auto',
                                  mb: 1,
                                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                  '& .MuiSvgIcon-root': { fontSize: 24 }
                                }}
                              >
                                {stat.icon}
                              </Avatar>
                              <Typography 
                                variant="h4" 
                                sx={{ 
                                  fontWeight: 800, 
                                  fontSize: '1.5rem', 
                                  color: theme.palette.text.primary,
                                  mb: 0.5
                                }}
                              >
                                {stat.value}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '0.75rem', 
                                  color: theme.palette.text.secondary, 
                                  fontWeight: 500
                                }}
                              >
                                {stat.label}
                              </Typography>
                            </StatsBox>
                          </Tooltip>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Fade>
              </Grid>
              
              {/* Right side - Features */}
              <Grid 
                item 
                xs={12} 
                md={7} 
                sx={{ 
                  height: { xs: 'auto', md: '100%' },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Fade in={true} timeout={1200}>
                  <Box 
                    sx={{ 
                      mb: { xs: 2, md: 3 }, 
                      textAlign: { xs: 'center', md: 'left' },
                      px: { xs: 2, md: 0 }
                    }}
                  >
                    <AnimatedText 
                      variant="h4" 
                      sx={{ 
                        mb: { xs: 1, md: 2 },
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '1.75rem' }
                      }}
                      delay="0.7s"
                    >
                      Neden YKS Çalışma Takip?
                    </AnimatedText>
                    
                    <AnimatedText 
                      variant="body1" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
                        mx: { xs: 'auto', md: 0 },
                        display: { xs: 'none', md: 'block' }
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
                  spacing={2}
                  sx={{ 
                    display: { xs: 'none', md: 'flex' }
                  }}
                >
                  {stats.map((stat, index) => (
                    <Grid item xs={4} key={`mobile-${stat.label}`}>
                      <Grow in={true} timeout={1000 + (index * 300)}>
                        <Tooltip title={stat.tooltip} arrow placement="top">
                          <StatsBox 
                            elevation={2}
                            color={`linear-gradient(45deg, ${stat.color} 0%, ${stat.color}99 100%)`}
                          >
                            <Avatar
                              sx={{
                                bgcolor: stat.color,
                                width: 40,
                                height: 40,
                                mx: 'auto',
                                mb: 1,
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                '& .MuiSvgIcon-root': { fontSize: 24 }
                              }}
                            >
                              {stat.icon}
                            </Avatar>
                            <Typography 
                              variant="h4" 
                              sx={{ 
                                fontWeight: 800, 
                                fontSize: '1.5rem', 
                                color: theme.palette.text.primary,
                                mb: 0.5
                              }}
                            >
                              {stat.value}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.75rem', 
                                color: theme.palette.text.secondary, 
                                fontWeight: 500
                              }}
                            >
                              {stat.label}
                            </Typography>
                          </StatsBox>
                        </Tooltip>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>
              
                <Fade in={true} timeout={1800}>
                  <Box sx={{ mt: 2 }}>
                    <Grid 
                      container 
                      spacing={2}
                    >
                      {features.map((feature, index) => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={6} 
                          key={feature.title}
                        >
                          <Grow in={true} timeout={1500 + (index * 200)}>
                            <FeatureCard 
                              elevation={3} 
                              sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                '&::after': {
                                  background: `linear-gradient(90deg, ${feature.color}, ${feature.color}99)`,
                                }
                              }}
                            >
                              <CardContent 
                                sx={{ 
                                  p: { xs: 2, md: 2.5 }, 
                                  textAlign: 'center', 
                                  flex: 1, 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  justifyContent: 'center',
                                  alignItems: 'center'
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
                                    mb: { xs: 1, md: 1 },
                                    color: theme.palette.text.primary
                                  }}
                                >
                                  {feature.title}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                                    color: theme.palette.text.secondary,
                                    fontWeight: 400,
                                    lineHeight: 1.5
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
          </ContentBox>
        </RainbowBorder>
      </Container>
    </LoginContainer>
  );
};

export default Login;
