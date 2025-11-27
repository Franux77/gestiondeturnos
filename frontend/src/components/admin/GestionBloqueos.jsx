import { useState, useEffect } from 'react'
import { obtenerBloqueos, obtenerProfesionales, eliminarBloqueo } from '../../services/adminService'
import ModalBloqueo from './ModalBloqueo'
import { TIPOS_BLOQUEO_CONFIG } from '../../utils/constants'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import '../../styles/admin/GestionBloqueos.css'

function GestionBloqueos() {
  const [bloqueos, setBloqueos] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [filtroProf, setFiltroProf] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    
    const [bloqueosRes, profsRes] = await Promise.all([
      obtenerBloqueos(),
      obtenerProfesionales()
    ])
    
    if (!bloqueosRes.error && bloqueosRes.data) {
      setBloqueos(bloqueosRes.data)
    }
    
    if (!profsRes.error && profsRes.data) {
      setProfesionales(profsRes.data)
    }
    
    setLoading(false)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este bloqueo?')) return

    const { success, error } = await eliminarBloqueo(id)
    
    if (error) {
      alert('Error al eliminar el bloqueo')
    } else if (success) {
      cargarDatos()
    }
  }

  const handleNuevoBloqueo = () => {
    setMostrarModal(true)
  }

  const handleCerrarModal = () => {
    setMostrarModal(false)
  }

  const handleBloqueoCreado = () => {
    cargarDatos()
    handleCerrarModal()
  }

  // Filtrar bloqueos
  const bloqueosFiltrados = bloqueos.filter(b => {
    if (filtroProf && b.profesional_id !== filtroProf) return false
    if (filtroTipo && b.tipo !== filtroTipo) return false
    return true
  })

  // Separar por futuro/pasado
  const hoy = new Date().toISOString().split('T')[0]
  const bloqueosActivos = bloqueosFiltrados.filter(b => b.fecha >= hoy)
  const bloqueosPasados = bloqueosFiltrados.filter(b => b.fecha < hoy)

  if (loading) {
    return (
      <div className="bloqueos-container">
        <div className="bloqueos-loading">
          <div className="spinner-grande"></div>
          <p>Cargando bloqueos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bloqueos-container">
      {/* Header */}
      <div className="bloqueos-header">
        <div className="header-info-bloqueos">
          <div className="icono-bloqueos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1>Gestión de Bloqueos</h1>
            <p>Bloquea días u horarios específicos para descansos, vacaciones o ausencias</p>
          </div>
        </div>

        <button className="btn-nuevo-bloqueo" onClick={handleNuevoBloqueo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Bloqueo</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bloqueos-filtros">
        <div className="filtro-group">
          <label>Profesional:</label>
          <select value={filtroProf} onChange={(e) => setFiltroProf(e.target.value)}>
            <option value="">Todos</option>
            {profesionales.map(prof => (
              <option key={prof.id} value={prof.id}>{prof.nombre}</option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label>Tipo:</label>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(TIPOS_BLOQUEO_CONFIG).map(([tipo, config]) => (
              <option key={tipo} value={tipo}>{config.label}</option>
            ))}
          </select>
        </div>

        <div className="filtros-stats">
          <span className="stat-badge activos">{bloqueosActivos.length} Activos</span>
          <span className="stat-badge pasados">{bloqueosPasados.length} Pasados</span>
        </div>
      </div>

      {/* Bloqueos Activos */}
      {bloqueosActivos.length > 0 && (
        <div className="bloqueos-seccion">
          <h2 className="seccion-titulo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Bloqueos Activos
          </h2>

          <div className="bloqueos-grid">
            {bloqueosActivos.map(bloqueo => {
              const tipoConfig = TIPOS_BLOQUEO_CONFIG[bloqueo.tipo] || TIPOS_BLOQUEO_CONFIG.manual
              const esDiaCompleto = !bloqueo.hora_inicio && !bloqueo.hora_fin

              return (
                <div key={bloqueo.id} className="bloqueo-card">
                  <div className="bloqueo-header">
                    <div 
                      className="bloqueo-tipo-badge"
                      style={{ 
                        background: `${tipoConfig.color}20`,
                        color: tipoConfig.color
                      }}
                    >
                      <span>{tipoConfig.icon}</span>
                      <span>{tipoConfig.label}</span>
                    </div>
                  </div>

                  <div className="bloqueo-fecha">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{format(new Date(bloqueo.fecha + 'T00:00:00'), 'EEEE, d \'de\' MMMM yyyy', { locale: es })}</span>
                  </div>

                  <div className="bloqueo-horario">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {esDiaCompleto ? 'Día completo' : `${bloqueo.hora_inicio.substring(0, 5)} - ${bloqueo.hora_fin.substring(0, 5)}`}
                    </span>
                  </div>

                  <div className="bloqueo-profesional" style={{ color: bloqueo.profesionales.color }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{bloqueo.profesionales.nombre}</span>
                  </div>

                  {bloqueo.motivo && (
                    <div className="bloqueo-motivo">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <span>{bloqueo.motivo}</span>
                    </div>
                  )}

                  <button 
                    className="btn-eliminar-bloqueo"
                    onClick={() => handleEliminar(bloqueo.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bloqueos Pasados */}
      {bloqueosPasados.length > 0 && (
        <div className="bloqueos-seccion pasados">
          <h2 className="seccion-titulo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historial de Bloqueos
          </h2>

          <div className="bloqueos-lista-simple">
            {bloqueosPasados.map(bloqueo => {
              const tipoConfig = TIPOS_BLOQUEO_CONFIG[bloqueo.tipo] || TIPOS_BLOQUEO_CONFIG.manual
              const esDiaCompleto = !bloqueo.hora_inicio && !bloqueo.hora_fin

              return (
                <div key={bloqueo.id} className="bloqueo-item-simple">
                  <span className="bloqueo-icon" style={{ color: tipoConfig.color }}>
                    {tipoConfig.icon}
                  </span>
                  <span className="bloqueo-fecha-simple">
                    {format(new Date(bloqueo.fecha + 'T00:00:00'), 'dd/MM/yyyy')}
                  </span>
                  <span className="bloqueo-horario-simple">
                    {esDiaCompleto ? 'Día completo' : `${bloqueo.hora_inicio.substring(0, 5)}-${bloqueo.hora_fin.substring(0, 5)}`}
                  </span>
                  <span className="bloqueo-prof-simple">{bloqueo.profesionales.nombre}</span>
                  {bloqueo.motivo && <span className="bloqueo-motivo-simple">{bloqueo.motivo}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {bloqueos.length === 0 && (
        <div className="bloqueos-empty">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3>No hay bloqueos configurados</h3>
          <p>Crea tu primer bloqueo para gestionar días libres u horarios no disponibles</p>
          <button className="btn-crear-primero" onClick={handleNuevoBloqueo}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Crear Bloqueo</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <ModalBloqueo
          profesionales={profesionales}
          onCerrar={handleCerrarModal}
          onCreado={handleBloqueoCreado}
        />
      )}
    </div>
  )
}

export default GestionBloqueos