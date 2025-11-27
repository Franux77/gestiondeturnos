import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import '../../styles/admin/CalendarioDisponibilidad.css'

function ModalEditarHorario({ profesionalId, fecha, horarioActual, horarioId, esPlantilla, onCerrar, onGuardado }) {
  const [nuevaHora, setNuevaHora] = useState(horarioActual)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')

  if (!nuevaHora) {
    setError('Ingresa una hora válida')
    return
  }

  if (nuevaHora === horarioActual) {
    setError('La nueva hora debe ser diferente')
    return
  }

  setGuardando(true)

  try {
    if (esPlantilla) {
      // ⭐ CASO PLANTILLA: Crear 2 registros
      console.log('📝 Editando horario de plantilla...')
      
      // 1️⃣ Crear override desactivado para ocultar el horario original
      const { error: errorOcultar } = await supabase
        .from('disponibilidad_horarios')
        .insert([{
          profesional_id: profesionalId,
          fecha,
          hora: horarioActual + ':00',
          activo: false,
          es_personalizado: false,
          es_plantilla: false
        }])

      if (errorOcultar) {
        console.error('Error al ocultar plantilla:', errorOcultar)
        throw errorOcultar
      }

      // 2️⃣ Crear nuevo horario personalizado
      const { data, error: errorCrear } = await supabase
        .from('disponibilidad_horarios')
        .insert([{
          profesional_id: profesionalId,
          fecha,
          hora: nuevaHora + ':00',
          activo: true,
          es_personalizado: true,
          es_plantilla: false
        }])
        .select()
        .single()

      if (errorCrear) throw errorCrear
      console.log('✅ Horario de plantilla convertido:', data)
        
    } else {
      // ⭐ CASO PERSONALIZADO: Actualizar hora
      console.log('📝 Editando horario personalizado...')
      
      if (!horarioId) {
        throw new Error('ID de horario no encontrado')
      }

      const { data, error: errorActualizar } = await supabase
        .from('disponibilidad_horarios')
        .update({ hora: nuevaHora + ':00' })
        .eq('id', horarioId)
        .select()
        .single()

      if (errorActualizar) throw errorActualizar
      console.log('✅ Horario personalizado actualizado:', data)
    }

    onGuardado()
    
  } catch (err) {
    console.error('❌ Error al guardar:', err)
    if (err.code === '23505') {
      setError('Ya existe un horario a esa hora')
    } else {
      setError(err.message || 'Error al guardar el cambio')
    }
    setGuardando(false)
  }
}

  const handleClickFondo = (e) => {
    if (e.target.className === 'modal-editar-overlay') {
      onCerrar()
    }
  }

  return (
    <div className="modal-editar-overlay" onClick={handleClickFondo}>
      <div className="modal-editar">
        <div className="modal-editar-header">
          <h3>{esPlantilla ? 'Convertir a Horario Personalizado' : 'Editar Horario'}</h3>
          <button className="modal-editar-close" onClick={onCerrar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-editar-form">
          <div className="modal-editar-field">
            <label>Hora actual:</label>
            <div className="modal-editar-hora-actual">{horarioActual}</div>
          </div>

          <div className="modal-editar-field">
            <label htmlFor="nueva_hora">Nueva hora:</label>
            <input
              type="time"
              id="nueva_hora"
              value={nuevaHora}
              onChange={(e) => setNuevaHora(e.target.value)}
              className={error ? 'error' : ''}
            />
            {error && <span className="modal-editar-error">{error}</span>}
          </div>

          {esPlantilla && (
            <div className="modal-editar-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>El horario {horarioActual} se ocultará y se creará {nuevaHora} como personalizado</span>
            </div>
          )}

          <div className="modal-editar-actions">
            <button type="button" className="modal-editar-btn-cancel" onClick={onCerrar} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="modal-editar-btn-save" disabled={guardando}>
              {guardando ? (
                <>
                  <div className="modal-editar-spinner"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Guardar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalEditarHorario