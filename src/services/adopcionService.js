// src/services/adopcionService.js
import { mapearPublicacion } from '../models/publicacion';

const BASE_URL = 'http://localhost:5000/publicaciones'; // cambia por tu dominio real

// GET publicación por ID
export async function getPublicacionPorId(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error('No se pudo obtener la publicación');
  const data = await res.json();
  return mapearPublicacion(data);
}

// GET publicaciones filtradas
export async function getPublicacionesFiltradas(filtros = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      params.append(clave, valor);
    }
  });

  const res = await fetch(`${BASE_URL}/filtrar?${params.toString()}`);
  if (!res.ok) throw new Error('Error al obtener publicaciones filtradas');
  const data = await res.json();
  return data.map(mapearPublicacion);
}
