const API_BASE_URL = 'http://localhost:8080/api/planes';

export const createPlan = async (planData) => {
  const payload = {
    proyectId: planData.projectId ?? planData.proyectId ?? planData.projectID,
    statusId: planData.statusId ?? null,
    title: planData.title ?? undefined,
    description: planData.description ?? undefined,
    startDate: planData.startDate ?? undefined,
    endDate: planData.endDate ?? undefined,
  };

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error al crear el plan: ${response.statusText}`);
  }

  return response.json();
};
