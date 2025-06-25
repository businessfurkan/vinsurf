import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  Paper,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  School,
  Analytics,
  Schedule,
  Assignment,
  TrendingUp
} from '@mui/icons-material';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';

// Ana container - tam ekran
const LoginContainer = styled(Box)({
  minHeight: '100vh',
  background: '#0f0f23',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  position: 'relative',
  overflow: 'hidden',
});

// Ana layout container
const MainLayout = styled(Box)({
  display: 'flex',
  width: '100%',
  maxWidth: '1400px',
  height: '700px',
  gap: '60px',
  alignItems: 'center',
  justifyContent: 'center',
});

// Sol taraf - Login kartı
const LoginCard = styled(Paper)({
  background: '#0f0f23',
  borderRadius: '24px',
  padding: '48px 40px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2)',
  width: '420px',
  height: 'fit-content',
  position: 'relative',
});

// Sağ taraf - Bilgi bölümü
const InfoSection = styled(Box)({
  flex: 1,
  maxWidth: '800px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
});

// Başlık bölümü
const HeaderSection = styled(Box)({
  marginBottom: '60px',
});

// Özellik kartları container
const FeaturesGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '24px',
  width: '100%',
  maxWidth: '700px',
});

// Form input alanları
const StyledTextField = styled(TextField)({
  marginBottom: '24px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-2px)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid #667eea',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.2)',
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#667eea',
    },
  },
  '& .MuiOutlinedInput-input': {
    color: '#ffffff',
    fontSize: '16px',
    padding: '18px 20px',
  },
});

// Login butonu
const LoginButton = styled(Button)({
  borderRadius: '16px',
  padding: '18px 32px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '16px',
  textTransform: 'none',
  border: 'none',
  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
  marginBottom: '20px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 15px 30px rgba(102, 126, 234, 0.6)',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
  },
  '&:active': {
    transform: 'translateY(-1px) scale(0.98)',
  },
});

// Google butonu
const GoogleButton = styled(Button)({
  borderRadius: '16px',
  padding: '18px 32px',
  background: '#ffffff',
  color: '#1f1f1f',
  fontWeight: 600,
  fontSize: '16px',
  textTransform: 'none',
  border: '1px solid #dadce0',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: '24px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    background: '#f8f9fa',
  },
  '&:active': {
    transform: 'translateY(-1px) scale(0.98)',
  },
});

// Google Logo SVG Component
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Özellik kartları
const FeatureCard = styled(Box)({
  background: 'rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  padding: '32px 20px',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  height: '160px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    transform: 'translateY(-8px)',
    background: 'rgba(255, 255, 255, 0.12)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
});

// Şifremi unuttum linki
const ForgotPasswordLink = styled(Link)({
  color: 'rgba(255, 255, 255, 0.7)',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    color: '#667eea',
  },
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful');
      navigate('/dashboard'); // Ana sayfaya yönlendir
    } catch (error) {
      console.error('Login error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Google popup ile giriş
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google login successful:', result.user);
      navigate('/dashboard'); // Ana sayfaya yönlendir
    } catch (error) {
      console.error('Google login error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.';
      case 'auth/wrong-password':
        return 'Hatalı şifre girdiniz.';
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi.';
      case 'auth/user-disabled':
        return 'Bu hesap devre dışı bırakılmış.';
      case 'auth/too-many-requests':
        return 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
      case 'auth/network-request-failed':
        return 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
      case 'auth/popup-closed-by-user':
        return 'Google giriş penceresi kapatıldı.';
      case 'auth/popup-blocked':
        return 'Popup engellendi. Lütfen popup engelleyiciyi devre dışı bırakın.';
      default:
        return 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.';
    }
  };

  const features = [
    { 
      icon: <Analytics sx={{ fontSize: 40, color: '#667eea', mb: 2 }} />, 
      title: 'Analitik', 
      desc: 'Detaylı performans analizi' 
    },
    { 
      icon: <Schedule sx={{ fontSize: 40, color: '#34a853', mb: 2 }} />, 
      title: 'Zamanlama', 
      desc: 'Akıllı çalışma planı' 
    },
    { 
      icon: <Assignment sx={{ fontSize: 40, color: '#fbbc05', mb: 2 }} />, 
      title: 'Konu Takibi', 
      desc: 'Kapsamlı konu yönetimi' 
    },
    { 
      icon: <TrendingUp sx={{ fontSize: 40, color: '#ea4335', mb: 2 }} />, 
      title: 'İlerleme', 
      desc: 'Görsel ilerleme takibi' 
    },
  ];

  return (
    <LoginContainer>
      <MainLayout>
        {/* Sol Taraf - Login Kartı */}
        <LoginCard elevation={0}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <School sx={{ fontSize: 40, color: '#667eea', mr: 2 }} />
              <Typography
                variant="h4"
                sx={{
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '28px',
                }}
              >
                YKS Study Tracker
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '16px',
                fontWeight: 400,
              }}
            >
              Hedeflerinizi gerçekleştirin
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleLogin}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(211, 47, 47, 0.3)',
                  '& .MuiAlert-icon': {
                    color: '#f44336'
                  }
                }}
              >
                {error}
              </Alert>
            )}

            <StyledTextField
              fullWidth
              label="E-posta Adresi"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              fullWidth
              label="Şifre"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <ForgotPasswordLink href="#" underline="none">
                Şifremi unuttum
              </ForgotPasswordLink>
            </Box>

            <LoginButton
              fullWidth
              type="submit"
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </LoginButton>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                textAlign: 'center',
                my: 2,
                fontSize: '14px',
              }}
            >
              veya
            </Typography>

            <GoogleButton
              fullWidth
              variant="outlined"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <GoogleLogo />
              Google ile Giriş Yap
            </GoogleButton>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}
              >
                Hesabınız yok mu?{' '}
                <Link
                  href="#"
                  sx={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { color: '#764ba2' },
                  }}
                >
                  Kayıt Ol
                </Link>
              </Typography>
            </Box>
          </Box>
        </LoginCard>

        {/* Sağ Taraf - Bilgi Bölümü */}
        <InfoSection>
          <HeaderSection>
            <Typography
              variant="h2"
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                mb: 3,
                fontSize: '48px',
                lineHeight: 1.2,
              }}
            >
              YKS Hazırlık Sürecinizi
              <br />
              Dijitalleştirin
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '18px',
                lineHeight: 1.6,
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              YKS Study Tracker ile çalışmalarınızı planlayın, takip edin ve performansınızı analiz edin.
            </Typography>
          </HeaderSection>

          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard key={index}>
                {feature.icon}
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '16px',
                    mb: 1,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '13px',
                    lineHeight: 1.4,
                  }}
                >
                  {feature.desc}
                </Typography>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </InfoSection>
      </MainLayout>
    </LoginContainer>
  );
};

export default Login;
