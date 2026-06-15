import { useState, useEffect } from 'react';
import { createPlan } from '../services/planService.js';
import { getStatuses } from '../services/statusService.js';
import { getProjects, updateProject } from '../services/projectService.js';

// Si llega como string numérico, lo convierte a número.
// Si no, mantiene el valor original para no perder compatibilidad.
const normalizeProjectId = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

// Helpers para extraer ID con distintos nombres de propiedad.
const getProjectId = (project) =>
  project?.id ?? project?._id ?? project?.projectId ?? project?.proyectId ?? project?.projectID;

const getStatusIdFromProject = (project) =>
  project?.statusId ?? project?.status?.id ?? project?.status?._id ?? project?.status?.statusId;

const getProjectName = (project) =>
  project?.name ?? project?.nombre ?? 'Proyecto sin nombre';

const getProjectDescription = (project) => project?.description ?? project?.descripcion ?? '';

const getPeriodIdFromProject = (project) =>
  project?.periodId ?? project?.period?.id ?? project?.period?._id;

const formatDateForApi = (value) => {
  if (!value) {
    return undefined;
  }

  return String(value).slice(0, 10);
};

const FINALIZED_STATUS_ID = 4;
const STOPPED_STATUS_ID = 5;

const CrearPlan = ({ projectId, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [statusesError, setStatusesError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleProjectChange = async (event) => {
    const projId = event.target.value;
    setSelectedProjectId(projId);
    setError(null);

    // Busca el proyecto seleccionado para verificar su status.
    const selected = projects.find((p) => String(getProjectId(p)) === String(projId));

    // Si el proyecto está finalizado (statusId === 4), auto-asigna statusId = 5 (detenido).
    if (selected) {
      const projectStatus = Number(getStatusIdFromProject(selected));
      if (projectStatus === FINALIZED_STATUS_ID) {
        try {
          const resolvedProjectId = getProjectId(selected);
          const payload = {
            name: getProjectName(selected),
            description: getProjectDescription(selected),
            statusId: STOPPED_STATUS_ID,
            periodId: getPeriodIdFromProject(selected) ?? undefined,
            startDate: formatDateForApi(selected?.startDate ?? selected?.fechaInicio),
            endDate: formatDateForApi(selected?.endDate ?? selected?.fechaFin),
          };

          await updateProject(resolvedProjectId, payload);
          setStatusId(STOPPED_STATUS_ID.toString());

          // Actualiza el estado local para que el proyecto refleje el nuevo status.
          setProjects((currentProjects) =>
            currentProjects.map((projectItem) => {
              if (String(getProjectId(projectItem)) !== String(resolvedProjectId)) {
                return projectItem;
              }

              return {
                ...projectItem,
                statusId: STOPPED_STATUS_ID,
                status: {
                  ...(typeof projectItem?.status === 'object' ? projectItem.status : {}),
                  id: STOPPED_STATUS_ID,
                },
              };
            }),
          );
        } catch (updateError) {
          setError(updateError.message || 'No se pudo actualizar el proyecto a detenido.');
        }
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Valida que exista proyecto seleccionado.
    if (!selectedProjectId) {
      setError('Por favor selecciona un proyecto para crear el plan.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const normalizedProjectId = normalizeProjectId(selectedProjectId);

      // Construye el payload con valores opcionales solo cuando existen.
      const planData = {
        projectId: normalizedProjectId,
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
      setSelectedProjectId(projectId || '');

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
    // Carga proyectos disponibles para el select si no viene preseleccionado.
    const fetchProjects = async () => {
      setProjectsLoading(true);
      setProjectsError(null);
      try {
        const data = await getProjects();
        const projectList = Array.isArray(data) ? data : [];
        setProjects(projectList);
      } catch (err) {
        setProjectsError(err.message || 'No se pudieron cargar los proyectos.');
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, [projectId]);

  useEffect(() => {
    // Carga catálogo de status para llenar el select del formulario.
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
      {projectId ? (
        <p>Proyecto asociado: {projectId}</p>
      ) : (
        <p style={{ color: '#666', fontStyle: 'italic' }}>Selecciona un proyecto para continuar</p>
      )}
      <form className="page-form" onSubmit={handleSubmit}>
        {/* Select de proyectos si no viene preseleccionado */}
        {!projectId && (
          <div>
            <label htmlFor="projectIdSelect">Proyecto *</label>
            {projectsLoading ? (
              <p>Cargando proyectos...</p>
            ) : projectsError ? (
              <p style={{ color: 'red' }}>{projectsError}</p>
            ) : (
              <select
                id="projectIdSelect"
                value={selectedProjectId}
                onChange={handleProjectChange}
                required
              >
                <option value="">Selecciona un proyecto</option>
                {projects.map((project) => (
                  <option key={getProjectId(project)} value={getProjectId(project)}>
                    {getProjectName(project)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

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
          {statusId == STOPPED_STATUS_ID && (
            <p style={{ color: '#007bff', fontSize: '0.9em', marginTop: '5px' }}>
              ℹ️ Plan marcado como "Detenido" porque el proyecto está finalizado.
            </p>
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

        <button type="submit" className="btn btn-primary" disabled={loading || !selectedProjectId}>
          {loading ? 'Guardando...' : 'Guardar plan'}
        </button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
};

export default CrearPlan;
