// modeloPerfil.js
export class Usuario {
  constructor({
    id,
    firebase_uid,
    nombre,
    email,
    foto_perfil_url,
    rol,
    fecha_registro,
    telefono_pais,
    telefono_numero_local,
    descripcion,
  }) {
    this.id = id;
    this.firebase_uid = firebase_uid;
    this.nombre = nombre;
    this.email = email;
    this.foto_perfil_url = foto_perfil_url;
    this.rol = rol;
    this.fecha_registro = fecha_registro;
    this.telefono_pais = telefono_pais;
    this.telefono_numero_local = telefono_numero_local;
    this.descripcion = descripcion;
  }
}
