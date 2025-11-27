import { useState, useEffect } from 'react'
import { estaAutenticado } from '../services/authService'
import LoginAdmin from '../components/admin/LoginAdmin'
import NavbarAdmin from '../components/admin/NavbarAdmin'
import DashboardAdmin from '../components/admin/DashboardAdmin'
import TurnosLista from '../components/admin/TurnosLista'
import GestionProfesionales from '../components/admin/GestionProfesionales'
import GestionBloqueos from '../components/admin/GestionBloqueos'
import CalendarioDIsponibilidad from '../components/admin/CalendarioDIsponibilidad'
import HorariosSemanales from '../components/admin/HorariosSemanales'
import EstadisticasAvanzadas from '../components/admin/EstadisticasAvanzadas'
import Configuracion from '../components/admin/Configuracion'

function AdminPanel() {
  const [autenticado, setAutenticado] = useState(false)
  // 🔥 PERSISTENCIA: Leer desde localStorage o default 'dashboard'
  const [vistaActiva, setVistaActiva] = useState(() => {
    return localStorage.getItem('admin_vista_activa') || 'dashboard'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const estaLogueado = estaAutenticado()
    setAutenticado(estaLogueado)
    setLoading(false)
  }, [])

  // 🔥 PERSISTENCIA: Guardar vista activa en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('admin_vista_activa', vistaActiva)
  }, [vistaActiva])

  const handleLoginSuccess = (session) => {
    setAutenticado(true)
    // Al hacer login, ir al dashboard
    setVistaActiva('dashboard')
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div className="spinner" style={{
          width: '48px',
          height: '48px',
          border: '4px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
      </div>
    )
  }

  if (!autenticado) {
    return <LoginAdmin onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="admin-panel">
      <NavbarAdmin 
        vistaActiva={vistaActiva}
        onCambiarVista={setVistaActiva}
      />
      
      <main className="admin-content">
        {vistaActiva === 'dashboard' && <DashboardAdmin />}
        {vistaActiva === 'turnos' && <TurnosLista />}
        {vistaActiva === 'profesionales' && <GestionProfesionales />}
        {vistaActiva === 'horarios' && <HorariosSemanales />}
        {vistaActiva === 'disponibilidad' && <CalendarioDIsponibilidad />}
        {vistaActiva === 'bloqueos' && <GestionBloqueos />}
        {vistaActiva === 'estadisticas' && <EstadisticasAvanzadas />}
        {vistaActiva === 'configuracion' && <Configuracion />}
      </main>
    </div>
  )
}

export default AdminPanel