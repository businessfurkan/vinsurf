import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid,
  CircularProgress,
  Container,
  Fade,
  Grow,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Paper,
  Divider,
  useMediaQuery
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import SchoolIcon from '@mui/icons-material/School';
import TimerIcon from '@mui/icons-material/Timer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useTheme } from '@mui/material/styles';

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(91, 143, 185, 0.6); }
  70% { box-shadow: 0 0 0 15px rgba(91, 143, 185, 0); }
  100% { box-shadow: 0 0 0 0 rgba(91, 143, 185, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-15px); }
  60% { transform: translateY(-7px); }
`;

// Styled components
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  overflow: 'hidden',
  position: 'relative',
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%235b8fb9\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    backgroundSize: '180px 180px',
    zIndex: 0,
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  overflow: 'hidden',
  height: '100%',
  boxShadow: '0 10px 30px rgba(91, 143, 185, 0.1)',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  position: 'relative',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 15px 35px rgba(91, 143, 185, 0.15)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: 'linear-gradient(90deg, #5B8FB9, #7CA6C8)',
  }
}));

const FeatureIcon = styled(Avatar)(({ theme, color }) => ({
  backgroundColor: color || theme.palette.primary.main,
  width: ({ size }) => size || 56,
  height: ({ size }) => size || 56,
  boxShadow: '0 8px 16px rgba(91, 143, 185, 0.2)',
  margin: '0 auto 16px',
  animation: `${float} 6s ease-in-out infinite`,
  '& .MuiSvgIcon-root': {
    fontSize: ({ size }) => (size ? size/2 : 28),
    color: '#FFFFFF'
  }
}));

const FloatingShape = styled(Box)(({ theme, delay, size, top, left, right, bottom, color }) => ({
  position: 'absolute',
  width: size || '60px',
  height: size || '60px',
  top: top,
  left: left,
  right: right,
  bottom: bottom,
  borderRadius: '50%',
  background: color || 'linear-gradient(135deg, rgba(91, 143, 185, 0.3), rgba(184, 192, 255, 0.2))',
  animation: `${float} 6s ease-in-out infinite`,
  animationDelay: delay || '0s',
  zIndex: 0,
  opacity: 0.8,
  backdropFilter: 'blur(5px)',
  [theme.breakpoints.down('sm')]: {
    display: 'none', // Hide on small screens to prevent clutter
  },
}));

const StatsBox = styled(Paper)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: '20px 16px',
  margin: '8px 0',
  textAlign: 'center',
  boxShadow: '0 10px 25px rgba(91, 143, 185, 0.08)',
  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 15px 35px rgba(91, 143, 185, 0.12)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(45deg, rgba(91, 143, 185, 0.03) 0%, rgba(184, 192, 255, 0.03) 100%)',
    zIndex: 0,
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #5B8FB9 30%, #7CA6C8 90%)',
  borderRadius: 50,
  border: 0,
  color: '#FFFFFF',
  padding: '12px 36px',
  boxShadow: '0 10px 20px rgba(91, 143, 185, 0.3)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 15px 30px rgba(91, 143, 185, 0.4)',
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 5px 15px rgba(91, 143, 185, 0.4)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)',
    opacity: 0,
    transition: 'opacity 0.5s ease',
  },
  '&:hover::after': {
    opacity: 1,
  },
  [theme.breakpoints.down('sm')]: {
    padding: '10px 24px',
    fontSize: '0.875rem',
  },
}));

const GlowingCircle = styled(Box)(({ theme }) => ({
  width: '220px',
  height: '220px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(91,143,185,0.8) 0%, rgba(91,143,185,0.4) 50%, rgba(91,143,185,0.1) 70%, rgba(91,143,185,0) 100%)',
  animation: `${pulse} 3s infinite`,
  position: 'absolute',
  zIndex: 0,
  [theme.breakpoints.down('md')]: {
    width: '180px',
    height: '180px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '150px',
    height: '150px',
  },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '100%',
  zIndex: 1,
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  position: 'relative',
}));

const LogoIcon = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  backgroundColor: theme.palette.primary.main,
  boxShadow: '0 15px 35px rgba(91, 143, 185, 0.3)',
  animation: `${bounce} 2s ease infinite`,
  '& .MuiSvgIcon-root': {
    fontSize: 45,
    color: '#FFFFFF'
  },
  [theme.breakpoints.down('md')]: {
    width: 70,
    height: 70,
    '& .MuiSvgIcon-root': {
      fontSize: 40,
    }
  },
  [theme.breakpoints.down('sm')]: {
    width: 60,
    height: 60,
    '& .MuiSvgIcon-root': {
      fontSize: 35,
    }
  },
}));

const AnimatedText = styled(Typography)(({ theme, delay }) => ({
  animation: `${fadeIn} 0.8s ${delay || '0s'} forwards`,
  opacity: 0,
  transform: 'translateY(20px)',
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #5B8FB9 30%, #B8C0FF 90%)',
  backgroundSize: '200% 100%',
  color: 'transparent',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  animation: `${shimmer} 3s linear infinite`,
  fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 800,
}));

const FeatureGrid = styled(Grid)(({ theme }) => ({
  maxWidth: 1200,
  margin: '0 auto',
}));
