const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// Sunucu kurulumu
const app = express();
const server = http.createServer(app);

// CORS ayarları
app.use(cors());


// Eğer production ortamındaysa static dosyaları serve et


// Sunucuyu başlat
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
