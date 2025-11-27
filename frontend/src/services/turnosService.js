import { supabase } from '../supabaseClient'
import { obtenerAhoraArgentina, obtenerFechaHoyArgentina } from '../utils/helpers'
import { enviarEmailConfirmacion, enviarEmailNotificacionAdmin } from './emailService'

// ============================================
// OBTENER HORARIOS DISPONIBLES (NUEVA LÓGICA CORREGIDA)
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
    const diaSemana = fechaObj.getDay() // 0-6

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

    console.log('📋 Plantilla base:', plantilla.length, 'horarios')

    // 4️⃣ Obtener modificaciones específicas de esta fecha
    const { data: modificaciones } = await supabase
      .from('disponibilidad_horarios')
      .select('*')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fecha)
      .order('hora')

    console.log('🔧 Modificaciones del día:', modificaciones?.length || 0)

    // 5️⃣ Crear mapa de modificaciones por hora
    const modificacionesMap = new Map()
    modificaciones?.forEach(m => {
      const hora = m.hora.substring(0, 5)
      modificacionesMap.set(hora, m)
    })

    // 6️⃣ Construir lista final combinando plantilla + modificaciones
    let horariosDisponibles = []

    // Agregar horarios de plantilla (filtrando desactivados)
    plantilla.forEach(p => {
      const hora = p.hora.substring(0, 5)
      const mod = modificacionesMap.get(hora)
      
      // Si hay modificación que lo desactiva, NO agregarlo
      if (mod && !mod.activo) {
        console.log(`   ⛔ Omitiendo ${hora} (desactivado manualmente)`)
        return
      }
      
      horariosDisponibles.push(p.hora)
    })

    // Agregar horarios personalizados ACTIVOS que NO están en plantilla
    modificaciones?.forEach(m => {
      if (m.es_personalizado && m.activo) {
        const hora = m.hora.substring(0, 5)
        const yaExiste = plantilla.some(p => p.hora.substring(0, 5) === hora)
        
        if (!yaExiste) {
          console.log(`   ✅ Agregando ${hora} (personalizado)`)
          horariosDisponibles.push(m.hora)
        }
      }
    })

    // Ordenar
    horariosDisponibles.sort()

    console.log('📊 Horarios después de modificaciones:', horariosDisponibles.length)

    // 7️⃣ Filtrar horarios pasados si es hoy (CON ZONA HORARIA ARGENTINA)
    const hoy = obtenerFechaHoyArgentina()
    if (fecha === hoy) {
      const ahora = obtenerAhoraArgentina()
      const margenMinutos = 30

      horariosDisponibles = horariosDisponibles.filter(horario => {
        const [hora, minuto] = horario.split(':').map(Number)
        const horarioDate = new Date(ahora)
        horarioDate.setHours(hora, minuto, 0, 0)

        const tiempoHasta = (horarioDate - ahora) / (1000 * 60)
        
        console.log(`   ⏰ ${horario}: ${tiempoHasta.toFixed(0)}min hasta turno`)
        
        return tiempoHasta > margenMinutos
      })

      console.log('📊 Horarios después de filtrar pasados:', horariosDisponibles.length)
    } else {
      console.log('📅 No es hoy, no se filtran horarios pasados')
    }

    // 8️⃣ Obtener turnos ocupados
    const { data: turnosOcupados } = await supabase
      .from('turnos')
      .select('hora_inicio')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fecha)
      .neq('estado', 'cancelado')

    const horasOcupadas = new Set(turnosOcupados?.map(t => t.hora_inicio) || [])

    // 9️⃣ Verificar bloqueos parciales
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

    // 🔟 Filtrar ocupados y bloqueados
    const horariosFinal = horariosDisponibles.filter(h => 
      !horasOcupadas.has(h) && !horasBloqueadas.has(h)
    )

    console.log('✅ Horarios disponibles finales:', horariosFinal.length)

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
    // Verificar bloqueo completo
    const { data: bloqueos } = await supabase
      .from('bloqueos')
      .select('*')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fecha)
      .is('hora_inicio', null)
      .is('hora_fin', null)

    if (bloqueos && bloqueos.length > 0) return false

    // Verificar si tiene plantilla
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

    return plantilla && plantilla.length > 0
  } catch (error) {
    console.error('Error verificando disponibilidad:', error)
    return false
  }
}

// ============================================
// RESTO DE FUNCIONES
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
    
    // Validar que no sea un horario pasado (CON ZONA HORARIA ARGENTINA)
    const ahora = obtenerAhoraArgentina()
    const fechaHoraTurno = new Date(`${turnoData.fecha}T${turnoData.hora_inicio}`)
    
    if (fechaHoraTurno <= ahora) {
      return {
        data: null,
        error: { message: '❌ No se puede reservar un turno en horario pasado.' }
      }
    }
    
    const minutosHasta = (fechaHoraTurno - ahora) / (1000 * 60)
    if (minutosHasta < 30) {
      return {
        data: null,
        error: { message: '❌ Necesitas reservar con al menos 30 minutos de anticipación.' }
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
    
    // ⭐ ENVIAR EMAILS DE FORMA ASÍNCRONA (sin bloquear la respuesta)
    if (data) {
      // Enviar email al cliente
      enviarEmailConfirmacion(data, data.profesionales).catch(err => {
        console.error('⚠️ Error enviando email al cliente:', err)
      })
      
      // Enviar notificación al admin
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