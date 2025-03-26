const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;


// Punto de entrada para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const storage = multer.memoryStorage();  // Almacenamiento en memoria
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5 MB
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Configuración de la conexión con la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
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

// Configuración de nodemailer con tls: rejectUnauthorized: false para ignorar el error de certificado
const transporter = nodemailer.createTransport({
    service: 'gmail', // Cambiar según tu proveedor de correo
    auth: {
        user: 'ana47926@gmail.com', // Reemplaza con tu correo
        pass: 'oakn fklh vsso xvvr'  // Usa un app password o credenciales seguras
    },
    tls: {
        rejectUnauthorized: false  // Ignorar errores de certificados no verificados
    }
});

// Función para enviar correos
const enviarCorreo = (asunto, mensaje, archivosAdjuntos) => {
    const mailOptions = {
        from: '"Sistema CAPSA" <ana47926@gmail.com>',
        to: 'ana47926@gmail.com',
        subject: asunto,
        text: mensaje,
        attachments: archivosAdjuntos, // Aquí se pasan los adjuntos
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error al enviar correo:', err);
        } else {
            console.log('Correo enviado:', info.response);
        }
    });
};

// Ruta para insertar datos en la tabla `clientes` y enviar correo
app.post('/clientes', (req, res) => {
    const { name, phone, correo, servicio, comunicacion, comentarios } = req.body;

    const sql = `INSERT INTO cliente 
                 (nombre, telefono, correo_electronico, servicio, comunicacion, dudas) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [name, phone, correo, servicio, comunicacion, comentarios], (err) => {
        if (err) {
            console.error('Error al insertar datos en cliente:', err);
            return res.status(500).send('Error al guardar los datos');
        }

        const mensaje = `Nuevo registro para aclaración de dudas:
        Nombre: ${name}
        Teléfono: ${phone}
        Correo: ${correo}
        Servicio: ${servicio}
        Comunicación: ${comunicacion}
        Comentarios: ${comentarios}`;

        enviarCorreo('Nuevo registro en Cliente', mensaje);
        res.send('Datos registrados y correo enviado');
    });
});

// Ruta para insertar datos en la tabla `postulaciones` y enviar correo
app.post(
    '/postulaciones',
    upload.fields([
        { name: 'cv', maxCount: 1 },
        { name: 'cedulaProfesional', maxCount: 1 },
    ]),
    (req, res) => {
        const {
            nombreCompleto,
            correoElectronico,
            telefonoContacto,
            direccion,
            especialidad,
            horariosDisponibles,
        } = req.body;

        // Construir el mensaje del correo
        const mensaje = `
            Nueva postulación recibida:
            - Nombre Completo: ${nombreCompleto}
            - Correo Electrónico: ${correoElectronico}
            - Teléfono: ${telefonoContacto}
            - Dirección: ${direccion || 'No especificada'}
            - Especialidad: ${especialidad || 'No especificada'}
            - Horarios Disponibles: ${horariosDisponibles || 'No especificados'}`;

        // Preparar los archivos como adjuntos
        const archivosAdjuntos = [];
        if (req.files['cv']) {
            archivosAdjuntos.push({
                filename: req.files['cv'][0].originalname,
                content: req.files['cv'][0].buffer,
            });
        }
        if (req.files['cedulaProfesional']) {
            archivosAdjuntos.push({
                filename: req.files['cedulaProfesional'][0].originalname,
                content: req.files['cedulaProfesional'][0].buffer,
            });
        }
        
        // Enviar el correo
        enviarCorreo('Nueva Postulación', mensaje, archivosAdjuntos);
        res.json({ message: "Los datos se han guardado correctamente." });


    }
);


// Ruta para insertar datos en la tabla `verificar` y enviar correo
app.post('/verificar', upload.none(), (req, res) => {
    const { nombre, correo, telefono } = req.body;

    const sql = `INSERT INTO verificacion 
                 (nombre, correo, telefono) 
                 VALUES (?, ?, ?)`;

    db.query(sql, [nombre, correo, telefono], (err) => {
        if (err) {
            console.error('Error al insertar datos en verificar:', err);
            return res.status(500).send('Error al guardar los datos');
        }

        const mensaje = `Nuevo registro para opinión:
        Nombre: ${nombre}
        Correo: ${correo}
        Teléfono: ${telefono}`;

        enviarCorreo('Nuevo registro de verificación', mensaje);
        res.json({ success: 'Datos enviados correctamente' });

    });
});

// Iniciar el servidor en el puerto 3000
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
