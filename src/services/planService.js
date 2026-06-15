const API_BASE_URL = 'http://localhost:8080/api/planes';

// Algunos endpoints usan projectId y otros proyectId.
// Cubre campos planos y el objeto anidado proyect/project que puede devolver el backend.
const getProjectId = (planData) =>
  planData?.projectId ??
  planData?.proyectId ??
  planData?.projectID ??
  planData?.proyectoId ??
  planData?.proyect?.id ??
  planData?.project?.id ??
  planData?.proyect?._id ??
  planData?.project?._id;

// Permite resolver el id del plan aunque cambie el nombre de la propiedad.
const getPlanId = (planData) => planData?.id ?? planData?._id ?? planData?.planId;

// Construye un payload compatible con distintos contratos del backend.
const buildPlanPayload = (planData) => {
  const projectId = getProjectId(planData);

  return {
    projectId,
    proyectId: projectId,
    statusId: planData.statusId ?? null,
    title: planData.title ?? undefined,
    description: planData.description ?? undefined,
    startDate: planData.startDate ?? undefined,
    endDate: planData.endDate ?? undefined,
  };
};

export const getPlans = async () => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        throw new Error(`Error al obtener planes: ${response.statusText}`);
    }
    return response.json();
};


// Parsea la respuesta solo si tiene cuerpo (evita fallo en 204 No Content).
const parseResponse = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const createPlan = async (planData) => {
  // Se envían ambos campos por compatibilidad con contratos antiguos/nuevos del backend.
  const payload = buildPlanPayload(planData);

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al crear el plan: ${errorText || response.statusText}`);
  }

  return parseResponse(response);
};

// Actualiza un plan existente por id.
export const updatePlan = async (planIdOrData, planData) => {
  const resolvedPlanId =
    typeof planIdOrData === 'object' ? getPlanId(planIdOrData) : planIdOrData;
  const resolvedPlanData = typeof planIdOrData === 'object' ? planIdOrData : planData;

  const payload = buildPlanPayload(resolvedPlanData ?? {});

  const response = await fetch(`${API_BASE_URL}/${resolvedPlanId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al actualizar el plan: ${errorText || response.statusText}`);
  }

  return parseResponse(response);
};
