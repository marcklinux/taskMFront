const API_BASE_URL = 'http://localhost:8080/api/tasks';

// Resuelve el id aunque el backend lo nombre de forma diferente.
const getTaskId = (taskData) => taskData?.id ?? taskData?._id ?? taskData?.taskId;

const getTaskStatusId = (taskData) =>
  taskData?.statusId ??
  taskData?.statusID ??
  taskData?.status?.id ??
  taskData?.status?._id ??
  taskData?.status?.statusId;

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

// Obtiene el listado completo de tareas.
export const getTasks = async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error(`Error al obtener tareas: ${response.statusText}`);
  }
  return response.json();
};

// Obtiene tareas filtradas por plan.
export const getTasksByPlan = async (planId) => {
  const response = await fetch(`${API_BASE_URL}/plan/${planId}`);
  if (!response.ok) {
    throw new Error(`Error al obtener tareas del plan ${planId}: ${response.statusText}`);
  }
  return response.json();
};

// Obtiene tareas filtradas por status.
export const getTasksByStatus = async (statusId) => {
  const statusEndpointResponse = await fetch(`${API_BASE_URL}/status/${statusId}`);

  if (statusEndpointResponse.ok) {
    return statusEndpointResponse.json();
  }

  // Fallback: si el endpoint por status no existe en backend,
  // se consulta el listado general y se filtra por status en frontend.
  const tasksResponse = await fetch(API_BASE_URL);

  if (!tasksResponse.ok) {
    throw new Error(
      `Error al obtener tareas del status ${statusId}: endpoint status devolvio ${statusEndpointResponse.status} y listado general devolvio ${tasksResponse.status}.`,
    );
  }

  const allTasks = normalizeTasks(await tasksResponse.json());
  return allTasks.filter((task) => String(getTaskStatusId(task)) === String(statusId));
};

// Obtiene tareas dentro de un rango de fecha (inclusive).
export const getTasksByDateRange = async (fechaInicio, fechaFin) => {
  const params = new URLSearchParams({
    fechaInicio,
    fechaFin,
  });

  const response = await fetch(`${API_BASE_URL}/rango-fecha?${params.toString()}`);
  if (!response.ok) {
    throw new Error(
      `Error al obtener tareas del rango ${fechaInicio} al ${fechaFin}: ${response.statusText}`,
    );
  }

  return response.json();
};

// Obtiene el reporte semanal de work logs dentro de un rango de fechas.
export const getWeeklyWorkLogReport = async (fechaInicio, fechaFin) => {
  const params = new URLSearchParams({
    fechaInicio,
    fechaFin,
  });

  const response = await fetch(`${API_BASE_URL.replace('/api/tasks', '/api/task-work-logs')}/reporte-semanal?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `Error al obtener el reporte semanal ${fechaInicio} al ${fechaFin}: ${response.statusText}`,
    );
  }

  return response.json();
};

// Obtiene el detalle de work logs por rango de fechas.
export const getTaskWorkLogsByDateRange = async (fechaInicio, fechaFin) => {
  const params = new URLSearchParams({
    fechaInicio,
    fechaFin,
  });

  const logsBaseUrl = API_BASE_URL.replace('/api/tasks', '/api/task-work-logs');
  const response = await fetch(`${logsBaseUrl}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `Error al obtener work logs del rango ${fechaInicio} al ${fechaFin}: ${response.statusText}`,
    );
  }

  return response.json();
};

const downloadWeeklyWorkLogReportFile = async (fechaInicio, fechaFin, format) => {
  const params = new URLSearchParams({
    fechaInicio,
    fechaFin,
  });

  const baseUrl = API_BASE_URL.replace('/api/tasks', '/api/task-work-logs');
  const exportUrl = `${baseUrl}/reporte-semanal/${format}?${params.toString()}`;
  const response = await fetch(exportUrl);

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(async () => ({ message: await response.text().catch(() => '') }));
    const backendMessage = errorBody?.message ?? errorBody?.error ?? response.statusText;

    throw new Error(
      `Error al exportar reporte semanal en ${format.toUpperCase()} desde ${exportUrl}: ${backendMessage}`,
    );
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('content-disposition') ?? '';
  const fileNameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  const defaultFileName = `reporte-semanal-${fechaInicio}-${fechaFin}.${format}`;
  const fileName = fileNameMatch?.[1] ? decodeURIComponent(fileNameMatch[1].replace(/"/g, '')) : defaultFileName;

  return {
    blob,
    fileName,
  };
};

export const exportWeeklyWorkLogReportCsv = async (fechaInicio, fechaFin) =>
  downloadWeeklyWorkLogReportFile(fechaInicio, fechaFin, 'csv');

export const exportWeeklyWorkLogReportPdf = async (fechaInicio, fechaFin) =>
  downloadWeeklyWorkLogReportFile(fechaInicio, fechaFin, 'pdf');

// Registra el trabajo realizado sobre una tarea en una fecha específica.
export const createTaskWorkLog = async ({ taskId, workDate, notes }) => {
  const workLogsApiBaseUrl = 'http://localhost:8080/api/task-work-logs';
  const response = await fetch('http://localhost:8080/api/task-work-logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      taskId,
      workDate,
      notes,
    }),
  });

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(async () => ({ message: await response.text().catch(() => '') }));
    const backendMessage = errorBody?.message ?? errorBody?.error ?? response.statusText;

    throw new Error(
      `Error al registrar el trabajo de la tarea en ${workLogsApiBaseUrl}: ${backendMessage}`,
    );
  }

  return response.json();
};

// Crea una nueva tarea en el backend.
export const createTask = async (taskData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error(`Error al crear la tarea: ${response.statusText}`);
  }
  return response.json();
};

// Actualiza una tarea existente por id.
export const updateTask = async (taskIdOrData, taskData) => {
  // Permite invocar con firma flexible:
  // updateTask(taskId, data) o updateTask(taskConDatos).
  const resolvedTaskId = typeof taskIdOrData === 'object' ? getTaskId(taskIdOrData) : taskIdOrData;
  const resolvedTaskData = typeof taskIdOrData === 'object' ? taskIdOrData : taskData;

  const response = await fetch(`${API_BASE_URL}/${resolvedTaskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resolvedTaskData ?? {}),
  });

  if (!response.ok) {
    throw new Error(`Error al actualizar la tarea: ${response.statusText}`);
  }

  return response.json();
};
