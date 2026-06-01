import api from "./axios";

export async function getTasksByList(listId) {
  const response = await api.get(`/lists/${listId}/tasks`);
  return response.data;
}

export async function getTaskById(taskId) {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
}

export async function createTask(listId, data) {
  const response = await api.post(`/lists/${listId}/tasks`, data);
  return response.data;
}

export async function updateTask(taskId, data) {
  const response = await api.put(`/tasks/${taskId}`, data);
  return response.data;
}

export async function deleteTask(taskId) {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
}