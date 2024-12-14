const express = require('express');
const db = require('../db'); // Conexión a la base de datos
const router = express.Router();

// Verificar si el usuario tiene una sesión activa
router.get('/check-session', (req, res) => {
    if (req.session.user) {
        res.json({ status: true, message: 'Sesión activa', user: req.session.user });
    } else {
        res.status(401).json({ status: false, message: 'No autenticado' });
    }
});

// Ruta de login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: false, message: 'Por favor, ingrese usuario y contraseña' });
    }

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ status: false, message: 'Error en el servidor', error: err });
        }

        if (results.length === 0) {
            return res.status(401).json({ status: false, message: 'Credenciales incorrectas' });
        }

        const user = results[0];
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        res.json({ status: true, message: 'Inicio de sesión exitoso', data: req.session.user });
    });
});

// Ruta de logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ status: false, message: 'Error al cerrar sesión' });
        }
        res.json({ status: true, message: 'Cierre de sesión exitoso' });
    });
});

module.exports = router;
