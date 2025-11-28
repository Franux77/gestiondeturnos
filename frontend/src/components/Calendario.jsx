// ============================================
// 1. CALENDARIO.JSX - ACTUALIZADO
// ============================================
import { useState, useEffect } from 'react'
import { obtenerConfiguracion, tieneTurnosDisponibles } from '../services/turnosService'
import { obtenerFechaHoyArgentina } from '../utils/helpers'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, startOfDay, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import '../styles/Calendario.css'

function Calendario({ profesionalSeleccionado, onSeleccionarFecha, fechaSeleccionada }) {
  const [mesActual, setMesActual] = useState(new Date())
  const [diasHabiles, setDiasHabiles] = useState([1, 2, 3, 4, 5, 6])
  const [diasConTurnos, setDiasConTurnos] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingMes, setLoadingMes] = useState(false)

  useEffect(() => {
    cargarConfiguracion()
  }, [])

  useEffect(() => {
    if (profesionalSeleccionado) {
      verificarDisponibilidadMes()
    }
  }, [profesionalSeleccionado, mesActual])

  const cargarConfiguracion = async () => {
    try {
      const { data } = await obtenerConfiguracion()
      
      if (data && data.dias_habiles) {
        const dias = parsearDiasHabiles(data.dias_habiles)
        setDiasHabiles(dias)
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error)
    } finally {
      setLoading(false)
    }
  }

  const verificarDisponibilidadMes = async () => {
    if (!profesionalSeleccionado) return

    setLoadingMes(true)

    const inicio = startOfMonth(mesActual)
    const fin = endOfMonth(mesActual)
    const diasDelMes = eachDayOfInterval({ start: inicio, end: fin })
    
    const disponibilidad = {}
    
    await Promise.all(
      diasDelMes.map(async (fecha) => {
        const fechaStr = format(fecha, 'yyyy-MM-dd')
        const tieneDisponible = await tieneTurnosDisponibles(profesionalSeleccionado.id, fechaStr)
        disponibilidad[fechaStr] = tieneDisponible
      })
    )
    
    setDiasConTurnos(disponibilidad)
    setLoadingMes(false)
  }

  const parsearDiasHabiles = (diasConfig) => {
    if (/^[\d,\s]+$/.test(diasConfig)) {
      return diasConfig.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d))
    }
    
    const mapaDias = {
      'domingo': 0,
      'lunes': 1,
      'martes': 2,
      'miercoles': 3,
      'miércoles': 3,
      'jueves': 4,
      'viernes': 5,
      'sabado': 6,
      'sábado': 6
    }
    
    const nombres = diasConfig.toLowerCase().split(',').map(d => d.trim())
    return nombres.map(nombre => mapaDias[nombre]).filter(d => d !== undefined)
  }

  const generarDiasDelMes = () => {
    const inicio = startOfMonth(mesActual)
    const fin = endOfMonth(mesActual)
    const dias = eachDayOfInterval({ start: inicio, end: fin })
    
    const primerDiaSemana = inicio.getDay()
    const diasVacios = Array(primerDiaSemana).fill(null)
    
    return [...diasVacios, ...dias]
  }

  const esDiaDisponible = (fecha) => {
    if (!fecha) return false
    
    const hoyStr = obtenerFechaHoyArgentina()
    const hoy = new Date(hoyStr + 'T00:00:00')
    
    if (isBefore(fecha, hoy)) return false
    
    const diaSemana = fecha.getDay()
    if (!diasHabiles.includes(diaSemana)) return false
    
    const fechaStr = format(fecha, 'yyyy-MM-dd')
    
    // ⭐ NUEVO: Solo disponible si tiene turnos Y no están todos pasados/reservados
    return diasConTurnos[fechaStr] === true
  }

  const handleSeleccionarDia = (fecha) => {
    if (!esDiaDisponible(fecha)) return
    
    const fechaFormateada = format(fecha, 'yyyy-MM-dd')
    onSeleccionarFecha(fechaFormateada)
    
    setTimeout(() => {
      const horarios = document.getElementById('horarios')
      if (horarios) {
        horarios.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const mesAnterior = () => {
    setMesActual(subMonths(mesActual, 1))
  }

  const mesSiguiente = () => {
    setMesActual(addMonths(mesActual, 1))
  }

  const dias = generarDiasDelMes()
  const nombreMes = format(mesActual, 'MMMM yyyy', { locale: es })

  if (!profesionalSeleccionado) {
    return (
      <section id="calendario" className="calendario-section">
        <div className="container">
          <div className="mensaje-seleccionar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>Primero seleccioná un profesional para ver fechas disponibles</p>
          </div>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section id="calendario" className="calendario-section">
        <div className="container">
          <h2 className="section-title">Cargando calendario...</h2>
          <div className="loading-spinner"></div>
        </div>
      </section>
    )
  }

  return (
    <section id="calendario" className="calendario-section">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">Paso 2</div>
          <h2 className="section-title">
            Elegí la <span className="highlight">fecha</span>
          </h2>
          <p className="section-subtitle">
            Seleccioná el día que mejor te quede para tu turno con{' '}
            <strong>{profesionalSeleccionado.nombre}</strong>
          </p>
        </div>

        <div className="calendario-wrapper">
          <div className="calendario-header">
            <button 
              className="mes-nav-btn"
              onClick={mesAnterior}
              disabled={loadingMes}
              aria-label="Mes anterior"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <h3 className="mes-actual">{nombreMes}</h3>

            <button 
              className="mes-nav-btn"
              onClick={mesSiguiente}
              disabled={loadingMes}
              aria-label="Mes siguiente"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="dias-semana">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
              <div key={dia} className="dia-semana-label">
                {dia}
              </div>
            ))}
          </div>

          <div className="dias-grid-wrapper">
            {loadingMes && (
              <div className="dias-loading-overlay">
                <div className="spinner-mes"></div>
                <p>Cargando disponibilidad...</p>
              </div>
            )}

            <div className={`dias-grid ${loadingMes ? 'loading' : ''}`}>
              {dias.map((fecha, index) => {
                if (!fecha) {
                  return <div key={`empty-${index}`} className="dia-vacio" />
                }

                const disponible = esDiaDisponible(fecha)
                const fechaStr = format(fecha, 'yyyy-MM-dd')
                const hoyStr = obtenerFechaHoyArgentina()
                const seleccionado = fechaSeleccionada && fechaStr === fechaSeleccionada
                const esHoy = fechaStr === hoyStr

                return (
                  <button
                    key={fecha.toISOString()}
                    className={`dia-btn ${disponible ? 'disponible' : 'deshabilitado'} ${seleccionado ? 'seleccionado' : ''} ${esHoy ? 'hoy' : ''}`}
                    onClick={() => handleSeleccionarDia(fecha)}
                    disabled={!disponible || loadingMes}
                  >
                    <span className="dia-numero">{format(fecha, 'd')}</span>
                    {esHoy && <span className="dia-badge">Hoy</span>}
                    {seleccionado && (
                      <div className="check-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="calendario-leyenda">
            <div className="leyenda-item">
              <div className="leyenda-color disponible"></div>
              <span>Disponible</span>
            </div>
            <div className="leyenda-item">
              <div className="leyenda-color seleccionado"></div>
              <span>Seleccionado</span>
            </div>
            <div className="leyenda-item">
              <div className="leyenda-color deshabilitado"></div>
              <span>Sin turnos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Calendario