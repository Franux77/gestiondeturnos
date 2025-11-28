// ================================
// FECHAS Y ZONA HORARIA ARGENTINA
// ================================

/**
 * Obtener fecha/hora actual en Argentina (UTC-3)
 * MÉTODO CORRECTO: Usa toLocaleString con timeZone
 */
export const obtenerAhoraArgentina = () => {
  // Obtener fecha/hora actual en formato ISO de Argentina
  const fechaHoraArgentina = new Date().toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  // Convertir "11/27/2024, 20:45:30" a objeto Date
  return new Date(fechaHoraArgentina)
}

// Obtener fecha de hoy en formato YYYY-MM-DD (Argentina)
export const obtenerFechaHoyArgentina = () => {
  const ahora = obtenerAhoraArgentina()
  const año = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

// Verificar si una fecha es hoy (en Argentina)
export const esHoy = (fecha) => {
  return fecha === obtenerFechaHoyArgentina()
}

// Verificar si una fecha es pasada (en Argentina)
export const esFechaPasada = (fecha) => {
  const hoy = obtenerFechaHoyArgentina()
  return fecha < hoy
}

// ================================
// FORMATEO DE FECHAS Y HORAS
// ================================

// Formatear fecha legible en español
export const formatearFecha = (fecha) => {
  const date = new Date(fecha + 'T00:00:00')
  const opciones = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires'
  }
  const fechaFormateada = date.toLocaleDateString('es-AR', opciones)
  // Capitalizar primera letra
  return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
}

// Formatear fecha corta
export const formatearFechaCorta = (fecha) => {
  const date = new Date(fecha + 'T00:00:00')
  return date.toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires'
  })
}

// Formatear hora (eliminar segundos)
export const formatearHora = (hora) => {
  return hora.substring(0, 5) // "09:00:00" -> "09:00"
}

// Obtener nombre del día de la semana
export const obtenerNombreDia = (fecha) => {
  const date = new Date(fecha + 'T00:00:00')
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return dias[date.getDay()]
}

// ================================
// VALIDACIÓN
// ================================

// Validar email
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Validar teléfono argentino
export const validarTelefono = (telefono) => {
  // Acepta formatos: 3795123456, +5493795123456, (379) 512-3456, etc.
  const numeroLimpio = telefono.replace(/[\s\-\(\)]/g, '')
  const regex = /^(\+54)?[0-9]{10,13}$/
  return regex.test(numeroLimpio)
}

// Limpiar teléfono (quitar espacios, guiones, paréntesis)
export const limpiarTelefono = (telefono) => {
  return telefono.replace(/[\s\-\(\)]/g, '')
}

// ================================
// WHATSAPP
// ================================

// Crear link de WhatsApp
export const crearLinkWhatsApp = (telefono, mensaje = '') => {
  let numeroLimpio = limpiarTelefono(telefono)
  
  // Si no empieza con 54 (Argentina), agregarlo
  if (!numeroLimpio.startsWith('54') && !numeroLimpio.startsWith('+54')) {
    numeroLimpio = '54' + numeroLimpio
  }
  
  // Quitar el + si lo tiene
  numeroLimpio = numeroLimpio.replace('+', '')
  
  const mensajeCodificado = encodeURIComponent(mensaje)
  return `https://wa.me/${numeroLimpio}${mensaje ? '?text=' + mensajeCodificado : ''}`
}

// Formatear número de teléfono para mostrar
export const formatearTelefonoMostrar = (telefono) => {
  const limpio = limpiarTelefono(telefono)
  
  // Formato: +54 9 379 512-3456
  if (limpio.length >= 10) {
    const codigo = limpio.substring(0, 2) === '54' ? '54' : ''
    const area = limpio.substring(codigo ? 3 : 1, codigo ? 6 : 4)
    const resto = limpio.substring(codigo ? 6 : 4)
    
    if (codigo) {
      return `+${codigo} ${limpio[2]} ${area} ${resto.substring(0, 3)}-${resto.substring(3)}`
    } else {
      return `${area} ${resto.substring(0, 3)}-${resto.substring(3)}`
    }
  }
  
  return telefono
}

// ================================
// UTILIDADES
// ================================

// Obtener color de estado
export const obtenerColorEstado = (estado) => {
  const colores = {
    'pendiente': '#f59e0b',
    'confirmado': '#10b981',
    'completado': '#6366f1',
    'cancelado': '#ef4444'
  }
  return colores[estado] || '#6b7280'
}

// Scroll suave a un elemento
export const scrollSuave = (elementId) => {
  const elemento = document.getElementById(elementId)
  if (elemento) {
    elemento.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  }
}

// ================================
// UTILIDADES ADICIONALES DE TURNOS
// ================================

// Calcular minutos entre ahora y un turno
export const calcularMinutosHastaTurno = (fecha, hora) => {
  const ahora = obtenerAhoraArgentina()
  const turnoFecha = new Date(`${fecha}T${hora}`)
  return Math.floor((turnoFecha - ahora) / (1000 * 60))
}

// Verificar si un turno está próximo (menos de X minutos)
export const esTurnoProximo = (fecha, hora, minutosLimite = 30) => {
  const minutos = calcularMinutosHastaTurno(fecha, hora)
  return minutos > 0 && minutos <= minutosLimite
}

// Verificar si un turno ya pasó
export const esTurnoPasado = (fecha, hora) => {
  const minutos = calcularMinutosHastaTurno(fecha, hora)
  return minutos < 0
}