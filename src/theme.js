import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a0545',
      light: '#2d4870',
      dark: '#1a0545',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2d4870',
      light: '#D1D6FF',
      dark: '#9A9FD8',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#1a0545',
      paper: '#15202b',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b8c7e0',
    },
    typography: {
      fontFamily: '"Poppins", "Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.5px',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.5px',
      },
      h3: {
        fontWeight: 600,
        letterSpacing: '-0.25px',
      },
      h4: {
        fontWeight: 600,
        letterSpacing: '-0.25px',
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        letterSpacing: '0.15px',
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
        letterSpacing: '0.15px',
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.5px',
        textTransform: 'none',
      },
    },
    error: {
      main: '#FF6B6B',
    },
    warning: {
      main: '#FFD166',
    },
    info: {
      main: '#1a0545',
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
          backgroundColor: '#2d4870',
          borderRadius: 16,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(45, 72, 112, 0.15)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
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
          backgroundColor: '#2d4870',
          '&:hover': {
            backgroundColor: '#2d4870',
          },
        },
        containedSecondary: {
          backgroundColor: '#15202b',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1a0545',
          },
        },
        outlined: {
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
          },
        },
        outlinedPrimary: {
          borderColor: '#2d4870',
          color: '#2d4870',
          '&:hover': {
            borderColor: '#2d4870',
            backgroundColor: 'rgba(45, 72, 112, 0.04)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(45, 72, 112, 0.04)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a0545',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a0545',
          color: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a0545',
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
          backgroundColor: '#1a0545',
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
