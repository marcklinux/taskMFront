import { useEffect, useState } from 'react';
import { getProjects } from '../services/projectService.js';

const ListaDeProyectos = ({ onAgregarPlan, onEditarProyecto, onNuevoProyecto }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getProjects();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'No se pudo cargar la lista de proyectos.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <main>
      <section className="project-list">
        <div className="project-list-header">
          <div>
            <h1>Listado de proyectos</h1>
            <p>Consulta tus proyectos, edítalos o agrega planes asociados.</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onNuevoProyecto}>
            + Crear proyecto
          </button>
        </div>
        {loading && <p>Cargando proyectos...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && projects.length === 0 && <p>No hay proyectos disponibles.</p>}
        <div className="task-list">
          {projects.map((project) => (
            <article key={project.id ?? project._id ?? project.name} className="task-card">
              <div className="project-card-header">
                <div>
                  <h3>{project.name ?? project.nombre ?? 'Proyecto sin nombre'}</h3>
                  <p>{project.description ?? project.descripcion ?? 'Sin descripción'}</p>
                  <p>Estado:{project.status.name}</p>
                </div>
                <div className="project-card-actions">
                  <button
                    type="button"
                    className="btn btn-edit-project"
                    onClick={() => onEditarProyecto(project)}
                  >
                    Editar proyecto
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-plan"
                    onClick={() => onAgregarPlan(project.id ?? project._id)}
                  >
                    + Agregar plan
                  </button>
                </div>
              </div>
              <div className="project-cta">
                <p>Agrega planes para organizar las tareas de este proyecto.</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ListaDeProyectos;
