const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}`;

// Función para marcar notificación como leída
export async function marcarNotificacionLeida(idNotificacion) {
  const response = await fetch(`${BASE_URL}/notificaciones/leida/${idNotificacion}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Error al marcar notificación como leída: ${response.statusText}`);
  }

  const data = await response.json();
  return data; // respuesta del backend, puede contener información de confirmación
}







