// Merkezi Renk Sistemi
// Tüm renkleri buradan yönetiyoruz

export const COLORS = {
  // Ana Renkler
  PRIMARY_BG: '#1a0545',        // Ana arkaplan rengi
  SIDEBAR_BG: '#1a0545',        // Sidebar arkaplan rengi
  CARD_BG: '#2d4870',           // Kart arkaplan rengi
  HEADER_BG: '#1a0545',         // Header arkaplan rengi
  
  // Buton Renkleri
  BUTTON_BG: '#2d4870',         // Koyu teal buton arkaplanı
  BUTTON_TEXT: '#ffffff',       // Buton yazı rengi (beyaz)
  BUTTON_HOVER: '#0f4a52',      // Buton hover rengi (daha koyu teal)
  
  // Yazı Renkleri
  TEXT_PRIMARY: '#ffffff',      // Ana yazı rengi
  TEXT_SECONDARY: '#e0e0e0',    // İkincil yazı rengi
  
  // Diğer Renkler
  SHADOW: 'rgba(0, 0, 0, 0.3)', // Gölge rengi
  BORDER: '#1a0545',            // Kenarlık rengi
  
  // Gradient Renkler (Login sayfası için)
  GRADIENT_START: '#1a0545',
  GRADIENT_MID: '#2d4870',
  GRADIENT_END: '#2d4870',

  // Dark Mode Renkleri
  dark: {
    background: '#1a0545',
    backgroundRgb: [52, 84, 39],
    cardBackground: '#2d4870',
    appBarBackground: '#1a0545',
    drawerBackground: '#1a0545',
    text: '#ffffff',
    textSecondary: '#e0e0e0',
    buttonBackground: '#2d4870',
    buttonText: '#ffffff',
  },

  // Light Mode Renkleri (şu an için dark ile aynı)
  light: {
    background: '#1a0545',
    backgroundRgb: [52, 84, 39],
    cardBackground: '#2d4870',
    appBarBackground: '#1a0545',
    drawerBackground: '#1a0545',
    text: '#ffffff',
    textSecondary: '#e0e0e0',
    buttonBackground: '#2d4870',
    buttonText: '#ffffff',
  }
};

// CSS Değişkenleri
export const CSS_VARIABLES = {
  '--background-color': COLORS.PRIMARY_BG,
  '--card-bg-color': COLORS.CARD_BG,
  '--sidebar-bg-color': COLORS.SIDEBAR_BG,
  '--header-bg-color': COLORS.HEADER_BG,
  '--button-bg-color': COLORS.BUTTON_BG,
  '--button-text-color': COLORS.BUTTON_TEXT,
  '--button-hover-color': COLORS.BUTTON_HOVER,
  '--text-primary': COLORS.TEXT_PRIMARY,
  '--text-secondary': COLORS.TEXT_SECONDARY,
  '--shadow-color': COLORS.SHADOW,
  '--border-color': COLORS.BORDER,
};

// CSS değişkenlerini otomatik olarak uygulayan fonksiyon
export const applyCSSVariables = () => {
  const root = document.documentElement;
  Object.entries(CSS_VARIABLES).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

// Renkleri CSS değişkenlerine uygula
export const applyCSSVariablesOld = (colorSet = COLORS.dark) => {
  document.documentElement.style.setProperty('--background-color', colorSet.background);
  document.documentElement.style.setProperty('--card-bg-color', colorSet.cardBackground);
  document.documentElement.style.setProperty('--appbar-bg-color', colorSet.appBarBackground);
  document.documentElement.style.setProperty('--sidebar-bg-color', colorSet.drawerBackground);
  document.documentElement.style.setProperty('--text-primary', colorSet.text);
  document.documentElement.style.setProperty('--text-secondary', colorSet.textSecondary);
  document.documentElement.style.setProperty('--shadow-color', COLORS.SHADOW);
  document.documentElement.style.setProperty('--border-color', COLORS.BORDER);
};

// MUI Theme için renk objesi
export const MUI_COLORS = {
  background: {
    default: COLORS.PRIMARY_BG,
    paper: COLORS.CARD_BG,
  },
  text: {
    primary: COLORS.TEXT_PRIMARY,
    secondary: COLORS.TEXT_SECONDARY,
  },
  sidebar: {
    background: COLORS.SIDEBAR_BG,
  },
};
