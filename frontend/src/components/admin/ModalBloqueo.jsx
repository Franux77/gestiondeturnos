import { useState } from 'react'
import { crearBloqueo } from '../../services/adminService'
import { TIPOS_BLOQUEO, TIPOS_BLOQUEO_CONFIG } from '../../utils/constants'
import '../../styles/admin/GestionBloqueos.css'

function ModalBloqueo({ profesionales, onCerrar, onCreado }) {
  const [formData, setFormData] = useState({
    profesional_id: '',
    fecha: '',
    tipo_bloqueo: 'dia_completo', // 'dia_completo' o 'rango_horario'
    hora_inicio: '',
    hora_fin: '',
    tipo: TIPOS_BLOQUEO.MANUAL,
    motivo: ''
  })

  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: null }))
    }

    // Si cambia a día completo, limpiar horas
    if (name === 'tipo_bloqueo' && value === 'dia_completo') {
      setFormData(prev => ({ ...prev, hora_inicio: '', hora_fin: '' }))
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!formData.profesional_id) {
      nuevosErrores.profesional_id = 'Selecciona un profesional'
    }

    if (!formData.fecha) {
      nuevosErrores.fecha = 'Selecciona una fecha'
    } else {
      const hoy = new Date().toISOString().split('T')[0]
      if (formData.fecha < hoy) {
        nuevosErrores.fecha = 'No puedes bloquear fechas pasadas'
      }
    }

    if (formData.tipo_bloqueo === 'rango_horario') {
      if (!formData.hora_inicio) {
        nuevosErrores.hora_inicio = 'Ingresa hora de inicio'
      }
      if (!formData.hora_fin) {
        nuevosErrores.hora_fin = 'Ingresa hora de fin'
      }
      if (formData.hora_inicio && formData.hora_fin && formData.hora_inicio >= formData.hora_fin) {
        nuevosErrores.hora_fin = 'La hora fin debe ser posterior a la hora inicio'
      }
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) return

    setGuardando(true)

    const datosBloqueo = {
      profesional_id: formData.profesional_id,
      fecha: formData.fecha,
      tipo: formData.tipo,
      motivo: formData.motivo
    }

    // Solo agregar horas si es rango horario
    if (formData.tipo_bloqueo === 'rango_horario') {
      datosBloqueo.hora_inicio = formData.hora_inicio + ':00'
      datosBloqueo.hora_fin = formData.hora_fin + ':00'
    }

    const { data, error } = await crearBloqueo(datosBloqueo)

    setGuardando(false)

    if (error) {
      alert('Error al crear el bloqueo. Intenta nuevamente.')
    } else if (data) {
      onCreado()
    }
  }

  const handleClickFondo = (e) => {
    if (e.target.className === 'modal-overlay') {
      onCerrar()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClickFondo}>
      <div className="modal-bloqueo">
        {/* Header */}
        <div className="modal-bloqueo-header">
          <div className="header-con-icono">
            <div className="icono-modal-bloqueo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2>Crear Bloqueo</h2>
              <p>Bloquea un día completo o un rango de horarios específico</p>
            </div>
          </div>
          
          <button className="btn-cerrar-modal-bloqueo" onClick={onCerrar} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="form-bloqueo">
          {/* Profesional */}
          <div className="form-group-bloqueo">
            <label htmlFor="profesional_id">
              Profesional
              <span className="requerido">*</span>
            </label>
            <select
              id="profesional_id"
              name="profesional_id"
              value={formData.profesional_id}
              onChange={handleChange}
              className={errores.profesional_id ? 'error' : ''}
            >
              <option value="">Selecciona un profesional</option>
              {profesionales.map(prof => (
                <option key={prof.id} value={prof.id}>
                  {prof.nombre} - {prof.especialidad}
                </option>
              ))}
            </select>
            {errores.profesional_id && <span className="mensaje-error">{errores.profesional_id}</span>}
          </div>

          {/* Fecha */}
          <div className="form-group-bloqueo">
            <label htmlFor="fecha">
              Fecha
              <span className="requerido">*</span>
            </label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={errores.fecha ? 'error' : ''}
            />
            {errores.fecha && <span className="mensaje-error">{errores.fecha}</span>}
          </div>

          {/* Tipo de bloqueo */}
          <div className="form-group-bloqueo">
            <label>Tipo de bloqueo</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="tipo_bloqueo"
                  value="dia_completo"
                  checked={formData.tipo_bloqueo === 'dia_completo'}
                  onChange={handleChange}
                />
                <span className="radio-custom"></span>
                <span>Día completo</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="tipo_bloqueo"
                  value="rango_horario"
                  checked={formData.tipo_bloqueo === 'rango_horario'}
                  onChange={handleChange}
                />
                <span className="radio-custom"></span>
                <span>Rango de horarios</span>
              </label>
            </div>
          </div>

          {/* Horarios (solo si es rango) */}
          {formData.tipo_bloqueo === 'rango_horario' && (
            <div className="horarios-group">
              <div className="form-group-bloqueo">
                <label htmlFor="hora_inicio">
                  Hora inicio
                  <span className="requerido">*</span>
                </label>
                <input
                  type="time"
                  id="hora_inicio"
                  name="hora_inicio"
                  value={formData.hora_inicio}
                  onChange={handleChange}
                  className={errores.hora_inicio ? 'error' : ''}
                />
                {errores.hora_inicio && <span className="mensaje-error">{errores.hora_inicio}</span>}
              </div>

              <div className="form-group-bloqueo">
                <label htmlFor="hora_fin">
                  Hora fin
                  <span className="requerido">*</span>
                </label>
                <input
                  type="time"
                  id="hora_fin"
                  name="hora_fin"
                  value={formData.hora_fin}
                  onChange={handleChange}
                  className={errores.hora_fin ? 'error' : ''}
                />
                {errores.hora_fin && <span className="mensaje-error">{errores.hora_fin}</span>}
              </div>
            </div>
          )}

          {/* Tipo */}
          <div className="form-group-bloqueo">
            <label htmlFor="tipo">Categoría</label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
            >
              {Object.entries(TIPOS_BLOQUEO_CONFIG).map(([tipo, config]) => (
                <option key={tipo} value={tipo}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Motivo */}
          <div className="form-group-bloqueo">
            <label htmlFor="motivo">Motivo (opcional)</label>
            <textarea
              id="motivo"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              placeholder="Ej: Vacaciones, médico, evento personal..."
              rows="3"
            />
          </div>

          {/* Info */}
          <div className="bloqueo-info-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong>Nota importante:</strong> Los turnos ya reservados no se verán afectados. 
              Solo se bloquearán los horarios disponibles para nuevas reservas.
            </div>
          </div>

          {/* Botones */}
          <div className="modal-bloqueo-acciones">
            <button 
              type="button" 
              className="btn-cancelar-bloqueo" 
              onClick={onCerrar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-guardar-bloqueo"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <div className="spinner-pequeño"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Crear Bloqueo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalBloqueo