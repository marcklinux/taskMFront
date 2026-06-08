import { useState } from 'react'
import './App.css'
import Header from './components/header'
import Sidebar from './components/sidebar'
import Menu from './components/menu'
import Footer from './components/footer'

function App() {
  const [tasks] = useState([
    { id: 1, title: 'Revisar correos', status: 'Hoy' },
    { id: 2, title: 'Completar informe', status: 'Próximas' },
    { id: 3, title: 'Revisar diseño', status: 'Etiquetas' },
  ])

  return (
    <div className="app-shell">
      <Header />
      <div className="app-content">
        <Sidebar />
        <main className="app-main">
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
