import { useEffect, useState } from 'react';
import { getTasksByDateRange } from '../services/taskService.js';

const WEEK_DAYS = [
  { key: 'monday', label: 'Lunes', shortLabel: 'Lun' },
  { key: 'tuesday', label: 'Martes', shortLabel: 'Mar' },
  { key: 'wednesday', label: 'Miercoles', shortLabel: 'Mie' },
  { key: 'thursday', label: 'Jueves', shortLabel: 'Jue' },
  { key: 'friday', label: 'Viernes', shortLabel: 'Vie' },
  { key: 'saturday', label: 'Sabado', shortLabel: 'Sab' },
  { key: 'sunday', label: 'Domingo', shortLabel: 'Dom' },
];

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

const getTaskId = (task) => task?.id ?? task?._id ?? task?.taskId;

const getTaskTitle = (task) => task?.title ?? task?.name ?? 'Tarea sin titulo';

const getTaskDescription = (task) => task?.description ?? task?.descripcion ?? 'Sin descripcion';

const getStartOfWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + diff);
  return result;
};

const getEndOfWeek = (weekStart) => {
  const result = new Date(weekStart);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

const toApiDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekNumber = (date) => {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
};

const formatWeekRange = (weekStart) => {
  const weekEnd = getEndOfWeek(weekStart);

  const formatter = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `${formatter.format(weekStart)} - ${formatter.format(weekEnd)}`;
};

const getRangeStorageKey = (fechaInicio, fechaFin) =>
  `task-weekly-tracker:${fechaInicio}:${fechaFin}`;

const readWeeklyChecks = (fechaInicio, fechaFin) => {
  const savedChecks = window.localStorage.getItem(getRangeStorageKey(fechaInicio, fechaFin));

  if (!savedChecks) {
    return {};
  }

  try {
    return JSON.parse(savedChecks);
  } catch {
    return {};
  }
};

const buildTaskKey = (task, index) => String(getTaskId(task) ?? `${getTaskTitle(task)}-${index}`);

const TareasSemanales = () => {
  const initialWeekStart = getStartOfWeek(new Date());
  const initialWeekEnd = getEndOfWeek(initialWeekStart);
  const initialFechaInicio = toApiDate(initialWeekStart);
  const initialFechaFin = toApiDate(initialWeekEnd);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(initialWeekStart);
  const [fechaInicio, setFechaInicio] = useState(initialFechaInicio);
  const [fechaFin, setFechaFin] = useState(initialFechaFin);
  const [weeklyChecks, setWeeklyChecks] = useState(() => readWeeklyChecks(initialFechaInicio, initialFechaFin));

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const tasksData = await getTasksByDateRange(fechaInicio, fechaFin);
        setTasks(normalizeTasks(tasksData));
      } catch (err) {
        setError(err.message || 'No se pudieron cargar las tareas semanales.');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [fechaInicio, fechaFin]);

  const persistChecks = (nextChecks) => {
    const storageKey = getRangeStorageKey(fechaInicio, fechaFin);
    setWeeklyChecks(nextChecks);
    window.localStorage.setItem(storageKey, JSON.stringify(nextChecks));
  };

  const changeWeek = (nextWeekDate) => {
    const nextWeekStart = getStartOfWeek(nextWeekDate);
    const nextWeekEnd = getEndOfWeek(nextWeekStart);
    const nextFechaInicio = toApiDate(nextWeekStart);
    const nextFechaFin = toApiDate(nextWeekEnd);

    setCurrentWeekStart(nextWeekStart);
    setFechaInicio(nextFechaInicio);
    setFechaFin(nextFechaFin);
    setWeeklyChecks(readWeeklyChecks(nextFechaInicio, nextFechaFin));
  };

  const handleApplyDateRange = () => {
    if (!fechaInicio || !fechaFin) {
      setError('Debes seleccionar fecha de inicio y fecha de fin.');
      return;
    }

    if (fechaInicio > fechaFin) {
      setError('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }

    const nextWeekStart = getStartOfWeek(new Date(`${fechaInicio}T00:00:00`));
    setCurrentWeekStart(nextWeekStart);
    setError(null);
    setWeeklyChecks(readWeeklyChecks(fechaInicio, fechaFin));
  };

  const handleToggleDay = (taskKey, dayKey) => {
    const currentTaskChecks = weeklyChecks[taskKey] ?? {};
    const nextChecks = {
      ...weeklyChecks,
      [taskKey]: {
        ...currentTaskChecks,
        [dayKey]: !currentTaskChecks[dayKey],
      },
    };

    persistChecks(nextChecks);
  };

  const handlePreviousWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() - 7);
    changeWeek(nextWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    changeWeek(nextWeek);
  };

  const handleCurrentWeek = () => {
    changeWeek(new Date());
  };

  const currentWeekNumber = getWeekNumber(currentWeekStart);

  return (
    <main>
      <section className="project-list weekly-page">
        <div className="project-list-header weekly-header">
          <div>
            <h1>Tareas de la semana</h1>
            <p>
              Semana {currentWeekNumber}: {formatWeekRange(currentWeekStart)}
            </p>
          </div>
          <div className="weekly-toolbar">
            <button type="button" className="btn btn-tertiary" onClick={handlePreviousWeek}>
              Semana anterior
            </button>
            <span className="weekly-range">{formatWeekRange(currentWeekStart)}</span>
            <button type="button" className="btn btn-tertiary" onClick={handleCurrentWeek}>
              Semana actual
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleNextWeek}>
              Semana siguiente
            </button>
          </div>
        </div>

        <div className="weekly-range-controls">
          <div className="weekly-range-field">
            <label htmlFor="fechaInicio">Fecha inicio</label>
            <input
              id="fechaInicio"
              type="date"
              value={fechaInicio}
              onChange={(event) => setFechaInicio(event.target.value)}
            />
          </div>
          <div className="weekly-range-field">
            <label htmlFor="fechaFin">Fecha fin</label>
            <input
              id="fechaFin"
              type="date"
              value={fechaFin}
              onChange={(event) => setFechaFin(event.target.value)}
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={handleApplyDateRange}>
            Aplicar rango
          </button>
        </div>

        <div className="weekly-summary-card">
          <p>
            Ejemplo: si marcaste "Caminar 30 min" en lunes, martes, jueves y viernes, podras ver de
            inmediato la frecuencia de esa tarea en la semana.
          </p>
          <p>{`Consultando API con: ${fechaInicio} a ${fechaFin}`}</p>
        </div>

        {loading && <p>Cargando tareas...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && tasks.length === 0 && <p>No hay tareas registradas para mostrar.</p>}

        {!loading && !error && tasks.length > 0 && (
          <div className="weekly-table-shell">
            <table className="weekly-table">
              <thead>
                <tr>
                  <th>Tarea</th>
                  {WEEK_DAYS.map((day) => (
                    <th key={day.key}>
                      <span className="weekly-day-label">{day.label}</span>
                      <span className="weekly-day-short">{day.shortLabel}</span>
                    </th>
                  ))}
                  <th>Frecuencia</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => {
                  const taskKey = buildTaskKey(task, index);
                  const completedDays = WEEK_DAYS.filter((day) => weeklyChecks[taskKey]?.[day.key]).length;

                  return (
                    <tr key={taskKey}>
                      <td>
                        <div className="weekly-task-cell">
                          <strong>{getTaskTitle(task)}</strong>
                          <span>{getTaskDescription(task)}</span>
                        </div>
                      </td>
                      {WEEK_DAYS.map((day) => {
                        const isChecked = Boolean(weeklyChecks[taskKey]?.[day.key]);

                        return (
                          <td key={`${taskKey}-${day.key}`}>
                            <label className="weekly-checkbox">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleDay(taskKey, day.key)}
                              />
                              <span>{`Marcar ${getTaskTitle(task)} en ${day.label}`}</span>
                            </label>
                          </td>
                        );
                      })}
                      <td>
                        <span className="weekly-frequency-badge">{`${completedDays}/7 dias`}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default TareasSemanales;
