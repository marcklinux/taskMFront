import { useEffect, useState } from 'react';
import { getPlans } from '../services/planService.js';

// Helpers para soportar respuestas con distintos nombres de propiedad.
const getPlanId = (plan) => plan.id ?? plan._id ?? plan.planId;

const getProjectId = (plan) =>
  plan.projectId ?? plan.proyectId ?? plan.projectID ?? plan.proyectoId;

const formatDate = (date) => {
  if (!date) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

// Normaliza diferentes estructuras de respuesta del backend.
const normalizePlans = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const ListaDePlanes = ({ onNuevaTarea, onEditarPlan }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Carga inicial de planes al montar la vista.
    const fetchPlans = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getPlans();
        setPlans(normalizePlans(data));
      } catch (err) {
        setError(err.message || 'No se pudo cargar la lista de planes.');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <main>
      <section className="project-list">
        <div className="project-list-header">
          <div>
            <h1>Planes</h1>
            <p>Consulta los planes existentes y crea tareas asociadas.</p>
          </div>
        </div>

        {loading && <p>Cargando planes...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && plans.length === 0 && <p>No hay planes disponibles.</p>}

        <div className="task-list">
          {plans.map((plan) => {
            const planId = getPlanId(plan);
            const projectId = getProjectId(plan);

            return (
              <article key={planId ?? plan.title ?? plan.name} className="task-card">
                <div className="project-card-header">
                  <div>
                    <h3>{plan.title ?? plan.name ?? 'Plan sin título'}</h3>
                    <p>{plan.description ?? plan.descripcion ?? 'Sin descripción'}</p>
                  </div>

                  <div className="project-card-actions">
                    <button
                      type="button"
                      className="btn btn-edit-project"
                      onClick={() => onEditarPlan?.(plan)}
                      disabled={!planId}
                    >
                      Actualizar plan
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-plan"
                      onClick={() => onNuevaTarea?.(planId)}
                      disabled={!planId}
                    >
                      + Nueva tarea
                    </button>
                  </div>
                </div>

                <div className="project-cta">
                  <p>Proyecto: {projectId ?? 'N/A'}</p>
                  <p>
                    Inicio: {formatDate(plan.startDate ?? plan.fechaInicio)} | Fin:{' '}
                    {formatDate(plan.endDate ?? plan.fechaFin)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default ListaDePlanes;
