import './sidebar.css'

const Sidebar = () => {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-section">
        <h2>Panel</h2>
        <nav>
          <a href="#today">Hoy</a>
          <a href="#upcoming">Próximas</a>
          <a href="#completed">Completadas</a>
        </nav>
      </div>
      <div className="sidebar-section">
        <h3>Estadísticas</h3>
        <ul>
          <li>
            <span>Tareas activas</span>
            <strong>8</strong>
          </li>
          <li>
            <span>Completadas</span>
            <strong>12</strong>
          </li>
          <li>
            <span>Proyectos</span>
            <strong>3</strong>
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar
