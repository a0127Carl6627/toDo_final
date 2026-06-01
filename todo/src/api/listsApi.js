import api from "./axios";

export async function getLists() {
  const response = await api.get("/lists");
  return response.data;
}

export async function getListById(listId) {
  const response = await api.get(`/lists/${listId}`);
  return response.data;
}

export async function createList(data) {
  const response = await api.post("/lists", data);
  return response.data;
}

export async function updateList(listId, data) {
  const response = await api.put(`/lists/${listId}`, data);
  return response.data;
}

export async function deleteList(listId) {
  const response = await api.delete(`/lists/${listId}`);
  return response.data;
}