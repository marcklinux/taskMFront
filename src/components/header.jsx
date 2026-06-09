import React from 'react'
import './header.css'

const Header = ({ onNuevaTarea }) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <h1>Task Manager</h1>
        <p>Organiza tus tareas y mantente productivo</p>
      </div>
      <div className="header-actions">
        <button type="button" className="btn btn-primary" onClick={onNuevaTarea}>
          + Nueva tarea
        </button>
      </div>
    </header>
  )
}

export default Header