const API_BASE_URL = 'http://localhost:8080/api/periodos';

// Recupera el catálogo de periodos para formularios y listados.
export const getPeriodos = async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error(`Error al obtener periodos  : ${response.statusText}`);
  }
  return response.json();
};