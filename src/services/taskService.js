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
