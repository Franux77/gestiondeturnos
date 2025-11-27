import { useState } from 'react'
import { actualizarEstadoTurno, eliminarTurno } from '../../services/adminService'
import { ESTADOS_TURNO_CONFIG } from '../../utils/constants'
import { formatearFecha, formatearHora, crearLinkWhatsApp, formatearTelefonoMostrar } from '../../utils/helpers'
import '../../styles/admin/TurnosLista.css'

function TablaTurnos({ turnos, onActualizar, onEditar }) {
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [loading, setLoading] = useState(null)

  const handleCambiarEstado = async (turnoId, nuevoEstado) => {
    setLoading(turnoId)
    setMenuAbierto(null)

    const { error } = await actualizarEstadoTurno(turnoId, nuevoEstado)

    if (error) {
      alert('Error al actualizar el estado')
    } else {
      onActualizar()
    }

    setLoading(null)
  }

  const handleEliminar = async (turno) => {
    if (!window.confirm(`¿Eliminar turno de ${turno.cliente_nombre}?`)) return

    setLoading(turno.id)
    const { success, error } = await eliminarTurno(turno.id)

    if (error) {
      alert('Error al eliminar el turno')
    } else if (success) {
      onActualizar()
    }

    setLoading(null)
  }

  const handleWhatsApp = (turno) => {
    const mensaje = `Hola ${turno.cliente_nombre}! Te escribimos de ${turno.profesionales.nombre}. Confirmamos tu turno para el ${formatearFecha(turno.fecha)} a las ${formatearHora(turno.hora_inicio)}. ¡Te esperamos!`
    const link = crearLinkWhatsApp(turno.cliente_telefono, mensaje)
    window.open(link, '_blank')
  }

  if (turnos.length === 0) {
    return (
      <div className="empty-state-tabla">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3>No hay turnos</h3>
        <p>No se encontraron turnos con los filtros seleccionados</p>
      </div>
    )
  }

  return (
    <div className="tabla-wrapper">
      <div className="tabla-scroll">
        <table className="tabla-turnos">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Profesional</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((turno) => {
              const estadoNormalizado = turno.estado ?? 'confirmado';  // fallback si es null

const estadoConfig =
  ESTADOS_TURNO_CONFIG[estadoNormalizado] ??
  ESTADOS_TURNO_CONFIG['confirmado']; // fallback si viene un estado desconocido


              const estaLoading = loading === turno.id

              return (
                <tr key={turno.id} className={estaLoading ? 'loading-row' : ''}>
                  <td>
                    <div className="celda-fecha">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatearFecha(turno.fecha)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="celda-hora">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatearHora(turno.hora_inicio)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="celda-cliente">
                      <strong>{turno.cliente_nombre}</strong>
                      {turno.servicio && (
                        <span className="servicio-tag">{turno.servicio}</span>
                      )}
                    </div>
                  </td>
                  <td>{formatearTelefonoMostrar(turno.cliente_telefono)}</td>
                  <td>
                    <div 
                      className="celda-profesional"
                      style={{ '--color': turno.profesionales.color }}
                    >
                      <span className="profesional-dot"></span>
                      {turno.profesionales.nombre}
                    </div>
                  </td>
                  <td>
                    <span 
                      className="badge-estado"
                      style={{ 
                        backgroundColor: estadoConfig.bgColor,
                        color: estadoConfig.color 
                      }}
                    >
                      {estadoConfig.icon} {estadoConfig.label}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-celda">
                      <button
                        className="btn-accion-tabla whatsapp"
                        onClick={() => handleWhatsApp(turno)}
                        title="WhatsApp"
                        disabled={estaLoading}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </button>

                      <div className="estado-menu-wrapper">
                        <button
                          className="btn-accion-tabla estado"
                          onClick={() => setMenuAbierto(menuAbierto === turno.id ? null : turno.id)}
                          title="Cambiar estado"
                          disabled={estaLoading}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>

                        {menuAbierto === turno.id && (
                          <>
                            <div className="menu-overlay" onClick={() => setMenuAbierto(null)}></div>
                            <div className="estado-menu-tabla">
                              {Object.entries(ESTADOS_TURNO_CONFIG).map(([estado, config]) => (
                                <button
                                  key={estado}
                                  className={`estado-opcion ${estadoNormalizado === estado ? 'active' : ''}`}
disabled={estadoNormalizado === estado}

                                >
                                  <span>{config.icon}</span>
                                  <span>{config.label}</span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        className="btn-accion-tabla editar"
                        onClick={() => onEditar(turno)}
                        title="Editar"
                        disabled={estaLoading}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        className="btn-accion-tabla eliminar"
                        onClick={() => handleEliminar(turno)}
                        title="Eliminar"
                        disabled={estaLoading}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TablaTurnos