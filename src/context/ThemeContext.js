import React, { createContext, useState, useEffect } from 'react';

// Tema context'i oluşturuyoruz
export const ThemeContext = createContext();

// Tema provider bileşeni
// Gece modu için global stil tanımı
const darkModeStyles = `
  body, .MuiBox-root, .MuiContainer-root {
    background-color: #15254f !important;
    color: #ffffff !important;
  }
  
  .MuiPaper-root, .MuiCard-root, .MuiAppBar-root, .MuiDrawer-paper {
    background-color: #1a2a5e !important;
    color: #ffffff !important;
  }
  
  .MuiTypography-root {
    color: #ffffff !important;
  }
  
  .home-card, .card-hover {
    background-color: #1a2a5e !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  }
  
  .MuiDrawer-paper {
    background-color: #0a1445 !important;
  }
`;

// Açık mod için global stil tanımı
const lightModeStyles = `
  body, .MuiBox-root, .MuiContainer-root {
    background-color: #f4f2f5 !important;
    color: #333333 !important;
  }
  
  .MuiPaper-root, .MuiCard-root {
    background-color: #ffffff !important;
    color: #333333 !important;
  }
  
  .MuiAppBar-root {
    background-color: #f4f2f5 !important;
  }
  
  .MuiDrawer-paper {
    background-color: #f4f2f5 !important;
  }
`;

export const ThemeProvider = ({ children }) => {
  // localStorage'dan tema tercihini alıyoruz, yoksa 'light' kullanıyoruz
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  
  // Tüm elementleri zorla güncelle - ÖNEMLİ: useEffect'ten önce tanımlanmalı
  const updateElements = () => {
    try {
      // Ana elementleri güncelle
      const boxes = document.querySelectorAll('.MuiBox-root');
      const papers = document.querySelectorAll('.MuiPaper-root');
      const cards = document.querySelectorAll('.MuiCard-root, .home-card, .card-hover');
      const appbars = document.querySelectorAll('.MuiAppBar-root');
      const drawers = document.querySelectorAll('.MuiDrawer-paper');
      
      // Renkleri zorla güncelle
      if (darkMode) {
        boxes.forEach(el => {
          if (el.style.backgroundColor === '#f4f2f5' || el.style.backgroundColor === 'rgb(244, 242, 245)') {
            el.style.backgroundColor = '#15254f';
          }
        });
        
        papers.forEach(el => {
          el.style.backgroundColor = '#1a2a5e';
          el.style.color = '#ffffff';
        });
        
        cards.forEach(el => {
          el.style.backgroundColor = '#1a2a5e';
          el.style.color = '#ffffff';
          el.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)';
        });
        
        appbars.forEach(el => {
          el.style.backgroundColor = '#15254f';
          el.style.color = '#ffffff';
        });
        
        drawers.forEach(el => {
          el.style.backgroundColor = '#0a1445';
        });
      } else {
        boxes.forEach(el => {
          if (el.style.backgroundColor === '#15254f' || el.style.backgroundColor === 'rgb(21, 37, 79)') {
            el.style.backgroundColor = '#f4f2f5';
          }
        });
        
        papers.forEach(el => {
          el.style.backgroundColor = '#ffffff';
          el.style.color = '#333333';
        });
        
        cards.forEach(el => {
          el.style.backgroundColor = '#ffffff';
          el.style.color = '#333333';
          el.style.boxShadow = '0 8px 32px rgba(77, 77, 0, 0.08), 0 2px 8px rgba(77, 77, 0, 0.05)';
        });
        
        appbars.forEach(el => {
          el.style.backgroundColor = '#f4f2f5';
          el.style.color = '#333333';
        });
        
        drawers.forEach(el => {
          el.style.backgroundColor = '#f4f2f5';
        });
      }
    } catch (error) {
      console.error('Elementleri güncelleme hatası:', error);
    }
  };
  
  // Global stil etiketi oluştur
  useEffect(() => {
    let styleTag = document.getElementById('theme-styles');
    
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'theme-styles';
      document.head.appendChild(styleTag);
    }
    
    return () => {
      if (styleTag && styleTag.parentNode) {
        styleTag.parentNode.removeChild(styleTag);
      }
    };
  }, []);

  // Tema değiştiğinde localStorage'a kaydediyoruz ve stilleri uyguluyoruz
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    // Stil etiketini al
    const styleTag = document.getElementById('theme-styles');
    
    if (styleTag) {
      // Tema değişimine göre stilleri uygula
      if (darkMode) {
        styleTag.innerHTML = darkModeStyles;
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
      } else {
        styleTag.innerHTML = lightModeStyles;
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
      }
    }
    
    // CSS değişkenlerini güncelle
    if (darkMode) {
      document.documentElement.style.setProperty('--background-color', '#15254f');
      document.documentElement.style.setProperty('--card-bg-color', '#1a2a5e');
      document.documentElement.style.setProperty('--appbar-bg-color', '#15254f');
      document.documentElement.style.setProperty('--sidebar-bg-color', '#0a1445');
      document.documentElement.style.setProperty('--text-primary', '#ffffff');
      document.documentElement.style.setProperty('--text-secondary', '#b8c7e0');
    } else {
      document.documentElement.style.setProperty('--background-color', '#f4f2f5');
      document.documentElement.style.setProperty('--card-bg-color', '#ffffff');
      document.documentElement.style.setProperty('--appbar-bg-color', '#f4f2f5');
      document.documentElement.style.setProperty('--sidebar-bg-color', '#f4f2f5');
      document.documentElement.style.setProperty('--text-primary', '#333333');
      document.documentElement.style.setProperty('--text-secondary', '#666666');
    }
    
    // Zorla tüm elementleri güncelle
    updateElements();
    
    // Sayfa yüklendiğinde bir kez daha güncelle (bazı elementler geç yüklenebilir)
    setTimeout(updateElements, 500);
  }, [darkMode, updateElements]);

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    // Yeni tema değerini ayarla
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Tema değişimini hemen uygula
    setTimeout(() => {
      const styleTag = document.getElementById('theme-styles');
      if (styleTag) {
        if (newDarkMode) {
          styleTag.innerHTML = darkModeStyles;
          document.body.classList.add('dark-mode');
          document.body.classList.remove('light-mode');
        } else {
          styleTag.innerHTML = lightModeStyles;
          document.body.classList.add('light-mode');
          document.body.classList.remove('dark-mode');
        }
      }
      
      // CSS değişkenlerini hemen güncelle
      if (newDarkMode) {
        document.documentElement.style.setProperty('--background-color', '#15254f');
        document.documentElement.style.setProperty('--card-bg-color', '#1a2a5e');
        document.documentElement.style.setProperty('--appbar-bg-color', '#15254f');
        document.documentElement.style.setProperty('--sidebar-bg-color', '#0a1445');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#b8c7e0');
      } else {
        document.documentElement.style.setProperty('--background-color', '#f4f2f5');
        document.documentElement.style.setProperty('--card-bg-color', '#ffffff');
        document.documentElement.style.setProperty('--appbar-bg-color', '#f4f2f5');
        document.documentElement.style.setProperty('--sidebar-bg-color', '#f4f2f5');
        document.documentElement.style.setProperty('--text-primary', '#333333');
        document.documentElement.style.setProperty('--text-secondary', '#666666');
      }
      
      // Tüm elementleri zorla güncelle
      try {
        // Ana elementleri güncelle
        const boxes = document.querySelectorAll('.MuiBox-root');
        const papers = document.querySelectorAll('.MuiPaper-root');
        const cards = document.querySelectorAll('.MuiCard-root, .home-card, .card-hover');
        const appbars = document.querySelectorAll('.MuiAppBar-root');
        const drawers = document.querySelectorAll('.MuiDrawer-paper');
        
        if (newDarkMode) {
          document.body.style.backgroundColor = '#15254f';
          
          boxes.forEach(el => {
            el.style.backgroundColor = '#15254f';
          });
          
          papers.forEach(el => {
            el.style.backgroundColor = '#1a2a5e';
            el.style.color = '#ffffff';
          });
          
          cards.forEach(el => {
            el.style.backgroundColor = '#1a2a5e';
            el.style.color = '#ffffff';
          });
          
          appbars.forEach(el => {
            el.style.backgroundColor = '#15254f';
          });
          
          drawers.forEach(el => {
            el.style.backgroundColor = '#0a1445';
          });
        } else {
          document.body.style.backgroundColor = '#f4f2f5';
          
          boxes.forEach(el => {
            el.style.backgroundColor = '#f4f2f5';
          });
          
          papers.forEach(el => {
            el.style.backgroundColor = '#ffffff';
            el.style.color = '#333333';
          });
          
          cards.forEach(el => {
            el.style.backgroundColor = '#ffffff';
            el.style.color = '#333333';
          });
          
          appbars.forEach(el => {
            el.style.backgroundColor = '#f4f2f5';
          });
          
          drawers.forEach(el => {
            el.style.backgroundColor = '#f4f2f5';
          });
        }
      } catch (error) {
        console.error('Tema değiştirme hatası:', error);
      }
    }, 0);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
