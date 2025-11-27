import { supabase } from '../supabaseClient'

// ============================================
// PLANTILLAS SEMANALES
// ============================================

/**
 * Obtener plantilla de un día de la semana específico
 * @param {number} profesionalId - ID del profesional
 * @param {number} diaSemana - Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
 */
export const obtenerPlantilla = async (profesionalId, diaSemana) => {
  try {
    const { data, error } = await supabase
      .from('disponibilidad_horarios')
      .select('*')
      .eq('profesional_id', profesionalId)
      .eq('dia_semana', diaSemana)
      .is('fecha', null)
      .eq('es_plantilla', true)
      .order('hora', { ascending: true })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error obteniendo plantilla:', error)
    return { data: null, error }
  }
}

/**
 * Obtener todas las plantillas de un profesional (todos los días)
 */
export const obtenerTodasPlantillas = async (profesionalId) => {
  try {
    const { data, error } = await supabase
      .from('disponibilidad_horarios')
      .select('*')
      .eq('profesional_id', profesionalId)
      .is('fecha', null)
      .eq('es_plantilla', true)
      .order('dia_semana', { ascending: true })
      .order('hora', { ascending: true })

    if (error) throw error
    
    // Agrupar por día de la semana
    const plantillasPorDia = {}
    data?.forEach(horario => {
      if (!plantillasPorDia[horario.dia_semana]) {
        plantillasPorDia[horario.dia_semana] = []
      }
      plantillasPorDia[horario.dia_semana].push(horario)
    })
    
    return { data: plantillasPorDia, error: null }
  } catch (error) {
    console.error('Error obteniendo todas las plantillas:', error)
    return { data: null, error }
  }
}

/**
 * Agregar horario a plantilla semanal
 */
export const agregarHorarioPlantilla = async (profesionalId, diaSemana, hora) => {
  try {
    // Verificar que no exista ya
    const { data: existente } = await supabase
      .from('disponibilidad_horarios')
      .select('id')
      .eq('profesional_id', profesionalId)
      .eq('dia_semana', diaSemana)
      .is('fecha', null)
      .eq('hora', hora + ':00')
      .maybeSingle()

    if (existente) {
      return { 
        data: null, 
        error: { message: 'Este horario ya existe en la plantilla' } 
      }
    }

    // Insertar nuevo horario
    const { data, error } = await supabase
      .from('disponibilidad_horarios')
      .insert([{
        profesional_id: profesionalId,
        dia_semana: diaSemana,
        fecha: null,
        hora: hora + ':00',
        activo: true,
        es_plantilla: true
      }])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error agregando horario a plantilla:', error)
    return { data: null, error }
  }
}

/**
 * Agregar múltiples horarios a una plantilla
 */
export const agregarMultiplesHorarios = async (profesionalId, diaSemana, horas) => {
  try {
    const registros = horas.map(hora => ({
      profesional_id: profesionalId,
      dia_semana: diaSemana,
      fecha: null,
      hora: hora.length === 5 ? hora + ':00' : hora,
      activo: true,
      es_plantilla: true
    }))

    const { data, error } = await supabase
      .from('disponibilidad_horarios')
      .insert(registros)
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error agregando múltiples horarios:', error)
    return { data: null, error }
  }
}

/**
 * Eliminar horario de plantilla
 */
export const eliminarHorarioPlantilla = async (id) => {
  try {
    const { error } = await supabase
      .from('disponibilidad_horarios')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error eliminando horario de plantilla:', error)
    return { success: false, error }
  }
}

/**
 * Eliminar todos los horarios de una plantilla (día completo)
 */
export const limpiarPlantilla = async (profesionalId, diaSemana) => {
  try {
    const { error } = await supabase
      .from('disponibilidad_horarios')
      .delete()
      .eq('profesional_id', profesionalId)
      .eq('dia_semana', diaSemana)
      .is('fecha', null)
      .eq('es_plantilla', true)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error limpiando plantilla:', error)
    return { success: false, error }
  }
}

/**
 * Copiar plantilla de un día a otro(s)
 */
export const copiarPlantilla = async (profesionalId, diaOrigen, diasDestino) => {
  try {
    // Obtener horarios del día origen
    const { data: horariosOrigen, error: errorOrigen } = await obtenerPlantilla(
      profesionalId, 
      diaOrigen
    )

    if (errorOrigen || !horariosOrigen || horariosOrigen.length === 0) {
      return { 
        success: false, 
        error: { message: 'No hay horarios en el día de origen' } 
      }
    }

    let totalCopiados = 0

    // Copiar a cada día destino
    for (const diaDestino of diasDestino) {
      // Limpiar día destino primero
      await limpiarPlantilla(profesionalId, diaDestino)

      // Copiar horarios
      const registros = horariosOrigen.map(h => ({
        profesional_id: profesionalId,
        dia_semana: diaDestino,
        fecha: null,
        hora: h.hora,
        activo: true,
        es_plantilla: true
      }))

      const { data, error } = await supabase
        .from('disponibilidad_horarios')
        .insert(registros)
        .select()

      if (error) {
        console.error(`Error copiando a día ${diaDestino}:`, error)
        continue
      }

      totalCopiados += data.length
    }

    return { 
      success: true, 
      totalCopiados,
      error: null 
    }
  } catch (error) {
    console.error('Error copiando plantilla:', error)
    return { success: false, error }
  }
}

// ============================================
// VERIFICACIÓN Y APLICACIÓN
// ============================================

/**
 * Verificar turnos que serían afectados al cambiar plantilla
 */
export const verificarTurnosAfectados = async (profesionalId, diaSemana, horariosNuevos) => {
  try {
    const hoy = new Date().toISOString().split('T')[0]
    
    // Obtener todos los turnos futuros del profesional
    const { data: turnos, error } = await supabase
      .from('turnos')
      .select('*')
      .eq('profesional_id', profesionalId)
      .gte('fecha', hoy)
      .neq('estado', 'cancelado')

    if (error) throw error

    // Filtrar turnos del día de la semana específico
    const turnosDelDia = turnos?.filter(t => {
      const fecha = new Date(t.fecha + 'T00:00:00')
      return fecha.getDay() === diaSemana
    }) || []

    // Verificar cuáles turnos estarían en horarios que se eliminarían
    const horariosNuevosSet = new Set(
      horariosNuevos.map(h => h.substring(0, 5))
    )

    const turnosAfectados = turnosDelDia.filter(t => {
      const horaInicio = t.hora_inicio.substring(0, 5)
      return !horariosNuevosSet.has(horaInicio)
    })

    // Agrupar por fecha para mejor visualización
    const turnosPorFecha = {}
    turnosAfectados.forEach(t => {
      if (!turnosPorFecha[t.fecha]) {
        turnosPorFecha[t.fecha] = []
      }
      turnosPorFecha[t.fecha].push(t)
    })

    // Calcular estadísticas
    const fechasUnicas = new Set(turnosDelDia.map(t => t.fecha))
    const diasConTurnos = fechasUnicas.size
    const diasSinTurnos = Math.max(0, 52 - diasConTurnos) // Aprox 52 semanas

    return {
      totalDias: 52, // Aproximado para el año
      diasConTurnos,
      diasSinTurnos,
      turnosAfectados,
      turnosPorFecha,
      totalTurnos: turnosDelDia.length,
      error: null
    }
  } catch (error) {
    console.error('Error verificando turnos afectados:', error)
    return { 
      totalDias: 0, 
      diasConTurnos: 0, 
      diasSinTurnos: 0,
      turnosAfectados: [], 
      turnosPorFecha: {},
      totalTurnos: 0,
      error 
    }
  }
}

/**
 * Aplicar plantilla a fechas futuras (protegiendo turnos reservados)
 * Esta función NO modifica días que ya tienen turnos
 */
export const aplicarPlantillaAFuturos = async (profesionalId, diaSemana, horarios) => {
  try {
    console.log('🔄 Aplicando plantilla a días futuros:', { profesionalId, diaSemana })
    
    // Esta operación es compleja y debería hacerse en el backend
    // Por ahora, solo guardamos la plantilla y la lógica de consulta
    // en turnosService.js se encarga de usarla correctamente
    
    // La plantilla ya está guardada, solo retornamos éxito
    return { 
      success: true, 
      mensaje: 'Plantilla guardada. Se aplicará automáticamente a días futuros sin turnos.',
      error: null 
    }
  } catch (error) {
    console.error('Error aplicando plantilla:', error)
    return { success: false, error }
  }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Generar horarios automáticos cada X minutos
 */
export const generarHorariosAutomaticos = (horaInicio, horaFin, intervaloMinutos) => {
  const horarios = []
  let [horaActual, minutoActual] = horaInicio.split(':').map(Number)
  const [horaFinal, minutoFinal] = horaFin.split(':').map(Number)

  while (horaActual < horaFinal || (horaActual === horaFinal && minutoActual < minutoFinal)) {
    const horario = `${horaActual.toString().padStart(2, '0')}:${minutoActual.toString().padStart(2, '0')}`
    horarios.push(horario)

    minutoActual += intervaloMinutos
    if (minutoActual >= 60) {
      horaActual += Math.floor(minutoActual / 60)
      minutoActual = minutoActual % 60
    }
  }

  return horarios
}

/**
 * Validar horario
 */
export const validarHorario = (hora) => {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return regex.test(hora)
}