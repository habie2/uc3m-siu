const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servir archivos estáticos
app.use('/phone', express.static(path.join(__dirname, 'phone')));
app.use('/kindle', express.static(path.join(__dirname, 'kindle')));

// Rutas para servir las páginas principales
app.get('/phone', (req, res) => {
    res.sendFile(path.join(__dirname, 'phone/index.html'));
});

app.get('/kindle', (req, res) => {
    res.sendFile(path.join(__dirname, 'kindle/index.html'));
});
// TODO: APRENDER A USAR IO O SI ES NECESARIO QUE NI IDEA
// Manejo de conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado:', socket.id);

    socket.on('next-page', () => {
        console.log('Enviando evento: next-page');
        io.emit('next-page');
    });

    socket.on('prev-page', () => {
        console.log('Enviando evento: prev-page');
        io.emit('prev-page');
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });

    socket.on('exit-book', () => {
        console.log('saliendo del libro:');
        io.emit('exit-book');
    });

    socket.on('turn-off', () => {
        console.log('apagando ebook:');
        io.emit('turn-off');
    });
    socket.on('que-leo', () => {
        console.log('buscando que hay que leer en alto:');
        io.emit('que-leo');
    });
    socket.on('texto-leido', (texto) => {
        console.log('Texto recibido del Kindle:', texto);
        io.emit('texto-leido', texto); // Reenviar el texto al Phone
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
