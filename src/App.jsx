import { useState } from 'react'
import './App.css'
import Header from './components/header'
import Footer from './components/footer'
import CrearTareas from './pages/CrearTareas'
import ListaDeProyectos from './pages/ListaDeProyectos'
import CrearProyecto from './pages/CrearProyecto'
import EditarProyecto from './pages/EditarProyecto'
import CrearPlan from './pages/CrearPlan'
import EditarPlan from './pages/EditarPlan'
import ListaDePlanes from './pages/ListaDePlanes'
import ListaDeTareas from './pages/ListaDeTareas'
import EditarTarea from './pages/EditarTarea'

// Normaliza el identificador del proyecto porque el backend puede devolver
// distintos nombres de propiedad según el endpoint.
const getProjectId = (project) =>
  project?.id ?? project?._id ?? project?.projectId ?? project?.proyectId ?? project?.projectID

const getPlanId = (plan) => plan?.id ?? plan?._id ?? plan?.planId

const getTaskId = (task) => task?.id ?? task?._id ?? task?.taskId

function App() {
  // Controla la "vista" activa sin usar router (navegación interna simple).
  const [view, setView] = useState('home')
  // IDs/objetos seleccionados para prellenar formularios o editar registros.
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  // Mensaje temporal para confirmar acciones al usuario.
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
    setSelectedPlan(null)
    setView('planes')
  }

  const handleMostrarListaTareas = () => {
    setSelectedTask(null)
    setView('listaTareas')
  }

  const handleProjectCreated = (projectId) => {
    setSelectedProjectId(projectId)
    setSelectedProject(null)
    setView('home')
    // El mensaje se limpia automáticamente para no dejar estado "pegado".
    setFlashMessage('Proyecto creado correctamente.')
    setTimeout(() => setFlashMessage(null), 3000)
  }

  const handleMostrarEditarProyecto = (project) => {
    setSelectedProject(project)
    setSelectedProjectId(getProjectId(project))
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

  const handleMostrarEditarPlan = (plan) => {
    setSelectedPlan(plan)
    setSelectedPlanId(getPlanId(plan))
    setView('editarPlan')
  }

  const handlePlanCreated = (planId) => {
    setSelectedPlanId(planId)
    setView('planes')
    setFlashMessage('Plan creado correctamente.')
    setTimeout(() => setFlashMessage(null), 3000)
  }

  const handlePlanUpdated = () => {
    setSelectedPlan(null)
    setView('planes')
    setFlashMessage('Plan actualizado correctamente.')
    setTimeout(() => setFlashMessage(null), 3000)
  }

  const handleMostrarEditarTarea = (task) => {
    setSelectedTask(task)
    setSelectedTaskId(getTaskId(task))
    setView('editarTarea')
  }

  const handleTaskUpdated = () => {
    setSelectedTask(null)
    setView('listaTareas')
    setFlashMessage('Tarea actualizada correctamente.')
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
          {/* Render condicional de pantallas según la vista activa */}
          {view === 'planes' ? (
            <ListaDePlanes
              onNuevaTarea={handleMostrarCrearTareas}
              onEditarPlan={handleMostrarEditarPlan}
            />
          ) : view === 'listaTareas' ? (
            <ListaDeTareas onEditarTarea={handleMostrarEditarTarea} />
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
          ) : view === 'editarPlan' ? (
            <EditarPlan
              key={selectedPlanId}
              plan={selectedPlan}
              onUpdated={handlePlanUpdated}
              onCancel={handleMostrarPlanes}
            />
          ) : view === 'editarTarea' ? (
            <EditarTarea
              key={selectedTaskId}
              task={selectedTask}
              onUpdated={handleTaskUpdated}
              onCancel={handleMostrarListaTareas}
            />
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
