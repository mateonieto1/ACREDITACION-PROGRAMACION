const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hydromesh'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err.message);
        return;
    }
    console.log('Conexión exitosa a la base de datos hydromesh');
});

// obtener lista de servicios
app.get('/api/servicios', (req, res) => {
    const sql = 'SELECT * FROM servicios';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error BD' });
        res.json(results);
    });
});

// guardar consulta del front end
app.post('/api/consultas', (req, res) => {
    const { nombre, email, telefono, asunto, servicio_id, mensaje } = req.body;

    if (!nombre || !email || !asunto || !mensaje || mensaje.length < 20) {
        return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }

    const sqlServicio = 'SELECT id_servicio FROM servicios WHERE codigo_frontend = ?';
    db.query(sqlServicio, [servicio_id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error del servidor' });
        const idRealServicio = rows.length > 0 ? rows[0].id_servicio : null;

        const sqlInsert = `INSERT INTO consultas (nombre_cliente, email, telefono, asunto, mensaje, id_servicio, estado) VALUES (?, ?, ?, ?, ?, ?, 'no leída')`;
        db.query(sqlInsert, [nombre, email, telefono || null, asunto, mensaje, idRealServicio], (errInsert, result) => {
            if (errInsert) return res.status(500).json({ error: 'Error al guardar' });
            res.status(201).json({ mensaje: 'Registrado', id: result.insertId });
        });
    });
});

// login de administrador y registro de historial
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;

    const sqlLogin = 'SELECT id_admin, nombre_completo FROM administradores WHERE usuario = ? AND password = ?';
    db.query(sqlLogin, [usuario, password], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error del servidor' });

        if (results.length > 0) {
            const admin = results[0];
            const sqlHistorial = 'INSERT INTO historial_accesos (id_admin) VALUES (?)';
            db.query(sqlHistorial, [admin.id_admin], () => {
                res.json({ mensaje: 'Login exitoso', nombre: admin.nombre_completo });
            });
        } else {
            res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }
    });
});

// las consultas para el panel de control
app.get('/api/admin/consultas', (req, res) => {
    // join paara traer el nombre del servicio
    const sql = `
        SELECT c.id_consulta, c.fecha_envio, c.nombre_cliente, c.asunto, c.estado, s.nombre_servicio 
        FROM consultas c 
        LEFT JOIN servicios s ON c.id_servicio = s.id_servicio 
        ORDER BY c.fecha_envio DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener consultas' });
        res.json(results);
    });
});

// marcar consulta como leida
app.put('/api/admin/consultas/:id/leer', (req, res) => {
    const idConsulta = req.params.id;
    const sql = "UPDATE consultas SET estado = 'leída' WHERE id_consulta = ?";
    
    db.query(sql, [idConsulta], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar el estado' });
        res.json({ mensaje: 'Estado actualizado correctamente' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});