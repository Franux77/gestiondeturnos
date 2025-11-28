import { useState, useEffect, useRef } from 'react'
import { logout, obtenerSesion } from '../../services/authService'
import '../../styles/admin/NavbarAdmin.css'

function NavbarAdmin({ vistaActiva, onCambiarVista }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const navbarRef = useRef(null)
  const session = obtenerSesion()

  // Ajustar posición del menú móvil
  useEffect(() => {
    const adjustMenuPosition = () => {
      if (navbarRef.current) {
        const navbarHeight = navbarRef.current.offsetHeight
        const mobileMenu = document.querySelector('.navbar-menu.mobile')
        const overlay = document.querySelector('.navbar-overlay')
        
        if (mobileMenu) {
          mobileMenu.style.top = `${navbarHeight}px`
          mobileMenu.style.height = `calc(100vh - ${navbarHeight}px)`
        }
        
        if (overlay) {
          overlay.style.top = `${navbarHeight}px`
          overlay.style.height = `calc(100vh - ${navbarHeight}px)`
        }
      }
    }

    adjustMenuPosition()
    window.addEventListener('resize', adjustMenuPosition)
    
    return () => {
      window.removeEventListener('resize', adjustMenuPosition)
    }
  }, [])

  // Controlar el scroll del body cuando se abre/cierra el menú
  useEffect(() => {
    if (menuAbierto) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
    
    return () => {
      document.body.classList.remove('menu-open')
    }
  }, [menuAbierto])

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      logout()
    }
  }

  const vistas = [
    {
      id: 'dashboard',
      nombre: 'Dashboard',
      icono: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'turnos',
      nombre: 'Turnos',
      icono: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'disponibilidad',
      nombre: 'Disponibilidad',
      icono: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  
  {
    id: 'horarios',
  nombre: 'Horarios Semanales',
  icono: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M8 7V3m8 4V3M5 10h14M5 21h14a2 2 0 002-2v-9a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z" 
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M7 14h4M7 17h2M13 14h4M15 17h2" 
      />
    </svg>
  )
},

    {
      id: 'profesionales',
      nombre: 'Profesionales',
      icono: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'estadisticas',
      nombre: 'Estadísticas',
      icono: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'configuracion',
      nombre: 'Configuración',
      icono: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  return (
    <nav className="navbar-admin" ref={navbarRef}>
      <div className="navbar-container">
        {/* Logo y Título */}
        <div className="navbar-brand">
          <div className="navbar-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
          </div>
          <div className="navbar-title">
            <h1>Panel Admin</h1>
            <span className="navbar-subtitle">Gestión de Turnos</span>
          </div>
        </div>

        {/* Navegación Desktop */}
        <div className="navbar-menu desktop">
          {vistas.map(vista => (
            <button
              key={vista.id}
              className={`navbar-item ${vistaActiva === vista.id ? 'active' : ''}`}
              onClick={() => onCambiarVista(vista.id)}
            >
              {vista.icono}
              <span>{vista.nombre}</span>
              {vista.badge && <span className="navbar-badge">{vista.badge}</span>}
            </button>
          ))}
        </div>

        {/* Usuario y Logout */}
        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="user-details">
              <span className="user-name">{session?.username || 'Admin'}</span>
              <span className="user-role">Administrador</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* Botón Mobile Menu */}
        <button
          className="navbar-toggle mobile"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Menú Mobile */}
      {menuAbierto && (
        <>
          <div className="navbar-overlay" onClick={() => setMenuAbierto(false)}></div>
          <div className="navbar-menu mobile">
            {vistas.map(vista => (
              <button
                key={vista.id}
                className={`navbar-item ${vistaActiva === vista.id ? 'active' : ''}`}
                onClick={() => {
                  onCambiarVista(vista.id)
                  setMenuAbierto(false)
                }}
              >
                {vista.icono}
                <span>{vista.nombre}</span>
                {vista.badge && <span className="navbar-badge">{vista.badge}</span>}
              </button>
            ))}
            <button className="navbar-item logout" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </>
      )}
    </nav>
  )
}

export default NavbarAdmin