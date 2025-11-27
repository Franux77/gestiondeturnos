import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

// ============================================
// 🎯 CONFIGURACIÓN: DEFINE TUS HORARIOS AQUÍ
// ============================================

const HORARIOS_PERSONALIZADOS = {
  // Lunes 
  1: [
    '10:00:00',
    '10:40:00',
    '11:20:00',
    '12:00:00',
    '17:00:00',
    '17:40:00',
    '18:20:00',
    '19:00:00',
    '19:40:00',
    '20:20:00'
  ],
  
  // Martes 
  2: [
    '10:00:00',
    '10:40:00',
    '11:20:00',
    '12:00:00',
    '17:00:00',
    '17:40:00',
    '18:20:00',
    '19:00:00',
    '19:40:00',
    '20:20:00'
  ],
  
  // Miércoles
  3: [
    '10:00:00',
    '10:40:00',
    '11:20:00',
    '12:00:00',
    '17:00:00',
    '17:40:00',
    '18:20:00',
    '19:00:00',
    '19:40:00',
    '20:20:00'
  ],
  
  // Jueves
  4: [
    '10:00:00',
    '10:40:00',
    '11:20:00',
    '12:00:00',
    '17:00:00',
    '17:40:00',
    '18:20:00',
    '19:00:00',
    '19:40:00',
    '20:20:00'
  ],
  
  // Viernes
  5: [
    '10:00:00',
    '10:40:00',
    '11:20:00',
    '12:00:00',
    '17:00:00',
    '17:40:00',
    '18:20:00',
    '19:00:00',
    '19:40:00',
    '20:20:00'
  ],
  
  // Sábado (6) - No trabajas
  6: [],
  
  // Domingo (0) - No trabajas
  0: []
}

// ============================================
// SCRIPT DE MIGRACIÓN
// ============================================

export const migrarAPlantillas = async () => {
  try {
    console.log('🔄 Iniciando migración con horarios personalizados...')

    // 1️⃣ Obtener todos los profesionales
    const { data: profesionales, error: errorProf } = await supabase
      .from('profesionales')
      .select('id, nombre')

    if (errorProf) {
      console.error('❌ Error obteniendo profesionales:', errorProf)
      return { success: false, error: errorProf }
    }

    if (!profesionales || profesionales.length === 0) {
      console.log('⚠️ No hay profesionales para migrar')
      return { success: false, error: 'No hay profesionales' }
    }

    console.log(`👥 Profesionales encontrados: ${profesionales.length}`)

    // 2️⃣ Crear plantillas para cada profesional
    let totalInsertados = 0

    for (const profesional of profesionales) {
      console.log(`\n👤 Migrando ${profesional.nombre}...`)

      // Recorrer cada día de la semana (0-6)
      for (const [diaSemana, horarios] of Object.entries(HORARIOS_PERSONALIZADOS)) {
        const dia = parseInt(diaSemana)
        
        if (horarios.length === 0) {
          console.log(`   ⏭️ Día ${dia}: Sin horarios configurados, saltando...`)
          continue
        }

        // Verificar si ya existe plantilla para este día
        const { data: existente } = await supabase
          .from('disponibilidad_horarios')
          .select('id')
          .eq('profesional_id', profesional.id)
          .eq('dia_semana', dia)
          .is('fecha', null)
          .eq('es_plantilla', true)
          .limit(1)

        if (existente && existente.length > 0) {
          console.log(`   ⏭️ Ya existe plantilla para día ${dia}, saltando...`)
          continue
        }

        // Insertar horarios para este día
        const registros = horarios.map(hora => ({
          profesional_id: profesional.id,
          dia_semana: dia,
          fecha: null,
          hora,
          activo: true,
          es_plantilla: true
        }))

        const { data: insertados, error } = await supabase
          .from('disponibilidad_horarios')
          .insert(registros)
          .select()

        if (error) {
          console.error(`   ❌ Error en día ${dia}:`, error)
          continue
        }

        console.log(`   ✅ Día ${dia}: ${insertados.length} horarios creados`)
        totalInsertados += insertados.length
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Migración completada exitosamente`)
    console.log(`📊 Total registros creados: ${totalInsertados}`)
    console.log('='.repeat(50))

    return { 
      success: true, 
      totalInsertados,
      profesionales: profesionales.length,
      diasMigrados: Object.values(HORARIOS_PERSONALIZADOS).filter(h => h.length > 0).length
    }

  } catch (error) {
    console.error('❌ Error en migración:', error)
    return { success: false, error: error.message || error }
  }
}

// ============================================
// LIMPIAR PLANTILLAS (para testing)
// ============================================
export const limpiarPlantillas = async () => {
  try {
    console.log('🧹 Limpiando plantillas...')

    const { error } = await supabase
      .from('disponibilidad_horarios')
      .delete()
      .eq('es_plantilla', true)

    if (error) throw error

    console.log('✅ Plantillas eliminadas')
    return { success: true }
  } catch (error) {
    console.error('❌ Error limpiando:', error)
    return { success: false, error }
  }
}

// ============================================
// COMPONENTE UI
// ============================================
export function MigrationPanel() {
  const [migrando, setMigrando] = useState(false)
  const [limpiando, setLimpiando] = useState(false)
  const [resultado, setResultado] = useState(null)

  const ejecutarMigracion = async () => {
    if (!window.confirm('⚠️ ¿Ejecutar migración?\n\nEsto convertirá tu configuración en plantillas semanales.\n\n✅ Esta acción solo debe hacerse UNA VEZ.')) {
      return
    }

    setMigrando(true)
    setResultado(null)

    const result = await migrarAPlantillas()
    
    setResultado(result)
    setMigrando(false)
  }

  const ejecutarLimpieza = async () => {
    if (!window.confirm('⚠️ ¿ELIMINAR todas las plantillas?\n\nEsto es solo para testing. Después deberás ejecutar la migración de nuevo.')) {
      return
    }

    setLimpiando(true)
    const result = await limpiarPlantillas()
    setLimpiando(false)

    if (result.success) {
      alert('✅ Plantillas eliminadas. Puedes migrar de nuevo.')
      setResultado(null)
    } else {
      alert('❌ Error al limpiar')
    }
  }

  // Preview de horarios
  const totalHorarios = Object.values(HORARIOS_PERSONALIZADOS).reduce((acc, h) => acc + h.length, 0)

  return (
    <div style={{ 
      maxWidth: '700px', 
      margin: '40px auto', 
      padding: '30px', 
      background: 'white', 
      borderRadius: '16px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
    }}>
      <h2 style={{ marginBottom: '10px', fontSize: '28px' }}>🔄 Migración a Sistema de Plantillas</h2>
      <p style={{ color: '#64748b', marginBottom: '25px' }}>
        Configura tus horarios semanales de forma permanente
      </p>

      {/* Preview de horarios */}
      <div style={{
        padding: '20px',
        background: '#f8fafc',
        borderRadius: '12px',
        marginBottom: '25px',
        border: '2px solid #e2e8f0'
      }}>
        <strong style={{ display: 'block', marginBottom: '15px', fontSize: '16px' }}>
          📋 Horarios que se crearán:
        </strong>
        <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
          {Object.entries(HORARIOS_PERSONALIZADOS).map(([dia, horarios]) => {
            const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
            return (
              <div key={dia} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: horarios.length > 0 ? '#e0f2fe' : '#fef2f2',
                borderRadius: '6px'
              }}>
                <span style={{ fontWeight: '600' }}>{dias[dia]}:</span>
                <span>{horarios.length > 0 ? `${horarios.length} turnos` : 'No trabaja'}</span>
              </div>
            )
          })}
        </div>
        <div style={{ 
          marginTop: '15px', 
          paddingTop: '15px', 
          borderTop: '2px solid #e2e8f0',
          fontWeight: '700',
          fontSize: '16px',
          color: '#0f172a'
        }}>
          Total: {totalHorarios} horarios por semana
        </div>
      </div>
      
      {/* Advertencia */}
      <div style={{ 
        padding: '20px', 
        background: '#fef3c7', 
        borderRadius: '12px', 
        marginBottom: '25px',
        border: '2px solid #fde68a'
      }}>
        <strong style={{ display: 'block', marginBottom: '10px' }}>⚠️ Importante:</strong>
        <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Esta migración solo debe ejecutarse <strong>UNA VEZ</strong></li>
          <li>Creará plantillas semanales para todos tus profesionales</li>
          <li>Puedes editar horarios después en "Horarios Semanales"</li>
          <li>No afecta turnos ya reservados</li>
        </ul>
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={ejecutarMigracion}
          disabled={migrando || limpiando}
          style={{
            flex: 1,
            padding: '16px',
            background: migrando ? '#cbd5e1' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '16px',
            cursor: migrando ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => !migrando && (e.target.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          {migrando ? '🔄 Migrando...' : '✅ Ejecutar Migración'}
        </button>

        <button
          onClick={ejecutarLimpieza}
          disabled={migrando || limpiando || !resultado}
          style={{
            padding: '16px 20px',
            background: limpiando ? '#cbd5e1' : '#fef2f2',
            color: '#dc2626',
            border: '2px solid #fecaca',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: (limpiando || !resultado) ? 'not-allowed' : 'pointer',
          }}
        >
          {limpiando ? '🧹 Limpiando...' : '🗑️ Limpiar'}
        </button>
      </div>

      {/* Resultado */}
      {resultado && (
        <div style={{
          padding: '20px',
          background: resultado.success ? '#d1fae5' : '#fee2e2',
          borderRadius: '12px',
          border: `2px solid ${resultado.success ? '#a7f3d0' : '#fecaca'}`,
          animation: 'fadeIn 0.3s'
        }}>
          <strong style={{ fontSize: '18px' }}>
            {resultado.success ? '✅ ¡Migración Exitosa!' : '❌ Error en Migración'}
          </strong>
          {resultado.success ? (
            <ul style={{ margin: '15px 0 0 20px', lineHeight: '1.8' }}>
              <li><strong>Profesionales migrados:</strong> {resultado.profesionales}</li>
              <li><strong>Días configurados:</strong> {resultado.diasMigrados}</li>
              <li><strong>Total horarios creados:</strong> {resultado.totalInsertados}</li>
            </ul>
          ) : (
            <div style={{ marginTop: '15px' }}>
              <p style={{ margin: '10px 0', color: '#7f1d1d' }}>
                <strong>Error:</strong> {resultado.error?.toString() || 'Error desconocido'}
              </p>
              <p style={{ margin: '10px 0', fontSize: '14px', color: '#991b1b' }}>
                💡 <strong>Tip:</strong> Verifica que hayas ejecutado el SQL en Supabase primero
              </p>
            </div>
          )}
        </div>
      )}

      {resultado?.success && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          background: '#eff6ff',
          borderRadius: '12px',
          border: '2px solid #bfdbfe'
        }}>
          <strong style={{ display: 'block', marginBottom: '10px', color: '#1e40af' }}>
            🎉 ¿Qué hacer ahora?
          </strong>
          <ol style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.8', color: '#1e40af' }}>
            <li>Ve a <strong>"Horarios Semanales"</strong> en el menú</li>
            <li>Revisa que los horarios se crearon correctamente</li>
            <li>Puedes editar, copiar o agregar más horarios</li>
            <li>¡Ya puedes borrar este link "Migración" del menú!</li>
          </ol>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}