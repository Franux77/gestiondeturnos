import { useState, useEffect } from 'react'
import '../styles/Hero.css'
import { scrollSuave } from '../utils/helpers'

function Hero() {
  const [theme, setTheme] = useState('light')
  const [mostrarTexto, setMostrarTexto] = useState(false)

  useEffect(() => {
    // Animación de entrada del texto
    setTimeout(() => setMostrarTexto(true), 300)
    
    // Detectar preferencia de tema del sistema
    const preferenciaTema = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (preferenciaTema) {
      setTheme('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const nuevoTema = theme === 'light' ? 'dark' : 'light'
    setTheme(nuevoTema)
    document.documentElement.setAttribute('data-theme', nuevoTema)
  }

  const handleReservar = () => {
    scrollSuave('profesionales')
  }

  return (
    <section className="hero">
      {/* Botón de tema (arriba a la derecha) */}
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label="Cambiar tema"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Fondo con efecto degradado animado */}
      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Contenido principal */}
      <div className="hero-content">
        <div className={`hero-text ${mostrarTexto ? 'visible' : ''}`}>
          <div className="badge">
            <span className="badge-dot"></span>
            Reservas Online 24/7
          </div>
          
          <h1 className="hero-title">
            Tu estilo,
            <span className="hero-title-highlight"> tu momento</span>
          </h1>
          
          <p className="hero-subtitle">
            Reservá tu turno en segundos. Sin llamadas, sin esperas.
            Elegí tu profesional favorito y el horario que mejor te quede.
          </p>

          <div className="hero-buttons">
            <button 
              className="btn-primary"
              onClick={handleReservar}
            >
              <span>Reservar Turno</span>
              <svg 
                className="btn-icon" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
            </button>

            <button 
              className="btn-secondary"
              onClick={() => scrollSuave('footer')}
            >
              <svg 
                className="btn-icon" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                />
              </svg>
              <span>Contacto</span>
            </button>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Clientes Felices</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <div className="stat-number">2+</div>
              <div className="stat-label">Profesionales</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <div className="stat-number">4.9★</div>
              <div className="stat-label">Valoración</div>
            </div>
          </div>
        </div>

        {/* Imagen decorativa (opcional) */}
        <div className="hero-image">
          <div className="image-placeholder">
            <svg viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" stroke="var(--primary)" strokeWidth="2" opacity="0.2"/>
              <circle cx="100" cy="100" r="60" stroke="var(--primary)" strokeWidth="2" opacity="0.4"/>
              <circle cx="100" cy="100" r="40" fill="var(--primary)" opacity="0.6"/>
              <path d="M100 60 L80 120 L120 120 Z" fill="var(--bg-primary)" opacity="0.9"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <div className="scroll-mouse">
          <div className="scroll-wheel"></div>
        </div>
        <span>Deslizá para reservar</span>
      </div>
    </section>
  )
}

export default Hero