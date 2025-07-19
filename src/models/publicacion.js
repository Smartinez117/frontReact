export const crearPublicacionDesdeApi = (json) => ({
  id: json.id,
  titulo: json.titulo,
  descripcion: json.descripcion,
  categoria: json.categoria,
  coordenadas: json.coordenadas,
  etiquetas: json.etiquetas?.split(',').map(tag => tag.trim()), // transforma string en array
  imagenes: json.imagenes || [],
  fecha_creacion: json.fecha_creacion,
  fecha_modificacion: json.fecha_modificacion,
  id_usuario: json.id_usuario,
  id_locacion: json.id_locacion,
});