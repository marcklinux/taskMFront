import React, { useState, useEffect } from 'react';
import { createPlan } from '../services/planService.js';
import { getStatuses } from '../services/statusService.js';

const CrearPlan = ({ projectId, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [statusesError, setStatusesError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!projectId) {
      setError('No se encuentra el proyecto asociado para crear el plan.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const planData = {
        projectId: Number(projectId),
        title,
        description,
        statusId: Number(statusId),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const createdPlan = await createPlan(planData);
      setMessage('Plan creado correctamente.');
      setTitle('');
      setDescription('');
      setStatusId('');
      setStartDate('');
      setEndDate('');

      if (onCreated) {
        onCreated(createdPlan.id ?? createdPlan._id ?? createdPlan.planId);
      }
    } catch (err) {
      setError(err.message || 'No se pudo crear el plan.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <main>
      <h1>Crear nuevo plan</h1>
      <p>Proyecto asociado: {projectId ?? 'N/A'}</p>
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

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar plan'}
        </button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
};

export default CrearPlan;
