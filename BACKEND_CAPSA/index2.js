const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'CAPSA'
});

db.connect(err => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Cambiar según el proveedor de correo
    auth: {
        user: 'tu_correo@gmail.com', // Cambiar por el correo que envía los correos
        pass: 'tu_contraseña'        // Usar app password o credenciales seguras
    }
});

// Ruta para insertar datos y enviar correo
app.post('/clientes', (req, res) => {
    const { name, phone, correo, servicio, comunicacion, comentarios } = req.body;

    // Guardar en la base de datos
    const sql = `INSERT INTO cliente 
                 (nombre, telefono, correo_electronico, servicio, comunicacion, dudas) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [name, phone, correo, servicio, comunicacion, comentarios], (err) => {
        if (err) {
            console.error('Error al insertar datos:', err);
            return res.status(500).send('Error al guardar los datos');
        }

        // Configuración del correo
        const mailOptions = {
            from: '"Sistema de Contacto" <tu_correo@gmail.com>', // Nombre genérico del sistema
            to: 'correo_admin@gmail.com', // Cambiar por el correo del administrador
            subject: 'Nuevo Cliente Registrado',
            text: `
                ¡Hola Administrador!

                Un nuevo cliente se ha registrado con los siguientes datos:
                - Nombre: ${name}
                - Teléfono: ${phone}
                - Correo: ${correo}
                - Servicio solicitado: ${servicio}
                - Comunicación preferida: ${comunicacion}
                - Comentarios: ${comentarios}

                Verifica los detalles en tu sistema.
            `
        };

        // Enviar correo
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error al enviar el correo:', err);
                return res.status(500).send('Error al enviar el correo');
            }
            console.log('Correo enviado:', info.response);
            res.send('Datos guardados y correo enviado correctamente');
        });
    });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
