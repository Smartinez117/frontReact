import Publicacion from '../models/publicacion';
const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}`;

// Función para obtener publicaciones filtradas desde el backend
export async function fetchPublicacionesFiltradas(params) {
  // Convertimos los parámetros de filtro en query string
  const query = new URLSearchParams(params).toString();

  // Hacemos la petición GET a la URL completa con filtros
  const response = await fetch(`${BASE_URL}/publicaciones/filtrar?${query}`);

  if (!response.ok) {
    throw new Error(`Error al obtener publicaciones: ${response.statusText}`);
  }

  // Obtenemos el JSON con la lista de publicaciones
  const data = await response.json();

  // Convertimos cada objeto recibido en una instancia de Publicacion
  return data.map(pub => new Publicacion(pub));
}

// Opcional: función para obtener una publicación por ID si la necesitas
export async function fetchPublicacionPorId(id) {
  const response = await fetch(`${BASE_URL}/publicaciones/${id}`);

  if (!response.ok) {
    throw new Error(`Error al obtener la publicación: ${response.statusText}`);
  }

  const data = await response.json();
  return new Publicacion(data);
}


