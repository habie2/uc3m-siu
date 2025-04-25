const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');

const options = {
    key: fs.readFileSync('certificados/Killer.key'),
    cert: fs.readFileSync('certificados/Killer.crt'),
};

const app = express();
const server = https.createServer(options, app);
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

    socket.on("pausar-lectura", () => {
        io.emit("pausar-lectura"); // Reenviar el evento a todos los sockets
    });

    socket.on("pointer-move", (data) => {
        // 'data' debería contener la información del movimiento, ej: { deltaX: 5, deltaY: -2 }
        console.log("Recibido pointer-move:", data);
        // Reenviar solo a los otros clientes (al 'kindle')
        socket.broadcast.emit("pointer-move", data);
    });

    socket.on("pointer-click", () => {
        console.log("Recibido pointer-click");
        // Reenviar solo a los otros clientes (al 'kindle')
        socket.broadcast.emit("pointer-click");
    });

    socket.on("start-selecting-text", (data) => {
        console.log("Recibido start-selecting-text:", data);
        socket.broadcast.emit("start-selecting-text", data);
    });

    socket.on("move-selecting-text", (data) => {
        console.log("Recibido move-selecting-text:", data);
        socket.broadcast.emit("move-selecting-text", data);
    });

    socket.on("end-selecting-text", (data) => {
        console.log("Recibido end-selecting-text:", data);
        socket.broadcast.emit("end-selecting-text", data);
    });




});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en https://localhost:${PORT}`);
});
