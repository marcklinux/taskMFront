const API_BASE_URL = 'http://localhost:8080/api/status';

export const getStatuses = async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error(`Error al obtener status: ${response.statusText}`);
  }
  return response.json();
};
