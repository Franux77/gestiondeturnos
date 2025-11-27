import { useEffect } from 'react'
import { formatearFecha, formatearHora } from '../utils/helpers'
import '../styles/Modal.css'

function ModalConfirmacion({ turno, profesional, onCerrar }) {
  useEffect(() => {
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (!turno || !profesional) return null

  const handleCerrarYRecargar = () => {
    onCerrar()
    setTimeout(() => {
      const calendario = document.getElementById('calendario')
      if (calendario) {
        calendario.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
  }

  return (
    <div className="confirmacion-modal-overlay" onClick={onCerrar}>
      <div className="confirmacion-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Confetti de fondo */}
        <div className="confirmacion-confetti">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="confirmacion-confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}></div>
          ))}
        </div>

        {/* Botón cerrar */}
        <button className="confirmacion-modal-close" onClick={onCerrar} aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icono de éxito */}
        <div className="confirmacion-success-icon">
          <div className="confirmacion-success-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Contenido */}
        <div className="confirmacion-modal-body">
          <h2 className="confirmacion-modal-title">¡Turno Confirmado!</h2>
          <p className="confirmacion-modal-subtitle">
            Tu reserva fue registrada exitosamente. Te enviamos un email de confirmación.
          </p>

          {/* Detalles del turno */}
          <div className="confirmacion-turno-detalles">
            <div className="confirmacion-detalle-item">
              <div className="confirmacion-detalle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="confirmacion-detalle-info">
                <span className="confirmacion-detalle-label">Cliente</span>
                <span className="confirmacion-detalle-valor">{turno.cliente_nombre}</span>
              </div>
            </div>

            <div className="confirmacion-detalle-item">
              <div className="confirmacion-detalle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                </svg>
              </div>
              <div className="confirmacion-detalle-info">
                <span className="confirmacion-detalle-label">Profesional</span>
                <span className="confirmacion-detalle-valor">{profesional.nombre}</span>
              </div>
            </div>

            <div className="confirmacion-detalle-item">
              <div className="confirmacion-detalle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="confirmacion-detalle-info">
                <span className="confirmacion-detalle-label">Fecha</span>
                <span className="confirmacion-detalle-valor">{formatearFecha(turno.fecha)}</span>
              </div>
            </div>

            <div className="confirmacion-detalle-item">
              <div className="confirmacion-detalle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="confirmacion-detalle-info">
                <span className="confirmacion-detalle-label">Horario</span>
                <span className="confirmacion-detalle-valor">{formatearHora(turno.hora_inicio)}</span>
              </div>
            </div>
          </div>

          {/* Recordatorios */}
          <div className="confirmacion-recordatorios">
            <h3 className="confirmacion-recordatorios-titulo">📝 Recordá</h3>
            <ul className="confirmacion-recordatorios-lista">
              <li>Llegá 5 minutos antes de tu turno</li>
              <li>Si no podés asistir, avisanos con anticipación</li>
              <li>Revisá tu email para más detalles</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="confirmacion-modal-actions">
            <button className="confirmacion-btn-secondary" onClick={handleCerrarYRecargar}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Reservar otro turno
            </button>
            <button className="confirmacion-btn-primary" onClick={handleCerrarYRecargar}>
  Entendido
</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalConfirmacion