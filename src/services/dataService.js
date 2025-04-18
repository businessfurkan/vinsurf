import { auth, db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Güvenilir veri saklama servisi
 * Bu servis, verilerin hem Firestore'da hem de localStorage'da saklanmasını sağlar.
 * İnternet bağlantısı olmadığında bile verilerin kaybolmamasını garanti eder.
 */
class DataService {
  /**
   * Veri koleksiyonundan veri çeker
   * @param {string} collectionName - Firestore koleksiyon adı
   * @param {string} userId - Kullanıcı ID'si
   * @param {string} orderByField - Sıralama alanı (isteğe bağlı)
   * @param {string} orderDirection - Sıralama yönü ('asc' veya 'desc', varsayılan: 'desc')
   * @returns {Array} - Veri dizisi
   */
  async fetchData(collectionName, userId, orderByField = 'createdAt', orderDirection = 'desc') {
    if (!collectionName) {
      throw new Error('Koleksiyon adı gereklidir');
    }

    // Önce localStorage'dan verileri yükle
    let cachedRecords = [];
    try {
      const storageKey = userId ? `${collectionName}_${userId}` : `${collectionName}_anonymous`;
      const cachedData = localStorage.getItem(storageKey);
      
      if (cachedData) {
        cachedRecords = JSON.parse(cachedData);
        
        // Tarih alanlarını Date nesnelerine dönüştür
        cachedRecords = cachedRecords.map(record => {
          const processedRecord = { ...record };
          
          // Tarih alanlarını işle
          ['date', 'createdAt', 'updatedAt', 'expiresAt'].forEach(dateField => {
            if (processedRecord[dateField]) {
              processedRecord[dateField] = new Date(processedRecord[dateField]);
            }
          });
          
          return processedRecord;
        });
        
        // Eğer kullanıcı giriş yapmışsa ve cachedRecords boşsa, anonim verileri kontrol et
        if (userId && userId !== 'anonymous' && (!cachedRecords || cachedRecords.length === 0)) {
          const anonymousKey = `${collectionName}_anonymous`;
          const anonymousData = localStorage.getItem(anonymousKey);
          
          if (anonymousData) {
            const anonymousRecords = JSON.parse(anonymousData);
            
            if (anonymousRecords && anonymousRecords.length > 0) {
              console.log(`Anonim kayıtlar bulundu, ${userId} kullanıcısının hesabına aktarılıyor...`);
              
              // Anonim kayıtları işle ve kullanıcı ID'sini ekle
              const processedAnonymousRecords = anonymousRecords.map(record => ({
                ...record,
                userId
              }));
              
              // Firestore'a kaydet ve cachedRecords'a ekle
              for (const anonRecord of processedAnonymousRecords) {
                try {
                  if (!anonRecord.id.startsWith('local_')) {
                    // Eğer local_ ile başlamıyorsa, yeni bir kayıt oluştur
                    anonRecord.id = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                  }
                  // cachedRecords'a ekle
                  cachedRecords.push(anonRecord);
                } catch (error) {
                  console.error('Anonim kaydı aktarırken hata:', error);
                }
              }
              
              // Kullanıcı verilerini localStorage'a kaydet
              localStorage.setItem(storageKey, JSON.stringify(cachedRecords));
              
              // Anonim verileri temizle
              localStorage.removeItem(anonymousKey);
              
              console.log(`${processedAnonymousRecords.length} anonim kayıt başarıyla aktarıldı`);
            }
          }
        }
      }
    } catch (localStorageError) {
      console.error(`Error loading ${collectionName} from localStorage:`, localStorageError);
    }
    
    // Kullanıcı oturum açmamışsa sadece localStorage verilerini döndür
    if (!userId || userId === 'anonymous') {
      return cachedRecords;
    }
    
    try {
      // Kullanıcı ID'sini localStorage'a kaydet
      localStorage.setItem(`last${collectionName}UserId`, userId);
      
      // Firestore'dan verileri çek
      let q;
      if (orderByField) {
        q = query(
          collection(db, collectionName),
          where('userId', '==', userId),
          orderBy(orderByField, orderDirection)
        );
      } else {
        q = query(
          collection(db, collectionName),
          where('userId', '==', userId)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const records = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Firestore timestamp'lerini JavaScript Date nesnelerine dönüştür
        const processedData = { ...data };
        
        // Tarih alanlarını işle
        ['date', 'createdAt', 'updatedAt', 'expiresAt'].forEach(dateField => {
          if (processedData[dateField]) {
            if (processedData[dateField] instanceof Date) {
              // Zaten Date nesnesi
            } else if (processedData[dateField]?.toDate) {
              // Firestore Timestamp
              processedData[dateField] = processedData[dateField].toDate();
            } else if (processedData[dateField]?.seconds) {
              // Timestamp benzeri nesne
              processedData[dateField] = new Date(processedData[dateField].seconds * 1000);
            } else if (typeof processedData[dateField] === 'string') {
              // String tarih
              processedData[dateField] = new Date(processedData[dateField]);
            }
          }
        });
        
        records.push({
          id: doc.id,
          ...processedData
        });
      });
      
      // Firestore ve localStorage verilerini birleştir
      const mergedRecords = [...records];
      
      // localStorage'da olup Firestore'da olmayan kayıtları ekle
      cachedRecords.forEach(cachedRecord => {
        if (!records.some(r => r.id === cachedRecord.id)) {
          // Eğer bu kayıt local_ ile başlıyorsa, bu yerel bir kayıttır
          // veya Firestore'a kaydedilememiş bir kayıttır
          mergedRecords.push(cachedRecord);
        }
      });
      
      // Kayıtları tarihe göre sırala
      if (orderByField) {
        mergedRecords.sort((a, b) => {
          const valueA = a[orderByField] instanceof Date ? a[orderByField] : new Date(a[orderByField] || 0);
          const valueB = b[orderByField] instanceof Date ? b[orderByField] : new Date(b[orderByField] || 0);
          
          return orderDirection === 'desc' ? valueB - valueA : valueA - valueB;
        });
      }
      
      // Verileri localStorage'a kaydet
      try {
        const storageKey = `${collectionName}_${userId}`;
        localStorage.setItem(storageKey, JSON.stringify(mergedRecords));
      } catch (localStorageError) {
        console.error(`Error saving ${collectionName} to localStorage:`, localStorageError);
      }
      
      return mergedRecords;
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      
      // Hata durumunda localStorage'dan verileri döndür
      console.log(`Recovering ${collectionName} from localStorage due to fetch error`);
      return cachedRecords;
    }
  }

  /**
   * Veri koleksiyonuna yeni bir kayıt ekler
   * @param {string} collectionName - Firestore koleksiyon adı
   * @param {Object} data - Kaydedilecek veri
   * @param {string} userId - Kullanıcı ID'si
   * @returns {Object} - Kaydedilen veri (ID dahil)
   */
  async addData(collectionName, data, userId) {
    if (!collectionName) {
      throw new Error('Koleksiyon adı gereklidir');
    }
    
    // Temel veri alanlarını ekle
    const newRecord = {
      ...data,
      userId: userId || 'anonymous',
      createdAt: new Date(),
      updatedAt: new Date(),
      // 24 ay sonra sona erecek
      expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 24))
    };
    
    let docId = '';
    
    // Kullanıcı oturum açmışsa Firestore'a kaydet
    if (userId && userId !== 'anonymous') {
      try {
        // Firestore'a kaydet
        const docRef = await addDoc(collection(db, collectionName), {
          ...newRecord,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        docId = docRef.id;
      } catch (firestoreError) {
        console.error(`Error saving to Firestore (${collectionName}):`, firestoreError);
        // Yerel ID oluştur
        docId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        console.warn(`Created local ID ${docId} due to Firestore error`);
      }
    } else {
      // Yerel ID oluştur
      docId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // ID'yi ekle
    const recordWithId = {
      id: docId,
      ...newRecord
    };
    
    // localStorage'dan mevcut verileri al
    let existingRecords = [];
    try {
      const storageKey = userId ? `${collectionName}_${userId}` : `${collectionName}_anonymous`;
      const existingData = localStorage.getItem(storageKey);
      
      if (existingData) {
        existingRecords = JSON.parse(existingData);
      }
    } catch (localStorageError) {
      console.error(`Error loading existing ${collectionName} from localStorage:`, localStorageError);
    }
    
    // Yeni kaydı ekle ve localStorage'a kaydet
    const updatedRecords = [recordWithId, ...existingRecords];
    
    try {
      const storageKey = userId ? `${collectionName}_${userId}` : `${collectionName}_anonymous`;
      localStorage.setItem(storageKey, JSON.stringify(updatedRecords));
      
      if (userId) {
        localStorage.setItem(`last${collectionName}UserId`, userId);
      }
    } catch (localStorageError) {
      console.error(`Error saving ${collectionName} to localStorage:`, localStorageError);
    }
    
    return recordWithId;
  }

  /**
   * Bir kaydı günceller
   * @param {string} collectionName - Firestore koleksiyon adı
   * @param {string} id - Güncellenecek kaydın ID'si
   * @param {Object} data - Güncellenecek veriler
   * @param {string} userId - Kullanıcı ID'si
   * @returns {Object} - Güncellenen kayıt
   */
  async updateData(collectionName, id, data, userId) {
    if (!collectionName || !id) {
      throw new Error('Koleksiyon adı ve ID gereklidir');
    }
    
    // Güncelleme alanlarını ekle
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    // Yerel olmayan bir kayıt ve kullanıcı oturum açmışsa Firestore'da güncelle
    if (userId && userId !== 'anonymous' && !id.startsWith('local_')) {
      try {
        // Firestore'da güncelle
        await updateDoc(doc(db, collectionName, id), {
          ...updateData,
          updatedAt: serverTimestamp()
        });
      } catch (firestoreError) {
        console.error(`Error updating in Firestore (${collectionName}):`, firestoreError);
      }
    }
    
    // localStorage'dan mevcut verileri al
    let existingRecords = [];
    try {
      const storageKey = userId ? `${collectionName}_${userId}` : `${collectionName}_anonymous`;
      const existingData = localStorage.getItem(storageKey);
      
      if (existingData) {
        existingRecords = JSON.parse(existingData);
      }
    } catch (localStorageError) {
      console.error(`Error loading existing ${collectionName} from localStorage:`, localStorageError);
    }
    
    // Kaydı güncelle
    const updatedRecords = existingRecords.map(record => {
      if (record.id === id) {
        return {
          ...record,
          ...updateData
        };
      }
      return record;
    });
    
    // localStorage'a kaydet
    try {
      const storageKey = userId ? `${collectionName}_${userId}` : `${collectionName}_anonymous`;
      localStorage.setItem(storageKey, JSON.stringify(updatedRecords));
    } catch (localStorageError) {
      console.error(`Error saving updated ${collectionName} to localStorage:`, localStorageError);
    }
    
    // Güncellenen kaydı bul ve döndür
    const updatedRecord = updatedRecords.find(record => record.id === id);
    return updatedRecord;
  }

  /**
   * Bir kaydı siler
   * @param {string} collectionName - Firestore koleksiyon adı
   * @param {string} id - Silinecek kaydın ID'si
   * @param {string} userId - Kullanıcı ID'si
   * @returns {boolean} - İşlem başarılı mı?
   */
  async deleteData(collectionName, id, userId) {
    if (!collectionName || !id) {
      throw new Error('Koleksiyon adı ve ID gereklidir');
    }
    
    // Yerel olmayan bir kayıt ve kullanıcı oturum açmışsa Firestore'dan sil
    if (userId && userId !== 'anonymous' && !id.startsWith('local_')) {
      try {
        // Firestore'dan sil
        await deleteDoc(doc(db, collectionName, id));
      } catch (firestoreError) {
        console.error(`Error deleting from Firestore (${collectionName}):`, firestoreError);
      }
    }
    
    // localStorage'dan mevcut verileri al
    let existingRecords = [];
    try {
      const storageKey = userId ? `${collectionName}_${userId}` : `${collectionName}_anonymous`;
      const existingData = localStorage.getItem(storageKey);
      
      if (existingData) {
        existingRecords = JSON.parse(existingData);
      }
    } catch (localStorageError) {
      console.error(`Error loading existing ${collectionName} from localStorage:`, localStorageError);
    }
    
    // Kaydı sil
    const updatedRecords = existingRecords.filter(record => record.id !== id);
    
    // localStorage'a kaydet
    try {
      const storageKey = userId ? `${collectionName}_${userId}` : `${collectionName}_anonymous`;
      localStorage.setItem(storageKey, JSON.stringify(updatedRecords));
      
      // Son kaydı siliyorsak, son kullanıcı ID'sini kaydet
      if (userId && updatedRecords.length === 0) {
        localStorage.setItem(`last${collectionName}UserId`, userId);
      }
    } catch (localStorageError) {
      console.error(`Error saving updated ${collectionName} to localStorage after deletion:`, localStorageError);
    }
    
    return true;
  }

  /**
   * Çevrimdışı kayıtları Firestore ile senkronize eder
   * @param {string} collectionName - Firestore koleksiyon adı
   * @param {string} userId - Kullanıcı ID'si
   */
  async syncOfflineRecords(collectionName, userId) {
    if (!collectionName || !userId || userId === 'anonymous') {
      return;
    }
    
    try {
      // localStorage'dan verileri al
      const storageKey = `${collectionName}_${userId}`;
      const cachedData = localStorage.getItem(storageKey);
      
      if (!cachedData) {
        return;
      }
      
      const cachedRecords = JSON.parse(cachedData);
      
      // Yerel kayıtları bul
      const localRecords = cachedRecords.filter(record => record.id.startsWith('local_'));
      
      if (localRecords.length === 0) {
        return;
      }
      
      console.log(`Syncing ${localRecords.length} offline records for ${collectionName}`);
      
      // Her yerel kaydı Firestore'a ekle
      for (const record of localRecords) {
        try {
          const { id, ...recordData } = record;
          
          // Firestore'a ekle
          const docRef = await addDoc(collection(db, collectionName), {
            ...recordData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Yeni ID ile güncelle
          const updatedRecords = cachedRecords.map(r => {
            if (r.id === id) {
              return {
                ...r,
                id: docRef.id
              };
            }
            return r;
          });
          
          // localStorage'a kaydet
          localStorage.setItem(storageKey, JSON.stringify(updatedRecords));
          
          console.log(`Synced offline record ${id} to Firestore with new ID ${docRef.id}`);
        } catch (error) {
          console.error(`Error syncing offline record ${record.id}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error syncing offline records for ${collectionName}:`, error);
    }
  }
}

export const dataService = new DataService();
