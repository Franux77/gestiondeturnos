import { useState, useEffect } from 'react'
import { obtenerEstadisticas } from '../../services/adminService'
import EstadisticasCard from './EstadisticasCard'
import TurnosHoy from './TurnosHoy'
import ProximosTurnos from './ProximosTurnos'
import '../../styles/admin/DashboardAdmin.css'

function DashboardAdmin() {
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    setLoading(true)
    const { data, error } = await obtenerEstadisticas()
    
    if (!error && data) {
      setEstadisticas(data)
    }
    
    setLoading(false)
  }

  return (
    <div className="dashboard-admin">
      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-titulo">Dashboard</h1>
          <p className="dashboard-subtitulo">
            Bienvenido al panel de administración
          </p>
        </div>
        <div className="dashboard-fecha">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Estadísticas */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : estadisticas ? (
        <div className="estadisticas-grid">
          <EstadisticasCard
            titulo="Turnos Hoy"
            valor={estadisticas.turnosHoy}
            color="#84cc16"
            icono={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <EstadisticasCard
            titulo="Esta Semana"
            valor={estadisticas.turnosSemana}
            color="#3b82f6"
            icono={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <EstadisticasCard
            titulo="Total Clientes"
            valor={estadisticas.totalClientes}
            color="#ec4899"
            icono={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <EstadisticasCard
            titulo="Más Solicitado"
            valor={estadisticas.profesionalMasSolicitado}
            color="#f59e0b"
            icono={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
          />
        </div>
      ) : null}

      {/* Turnos de Hoy */}
      <TurnosHoy />

      {/* Próximos Turnos */}
      <ProximosTurnos dias={7} />
    </div>
  )
}

export default DashboardAdmin