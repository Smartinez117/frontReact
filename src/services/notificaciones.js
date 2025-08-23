import { getAuth, onAuthStateChanged } from "firebase/auth";

const BASE_URL = 'http://localhost:5000'; // O la URL que uses

export function obtenerNotificacionesPropiasService() {
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

        const response = await fetch(`${BASE_URL}/notificacionespropias`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener notificaciones: ${response.statusText}`);
        }

        const data = await response.json();
        resolve(data); // lista de notificaciones [{id, titulo, id_publicacion}, ...]

      } catch (error) {
        reject(error);
      }
    });
  });
}
