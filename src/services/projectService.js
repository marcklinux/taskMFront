const API_BASE_URL = 'http://localhost:8080/api/proyectos';

// Obtiene todos los proyectos disponibles.
export const getProjects = async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error(`Error al obtener proyectos: ${response.statusText}`);
  }
  return response.json();
};

// Crea un proyecto nuevo con el payload recibido del formulario.
export const createProject = async (projectData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    throw new Error(`Error al crear el proyecto: ${response.statusText}`);
  }

  return response.json();
};

// Actualiza un proyecto existente por id.
export const updateProject = async (projectId, projectData) => {
  const response = await fetch(`${API_BASE_URL}/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    throw new Error(`Error al actualizar el proyecto: ${response.statusText}`);
  }

  return response.json();
};
