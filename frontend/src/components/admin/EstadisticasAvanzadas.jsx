import { useState, useEffect } from 'react'
import { obtenerEstadisticasAvanzadas } from '../../services/adminService'
import '../../styles/admin/EstadisticasAvanzadas.css'

function EstadisticasAvanzadas() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    setLoading(true)
    const { data, error } = await obtenerEstadisticasAvanzadas()
    
    if (!error && data) {
      setStats(data)
    }
    
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="stats-avanzadas-container">
        <div className="stats-loading">
          <div className="spinner-grande"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="stats-avanzadas-container">
        <div className="stats-error">
          <p>No se pudieron cargar las estadísticas</p>
          <button onClick={cargarEstadisticas}>Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="stats-avanzadas-container">
      {/* Header */}
      <div className="stats-header">
        <div className="header-info-stats">
          <div className="icono-stats">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1>Estadísticas Avanzadas</h1>
            <p>Análisis detallado del rendimiento de tu negocio</p>
          </div>
        </div>

        <button className="btn-refrescar-stats" onClick={cargarEstadisticas}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Actualizar</span>
        </button>
      </div>

      {/* Métricas principales */}
      <div className="metricas-principales">
        <div className="metrica-card grande">
          <div className="metrica-header">
            <h3>Tasa de Asistencia</h3>
            <div className="metrica-icono asistencia">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="metrica-valor grande">{stats.tasaAsistencia}%</div>
          <div className="metrica-desglose">
            <div className="desglose-item confirmados">
              <span className="desglose-dot"></span>
              <span>{stats.confirmados} Confirmados</span>
            </div>
            <div className="desglose-item cancelados">
              <span className="desglose-dot"></span>
              <span>{stats.cancelados} Cancelados</span>
            </div>
            <div className="desglose-item no-asistio">
              <span className="desglose-dot"></span>
              <span>{stats.noAsistio} No asistió</span>
            </div>
          </div>
        </div>

        <div className="metrica-card">
          <div className="metrica-header">
            <h3>Total Turnos</h3>
            <div className="metrica-icono total">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="metrica-valor">{stats.totalTurnos}</div>
          <div className="metrica-subtitulo">Todos los tiempos</div>
        </div>

        <div className="metrica-card">
          <div className="metrica-header">
            <h3>Tasa No-Show</h3>
            <div className="metrica-icono warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="metrica-valor">
            {stats.totalTurnos > 0 ? ((stats.noAsistio / stats.totalTurnos) * 100).toFixed(1) : 0}%
          </div>
          <div className="metrica-subtitulo">{stats.noAsistio} de {stats.totalTurnos}</div>
        </div>
      </div>

      {/* Clientes frecuentes */}
      {stats.clientesFrecuentes.length > 0 && (
        <div className="stats-seccion">
          <h2 className="seccion-titulo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Clientes Frecuentes
          </h2>
          <div className="clientes-grid">
            {stats.clientesFrecuentes.map((cliente, index) => (
              <div key={cliente.email} className="cliente-card">
                <div className="cliente-posicion">#{index + 1}</div>
                <div className="cliente-info">
                  <div className="cliente-avatar">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div>
                    <div className="cliente-nombre">{cliente.nombre}</div>
                    <div className="cliente-email">{cliente.email}</div>
                  </div>
                </div>
                <div className="cliente-turnos">
                  <span className="turnos-numero">{cliente.cantidad}</span>
                  <span className="turnos-label">turnos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Horarios pico */}
      {stats.horariosPico.length > 0 && (
        <div className="stats-seccion">
          <h2 className="seccion-titulo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Horarios Más Solicitados
          </h2>
          <div className="horarios-pico-grid">
            {stats.horariosPico.map((horario, index) => {
              const maxCantidad = stats.horariosPico[0].cantidad
              const porcentaje = (horario.cantidad / maxCantidad) * 100

              return (
                <div key={horario.hora} className="horario-pico-item">
                  <div className="horario-pico-header">
                    <span className="horario-hora">{horario.hora}</span>
                    <span className="horario-cantidad">{horario.cantidad} turnos</span>
                  </div>
                  <div className="horario-barra">
                    <div 
                      className="horario-barra-fill"
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                  {index === 0 && <span className="horario-badge-top">⭐ Más popular</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rendimiento por profesional */}
      {Object.keys(stats.turnosPorProfesional).length > 0 && (
        <div className="stats-seccion">
          <h2 className="seccion-titulo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Rendimiento por Profesional
          </h2>
          <div className="profesionales-stats-grid">
            {Object.entries(stats.turnosPorProfesional).map(([nombre, datos]) => {
              const total = datos.confirmados + datos.cancelados + datos.noAsistio
              const tasaExito = total > 0 ? ((datos.confirmados / total) * 100).toFixed(1) : 0

              return (
                <div key={nombre} className="profesional-stats-card">
                  <h4>{nombre}</h4>
                  <div className="prof-stats-numero">{total}</div>
                  <div className="prof-stats-label">turnos totales</div>
                  
                  <div className="prof-stats-detalles">
                    <div className="prof-stat-item confirmados">
                      <span className="prof-stat-dot"></span>
                      <span>{datos.confirmados} Confirmados</span>
                    </div>
                    <div className="prof-stat-item cancelados">
                      <span className="prof-stat-dot"></span>
                      <span>{datos.cancelados} Cancelados</span>
                    </div>
                    <div className="prof-stat-item no-asistio">
                      <span className="prof-stat-dot"></span>
                      <span>{datos.noAsistio} No asistió</span>
                    </div>
                  </div>

                  <div className="prof-tasa-exito">
                    <span>Tasa éxito:</span>
                    <strong>{tasaExito}%</strong>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default EstadisticasAvanzadas