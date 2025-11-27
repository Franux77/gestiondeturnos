// ================================
// ESTADOS DE TURNOS - SIMPLIFICADOS
// ================================

export const ESTADOS_TURNO = {
  CONFIRMADO: 'confirmado',
  CANCELADO: 'cancelado',
  NO_ASISTIO: 'no_asistio'
}

export const ESTADOS_TURNO_CONFIG = {
  [ESTADOS_TURNO.CONFIRMADO]: {
    label: 'Confirmado',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: '✓',
    descripcion: 'Turno confirmado, esperando al cliente'
  },
  [ESTADOS_TURNO.CANCELADO]: {
    label: 'Cancelado',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    icon: '✕',
    descripcion: 'Cliente canceló o no confirmó'
  },
  [ESTADOS_TURNO.NO_ASISTIO]: {
    label: 'No asistió',
    color: '#64748b',
    bgColor: 'rgba(100, 116, 139, 0.1)',
    icon: '⊘',
    descripcion: 'Cliente no se presentó al turno'
  }
}

// ================================
// TIPOS DE BLOQUEOS
// ================================

export const TIPOS_BLOQUEO = {
  MANUAL: 'manual',
  VACACIONES: 'vacaciones',
  FERIADO: 'feriado',
  AUSENCIA: 'ausencia'
}

export const TIPOS_BLOQUEO_CONFIG = {
  [TIPOS_BLOQUEO.MANUAL]: {
    label: 'Bloqueo Manual',
    color: '#f59e0b',
    icon: '🚫'
  },
  [TIPOS_BLOQUEO.VACACIONES]: {
    label: 'Vacaciones',
    color: '#3b82f6',
    icon: '🏖️'
  },
  [TIPOS_BLOQUEO.FERIADO]: {
    label: 'Feriado',
    color: '#ec4899',
    icon: '🎉'
  },
  [TIPOS_BLOQUEO.AUSENCIA]: {
    label: 'Ausencia',
    color: '#8b5cf6',
    icon: '🏥'
  }
}

// ================================
// ROLES
// ================================

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
}

// ================================
// RUTAS
// ================================

export const RUTAS = {
  HOME: '/',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_TURNOS: '/admin/turnos',
  ADMIN_PROFESIONALES: '/admin/profesionales',
  ADMIN_CALENDARIO: '/admin/calendario',
  ADMIN_BLOQUEOS: '/admin/bloqueos',
  ADMIN_CONFIGURACION: '/admin/configuracion'
}

// ================================
// CONFIGURACIÓN
// ================================

export const CONFIG = {
  TOKEN_KEY: 'admin_token',
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
  MIN_PASSWORD_LENGTH: 6,
  ITEMS_PER_PAGE: 10,
  MARGEN_ANTICIPACION_MINUTOS: 30,
  MAX_MESES_ADELANTE: 2
}

// ================================
// DÍAS DE LA SEMANA
// ================================

export const DIAS_SEMANA = [
  { id: 0, nombre: 'Domingo', abrev: 'Dom' },
  { id: 1, nombre: 'Lunes', abrev: 'Lun' },
  { id: 2, nombre: 'Martes', abrev: 'Mar' },
  { id: 3, nombre: 'Miércoles', abrev: 'Mié' },
  { id: 4, nombre: 'Jueves', abrev: 'Jue' },
  { id: 5, nombre: 'Viernes', abrev: 'Vie' },
  { id: 6, nombre: 'Sábado', abrev: 'Sáb' }
]

// ================================
// COLORES PARA PROFESIONALES
// ================================

export const COLORES_PROFESIONALES = [
  { nombre: 'Verde Lima', hex: '#a3e635' },
  { nombre: 'Azul', hex: '#3B82F6' },
  { nombre: 'Rosa', hex: '#EC4899' },
  { nombre: 'Naranja', hex: '#F59E0B' },
  { nombre: 'Verde', hex: '#10B981' },
  { nombre: 'Morado', hex: '#8B5CF6' },
  { nombre: 'Rojo', hex: '#EF4444' },
  { nombre: 'Turquesa', hex: '#14B8A6' },
  { nombre: 'Índigo', hex: '#6366F1' },
  { nombre: 'Amarillo', hex: '#EAB308' }
]

// ================================
// MENSAJES
// ================================

export const MENSAJES = {
  ERROR_GENERICO: 'Ocurrió un error. Por favor, intentá de nuevo.',
  ERROR_AUTENTICACION: 'Usuario o contraseña incorrectos.',
  ERROR_SESSION_EXPIRADA: 'Tu sesión expiró. Por favor, iniciá sesión nuevamente.',
  SUCCESS_TURNO_CREADO: '¡Turno creado exitosamente!',
  SUCCESS_TURNO_ACTUALIZADO: 'Turno actualizado exitosamente.',
  SUCCESS_TURNO_ELIMINADO: 'Turno eliminado exitosamente.',
  SUCCESS_TURNO_CANCELADO: 'Turno cancelado exitosamente.',
  SUCCESS_PROFESIONAL_CREADO: 'Profesional agregado exitosamente.',
  SUCCESS_PROFESIONAL_ACTUALIZADO: 'Profesional actualizado exitosamente.',
  SUCCESS_BLOQUEO_CREADO: 'Bloqueo creado exitosamente.',
  SUCCESS_BLOQUEO_ELIMINADO: 'Bloqueo eliminado exitosamente.',
  SUCCESS_CONFIG_GUARDADA: '¡Configuración guardada exitosamente!',
  CONFIRM_ELIMINAR_TURNO: '¿Estás seguro de eliminar este turno?',
  CONFIRM_CANCELAR_TURNO: '¿Estás seguro de cancelar este turno?',
  CONFIRM_NO_ASISTIO: '¿Marcar como "No asistió"?',
  CONFIRM_ELIMINAR_PROFESIONAL: '¿Estás seguro de desactivar este profesional?',
  CONFIRM_ELIMINAR_BLOQUEO: '¿Estás seguro de eliminar este bloqueo?'
}

// ================================
// MESES DEL AÑO
// ================================

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]