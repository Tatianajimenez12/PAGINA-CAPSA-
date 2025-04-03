require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CohereClient } = require('cohere-ai');

const app = express();
const port = process.env.PORT || 3000;

// ======================
// 1. Configuración Inicial
// ======================
const requiredEnvVars = ['COHERE_API_KEY', 'DB_HOST', 'DB_USER', 'DB_NAME', 'GMAIL_USER', 'GMAIL_APP_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Faltan variables de entorno:', missingVars);
  process.exit(1);
}

// ======================
// 2. Configuración Cohere
// ======================
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

// Cargar prompt del sistema
let systemPrompt;
try {
  systemPrompt = fs.readFileSync(
    path.join(__dirname, 'prompts', 'capsa-assistant.txt'),
    'utf-8'
  );
  console.log('✅ Prompt cargado correctamente');
} catch (err) {
  console.error('❌ Error cargando el prompt:', err);
  process.exit(1);
}

// ======================
// 3. Middlewares
// ======================
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST']
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// 4. Configuración MySQL
// ======================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ======================
// 5. Configuración Multer
// ======================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ======================
// 6. Configuración Nodemailer
// ======================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ======================
// 7. Funciones Auxiliares
// ======================
const sendEmail = async (subject, message, attachments = []) => {
  const mailOptions = {
    from: `"Sistema CAPSA" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject,
    text: message,
    attachments
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✉️ Correo enviado:', info.response);
    return true;
  } catch (err) {
    console.error('❌ Error enviando correo:', err);
    return false;
  }
};

// ======================
// 8. Endpoints
// ======================

// Endpoint de chat con IA
app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: "La pregunta es requerida" });
    }

    const response = await cohere.generate({
      prompt: `[Responde únicamente en español] ${systemPrompt}\n\nPregunta: ${question}\nRespuesta:`,
      max_tokens: 300,
      temperature: 0.5
    });

    const answer = response.generations?.[0]?.text?.trim() || "No pude generar una respuesta";
    res.json({ answer });

  } catch (error) {
    console.error('Error en /api/chat:', error);
    res.status(500).json({ 
      error: 'Error al procesar tu pregunta',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Endpoint de Verificación
app.post('/verificar', upload.none(), async (req, res) => {
  try {
    const { nombre, correo, telefono } = req.body;

    if (!nombre || !correo || !telefono) {
      return res.status(400).send('Faltan campos obligatorios');
    }

    await pool.execute(
      `INSERT INTO verificacion (nombre, correo, telefono) VALUES (?, ?, ?)`,
      [nombre, correo, telefono]
    );

    await sendEmail('Nueva verificación', `
      Nombre: ${nombre}
      Correo: ${correo}
      Teléfono: ${telefono}
    `);

    res.send('Datos registrados correctamente');

  } catch (error) {
    console.error('Error en /verificar:', error);
    res.status(500).send('Error al guardar los datos');
  }
});

// Endpoint para Clientes
app.post('/clientes', async (req, res) => {
  try {
    const { name, phone, correo, servicio, comunicacion, comentarios } = req.body;

    if (!name || !phone || !correo || !servicio) {
      return res.status(400).send('Faltan campos obligatorios');
    }

    const [result] = await pool.execute(
      `INSERT INTO cliente 
       (nombre, telefono, correo_electronico, servicio, comunicacion, dudas) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, phone, correo, servicio, comunicacion, comentarios || null]
    );

    const emailMessage = `Nuevo registro:
      Nombre: ${name}
      Teléfono: ${phone}
      Correo: ${correo}
      Servicio: ${servicio}
      Comunicación: ${comunicacion}
      Comentarios: ${comentarios || 'Ninguno'}`;

    await sendEmail('Nuevo registro en Cliente', emailMessage);

    res.send('Registro completado exitosamente');

  } catch (error) {
    console.error('Error en /clientes:', error);
    res.status(500).send('Error al guardar los datos');
  }
});

// Endpoint para Postulaciones
app.post('/postulaciones', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'cedulaProfesional', maxCount: 1 }
]), async (req, res) => {
  try {
    const { 
      nombreCompleto,
      correoElectronico,
      telefonoContacto,
      direccion,
      especialidad,
      añosExperiencia,
      horariosDisponibles
    } = req.body;

    const attachments = [];
    if (req.files?.cv) {
      attachments.push({
        filename: req.files.cv[0].originalname,
        content: req.files.cv[0].buffer
      });
    }
    if (req.files?.cedulaProfesional) {
      attachments.push({
        filename: req.files.cedulaProfesional[0].originalname,
        content: req.files.cedulaProfesional[0].buffer
      });
    }

    const emailMessage = `Nueva postulación:
      - Nombre: ${nombreCompleto}
      - Correo: ${correoElectronico}
      - Teléfono: ${telefonoContacto}
      - Dirección: ${direccion || 'No especificada'}
      - Especialidad: ${especialidad}
      - Años de experiencia: ${añosExperiencia}
      - Horarios: ${Array.isArray(horariosDisponibles) ? horariosDisponibles.join(', ') : horariosDisponibles}`;

    await sendEmail('Nueva Postulación', emailMessage, attachments);

    res.send('Postulación recibida exitosamente');

  } catch (error) {
    console.error('Error en /postulaciones:', error);
    res.status(500).send('Error al procesar la postulación');
  }
});
// ======================
// 9. Iniciar Servidor
// ======================
app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
  console.log(`🔮 Endpoint de IA disponible en /api/chat`);
});

// Manejo de errores
process.on('unhandledRejection', (err) => {
  console.error('⚠️ Error no capturado:', err);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Excepción no capturada:', err);
  process.exit(1);
});