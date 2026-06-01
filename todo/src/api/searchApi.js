import api from "./axios";

export async function searchTodos(query) {
  const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
  return response.data;
}