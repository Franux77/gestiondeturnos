import { useState, useEffect } from 'react'
import { obtenerProfesionales } from '../../services/turnosService'
import { ESTADOS_TURNO, ESTADOS_TURNO_CONFIG } from '../../utils/constants'
import '../../styles/admin/TurnosLista.css'

function FiltrosTurnos({ filtros, onCambiarFiltros, onLimpiarFiltros }) {
  const [profesionales, setProfesionales] = useState([])
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  useEffect(() => {
    cargarProfesionales()
  }, [])

  const cargarProfesionales = async () => {
    const { data } = await obtenerProfesionales()
    if (data) {
      setProfesionales(data)
    }
  }

  const handleChange = (campo, valor) => {
    onCambiarFiltros({ ...filtros, [campo]: valor })
  }

  const handleLimpiar = () => {
    onLimpiarFiltros()
  }

  const contarFiltrosActivos = () => {
    let count = 0
    if (filtros.busqueda) count++
    if (filtros.estado) count++
    if (filtros.profesional_id) count++
    if (filtros.fecha_desde) count++
    if (filtros.fecha_hasta) count++
    return count
  }

  const filtrosActivos = contarFiltrosActivos()

  return (
    <div className="filtros-container">
      {/* Barra superior con búsqueda y botón de filtros */}
      <div className="filtros-barra">
        <div className="busqueda-wrapper">
          <svg className="busqueda-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre de cliente..."
            value={filtros.busqueda || ''}
            onChange={(e) => handleChange('busqueda', e.target.value)}
            className="input-busqueda"
          />
          {filtros.busqueda && (
            <button 
              className="btn-limpiar-busqueda"
              onClick={() => handleChange('busqueda', '')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="filtros-acciones">
          <button 
            className={`btn-toggle-filtros ${mostrarFiltros ? 'active' : ''}`}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filtros</span>
            {filtrosActivos > 0 && (
              <span className="badge-filtros">{filtrosActivos}</span>
            )}
          </button>

          {filtrosActivos > 0 && (
            <button className="btn-limpiar-filtros" onClick={handleLimpiar}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Panel de filtros expandible */}
      {mostrarFiltros && (
        <div className="filtros-panel">
          <div className="filtros-grid">
            {/* Filtro por Estado */}
            <div className="filtro-grupo">
              <label className="filtro-label">Estado</label>
              <select
                value={filtros.estado || ''}
                onChange={(e) => handleChange('estado', e.target.value)}
                className="filtro-select"
              >
                <option value="">Todos los estados</option>
                {Object.entries(ESTADOS_TURNO_CONFIG).map(([valor, config]) => (
                  <option key={valor} value={valor}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Profesional */}
            <div className="filtro-grupo">
              <label className="filtro-label">Profesional</label>
              <select
                value={filtros.profesional_id || ''}
                onChange={(e) => handleChange('profesional_id', e.target.value)}
                className="filtro-select"
              >
                <option value="">Todos los profesionales</option>
                {profesionales.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Fecha Desde */}
            <div className="filtro-grupo">
              <label className="filtro-label">Desde</label>
              <input
                type="date"
                value={filtros.fecha_desde || ''}
                onChange={(e) => handleChange('fecha_desde', e.target.value)}
                className="filtro-input"
              />
            </div>

            {/* Filtro por Fecha Hasta */}
            <div className="filtro-grupo">
              <label className="filtro-label">Hasta</label>
              <input
                type="date"
                value={filtros.fecha_hasta || ''}
                onChange={(e) => handleChange('fecha_hasta', e.target.value)}
                className="filtro-input"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FiltrosTurnos