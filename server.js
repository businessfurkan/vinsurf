const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

// Sunucu kurulumu
const app = express();
const server = http.createServer(app);

// CORS ayarları
app.use(cors());

// Static dosyaları serve et
app.use(express.static(path.join(__dirname, 'build')));

// Client-side routing için tüm GET isteklerini index.html'e yönlendir
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
