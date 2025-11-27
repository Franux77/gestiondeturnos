import { useState, useEffect } from 'react'
import { obtenerProfesionales, obtenerDisponibilidadDia, obtenerPlantilla } from '../../services/adminService'
import { obtenerTurnosPorFecha } from '../../services/turnosService'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import PanelDiaDisponibilidad from './PanelDiaDisponibilidad'
import '../../styles/admin/CalendarioDisponibilidad.css'

function CalendarioDisponibilidad() {
  const [profesionales, setProfesionales] = useState([])
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null)
  const [mesActual, setMesActual] = useState(new Date())
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [diasConCambios, setDiasConCambios] = useState({})
  const [diasConTurnos, setDiasConTurnos] = useState({})
  const [diasConPlantilla, setDiasConPlantilla] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingMes, setLoadingMes] = useState(false) // ⭐ NUEVO
  const [panelAbierto, setPanelAbierto] = useState(false)

  useEffect(() => {
    cargarProfesionales()
  }, [])

  useEffect(() => {
    if (profesionalSeleccionado) {
      cargarDatosDelMes()
    }
  }, [profesionalSeleccionado, mesActual])

  const cargarProfesionales = async () => {
    const { data } = await obtenerProfesionales()
    if (data && data.length > 0) {
      setProfesionales(data)
      setProfesionalSeleccionado(data[0].id)
    }
    setLoading(false)
  }

  const cargarDatosDelMes = async () => {
    setLoadingMes(true) // ⭐ Activar spinner
    
    const inicio = startOfMonth(mesActual)
    const fin = endOfMonth(mesActual)
    const dias = eachDayOfInterval({ start: inicio, end: fin })

    const cambios = {}
    const turnos = {}
    const plantillas = {}

    // Verificar cada día del mes
    await Promise.all(
      dias.map(async (dia) => {
        const fechaStr = format(dia, 'yyyy-MM-dd')
        const diaSemana = dia.getDay()
        
        // Verificar si el día de la semana tiene plantilla configurada
        const { data: plantilla } = await obtenerPlantilla(profesionalSeleccionado, diaSemana)
        if (plantilla && plantilla.length > 0) {
          plantillas[fechaStr] = true
        }

        // Verificar si tiene disponibilidad personalizada
        const { data: disp } = await obtenerDisponibilidadDia(profesionalSeleccionado, fechaStr)
        if (disp && disp.length > 0) {
          cambios[fechaStr] = disp.length
        }

        // Verificar si tiene turnos reservados
        const { data: turnosData } = await obtenerTurnosPorFecha(fechaStr, profesionalSeleccionado)
        if (turnosData && turnosData.length > 0) {
          turnos[fechaStr] = turnosData.length
        }
      })
    )

    setDiasConCambios(cambios)
    setDiasConTurnos(turnos)
    setDiasConPlantilla(plantillas)
    setLoadingMes(false) // ⭐ Desactivar spinner
  }

  const generarDiasCalendario = () => {
    const inicioMes = startOfMonth(mesActual)
    const finMes = endOfMonth(mesActual)
    const inicioCalendario = startOfWeek(inicioMes, { weekStartsOn: 1 })
    const finCalendario = endOfWeek(finMes, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: inicioCalendario, end: finCalendario })
  }

  const handleClickDia = (dia) => {
    const fechaStr = format(dia, 'yyyy-MM-dd')
    const hoy = format(new Date(), 'yyyy-MM-dd')
    
    if (fechaStr < hoy) {
      alert('⚠️ No puedes gestionar días pasados')
      return
    }

    if (!diasConPlantilla[fechaStr]) {
      alert('⚠️ Este día no tiene horarios configurados en la plantilla semanal')
      return
    }

    setDiaSeleccionado(dia)
    setPanelAbierto(true)
  }

  const handleCerrarPanel = () => {
    setPanelAbierto(false)
    setDiaSeleccionado(null)
  }

  const handleActualizacionExitosa = () => {
    cargarDatosDelMes()
  }

  const mesAnterior = () => setMesActual(subMonths(mesActual, 1))
  const mesSiguiente = () => setMesActual(addMonths(mesActual, 1))

  const dias = generarDiasCalendario()
  const profesionalActual = profesionales.find(p => p.id === profesionalSeleccionado)
  const hoy = format(new Date(), 'yyyy-MM-dd')

  if (loading) {
    return (
      <div className="cal-disp-container">
        <div className="cal-disp-loading">
          <div className="cal-disp-spinner-grande"></div>
          <p>Cargando calendario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cal-disp-container">
      {/* Header */}
      <div className="cal-disp-header">
        <div className="cal-disp-header-info">
          <div className="cal-disp-icono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1>Calendario de Disponibilidad</h1>
            <p>Gestiona horarios día por día con total flexibilidad</p>
          </div>
        </div>

        <div className="cal-disp-selector">
          <label>Profesional:</label>
          <select
            value={profesionalSeleccionado || ''}
            onChange={(e) => setProfesionalSeleccionado(e.target.value)}
            className="cal-disp-select"
          >
            {profesionales.map(prof => (
              <option key={prof.id} value={prof.id}>
                {prof.nombre} - {prof.especialidad}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leyenda */}
      <div className="cal-disp-leyenda">
        <div className="cal-disp-leyenda-item">
          <div className="cal-disp-dot default"></div>
          <span>Horarios normales</span>
        </div>
        <div className="cal-disp-leyenda-item">
          <div className="cal-disp-dot personalizado"></div>
          <span>Horarios personalizados</span>
        </div>
        <div className="cal-disp-leyenda-item">
          <div className="cal-disp-dot con-turnos"></div>
          <span>Con turnos reservados</span>
        </div>
        <div className="cal-disp-leyenda-item">
          <div className="cal-disp-dot pasado"></div>
          <span>Día pasado</span>
        </div>
        <div className="cal-disp-leyenda-item">
          <div className="cal-disp-dot sin-plantilla"></div>
          <span>Sin horarios configurados</span>
        </div>
      </div>

      {/* Calendario */}
      <div className="cal-disp-calendario">
        {/* Header del calendario */}
        <div className="cal-disp-calendario-header">
          <button className="cal-disp-nav-btn" onClick={mesAnterior} disabled={loadingMes}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className="cal-disp-mes-titulo">
            {format(mesActual, 'MMMM yyyy', { locale: es })}
          </h2>

          <button className="cal-disp-nav-btn" onClick={mesSiguiente} disabled={loadingMes}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Días de la semana */}
        <div className="cal-disp-dias-semana">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
            <div key={dia} className="cal-disp-dia-semana-label">{dia}</div>
          ))}
        </div>

        {/* Grid de días con overlay de loading */}
        <div className="cal-disp-dias-grid-wrapper">
          {/* ⭐ Overlay de loading */}
          {loadingMes && (
            <div className="cal-disp-dias-loading-overlay">
              <div className="cal-disp-spinner-mes"></div>
              <p>Cargando disponibilidad...</p>
            </div>
          )}

          {/* Grid de días */}
          <div className={`cal-disp-dias-grid ${loadingMes ? 'loading' : ''}`}>
            {dias.map((dia, index) => {
              const fechaStr = format(dia, 'yyyy-MM-dd')
              const esDelMes = format(dia, 'MM') === format(mesActual, 'MM')
              const esHoy = fechaStr === hoy
              const esPasado = fechaStr < hoy
              const tieneCambios = diasConCambios[fechaStr]
              const tieneTurnos = diasConTurnos[fechaStr]
              const tienePlantilla = diasConPlantilla[fechaStr]
              const estaSeleccionado = diaSeleccionado && isSameDay(dia, diaSeleccionado)

              return (
                <button
                  key={index}
                  className={`cal-disp-dia ${!esDelMes ? 'otro-mes' : ''} ${esHoy ? 'hoy' : ''} ${esPasado ? 'pasado' : ''} ${!tienePlantilla && !esPasado ? 'sin-plantilla' : ''} ${tieneCambios ? 'con-cambios' : ''} ${tieneTurnos ? 'con-turnos' : ''} ${estaSeleccionado ? 'seleccionado' : ''}`}
                  onClick={() => handleClickDia(dia)}
                  disabled={esPasado || !tienePlantilla || loadingMes}
                >
                  <span className="cal-disp-dia-numero">{format(dia, 'd')}</span>
                  
                  {esHoy && <span className="cal-disp-badge-hoy">Hoy</span>}
                  
                  {tieneTurnos && (
                    <span className="cal-disp-badge-turnos">
                      {tieneTurnos} turno{tieneTurnos > 1 ? 's' : ''}
                    </span>
                  )}

                  {tieneCambios && (
                    <div className="cal-disp-indicador-personalizado">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="4" />
                      </svg>
                    </div>
                  )}

                  {!tienePlantilla && !esPasado && esDelMes && (
                    <div className="cal-disp-sin-horarios">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Panel lateral */}
      {panelAbierto && diaSeleccionado && (
        <PanelDiaDisponibilidad
          profesionalId={profesionalSeleccionado}
          fecha={format(diaSeleccionado, 'yyyy-MM-dd')}
          profesional={profesionalActual}
          onCerrar={handleCerrarPanel}
          onActualizado={handleActualizacionExitosa}
        />
      )}
    </div>
  )
}

export default CalendarioDisponibilidad