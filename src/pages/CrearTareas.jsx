import { useEffect, useState } from 'react';
import { getPlans } from '../services/planService.js';
import { createTask } from '../services/taskService.js';
import { getStatuses } from '../services/statusService.js';

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

const getPlanTitle = (plan) =>
  plan.title ?? plan.name ?? plan.nombre ?? plan.description ?? plan.descripcion ?? 'Plan sin título';

const CrearTareas = ({ initialPlanId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState('');
  const [planId, setPlanId] = useState(initialPlanId || '');
  const [taskDate, setTaskDate] = useState('');
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
      const taskData = {
        title,
        description,
        statusId: Number(statusId),
        planId: Number(planId),
        taskDate: taskDate || undefined,
      };

      await createTask(taskData);
      setMessage('Tarea creada correctamente.');
      setTitle('');
      setDescription('');
      setStatusId('');
      setPlanId(initialPlanId || '');
      setTaskDate('');
    } catch (err) {
      setError(err.message || 'No se pudo crear la tarea.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Crear tareas</h1>
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
              {plans.map((plan) => {
                const optionPlanId = plan.id ?? plan._id ?? plan.planId;

                return (
                  <option key={optionPlanId} value={optionPlanId}>
                    {getPlanTitle(plan)}
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

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar tarea'}
        </button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
};

export default CrearTareas;
