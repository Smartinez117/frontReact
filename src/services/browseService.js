import Publicacion from "../models/Publicacion.js";
import { BASE_URL } from "../utils/constants.jsx";

// Función genérica para manejar requests HTTP
async function handleRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en request a ${url}:`, error);
    throw new Error(`Error de conexión: ${error.message}`);
  }
}

// Función para obtener todas las publicaciones
export async function fetchTodasLasPublicaciones() {
  const data = await handleRequest(`${BASE_URL}/publicaciones`);
  return data.map((pub) => new Publicacion(pub));
}

// Función para obtener publicaciones filtradas
export async function fetchPublicacionesFiltradas(params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/publicaciones/filtrar?${queryParams}`;

  const data = await handleRequest(url);
  return data.map((pub) => new Publicacion(pub));
}

// Función para obtener una publicación por ID
export async function fetchPublicacionPorId(id) {
  const data = await handleRequest(`${BASE_URL}/publicaciones/${id}`);
  return new Publicacion(data);
}

// Función para obtener todas las etiquetas
export async function fetchTodasLasEtiquetas() {
  const data = await handleRequest(`${BASE_URL}/api/etiquetas`);
  return data.map((etiqueta) => ({
    label: etiqueta.nombre,
    id: etiqueta.id,
  }));
}

// Función para obtener la ubicación del usuario
export async function obtenerUbicacionUsuario() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalización no soportada por el navegador"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
        }),
      (error) =>
        reject(new Error(`No se pudo obtener la ubicación: ${error.message}`)),
      { timeout: 10000 },
    );
  });
}
