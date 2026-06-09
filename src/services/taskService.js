const API_BASE_URL = 'http://localhost:8080/api/tasks';

export const getTasksByPlan = async (planId) => {
  const response = await fetch(`${API_BASE_URL}/plan/${planId}`);
  if (!response.ok) {
    throw new Error(`Error al obtener tareas del plan ${planId}: ${response.statusText}`);
  }
  return response.json();
};

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
