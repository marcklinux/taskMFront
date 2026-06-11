import { useCallback, useEffect, useState } from 'react';
import { getPlans } from '../services/planService.js';
import { getTasks } from '../services/taskService.js';

const COMPLETED_TASKS_STORAGE_KEY = 'task-manager-completed-task-ids';

const getTaskId = (task) => task.id ?? task._id ?? task.taskId;

const getPlanId = (task) => task.planId ?? task.planID ?? task.plan?.id ?? task.plan?._id;

const getPlanTitle = (plan) =>
  plan.title ?? plan.name ?? plan.nombre ?? plan.description ?? plan.descripcion ?? 'Plan sin título';

const getStatusName = (task) =>
  task.status?.name ??
  task.status?.nombre ??
  task.statusName ??
  task.status ??
  task.estado ??
  'Sin status';

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

const normalizeTasks = (data) => {
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

const getStoredCompletedTaskIds = () => {
  try {
    const storedIds = JSON.parse(localStorage.getItem(COMPLETED_TASKS_STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(storedIds) ? storedIds : []);
  } catch {
    return new Set();
  }
};

const ListaDeTareas = () => {
  const [tasks, setTasks] = useState([]);
  const [plansById, setPlansById] = useState({});
  const [completedTaskIds, setCompletedTaskIds] = useState(getStoredCompletedTaskIds);
  const [saveMessage, setSaveMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [tasksData, plansData] = await Promise.all([getTasks(), getPlans()]);
      const normalizedPlans = normalizePlans(plansData);

      setTasks(normalizeTasks(tasksData));
      setPlansById(
        normalizedPlans.reduce((plansMap, plan) => {
          const planId = plan.id ?? plan._id ?? plan.planId;

          if (planId) {
            plansMap[String(planId)] = getPlanTitle(plan);
          }

          return plansMap;
        }, {}),
      );
    } catch (err) {
      setError(err.message || 'Error al cargar las tareas');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      await loadTasks();
    };

    fetchTasks();
  }, [loadTasks]);

  const toggleCompleted = (taskId) => {
    setSaveMessage(null);
    setCompletedTaskIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(taskId)) {
        nextIds.delete(taskId);
      } else {
        nextIds.add(taskId);
      }

      return nextIds;
    });
  };

  const handleSaveCompletedTasks = () => {
    localStorage.setItem(
      COMPLETED_TASKS_STORAGE_KEY,
      JSON.stringify(Array.from(completedTaskIds)),
    );
    setSaveMessage('Cambios guardados correctamente.');
  };

  return (
    <main>
      <section className="project-list">
        <div className="project-list-header">
          <div>
            <h1>Tareas</h1>
            <p>Consulta todas las tareas registradas.</p>
          </div>
          <div className="task-list-actions">
            <button type="button" className="btn btn-tertiary" onClick={loadTasks} disabled={loading}>
              Actualizar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveCompletedTasks}
              disabled={loading}
            >
              Guardar cambios
            </button>
          </div>
        </div>

        {saveMessage && <p style={{ color: 'green' }}>{saveMessage}</p>}
        {loading && <p>Cargando tareas...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && tasks.length === 0 && <p>No hay tareas disponibles.</p>}

        <div className="task-list">
          {tasks.map((task) => {
            const taskId = getTaskId(task);
            const planId = getPlanId(task);
            const planTitle = task.plan?.title ?? task.plan?.name ?? plansById[String(planId)];
            const taskKey = taskId ?? task.title ?? task.name;
            const isCompleted = completedTaskIds.has(taskKey);

            return (
              <article
                key={taskKey}
                className={`task-card ${isCompleted ? 'task-card-completed' : ''}`}
              >
                <div className="task-row">
                  <label className="task-checkbox">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleCompleted(taskKey)}
                    />
                    <span>Marcar tarea como completada</span>
                  </label>

                  <div className="task-card-content">
                    <div className="project-card-header">
                      <div>
                        <h3>{task.title ?? task.name ?? 'Tarea sin título'}</h3>
                        <p>{task.description ?? task.descripcion ?? 'Sin descripción'}</p>
                      </div>
                      <span className="task-status">{isCompleted ? 'Completada' : getStatusName(task)}</span>
                    </div>

                    <div className="project-cta">
                      <p>Plan: {planTitle ?? 'N/A'}</p>
                      <p>Fecha: {formatDate(task.taskDate ?? task.date ?? task.fechaTarea)}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default ListaDeTareas;
