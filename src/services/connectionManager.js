// Bağlantı durumlarını yerel olarak yönetmek için localStorage kullanımı
// Bu hizmet, WebRTC bağlantılarının durumunu izler ve kesintilerde yeniden bağlanmayı yönetir

// Son bağlantı durumunu localStorage'a kaydet
export const saveConnectionState = (roomId, connected, usersInfo) => {
  try {
    const connectionState = {
      roomId,
      connected,
      usersInfo,
      timestamp: Date.now()
    };
    
    localStorage.setItem('teneffusConnection', JSON.stringify(connectionState));
  } catch (error) {
    console.error("Bağlantı durumu kaydedilemedi:", error);
  }
};

// Kaydedilmiş bağlantı durumunu al
export const getConnectionState = () => {
  try {
    const state = localStorage.getItem('teneffusConnection');
    if (state) {
      return JSON.parse(state);
    }
  } catch (error) {
    console.error("Bağlantı durumu alınamadı:", error);
  }
  
  return null;
};

// Bağlantı kesildiğinde kaydedilmiş son durumu kullan
export const handleDisconnection = (roomId, onReconnect) => {
  const state = getConnectionState();
  
  // Son bağlantı aynı odaya aitse ve 5 dakikadan daha yeni ise
  if (state && state.roomId === roomId && Date.now() - state.timestamp < 5 * 60 * 1000) {
    // Otomatik yeniden bağlantı
    onReconnect(state.usersInfo);
    return true;
  }
  
  return false;
};

// Kesinti sırasında kullanıcı bilgilerini yerel olarak sakla
export const saveUserState = (userId, micActive) => {
  try {
    const userState = {
      userId,
      micActive,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`teneffusUser_${userId}`, JSON.stringify(userState));
  } catch (error) {
    console.error("Kullanıcı durumu kaydedilemedi:", error);
  }
};

// Kaydedilmiş kullanıcı durumunu al
export const getUserState = (userId) => {
  try {
    const state = localStorage.getItem(`teneffusUser_${userId}`);
    if (state) {
      const parsedState = JSON.parse(state);
      
      // Sadece 30 dakikadan daha yeni durumları döndür
      if (Date.now() - parsedState.timestamp < 30 * 60 * 1000) {
        return parsedState;
      }
    }
  } catch (error) {
    console.error("Kullanıcı durumu alınamadı:", error);
  }
  
  return null;
};

// Bağlantı istatistiklerini kaydet
export const saveStats = (roomId, stats) => {
  try {
    const now = new Date();
    const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    
    // Mevcut istatistikleri al
    let allStats = JSON.parse(localStorage.getItem('teneffusStats') || '{}');
    
    // Bugünün istatistiklerini güncelle
    if (!allStats[dayKey]) {
      allStats[dayKey] = {};
    }
    
    if (!allStats[dayKey][roomId]) {
      allStats[dayKey][roomId] = {
        connectionCount: 0,
        totalDuration: 0,
        userCount: 0
      };
    }
    
    // İstatistikleri güncelle
    allStats[dayKey][roomId].connectionCount++;
    allStats[dayKey][roomId].totalDuration += stats.duration;
    allStats[dayKey][roomId].userCount += stats.userCount;
    
    // Firebase'e yükleme başarısız olursa diye localStorage'a yedekle
    localStorage.setItem('teneffusStats', JSON.stringify(allStats));
    
  } catch (error) {
    console.error("İstatistik kaydedilemedi:", error);
  }
};
