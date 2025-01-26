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

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Punto de entrada para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const storage = multer.memoryStorage();  // Almacenamiento en memoria
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5 MB
});
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

        const mensaje = `Nuevo registro en Cliente:
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
app.post('/postulaciones', upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'cedulaProfesional', maxCount: 1 },
]), (req, res) => {
    const { nombreCompleto, correoElectronico, telefonoContacto, direccion, especialidad, horariosDisponibles } = req.body;

    // Verificar que los archivos existen
    const cvFile = req.files['cv'] ? req.files['cv'][0] : null;
    const cedulaFile = req.files['cedulaProfesional'] ? req.files['cedulaProfesional'][0] : null;

    // Convertir horarios disponibles a texto
    const horariosTexto = Array.isArray(horariosDisponibles) ? horariosDisponibles.join(', ') : horariosDisponibles;

    const sql = `INSERT INTO postulaciones_nueva
                 (nombre, correo, telefono, direccion, especialidad, horarios, cv, cedula) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [
        nombreCompleto,
        correoElectronico,
        telefonoContacto,
        direccion,
        especialidad,
        horariosTexto,
        cvFile ? cvFile.originalname : null,
        cedulaFile ? cedulaFile.originalname : null
    ], (err) => {
        if (err) {
            console.error('Error al insertar datos en postulaciones:', err);
            return res.status(500).send('Error al guardar los datos');
        }

        // Crear el mensaje del correo
        const mensaje = `
            Nueva postulación:
            - Nombre: ${nombreCompleto}
            - Correo: ${correoElectronico}
            - Teléfono: ${telefonoContacto}
            - Dirección: ${direccion}
            - Especialidad: ${especialidad}
            - Horarios disponibles: ${horariosTexto}
        `;

        // Crear la lista de archivos adjuntos
        const adjuntos = [];
        if (cvFile) {
            adjuntos.push({ filename: cvFile.originalname, content: cvFile.buffer });
        }
        if (cedulaFile) {
            adjuntos.push({ filename: cedulaFile.originalname, content: cedulaFile.buffer });
        }

        // Configurar el correo para el administrador
        const mailOptions = {
            from: '"Sistema CAPSA" <ana47926@gmail.com>',
            to: 'ana47926@gmail.com',
            subject: 'Nueva postulación registrada',
            text: mensaje,
            attachments: adjuntos
        };

        // Enviar el correo al administrador
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error al enviar el correo al administrador:', err);
                return res.status(500).send('Error al enviar el correo al administrador');
            }
            console.log('Correo al administrador enviado:', info.response);

            // Enviar correo de confirmación al usuario
            const confirmacionMailOptions = {
                from: '"Sistema CAPSA" <ana47926@gmail.com>',
                to: correoElectronico,  // Correo del usuario que hizo la postulación
                subject: 'Confirmación de postulación registrada',
                text: `Hola ${nombreCompleto},\n\nTu postulación ha sido recibida con éxito.\n\nLos detalles de tu postulación son los siguientes:\n\n${mensaje}`,
                attachments: adjuntos // Los mismos archivos adjuntos que se enviaron al administrador
            };

            // Enviar el correo de confirmación al usuario
            transporter.sendMail(confirmacionMailOptions, (err, info) => {
                if (err) {
                    console.error('Error al enviar el correo de confirmación:', err);
                    return res.status(500).send('Error al enviar el correo de confirmación');
                }
                console.log('Correo de confirmación enviado al usuario:', info.response);
                res.send('Datos registrados, correo al administrador y confirmación al usuario enviados con archivos adjuntos');
            });
        });
    });
});


// Ruta para insertar datos en la tabla `verificar` y enviar correo
app.post('/verificar', upload.none(), (req, res) => {
    const { nombre, correo, telefono } = req.body;

    const sql = `INSERT INTO verificar 
                 (nombre, correo, telefono) 
                 VALUES (?, ?, ?)`;

    db.query(sql, [nombre, correo, telefono], (err) => {
        if (err) {
            console.error('Error al insertar datos en verificar:', err);
            return res.status(500).send('Error al guardar los datos');
        }

        const mensaje = `Nuevo registro de verificación:
        Nombre: ${nombre}
        Correo: ${correo}
        Teléfono: ${telefono}`;

        enviarCorreo('Nuevo registro de verificación', mensaje);
        res.send('Datos registrados y correo enviado');
    });
});

// Iniciar el servidor en el puerto 3000
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
