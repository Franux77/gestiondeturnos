import { useState } from 'react'
import { toggleActivoProfesional } from '../../services/adminService'
import '../../styles/admin/GestionProfesionales.css'

function CardProfesional({ profesional, onEditar, onActualizar }) {
  const [loading, setLoading] = useState(false)

  const handleToggleActivo = async () => {
    if (loading) return

    const accion = profesional.activo ? 'desactivar' : 'activar'
    if (!window.confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${profesional.nombre}?`)) {
      return
    }

    setLoading(true)
    const { error } = await toggleActivoProfesional(profesional.id, !profesional.activo)

    if (error) {
      alert('Error al cambiar el estado del profesional')
    } else {
      onActualizar()
    }

    setLoading(false)
  }

  return (
    <div 
      className={`card-profesional ${!profesional.activo ? 'inactivo' : ''}`}
      style={{ '--profesional-color': profesional.color }}
    >
      {/* Badge de estado */}
      <div className={`badge-activo ${profesional.activo ? 'activo' : 'inactivo'}`}>
        {profesional.activo ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Activo</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Inactivo</span>
          </>
        )}
      </div>

      {/* Avatar */}
      <div className="profesional-avatar-card">
        <div className="avatar-circle-card">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className="avatar-glow-card"></div>
      </div>

      {/* Info */}
      <div className="profesional-info-card">
        <h3 className="profesional-nombre-card">{profesional.nombre}</h3>
        <p className="profesional-especialidad-card">{profesional.especialidad}</p>
      </div>

      {/* Color picker visual */}
      <div className="profesional-color-info">
        <span className="color-label">Color asignado</span>
        <div className="color-muestra" style={{ background: profesional.color }}></div>
      </div>

      {/* Orden */}
      <div className="profesional-orden">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        <span>Orden: {profesional.orden}</span>
      </div>

      {/* Acciones */}
      <div className="profesional-acciones-card">
        <button
          className="btn-accion-prof editar"
          onClick={() => onEditar(profesional)}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Editar</span>
        </button>

        <button
          className={`btn-accion-prof ${profesional.activo ? 'desactivar' : 'activar'}`}
          onClick={handleToggleActivo}
          disabled={loading}
        >
          {profesional.activo ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span>Desactivar</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Activar</span>
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="profesional-loading">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  )
}

export default CardProfesional