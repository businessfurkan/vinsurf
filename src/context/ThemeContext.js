import React, { createContext, useState, useEffect } from 'react';

// Tema context'i oluşturuyoruz
export const ThemeContext = createContext();

// Tema provider bileşeni
export const ThemeProvider = ({ children }) => {
  // localStorage'dan tema tercihini alıyoruz, yoksa 'light' kullanıyoruz
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // Tema değiştiğinde localStorage'a kaydediyoruz
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Tema değiştiğinde CSS değişkenlerini güncelliyoruz
    if (darkMode) {
      document.documentElement.style.setProperty('--background-color', '#061445');
    } else {
      document.documentElement.style.setProperty('--background-color', '#f4f2f5');
    }
  }, [darkMode]);

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
