const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Configurar la conexión con la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'CAPSA'
});

// Conectar a la base de datos
db.connect(err => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});


// Ruta para insertar los datos del formulario en la tabla `cliente`
app.post('/clientes', (req, res) => {
    console.log(req.body); // Muestra los datos recibidos del formulario
    const { name, phone, correo, servicio, comunicacion, comentarios } = req.body;

    // Inserción a la base de datos
    const sql = `INSERT INTO cliente 
                 (nombre, telefono, correo_electronico, servicio, comunicacion, dudas) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [name, phone, correo, servicio, comunicacion, comentarios], (err, result) => {
        if (err) {
            console.error('Error al insertar datos:', err);
            return res.status(500).send('Hubo un error al insertar los datos');
        }
        res.send('Datos insertados correctamente');
    });
});

// Crear una ruta para obtener clientes
app.get('/clientes', (req, res) => {
    const sql = 'SELECT * FROM cliente';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(result);
    });
});


app.post('/quejas', (req, res) => {
    const { nombre, apellidos, email, telefono, preferencia_contacto, servicio_contratado, problema_area, especialista, fecha, horario, descripcion } = req.body;

    const query = `INSERT INTO quejas (nombre, apellidos, email, telefono, preferencia_contacto, servicio_contratado, problema_area, especialista, fecha, horario, descripcion)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [nombre, apellidos, email, telefono, preferencia_contacto, servicio_contratado, problema_area, especialista, fecha, horario, descripcion], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al guardar la queja');
        } else {
            res.send('Queja registrada exitosamente');
        }
    });
});

// Configuración de Multer para archivos
const storage = multer.diskStorage({
    destination: './uploads/', // Carpeta donde se guardarán los archivos
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage });

// Ruta para manejar el formulario
app.post('/submit', upload.fields([{ name: 'cv' }, { name: 'cedulaProfesional' }, { name: 'referencias' }]), (req, res) => {
    const { nombreCompleto, correoElectronico, telefonoContacto, direccion, especialidad, horariosDisponibles } = req.body;
    const cv = req.files['cv'] ? req.files['cv'][0].filename : null;
    const cedulaProfesional = req.files['cedulaProfesional'] ? req.files['cedulaProfesional'][0].filename : null;
    const referencias = req.files['referencias'] ? req.files['referencias'][0].filename : null;

    const sql = `INSERT INTO postulaciones 
                 (nombre, correo, telefono, direccion, especialidad, horarios, cv, cedula, referencias) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [nombreCompleto, correoElectronico, telefonoContacto, direccion, especialidad, horariosDisponibles, cv, cedulaProfesional, referencias], (err) => {
        if (err) {
            console.error('Error al insertar datos:', err);
            res.status(500).send('Error en el servidor');
        } else {
            res.status(200).send('Postulación enviada exitosamente');
        }
    });
});

app.post('/verificar', (req, res) => {
    const { nombre, correo, telefono } = req.body;

    const sql = `INSERT INTO verificacion (nombre, correo, telefono) VALUES (?, ?, ?)`;

    db.query(sql, [nombre, correo, telefono], (err, result) => {
        if (err) {
            console.error('Error al guardar los datos:', err);
            res.status(500).send('Error en el servidor');
        } else {
            res.status(200).send('Datos guardados exitosamente');
        }
    });
});

// Servir el formulario en el frontend
app.use(express.static(path.join(__dirname, 'public')));


// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor backend corriendo en el puerto 3000');
});