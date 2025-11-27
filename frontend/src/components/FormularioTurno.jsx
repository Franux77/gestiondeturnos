import { useState } from 'react'
import { crearTurno } from '../services/turnosService'
import { validarEmail, validarTelefono, formatearFecha, formatearHora } from '../utils/helpers'
import '../styles/Formulario.css'

function FormularioTurno({ 
  profesionalSeleccionado, 
  fechaSeleccionada, 
  horarioSeleccionado,
  onTurnoCreado 
}) {
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_email: '',
    servicio: '',
    notas: ''
  })

  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo cuando el usuario escribe
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    // Validar nombre
    if (!formData.cliente_nombre.trim()) {
      nuevosErrores.cliente_nombre = 'El nombre es obligatorio'
    } else if (formData.cliente_nombre.trim().length < 3) {
      nuevosErrores.cliente_nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    // Validar teléfono
    if (!formData.cliente_telefono.trim()) {
      nuevosErrores.cliente_telefono = 'El teléfono es obligatorio'
    } else if (!validarTelefono(formData.cliente_telefono)) {
      nuevosErrores.cliente_telefono = 'Ingresá un teléfono válido (ej: 3795123456)'
    }

    // Validar email
    if (!formData.cliente_email.trim()) {
      nuevosErrores.cliente_email = 'El email es obligatorio'
    } else if (!validarEmail(formData.cliente_email)) {
      nuevosErrores.cliente_email = 'Ingresá un email válido'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      return
    }

    setEnviando(true)

    try {
      const turnoData = {
        profesional_id: profesionalSeleccionado.id,
        fecha: fechaSeleccionada,
        hora_inicio: horarioSeleccionado,
        ...formData
      }

      const { data, error } = await crearTurno(turnoData)

      if (error) {
        alert(error.message || 'Error al crear el turno')
      } else {
        // Resetear formulario
        setFormData({
          cliente_nombre: '',
          cliente_telefono: '',
          cliente_email: '',
          servicio: '',
          notas: ''
        })
        setErrores({})
        
        // Éxito - mostrar modal
        onTurnoCreado(data)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Ocurrió un error al reservar el turno')
    } finally {
      setEnviando(false)
    }
  }

  if (!horarioSeleccionado || !fechaSeleccionada || !profesionalSeleccionado) {
    return null
  }

  return (
    <section id="formulario" className="formulario-turno-section">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">Paso 4</div>
          <h2 className="section-title">
            Completá tus <span className="highlight">datos</span>
          </h2>
          <p className="section-subtitle">
            Ya casi terminamos. Solo necesitamos tu información de contacto.
          </p>
        </div>

        <div className="formulario-turno-wrapper">
          {/* Resumen del turno */}
          <div className="resumen-turno-box">
            <h3 className="resumen-turno-titulo">Resumen de tu turno</h3>
            <div className="resumen-turno-grid">
              <div className="resumen-turno-item">
                <div className="resumen-turno-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="resumen-turno-label">Profesional</div>
                  <div className="resumen-turno-valor">{profesionalSeleccionado.nombre}</div>
                </div>
              </div>

              <div className="resumen-turno-item">
                <div className="resumen-turno-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="resumen-turno-label">Fecha</div>
                  <div className="resumen-turno-valor">{formatearFecha(fechaSeleccionada)}</div>
                </div>
              </div>

              <div className="resumen-turno-item">
                <div className="resumen-turno-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="resumen-turno-label">Horario</div>
                  <div className="resumen-turno-valor">{formatearHora(horarioSeleccionado)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="formulario-turno-form">
            <div className="formulario-turno-row">
              <div className="formulario-turno-group">
                <label htmlFor="cliente_nombre" className="formulario-turno-label">
                  Nombre completo <span className="formulario-turno-required">*</span>
                </label>
                <div className="formulario-turno-input-wrapper">
                  <div className="formulario-turno-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="cliente_nombre"
                    name="cliente_nombre"
                    value={formData.cliente_nombre}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    className={errores.cliente_nombre ? 'formulario-turno-input error' : 'formulario-turno-input'}
                    disabled={enviando}
                  />
                </div>
                {errores.cliente_nombre && (
                  <span className="formulario-turno-error-message">{errores.cliente_nombre}</span>
                )}
              </div>

              <div className="formulario-turno-group">
                <label htmlFor="cliente_telefono" className="formulario-turno-label">
                  Teléfono <span className="formulario-turno-required">*</span>
                </label>
                <div className="formulario-turno-input-wrapper">
                  <div className="formulario-turno-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="cliente_telefono"
                    name="cliente_telefono"
                    value={formData.cliente_telefono}
                    onChange={handleChange}
                    placeholder="3795123456"
                    className={errores.cliente_telefono ? 'formulario-turno-input error' : 'formulario-turno-input'}
                    disabled={enviando}
                  />
                </div>
                {errores.cliente_telefono && (
                  <span className="formulario-turno-error-message">{errores.cliente_telefono}</span>
                )}
              </div>
            </div>

            <div className="formulario-turno-group">
              <label htmlFor="cliente_email" className="formulario-turno-label">
                Email <span className="formulario-turno-required">*</span>
              </label>
              <div className="formulario-turno-input-wrapper">
                <div className="formulario-turno-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="cliente_email"
                  name="cliente_email"
                  value={formData.cliente_email}
                  onChange={handleChange}
                  placeholder="juan@ejemplo.com"
                  className={errores.cliente_email ? 'formulario-turno-input error' : 'formulario-turno-input'}
                  disabled={enviando}
                />
              </div>
              {errores.cliente_email && (
                <span className="formulario-turno-error-message">{errores.cliente_email}</span>
              )}
              <span className="formulario-turno-input-help">
                Te enviaremos la confirmación a este email
              </span>
            </div>

            <div className="formulario-turno-group">
              <label htmlFor="servicio" className="formulario-turno-label">
                ¿Qué servicio necesitás? <span className="formulario-turno-optional">(opcional)</span>
              </label>
              <div className="formulario-turno-input-wrapper">
                <div className="formulario-turno-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="servicio"
                  name="servicio"
                  value={formData.servicio}
                  onChange={handleChange}
                  placeholder="Corte, barba, lavado..."
                  className="formulario-turno-input"
                  disabled={enviando}
                />
              </div>
            </div>

            <div className="formulario-turno-group">
              <label htmlFor="notas" className="formulario-turno-label">
                Notas adicionales <span className="formulario-turno-optional">(opcional)</span>
              </label>
              <textarea
                id="notas"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                placeholder="Algún detalle que quieras comentarnos..."
                rows={4}
                className="formulario-turno-textarea"
                disabled={enviando}
              />
            </div>

            <button 
              type="submit" 
              className="formulario-turno-btn-submit"
              disabled={enviando}
            >
              {enviando ? (
                <>
                  <div className="formulario-turno-spinner"></div>
                  <span>Reservando...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Confirmar Turno</span>
                </>
              )}
            </button>

            <p className="formulario-turno-disclaimer">
              Al confirmar, recibirás un email con los detalles de tu turno.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

export default FormularioTurno