import React, { useState, useEffect } from 'react';
import { createProject } from '../services/projectService.js';
import { getStatuses } from '../services/statusService.js';

const CrearProyecto = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState('');
  const [periodId, setPeriodId] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [statusesError, setStatusesError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const projectData = {
        name,
        description,
        statusId: Number(statusId),
        periodId: periodId ? Number(periodId) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const createdProject = await createProject(projectData);
      setMessage('Proyecto creado correctamente.');
      setName('');
      setDescription('');
      setStatusId('');
      setPeriodId('');
      setStartDate('');
      setEndDate('');

      if (onCreated) {
        onCreated(createdProject.id ?? createdProject._id ?? createdProject.projectId);
      }
    } catch (err) {
      setError(err.message || 'No se pudo crear el proyecto.');
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
      <h1>Crear nuevo proyecto</h1>
      <form className="page-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nombre del proyecto *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
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
          <label htmlFor="periodId">ID de Periodo</label>
          <input
            id="periodId"
            type="number"
            min="1"
            value={periodId}
            onChange={(event) => setPeriodId(event.target.value)}
          />
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
          {loading ? 'Guardando...' : 'Guardar proyecto'}
        </button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
};

export default CrearProyecto;
