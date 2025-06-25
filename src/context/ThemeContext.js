import React, { createContext, useContext, useState, useEffect } from 'react';
import { COLORS, applyCSSVariables } from '../styles/colors';

const ThemeContext = createContext();

// Export ThemeContext for direct access
export { ThemeContext };

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Sayfa yüklendiğinde CSS değişkenlerini uygula
    applyCSSVariables();
    
    // Tema değişikliklerini uygula
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  const applyTheme = (darkMode) => {
    const colorSet = darkMode ? COLORS.dark : COLORS.light;
    
    // CSS değişkenlerini güncelle
    document.documentElement.style.setProperty('--background-color', colorSet.background);
    document.documentElement.style.setProperty('--card-bg-color', colorSet.cardBackground);
    document.documentElement.style.setProperty('--appbar-bg-color', colorSet.appBarBackground);
    document.documentElement.style.setProperty('--sidebar-bg-color', colorSet.drawerBackground);
    document.documentElement.style.setProperty('--text-primary', colorSet.text);
    document.documentElement.style.setProperty('--text-secondary', colorSet.textSecondary);
    document.documentElement.style.setProperty('--button-bg-color', colorSet.buttonBackground);
    document.documentElement.style.setProperty('--button-text-color', colorSet.buttonText);

    // Body arkaplan rengini güncelle
    document.body.style.backgroundColor = colorSet.background;
    
    // Sidebar ve diğer elementlerin arkaplan rengini güncelle
    const sidebarElements = document.querySelectorAll('.MuiDrawer-paper, .sidebar');
    sidebarElements.forEach(element => {
      element.style.backgroundColor = colorSet.drawerBackground;
    });

    // Kartların arkaplan rengini güncelle
    const cardElements = document.querySelectorAll('.MuiCard-root, .MuiPaper-root');
    cardElements.forEach(element => {
      element.style.backgroundColor = colorSet.cardBackground;
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? COLORS.dark : COLORS.light,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
