import { useEffect, useState } from 'react';
import { getPlans } from '../services/planService.js';
import { getStatuses } from '../services/statusService.js';
import { updateTask } from '../services/taskService.js';

const getTaskId = (task) => task?.id ?? task?._id ?? task?.taskId;

const getPlanId = (task) => task?.planId ?? task?.planID ?? task?.plan?.id ?? task?.plan?._id ?? '';

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

const formatInputDate = (date) => {
  if (!date) {
    return '';
  }

  return String(date).slice(0, 10);
};

const normalizeStatusId = (task) =>
  task?.statusId ?? task?.status?.id ?? task?.status?._id ?? task?.status?.statusId ?? '';

const getPlanTitle = (plan) =>
  plan.title ?? plan.name ?? plan.nombre ?? plan.description ?? plan.descripcion ?? 'Plan sin título';

const EditarTarea = ({ task, onUpdated, onCancel }) => {
  const [title, setTitle] = useState(task?.title ?? task?.name ?? task?.nombre ?? '');
  const [description, setDescription] = useState(task?.description ?? task?.descripcion ?? '');
  const [statusId, setStatusId] = useState(normalizeStatusId(task));
  const [planId, setPlanId] = useState(getPlanId(task));
  const [taskDate, setTaskDate] = useState(formatInputDate(task?.taskDate ?? task?.date ?? task?.fechaTarea));
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [statusesError, setStatusesError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormOptions = async () => {
      setStatusesLoading(true);
      setStatusesError(null);
      setPlansLoading(true);
      setPlansError(null);

      try {
        const [statusesData, plansData] = await Promise.all([getStatuses(), getPlans()]);
        setStatuses(Array.isArray(statusesData) ? statusesData : []);
        setPlans(normalizePlans(plansData));
      } catch (err) {
        const message = err.message || 'No se pudieron cargar las opciones del formulario.';
        setStatusesError(message);
        setPlansError(message);
      } finally {
        setStatusesLoading(false);
        setPlansLoading(false);
      }
    };

    fetchFormOptions();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const taskId = getTaskId(task);
      const taskData = {
        title,
        description,
        statusId: Number(statusId),
        planId: Number(planId),
        taskDate: taskDate || undefined,
      };

      const updatedTask = await updateTask(taskId, taskData);
      setMessage('Tarea actualizada correctamente.');

      if (onUpdated) {
        onUpdated(updatedTask.id ?? updatedTask._id ?? updatedTask.taskId ?? taskId);
      }
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la tarea.');
    } finally {
      setLoading(false);
    }
  };

  if (!task) {
    return (
      <main>
        <h1>Actualizar tarea</h1>
        <p>No se seleccionó una tarea para actualizar.</p>
        {onCancel && (
          <button type="button" className="btn btn-primary" onClick={onCancel}>
            Volver a tareas
          </button>
        )}
      </main>
    );
  }

  return (
    <main>
      <h1>Actualizar tarea</h1>
      <form className="page-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Título *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="statusId">Status *</label>
          {statusesLoading ? (
            <p>Cargando status...</p>
          ) : statusesError ? (
            <p style={{ color: 'red' }}>{statusesError}</p>
          ) : (
            <select
              id="statusId"
              value={statusId}
              onChange={(event) => setStatusId(event.target.value)}
              required
            >
              <option value="">Seleccione un status</option>
              {statuses.map((s) => (
                <option key={s.id ?? s._id ?? s.statusId} value={s.id ?? s._id ?? s.statusId}>
                  {s.name ?? s.nombre ?? s.description ?? s.descripcion}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="planId">Plan *</label>
          {plansLoading ? (
            <p>Cargando planes...</p>
          ) : plansError ? (
            <p style={{ color: 'red' }}>{plansError}</p>
          ) : (
            <select
              id="planId"
              value={planId}
              onChange={(event) => setPlanId(event.target.value)}
              required
            >
              <option value="">Seleccione un plan</option>
              {plans.map((planOption) => {
                const optionPlanId = planOption.id ?? planOption._id ?? planOption.planId;

                return (
                  <option key={optionPlanId} value={optionPlanId}>
                    {getPlanTitle(planOption)}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="taskDate">Fecha de tarea</label>
          <input
            id="taskDate"
            type="date"
            value={taskDate}
            onChange={(event) => setTaskDate(event.target.value)}
          />
        </div>

        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn btn-tertiary" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar tarea'}
          </button>
        </div>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
};

export default EditarTarea;