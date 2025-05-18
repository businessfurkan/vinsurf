// 2024 YKS sınavında çıkan dersler ve konuları
const yksData = {
  "Türkçe": {
    color: "#4285f4",
    topics: [
      "Sözcükte Anlam",
      "Söz Yorumu",
      "Deyim ve Atasözü",
      "Cümlede Anlam",
      "Paragraf",
      "Paragrafta Anlatım Teknikleri",
      "Paragrafta Düşünceyi Geliştirme Yolları",
      "Paragrafta Yapı",
      "Paragrafta Konu-Ana Düşünce",
      "Paragrafta Yardımcı Düşünce",
      "Ses Bilgisi",
      "Yazım Kuralları",
      "Noktalama İşaretleri",
      "Sözcükte Yapı/Ekler",
      "Sözcük Türleri",
      "İsimler",
      "Zamirler",
      "Sıfatlar",
      "Zarflar",
      "Edat – Bağlaç – Ünlem",
      "Fiiller",
      "Fiilde Anlam (Kip-Kişi-Yapı)",
      "Ek Fiil",
      "Fiilimsi",
      "Fiilde Çatı",
      "Sözcük Grupları",
      "Cümlenin Ögeleri",
      "Cümle Türleri",
      "Anlatım Bozukluğu"
    ]
  },
  "Matematik": {
    color: "#34a853",
    topics: [
      "Temel Kavramlar",
      "Sayı Basamakları",
      "Bölme ve Bölünebilme",
      "EBOB – EKOK",
      "Rasyonel Sayılar",
      "Basit Eşitsizlikler",
      "Mutlak Değer",
      "Üslü Sayılar",
      "Köklü Sayılar",
      "Çarpanlara Ayırma",
      "Oran Orantı",
      "Denklem Çözme",
      "Problemler",
      "Sayı Problemleri",
      "Kesir Problemleri",
      "Yaş Problemleri",
      "Hareket Hız Problemleri",
      "İşçi Emek Problemleri",
      "Yüzde Problemleri",
      "Kar Zarar Problemleri",
      "Karışım Problemleri",
      "Grafik Problemleri",
      "Kümeler – Kartezyen Çarpım",
      "Mantık",
      "Fonskiyonlar",
      "Polinomlar",
      "2.Dereceden Denklemler",
      "Permütasyon ve Kombinasyon",
      "Olasılık",
      "Veri – İstatistik"
    ]
  },
  "Fizik": {
    color: "#ea4335",
    topics: [
      "Fizik Bilimine Giriş",
      "Madde ve Özellikleri",
      "Kuvvet ve Hareket",
      "Enerji",
      "Isı ve Sıcaklık",
      "Elektrostatik",
      "Elektrik",
      "Manyetizma",
      "Dalgalar",
      "Optik",
      "Modern Fizik",
      "Atom Fiziği",
      "Çekirdek Fiziği"
    ]
  },
  "Kimya": {
    color: "#fbbc05",
    topics: [
      "Kimya Bilimi",
      "Atom ve Periyodik Sistem",
      "Kimyasal Türler Arası Etkileşimler",
      "Maddenin Halleri",
      "Kimyasal Tepkimeler",
      "Kimyanın Temel Kanunları",
      "Asitler ve Bazlar",
      "Karışımlar",
      "Endüstride ve Canlılarda Enerji",
      "Organik Kimya",
      "Karbon Kimyası",
      "Kimya ve Elektrik",
      "Çözeltiler",
      "Kimyasal Hesaplamalar"
    ]
  },
  "Biyoloji": {
    color: "#0f9d58",
    topics: [
      "Canlıların Yapısı",
      "Hücre",
      "Canlıların Sınıflandırılması",
      "Kalıtım",
      "Ekosistem Ekolojisi",
      "Bitki Biyolojisi",
      "İnsan Fizyolojisi",
      "Sinir Sistemi",
      "Endokrin Sistem",
      "Duyu Organları",
      "Destek ve Hareket Sistemi",
      "Sindirim Sistemi",
      "Dolaşım Sistemi",
      "Solunum Sistemi",
      "Boşaltım Sistemi",
      "Üreme Sistemi",
      "Komünite ve Popülasyon Ekolojisi",
      "Genetik Mühendisliği"
    ]
  },
  "Tarih": {
    color: "#9c27b0",
    topics: [
      "Tarih Bilimi",
      "İlk Çağ Uygarlıkları",
      "İslamiyet Öncesi Türk Tarihi",
      "İslam Tarihi ve Uygarlığı",
      "Türk-İslam Devletleri",
      "Türkiye Tarihi",
      "Osmanlı Devleti Kuruluş Dönemi",
      "Osmanlı Devleti Yükselme Dönemi",
      "Osmanlı Devleti Duraklama Dönemi",
      "Osmanlı Devleti Gerileme Dönemi",
      "Osmanlı Devleti Dağılma Dönemi",
      "I. Dünya Savaşı",
      "Kurtuluş Savaşı",
      "Atatürk Dönemi",
      "İnkılaplar",
      "Çağdaş Türk ve Dünya Tarihi"
    ]
  },
  "Coğrafya": {
    color: "#795548",
    topics: [
      "Doğa ve İnsan",
      "Dünya'nın Şekli ve Hareketleri",
      "Haritalar",
      "İklim Bilgisi",
      "Türkiye'nin İklimi",
      "Yerşekilleri",
      "Türkiye'nin Yerşekilleri",
      "Nüfus",
      "Türkiye'nin Nüfusu",
      "Yerleşme",
      "Türkiye'nin Yerleşme Özellikleri",
      "Ekonomik Faaliyetler",
      "Türkiye Ekonomisi",
      "Bölgesel Kalkınma Projeleri",
      "Uluslararası Ulaşım Hatları",
      "Çevre ve Toplum",
      "Doğal Afetler"
    ]
  },
  "Felsefe": {
    color: "#607d8b",
    topics: [
      "Felsefeye Giriş",
      "Bilgi Felsefesi",
      "Varlık Felsefesi",
      "Ahlak Felsefesi",
      "Sanat Felsefesi",
      "Din Felsefesi",
      "Siyaset Felsefesi",
      "Bilim Felsefesi",
      "Mantık",
      "Psikoloji",
      "Sosyoloji"
    ]
  },
  "Edebiyat": {
    color: "#ff5722",
    topics: [
      "Edebiyat Akımları",
      "Divan Edebiyatı",
      "Halk Edebiyatı",
      "Tanzimat Edebiyatı",
      "Servet-i Fünun Edebiyatı",
      "Fecr-i Ati Edebiyatı",
      "Milli Edebiyat",
      "Cumhuriyet Dönemi Edebiyatı",
      "Şiir Bilgisi",
      "Roman",
      "Hikâye",
      "Tiyatro",
      "Dil Bilgisi",
      "Dünya Edebiyatı"
    ]
  },
  "Din Kültürü": {
    color: "#00bcd4",
    topics: [
      "İnanç",
      "İbadet",
      "Ahlak",
      "Hz. Muhammed'in Hayatı",
      "Kur'an ve Yorumu",
      "İslam Düşüncesi",
      "İslam ve Bilim",
      "Yaşayan Dinler",
      "Vahiy ve Akıl",
      "İslam ve Toplum"
    ]
  },
  "Yabancı Dil (İngilizce)": {
    color: "#3f51b5",
    topics: [
      "Kelime Bilgisi",
      "Dilbilgisi",
      "Okuma Anlama",
      "Diyalog Tamamlama",
      "Paragraf Tamamlama",
      "Cümle Tamamlama",
      "Cloze Test",
      "Çeviri",
      "Eş Anlamlı Cümle Bulma",
      "Yakın Anlamlı Cümle Bulma"
    ]
  }
};

export default yksData;
