import { useState } from 'react'
import './App.css'
import Header from './components/header'
import Footer from './components/footer'
import CrearTareas from './pages/CrearTareas'
import ListaDeProyectos from './pages/ListaDeProyectos'
import CrearProyecto from './pages/CrearProyecto'
import EditarProyecto from './pages/EditarProyecto'
import CrearPlan from './pages/CrearPlan'
import ListaDePlanes from './pages/ListaDePlanes'
import ListaDeTareas from './pages/ListaDeTareas'

function App() {
  const [view, setView] = useState('home')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [flashMessage, setFlashMessage] = useState(null)

  const handleMostrarCrearTareas = (planId = '') => {
    setSelectedPlanId(planId)
    setView('crearTareas')
  }

  const handleMostrarNuevoProyecto = () => {
    setSelectedProjectId('')
    setSelectedProject(null)
    setView('nuevoProyecto')
  }

  const handleMostrarProyectos = () => {
    setSelectedProject(null)
    setView('home')
  }

  const handleMostrarPlanes = () => {
    setView('planes')
  }

  const handleMostrarListaTareas = () => {
    setView('listaTareas')
  }

  const handleProjectCreated = (projectId) => {
    setSelectedProjectId(projectId)
    setSelectedProject(null)
    setView('home')
    setFlashMessage('Proyecto creado correctamente.')
    setTimeout(() => setFlashMessage(null), 3000)
  }

  const handleMostrarEditarProyecto = (project) => {
    setSelectedProject(project)
    setSelectedProjectId(project.id ?? project._id ?? project.projectId)
    setView('editarProyecto')
  }

  const handleProjectUpdated = () => {
    setSelectedProject(null)
    setView('home')
    setFlashMessage('Proyecto actualizado correctamente.')
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
        onVerPlanes={handleMostrarPlanes}
        onVerTareas={handleMostrarListaTareas}
        onNuevoProyecto={handleMostrarNuevoProyecto}
        onNuevaTarea={() => handleMostrarCrearTareas()}
      />
      <div className="app-content">
        <main className="app-main">
          {flashMessage && <div className="flash-message">{flashMessage}</div>}
          {view === 'planes' ? (
            <ListaDePlanes onNuevaTarea={handleMostrarCrearTareas} />
          ) : view === 'listaTareas' ? (
            <ListaDeTareas />
          ) : view === 'crearTareas' ? (
            <CrearTareas initialPlanId={selectedPlanId} />
          ) : view === 'nuevoProyecto' ? (
            <CrearProyecto onCreated={handleProjectCreated} />
          ) : view === 'editarProyecto' ? (
            <EditarProyecto
              key={selectedProjectId}
              project={selectedProject}
              onUpdated={handleProjectUpdated}
              onCancel={handleMostrarProyectos}
            />
          ) : view === 'nuevoPlan' ? (
            <CrearPlan projectId={selectedProjectId} onCreated={handlePlanCreated} />
          ) : (
            <ListaDeProyectos
              onAgregarPlan={handleMostrarNuevoPlan}
              onEditarProyecto={handleMostrarEditarProyecto}
              onNuevoProyecto={handleMostrarNuevoProyecto}
            />
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default App
