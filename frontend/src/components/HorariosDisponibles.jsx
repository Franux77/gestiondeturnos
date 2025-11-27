import { useState, useEffect } from 'react'
import { obtenerHorariosDisponibles } from '../services/turnosService'
import { formatearFecha, formatearHora } from '../utils/helpers'
import '../styles/Calendario.css'

function HorariosDisponibles({ 
  profesionalSeleccionado, 
  fechaSeleccionada, 
  onSeleccionarHorario,
  horarioSeleccionado,
  refreshKey // ⭐ NUEVO - prop para forzar refresco
}) {
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profesionalSeleccionado && fechaSeleccionada) {
      cargarHorarios()
    } else {
      setHorarios([])
    }
  }, [profesionalSeleccionado, fechaSeleccionada, refreshKey]) // ⭐ Agregar refreshKey

  const cargarHorarios = async () => {
    setLoading(true)
    const { data, error } = await obtenerHorariosDisponibles(
      profesionalSeleccionado.id,
      fechaSeleccionada
    )

    if (error) {
      console.error('Error al cargar horarios:', error)
      setHorarios([])
    } else {
      setHorarios(data || [])
    }
    setLoading(false)
  }

  const handleSeleccionarHorario = (horario) => {
    onSeleccionarHorario(horario)
    
    setTimeout(() => {
      const formulario = document.getElementById('formulario')
      if (formulario) {
        formulario.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  if (!fechaSeleccionada || !profesionalSeleccionado) {
    return null
  }

  if (loading) {
    return (
      <section id="horarios" className="horarios-section">
        <div className="container">
          <div className="loading-spinner"></div>
        </div>
      </section>
    )
  }

  return (
    <section id="horarios" className="horarios-section">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">Paso 3</div>
          <h2 className="section-title">
            Elegí el <span className="highlight">horario</span>
          </h2>
          <p className="section-subtitle">
            {formatearFecha(fechaSeleccionada)} con{' '}
            <strong>{profesionalSeleccionado.nombre}</strong>
          </p>
        </div>

        {horarios.length === 0 ? (
          <div className="empty-horarios">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <h3>No hay horarios disponibles</h3>
            <p>Por favor, elegí otra fecha</p>
          </div>
        ) : (
          <div className="horarios-grid">
            {horarios.map((horario) => {
              const esSeleccionado = horarioSeleccionado === horario
              
              return (
                <button
                  key={horario}
                  className={`horario-btn ${esSeleccionado ? 'seleccionado' : ''}`}
                  onClick={() => handleSeleccionarHorario(horario)}
                >
                  <div className="horario-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                  </div>
                  <span className="horario-texto">{formatearHora(horario)}</span>
                  {esSeleccionado && (
                    <div className="horario-check">
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
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default HorariosDisponibles