import { useState, useEffect } from 'react'
import { obtenerProfesionales } from '../../services/adminService'
import CardProfesional from './CardProfesional'
import ModalProfesional from './ModalProfesional'
import '../../styles/admin/GestionProfesionales.css'

function GestionProfesionales() {
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [profesionalEditar, setProfesionalEditar] = useState(null)
  const [filtro, setFiltro] = useState('todos') // todos, activos, inactivos

  useEffect(() => {
    cargarProfesionales()
  }, [])

  const cargarProfesionales = async () => {
    setLoading(true)
    const { data, error } = await obtenerProfesionales()
    
    if (!error && data) {
      setProfesionales(data)
    }
    
    setLoading(false)
  }

  const handleAbrirModalNuevo = () => {
    setProfesionalEditar(null)
    setMostrarModal(true)
  }

  const handleAbrirModalEditar = (profesional) => {
    setProfesionalEditar(profesional)
    setMostrarModal(true)
  }

  const handleCerrarModal = () => {
    setMostrarModal(false)
    setProfesionalEditar(null)
  }

  const handleGuardarExitoso = () => {
    cargarProfesionales()
    handleCerrarModal()
  }

  // Filtrar profesionales
  const profesionalesFiltrados = profesionales.filter(prof => {
    if (filtro === 'activos') return prof.activo
    if (filtro === 'inactivos') return !prof.activo
    return true
  })

  // Estadísticas
  const stats = {
    total: profesionales.length,
    activos: profesionales.filter(p => p.activo).length,
    inactivos: profesionales.filter(p => !p.activo).length
  }

  if (loading) {
    return (
      <div className="gestion-profesionales">
        <div className="loading-profesionales">
          <div className="spinner-grande"></div>
          <p>Cargando profesionales...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="gestion-profesionales">
      {/* Header */}
      <div className="gestion-header">
        <div className="header-info">
          <div className="icono-profesionales">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1>Gestión de Profesionales</h1>
            <p>Administra todos los profesionales del sistema</p>
          </div>
        </div>

        <button className="btn-nuevo-profesional" onClick={handleAbrirModalNuevo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Profesional</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="stats-profesionales">
        <div className="stat-card">
          <div className="stat-icono total">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total</span>
            <span className="stat-valor">{stats.total}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icono activos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Activos</span>
            <span className="stat-valor">{stats.activos}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icono inactivos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Inactivos</span>
            <span className="stat-valor">{stats.inactivos}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-profesionales">
        <button
          className={`filtro-btn ${filtro === 'todos' ? 'activo' : ''}`}
          onClick={() => setFiltro('todos')}
        >
          Todos ({stats.total})
        </button>
        <button
          className={`filtro-btn ${filtro === 'activos' ? 'activo' : ''}`}
          onClick={() => setFiltro('activos')}
        >
          Activos ({stats.activos})
        </button>
        <button
          className={`filtro-btn ${filtro === 'inactivos' ? 'activo' : ''}`}
          onClick={() => setFiltro('inactivos')}
        >
          Inactivos ({stats.inactivos})
        </button>
      </div>

      {/* Grid de profesionales */}
      {profesionalesFiltrados.length === 0 ? (
        <div className="sin-profesionales">
          <div className="icono-vacio">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3>No hay profesionales {filtro !== 'todos' ? filtro : ''}</h3>
          <p>
            {filtro === 'todos' 
              ? 'Comienza agregando tu primer profesional'
              : `No hay profesionales ${filtro} en este momento`
            }
          </p>
          {filtro === 'todos' && (
            <button className="btn-agregar-vacio" onClick={handleAbrirModalNuevo}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Agregar Profesional</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid-profesionales">
          {profesionalesFiltrados.map(profesional => (
            <CardProfesional
              key={profesional.id}
              profesional={profesional}
              onEditar={handleAbrirModalEditar}
              onActualizar={cargarProfesionales}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <ModalProfesional
          profesional={profesionalEditar}
          onCerrar={handleCerrarModal}
          onGuardado={handleGuardarExitoso}
        />
      )}
    </div>
  )
}

export default GestionProfesionales