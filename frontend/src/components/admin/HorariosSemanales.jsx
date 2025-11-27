import { useState, useEffect } from 'react'
import { 
  obtenerProfesionales, 
  obtenerPlantilla, 
  agregarHorarioPlantilla, 
  eliminarHorarioPlantilla, 
  limpiarPlantillaDia, 
  copiarPlantillaDias 
} from '../../services/adminService'
import '../../styles/admin/HorariosSemanales.css'

function HorariosSemanales() {
  const [profesionales, setProfesionales] = useState([])
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null)
  const [diaSeleccionado, setDiaSeleccionado] = useState(1)
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)  // ⭐ AGREGADO
  const [nuevoHorario, setNuevoHorario] = useState('')
  const [mostrarModalCopiar, setMostrarModalCopiar] = useState(false)
  const [diasCopiar, setDiasCopiar] = useState([])
  const [guardando, setGuardando] = useState(false)

  const diasSemana = [
    { valor: 1, nombre: 'Lunes', abrev: 'Lun', color: '#3b82f6' },
    { valor: 2, nombre: 'Martes', abrev: 'Mar', color: '#8b5cf6' },
    { valor: 3, nombre: 'Miércoles', abrev: 'Mié', color: '#ec4899' },
    { valor: 4, nombre: 'Jueves', abrev: 'Jue', color: '#f59e0b' },
    { valor: 5, nombre: 'Viernes', abrev: 'Vie', color: '#10b981' },
    { valor: 6, nombre: 'Sábado', abrev: 'Sáb', color: '#06b6d4' },
    { valor: 0, nombre: 'Domingo', abrev: 'Dom', color: '#ef4444' }
  ]

  useEffect(() => {
    cargarProfesionales()
  }, [])

  useEffect(() => {
    if (profesionalSeleccionado) {
      cargarHorarios()
    }
  }, [profesionalSeleccionado, diaSeleccionado])

  const cargarProfesionales = async () => {
  console.log('📡 Iniciando carga de profesionales...')
  try {
    setLoading(true)
    setError(null)
    
    const { data, error: fetchError } = await obtenerProfesionales()
    
    console.log('✅ Profesionales cargados:', data)
    
    if (fetchError) {
      console.error('❌ Error al cargar profesionales:', fetchError)
      setError('Error al cargar profesionales: ' + fetchError.message)
      setLoading(false)
      return
    }
    
    if (!data || data.length === 0) {
      console.warn('⚠️ No hay profesionales disponibles')
      setError('No hay profesionales configurados')
      setLoading(false)
      return
    }
    
    setProfesionales(data)
    setProfesionalSeleccionado(data[0].id)
    console.log('✅ Profesional seleccionado por defecto:', data[0].id)
    
  } catch (err) {
    console.error('❌ Error inesperado al cargar profesionales:', err)
    setError('Error inesperado: ' + err.message)
  } finally {
    setLoading(false)
  }
}

  const cargarHorarios = async () => {
  console.log('📡 Cargando horarios...')
  try {
    setLoading(true)
    
    const { data, error: fetchError } = await obtenerPlantilla(profesionalSeleccionado, diaSeleccionado)
    
    console.log('✅ Horarios cargados:', data)
    
    if (fetchError) {
      console.error('❌ Error al cargar horarios:', fetchError)
      setError('Error al cargar horarios')
      setHorarios([])
      return
    }
    
    setHorarios(data || [])
    
  } catch (err) {
    console.error('❌ Error inesperado al cargar horarios:', err)
    setError('Error inesperado al cargar horarios')
    setHorarios([])
  } finally {
    setLoading(false)
  }
}

 const agregarHorario = async () => {
  if (!nuevoHorario) {
    alert('⚠️ Ingresa una hora válida')
    return
  }

  if (horarios.some(h => h.hora.substring(0, 5) === nuevoHorario)) {
    alert('⚠️ Este horario ya existe')
    return
  }

  const { data, error } = await agregarHorarioPlantilla(profesionalSeleccionado, diaSeleccionado, nuevoHorario)
  
  if (error) {
    alert('❌ Error al agregar horario')
    return
  }
  
  setHorarios([...horarios, data].sort((a, b) => a.hora.localeCompare(b.hora)))
  setNuevoHorario('')
}

 const eliminarHorario = async (id) => {
  if (!window.confirm('¿Eliminar este horario de la plantilla?')) return
  
  const { success } = await eliminarHorarioPlantilla(id)
  if (success) {
    setHorarios(horarios.filter(h => h.id !== id))
  }
}

const limpiarDia = async () => {
  const diaActual = diasSemana.find(d => d.valor === diaSeleccionado)
  if (!window.confirm(`¿Eliminar TODOS los horarios de ${diaActual?.nombre}?`)) return

  const { success } = await limpiarPlantillaDia(profesionalSeleccionado, diaSeleccionado)
  if (success) {
    setHorarios([])
  }
}

 const handleCopiar = async () => {
  if (diasCopiar.length === 0) {
    alert('⚠️ Selecciona al menos un día destino')
    return
  }

  if (!window.confirm(`¿Copiar ${horarios.length} horarios a ${diasCopiar.length} día(s)?`)) return

  setGuardando(true)
  const { success, copiados } = await copiarPlantillaDias(profesionalSeleccionado, diaSeleccionado, diasCopiar)
  setGuardando(false)
  
  if (success) {
    setMostrarModalCopiar(false)
    setDiasCopiar([])
    alert(`✅ ${copiados} horarios copiados exitosamente`)
  }
}

  const toggleDiaCopiar = (dia) => {
    if (dia === diaSeleccionado) return // No copiar al mismo día

    setDiasCopiar(prev => 
      prev.includes(dia) 
        ? prev.filter(d => d !== dia)
        : [...prev, dia]
    )
  }

  const diaActual = diasSemana.find(d => d.valor === diaSeleccionado)

  if (loading) {
    return (
      <div className="horarios-semanales-container">
        <div className="loading-container">
          <div className="spinner-grande"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="horarios-semanales-container">
      {/* Header */}
      <div className="horarios-header">
        <div className="horarios-header-info">
          <div className="horarios-icono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1>Horarios Semanales</h1>
            <p>Define tus horarios por defecto para cada día de la semana</p>
          </div>
        </div>
      </div>

      {/* Selector de profesional */}
      <div className="horarios-selector">
        <label>Profesional:</label>
        <select
          value={profesionalSeleccionado || ''}
          onChange={(e) => setProfesionalSeleccionado(e.target.value)}
        >
          {profesionales.map(p => (
            <option key={p.id} value={p.id}>
              {p.nombre} - {p.especialidad}
            </option>
          ))}
        </select>
      </div>

      {/* Pestañas de días */}
      <div className="horarios-dias-tabs">
        {diasSemana.map(dia => (
          <button
            key={dia.valor}
            onClick={() => setDiaSeleccionado(dia.valor)}
            className={`dia-tab ${diaSeleccionado === dia.valor ? 'activo' : ''}`}
            style={{
              '--color-dia': dia.color,
              background: diaSeleccionado === dia.valor ? dia.color : '#f1f5f9'
            }}
          >
            <div className="dia-tab-nombre">{dia.abrev}</div>
            <div className="dia-tab-count">
              {diaSeleccionado === dia.valor ? horarios.length : ''}
            </div>
          </button>
        ))}
      </div>

      {/* Contenido principal */}
      <div className="horarios-content">
        {/* Panel principal */}
        <div className="horarios-panel-principal">
          <div className="horarios-panel-header">
            <h2>Horarios de {diaActual?.nombre}</h2>
            <span className="horarios-count">{horarios.length} turnos</span>
          </div>

          {/* Agregar nuevo */}
          <div className="horarios-agregar">
            <input
              type="time"
              value={nuevoHorario}
              onChange={(e) => setNuevoHorario(e.target.value)}
              placeholder="HH:MM"
            />
            <button onClick={agregarHorario} className="btn-agregar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar
            </button>
          </div>

          {/* Lista de horarios */}
          <div className="horarios-lista">
            {horarios.length === 0 ? (
              <div className="horarios-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No hay horarios configurados</p>
                <small>Agrega tu primer horario arriba</small>
              </div>
            ) : (
              horarios.map(horario => (
                <div key={horario.id} className="horario-item">
                  <div className="horario-info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="horario-hora">{horario.hora.substring(0, 5)}</span>
                  </div>
                  <button
                    onClick={() => eliminarHorario(horario.id)}
                    className="btn-eliminar"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="horarios-panel-lateral">
          {/* Info */}
          <div className="horarios-info-box info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong>¿Cómo funciona?</strong>
              <p>Los horarios que configures aquí se aplicarán automáticamente a todos los {diaActual?.nombre}s futuros.</p>
            </div>
          </div>

          {/* Protección */}
          <div className="horarios-info-box warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <strong>Turnos protegidos</strong>
              <p>Los días con turnos ya reservados no serán modificados.</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="horarios-acciones">
            <button 
              onClick={() => setMostrarModalCopiar(true)}
              className="btn-accion copiar"
              disabled={horarios.length === 0}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar a otros días
            </button>

            <button 
              onClick={limpiarDia}
              className="btn-accion limpiar"
              disabled={horarios.length === 0}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpiar día
            </button>
          </div>
        </div>
      </div>

      {/* Modal copiar */}
      {mostrarModalCopiar && (
        <div className="modal-overlay" onClick={() => setMostrarModalCopiar(false)}>
          <div className="modal-copiar" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Copiar horarios de {diaActual?.nombre}</h3>
              <button onClick={() => setMostrarModalCopiar(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="modal-descripcion">
              Se copiarán {horarios.length} horarios a los días seleccionados
            </p>

            <div className="modal-dias-grid">
              {diasSemana.filter(d => d.valor !== diaSeleccionado).map(dia => (
                <button
                  key={dia.valor}
                  onClick={() => toggleDiaCopiar(dia.valor)}
                  className={`modal-dia-btn ${diasCopiar.includes(dia.valor) ? 'seleccionado' : ''}`}
                  style={{ '--color-dia': dia.color }}
                >
                  <span>{dia.nombre}</span>
                  {diasCopiar.includes(dia.valor) && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="modal-acciones">
              <button onClick={() => setMostrarModalCopiar(false)} className="btn-cancelar">
                Cancelar
              </button>
              <button 
                onClick={handleCopiar} 
                className="btn-confirmar"
                disabled={guardando || diasCopiar.length === 0}
              >
                {guardando ? 'Copiando...' : `Copiar a ${diasCopiar.length} día(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HorariosSemanales