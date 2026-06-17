import './header.css'

const Header = ({
  onVerProyectos,
  onVerPlanes,
  onVerTareas,
  onVerTareasPorStatus,
  onVerTareasSemanales,
  onVerReporteSemanal,
  onNuevaTarea,
  onNuevoProyecto,
  onNuevoPlan,
}) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <h1>Task Manager</h1>
        <p>Organiza tus tareas y mantente productivo</p>
      </div>
      <div className="header-actions">
        <button type="button" className="btn btn-tertiary" onClick={onVerProyectos}>
          Listado de proyectos
        </button>
        <button type="button" className="btn btn-tertiary" onClick={onVerPlanes}>
          Planes
        </button>
        <button type="button" className="btn btn-tertiary" onClick={onVerTareas}>
          Listado de tareas
        </button>
        <button type="button" className="btn btn-tertiary" onClick={onVerTareasPorStatus}>
          Tareas por status
        </button>
        <button type="button" className="btn btn-tertiary" onClick={onVerTareasSemanales}>
          Tareas semanales
        </button>
        <button type="button" className="btn btn-tertiary" onClick={onVerReporteSemanal}>
          Reporte semanal
        </button>
        <button type="button" className="btn btn-secondary" onClick={onNuevoProyecto}>
          + Crear proyecto
        </button>
        <button type="button" className="btn btn-secondary" onClick={onNuevoPlan}>
          + Agregar plan
        </button>
        <button type="button" className="btn btn-primary" onClick={onNuevaTarea}>
          + Crear tarea
        </button>
      </div>
    </header>
  )
}

export default Header
