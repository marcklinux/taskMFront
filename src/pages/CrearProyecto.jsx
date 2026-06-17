import { useState, useEffect } from 'react';
import { createProject } from '../services/projectService.js';
import { getStatuses } from '../services/statusService.js';
import { getPeriodos } from '../services/periodoService.js';
import CalendarField from '../components/CalendarField';

const CrearProyecto = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState('');
  const [periodId, setPeriodId] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [statusesError, setStatusesError] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [periodosLoading, setPeriodosLoading] = useState(false);
  const [periodosError, setPeriodosError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Envía el proyecto al backend y limpia el formulario en caso de éxito.
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
        periodId: Number(periodId),
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
    // Carga el catálogo de status para llenar el select inicial.
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

  useEffect(() => {
    // Carga el catálogo de periodos para llenar el select inicial.
    const fetchPeriodos = async () => {
      setPeriodosLoading(true);
      setPeriodosError(null);
      try {
        const data = await getPeriodos();
        setPeriodos(Array.isArray(data) ? data : []);
      } catch (err) {
        setPeriodosError(err.message || 'No se pudieron cargar los periodos.');
      } finally {
        setPeriodosLoading(false);
      }
    };

    fetchPeriodos();
  }, []);

  return (
    <main>
      <h1>Crear proyecto</h1>
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
          <label htmlFor="periodId">Periodo *</label>
          {periodosLoading ? (
            <p>Cargando periodos...</p>
          ) : periodosError ? (
            <p style={{ color: 'red' }}>{periodosError}</p>
          ) : (
            <select
              id="periodId"
              value={periodId}
              onChange={(event) => setPeriodId(event.target.value)}
              required
            >
              <option value="">Seleccione un periodo</option>
              {periodos.map((p) => (
                <option key={p.id ?? p._id ?? p.periodId} value={p.id ?? p._id ?? p.periodId}>
                  {p.name ?? p.nombre ?? p.description ?? p.descripcion}
                </option>
              ))}
            </select>
          )}
        </div>
        <CalendarField
          id="startDate"
          label="Fecha de inicio"
          value={startDate}
          max={endDate}
          onChange={setStartDate}
        />

        <CalendarField
          id="endDate"
          label="Fecha de fin"
          value={endDate}
          min={startDate}
          onChange={setEndDate}
        />

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
