import { useState } from 'react'
import './App.css'
import Header from './components/header'
import Sidebar from './components/sidebar'
import Menu from './components/menu'
import Footer from './components/footer'
import Tareas from './pages/Tareas'

function App() {
  const [view, setView] = useState('home')
  const [tasks] = useState([
    { id: 1, title: 'Revisar correos', status: 'Hoy' },
    { id: 2, title: 'Completar informe', status: 'Próximas' },
    { id: 3, title: 'Revisar diseño', status: 'Etiquetas' },
  ])

  return (
    <div className="app-shell">
      <Header onNuevaTarea={() => setView('tareas')} />
      <div className="app-content">
        <Sidebar />
        <main className="app-main">
          {view === 'tareas' ? (
            <Tareas />
          ) : (
            <>
              <Menu />
              <div className="task-list">
                {tasks.map((task) => (
                  <article key={task.id} className="task-card">
                    <h3>{task.title}</h3>
                    <p>{task.status}</p>
                  </article>
                ))}
              </div>
            </>
          )}
          <Menu />
          <div className="task-list">
            {tasks.map((task) => (
              <article key={task.id} className="task-card">
                <h3>{task.title}</h3>
                <p>{task.status}</p>
              </article>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default App
