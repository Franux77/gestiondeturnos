import { supabase } from '../supabaseClient'

// ================================
// TURNOS
// ================================

export const obtenerTurnos = async (filtros = {}) => {
  try {
    let query = supabase
      .from('turnos')
      .select('*, profesionales(*)')
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true })

    if (filtros.estado) query = query.eq('estado', filtros.estado)
    if (filtros.profesional_id) query = query.eq('profesional_id', filtros.profesional_id)
    if (filtros.fecha_desde) query = query.gte('fecha', filtros.fecha_desde)
    if (filtros.fecha_hasta) query = query.lte('fecha', filtros.fecha_hasta)
    if (filtros.busqueda) query = query.ilike('cliente_nombre', `%${filtros.busqueda}%`)

    const { data, error } = await query
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo turnos:', error)
    return { data: null, error }
  }
}

export const obtenerTurnosHoy = async () => {
  const hoy = new Date().toISOString().split('T')[0]
  return await obtenerTurnos({ fecha_desde: hoy, fecha_hasta: hoy })
}

export const obtenerProximosTurnos = async (dias = 7) => {
  const hoy = new Date().toISOString().split('T')[0]
  const futuro = new Date()
  futuro.setDate(futuro.getDate() + dias)
  const fechaFuturo = futuro.toISOString().split('T')[0]
  return await obtenerTurnos({ fecha_desde: hoy, fecha_hasta: fechaFuturo })
}

export const actualizarEstadoTurno = async (turnoId, nuevoEstado) => {
  try {
    const { data, error } = await supabase
      .from('turnos')
      .update({ estado: nuevoEstado })
      .eq('id', turnoId)
      .select('*, profesionales(*)')
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error actualizando estado:', error)
    return { data: null, error }
  }
}

export const actualizarTurno = async (turnoId, datosActualizados) => {
  try {
    const { data, error } = await supabase
      .from('turnos')
      .update(datosActualizados)
      .eq('id', turnoId)
      .select('*, profesionales(*)')
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error actualizando turno:', error)
    return { data: null, error }
  }
}

export const eliminarTurno = async (turnoId) => {
  try {
    const { error } = await supabase
      .from('turnos')
      .delete()
      .eq('id', turnoId)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error eliminando turno:', error)
    return { success: false, error }
  }
}

// ================================
// ESTADÍSTICAS AVANZADAS
// ================================

export const obtenerEstadisticas = async () => {
  try {
    const hoy = new Date().toISOString().split('T')[0]
    
    const { data: turnosHoy } = await obtenerTurnosHoy()
    
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
    const finSemana = new Date(inicioSemana)
    finSemana.setDate(finSemana.getDate() + 6)

    const { data: turnosSemana } = await obtenerTurnos({
      fecha_desde: inicioSemana.toISOString().split('T')[0],
      fecha_hasta: finSemana.toISOString().split('T')[0]
    })

    const { data: todosLosTurnos } = await obtenerTurnos()
    const clientesUnicos = new Set(
      todosLosTurnos?.map(t => t.cliente_email.toLowerCase()) || []
    ).size

    const contadorProfesionales = {}
    todosLosTurnos?.forEach(turno => {
      const nombre = turno.profesionales.nombre
      contadorProfesionales[nombre] = (contadorProfesionales[nombre] || 0) + 1
    })

    const profesionalMasSolicitado = Object.entries(contadorProfesionales)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    return {
      data: {
        turnosHoy: turnosHoy?.length || 0,
        turnosSemana: turnosSemana?.length || 0,
        totalClientes: clientesUnicos,
        profesionalMasSolicitado
      },
      error: null
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return { data: null, error }
  }
}

export const obtenerEstadisticasAvanzadas = async () => {
  try {
    const { data: todosLosTurnos } = await obtenerTurnos()
    
    // Tasa de asistencia
    const confirmados = todosLosTurnos?.filter(t => t.estado === 'confirmado').length || 0
    const noAsistio = todosLosTurnos?.filter(t => t.estado === 'no_asistio').length || 0
    const cancelados = todosLosTurnos?.filter(t => t.estado === 'cancelado').length || 0
    const total = confirmados + noAsistio + cancelados
    const tasaAsistencia = total > 0 ? ((confirmados / total) * 100).toFixed(1) : 0

    // Clientes frecuentes
    const contadorClientes = {}
    todosLosTurnos?.forEach(turno => {
      const email = turno.cliente_email.toLowerCase()
      contadorClientes[email] = (contadorClientes[email] || 0) + 1
    })
    
    const clientesFrecuentes = Object.entries(contadorClientes)
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([email, count]) => {
        const turno = todosLosTurnos.find(t => t.cliente_email.toLowerCase() === email)
        return {
          nombre: turno?.cliente_nombre || email,
          email,
          cantidad: count
        }
      })

    // Horarios más solicitados
    const contadorHorarios = {}
    todosLosTurnos?.forEach(turno => {
      const hora = turno.hora_inicio.substring(0, 5)
      contadorHorarios[hora] = (contadorHorarios[hora] || 0) + 1
    })
    
    const horariosPico = Object.entries(contadorHorarios)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hora, cantidad]) => ({ hora, cantidad }))

    // Turnos por profesional
    const turnosPorProfesional = {}
    todosLosTurnos?.forEach(turno => {
      const nombre = turno.profesionales.nombre
      if (!turnosPorProfesional[nombre]) {
        turnosPorProfesional[nombre] = { confirmados: 0, cancelados: 0, noAsistio: 0 }
      }
      if (turno.estado === 'confirmado') turnosPorProfesional[nombre].confirmados++
      if (turno.estado === 'cancelado') turnosPorProfesional[nombre].cancelados++
      if (turno.estado === 'no_asistio') turnosPorProfesional[nombre].noAsistio++
    })

    return {
      data: {
        tasaAsistencia,
        totalTurnos: total,
        confirmados,
        cancelados,
        noAsistio,
        clientesFrecuentes,
        horariosPico,
        turnosPorProfesional
      },
      error: null
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas avanzadas:', error)
    return { data: null, error }
  }
}

// ================================
// PROFESIONALES
// ================================

export const obtenerProfesionales = async () => {
  try {
    const { data, error } = await supabase
      .from('profesionales')
      .select('*')
      .order('orden', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener profesionales:', error)
    return { data: null, error }
  }
}

export const obtenerProfesionalesActivos = async () => {
  try {
    const { data, error } = await supabase
      .from('profesionales')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener profesionales activos:', error)
    return { data: null, error }
  }
}

export const crearProfesional = async (profesional) => {
  try {
    const { data: maxOrden } = await supabase
      .from('profesionales')
      .select('orden')
      .order('orden', { ascending: false })
      .limit(1)
      .single()

    const nuevoOrden = maxOrden ? maxOrden.orden + 1 : 1

    const { data, error } = await supabase
      .from('profesionales')
      .insert([{
        nombre: profesional.nombre,
        especialidad: profesional.especialidad,
        color: profesional.color || '#3B82F6',
        activo: profesional.activo !== undefined ? profesional.activo : true,
        orden: nuevoOrden
      }])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al crear profesional:', error)
    return { data: null, error }
  }
}

export const actualizarProfesional = async (id, cambios) => {
  try {
    const { data, error } = await supabase
      .from('profesionales')
      .update(cambios)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al actualizar profesional:', error)
    return { data: null, error }
  }
}

export const toggleActivoProfesional = async (id, nuevoEstado) => {
  try {
    const { data, error } = await supabase
      .from('profesionales')
      .update({ activo: nuevoEstado })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al cambiar estado del profesional:', error)
    return { data: null, error }
  }
}

// ================================
// BLOQUEOS
// ================================

export const obtenerBloqueos = async (filtros = {}) => {
  try {
    let query = supabase
      .from('bloqueos')
      .select('*, profesionales(*)')
      .order('fecha', { ascending: true })

    if (filtros.profesional_id) query = query.eq('profesional_id', filtros.profesional_id)
    if (filtros.fecha_desde) query = query.gte('fecha', filtros.fecha_desde)
    if (filtros.fecha_hasta) query = query.lte('fecha', filtros.fecha_hasta)
    if (filtros.tipo) query = query.eq('tipo', filtros.tipo)

    const { data, error } = await query
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error obteniendo bloqueos:', error)
    return { data: null, error }
  }
}

export const crearBloqueo = async (bloqueo) => {
  try {
    const { data, error } = await supabase
      .from('bloqueos')
      .insert([{
        profesional_id: bloqueo.profesional_id,
        fecha: bloqueo.fecha,
        hora_inicio: bloqueo.hora_inicio || null,
        hora_fin: bloqueo.hora_fin || null,
        motivo: bloqueo.motivo || '',
        tipo: bloqueo.tipo || 'manual',
        created_by: 'admin'
      }])
      .select('*, profesionales(*)')
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al crear bloqueo:', error)
    return { data: null, error }
  }
}

export const eliminarBloqueo = async (id) => {
  try {
    const { error } = await supabase
      .from('bloqueos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error al eliminar bloqueo:', error)
    return { success: false, error }
  }
}

export const verificarBloqueo = async (profesionalId, fecha, horaInicio = null) => {
  try {
    let query = supabase
      .from('bloqueos')
      .select('*')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fecha)

    const { data, error } = await query
    if (error) throw error

    // Si hay bloqueo de día completo (sin horas)
    const bloqueoCompleto = data?.find(b => !b.hora_inicio && !b.hora_fin)
    if (bloqueoCompleto) return { bloqueado: true, bloqueo: bloqueoCompleto }

    // Si se especificó hora, verificar bloqueos parciales
    if (horaInicio) {
      const bloqueoParcial = data?.find(b => {
        if (!b.hora_inicio || !b.hora_fin) return false
        return horaInicio >= b.hora_inicio && horaInicio < b.hora_fin
      })
      if (bloqueoParcial) return { bloqueado: true, bloqueo: bloqueoParcial }
    }

    return { bloqueado: false, bloqueo: null }
  } catch (error) {
    console.error('Error verificando bloqueo:', error)
    return { bloqueado: false, bloqueo: null }
  }
}
// ================================
// DISPONIBILIDAD DE HORARIOS
// ================================

export const obtenerDisponibilidadDia = async (profesionalId, fecha) => {
  // console.log('🔵 [adminService] obtenerDisponibilidadDia llamado:', { profesionalId, fecha })
  try {
    const { data, error } = await supabase
      .from('disponibilidad_horarios')
      .select('*')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fecha)
      .order('hora', { ascending: true })

    // console.log('   → Data obtenida:', data)
    // console.log('   → Error:', error)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('❌ [adminService] Error obteniendo disponibilidad:', error)
    return { data: null, error }
  }
}

export const toggleDisponibilidadHorario = async (profesionalId, fecha, hora, activo) => {
  // console.log('🔵 [adminService] toggleDisponibilidadHorario llamado:', { profesionalId, fecha, hora, activo })
  try {
    // Formatear hora correctamente
    const horaFormateada = hora.length === 5 ? hora + ':00' : hora
    // console.log('   → Hora formateada:', horaFormateada)

    // Intentar actualizar si existe
    const { data: existing } = await supabase
      .from('disponibilidad_horarios')
      .select('id')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fecha)
      .eq('hora', horaFormateada)
      .maybeSingle()

    // console.log('   → Registro existente:', existing)

    if (existing) {
      // Actualizar
      // console.log('   → Actualizando registro existente...')
      const { data, error } = await supabase
        .from('disponibilidad_horarios')
        .update({ activo })
        .eq('id', existing.id)
        .select()
        .single()

      // console.log('   → Data actualizada:', data)
      // console.log('   → Error:', error)

      if (error) throw error
      return { data, error: null }
    } else {
      // Crear nuevo
      console.log('   → Creando nuevo registro...')
      const { data, error } = await supabase
        .from('disponibilidad_horarios')
        .insert([{
          profesional_id: profesionalId,
          fecha,
          hora: horaFormateada,
          activo,
          es_personalizado: false // Toggle de horario default
        }])
        .select()
        .single()

      // console.log('   → Data creada:', data)
      // console.log('   → Error:', error)

      if (error) throw error
      return { data, error: null }
    }
  } catch (error) {
    // console.error('❌ [adminService] Error al cambiar disponibilidad:', error)
    return { data: null, error }
  }
}

export const agregarHorarioPersonalizado = async (profesionalId, fecha, hora) => {
  console.log('🔵 [adminService] agregarHorarioPersonalizado llamado:', { profesionalId, fecha, hora })
  try {
    const horaFormateada = hora.length === 5 ? hora + ':00' : hora
    console.log('   → Hora formateada:', horaFormateada)

    const { data, error } = await supabase
      .from('disponibilidad_horarios')
      .insert([{
        profesional_id: profesionalId,
        fecha,
        hora: horaFormateada,
        activo: true,
        es_personalizado: true
      }])
      .select()
      .single()

    // console.log('   → Data insertada:', data)
    // console.log('   → Error:', error)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('❌ [adminService] Error al agregar horario personalizado:', error)
    return { data: null, error }
  }
}

export const actualizarHorarioPersonalizado = async (id, nuevaHora) => {
  console.log('🔵 [adminService] actualizarHorarioPersonalizado llamado:', { id, nuevaHora })
  try {
    const horaFormateada = nuevaHora.length === 5 ? nuevaHora + ':00' : nuevaHora
    console.log('   → Hora formateada:', horaFormateada)

    const { data, error } = await supabase
      .from('disponibilidad_horarios')
      .update({ hora: horaFormateada })
      .eq('id', id)
      .select()
      .single()

    // console.log('   → Data actualizada:', data)
    // console.log('   → Error:', error)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('❌ [adminService] Error al actualizar horario:', error)
    return { data: null, error }
  }
}

export const eliminarHorarioPersonalizado = async (id) => {
  console.log('🔵 [adminService] eliminarHorarioPersonalizado llamado:', { id })
  try {
    const { error } = await supabase
      .from('disponibilidad_horarios')
      .delete()
      .eq('id', id)

    // console.log('   → Error:', error)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('❌ [adminService] Error al eliminar horario:', error)
    return { success: false, error }
  }
}

export const restaurarHorariosDefault = async (profesionalId, fecha) => {
  try {
    const { error } = await supabase
      .from('disponibilidad_horarios')
      .delete()
      .eq('profesional_id', profesionalId)
      .eq('fecha', fecha)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error al restaurar horarios:', error)
    return { success: false, error }
  }
}

// ================================
// CONFIGURACIÓN
// ================================

export const obtenerConfiguracion = async (clave) => {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .eq('clave', clave)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener configuración:', error)
    return { data: null, error }
  }
}

export const obtenerTodasConfiguraciones = async () => {
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
    console.error('Error al obtener configuraciones:', error)
    return { data: null, error }
  }
}

export const guardarConfiguracion = async (clave, valor) => {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .upsert({ 
        clave, 
        valor: valor.toString() 
      }, { 
        onConflict: 'clave' 
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al guardar configuración:', error)
    return { data: null, error }
  }
}

export const guardarMultiplesConfiguraciones = async (configuraciones) => {
  try {
    const updates = Object.entries(configuraciones).map(([clave, valor]) =>
      supabase
        .from('configuracion')
        .upsert({ 
          clave, 
          valor: valor.toString() 
        }, { 
          onConflict: 'clave' 
        })
    )

    await Promise.all(updates)
    return { error: null }
  } catch (error) {
    console.error('Error al guardar configuraciones:', error)
    return { error }
  }
}

// ================================
// PLANTILLAS SEMANALES
// ================================

export const obtenerPlantilla = async (profesionalId, diaSemana) => {
  // console.log('🔵 [adminService] obtenerPlantilla llamado:', { profesionalId, diaSemana })
  try {
    const { data, error } = await supabase
      .from('disponibilidad_horarios')
      .select('*')
      .eq('profesional_id', profesionalId)
      .eq('dia_semana', diaSemana)
      .is('fecha', null)
      .eq('es_plantilla', true)
      .order('hora', { ascending: true })

    // console.log('   → Data obtenida:', data)
    // console.log('   → Error:', error)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('❌ [adminService] Error obteniendo plantilla:', error)
    return { data: null, error }
  }
}

export const agregarHorarioPlantilla = async (profesionalId, diaSemana, hora) => {
  console.log('🔵 [adminService] agregarHorarioPlantilla llamado:', { profesionalId, diaSemana, hora })
  try {
    const horaFormateada = hora.length === 5 ? hora + ':00' : hora

    const { data, error } = await supabase
      .from('disponibilidad_horarios')
      .insert([{
        profesional_id: profesionalId,
        dia_semana: diaSemana,
        hora: horaFormateada,
        activo: true,
        es_plantilla: true,
        fecha: null,
        es_personalizado: false
      }])
      .select()
      .single()

    // console.log('   → Data insertada:', data)
    // console.log('   → Error:', error)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('❌ [adminService] Error al agregar horario plantilla:', error)
    return { data: null, error }
  }
}

export const eliminarHorarioPlantilla = async (id) => {
  console.log('🔵 [adminService] eliminarHorarioPlantilla llamado:', { id })
  try {
    const { error } = await supabase
      .from('disponibilidad_horarios')
      .delete()
      .eq('id', id)

    // console.log('   → Error:', error)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('❌ [adminService] Error al eliminar horario plantilla:', error)
    return { success: false, error }
  }
}

export const limpiarPlantillaDia = async (profesionalId, diaSemana) => {
  console.log('🔵 [adminService] limpiarPlantillaDia llamado:', { profesionalId, diaSemana })
  try {
    const { error } = await supabase
      .from('disponibilidad_horarios')
      .delete()
      .eq('profesional_id', profesionalId)
      .eq('dia_semana', diaSemana)
      .is('fecha', null)
      .eq('es_plantilla', true)

    // console.log('   → Error:', error)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('❌ [adminService] Error al limpiar plantilla:', error)
    return { success: false, error }
  }
}

export const copiarPlantillaDias = async (profesionalId, diaOrigen, diasDestino) => {
  console.log('🔵 [adminService] copiarPlantillaDias llamado:', { profesionalId, diaOrigen, diasDestino })
  try {
    // 1. Obtener horarios del día origen
    const { data: horariosOrigen } = await obtenerPlantilla(profesionalId, diaOrigen)
    
    if (!horariosOrigen || horariosOrigen.length === 0) {
      return { success: true, copiados: 0 }
    }

    // 2. Para cada día destino, copiar horarios
    let totalCopiados = 0
    
    for (const diaDestino of diasDestino) {
      // Limpiar día destino primero
      await limpiarPlantillaDia(profesionalId, diaDestino)
      
      // Insertar horarios
      for (const horario of horariosOrigen) {
        const { data } = await agregarHorarioPlantilla(
          profesionalId, 
          diaDestino, 
          horario.hora.substring(0, 5)
        )
        if (data) totalCopiados++
      }
    }

    return { success: true, copiados: totalCopiados }
  } catch (error) {
    console.error('❌ [adminService] Error al copiar plantilla:', error)
    return { success: false, error }
  }
}