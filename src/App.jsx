import { useState } from 'react'
import './App.css'
import Header from './components/header'
import Sidebar from './components/sidebar'
import Menu from './components/menu'
import Footer from './components/footer'
import Tareas from './pages/Tareas'
import Proyecto from './pages/Proyecto'
import CrearProyecto from './pages/CrearProyecto'
import CrearPlan from './pages/CrearPlan'

function App() {
  const [view, setView] = useState('home')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [flashMessage, setFlashMessage] = useState(null)
  const [tasks] = useState([
    { id: 1, title: 'Revisar correos', status: 'Hoy' },
    { id: 2, title: 'Completar informe', status: 'Próximas' },
    { id: 3, title: 'Revisar diseño', status: 'Etiquetas' },
  ])

  const handleMostrarTareas = (planId = '') => {
    setSelectedPlanId(planId)
    setView('tareas')
  }

  const handleMostrarNuevoProyecto = () => {
    setSelectedProjectId('')
    setView('nuevoProyecto')
  }

  const handleMostrarProyectos = () => {
    setView('home')
  }

  const handleProjectCreated = (projectId) => {
    setSelectedProjectId(projectId)
    setView('home')
    setFlashMessage('Proyecto creado correctamente.')
    setTimeout(() => setFlashMessage(null), 3000)
  }

  const handleMostrarNuevoPlan = (projectId) => {
    setSelectedProjectId(projectId)
    setView('nuevoPlan')
  }

  const handlePlanCreated = (planId) => {
    setSelectedPlanId(planId)
    setView('home')
    setFlashMessage('Plan creado correctamente.')
    setTimeout(() => setFlashMessage(null), 3000)
  }

  return (
    <div className="app-shell">
      <Header
        onVerProyectos={handleMostrarProyectos}
        onNuevoProyecto={handleMostrarNuevoProyecto}
        onNuevaTarea={() => handleMostrarTareas()}
      />
      <div className="app-content">
        <Sidebar />
        <main className="app-main">
          {flashMessage && <div className="flash-message">{flashMessage}</div>}
          {view === 'tareas' ? (
            <Tareas initialPlanId={selectedPlanId} />
          ) : view === 'nuevoProyecto' ? (
            <CrearProyecto onCreated={handleProjectCreated} />
          ) : view === 'nuevoPlan' ? (
            <CrearPlan projectId={selectedProjectId} onCreated={handlePlanCreated} />
          ) : (
            <>
              <Menu />
              <Proyecto onAgregarPlan={handleMostrarNuevoPlan} onNuevoProyecto={handleMostrarNuevoProyecto} />
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default App
