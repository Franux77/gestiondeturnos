import { useState } from 'react'
import { agregarHorarioPersonalizado } from '../../services/adminService'
import '../../styles/admin/GestionDisponibilidad.css'

function ModalHorarioPersonalizado({ profesionalId, fecha, horariosExistentes, onCerrar, onAgregado }) {
  const [hora, setHora] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!hora) {
      setError('Selecciona una hora')
      return
    }

    // Validar que no exista ya
    if (horariosExistentes.includes(hora)) {
      setError('Este horario ya existe en la configuración')
      return
    }

    setGuardando(true)

    const { data, error: apiError } = await agregarHorarioPersonalizado(profesionalId, fecha, hora)

    setGuardando(false)

    if (apiError) {
      setError('Error al agregar el horario')
    } else if (data) {
      onAgregado()
    }
  }

  const handleClickFondo = (e) => {
    if (e.target.className === 'disp-modal-overlay') {
      onCerrar()
    }
  }

  return (
    <div className="disp-modal-overlay" onClick={handleClickFondo}>
      <div className="disp-modal">
        <div className="disp-modal-header">
          <div className="disp-modal-title-group">
            <div className="disp-modal-icono">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2>Agregar Horario Personalizado</h2>
              <p>Define un horario adicional para este día específico</p>
            </div>
          </div>

          <button className="disp-modal-close" onClick={onCerrar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="disp-modal-form">
          <div className="disp-modal-field">
            <label htmlFor="hora">
              Hora del turno
              <span className="disp-required">*</span>
            </label>
            <input
              type="time"
              id="hora"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className={error ? 'disp-error' : ''}
            />
            {error && <span className="disp-error-msg">{error}</span>}
          </div>

          <div className="disp-modal-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Este horario se agregará solo para esta fecha y estará disponible para reservas.</span>
          </div>

          <div className="disp-modal-actions">
            <button type="button" className="disp-modal-btn-cancel" onClick={onCerrar} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="disp-modal-btn-save" disabled={guardando}>
              {guardando ? (
                <>
                  <div className="disp-spinner-small"></div>
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Agregar Horario</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalHorarioPersonalizado