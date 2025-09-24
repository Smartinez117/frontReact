import Publicacion from '../models/publicacion';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const BASE_URL = import.meta.env.VITE_API_URL;


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


export function fetchMisPublicaciones() {
  const auth = getAuth();

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();

      if (!user) {
        reject(new Error("Usuario no autenticado"));
        return;
      }

      try {
        const token = await user.getIdToken();

        const response = await fetch(`${BASE_URL}/publicaciones/mis-publicaciones`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener tus publicaciones: ${response.statusText}`);
        }

        const data = await response.json();
        resolve(data.map(pub => new Publicacion(pub)));
      } catch (err) {
        reject(err);
      }
    });
  });
}


export function fetchUsuarioActual() {
  const auth = getAuth();

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // Evita que se llame múltiples veces

      if (!user) {
        reject(new Error("Usuario no autenticado"));
        return;
      }

      try {
        const token = await user.getIdToken();

        const res = await fetch(`${API_URL}/usuarios/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Error al obtener el usuario");

        const data = await res.json();
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  });
}

// talvez no seria lo mas profesional el usar la funcion de adopcion en este paso pero es la misma,
//aunque talvez seria mas conveiente hacer una carpeta de get general para eso
// Función para actualizar usuario
// perfilService.js

import { Usuario } from '../models/modeloPerfil';
// Función para obtener usuario por id
export async function obtenerUsuarioPorId(idUsuario) {
  try {
    const response = await fetch(`${BASE_URL}/usuario/${idUsuario}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener usuario');
    }

    const data = await response.json();
    return new Usuario(data);
  } catch (error) {
    console.error('Error en obtenerUsuarioPorId:', error.message);
    throw error;
  }
}

// Función para actualizar usuario
export async function actualizarUsuario(idUsuario, data) {
  try {
    const response = await fetch(`${BASE_URL}/usuario/${idUsuario}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar usuario');
    }

    const result = await response.json();
    return result.mensaje;
  } catch (error) {
    console.error('Error en actualizarUsuario:', error.message);
    throw error;
  }
}

//funcion para obtener los datos de un usuario con el uid, pero del usuario autenticado
export function configUsuarioActual() {
  const auth = getAuth();

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();

      if (!user) {
        reject(new Error('Usuario no autenticado'));
        return;
      }

      try {
        const token = await user.getIdToken();

        const response = await fetch(`${BASE_URL}/api/userconfig`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener datos del usuario: ${response.statusText}`);
        }

        const data = await response.json();
        resolve(new Usuario(data));
      } catch (error) {
        reject(error);
      }
    });
  });
}

// perfilService.js

export async function fetchPublicacionesPorUsuario(idUsuario) {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/${idUsuario}/publicaciones`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener publicaciones del usuario');
    }

    const data = await response.json();
    // Igual que en fetchMisPublicaciones, devolvemos instancias de Publicacion
    return data.map(pub => new Publicacion(pub));
  } catch (error) {
    console.error('Error en fetchPublicacionesPorUsuario:', error.message);
    throw error;
  }
}
