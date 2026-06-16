import { useEffect, useState } from 'react';
import { getTasks } from '../services/taskService.js';

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

const formatWeekRange = (weekStart) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatter = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
  });

  return `${formatter.format(weekStart)} - ${formatter.format(weekEnd)}`;
};

const getWeekStorageKey = (weekStart) => {
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, '0');
  const day = String(weekStart.getDate()).padStart(2, '0');
  return `task-weekly-tracker:${year}-${month}-${day}`;
};

const readWeeklyChecks = (weekStart) => {
  const savedChecks = window.localStorage.getItem(getWeekStorageKey(weekStart));

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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [weeklyChecks, setWeeklyChecks] = useState(() => readWeeklyChecks(getStartOfWeek(new Date())));

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const tasksData = await getTasks();
        setTasks(normalizeTasks(tasksData));
      } catch (err) {
        setError(err.message || 'No se pudieron cargar las tareas semanales.');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const persistChecks = (nextChecks) => {
    const storageKey = getWeekStorageKey(currentWeekStart);
    setWeeklyChecks(nextChecks);
    window.localStorage.setItem(storageKey, JSON.stringify(nextChecks));
  };

  const changeWeek = (nextWeekDate) => {
    const nextWeekStart = getStartOfWeek(nextWeekDate);
    setCurrentWeekStart(nextWeekStart);
    setWeeklyChecks(readWeeklyChecks(nextWeekStart));
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

  return (
    <main>
      <section className="project-list weekly-page">
        <div className="project-list-header weekly-header">
          <div>
            <h1>Tareas de la semana</h1>
            <p>
              Marca en que dias realizaste cada tarea para llevar el control de frecuencia semanal.
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

        <div className="weekly-summary-card">
          <p>
            Ejemplo: si marcaste "Caminar 30 min" en lunes, martes, jueves y viernes, podras ver de
            inmediato la frecuencia de esa tarea en la semana.
          </p>
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
