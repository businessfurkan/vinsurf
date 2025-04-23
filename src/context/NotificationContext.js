import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Bildirimleri Firestore'dan yükle
  useEffect(() => {
    const loadNotifications = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        
        const querySnapshot = await getDocs(q);
        const notificationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter(n => !n.read).length);
      } catch (error) {
        console.error('Bildirimler yüklenirken hata:', error);
      }
    };
    
    loadNotifications();
    
    // Kullanıcı değiştiğinde bildirimleri yeniden yükle
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        loadNotifications();
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Yeni bildirim ekle
  const addNotification = async (message, type = 'info', additionalData = {}) => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      const newNotification = {
        userId: user.uid,
        message,
        type, // 'info', 'warning', 'success', 'error'
        read: false,
        createdAt: new Date(),
        ...additionalData
      };
      
      const docRef = await addDoc(collection(db, 'notifications'), newNotification);
      
      const addedNotification = {
        id: docRef.id,
        ...newNotification
      };
      
      setNotifications(prev => [addedNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      return addedNotification;
    } catch (error) {
      console.error('Bildirim eklenirken hata:', error);
      return null;
    }
  };
  
  // Bildirimi okundu olarak işaretle
  const markAsRead = async (notificationId) => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Bildirim okundu işaretlenirken hata:', error);
    }
  };
  
  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsRead = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      const batch = writeBatch(db);
      
      notifications.forEach(notification => {
        if (!notification.read) {
          const notificationRef = doc(db, 'notifications', notification.id);
          batch.update(notificationRef, { read: true });
        }
      });
      
      await batch.commit();
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Tüm bildirimler okundu işaretlenirken hata:', error);
    }
  };
  
  // Bildirimi sil
  const deleteNotification = async (notificationId) => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      
      const deletedNotification = notifications.find(n => n.id === notificationId);
      
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Bildirim silinirken hata:', error);
    }
  };
  
  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
