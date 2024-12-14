const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const productsRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const db = require('./db'); // Asegúrate de que exista este archivo para la conexión a MySQL

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para sesiones
app.use(session({
    secret: 'mi_secreto', // Cambia este valor a algo más seguro
    resave: false,
    saveUninitialized: true,
}));

// Middleware para procesar datos y archivos estáticos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/auth', authRoutes);

// Ruta pública para listar productos
app.use('/products', (req, res, next) => {
    if (req.method === 'GET') {
        return next(); // Permitir GET sin autenticación
    }

    // Proteger las demás rutas (POST, DELETE, etc.)
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ status: false, message: 'Acceso denegado' });
    }
    next();
}, productsRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
