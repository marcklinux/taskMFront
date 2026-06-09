import React, { useEffect, useState } from 'react';
import { getTasksByPlan } from '../services/taskService.js';

const ListaDeTareas = () => {
  const [planId, setPlanId] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTasks = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTasksByPlan(id);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error al cargar las tareas');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(planId);
  }, [planId]);

  return (
    <main>
      <h1>Lista de Tareas</h1>
      <section>
        <label htmlFor="planId">ID de plan:</label>
        <input
          id="planId"
          type="number"
          min="1"
          value={planId}
          onChange={(event) => setPlanId(Number(event.target.value))}
        />
        <button type="button" onClick={() => loadTasks(planId)} disabled={loading}>
          Cargar tareas
        </button>
      </section>

      {loading && <p>Cargando tareas...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {tasks.length > 0 ? (
        <ul>
          {tasks.map((task) => (
            <li key={task.id ?? task._id ?? task.name}>
              <strong>{task.title ?? task.name ?? 'Tarea'}</strong>
              <p>{task.description ?? task.descripcion ?? ''}</p>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No hay tareas para este plan.</p>
      )}
    </main>
  );
};

export default ListaDeTareas;
