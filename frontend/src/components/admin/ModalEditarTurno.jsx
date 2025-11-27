import { useState, useEffect } from 'react'
import { actualizarTurno } from '../../services/adminService'
import { obtenerProfesionales, obtenerHorariosDisponibles } from '../../services/turnosService'
import { validarEmail, validarTelefono } from '../../utils/helpers'
import '../../styles/admin/TurnosLista.css'

function ModalEditarTurno({ turno, onCerrar, onActualizar }) {
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_email: '',
    profesional_id: '',
    fecha: '',
    hora_inicio: '',
    servicio: '',
    notas: ''
  })
  const [profesionales, setProfesionales] = useState([])
  const [horariosDisponibles, setHorariosDisponibles] = useState([])
  const [errores, setErrores] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (turno) {
      setFormData({
        cliente_nombre: turno.cliente_nombre || '',
        cliente_telefono: turno.cliente_telefono || '',
        cliente_email: turno.cliente_email || '',
        profesional_id: turno.profesional_id || '',
        fecha: turno.fecha || '',
        hora_inicio: turno.hora_inicio || '',
        servicio: turno.servicio || '',
        notas: turno.notas || ''
      })
    }
    cargarProfesionales()
  }, [turno])

  useEffect(() => {
    if (formData.profesional_id && formData.fecha) {
      cargarHorariosDisponibles()
    }
  }, [formData.profesional_id, formData.fecha])

  const cargarProfesionales = async () => {
    const { data } = await obtenerProfesionales()
    if (data) {
      setProfesionales(data)
    }
  }

  const cargarHorariosDisponibles = async () => {
    const { data } = await obtenerHorariosDisponibles(
      formData.profesional_id,
      formData.fecha
    )
    if (data) {
      // Agregar el horario actual del turno
      const horariosConActual = [...data, turno.hora_inicio]
      setHorariosDisponibles([...new Set(horariosConActual)].sort())
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: null }))
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formData.cliente_nombre.trim()) {
      nuevosErrores.cliente_nombre = 'El nombre es obligatorio'
    }

    if (!formData.cliente_telefono.trim()) {
      nuevosErrores.cliente_telefono = 'El teléfono es obligatorio'
    } else if (!validarTelefono(formData.cliente_telefono)) {
      nuevosErrores.cliente_telefono = 'Teléfono inválido'
    }

    if (!formData.cliente_email.trim()) {
      nuevosErrores.cliente_email = 'El email es obligatorio'
    } else if (!validarEmail(formData.cliente_email)) {
      nuevosErrores.cliente_email = 'Email inválido'
    }

    if (!formData.profesional_id) {
      nuevosErrores.profesional_id = 'Seleccioná un profesional'
    }

    if (!formData.fecha) {
      nuevosErrores.fecha = 'Seleccioná una fecha'
    }

    if (!formData.hora_inicio) {
      nuevosErrores.hora_inicio = 'Seleccioná un horario'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) return

    setLoading(true)

    const { data, error } = await actualizarTurno(turno.id, formData)

    if (error) {
      alert('Error al actualizar el turno')
    } else if (data) {
      onActualizar()
      onCerrar()
    }

    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-editar" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Turno</h2>
          <button className="btn-cerrar-modal" onClick={onCerrar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre del Cliente *</label>
              <input
                type="text"
                name="cliente_nombre"
                value={formData.cliente_nombre}
                onChange={handleChange}
                className={errores.cliente_nombre ? 'error' : ''}
                disabled={loading}
              />
              {errores.cliente_nombre && (
                <span className="error-text">{errores.cliente_nombre}</span>
              )}
            </div>

            <div className="form-group">
              <label>Teléfono *</label>
              <input
                type="tel"
                name="cliente_telefono"
                value={formData.cliente_telefono}
                onChange={handleChange}
                className={errores.cliente_telefono ? 'error' : ''}
                disabled={loading}
              />
              {errores.cliente_telefono && (
                <span className="error-text">{errores.cliente_telefono}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label>Email *</label>
              <input
                type="email"
                name="cliente_email"
                value={formData.cliente_email}
                onChange={handleChange}
                className={errores.cliente_email ? 'error' : ''}
                disabled={loading}
              />
              {errores.cliente_email && (
                <span className="error-text">{errores.cliente_email}</span>
              )}
            </div>

            <div className="form-group">
              <label>Profesional *</label>
              <select
                name="profesional_id"
                value={formData.profesional_id}
                onChange={handleChange}
                className={errores.profesional_id ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Seleccionar...</option>
                {profesionales.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nombre}
                  </option>
                ))}
              </select>
              {errores.profesional_id && (
                <span className="error-text">{errores.profesional_id}</span>
              )}
            </div>

            <div className="form-group">
              <label>Fecha *</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className={errores.fecha ? 'error' : ''}
                disabled={loading}
              />
              {errores.fecha && (
                <span className="error-text">{errores.fecha}</span>
              )}
            </div>

            <div className="form-group">
              <label>Horario *</label>
              <select
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleChange}
                className={errores.hora_inicio ? 'error' : ''}
                disabled={loading || horariosDisponibles.length === 0}
              >
                <option value="">Seleccionar...</option>
                {horariosDisponibles.map(horario => (
                  <option key={horario} value={horario}>
                    {horario.substring(0, 5)}
                  </option>
                ))}
              </select>
              {errores.hora_inicio && (
                <span className="error-text">{errores.hora_inicio}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label>Servicio</label>
              <input
                type="text"
                name="servicio"
                value={formData.servicio}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group full-width">
              <label>Notas</label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                rows={3}
                disabled={loading}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancelar"
              onClick={onCerrar}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-guardar"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalEditarTurno