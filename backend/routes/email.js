const express = require('express')
const router = express.Router()
const brevo = require('@getbrevo/brevo')

// Configurar Brevo
const apiInstance = new brevo.TransactionalEmailsApi()
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
)

// Verificar variables de entorno requeridas
function verificarEnv() {
  const missing = []
  if (!process.env.BREVO_API_KEY) missing.push('BREVO_API_KEY')
  if (!process.env.EMAIL_REMITENTE) missing.push('EMAIL_REMITENTE')
  if (!process.env.NOMBRE_NEGOCIO) missing.push('NOMBRE_NEGOCIO')
  if (missing.length) return missing
  return null
}

// Ruta para enviar email de confirmación
router.post('/enviar-confirmacion', async (req, res) => {
  try {
    const faltantes = verificarEnv()
    if (faltantes) {
      console.error('Variables de entorno faltantes:', faltantes)
      return res.status(500).json({
        success: false,
        message: 'Faltan variables de entorno en el servidor',
        missing: faltantes
      })
    }
    const { turno, profesional } = req.body

    if (!turno || !profesional) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos del turno o profesional' 
      })
    }

    const sendSmtpEmail = new brevo.SendSmtpEmail()
    
    sendSmtpEmail.subject = `✅ Turno Confirmado - ${process.env.NOMBRE_NEGOCIO}`
    sendSmtpEmail.sender = {
      name: process.env.NOMBRE_NEGOCIO,
      email: process.env.EMAIL_REMITENTE
    }
    sendSmtpEmail.to = [
      {
        email: turno.cliente_email,
        name: turno.cliente_nombre
      }
    ]
    sendSmtpEmail.htmlContent = crearHTMLConfirmacion(turno, profesional)

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail)

    console.log('✅ Email enviado:', data.messageId)

    res.json({
      success: true,
      messageId: data.messageId,
      message: 'Email enviado exitosamente'
    })

  } catch (error) {
    const sdkDetail = error?.response?.body || error?.message || error
    console.error('❌ Error enviando email:', sdkDetail)
    res.status(500).json({
      success: false,
      message: 'Error al enviar email',
      error: sdkDetail
    })
  }
})

// Ruta para enviar notificación al admin
router.post('/notificar-admin', async (req, res) => {
  try {
    const faltantes = verificarEnv()
    if (faltantes) {
      console.error('Variables de entorno faltantes:', faltantes)
      return res.status(500).json({
        success: false,
        message: 'Faltan variables de entorno en el servidor',
        missing: faltantes
      })
    }
    const { turno, profesional } = req.body

    const sendSmtpEmail = new brevo.SendSmtpEmail()
    
    sendSmtpEmail.subject = `🔔 Nuevo Turno - ${turno.cliente_nombre}`
    sendSmtpEmail.sender = {
      name: process.env.NOMBRE_NEGOCIO,
      email: process.env.EMAIL_REMITENTE
    }
    sendSmtpEmail.to = [
      {
        email: process.env.EMAIL_REMITENTE,
        name: 'Administrador'
      }
    ]
    sendSmtpEmail.htmlContent = crearHTMLNotificacionAdmin(turno, profesional)

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail)

    console.log('✅ Notificación admin enviada:', data.messageId)

    res.json({ success: true, messageId: data.messageId })

  } catch (error) {
    const sdkDetail = error?.response?.body || error?.message || error
    console.error('❌ Error enviando notificación:', sdkDetail)
    res.status(500).json({
      success: false,
      error: sdkDetail
    })
  }
})

// ==========================================
// EMAIL CLIENTE - MEJORADO CON MÁS ESPACIO
// ==========================================
function crearHTMLConfirmacion(turno, profesional) {
  const fecha = new Date(turno.fecha + 'T00:00:00')
  const fechaFormateada = fecha.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Turno Confirmado</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Helvetica Neue', Arial, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 60px 20px;">
    <tr>
      <td align="center">
        
        <!-- Container Principal -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 650px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header con icono de check -->
          <tr>
            <td style="padding: 50px 40px; text-align: center; background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);">
              <!-- Icono Check SVG -->
              <svg width="80" height="80" viewBox="0 0 24 24" style="margin-bottom: 20px;">
                <circle cx="12" cy="12" r="11" fill="white"/>
                <path d="M7 12l3 3 7-7" stroke="#84cc16" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: -0.5px;">Turno Confirmado</h1>
              <p style="margin: 12px 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">Tu reserva está lista</p>
            </td>
          </tr>

          <!-- Saludo -->
          <tr>
            <td style="padding: 40px 40px 30px;">
              <p style="margin: 0; color: #1a1a1a; font-size: 20px; font-weight: 600; line-height: 1.4;">
                Hola ${turno.cliente_nombre},
              </p>
              <p style="margin: 16px 0 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Tu turno ha sido confirmado exitosamente. A continuación los detalles de tu reserva:
              </p>
            </td>
          </tr>

          <!-- Detalles del Turno -->
          <tr>
            <td style="padding: 0 40px 40px;">
              
              <!-- Profesional -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px; background: #f9fafb; border-radius: 12px; border-left: 4px solid #84cc16;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50" style="vertical-align: top;">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="8" r="4" stroke="#84cc16" stroke-width="2"/>
                            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#84cc16" stroke-width="2" stroke-linecap="round"/>
                          </svg>
                        </td>
                        <td style="padding-left: 20px;">
                          <p style="margin: 0; font-size: 13px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Profesional</p>
                          <p style="margin: 6px 0 0; font-size: 20px; color: #1a1a1a; font-weight: 700; line-height: 1.3;">${profesional.nombre}</p>
                          <p style="margin: 4px 0 0; font-size: 15px; color: #666666;">${profesional.especialidad}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fecha y Hora -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                <tr>
                  <td width="48%" style="vertical-align: top; padding-right: 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 12px; height: 100%; border-left: 4px solid #fbbf24;">
                      <tr>
                        <td style="padding: 24px;">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style="margin-bottom: 12px;">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#fbbf24" stroke-width="2"/>
                            <path d="M16 2v4M8 2v4M3 10h18" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
                          </svg>
                          <p style="margin: 0; font-size: 13px; color: #fbbf24; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Fecha</p>
                          <p style="margin: 8px 0 0; font-size: 17px; color: #1a1a1a; font-weight: 700; line-height: 1.4; text-transform: capitalize;">${fechaFormateada}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="vertical-align: top; padding-left: 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 12px; height: 100%; border-left: 4px solid #f59e0b;">
                      <tr>
                        <td style="padding: 24px;">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style="margin-bottom: 12px;">
                            <circle cx="12" cy="12" r="9" stroke="#f59e0b" stroke-width="2"/>
                            <path d="M12 7v5l3 3" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
                          </svg>
                          <p style="margin: 0; font-size: 13px; color: #f59e0b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Horario</p>
                          <p style="margin: 8px 0 0; font-size: 24px; color: #1a1a1a; font-weight: 800; line-height: 1.2;">${turno.hora_inicio.substring(0, 5)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Recordatorios -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="vertical-align: middle; margin-right: 6px;">
                        <circle cx="12" cy="12" r="9" stroke="#f59e0b" stroke-width="2"/>
                        <path d="M12 8v4M12 16h.01" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      Importante
                    </p>
                    <ul style="margin: 16px 0 0; padding-left: 24px; color: #78350f; font-size: 15px; line-height: 1.8;">
                      <li style="margin-bottom: 10px;">Llegá 5 minutos antes de tu turno</li>
                      <li style="margin-bottom: 10px;">Si no podés asistir, avisanos con anticipación</li>
                      <li>Guardá este email como comprobante</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contacto -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0fdf4; border-radius: 12px; text-align: center; border-left: 4px solid #84cc16;">
                <tr>
                  <td style="padding: 28px;">
                    <p style="margin: 0; font-size: 13px; color: #166534; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Consultas</p>
                    <p style="margin: 12px 0 0; font-size: 22px; color: #15803d; font-weight: 700; letter-spacing: -0.5px;">
                      📞 ${process.env.TELEFONO_NEGOCIO || '+54 379 512-3456'}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 40px; text-align: center; background: #fafafa; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 20px; font-weight: 800; color: #84cc16; text-transform: uppercase; letter-spacing: 1px;">
                ${process.env.NOMBRE_NEGOCIO}
              </p>
              <p style="margin: 8px 0 0; font-size: 14px; color: #999999;">Tu estilo, tu momento</p>
              <p style="margin: 20px 0 0; font-size: 12px; color: #b3b3b3;">
                Este es un email automático. Por favor no responder.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `
}

// ==========================================
// EMAIL ADMIN - MEJORADO
// ==========================================
function crearHTMLNotificacionAdmin(turno, profesional) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo Turno</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Helvetica Neue', Arial, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 60px 20px;">
    <tr>
      <td align="center">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 650px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);">
              <svg width="60" height="60" viewBox="0 0 24 24" style="margin-bottom: 16px;">
                <circle cx="12" cy="12" r="11" fill="white"/>
                <path d="M15 10l-4 4-2-2" stroke="#84cc16" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18 8v.01M18 16v.01" stroke="#84cc16" stroke-width="2" fill="none" stroke-linecap="round"/>
              </svg>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">Nuevo Turno Reservado</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.95); font-size: 15px;">Un cliente acaba de reservar</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 12px; margin-bottom: 20px;">
                
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 12px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Cliente</p>
                    <p style="margin: 8px 0 0; font-size: 18px; color: #1a1a1a; font-weight: 700;">${turno.cliente_nombre}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 12px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Teléfono</p>
                    <p style="margin: 8px 0 0; font-size: 18px; color: #1a1a1a; font-weight: 700;">${turno.cliente_telefono}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 12px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                    <p style="margin: 8px 0 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">${turno.cliente_email}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 12px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Profesional</p>
                    <p style="margin: 8px 0 0; font-size: 18px; color: #1a1a1a; font-weight: 700;">${profesional.nombre}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 12px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Fecha</p>
                    <p style="margin: 8px 0 0; font-size: 18px; color: #1a1a1a; font-weight: 700;">${turno.fecha}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px; ${turno.servicio || turno.notas ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
                    <p style="margin: 0; font-size: 12px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Hora</p>
                    <p style="margin: 8px 0 0; font-size: 24px; color: #1a1a1a; font-weight: 800;">${turno.hora_inicio.substring(0, 5)}</p>
                  </td>
                </tr>

                ${turno.servicio ? `
                <tr>
                  <td style="padding: 20px; ${turno.notas ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
                    <p style="margin: 0; font-size: 12px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Servicio</p>
                    <p style="margin: 8px 0 0; font-size: 16px; color: #666666; line-height: 1.5;">${turno.servicio}</p>
                  </td>
                </tr>
                ` : ''}

                ${turno.notas ? `
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; font-size: 12px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Notas</p>
                    <p style="margin: 8px 0 0; font-size: 15px; color: #666666; line-height: 1.6;">${turno.notas}</p>
                  </td>
                </tr>
                ` : ''}

              </table>

              <p style="margin: 30px 0 0; text-align: center; color: #999999; font-size: 14px;">
                Gestioná este turno desde el panel de administración
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background: #fafafa; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 12px; color: #b3b3b3;">
                Sistema de Gestión de Turnos - ${process.env.NOMBRE_NEGOCIO}
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `
}

module.exports = router