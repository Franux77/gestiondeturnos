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
// EMAIL CLIENTE - DISEÑO MODERNO Y COMPACTO
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
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 30px 15px;">
    <tr>
      <td align="center">
        
        <!-- Container Principal -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 35px 25px; text-align: center; background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);">
              <!-- Icono Check SVG -->
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" style="margin-bottom: 12px;">
                <circle cx="12" cy="12" r="10" fill="white" stroke="#84cc16" stroke-width="1.5"/>
                <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="#84cc16" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.3px;">Turno Confirmado</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.95); font-size: 15px; font-weight: 500;">Tu reserva está confirmada</p>
            </td>
          </tr>

          <!-- Saludo -->
          <tr>
            <td style="padding: 25px 25px 20px;">
              <p style="margin: 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                Hola ${turno.cliente_nombre},
              </p>
              <p style="margin: 10px 0 0; color: #666666; font-size: 15px; line-height: 1.5;">
                Tu turno ha sido confirmado exitosamente. Aquí están los detalles:
              </p>
            </td>
          </tr>

          <!-- Detalles del Turno -->
          <tr>
            <td style="padding: 0 25px 25px;">
              
              <!-- Profesional -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px; background: #f9fafb; border-radius: 10px; border-left: 3px solid #84cc16;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" style="vertical-align: top;">
                          <!-- Icono Usuario -->
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="7" r="4" stroke="#84cc16" stroke-width="2" stroke-linecap="round"/>
                            <path d="M5.5 21c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" stroke="#84cc16" stroke-width="2" stroke-linecap="round"/>
                          </svg>
                        </td>
                        <td style="padding-left: 14px;">
                          <p style="margin: 0; font-size: 11px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Profesional</p>
                          <p style="margin: 5px 0 0; font-size: 17px; color: #1a1a1a; font-weight: 700; line-height: 1.2;">${profesional.nombre}</p>
                          <p style="margin: 3px 0 0; font-size: 14px; color: #666666;">${profesional.especialidad}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fecha y Hora -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                <tr>
                  <!-- Fecha -->
                  <td width="49%" style="vertical-align: top; padding-right: 6px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 10px; height: 100%; border-left: 3px solid #fbbf24;">
                      <tr>
                        <td style="padding: 16px 18px;">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="margin-bottom: 8px;">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#fbbf24" stroke-width="2"/>
                            <path d="M8 2v3M16 2v3M3 9h18" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
                            <circle cx="8" cy="14" r="1" fill="#fbbf24"/>
                            <circle cx="12" cy="14" r="1" fill="#fbbf24"/>
                            <circle cx="16" cy="14" r="1" fill="#fbbf24"/>
                          </svg>
                          <p style="margin: 0; font-size: 11px; color: #fbbf24; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Fecha</p>
                          <p style="margin: 6px 0 0; font-size: 14px; color: #1a1a1a; font-weight: 700; line-height: 1.3; text-transform: capitalize;">${fechaFormateada}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  
                  <td width="2%"></td>
                  
                  <!-- Hora -->
                  <td width="49%" style="vertical-align: top; padding-left: 6px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 10px; height: 100%; border-left: 3px solid #f59e0b;">
                      <tr>
                        <td style="padding: 16px 18px;">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="margin-bottom: 8px;">
                            <circle cx="12" cy="12" r="9" stroke="#f59e0b" stroke-width="2"/>
                            <path d="M12 7v5l3 3" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
                          </svg>
                          <p style="margin: 0; font-size: 11px; color: #f59e0b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Horario</p>
                          <p style="margin: 6px 0 0; font-size: 26px; color: #1a1a1a; font-weight: 800; line-height: 1; letter-spacing: -0.5px;">${turno.hora_inicio.substring(0, 5)}</p>
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
            <td style="padding: 0 25px 25px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #fef3c7; border-radius: 10px; border-left: 3px solid #f59e0b;">
                <tr>
                  <td style="padding: 18px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" style="vertical-align: top;">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="#f59e0b" stroke-width="2"/>
                            <path d="M12 8v4M12 16h.01" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
                          </svg>
                        </td>
                        <td style="padding-left: 10px;">
                          <p style="margin: 0; font-size: 11px; color: #92400e; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Recordatorios</p>
                          <ul style="margin: 10px 0 0; padding-left: 18px; color: #78350f; font-size: 14px; line-height: 1.6;">
                            <li style="margin-bottom: 6px;">Llegá 5 minutos antes</li>
                            <li style="margin-bottom: 6px;">Avisá si no podés asistir</li>
                            <li>Guardá este email de confirmación</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contacto -->
          <tr>
            <td style="padding: 0 25px 25px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0fdf4; border-radius: 10px; text-align: center; border-left: 3px solid #84cc16;">
                <tr>
                  <td style="padding: 18px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="margin-bottom: 6px;">
                      <path d="M21 15.46l-5.27-.61-2.52 2.52a15.045 15.045 0 01-6.59-6.59l2.53-2.53L8.54 3H3.03C2.45 13.18 10.82 21.55 21 20.97v-5.51z" fill="#166534"/>
                    </svg>
                    <p style="margin: 0; font-size: 11px; color: #166534; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Consultas</p>
                    <p style="margin: 8px 0 0; font-size: 19px; color: #15803d; font-weight: 700; letter-spacing: -0.3px;">
                      ${process.env.TELEFONO_NEGOCIO || '+54 379 512-3456'}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 25px; text-align: center; background: #fafafa; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 18px; font-weight: 800; color: #84cc16; text-transform: uppercase; letter-spacing: 0.5px;">
                ${process.env.NOMBRE_NEGOCIO}
              </p>
              <p style="margin: 6px 0 0; font-size: 13px; color: #999999;">Tu estilo, tu momento</p>
              <p style="margin: 14px 0 0; font-size: 11px; color: #b3b3b3;">
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
// EMAIL ADMIN - DISEÑO MODERNO Y COMPACTO
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
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 30px 15px;">
    <tr>
      <td align="center">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 30px 25px; text-align: center; background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin-bottom: 10px;">
                <circle cx="12" cy="12" r="10" fill="white" stroke="#84cc16" stroke-width="1.5"/>
                <path d="M12 8v4l3 3" stroke="#84cc16" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Nuevo Turno Reservado</h1>
              <p style="margin: 6px 0 0; color: rgba(255,255,255,0.95); font-size: 14px; font-weight: 500;">Un cliente acaba de reservar</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 25px;">
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 10px; margin-bottom: 16px;">
                
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 11px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Cliente</p>
                    <p style="margin: 6px 0 0; font-size: 17px; color: #1a1a1a; font-weight: 700;">${turno.cliente_nombre}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 11px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Teléfono</p>
                    <p style="margin: 6px 0 0; font-size: 17px; color: #1a1a1a; font-weight: 700;">${turno.cliente_telefono}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 11px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Email</p>
                    <p style="margin: 6px 0 0; font-size: 15px; color: #1a1a1a; font-weight: 600;">${turno.cliente_email}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 11px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Profesional</p>
                    <p style="margin: 6px 0 0; font-size: 17px; color: #1a1a1a; font-weight: 700;">${profesional.nombre}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 11px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Fecha</p>
                    <p style="margin: 6px 0 0; font-size: 17px; color: #1a1a1a; font-weight: 700;">${turno.fecha}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 14px 18px; ${turno.servicio || turno.notas ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
                    <p style="margin: 0; font-size: 11px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Hora</p>
                    <p style="margin: 6px 0 0; font-size: 24px; color: #1a1a1a; font-weight: 800; letter-spacing: -0.5px;">${turno.hora_inicio.substring(0, 5)}</p>
                  </td>
                </tr>

                ${turno.servicio ? `
                <tr>
                  <td style="padding: 14px 18px; ${turno.notas ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
                    <p style="margin: 0; font-size: 11px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Servicio</p>
                    <p style="margin: 6px 0 0; font-size: 15px; color: #666666; line-height: 1.4;">${turno.servicio}</p>
                  </td>
                </tr>
                ` : ''}

                ${turno.notas ? `
                <tr>
                  <td style="padding: 14px 18px;">
                    <p style="margin: 0; font-size: 11px; color: #84cc16; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Notas</p>
                    <p style="margin: 6px 0 0; font-size: 14px; color: #666666; line-height: 1.5;">${turno.notas}</p>
                  </td>
                </tr>
                ` : ''}

              </table>

              <p style="margin: 20px 0 0; text-align: center; color: #999999; font-size: 13px;">
                Gestioná este turno desde el panel de administración
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background: #fafafa; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 11px; color: #b3b3b3;">
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