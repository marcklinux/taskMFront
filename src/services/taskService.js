const API_BASE_URL = 'http://localhost:8080/api/tasks';

// Resuelve el id aunque el backend lo nombre de forma diferente.
const getTaskId = (taskData) => taskData?.id ?? taskData?._id ?? taskData?.taskId;

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
  const response = await fetch(`${API_BASE_URL}/status/${statusId}`);
  if (!response.ok) {
    throw new Error(`Error al obtener tareas del status ${statusId}: ${response.statusText}`);
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
