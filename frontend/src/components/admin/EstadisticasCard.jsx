import '../../styles/admin/DashboardAdmin.css'

function EstadisticasCard({ titulo, valor, icono, color, trend }) {
  return (
    <div className="estadistica-card" style={{ '--stat-color': color }}>
      <div className="estadistica-header">
        <div className="estadistica-icono">
          {icono}
        </div>
        {trend && (
          <div className={`estadistica-trend ${trend > 0 ? 'up' : 'down'}`}>
            {trend > 0 ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="estadistica-contenido">
        <div className="estadistica-valor">{valor}</div>
        <div className="estadistica-titulo">{titulo}</div>
      </div>
      <div className="estadistica-fondo">
        {icono}
      </div>
    </div>
  )
}

export default EstadisticasCard