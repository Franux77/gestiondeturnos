import { useState, useEffect } from 'react'
import { obtenerTurnos } from '../../services/adminService'
import FiltrosTurnos from './FiltrosTurnos'
import TablaTurnos from './TablaTurnos'
import ModalEditarTurno from './ModalEditarTurno'
import '../../styles/admin/TurnosLista.css'

function TurnosLista() {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    profesional_id: '',
    fecha_desde: '',
    fecha_hasta: ''
  })
  const [turnoEditar, setTurnoEditar] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  useEffect(() => {
    cargarTurnos()
  }, [filtros])

  const cargarTurnos = async () => {
    setLoading(true)
    const { data, error } = await obtenerTurnos(filtros)
    
    if (!error && data) {
      setTurnos(data)
    }
    
    setLoading(false)
  }

  const handleCambiarFiltros = (nuevosFiltros) => {
    setFiltros(nuevosFiltros)
  }

  const handleLimpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      estado: '',
      profesional_id: '',
      fecha_desde: '',
      fecha_hasta: ''
    })
  }

  const handleEditar = (turno) => {
    setTurnoEditar(turno)
    setMostrarModal(true)
  }

  const handleCerrarModal = () => {
    setMostrarModal(false)
    setTurnoEditar(null)
  }

  const handleActualizar = () => {
    cargarTurnos()
  }

  return (
    <div className="turnos-lista-container">
      {/* Header */}
      <div className="lista-header">
        <div>
          <h1 className="lista-titulo">Gestión de Turnos</h1>
          <p className="lista-subtitulo">
            Administrá todos los turnos del sistema
          </p>
        </div>
        <div className="lista-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{turnos.length}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <FiltrosTurnos 
        filtros={filtros}
        onCambiarFiltros={handleCambiarFiltros}
        onLimpiarFiltros={handleLimpiarFiltros}
      />

      {/* Tabla */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando turnos...</p>
        </div>
      ) : (
        <TablaTurnos 
          turnos={turnos}
          onActualizar={handleActualizar}
          onEditar={handleEditar}
        />
      )}

      {/* Modal Editar */}
      {mostrarModal && turnoEditar && (
        <ModalEditarTurno
          turno={turnoEditar}
          onCerrar={handleCerrarModal}
          onActualizar={handleActualizar}
        />
      )}
    </div>
  )
}

export default TurnosLista