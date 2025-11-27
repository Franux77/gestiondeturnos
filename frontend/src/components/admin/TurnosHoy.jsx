import { useState, useEffect } from 'react'
import { obtenerTurnosHoy } from '../../services/adminService'
import TurnoCard from './TurnoCard'
import '../../styles/admin/DashboardAdmin.css'

function TurnosHoy() {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarTurnos()
  }, [])

  const cargarTurnos = async () => {
    setLoading(true)
    const { data, error } = await obtenerTurnosHoy()
    
    if (!error && data) {
      setTurnos(data)
    }
    
    setLoading(false)
  }

  if (loading) {
    return (
      <section className="seccion-turnos">
        <div className="seccion-header">
          <h2 className="seccion-titulo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Turnos de Hoy
          </h2>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando turnos...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="seccion-turnos">
      <div className="seccion-header">
        <h2 className="seccion-titulo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Turnos de Hoy
          <span className="badge-count">{turnos.length}</span>
        </h2>
        <button className="btn-refrescar" onClick={cargarTurnos}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refrescar
        </button>
      </div>

      {turnos.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3>No hay turnos para hoy</h3>
          <p>Disfruta el día libre 😊</p>
        </div>
      ) : (
        <div className="turnos-grid">
          {turnos.map(turno => (
            <TurnoCard 
              key={turno.id} 
              turno={turno}
              onActualizar={cargarTurnos}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default TurnosHoy