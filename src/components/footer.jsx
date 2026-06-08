import React from 'react'
import './footer.css'

const Footer = () => {
  return (
    <footer className="app-footer">
      <p>© 2026 Task Manager. Hecho con React.</p>
      <div className="footer-links">
        <a href="#privacy">Privacidad</a>
        <a href="#terms">Términos</a>
      </div>
    </footer>
  )
}

export default Footer