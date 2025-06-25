
import { serverTimestamp } from 'firebase/firestore';
import { dataService } from './dataService';

/**
 * Ders programı veri yönetimi servisi
 * Bu servis, ders programı verilerinin hem Firestore'da hem de localStorage'da saklanmasını sağlar.
 */
class ScheduleService {
  /**
   * Ders programını yükler
   * @param {string} userId - Kullanıcı ID'si
   * @returns {Object} - Ders programı
   */
  async loadSchedule(userId) {
    try {
      const scheduleData = await dataService.fetchData('weeklySchedule', userId);
      
      if (scheduleData && scheduleData.length > 0) {
        return scheduleData[0].scheduleData || {};
      }
      
      // Kullanıcının programı yoksa, anonim programı kontrol et ve aktarım yap
      if (userId && userId !== 'anonymous') {
        const anonymousScheduleJson = localStorage.getItem('weeklySchedule_anonymous');
        
        if (anonymousScheduleJson) {
          try {
            const anonymousScheduleData = JSON.parse(anonymousScheduleJson);
            
            if (anonymousScheduleData && Object.keys(anonymousScheduleData).length > 0) {
              console.log('Anonim ders programı bulundu, kullanıcı hesabına aktarılıyor...');
              
              // Anonim programı kullanıcı hesabına kaydet
              await this.saveSchedule(anonymousScheduleData, userId);
              
              // Anonim programı temizle
              localStorage.removeItem('weeklySchedule_anonymous');
              
              console.log('Anonim ders programı başarıyla aktarıldı.');
              
              // Aktarılan programı döndür
              return anonymousScheduleData;
            }
          } catch (parseError) {
            console.error('Anonim ders programı ayrıştırılırken hata:', parseError);
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Ders programı yüklenirken hata oluştu:', error);
      throw error;
    }
  }

  /**
   * Ders programını kaydeder
   * @param {Object} scheduleData - Ders programı verisi
   * @param {string} userId - Kullanıcı ID'si
   * @returns {boolean} - İşlem başarısı
   */
  async saveSchedule(scheduleData, userId) {
    try {
      // Mevcut programı kontrol et
      const existingSchedule = await dataService.fetchData('weeklySchedule', userId);
      
      if (existingSchedule && existingSchedule.length > 0) {
        // Güncelle
        await dataService.updateData('weeklySchedule', existingSchedule[0].id, { 
          scheduleData,
          updatedAt: serverTimestamp()
        }, userId);
      } else {
        // Yeni oluştur
        await dataService.addData('weeklySchedule', { 
          scheduleData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, userId);
      }
      
      return true;
    } catch (error) {
      console.error('Ders programı kaydedilirken hata oluştu:', error);
      return false;
    }
  }

  /**
   * Boş bir ders programı oluşturur
   * @param {Array} daysOfWeek - Haftanın günleri
   * @returns {Object} - Boş ders programı
   */
  createEmptySchedule(daysOfWeek) {
    const emptySchedule = {};
    daysOfWeek.forEach(day => {
      emptySchedule[day] = [];
    });
    return emptySchedule;
  }

  /**
   * Sınıf ekler
   * @param {Object} schedule - Mevcut program
   * @param {string} day - Gün
   * @param {Object} classDetails - Sınıf detayları
   * @returns {Object} - Güncellenmiş program
   */
  addClass(schedule, day, classDetails) {
    const updatedSchedule = { ...schedule };
    const newClass = {
      id: Date.now().toString(),
      ...classDetails,
      createdAt: new Date()
    };
    
    updatedSchedule[day] = [...(updatedSchedule[day] || []), newClass];
    return updatedSchedule;
  }

  /**
   * Sınıf düzenler
   * @param {Object} schedule - Mevcut program
   * @param {string} day - Gün
   * @param {Object} classDetails - Güncellenmiş sınıf detayları (id içeriyor)
   * @returns {Object} - Güncellenmiş program
   */
  updateClass(schedule, day, classDetails) {
    const updatedSchedule = { ...schedule };
    const classIndex = updatedSchedule[day].findIndex(cls => cls.id === classDetails.id);
    
    if (classIndex !== -1) {
      updatedSchedule[day][classIndex] = {
        ...updatedSchedule[day][classIndex],
        ...classDetails,
        updatedAt: new Date()
      };
    }
    
    return updatedSchedule;
  }

  /**
   * Sınıf siler
   * @param {Object} schedule - Mevcut program
   * @param {string} day - Gün
   * @param {string} classId - Sınıf ID'si
   * @returns {Object} - Güncellenmiş program
   */
  deleteClass(schedule, day, classId) {
    const updatedSchedule = { ...schedule };
    updatedSchedule[day] = updatedSchedule[day].filter(cls => cls.id !== classId);
    return updatedSchedule;
  }
}

export const scheduleService = new ScheduleService();
