import Publicacion from '../models/publicacion';
const BASE_URL = 'http://localhost:5000';

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

export async function eliminarPublicacion(id) {
  const response = await fetch(`${BASE_URL}/publicaciones/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // Agrega Authorization si usas autenticación
      // 'Authorization': 'Bearer TU_TOKEN_AQUI'
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al eliminar la publicación');
  }

  return await response.json(); // mensaje confirmando eliminación
}

// talvez no seria lo mas profesional el usar la funcion de adopcion en este paso pero es la misma,
//aunque talvez seria mas conveiente hacer una carpeta de get general para eso
