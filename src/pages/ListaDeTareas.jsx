import { useCallback, useEffect, useState } from 'react';
import { getPlans } from '../services/planService.js';
import { getTasks, updateTask } from '../services/taskService.js';

const COMPLETED_STATUS_ID = 4;

const getTaskId = (task) => task.id ?? task._id ?? task.taskId;

const getPlanId = (task) => task.planId ?? task.planID ?? task.plan?.id ?? task.plan?._id;

const getStatusId = (task) =>
  task.statusId ?? task.status?.id ?? task.status?._id ?? task.status?.statusId;

// Una tarea se considera finalizada cuando su statusId es 4.
const isCompletedTask = (task) => Number(getStatusId(task)) === COMPLETED_STATUS_ID;

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

// Normaliza estructuras de respuesta (array directo, content o data).
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

const ListaDeTareas = ({ onEditarTarea }) => {
  const [tasks, setTasks] = useState([]);
  const [plansById, setPlansById] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carga tareas + planes para mostrar nombre de plan y estado de cada tarea.
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatusMessage(null);
    setIsToastVisible(false);

    try {
      const [tasksData, plansData] = await Promise.all([getTasks(), getPlans()]);
      const normalizedPlans = normalizePlans(plansData);

      setTasks(normalizeTasks(tasksData).filter((task) => !isCompletedTask(task)));
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

  useEffect(() => {
    // Controla la animación del toast de confirmación y su limpieza automática.
    if (!statusMessage) {
      return;
    }

    const hideTimerId = setTimeout(() => {
      setIsToastVisible(false);
    }, 2200);

    const clearTimerId = setTimeout(() => {
      setStatusMessage(null);
    }, 2600);

    return () => {
      clearTimeout(hideTimerId);
      clearTimeout(clearTimerId);
    };
  }, [statusMessage]);

  const handleCompleteTask = async (task) => {
    const taskId = getTaskId(task);

    if (!taskId) {
      return;
    }

    setUpdatingTaskId(taskId);
    setError(null);
    setStatusMessage(null);

    try {
      // Se actualiza el status en backend y luego se elimina de la lista local.
      const taskPayload = {
        title: task.title ?? task.name ?? '',
        description: task.description ?? task.descripcion ?? '',
        planId: Number(getPlanId(task)),
        taskDate: task.taskDate ?? task.date ?? task.fechaTarea ?? undefined,
        statusId: COMPLETED_STATUS_ID,
      };

      await updateTask(taskId, taskPayload);
      setTasks((currentTasks) => currentTasks.filter((currentTask) => getTaskId(currentTask) !== taskId));
      setIsToastVisible(true);
      setStatusMessage('Tarea finalizada correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la tarea.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <main>
      {statusMessage && (
        <div className={`task-toast ${isToastVisible ? 'task-toast-visible' : 'task-toast-hidden'}`}>
          {statusMessage}
        </div>
      )}
      <section className="project-list">
        <div className="project-list-header">
          <div>
            <h1>Tareas</h1>
            <p>Consulta tareas pendientes y márcalas como finalizadas.</p>
          </div>
          <div className="task-list-actions">
            <button type="button" className="btn btn-tertiary" onClick={loadTasks} disabled={loading}>
              Actualizar
            </button>
          </div>
        </div>

        {loading && <p>Cargando tareas...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && tasks.length === 0 && <p>No hay tareas disponibles.</p>}

        <div className="task-list">
          {tasks.map((task) => {
            const taskId = getTaskId(task);
            const planId = getPlanId(task);
            const planTitle = task.plan?.title ?? task.plan?.name ?? plansById[String(planId)];
            const taskKey = taskId ?? task.title ?? task.name;

            return (
              <article key={taskKey} className="task-card">
                <div className="task-row">
                  <label className="task-checkbox">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => handleCompleteTask(task)}
                      disabled={!taskId || updatingTaskId === taskId}
                    />
                    <span>Marcar tarea como finalizada</span>
                  </label>

                  <div className="task-card-content">
                    <div className="project-card-header">
                      <div>
                        <h3>{task.title ?? task.name ?? 'Tarea sin título'}</h3>
                        <p>{task.description ?? task.descripcion ?? 'Sin descripción'}</p>
                      </div>
                      <div className="project-card-actions">
                        <span className="task-status">{getStatusName(task)}</span>
                        <button
                          type="button"
                          className="btn btn-edit-project"
                          onClick={() => onEditarTarea?.(task)}
                          disabled={!taskId || updatingTaskId === taskId}
                        >
                          Actualizar tarea
                        </button>
                      </div>
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
