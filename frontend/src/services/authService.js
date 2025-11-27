import { CONFIG } from '../utils/constants'

// Por ahora usamos autenticación simple
// En producción usarías Supabase Auth o JWT real
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // CAMBIAR en producción
}

// ================================
// LOGIN
// ================================

export const login = async (username, password) => {
  try {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500))

    // Validar credenciales
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Crear token simple (en producción usar JWT real)
      const token = btoa(`${username}:${Date.now()}`)
      const expiry = Date.now() + CONFIG.TOKEN_EXPIRY

      const session = {
        token,
        username,
        expiry,
        loginTime: new Date().toISOString()
      }

      // Guardar en localStorage
      localStorage.setItem(CONFIG.TOKEN_KEY, JSON.stringify(session))

      return { success: true, session }
    } else {
      return { success: false, error: 'Credenciales incorrectas' }
    }
  } catch (error) {
    console.error('Error en login:', error)
    return { success: false, error: 'Error al iniciar sesión' }
  }
}

// ================================
// LOGOUT
// ================================

export const logout = () => {
  localStorage.removeItem(CONFIG.TOKEN_KEY)
  window.location.href = '/'
}

// ================================
// VERIFICAR SESIÓN
// ================================

export const verificarSesion = () => {
  try {
    const sessionStr = localStorage.getItem(CONFIG.TOKEN_KEY)
    
    if (!sessionStr) {
      return { valida: false }
    }

    const session = JSON.parse(sessionStr)
    const ahora = Date.now()

    // Verificar si la sesión expiró
    if (ahora > session.expiry) {
      localStorage.removeItem(CONFIG.TOKEN_KEY)
      return { valida: false, expirada: true }
    }

    return { valida: true, session }
  } catch (error) {
    console.error('Error verificando sesión:', error)
    localStorage.removeItem(CONFIG.TOKEN_KEY)
    return { valida: false }
  }
}

// ================================
// OBTENER SESIÓN ACTUAL
// ================================

export const obtenerSesion = () => {
  try {
    const sessionStr = localStorage.getItem(CONFIG.TOKEN_KEY)
    if (!sessionStr) return null

    const session = JSON.parse(sessionStr)
    return session
  } catch (error) {
    return null
  }
}

// ================================
// RENOVAR SESIÓN
// ================================

export const renovarSesion = () => {
  try {
    const session = obtenerSesion()
    if (!session) return false

    // Extender la expiración
    session.expiry = Date.now() + CONFIG.TOKEN_EXPIRY
    localStorage.setItem(CONFIG.TOKEN_KEY, JSON.stringify(session))

    return true
  } catch (error) {
    console.error('Error renovando sesión:', error)
    return false
  }
}

// ================================
// VERIFICAR SI ESTÁ AUTENTICADO
// ================================

export const estaAutenticado = () => {
  const { valida } = verificarSesion()
  return valida
}

// ================================
// CAMBIAR CONTRASEÑA (TODO)
// ================================

export const cambiarPassword = async (passwordActual, passwordNueva) => {
  // TODO: Implementar con Supabase o backend
  console.log('Cambiar password - Por implementar')
  return { success: false, error: 'Función no implementada' }
}