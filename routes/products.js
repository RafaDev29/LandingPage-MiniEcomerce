const express = require('express');
const multer = require('multer');
const db = require('../db');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configuración de multer para cargar imágenes
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/images'),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Ruta para agregar un producto
router.post('/add', upload.single('image'), (req, res) => {
    const { name, price, quantity } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : null; // Prefijo `/images/`

    if (!name || !price || !quantity || !imagePath) {
        return res.status(400).json({ status: false, message: 'Todos los campos son obligatorios' });
    }

    const query = 'INSERT INTO products (name, price, quantity, image_path) VALUES (?, ?, ?, ?)';
    db.query(query, [name, price, quantity, imagePath], (err, result) => {
        if (err) {
            return res.status(500).json({ status: false, message: 'Error al agregar producto', error: err });
        }
        res.json({ status: true, message: 'Producto agregado correctamente', data: { id: result.insertId, name, price, quantity, imagePath } });
    });
});

// Ruta para obtener todos los productos
router.get('/', (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ status: false, message: 'Error al obtener productos', error: err });
        }
        res.json({ status: true, message: 'Lista de productos', data: results });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const querySelect = 'SELECT image_path FROM products WHERE id = ?';
    db.query(querySelect, [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ status: false, message: 'Producto no encontrado' });
        }

        const imagePath = path.join(__dirname, '../public/', results[0].image_path);

        // Eliminar el producto de la base de datos
        const queryDelete = 'DELETE FROM products WHERE id = ?';
        db.query(queryDelete, [id], (err) => {
            if (err) {
                return res.status(500).json({ status: false, message: 'Error al eliminar producto', error: err });
            }

            // Eliminar la imagen del sistema de archivos
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error al eliminar imagen:', err);
                }
            });

            res.json({ status: true, message: 'Producto eliminado correctamente' });
        });
    });
});


module.exports = router;
