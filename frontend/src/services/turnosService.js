import { supabase } from '../supabaseClient'
import { obtenerAhoraArgentina, obtenerFechaHoyArgentina } from '../utils/helpers'
import { enviarEmailConfirmacion, enviarEmailNotificacionAdmin } from './emailService'

// ============================================
// CONFIGURACIÓN DE TIEMPO
// ============================================
const MARGEN_ANTICIPACION = 30 // minutos antes del turno para poder reservar
const TIEMPO_OCULTAR_TURNO = 180 // minutos (3 horas) antes de ocultar turno no reservado

// ============================================
// OBTENER HORARIOS DISPONIBLES (CORREGIDO)
// ============================================
export const obtenerHorariosDisponibles = async (profesionalId, fecha) => {
  try {
    console.log('🔍 Obteniendo horarios para:', { profesionalId, fecha })

    // 1️⃣ Verificar si el día está completamente bloqueado
    const { data: bloqueos } = await supabase
      .from('bloqueos')
      .select('*')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fecha)
      .is('hora_inicio', null)
      .is('hora_fin', null)

    if (bloqueos && bloqueos.length > 0) {
      console.log('⛔ Día completamente bloqueado')
      return { data: [], error: null }
    }

    // 2️⃣ Obtener día de la semana
    const fechaObj = new Date(fecha + 'T00:00:00')
    const diaSemana = fechaObj.getDay()

    // 3️⃣ Obtener plantilla del día de la semana
    const { data: plantilla } = await supabase
      .from('disponibilidad_horarios')
      .select('*')
      .eq('profesional_id', profesionalId)
      .eq('dia_semana', diaSemana)
      .is('fecha', null)
      .eq('es_plantilla', true)
      .eq('activo', true)
      .order('hora')

    if (!plantilla || plantilla.length === 0) {
      console.log('⚠️ No hay plantilla configurada para este día')
      return { data: [], error: null }
    }

    // 4️⃣ Obtener modificaciones específicas de esta fecha
    const { data: modificaciones } = await supabase
      .from('disponibilidad_horarios')
      .select('*')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fecha)
      .order('hora')

    // 5️⃣ Construir lista combinando plantilla + modificaciones
    const modificacionesMap = new Map()
    modificaciones?.forEach(m => {
      const hora = m.hora.substring(0, 5)
      modificacionesMap.set(hora, m)
    })

    let horariosDisponibles = []

    plantilla.forEach(p => {
      const hora = p.hora.substring(0, 5)
      const mod = modificacionesMap.get(hora)
      
      if (mod && !mod.activo) return
      
      horariosDisponibles.push(p.hora)
    })

    modificaciones?.forEach(m => {
      if (m.es_personalizado && m.activo) {
        const hora = m.hora.substring(0, 5)
        const yaExiste = plantilla.some(p => p.hora.substring(0, 5) === hora)
        
        if (!yaExiste) {
          horariosDisponibles.push(m.hora)
        }
      }
    })

    horariosDisponibles.sort()

    // 6️⃣ 🔥 FILTRAR HORARIOS PASADOS (CORREGIDO)
    const hoy = obtenerFechaHoyArgentina()
    if (fecha === hoy) {
      const ahora = obtenerAhoraArgentina()
      console.log('🕐 Hora actual Argentina:', ahora.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }))

      horariosDisponibles = horariosDisponibles.filter(horario => {
        // Extraer hora y minuto del horario (formato: "HH:MM:SS" o "HH:MM")
        const [hora, minuto] = horario.substring(0, 5).split(':').map(Number)
        
        // Crear fecha del turno usando la fecha argentina + hora del turno
        const turnoFechaHora = new Date(fecha + 'T' + horario.substring(0, 8))
        
        // Calcular diferencia en minutos
        const minutosHasta = (turnoFechaHora - ahora) / (1000 * 60)
        
        console.log(`⏰ Horario ${horario}: ${minutosHasta.toFixed(0)} minutos hasta`, 
                    minutosHasta > TIEMPO_OCULTAR_TURNO ? '✅ Mostrar' : '❌ Ocultar')
        
        // Mostrar solo si faltan MÁS de TIEMPO_OCULTAR_TURNO minutos
        return minutosHasta > TIEMPO_OCULTAR_TURNO
      })

      console.log(`📊 Horarios después de filtrar (>${TIEMPO_OCULTAR_TURNO}min):`, horariosDisponibles.length)
    }

    // 7️⃣ Obtener turnos ocupados
    const { data: turnosOcupados } = await supabase
      .from('turnos')
      .select('hora_inicio')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fecha)
      .neq('estado', 'cancelado')

    const horasOcupadas = new Set(turnosOcupados?.map(t => t.hora_inicio) || [])

    // 8️⃣ Verificar bloqueos parciales
    const { data: bloqueosRango } = await supabase
      .from('bloqueos')
      .select('*')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fecha)
      .not('hora_inicio', 'is', null)

    const horasBloqueadas = new Set()
    bloqueosRango?.forEach(b => {
      const inicio = b.hora_inicio.substring(0, 5)
      const fin = b.hora_fin.substring(0, 5)
      
      horariosDisponibles.forEach(h => {
        const hora = h.substring(0, 5)
        if (hora >= inicio && hora < fin) {
          horasBloqueadas.add(h)
        }
      })
    })

    // 9️⃣ Filtrar ocupados y bloqueados
    const horariosFinal = horariosDisponibles.filter(h => 
      !horasOcupadas.has(h) && !horasBloqueadas.has(h)
    )

    console.log('✅ Horarios disponibles finales:', horariosFinal.length, horariosFinal)

    return { data: horariosFinal, error: null }
  } catch (error) {
    console.error('❌ Error obteniendo horarios:', error)
    return { data: null, error }
  }
}

// ============================================
// VERIFICAR SI UN DÍA TIENE TURNOS DISPONIBLES
// ============================================
export const tieneTurnosDisponibles = async (profesionalId, fecha) => {
  try {
    // 1️⃣ Verificar bloqueo completo
    const { data: bloqueos } = await supabase
      .from('bloqueos')
      .select('*')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fecha)
      .is('hora_inicio', null)
      .is('hora_fin', null)

    if (bloqueos && bloqueos.length > 0) return false

    // 2️⃣ Verificar si tiene plantilla
    const fechaObj = new Date(fecha + 'T00:00:00')
    const diaSemana = fechaObj.getDay()

    const { data: plantilla } = await supabase
      .from('disponibilidad_horarios')
      .select('id')
      .eq('profesional_id', profesionalId)
      .eq('dia_semana', diaSemana)
      .is('fecha', null)
      .eq('es_plantilla', true)
      .eq('activo', true)
      .limit(1)

    if (!plantilla || plantilla.length === 0) return false

    // 3️⃣ Verificar si realmente hay horarios disponibles
    const { data: horarios } = await obtenerHorariosDisponibles(profesionalId, fecha)
    
    return horarios && horarios.length > 0
  } catch (error) {
    console.error('Error verificando disponibilidad:', error)
    return false
  }
}

// ============================================
// RESTO DE FUNCIONES (SIN CAMBIOS)
// ============================================
export const obtenerProfesionales = async () => {
  try {
    const { data, error } = await supabase
      .from('profesionales')
      .select('*')
      .eq('activo', true)
      .order('orden')
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const obtenerTurnosPorFecha = async (fecha, profesionalId = null) => {
  try {
    let query = supabase
      .from('turnos')
      .select('*, profesionales(*)')
      .eq('fecha', fecha)
      .neq('estado', 'cancelado')
      .order('hora_inicio')
    
    if (profesionalId) {
      query = query.eq('profesional_id', profesionalId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const crearTurno = async (turnoData) => {
  try {
    // Validar que el horario esté disponible
    const { data: turnosExistentes } = await supabase
      .from('turnos')
      .select('*')
      .eq('profesional_id', turnoData.profesional_id)
      .eq('fecha', turnoData.fecha)
      .eq('hora_inicio', turnoData.hora_inicio)
      .neq('estado', 'cancelado')
    
    if (turnosExistentes && turnosExistentes.length > 0) {
      return { 
        data: null, 
        error: { message: '❌ Este horario ya fue reservado. Por favor, elige otro horario.' }
      }
    }
    
    // Validar que no sea un horario pasado
    const ahora = obtenerAhoraArgentina()
    const fechaHoraTurno = new Date(`${turnoData.fecha}T${turnoData.hora_inicio}`)
    
    if (fechaHoraTurno <= ahora) {
      return {
        data: null,
        error: { message: '❌ No se puede reservar un turno en horario pasado.' }
      }
    }
    
    const minutosHasta = (fechaHoraTurno - ahora) / (1000 * 60)
    if (minutosHasta < MARGEN_ANTICIPACION) {
      return {
        data: null,
        error: { message: `❌ Necesitas reservar con al menos ${MARGEN_ANTICIPACION} minutos de anticipación.` }
      }
    }
    
    // Calcular hora de fin (30 minutos después)
    const [hora, minuto] = turnoData.hora_inicio.split(':').map(Number)
    let nuevaHora = hora
    let nuevoMinuto = minuto + 30
    
    if (nuevoMinuto >= 60) {
      nuevaHora += Math.floor(nuevoMinuto / 60)
      nuevoMinuto = nuevoMinuto % 60
    }
    
    const hora_fin = `${nuevaHora.toString().padStart(2, '0')}:${nuevoMinuto.toString().padStart(2, '0')}:00`
    
    // Crear el turno
    const { data, error } = await supabase
      .from('turnos')
      .insert([{
        ...turnoData,
        hora_fin,
        estado: 'confirmado',
        email_enviado: false
      }])
      .select('*, profesionales(*)')
      .single()
    
    if (error) throw error
    
    console.log('✅ Turno creado:', data)
    
    // Enviar emails de forma asíncrona
    if (data) {
      enviarEmailConfirmacion(data, data.profesionales).catch(err => {
        console.error('⚠️ Error enviando email al cliente:', err)
      })
      
      enviarEmailNotificacionAdmin(data, data.profesionales).catch(err => {
        console.error('⚠️ Error enviando notificación al admin:', err)
      })
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error al crear turno:', error)
    return { data: null, error }
  }
}

export const obtenerConfiguracion = async () => {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
    
    if (error) throw error
    
    const config = {}
    data.forEach(item => {
      config[item.clave] = item.valor
    })
    
    return { data: config, error: null }
  } catch (error) {
    return { data: null, error }
  }
}