import { useEffect, useState } from 'react';
import { getStatuses } from '../services/statusService.js';
import { getTasksByStatus } from '../services/taskService.js';

const getTaskId = (task) => task.id ?? task._id ?? task.taskId;

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

const TareasPorStatus = () => {
  const [statuses, setStatuses] = useState([]);
  const [selectedStatusId, setSelectedStatusId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatuses = async () => {
      setStatusesLoading(true);
      setError(null);

      try {
        const data = await getStatuses();
        setStatuses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los status.');
      } finally {
        setStatusesLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  const handleStatusChange = async (event) => {
    const statusId = event.target.value;
    setSelectedStatusId(statusId);
    setTasks([]);
    setError(null);

    if (!statusId) {
      return;
    }

    setTasksLoading(true);

    try {
      const data = await getTasksByStatus(statusId);
      setTasks(normalizeTasks(data));
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las tareas para ese status.');
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleClearFilter = () => {
    setSelectedStatusId('');
    setTasks([]);
    setError(null);
  };

  return (
    <main>
      <section className="project-list">
        <div className="project-list-header">
          <div>
            <h1>Tareas por status</h1>
            <p>Selecciona un status para consultar sus tareas.</p>
          </div>
        </div>

        <form className="page-form" onSubmit={(event) => event.preventDefault()}>
          <div>
            <label htmlFor="statusFilter">Status *</label>
            {statusesLoading ? (
              <p>Cargando status...</p>
            ) : (
              <select
                id="statusFilter"
                value={selectedStatusId}
                onChange={handleStatusChange}
                required
              >
                <option value="">Seleccione un status</option>
                {statuses.map((status) => (
                  <option
                    key={status.id ?? status._id ?? status.statusId}
                    value={status.id ?? status._id ?? status.statusId}
                  >
                    {status.name ?? status.nombre ?? status.description ?? status.descripcion}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-tertiary"
              onClick={handleClearFilter}
              disabled={tasksLoading || !selectedStatusId}
            >
              Limpiar filtro
            </button>
          </div>
        </form>

        {tasksLoading && <p>Cargando tareas...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!tasksLoading && !error && selectedStatusId && tasks.length === 0 && (
          <p>No hay tareas para el status seleccionado.</p>
        )}

        <div className="task-list">
          {tasks.map((task) => {
            const taskId = getTaskId(task);

            return (
              <article key={taskId ?? task.title ?? task.name} className="task-card">
                <div className="project-card-header">
                  <div>
                    <h3>{task.title ?? task.name ?? 'Tarea sin título'}</h3>
                    <p>{task.description ?? task.descripcion ?? 'Sin descripción'}</p>
                  </div>
                  <span className="task-status">{getStatusName(task)}</span>
                </div>
                <div className="project-cta">
                  <p>Fecha: {formatDate(task.taskDate ?? task.date ?? task.fechaTarea)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default TareasPorStatus;
