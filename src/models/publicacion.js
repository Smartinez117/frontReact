// src/models/publicacion.js
export const mapearPublicacion = (pub) => ({
  id: pub.id,
  titulo: pub.titulo,
  descripcion: pub.descripcion,
  categoria: pub.categoria,
  etiquetas: pub.etiquetas?.split(',').map(e => e.trim()) || [],
  coordenadas: pub.coordenadas,
  imagenes: pub.imagenes || [],
  fecha_creacion: pub.fecha_creacion,
  fecha_modificacion: pub.fecha_modificacion,
  id_usuario: pub.id_usuario,
  id_locacion: pub.id_locacion
});