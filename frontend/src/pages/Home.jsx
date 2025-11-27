import { useState } from 'react'
import Hero from '../components/Hero'
import SeleccionProfesional from '../components/SeleccionProfesional'
import Calendario from '../components/Calendario'
import HorariosDisponibles from '../components/HorariosDisponibles'
import FormularioTurno from '../components/FormularioTurno'
import ModalConfirmacion from '../components/ModalConfirmacion'
import Footer from '../components/Footer'

function Home() {
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null)
  const [turnoConfirmado, setTurnoConfirmado] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // ⭐ NUEVO

  const handleTurnoCreado = (turno) => {
    setTurnoConfirmado(turno)
    setMostrarModal(true)
    setRefreshKey(prev => prev + 1) // ⭐ Incrementar para refrescar horarios
    setHorarioSeleccionado(null) // ⭐ Limpiar selección
  }

  const handleCerrarModal = () => {
    setMostrarModal(false)
    // Scroll al calendario después de cerrar
    setTimeout(() => {
      const calendario = document.getElementById('calendario')
      if (calendario) {
        calendario.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
  }

  return (
    <>
      <Hero />
      
      <SeleccionProfesional 
        onSeleccionar={setProfesionalSeleccionado}
        profesionalSeleccionado={profesionalSeleccionado}
      />
      
      <Calendario 
        profesionalSeleccionado={profesionalSeleccionado}
        onSeleccionarFecha={setFechaSeleccionada}
        fechaSeleccionada={fechaSeleccionada}
      />
      
      <HorariosDisponibles 
        profesionalSeleccionado={profesionalSeleccionado}
        fechaSeleccionada={fechaSeleccionada}
        onSeleccionarHorario={setHorarioSeleccionado}
        horarioSeleccionado={horarioSeleccionado}
        refreshKey={refreshKey} // ⭐ NUEVO - Pasar prop para refrescar
      />

      <FormularioTurno 
        profesionalSeleccionado={profesionalSeleccionado}
        fechaSeleccionada={fechaSeleccionada}
        horarioSeleccionado={horarioSeleccionado}
        onTurnoCreado={handleTurnoCreado}
      />

      <Footer />

      {mostrarModal && turnoConfirmado && (
        <ModalConfirmacion 
          turno={turnoConfirmado}
          profesional={profesionalSeleccionado}
          onCerrar={handleCerrarModal}
        />
      )}
    </>
  )
}

export default Home