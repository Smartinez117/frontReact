const BASE_URL = 'http://localhost:5000';

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
