import { useState, useEffect } from 'react'
import { obtenerProfesionales } from '../services/turnosService'
import '../styles/Profesionales.css'

function SeleccionProfesional({ onSeleccionar, profesionalSeleccionado }) {
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarProfesionales()
  }, [])

  const cargarProfesionales = async () => {
    setLoading(true)
    const { data, error } = await obtenerProfesionales()
    
    if (error) {
      setError('Error al cargar profesionales')
      console.error(error)
    } else {
      setProfesionales(data || [])
    }
    
    setLoading(false)
  }

  const handleSeleccionar = (profesional) => {
    onSeleccionar(profesional)
    // Scroll suave al calendario
    setTimeout(() => {
      const calendario = document.getElementById('calendario')
      if (calendario) {
        calendario.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  if (loading) {
    return (
      <section id="profesionales" className="profesionales-section">
        <div className="container">
          <h2 className="section-title">Cargando profesionales...</h2>
          <div className="loading-spinner"></div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="profesionales" className="profesionales-section">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </section>
    )
  }

  return (
    <section id="profesionales" className="profesionales-section">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">Paso 1</div>
          <h2 className="section-title">
            Elegí tu <span className="highlight">profesional</span>
          </h2>
          <p className="section-subtitle">
            Seleccioná con quién querés reservar tu turno
          </p>
        </div>

        <div className="profesionales-grid">
          {profesionales.map((profesional) => (
            <div
              key={profesional.id}
              className={`profesional-card ${
                profesionalSeleccionado?.id === profesional.id ? 'selected' : ''
              }`}
              onClick={() => handleSeleccionar(profesional)}
            >
              {/* Badge de seleccionado */}
              {profesionalSeleccionado?.id === profesional.id && (
                <div className="selected-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {/* Avatar con color personalizado */}
              <div
                className="profesional-avatar"
                style={{ '--profesional-color': profesional.color }}
              >
                <div className="avatar-circle">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="avatar-glow"></div>
              </div>

              {/* Info */}
              <div className="profesional-info">
                <h3 className="profesional-nombre">{profesional.nombre}</h3>
                <p className="profesional-especialidad">
                  {profesional.especialidad}
                </p>
              </div>

              {/* Indicador de disponibilidad */}
              <div className="profesional-status">
                <span className="status-dot"></span>
                <span>Disponible</span>
              </div>

              {/* Botón de acción */}
              <button className="profesional-btn">
                {profesionalSeleccionado?.id === profesional.id
                  ? 'Seleccionado'
                  : 'Seleccionar'}
                <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>

              {/* Efecto hover */}
              <div className="card-shine"></div>
            </div>
          ))}
        </div>

        {profesionales.length === 0 && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <p>No hay profesionales disponibles en este momento</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default SeleccionProfesional