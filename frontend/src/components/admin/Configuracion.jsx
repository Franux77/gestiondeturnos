import { useState, useEffect } from 'react'
import { obtenerTodasConfiguraciones, guardarMultiplesConfiguraciones } from '../../services/adminService'
import '../../styles/admin/Configuracion.css'

function Configuracion() {
  const [config, setConfig] = useState({
    nombre_negocio: '',
    telefono_negocio: '',
    email_negocio: '',
    direccion: '',
    horario_inicio: '',
    horario_fin: '',
    duracion_turno_minutos: '',
    dias_habiles: []
  })

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState(false)
  const [errores, setErrores] = useState({})

  const diasSemana = [
    { valor: '0', nombre: 'Domingo', abrev: 'Dom' },
    { valor: '1', nombre: 'Lunes', abrev: 'Lun' },
    { valor: '2', nombre: 'Martes', abrev: 'Mar' },
    { valor: '3', nombre: 'Miércoles', abrev: 'Mié' },
    { valor: '4', nombre: 'Jueves', abrev: 'Jue' },
    { valor: '5', nombre: 'Viernes', abrev: 'Vie' },
    { valor: '6', nombre: 'Sábado', abrev: 'Sáb' }
  ]

  useEffect(() => {
    cargarConfiguracion()
  }, [])

  const cargarConfiguracion = async () => {
    setLoading(true)
    const { data, error } = await obtenerTodasConfiguraciones()

    if (!error && data) {
      setConfig({
        nombre_negocio: data.nombre_negocio || '',
        telefono_negocio: data.telefono_negocio || '',
        email_negocio: data.email_negocio || '',
        direccion: data.direccion || '',
        horario_inicio: data.horario_inicio || '',
        horario_fin: data.horario_fin || '',
        duracion_turno_minutos: data.duracion_turno_minutos || '',
        dias_habiles: data.dias_habiles ? data.dias_habiles.split(',') : []
      })
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setConfig(prev => ({ ...prev, [name]: value }))
    
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleToggleDia = (dia) => {
    setConfig(prev => {
      const dias = prev.dias_habiles.includes(dia)
        ? prev.dias_habiles.filter(d => d !== dia)
        : [...prev.dias_habiles, dia].sort()
      
      return { ...prev, dias_habiles: dias }
    })
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!config.nombre_negocio.trim()) {
      nuevosErrores.nombre_negocio = 'El nombre del negocio es obligatorio'
    }

    if (!config.telefono_negocio.trim()) {
      nuevosErrores.telefono_negocio = 'El teléfono es obligatorio'
    }

    if (!config.email_negocio.trim()) {
      nuevosErrores.email_negocio = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email_negocio)) {
      nuevosErrores.email_negocio = 'Email inválido'
    }

    if (!config.direccion.trim()) {
      nuevosErrores.direccion = 'La dirección es obligatoria'
    }

    if (!config.horario_inicio) {
      nuevosErrores.horario_inicio = 'La hora de inicio es obligatoria'
    }

    if (!config.horario_fin) {
      nuevosErrores.horario_fin = 'La hora de fin es obligatoria'
    }

    if (config.horario_inicio && config.horario_fin && config.horario_inicio >= config.horario_fin) {
      nuevosErrores.horario_fin = 'La hora de fin debe ser posterior a la de inicio'
    }

    if (!config.duracion_turno_minutos) {
      nuevosErrores.duracion_turno_minutos = 'La duración del turno es obligatoria'
    } else if (parseInt(config.duracion_turno_minutos) < 5) {
      nuevosErrores.duracion_turno_minutos = 'La duración mínima es 5 minutos'
    } else if (parseInt(config.duracion_turno_minutos) > 480) {
      nuevosErrores.duracion_turno_minutos = 'La duración máxima es 480 minutos (8 horas)'
    }

    if (config.dias_habiles.length === 0) {
      nuevosErrores.dias_habiles = 'Debes seleccionar al menos un día hábil'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setGuardando(true)
    setMensajeExito(false)

    const datosGuardar = {
      nombre_negocio: config.nombre_negocio,
      telefono_negocio: config.telefono_negocio,
      email_negocio: config.email_negocio,
      direccion: config.direccion,
      horario_inicio: config.horario_inicio,
      horario_fin: config.horario_fin,
      duracion_turno_minutos: config.duracion_turno_minutos,
      dias_habiles: config.dias_habiles.join(',')
    }

    const { error } = await guardarMultiplesConfiguraciones(datosGuardar)

    setGuardando(false)

    if (error) {
      alert('Error al guardar la configuración. Intenta nuevamente.')
    } else {
      setMensajeExito(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => setMensajeExito(false), 5000)
    }
  }

  if (loading) {
    return (
      <div className="admin-configuracion-container">
        <div className="admin-config-loading">
          <div className="admin-config-spinner-grande"></div>
          <p>Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-configuracion-container">
      {/* Header */}
      <div className="admin-config-header">
        <div className="admin-config-header-info">
          <div className="admin-config-icono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1>Configuración</h1>
            <p>Administra los ajustes generales del sistema</p>
          </div>
        </div>
      </div>

      {/* Mensaje de éxito */}
      {mensajeExito && (
        <div className="admin-config-alerta-exito">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>¡Configuración guardada exitosamente!</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="admin-config-form">
        {/* Sección: Datos del Negocio */}
        <div className="admin-config-seccion">
          <div className="admin-config-seccion-header">
            <div className="admin-config-seccion-icono admin-config-negocio">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2>Datos del Negocio</h2>
              <p>Información básica de tu negocio</p>
            </div>
          </div>

          <div className="admin-config-grid">
            <div className="admin-config-form-group admin-config-full-width">
              <label htmlFor="nombre_negocio">
                Nombre del negocio
                <span className="admin-config-requerido">*</span>
              </label>
              <input
                type="text"
                id="nombre_negocio"
                name="nombre_negocio"
                value={config.nombre_negocio}
                onChange={handleChange}
                placeholder="Ej: Barbería Gráfico"
                className={errores.nombre_negocio ? 'admin-config-error' : ''}
              />
              {errores.nombre_negocio && <span className="admin-config-mensaje-error">{errores.nombre_negocio}</span>}
            </div>

            <div className="admin-config-form-group">
              <label htmlFor="telefono_negocio">
                Teléfono
                <span className="admin-config-requerido">*</span>
              </label>
              <input
                type="tel"
                id="telefono_negocio"
                name="telefono_negocio"
                value={config.telefono_negocio}
                onChange={handleChange}
                placeholder="+5493777209955"
                className={errores.telefono_negocio ? 'admin-config-error' : ''}
              />
              {errores.telefono_negocio && <span className="admin-config-mensaje-error">{errores.telefono_negocio}</span>}
            </div>

            <div className="admin-config-form-group">
              <label htmlFor="email_negocio">
                Email
                <span className="admin-config-requerido">*</span>
              </label>
              <input
                type="email"
                id="email_negocio"
                name="email_negocio"
                value={config.email_negocio}
                onChange={handleChange}
                placeholder="contacto@negocio.com"
                className={errores.email_negocio ? 'admin-config-error' : ''}
              />
              {errores.email_negocio && <span className="admin-config-mensaje-error">{errores.email_negocio}</span>}
            </div>

            <div className="admin-config-form-group admin-config-full-width">
              <label htmlFor="direccion">
                Dirección completa
                <span className="admin-config-requerido">*</span>
              </label>
              <textarea
                id="direccion"
                name="direccion"
                value={config.direccion}
                onChange={handleChange}
                placeholder="Calle, número, barrio, ciudad, provincia"
                rows="3"
                className={errores.direccion ? 'admin-config-error' : ''}
              />
              {errores.direccion && <span className="admin-config-mensaje-error">{errores.direccion}</span>}
            </div>
          </div>
        </div>

        {/* Sección: Horarios */}
        <div className="admin-config-seccion">
          <div className="admin-config-seccion-header">
            <div className="admin-config-seccion-icono admin-config-horarios">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2>Configuración de Horarios</h2>
              <p>Define los horarios de atención y duración de turnos</p>
            </div>
          </div>

          <div className="admin-config-grid">
            <div className="admin-config-form-group">
              <label htmlFor="horario_inicio">
                Hora de inicio
                <span className="admin-config-requerido">*</span>
              </label>
              <input
                type="time"
                id="horario_inicio"
                name="horario_inicio"
                value={config.horario_inicio}
                onChange={handleChange}
                className={errores.horario_inicio ? 'admin-config-error' : ''}
              />
              {errores.horario_inicio && <span className="admin-config-mensaje-error">{errores.horario_inicio}</span>}
            </div>

            <div className="admin-config-form-group">
              <label htmlFor="horario_fin">
                Hora de fin
                <span className="admin-config-requerido">*</span>
              </label>
              <input
                type="time"
                id="horario_fin"
                name="horario_fin"
                value={config.horario_fin}
                onChange={handleChange}
                className={errores.horario_fin ? 'admin-config-error' : ''}
              />
              {errores.horario_fin && <span className="admin-config-mensaje-error">{errores.horario_fin}</span>}
            </div>

            <div className="admin-config-form-group admin-config-full-width">
              <label htmlFor="duracion_turno_minutos">
                Duración de cada turno (minutos)
                <span className="admin-config-requerido">*</span>
              </label>
              <div className="admin-config-input-con-info">
                <input
                  type="number"
                  id="duracion_turno_minutos"
                  name="duracion_turno_minutos"
                  value={config.duracion_turno_minutos}
                  onChange={handleChange}
                  min="5"
                  max="480"
                  step="5"
                  placeholder="30"
                  className={errores.duracion_turno_minutos ? 'admin-config-error' : ''}
                />
                <span className="admin-config-input-hint">Valores comunes: 15, 30, 45, 60 minutos</span>
              </div>
              {errores.duracion_turno_minutos && <span className="admin-config-mensaje-error">{errores.duracion_turno_minutos}</span>}
            </div>
          </div>
        </div>

        {/* Sección: Días Hábiles */}
        <div className="admin-config-seccion">
          <div className="admin-config-seccion-header">
            <div className="admin-config-seccion-icono admin-config-dias">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2>Días Hábiles</h2>
              <p>Selecciona los días en los que se pueden reservar turnos</p>
            </div>
          </div>

          <div className="admin-config-dias-grid">
            {diasSemana.map(dia => (
              <button
                key={dia.valor}
                type="button"
                className={`admin-config-dia-btn ${config.dias_habiles.includes(dia.valor) ? 'admin-config-activo' : ''}`}
                onClick={() => handleToggleDia(dia.valor)}
              >
                <span className="admin-config-dia-nombre">{dia.nombre}</span>
                <span className="admin-config-dia-abrev">{dia.abrev}</span>
                {config.dias_habiles.includes(dia.valor) && (
                  <svg className="admin-config-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          {errores.dias_habiles && <span className="admin-config-mensaje-error">{errores.dias_habiles}</span>}
        </div>

        {/* Botón guardar */}
        <div className="admin-config-acciones">
          <button type="submit" className="admin-config-btn-guardar" disabled={guardando}>
            {guardando ? (
              <>
                <div className="admin-config-spinner-pequeño"></div>
                <span>Guardando cambios...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Guardar Configuración</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Configuracion