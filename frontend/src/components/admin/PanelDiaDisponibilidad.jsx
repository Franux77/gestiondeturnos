import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient' // ⭐ AGREGAR ESTA LÍNEA
import { obtenerDisponibilidadDia, toggleDisponibilidadHorario, eliminarHorarioPersonalizado, restaurarHorariosDefault, obtenerPlantilla, agregarHorarioPersonalizado } from '../../services/adminService'
import { obtenerTurnosPorFecha } from '../../services/turnosService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import ModalEditarHorario from './ModalEditarHorario'
import ModalAgregarMultiples from './ModalAgregarMultiples'
import ModalCopiarDias from './ModalCopiarDias'
import '../../styles/admin/CalendarioDisponibilidad.css'

function PanelDiaDisponibilidad({ profesionalId, fecha, profesional, onCerrar, onActualizado }) {
  const [horarios, setHorarios] = useState([])
  const [turnosReservados, setTurnosReservados] = useState([])
  const [disponibilidadPersonalizada, setDisponibilidadPersonalizada] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false)
  const [modalCopiarAbierto, setModalCopiarAbierto] = useState(false)
  const [horarioAEditar, setHorarioAEditar] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [profesionalId, fecha])

  const cargarDatos = async () => {
    setLoading(true)

    // 1️⃣ Obtener día de la semana
    const fechaObj = new Date(fecha + 'T00:00:00')
    const diaSemana = fechaObj.getDay()

    // 2️⃣ Cargar en paralelo
    const [dispRes, turnosRes, plantillaRes] = await Promise.all([
      obtenerDisponibilidadDia(profesionalId, fecha),
      obtenerTurnosPorFecha(fecha, profesionalId),
      obtenerPlantilla(profesionalId, diaSemana)
    ])

    console.log('📊 Datos cargados:', {
      disponibilidad: dispRes.data?.length || 0,
      turnos: turnosRes.data?.length || 0,
      plantilla: plantillaRes.data?.length || 0
    })

    if (turnosRes.data) setTurnosReservados(turnosRes.data)
    
    const disponibilidad = dispRes.data || []
    const plantilla = plantillaRes.data || []
    
    setDisponibilidadPersonalizada(disponibilidad)
    generarHorariosCombinados(plantilla, disponibilidad)

    setLoading(false)
  }

const generarHorariosCombinados = (plantilla, disponibilidad) => {
  const overridesMap = new Map()
  disponibilidad.forEach(d => {
    const hora = d.hora.substring(0, 5)
    overridesMap.set(hora, d)
  })

  const horariosFinales = new Set()

  // ⭐ CLAVE: Solo agrega plantilla SI NO tiene override
  plantilla.forEach(p => {
    const hora = p.hora.substring(0, 5)
    if (!overridesMap.has(hora)) {  // ← ESTE ES EL FILTRO IMPORTANTE
      horariosFinales.add(hora)
    }
  })

  // ⭐ Agrega overrides activos
  disponibilidad.forEach(d => {
    if (d.activo) {
      const hora = d.hora.substring(0, 5)
      horariosFinales.add(hora)
    }
  })

  const resultado = Array.from(horariosFinales).sort()
  setHorarios(resultado)
}

 const getEstadoHorario = (hora) => {
  // 1. Verificar si tiene turno reservado
  const turno = turnosReservados.find(t => t.hora_inicio.substring(0, 5) === hora)
  if (turno) {
    return {
      tipo: 'reservado',
      label: `Reservado - ${turno.cliente_nombre}`,
      protegido: true,
      activo: true
    }
  }

  // 2. Verificar si tiene override (modificación específica)
  const override = disponibilidadPersonalizada.find(d => d.hora.substring(0, 5) === hora)
  if (override) {
    return {
      tipo: override.activo ? 'disponible' : 'desactivado',
      label: override.activo ? 'Disponible (Personalizado)' : 'Desactivado',
      protegido: false,
      activo: override.activo,
      personalizadoId: override.id,
      esPersonalizado: true
    }
  }

  // 3. Es de plantilla sin modificaciones
  return {
    tipo: 'disponible',
    label: 'Disponible (Plantilla)',
    protegido: false,
    activo: true,
    esPersonalizado: false
  }
}

  const handleToggle = async (hora) => {
    const estado = getEstadoHorario(hora)
    
    if (estado.protegido) {
      alert('⚠️ No se puede desactivar un horario con turno reservado')
      return
    }

    const nuevoEstado = !estado.activo

    // 1️⃣ Actualizar UI inmediatamente
    setDisponibilidadPersonalizada(prev => {
      const index = prev.findIndex(d => d.hora.substring(0, 5) === hora)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = { ...updated[index], activo: nuevoEstado }
        return updated
      } else {
        return [...prev, {
          id: 'temp-' + Date.now(),
          profesional_id: profesionalId,
          fecha,
          hora: hora + ':00',
          activo: nuevoEstado,
          es_personalizado: false,
          es_plantilla: false
        }]
      }
    })

    // No quitar de la lista, solo cambiar el estado visual (se verá en gris)
    
    // 2️⃣ Guardar en BD
    const { data } = await toggleDisponibilidadHorario(profesionalId, fecha, hora, nuevoEstado)
    
    // 3️⃣ Actualizar con datos reales
    if (data) {
      setDisponibilidadPersonalizada(prev => {
        const filtered = prev.filter(d => !d.id.toString().startsWith('temp'))
        const index = filtered.findIndex(d => d.hora.substring(0, 5) === hora)
        if (index >= 0) {
          filtered[index] = data
          return filtered
        } else {
          return [...filtered, data]
        }
      })
    }
    
    onActualizado()
  }

const handleEditar = async (hora) => {
  const estado = getEstadoHorario(hora)
  
  if (estado.protegido) {
    alert('⚠️ No se puede editar un horario con turno reservado')
    return
  }

  // ⭐ Si tiene personalizadoId, es un override existente → ACTUALIZAR
  // ⭐ Si NO tiene personalizadoId, es de plantilla → CREAR OVERRIDE
  
  if (estado.personalizadoId) {
    // Ya existe un override/personalizado → Solo actualizar la hora
    setHorarioAEditar({ 
      hora,
      id: estado.personalizadoId,
      esPlantilla: false // ← NO es plantilla, es personalizado
    })
    setModalEditarAbierto(true)
  } else {
    // Es de plantilla pura (sin override) → Crear override
    setHorarioAEditar({ 
      hora,
      id: null,
      esPlantilla: true // ← Es plantilla
    })
    setModalEditarAbierto(true)
  }
}

  const handleEliminar = async (hora) => {
    const estado = getEstadoHorario(hora)
    
    if (estado.protegido) {
      alert('⚠️ No se puede eliminar un horario con turno reservado')
      return
    }

    if (!window.confirm(`¿Eliminar el horario ${hora}?`)) return

    // Si es de plantilla, crear registro desactivado
    if (!estado.personalizadoId) {
      const tempId = 'temp-' + Date.now()
      setDisponibilidadPersonalizada(prev => [...prev, {
        id: tempId,
        profesional_id: profesionalId,
        fecha,
        hora: hora + ':00',
        activo: false,
        es_personalizado: false,
        es_plantilla: false
      }])
      // No quitar de la lista, se verá en gris

      const { data } = await toggleDisponibilidadHorario(profesionalId, fecha, hora, false)
      if (data) {
        setDisponibilidadPersonalizada(prev => 
          prev.map(d => d.id === tempId ? data : d)
        )
      }
    } else {
      // Personalizado: eliminar de BD
      setHorarios(prev => prev.filter(h => h !== hora))
      setDisponibilidadPersonalizada(prev => prev.filter(d => d.id !== estado.personalizadoId))

      await eliminarHorarioPersonalizado(estado.personalizadoId)
    }
    
    onActualizado()
  }

  const handleRestaurar = async () => {
    if (!window.confirm('¿Restaurar todos los horarios a la configuración de la plantilla semanal?\n\nEsto eliminará todos los cambios personalizados.')) return

    await restaurarHorariosDefault(profesionalId, fecha)
    await cargarDatos()
    onActualizado()
  }

  const handleModalCerrado = async () => {
    await cargarDatos()
    onActualizado()
    setModalEditarAbierto(false)
    setModalAgregarAbierto(false)
    setModalCopiarAbierto(false)
    setHorarioAEditar(null)
  }

  const tieneCambiosPersonalizados = disponibilidadPersonalizada.length > 0

  return (
    <>
      <div className="panel-dia-overlay" onClick={onCerrar}></div>
      
      <div className="panel-dia-container">
        <div className="panel-dia-header">
          <div>
            <h2>{format(new Date(fecha + 'T00:00:00'), 'EEEE, d \'de\' MMMM', { locale: es })}</h2>
            <p style={{ color: profesional?.color }}>{profesional?.nombre}</p>
          </div>
          
          <button className="panel-dia-close" onClick={onCerrar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="panel-dia-estado">
          <div className={`panel-dia-badge ${tieneCambiosPersonalizados ? 'personalizado' : 'default'}`}>
            {tieneCambiosPersonalizados ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Horarios Personalizados</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Usando Plantilla Semanal</span>
              </>
            )}
          </div>
        </div>

        <div className="panel-dia-acciones">
          <button className="panel-dia-btn agregar" onClick={() => setModalAgregarAbierto(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Agregar Horarios</span>
          </button>

          <button className="panel-dia-btn copiar" onClick={() => setModalCopiarAbierto(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copiar a Otros Días</span>
          </button>

          {tieneCambiosPersonalizados && (
            <button className="panel-dia-btn restaurar" onClick={handleRestaurar}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Restaurar Plantilla</span>
            </button>
          )}
        </div>

        <div className="panel-dia-horarios">
          {loading ? (
            <div className="panel-dia-loading">
              <div className="panel-dia-spinner"></div>
            </div>
          ) : horarios.length === 0 ? (
            <div className="panel-dia-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No hay horarios configurados</p>
              <small>Configura la plantilla semanal o agrega horarios personalizados</small>
            </div>
          ) : (
            horarios.map(hora => {
              const estado = getEstadoHorario(hora)

              return (
                <div key={hora} className={`panel-dia-horario-item ${estado.tipo}`}>
                  <div className="panel-dia-horario-check">
                    {estado.protegido ? (
                      <div className="panel-dia-lock">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    ) : (
                      <button
                        className={`panel-dia-checkbox ${estado.activo ? 'checked' : ''}`}
                        onClick={() => handleToggle(hora)}
                      >
                        {estado.activo && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="panel-dia-horario-info">
                    <span className="panel-dia-horario-hora">{hora}</span>
                    <span className={`panel-dia-horario-estado ${estado.tipo}`}>
                      {estado.label}
                    </span>
                  </div>

                  {!estado.protegido && (
                    <div className="panel-dia-horario-acciones">
                      <button
                        className="panel-dia-icon-btn editar"
                        onClick={() => handleEditar(hora)}
                        title="Editar hora"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        className="panel-dia-icon-btn eliminar"
                        onClick={() => handleEliminar(hora)}
                        title="Eliminar horario"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {modalEditarAbierto && horarioAEditar && (
  <ModalEditarHorario
    profesionalId={profesionalId}
    fecha={fecha}
    horarioActual={horarioAEditar.hora}
    horarioId={horarioAEditar.id}
    esPlantilla={horarioAEditar.esPlantilla || false}  // ✅ CORRECTO
    onCerrar={() => setModalEditarAbierto(false)}
    onGuardado={handleModalCerrado}
  />
)}

      {modalAgregarAbierto && (
        <ModalAgregarMultiples
          profesionalId={profesionalId}
          fecha={fecha}
          horariosExistentes={horarios}
          onCerrar={() => setModalAgregarAbierto(false)}
          onGuardado={handleModalCerrado}
        />
      )}

      {modalCopiarAbierto && (
        <ModalCopiarDias
          profesionalId={profesionalId}
          fechaOrigen={fecha}
          disponibilidadOrigen={disponibilidadPersonalizada}
          onCerrar={() => setModalCopiarAbierto(false)}
          onCopiado={handleModalCerrado}
        />
      )}
    </>
  )
}

export default PanelDiaDisponibilidad