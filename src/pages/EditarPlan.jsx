import { useEffect, useState } from 'react';
import { updatePlan } from '../services/planService.js';
import { getStatuses } from '../services/statusService.js';

const getPlanId = (plan) => plan?.id ?? plan?._id ?? plan?.planId;

// Cubre tanto campos planos como el objeto anidado que devuelve el backend.
const getProjectId = (plan) =>
  plan?.projectId ??
  plan?.proyectId ??
  plan?.projectID ??
  plan?.proyectoId ??
  plan?.proyect?.id ??
  plan?.project?.id ??
  plan?.proyect?._id ??
  plan?.project?._id;

const formatInputDate = (date) => {
  if (!date) {
    return '';
  }

  return String(date).slice(0, 10);
};

const normalizeStatusId = (plan) =>
  plan?.statusId ?? plan?.status?.id ?? plan?.status?._id ?? plan?.status?.statusId ?? '';

const EditarPlan = ({ plan, onUpdated, onCancel }) => {
  const [title, setTitle] = useState(plan?.title ?? plan?.name ?? plan?.nombre ?? '');
  const [description, setDescription] = useState(plan?.description ?? plan?.descripcion ?? '');
  const [statusId, setStatusId] = useState(normalizeStatusId(plan));
  const [startDate, setStartDate] = useState(formatInputDate(plan?.startDate ?? plan?.fechaInicio));
  const [endDate, setEndDate] = useState(formatInputDate(plan?.endDate ?? plan?.fechaFin));
  const [statuses, setStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [statusesError, setStatusesError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatuses = async () => {
      setStatusesLoading(true);
      setStatusesError(null);

      try {
        const data = await getStatuses();
        setStatuses(Array.isArray(data) ? data : []);
      } catch (err) {
        setStatusesError(err.message || 'No se pudieron cargar los status.');
      } finally {
        setStatusesLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const planId = getPlanId(plan);
      const planData = {
        projectId: getProjectId(plan),
        title,
        description,
        statusId: Number(statusId),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const updatedPlan = await updatePlan(planId, planData);
      setMessage('Plan actualizado correctamente.');

      if (onUpdated) {
        onUpdated(updatedPlan.id ?? updatedPlan._id ?? updatedPlan.planId ?? planId);
      }
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el plan.');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <main>
        <h1>Actualizar plan</h1>
        <p>No se seleccionó un plan para actualizar.</p>
        {onCancel && (
          <button type="button" className="btn btn-primary" onClick={onCancel}>
            Volver a planes
          </button>
        )}
      </main>
    );
  }

  return (
    <main>
      <h1>Actualizar plan</h1>
      <p>Proyecto asociado: {getProjectId(plan) ?? 'N/A'}</p>
      <form className="page-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Título del plan *</label>
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
          <label htmlFor="startDate">Fecha de inicio</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="endDate">Fecha de fin</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>

        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn btn-tertiary" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Actualizar plan'}
          </button>
        </div>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
};

export default EditarPlan;