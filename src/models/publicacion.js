// models/Publicacion.js
export default class Publicacion {
  constructor({
    id,
    id_usuario,
    id_locacion,
    titulo,
    descripcion,
    categoria,
    etiquetas,
    fecha_creacion,
    fecha_modificacion,
    coordenadas,
    imagenes = [], // arreglo de URLs de imágenes
  }) {
    this.id = id;
    this.id_usuario = id_usuario;
    this.id_locacion = id_locacion;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.categoria = categoria;
    this.etiquetas = etiquetas;
    this.fecha_creacion = fecha_creacion;
    this.fecha_modificacion = fecha_modificacion;
    this.coordenadas = coordenadas;
    this.imagenes = imagenes;
  }
}
