import { useEffect, useState } from 'react';
import { updateProject } from '../services/projectService.js';
import { getStatuses } from '../services/statusService.js';

// Permite obtener el id aunque cambie el nombre de la propiedad.
const getProjectId = (project) => project?.id ?? project?._id ?? project?.projectId;

// Ajusta fechas para el input type="date" (YYYY-MM-DD).
const formatInputDate = (date) => {
  if (!date) {
    return '';
  }

  return String(date).slice(0, 10);
};

const EditarProyecto = ({ project, onUpdated, onCancel }) => {
  const [name, setName] = useState(project?.name ?? project?.nombre ?? '');
  const [description, setDescription] = useState(project?.description ?? project?.descripcion ?? '');
  const [statusId, setStatusId] = useState(
    project?.statusId ?? project?.status?.id ?? project?.status?._id ?? '',
  );
  const [periodId, setPeriodId] = useState(project?.periodId ?? project?.period?.id ?? '');
  const [statuses, setStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [statusesError, setStatusesError] = useState(null);
  const [startDate, setStartDate] = useState(formatInputDate(project?.startDate ?? project?.fechaInicio));
  const [endDate, setEndDate] = useState(formatInputDate(project?.endDate ?? project?.fechaFin));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Carga catálogo de status para editar el estado del proyecto.
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

  // Envía los cambios al backend usando el id normalizado.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const projectId = getProjectId(project);
      const projectData = {
        name,
        description,
        statusId: Number(statusId),
        periodId: periodId ? Number(periodId) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const updatedProject = await updateProject(projectId, projectData);
      setMessage('Proyecto actualizado correctamente.');

      if (onUpdated) {
        onUpdated(updatedProject.id ?? updatedProject._id ?? updatedProject.projectId ?? projectId);
      }
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el proyecto.');
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <main>
        <h1>Editar proyecto</h1>
        <p>No se seleccionó un proyecto para editar.</p>
        {onCancel && (
          <button type="button" className="btn btn-primary" onClick={onCancel}>
            Volver al listado
          </button>
        )}
      </main>
    );
  }

  return (
    <main>
      <h1>Editar proyecto</h1>
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

        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn btn-tertiary" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
};

export default EditarProyecto;
