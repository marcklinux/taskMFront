import React, { useState } from 'react';
import { createTask } from '../services/taskService.js';

const Tareas = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState('');
  const [planId, setPlanId] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const taskData = {
        title,
        description,
        statusId: Number(statusId),
        planId: Number(planId),
        taskDate: taskDate || undefined,
      };

      await createTask(taskData);
      setMessage('Tarea creada correctamente.');
      setTitle('');
      setDescription('');
      setStatusId('');
      setPlanId('');
      setTaskDate('');
    } catch (err) {
      setError(err.message || 'No se pudo crear la tarea.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Crear nueva tarea</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Título *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="statusId">ID de Status *</label>
          <input
            id="statusId"
            type="number"
            min="1"
            value={statusId}
            onChange={(event) => setStatusId(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="planId">ID de Plan *</label>
          <input
            id="planId"
            type="number"
            min="1"
            value={planId}
            onChange={(event) => setPlanId(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="taskDate">Fecha de Tarea</label>
          <input
            id="taskDate"
            type="date"
            value={taskDate}
            onChange={(event) => setTaskDate(event.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear tarea'}
        </button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
};

export default Tareas;
