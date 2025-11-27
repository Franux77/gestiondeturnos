import { useState, useEffect } from 'react'
import { toggleDisponibilidadHorario, obtenerPlantilla } from '../../services/adminService'
import { obtenerTurnosPorFecha } from '../../services/turnosService'
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import '../../styles/admin/CalendarioDisponibilidad.css'

function ModalCopiarDias({ profesionalId, fechaOrigen, disponibilidadOrigen, onCerrar, onCopiado }) {
  const [diasSeleccionados, setDiasSeleccionados] = useState([])
  const [diasDisponibles, setDiasDisponibles] = useState([])
  const [tipoRango, setTipoRango] = useState('semana')
  const [guardando, setGuardando] = useState(false)
  const [progreso, setProgreso] = useState(0)

  useEffect(() => {
    cargarDiasDisponibles()
  }, [tipoRango])

  const cargarDiasDisponibles = async () => {
    const hoy = new Date()
    const fechaOrigenDate = new Date(fechaOrigen + 'T00:00:00')
    let dias = []

    if (tipoRango === 'semana') {
      const inicio = startOfWeek(fechaOrigenDate, { weekStartsOn: 1 })
      const fin = endOfWeek(fechaOrigenDate, { weekStartsOn: 1 })
      dias = eachDayOfInterval({ start: inicio, end: fin })
    } else if (tipoRango === 'mes') {
      const inicio = startOfMonth(fechaOrigenDate)
      const fin = endOfMonth(fechaOrigenDate)
      dias = eachDayOfInterval({ start: inicio, end: fin })
    } else {
      // Próximos 30 días
      for (let i = 1; i <= 30; i++) {
        dias.push(addDays(hoy, i))
      }
    }

    // Filtrar: no incluir días pasados ni el día origen, y solo días con plantilla
    const diasFiltrados = []
    for (const dia of dias) {
      const fechaStr = format(dia, 'yyyy-MM-dd')
      
      // Saltar si es pasado o es el día origen
      if (fechaStr <= format(hoy, 'yyyy-MM-dd') || fechaStr === fechaOrigen) {
        continue
      }

      // ✅ Verificar si el día tiene plantilla configurada
      const diaSemana = dia.getDay()
      const { data: plantilla } = await obtenerPlantilla(profesionalId, diaSemana)
      
      // Solo incluir si tiene plantilla
      if (plantilla && plantilla.length > 0) {
        // Verificar si tiene turnos
        const { data: turnos } = await obtenerTurnosPorFecha(fechaStr, profesionalId)
        diasFiltrados.push({
          fecha: fechaStr,
          dia,
          tieneTurnos: turnos && turnos.length > 0,
          cantidadTurnos: turnos?.length || 0
        })
      }
    }

    setDiasDisponibles(diasFiltrados)
  }

  const handleToggleDia = (fechaStr) => {
    setDiasSeleccionados(prev =>
      prev.includes(fechaStr)
        ? prev.filter(f => f !== fechaStr)
        : [...prev, fechaStr]
    )
  }

  const handleSeleccionarTodos = () => {
    const todosSinTurnos = diasDisponibles
      .filter(d => !d.tieneTurnos)
      .map(d => d.fecha)
    setDiasSeleccionados(todosSinTurnos)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (diasSeleccionados.length === 0) {
      alert('Selecciona al menos un día')
      return
    }

    if (!window.confirm(`¿Copiar la configuración de horarios a ${diasSeleccionados.length} días?`)) {
      return
    }

    setGuardando(true)
    setProgreso(0)

    const total = diasSeleccionados.length * disponibilidadOrigen.length
    let completados = 0

    // Copiar disponibilidad a cada día seleccionado
    for (const fechaDestino of diasSeleccionados) {
      for (const disp of disponibilidadOrigen) {
        const hora = disp.hora.substring(0, 5)
        await toggleDisponibilidadHorario(profesionalId, fechaDestino, hora, disp.activo)
        
        completados++
        setProgreso(Math.round((completados / total) * 100))
      }
    }

    setGuardando(false)
    onCopiado()
  }

  const handleClickFondo = (e) => {
    if (e.target.className === 'modal-copiar-overlay') {
      onCerrar()
    }
  }

  return (
    <div className="modal-copiar-overlay" onClick={handleClickFondo}>
      <div className="modal-copiar">
        <div className="modal-copiar-header">
          <div>
            <h3>Copiar Horarios a Otros Días</h3>
            <p>Aplica la configuración del {format(new Date(fechaOrigen + 'T00:00:00'), 'd/MM/yyyy')} a otros días</p>
          </div>
          <button className="modal-copiar-close" onClick={onCerrar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-copiar-form">
          {/* Tipo de rango */}
          <div className="modal-copiar-tipo">
            <button
              type="button"
              className={`modal-copiar-tipo-btn ${tipoRango === 'semana' ? 'active' : ''}`}
              onClick={() => setTipoRango('semana')}
            >
              Esta Semana
            </button>
            <button
              type="button"
              className={`modal-copiar-tipo-btn ${tipoRango === 'mes' ? 'active' : ''}`}
              onClick={() => setTipoRango('mes')}
            >
              Este Mes
            </button>
            <button
              type="button"
              className={`modal-copiar-tipo-btn ${tipoRango === 'personalizado' ? 'active' : ''}`}
              onClick={() => setTipoRango('personalizado')}
            >
              Próximos 30 Días
            </button>
          </div>

          {/* Lista de días */}
          <div className="modal-copiar-dias">
            <div className="modal-copiar-dias-header">
              <span>Días disponibles ({diasDisponibles.length})</span>
              <button
                type="button"
                className="modal-copiar-seleccionar-todos"
                onClick={handleSeleccionarTodos}
              >
                Seleccionar todos sin turnos
              </button>
            </div>

            <div className="modal-copiar-dias-lista">
              {diasDisponibles.length === 0 ? (
                <div className="modal-copiar-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No hay días hábiles disponibles en este rango</p>
                  <small>Los días sin plantilla configurada no se muestran</small>
                </div>
              ) : (
                diasDisponibles.map(({ fecha, dia, tieneTurnos, cantidadTurnos }) => (
                  <label
                    key={fecha}
                    className={`modal-copiar-dia-item ${diasSeleccionados.includes(fecha) ? 'selected' : ''} ${tieneTurnos ? 'con-turnos' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={diasSeleccionados.includes(fecha)}
                      onChange={() => handleToggleDia(fecha)}
                      disabled={tieneTurnos}
                    />
                    <div className="modal-copiar-dia-info">
                      <span className="modal-copiar-dia-fecha">
                        {format(dia, 'EEEE, d \'de\' MMMM', { locale: es })}
                      </span>
                      {tieneTurnos && (
                        <span className="modal-copiar-dia-warning">
                          ⚠️ Tiene {cantidadTurnos} turno{cantidadTurnos > 1 ? 's' : ''} reservado{cantidadTurnos > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="modal-copiar-dia-check">
                      {diasSeleccionados.includes(fecha) && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Info */}
          <div className="modal-copiar-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong>Nota:</strong> Se copiarán {disponibilidadOrigen.length} modificaciones. 
              Solo se muestran días con plantilla configurada. 
              Los días con turnos reservados están deshabilitados para evitar conflictos.
            </div>
          </div>
          
          {diasDisponibles.length === 0 && (
            <div className="modal-copiar-info" style={{background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <strong>Sin días disponibles:</strong> No hay días hábiles en este rango. 
                Configura horarios en "Horarios Semanales" para habilitar días.
              </div>
            </div>
          )}

          {/* Progreso */}
          {guardando && (
            <div className="modal-copiar-progreso">
              <div className="modal-copiar-progreso-bar">
                <div 
                  className="modal-copiar-progreso-fill"
                  style={{ width: `${progreso}%` }}
                ></div>
              </div>
              <span>{progreso}% completado</span>
            </div>
          )}

          {/* Acciones */}
          <div className="modal-copiar-actions">
            <button 
              type="button" 
              className="modal-copiar-btn-cancel" 
              onClick={onCerrar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="modal-copiar-btn-save"
              disabled={guardando || diasSeleccionados.length === 0}
            >
              {guardando ? (
                <>
                  <div className="modal-copiar-spinner"></div>
                  <span>Copiando...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copiar a {diasSeleccionados.length} Días</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalCopiarDias