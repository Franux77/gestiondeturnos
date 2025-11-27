// ================================
// FECHAS Y ZONA HORARIA ARGENTINA
// ================================

// Obtener fecha/hora actual en Argentina (UTC-3)
export const obtenerAhoraArgentina = () => {
  const ahora = new Date()
  // Convertir a hora de Argentina (UTC-3)
  const offsetArgentina = -3 * 60 // -3 horas en minutos
  const offsetLocal = ahora.getTimezoneOffset() // diferencia en minutos
  const diferencia = offsetArgentina - offsetLocal
  
  return new Date(ahora.getTime() + diferencia * 60 * 1000)
}

// Obtener fecha de hoy en formato YYYY-MM-DD (Argentina)
export const obtenerFechaHoyArgentina = () => {
  const ahora = obtenerAhoraArgentina()
  return ahora.toISOString().split('T')[0]
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
    day: 'numeric' 
  }
  return date.toLocaleDateString('es-AR', opciones)
}

// Formatear fecha corta
export const formatearFechaCorta = (fecha) => {
  const date = new Date(fecha + 'T00:00:00')
  return date.toLocaleDateString('es-AR')
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