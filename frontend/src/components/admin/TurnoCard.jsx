import { useState } from 'react'
import { actualizarEstadoTurno, eliminarTurno } from '../../services/adminService'
import { ESTADOS_TURNO, ESTADOS_TURNO_CONFIG } from '../../utils/constants'
import { formatearFecha, formatearHora, crearLinkWhatsApp, formatearTelefonoMostrar } from '../../utils/helpers'
import '../../styles/admin/TurnoCard.css'

function TurnoCard({ turno, onActualizar }) {
  const [loading, setLoading] = useState(false)

  const estadoConfig = ESTADOS_TURNO_CONFIG[turno.estado] || ESTADOS_TURNO_CONFIG[ESTADOS_TURNO.CONFIRMADO]

  const handleCancelar = async () => {
    if (!window.confirm('¿Cancelar este turno?')) return

    setLoading(true)
    const { error } = await actualizarEstadoTurno(turno.id, ESTADOS_TURNO.CANCELADO)

    if (error) {
      alert('Error al cancelar el turno')
    } else {
      onActualizar()
    }

    setLoading(false)
  }

  const handleNoAsistio = async () => {
    if (!window.confirm('¿Marcar como "No asistió"?')) return

    setLoading(true)
    const { error } = await actualizarEstadoTurno(turno.id, ESTADOS_TURNO.NO_ASISTIO)

    if (error) {
      alert('Error al actualizar el turno')
    } else {
      onActualizar()
    }

    setLoading(false)
  }

  const handleEliminar = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este turno?')) return

    setLoading(true)
    const { success, error } = await eliminarTurno(turno.id)

    if (error) {
      alert('Error al eliminar el turno')
    } else if (success) {
      onActualizar()
    }

    setLoading(false)
  }

  const handleWhatsApp = () => {
    const mensaje = `Hola ${turno.cliente_nombre}! Te escribimos de ${turno.profesionales.nombre}. Confirmamos tu turno para el ${formatearFecha(turno.fecha)} a las ${formatearHora(turno.hora_inicio)}. ¡Te esperamos! 😊`
    const link = crearLinkWhatsApp(turno.cliente_telefono, mensaje)
    window.open(link, '_blank')
  }

  const handleLlamar = () => {
    window.location.href = `tel:${turno.cliente_telefono}`
  }

  return (
    <div className="turno-card" style={{ '--profesional-color': turno.profesionales.color }}>
      {/* Badge de estado */}
      <div 
        className="turno-estado-badge"
        style={{ 
          backgroundColor: estadoConfig.bgColor,
          color: estadoConfig.color 
        }}
      >
        <span>{estadoConfig.icon}</span>
        <span>{estadoConfig.label}</span>
      </div>

      {/* Header con horario */}
      <div className="turno-header">
        <div className="turno-hora">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatearHora(turno.hora_inicio)}</span>
        </div>
        <div className="turno-fecha">
          {formatearFecha(turno.fecha)}
        </div>
      </div>

      {/* Info del cliente */}
      <div className="turno-info">
        <div className="info-item">
          <div className="info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="info-content">
            <span className="info-label">Cliente</span>
            <span className="info-value">{turno.cliente_nombre}</span>
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div className="info-content">
            <span className="info-label">Teléfono</span>
            <span className="info-value">{formatearTelefonoMostrar(turno.cliente_telefono)}</span>
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon" style={{ color: turno.profesionales.color }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
          </div>
          <div className="info-content">
            <span className="info-label">Profesional</span>
            <span className="info-value">{turno.profesionales.nombre}</span>
          </div>
        </div>

        {turno.servicio && (
          <div className="info-item">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="info-content">
              <span className="info-label">Servicio</span>
              <span className="info-value">{turno.servicio}</span>
            </div>
          </div>
        )}

        {turno.notas && (
          <div className="info-item full-width">
            <div className="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div className="info-content">
              <span className="info-label">Notas</span>
              <span className="info-value">{turno.notas}</span>
            </div>
          </div>
        )}
      </div>

      {/* Acciones SIMPLIFICADAS */}
      <div className="turno-acciones">
        <button 
          className="btn-accion whatsapp"
          onClick={handleWhatsApp}
          title="Enviar WhatsApp"
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </button>

        <button 
          className="btn-accion llamar"
          onClick={handleLlamar}
          title="Llamar"
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>

        {/* Solo mostrar botones según el estado */}
        {turno.estado === ESTADOS_TURNO.CONFIRMADO && (
          <>
            <button 
              className="btn-accion no-asistio"
              onClick={handleNoAsistio}
              title="Marcar como no asistió"
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </button>

            <button 
              className="btn-accion cancelar"
              onClick={handleCancelar}
              title="Cancelar turno"
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}

        <button 
          className="btn-accion eliminar"
          onClick={handleEliminar}
          title="Eliminar turno"
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {loading && (
        <div className="turno-loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  )
}

export default TurnoCard