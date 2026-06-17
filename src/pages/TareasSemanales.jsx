import { useEffect, useState } from 'react';
import {
  createTaskWorkLog,
  getTaskWorkLogsByDateRange,
  getTasksByDateRange,
  updateTaskWorkLog,
} from '../services/taskService.js';
import CalendarField from '../components/CalendarField';

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

const getWeekDate = (weekStart, dayIndex) => {
  const result = new Date(weekStart);
  result.setDate(result.getDate() + dayIndex);
  return result;
};

const toApiDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseApiDate = (value) => {
  if (!value) {
    return null;
  }

  const normalizedValue = String(value).slice(0, 10);
  const [year, month, day] = normalizedValue.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
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

const getCheckKey = (taskId, workDate) => `${taskId}-${toApiDate(workDate)}`;

const normalizeReportEntries = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.tareas)) {
    return data.tareas;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const getWorkLogTaskId = (log) => log?.taskId ?? log?.task?.id ?? log?.task?._id;

const getWorkLogDate = (log) => log?.workDate ?? log?.fechaTrabajo ?? log?.date ?? log?.fecha;

const readNotesOverrides = () => {
  try {
    return JSON.parse(window.localStorage.getItem('task-work-notes-overrides') ?? '{}');
  } catch {
    return {};
  }
};

const persistNotesOverrides = (nextOverrides) => {
  window.localStorage.setItem('task-work-notes-overrides', JSON.stringify(nextOverrides));
};

const buildWeeklyStateFromWorkLogs = (workLogs, weekStart) => {
  return workLogs.reduce(
    (acc, workLog) => {
      const taskId = String(getWorkLogTaskId(workLog) ?? '');
      const workDate = getWorkLogDate(workLog);
      const taskDate = parseApiDate(workDate);

      if (!taskId || !taskDate) {
        return acc;
      }

      taskDate.setHours(0, 0, 0, 0);
      const dayIndex = Math.floor((taskDate.getTime() - weekStart.getTime()) / 86400000);

      if (dayIndex < 0 || dayIndex > 6) {
        return acc;
      }

      const dayKey = WEEK_DAYS[dayIndex]?.key;

      if (!dayKey) {
        return acc;
      }

      const checkKey = getCheckKey(taskId, taskDate);

      if (!acc.weeklyChecks[taskId]) {
        acc.weeklyChecks[taskId] = {};
      }

      acc.weeklyChecks[taskId][dayKey] = true;
      acc.weeklyChecks[checkKey] = true;
      acc.workLogsByKey[checkKey] = {
        id: workLog?.id,
        notes: workLog?.notes ?? '',
      };

      return acc;
    },
    {
      weeklyChecks: {},
      workLogsByKey: {},
    },
  );
};

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
  const [savingCellKey, setSavingCellKey] = useState(null);
  const [workLogsByKey, setWorkLogsByKey] = useState({});
  const [notesOverrides, setNotesOverrides] = useState(() => readNotesOverrides());
  const [noteEditor, setNoteEditor] = useState(null);

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

  useEffect(() => {
    const syncExistingWorkLogs = async () => {
      try {
        const weekStart = getStartOfWeek(new Date(`${fechaInicio}T00:00:00`));
        const workLogsData = await getTaskWorkLogsByDateRange(fechaInicio, fechaFin);
        const workLogs = normalizeReportEntries(workLogsData);
        const weeklyState = buildWeeklyStateFromWorkLogs(workLogs, weekStart);
        const savedChecks = readWeeklyChecks(fechaInicio, fechaFin);

        setWeeklyChecks({
          ...savedChecks,
          ...weeklyState.weeklyChecks,
        });
        setWorkLogsByKey(weeklyState.workLogsByKey);
      } catch {
        // Si el reporte falla, se mantiene el estado local para no bloquear la pantalla.
      }
    };

    syncExistingWorkLogs();
  }, [fechaInicio, fechaFin]);

  const persistChecks = (nextChecks) => {
    const storageKey = getRangeStorageKey(fechaInicio, fechaFin);
    setWeeklyChecks(nextChecks);
    window.localStorage.setItem(storageKey, JSON.stringify(nextChecks));
  };

  const registerWorkLog = async (task, taskKey, dayKey, dayLabel, workDate) => {
    const cellKey = `${taskKey}-${dayKey}`;
    const taskId = getTaskId(task);
    const workDateKey = getCheckKey(taskId, workDate);

    if (weeklyChecks[taskKey]?.[dayKey] || savingCellKey === cellKey) {
      return;
    }

    if (!taskId) {
      setError('No se pudo identificar la tarea para registrar el trabajo.');
      return;
    }

    if (weeklyChecks[workDateKey]) {
      return;
    }

    setSavingCellKey(cellKey);
    setError(null);

    try {
      if (weeklyChecks[String(taskId)]?.[dayKey] || weeklyChecks[taskKey]?.[dayKey]) {
        return;
      }

      await createTaskWorkLog({
        taskId: Number(taskId),
        workDate: toApiDate(workDate),
        notes: `${getTaskTitle(task)} registrada en ${dayLabel}`,
      });

      const currentTaskChecks = weeklyChecks[taskKey] ?? {};
      persistChecks({
        ...weeklyChecks,
        [taskKey]: {
          ...currentTaskChecks,
          [dayKey]: true,
        },
        [workDateKey]: true,
      });

      setWorkLogsByKey((currentLogs) => ({
        ...currentLogs,
        [workDateKey]: {
          ...(currentLogs[workDateKey] ?? {}),
          notes: `${getTaskTitle(task)} registrada en ${dayLabel}`,
        },
      }));
    } catch (err) {
      setError(err.message || 'No se pudo registrar el trabajo de la tarea.');
    } finally {
      setSavingCellKey(null);
    }
  };

  const getEffectiveNote = (workDateKey) =>
    notesOverrides[workDateKey] ?? workLogsByKey[workDateKey]?.notes ?? '';

  const handleOpenNoteEditor = (task, dayLabel, workDateKey, workDate) => {
    setNoteEditor({
      taskTitle: getTaskTitle(task),
      taskId: Number(getTaskId(task)),
      dayLabel,
      workDateKey,
      workDate,
      notes: getEffectiveNote(workDateKey),
    });
  };

  const handleSaveNote = async () => {
    if (!noteEditor) {
      return;
    }

    const logEntry = workLogsByKey[noteEditor.workDateKey];

    if (logEntry?.id) {
      try {
        await updateTaskWorkLog(logEntry.id, {
          taskId: noteEditor.taskId,
          workDate: noteEditor.workDate,
          notes: noteEditor.notes,
        });

        setWorkLogsByKey((currentLogs) => ({
          ...currentLogs,
          [noteEditor.workDateKey]: {
            ...currentLogs[noteEditor.workDateKey],
            notes: noteEditor.notes,
          },
        }));

        const nextOverrides = { ...notesOverrides };
        delete nextOverrides[noteEditor.workDateKey];
        setNotesOverrides(nextOverrides);
        persistNotesOverrides(nextOverrides);
      } catch (err) {
        setError(err.message || 'No se pudo guardar la nota.');
        return;
      }
    } else {
      const nextOverrides = {
        ...notesOverrides,
        [noteEditor.workDateKey]: noteEditor.notes,
      };

      setNotesOverrides(nextOverrides);
      persistNotesOverrides(nextOverrides);
    }

    setNoteEditor(null);
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
  const currentWeekDates = WEEK_DAYS.map((_, dayIndex) => getWeekDate(currentWeekStart, dayIndex));

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
          <CalendarField
            id="fechaInicio"
            label="Fecha inicio"
            value={fechaInicio}
            max={fechaFin}
            onChange={setFechaInicio}
          />
          <CalendarField
            id="fechaFin"
            label="Fecha fin"
            value={fechaFin}
            min={fechaInicio}
            onChange={setFechaFin}
          />
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
                  const taskIdKey = String(getTaskId(task) ?? taskKey);
                  const taskChecks = weeklyChecks[taskKey] ?? weeklyChecks[taskIdKey] ?? {};
                  const completedDays = WEEK_DAYS.filter((day) => taskChecks?.[day.key]).length;

                  return (
                    <tr key={taskKey}>
                      <td>
                        <div className="weekly-task-cell">
                          <strong>{getTaskTitle(task)}</strong>
                          <span>{getTaskDescription(task)}</span>
                        </div>
                      </td>
                      {WEEK_DAYS.map((day, dayIndex) => {
                        const isChecked = Boolean(taskChecks?.[day.key]);
                        const cellKey = `${taskKey}-${day.key}`;
                        const isSaving = savingCellKey === cellKey;
                        const workDate = currentWeekDates[dayIndex];
                        const workDateKey = getCheckKey(getTaskId(task), workDate);

                        return (
                          <td key={cellKey}>
                            <label className="weekly-checkbox">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isChecked || isSaving}
                                onChange={() =>
                                  registerWorkLog(task, taskKey, day.key, day.label, workDate)
                                }
                              />
                              <span>{`Marcar ${getTaskTitle(task)} en ${day.label}`}</span>
                            </label>
                            {isChecked && (
                              <button
                                type="button"
                                className="weekly-note-btn"
                                onClick={() => handleOpenNoteEditor(task, day.label, workDateKey, toApiDate(workDate))}
                              >
                                Nota
                              </button>
                            )}
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

        {noteEditor && (
          <div className="weekly-note-editor">
            <h3>Editar nota del registro diario</h3>
            <p>{`${noteEditor.taskTitle} - ${noteEditor.dayLabel}`}</p>
            <textarea
              value={noteEditor.notes}
              onChange={(event) =>
                setNoteEditor((currentEditor) =>
                  currentEditor
                    ? { ...currentEditor, notes: event.target.value }
                    : currentEditor,
                )
              }
              placeholder="Escribe la nota del dia"
            />
            <p className="weekly-note-hint">
              {workLogsByKey[noteEditor.workDateKey]?.id
                ? 'La nota se guardara directamente en el backend.'
                : 'No se encontro el ID del registro; la nota se guardara localmente.'}
            </p>
            <div className="form-actions">
              <button type="button" className="btn btn-tertiary" onClick={() => setNoteEditor(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveNote}>
                Guardar nota
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default TareasSemanales;
