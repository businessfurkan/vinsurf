import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5B8FB9',
      light: '#7CA6C8',
      dark: '#3D6F94',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#B8C0FF',
      light: '#D1D6FF',
      dark: '#9A9FD8',
      contrastText: '#333333',
    },
    background: {
      default: '#FFFFF0',
      paper: '#FFFFF0',
    },
    text: {
      primary: '#303545',
      secondary: '#5F6477',
    },
    error: {
      main: '#FF6B6B',
    },
    warning: {
      main: '#FFD166',
    },
    info: {
      main: '#5B8FB9',
    },
    success: {
      main: '#06D6A0',
    },
  },
  typography: {
    fontFamily: 'Glacial Indifference, Montserrat, Arial, sans-serif',
    h1: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    button: {
      fontFamily: 'Glacial Indifference, Montserrat, sans-serif',
      fontWeight: 500,
      textTransform: 'none',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(91, 143, 185, 0.15)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          transition: 'background-color 0.3s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          backgroundColor: '#5B8FB9',
          '&:hover': {
            backgroundColor: '#3D6F94',
          },
        },
        containedSecondary: {
          backgroundColor: '#B8C0FF',
          color: '#333333',
          '&:hover': {
            backgroundColor: '#9A9FD8',
          },
        },
        outlined: {
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
          },
        },
        outlinedPrimary: {
          borderColor: '#5B8FB9',
          color: '#5B8FB9',
          '&:hover': {
            borderColor: '#3D6F94',
            backgroundColor: 'rgba(91, 143, 185, 0.04)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(91, 143, 185, 0.04)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#303545',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#F5F7FA',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.03)',
    '0px 4px 8px rgba(0, 0, 0, 0.04)',
    '0px 6px 12px rgba(0, 0, 0, 0.05)',
    '0px 8px 16px rgba(0, 0, 0, 0.06)',
    '0px 10px 20px rgba(0, 0, 0, 0.07)',
    '0px 12px 24px rgba(0, 0, 0, 0.08)',
    '0px 14px 28px rgba(0, 0, 0, 0.09)',
    '0px 16px 32px rgba(0, 0, 0, 0.1)',
    '0px 18px 36px rgba(0, 0, 0, 0.11)',
    '0px 20px 40px rgba(0, 0, 0, 0.12)',
    '0px 22px 44px rgba(0, 0, 0, 0.13)',
    '0px 24px 48px rgba(0, 0, 0, 0.14)',
    '0px 26px 52px rgba(0, 0, 0, 0.15)',
    '0px 28px 56px rgba(0, 0, 0, 0.16)',
    '0px 30px 60px rgba(0, 0, 0, 0.17)',
    '0px 32px 64px rgba(0, 0, 0, 0.18)',
    '0px 34px 68px rgba(0, 0, 0, 0.19)',
    '0px 36px 72px rgba(0, 0, 0, 0.2)',
    '0px 38px 76px rgba(0, 0, 0, 0.21)',
    '0px 40px 80px rgba(0, 0, 0, 0.22)',
    '0px 42px 84px rgba(0, 0, 0, 0.23)',
    '0px 44px 88px rgba(0, 0, 0, 0.24)',
    '0px 46px 92px rgba(0, 0, 0, 0.25)',
    '0px 48px 96px rgba(0, 0, 0, 0.26)',
  ],
});

export default theme;
