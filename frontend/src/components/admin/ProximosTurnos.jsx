import { useState, useEffect } from 'react'
import { obtenerProximosTurnos } from '../../services/adminService'
import TurnoCard from './TurnoCard'
import '../../styles/admin/DashboardAdmin.css'

function ProximosTurnos({ dias = 7 }) {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarTurnos()
  }, [dias])

  const cargarTurnos = async () => {
    setLoading(true)
    const { data, error } = await obtenerProximosTurnos(dias)
    
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Próximos Turnos
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Próximos {dias} Días
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3>No hay turnos próximos</h3>
          <p>Los próximos {dias} días están libres</p>
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

export default ProximosTurnos