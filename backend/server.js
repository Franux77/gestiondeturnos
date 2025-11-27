const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// CORS configurado correctamente para producción
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))

app.use(express.json())

// Rutas
app.use('/api/email', require('./routes/email'))

// Ruta de prueba (importante para verificar que el servidor funciona)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend funcionando ✅',
    timestamp: new Date().toISOString()
  })
})

// Health check para Render
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Iniciar servidor
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  console.log(`📧 Brevo API Key configurada: ${process.env.BREVO_API_KEY ? '✅' : '❌'}`)
  console.log(`📮 Email remitente: ${process.env.EMAIL_REMITENTE || 'NO CONFIGURADO'}`)
})

module.exports = app