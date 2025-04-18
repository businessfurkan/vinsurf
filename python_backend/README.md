# Python Backend for YKS Study App

Bu klasör, YKS Study App'in Python entegrasyonu için gerekli backend kodunu içerir. Bu backend, React uygulamasından gönderilen Python kodlarını çalıştırmak ve sonuçları geri döndürmek için bir Flask API sunucusu sağlar.

## Kurulum

1. Python 3.7 veya daha yeni bir sürümün yüklü olduğundan emin olun.
2. Gerekli paketleri yükleyin:

```bash
pip install -r requirements.txt
```

## Çalıştırma

Backend'i çalıştırmak için:

```bash
python app.py
```

Bu komut, 5000 portunda bir Flask sunucusu başlatacaktır (http://localhost:5000).

## API Endpoints

### 1. `/api/run-python` (POST)

Python kodunu çalıştırmak için kullanılır.

**İstek:**
```json
{
  "code": "print('Merhaba Dünya')"
}
```

**Başarılı Yanıt:**
```json
{
  "success": true,
  "output": "Merhaba Dünya\n",
  "variables": {}
}
```

**Hata Yanıtı:**
```json
{
  "success": false,
  "error": "name 'undefined_variable' is not defined",
  "traceback": "Traceback (most recent call last):\n...",
  "output": ""
}
```

### 2. `/api/health` (GET)

Backend'in çalışıp çalışmadığını kontrol etmek için kullanılır.

**Yanıt:**
```json
{
  "status": "ok",
  "message": "Python backend is running"
}
```

## Güvenlik Notları

- Bu backend, kullanıcıdan gelen herhangi bir Python kodunu çalıştırabilir. Güvenlik nedeniyle, bu backend'i yalnızca yerel geliştirme ortamında kullanın.
- Üretim ortamında kullanmadan önce, kod yürütme güvenliğini artırmak için ek önlemler alınmalıdır.

## Entegrasyon

React uygulaması, axios veya fetch API kullanarak bu backend'e HTTP istekleri gönderir. Performans.js dosyası, bu entegrasyonu yönetir.
