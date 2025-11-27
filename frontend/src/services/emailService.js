// Servicio de emails usando backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

console.log('🔗 Backend URL configurada:', BACKEND_URL) // Debug

export const enviarEmailConfirmacion = async (turno, profesional) => {
  try {
    console.log('📧 Enviando email de confirmación...')
    console.log('🎯 URL:', `${BACKEND_URL}/api/email/enviar-confirmacion`)
    
    const response = await fetch(`${BACKEND_URL}/api/email/enviar-confirmacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ turno, profesional })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al enviar email')
    }

    console.log('✅ Email de confirmación enviado:', data.messageId)
    return { success: true, messageId: data.messageId }
    
  } catch (error) {
    console.error('❌ Error enviando email:', error)
    return { success: false, error: error.message }
  }
}

export const enviarEmailNotificacionAdmin = async (turno, profesional) => {
  try {
    console.log('📧 Enviando notificación al admin...')
    console.log('🎯 URL:', `${BACKEND_URL}/api/email/notificar-admin`)
    
    const response = await fetch(`${BACKEND_URL}/api/email/notificar-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ turno, profesional })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al enviar notificación')
    }

    console.log('✅ Notificación admin enviada:', data.messageId)
    return { success: true, messageId: data.messageId }
    
  } catch (error) {
    console.error('❌ Error enviando notificación:', error)
    return { success: false, error: error.message }
  }
}