import { useEffect, useMemo, useState } from 'react';
import CalendarField from '../components/CalendarField';
import {
  exportWeeklyWorkLogReportCsv,
  exportWeeklyWorkLogReportPdf,
  getWeeklyWorkLogReport,
} from '../services/taskService.js';

const WEEK_DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miercoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sabado' },
  { key: 'sunday', label: 'Domingo' },
];

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

const formatWeekRange = (weekStart) => {
  const weekEnd = getEndOfWeek(weekStart);
  const formatter = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `${formatter.format(weekStart)} - ${formatter.format(weekEnd)}`;
};

const getWeekNumber = (date) => {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
};

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

const getReportTaskId = (entry) =>
  entry?.taskId ?? entry?.task?.id ?? entry?.task?._id ?? entry?.id ?? entry?.task?.taskId;

const getReportTaskTitle = (entry) =>
  entry?.taskTitle ??
  entry?.task?.title ??
  entry?.task?.name ??
  entry?.title ??
  entry?.name ??
  'Tarea sin titulo';

const weekdayFromDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const date = parseApiDate(dateValue);

  if (!date) {
    return null;
  }

  const weekdayIndex = date.getDay();
  const keys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  return keys[weekdayIndex] === 'sunday' ? 'sunday' : keys[weekdayIndex];
};

const buildRowsFromReport = (entries, weekStart) => {
  return entries.map((entry, index) => {
    const taskId = String(getReportTaskId(entry) ?? `${getReportTaskTitle(entry)}-${index}`);
    const workDates = Array.isArray(entry?.fechasTrabajo)
      ? entry.fechasTrabajo
      : [entry?.workDate ?? entry?.fechaTrabajo ?? entry?.date ?? entry?.fecha].filter(Boolean);

    const days = WEEK_DAYS.reduce((daysMap, day) => {
      daysMap[day.key] = false;
      return daysMap;
    }, {});

    workDates.forEach((workDate) => {
      const workDateKey = weekdayFromDate(workDate);

      if (workDateKey && days[workDateKey] !== undefined) {
        days[workDateKey] = true;
      }
    });

    return {
      taskId,
      taskTitle: getReportTaskTitle(entry),
      totalLogs: entry?.totalRegistros ?? workDates.length,
      workDates,
      notes: entry?.notes ? [entry.notes] : [],
      days,
      completedDays: WEEK_DAYS.filter((day) => days[day.key]).length,
      weekLabel: formatWeekRange(weekStart),
    };
  });
};

const ReporteSemanal = () => {
  const initialWeekStart = getStartOfWeek(new Date());
  const initialWeekEnd = getEndOfWeek(initialWeekStart);
  const [fechaInicio, setFechaInicio] = useState(toApiDate(initialWeekStart));
  const [fechaFin, setFechaFin] = useState(toApiDate(initialWeekEnd));
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [rawEntries, setRawEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportingFormat, setExportingFormat] = useState(null);
  const [exportMessage, setExportMessage] = useState(null);
  const [isExportToastVisible, setIsExportToastVisible] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getWeeklyWorkLogReport(fechaInicio, fechaFin);
        setRawEntries(normalizeReportEntries(data));
      } catch (err) {
        setError(err.message || 'No se pudo cargar el reporte semanal.');
        setRawEntries([]);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    if (!exportMessage) {
      return;
    }

    setIsExportToastVisible(true);

    const hideTimerId = setTimeout(() => {
      setIsExportToastVisible(false);
    }, 2200);

    const clearTimerId = setTimeout(() => {
      setExportMessage(null);
    }, 2600);

    return () => {
      clearTimeout(hideTimerId);
      clearTimeout(clearTimerId);
    };
  }, [exportMessage]);

  const reportRows = useMemo(() => buildRowsFromReport(rawEntries, weekStart), [rawEntries, weekStart]);
  const currentWeekNumber = getWeekNumber(weekStart);
  const currentWeekDates = WEEK_DAYS.map((_, index) => getWeekDate(weekStart, index));

  const changeWeek = (nextDate) => {
    const nextWeekStart = getStartOfWeek(nextDate);
    const nextWeekEnd = getEndOfWeek(nextWeekStart);
    setWeekStart(nextWeekStart);
    setFechaInicio(toApiDate(nextWeekStart));
    setFechaFin(toApiDate(nextWeekEnd));
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

    setWeekStart(getStartOfWeek(new Date(`${fechaInicio}T00:00:00`)));
    setError(null);
  };

  const triggerBrowserDownload = (blob, fileName) => {
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  const handleExport = async (format) => {
    setExportingFormat(format);
    setError(null);
    setExportMessage(null);

    try {
      const exportAction = format === 'csv'
        ? exportWeeklyWorkLogReportCsv
        : exportWeeklyWorkLogReportPdf;
      const { blob, fileName } = await exportAction(fechaInicio, fechaFin);
      triggerBrowserDownload(blob, fileName);
      setExportMessage(`Descarga iniciada: ${fileName}`);
    } catch (err) {
      const exportError = err.message || `No se pudo exportar el reporte en ${format.toUpperCase()}.`;
      setError(exportError);
      setExportMessage(exportError);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <main>
      {exportMessage && (
        <div className={`task-toast ${isExportToastVisible ? 'task-toast-visible' : 'task-toast-hidden'}`}>
          {exportMessage}
        </div>
      )}
      <section className="project-list weekly-page weekly-report-page">
        <div className="project-list-header weekly-header">
          <div>
            <h1>Reporte semanal</h1>
            <p>
              Semana {currentWeekNumber}: {formatWeekRange(weekStart)}
            </p>
          </div>
          <div className="weekly-toolbar">
            <button type="button" className="btn btn-tertiary" onClick={() => changeWeek(new Date(weekStart.getTime() - 7 * 86400000))}>
              Semana anterior
            </button>
            <span className="weekly-range">{formatWeekRange(weekStart)}</span>
            <button type="button" className="btn btn-tertiary" onClick={() => changeWeek(new Date())}>
              Semana actual
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => changeWeek(new Date(weekStart.getTime() + 7 * 86400000))}>
              Semana siguiente
            </button>
          </div>
        </div>

        <div className="weekly-range-controls">
          <CalendarField id="reporteFechaInicio" label="Fecha inicio" value={fechaInicio} max={fechaFin} onChange={setFechaInicio} />
          <CalendarField id="reporteFechaFin" label="Fecha fin" value={fechaFin} min={fechaInicio} onChange={setFechaFin} />
          <button type="button" className="btn btn-primary" onClick={handleApplyDateRange}>
            Aplicar rango
          </button>
          <div className="weekly-export-group">
            <span className="weekly-export-title">Exportar reporte</span>
            <div className="weekly-export-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleExport('csv')}
                disabled={exportingFormat !== null}
              >
                {exportingFormat === 'csv' ? 'Exportando CSV...' : 'Exportar CSV'}
              </button>
              <button
                type="button"
                className="btn btn-tertiary weekly-export-btn"
                onClick={() => handleExport('pdf')}
                disabled={exportingFormat !== null}
              >
                {exportingFormat === 'pdf' ? 'Exportando PDF...' : 'Exportar PDF'}
              </button>
            </div>
          </div>
        </div>

        <div className="weekly-summary-card">
          <p>
            Este reporte muestra la trazabilidad semanal de los work logs registrados por tarea y día.
          </p>
          <p>{`Consultando reporte con: ${fechaInicio} a ${fechaFin}`}</p>
        </div>

        {loading && <p>Cargando reporte semanal...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && reportRows.length === 0 && <p>No hay registros para este rango de fechas.</p>}

        {!loading && !error && reportRows.length > 0 && (
          <div className="weekly-table-shell">
            <table className="weekly-table">
              <thead>
                <tr>
                  <th>Tarea</th>
                  {WEEK_DAYS.map((day, index) => (
                    <th key={day.key}>
                      <span className="weekly-day-label">{day.label}</span>
                      <span className="weekly-day-short">{day.label.slice(0, 3)}</span>
                      <div className="weekly-day-date">{currentWeekDates[index].toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</div>
                    </th>
                  ))}
                  <th>Fechas registradas</th>
                  <th>Totales</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((row) => (
                  <tr key={row.taskId}>
                    <td>
                      <div className="weekly-task-cell">
                        <strong>{row.taskTitle}</strong>
                        <span>{row.notes.length > 0 ? row.notes[0] : 'Sin notas'}</span>
                      </div>
                    </td>
                    {WEEK_DAYS.map((day) => (
                      <td key={`${row.taskId}-${day.key}`}>
                        <span className={`weekly-report-pill ${row.days[day.key] ? 'weekly-report-pill-active' : ''}`}>
                          {row.days[day.key] ? 'Registrado' : '-'}
                        </span>
                      </td>
                    ))}
                    <td>
                      <div className="weekly-registered-dates">
                        {row.workDates.length > 0
                          ? row.workDates.map((workDate, index) => (
                              <span key={`${row.taskId}-date-${index}`} className="weekly-date-chip">
                                {String(workDate).slice(0, 10)}
                              </span>
                            ))
                          : <span className="weekly-date-chip">Sin fechas</span>}
                      </div>
                    </td>
                    <td>
                      <span className="weekly-frequency-badge">{`${row.completedDays}/7 dias`}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default ReporteSemanal;