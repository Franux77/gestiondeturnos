import { useState, useEffect } from 'react'
import { crearProfesional, actualizarProfesional } from '../../services/adminService'
import '../../styles/admin/GestionProfesionales.css'

function ModalProfesional({ profesional, onCerrar, onGuardado }) {
  const esEdicion = !!profesional

  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    color: '#a3e635',
    activo: true
  })

  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  // Colores predefinidos
  const coloresPredefinidos = [
    { nombre: 'Verde Lima', hex: '#a3e635' },
    { nombre: 'Azul', hex: '#3B82F6' },
    { nombre: 'Rosa', hex: '#EC4899' },
    { nombre: 'Morado', hex: '#A855F7' },
    { nombre: 'Naranja', hex: '#F97316' },
    { nombre: 'Cyan', hex: '#06B6D4' },
    { nombre: 'Verde', hex: '#10B981' },
    { nombre: 'Amarillo', hex: '#EAB308' },
    { nombre: 'Rojo', hex: '#EF4444' },
    { nombre: 'Índigo', hex: '#6366F1' }
  ]

  useEffect(() => {
    if (profesional) {
      setFormData({
        nombre: profesional.nombre,
        especialidad: profesional.especialidad,
        color: profesional.color,
        activo: profesional.activo
      })
    }
  }, [profesional])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: null }))
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.especialidad.trim()) {
      nuevosErrores.especialidad = 'La especialidad es obligatoria'
    } else if (formData.especialidad.length < 3) {
      nuevosErrores.especialidad = 'La especialidad debe tener al menos 3 caracteres'
    }

    if (!formData.color) {
      nuevosErrores.color = 'Debes seleccionar un color'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) return

    setGuardando(true)

    let resultado
    if (esEdicion) {
      resultado = await actualizarProfesional(profesional.id, formData)
    } else {
      resultado = await crearProfesional(formData)
    }

    setGuardando(false)

    if (resultado.error) {
      alert('Error al guardar el profesional. Intenta nuevamente.')
    } else {
      onGuardado()
    }
  }

  const handleClickFondo = (e) => {
    if (e.target.className === 'modal-overlay') {
      onCerrar()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClickFondo}>
      <div className="modal-profesional">
        {/* Header */}
        <div className="modal-header">
          <div className="header-con-icono">
            <div className="icono-modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2>{esEdicion ? 'Editar Profesional' : 'Nuevo Profesional'}</h2>
              <p>{esEdicion ? 'Modifica los datos del profesional' : 'Completa los datos del nuevo profesional'}</p>
            </div>
          </div>
          
          <button className="btn-cerrar-modal" onClick={onCerrar} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="form-profesional">
          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="nombre">
              Nombre completo
              <span className="requerido">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Franco Fernandez"
              className={errores.nombre ? 'error' : ''}
            />
            {errores.nombre && <span className="mensaje-error">{errores.nombre}</span>}
          </div>

          {/* Especialidad */}
          <div className="form-group">
            <label htmlFor="especialidad">
              Especialidad
              <span className="requerido">*</span>
            </label>
            <input
              type="text"
              id="especialidad"
              name="especialidad"
              value={formData.especialidad}
              onChange={handleChange}
              placeholder="Ej: Barbero, Peluquero, Estilista"
              className={errores.especialidad ? 'error' : ''}
            />
            {errores.especialidad && <span className="mensaje-error">{errores.especialidad}</span>}
          </div>

          {/* Color */}
          <div className="form-group">
            <label>
              Color de identificación
              <span className="requerido">*</span>
            </label>
            
            <div className="colores-grid">
              {coloresPredefinidos.map(color => (
                <button
                  key={color.hex}
                  type="button"
                  className={`color-opcion ${formData.color === color.hex ? 'seleccionado' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleChange({ target: { name: 'color', value: color.hex } })}
                  title={color.nombre}
                >
                  {formData.color === color.hex && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Color personalizado */}
            <div className="color-personalizado">
              <label htmlFor="color-custom">O elige un color personalizado:</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  id="color-custom"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                />
                <span className="color-hex">{formData.color}</span>
              </div>
            </div>

            {errores.color && <span className="mensaje-error">{errores.color}</span>}
          </div>

          {/* Estado activo */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
              />
              <span className="checkbox-custom"></span>
              <span>Profesional activo (visible para reservar turnos)</span>
            </label>
          </div>

          {/* Botones */}
          <div className="modal-acciones">
            <button 
              type="button" 
              className="btn-cancelar" 
              onClick={onCerrar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-guardar"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <div className="spinner-pequeño"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{esEdicion ? 'Guardar Cambios' : 'Crear Profesional'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalProfesional