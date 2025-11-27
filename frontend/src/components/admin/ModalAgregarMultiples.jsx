import { useState, useEffect } from 'react'
import { agregarHorarioPersonalizado } from '../../services/adminService'
import '../../styles/admin/CalendarioDisponibilidad.css'

function ModalAgregarMultiples({ profesionalId, fecha, horariosExistentes, onCerrar, onGuardado }) {
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFin, setHoraFin] = useState('')
  const [intervalo, setIntervalo] = useState(30)
  const [horariosGenerados, setHorariosGenerados] = useState([])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (horaInicio && horaFin && intervalo) {
      generarHorarios()
    } else {
      setHorariosGenerados([])
    }
  }, [horaInicio, horaFin, intervalo])

  const generarHorarios = () => {
    setError('')

    if (horaInicio >= horaFin) {
      setError('La hora de fin debe ser posterior a la de inicio')
      setHorariosGenerados([])
      return
    }

    const horarios = []
    let [horaActual, minutoActual] = horaInicio.split(':').map(Number)
    const [horaFinNum, minutoFin] = horaFin.split(':').map(Number)

    while (horaActual < horaFinNum || (horaActual === horaFinNum && minutoActual < minutoFin)) {
      const horario = `${horaActual.toString().padStart(2, '0')}:${minutoActual.toString().padStart(2, '0')}`
      
      // Solo agregar si no existe
      if (!horariosExistentes.includes(horario)) {
        horarios.push(horario)
      }

      minutoActual += intervalo
      if (minutoActual >= 60) {
        horaActual += Math.floor(minutoActual / 60)
        minutoActual = minutoActual % 60
      }
    }

    setHorariosGenerados(horarios)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (horariosGenerados.length === 0) {
      setError('No hay horarios para agregar')
      return
    }

    setGuardando(true)

    // Agregar todos los horarios
    const promesas = horariosGenerados.map(hora =>
      agregarHorarioPersonalizado(profesionalId, fecha, hora)
    )

    const resultados = await Promise.all(promesas)
    const errores = resultados.filter(r => r.error)

    setGuardando(false)

    if (errores.length > 0) {
      setError(`Se agregaron ${horariosGenerados.length - errores.length} de ${horariosGenerados.length} horarios`)
      setTimeout(() => onGuardado(), 2000)
    } else {
      onGuardado()
    }
  }

  const handleClickFondo = (e) => {
    if (e.target.className === 'modal-agregar-mult-overlay') {
      onCerrar()
    }
  }

  return (
    <div className="modal-agregar-mult-overlay" onClick={handleClickFondo}>
      <div className="modal-agregar-mult">
        <div className="modal-agregar-mult-header">
          <div>
            <h3>Agregar Horarios Múltiples</h3>
            <p>Genera varios horarios en un rango específico</p>
          </div>
          <button className="modal-agregar-mult-close" onClick={onCerrar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-agregar-mult-form">
          <div className="modal-agregar-mult-row">
            <div className="modal-agregar-mult-field">
              <label htmlFor="hora_inicio">Desde:</label>
              <input
                type="time"
                id="hora_inicio"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>

            <div className="modal-agregar-mult-field">
              <label htmlFor="hora_fin">Hasta:</label>
              <input
                type="time"
                id="hora_fin"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-agregar-mult-field">
            <label htmlFor="intervalo">Cada (minutos):</label>
            <select
              id="intervalo"
              value={intervalo}
              onChange={(e) => setIntervalo(Number(e.target.value))}
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          </div>

          {error && <div className="modal-agregar-mult-error">{error}</div>}

          {horariosGenerados.length > 0 && (
            <div className="modal-agregar-mult-preview">
              <h4>Vista previa ({horariosGenerados.length} horarios):</h4>
              <div className="modal-agregar-mult-lista">
                {horariosGenerados.map(hora => (
                  <div key={hora} className="modal-agregar-mult-hora-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{hora}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-agregar-mult-actions">
            <button type="button" className="modal-agregar-mult-btn-cancel" onClick={onCerrar} disabled={guardando}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="modal-agregar-mult-btn-save" 
              disabled={guardando || horariosGenerados.length === 0}
            >
              {guardando ? (
                <>
                  <div className="modal-agregar-mult-spinner"></div>
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Agregar {horariosGenerados.length} Horarios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalAgregarMultiples