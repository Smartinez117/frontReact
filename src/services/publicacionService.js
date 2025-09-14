import axios from "axios";
import { getAuth } from "firebase/auth";

const BASE_URL = "http://localhost:5000";

// Función genérica para manejar requests
const manejarRequest = async (url, opciones = {}) => {
  try {
    const respuesta = await axios({ url, ...opciones });
    return respuesta.data;
  } catch (error) {
    console.error(`Error en request a ${url}:`, error);
    throw new Error(error.response?.data?.error || "Error de conexión");
  }
};

// Obtener publicación por ID
export const fetchPublicacionPorId = async (id) => {
  return manejarRequest(`${BASE_URL}/publicaciones/${id}`);
};

// Obtener usuario por ID
export const fetchUsuario = async (id) => {
  return manejarRequest(`${BASE_URL}/usuario/${id}`);
};

// Obtener comentarios de publicación
export const fetchComentariosPublicacion = async (idPublicacion) => {
  const comentarios = await manejarRequest(
    `${BASE_URL}/comentarios/publicacion/${idPublicacion}`
  );

  // Obtener datos de usuarios de comentarios
  const idsUnicos = [...new Set(comentarios.map(c => c.id_usuario))];
  const usuariosMap = {};

  await Promise.all(
    idsUnicos.map(async (idUsuario) => {
      try {
        const usuario = await fetchUsuario(idUsuario);
        usuariosMap[idUsuario] = usuario;
      } catch (error) {
        console.error(`Error obteniendo usuario ${idUsuario}:`, error);
      }
    })
  );

  return { comentarios, usuarios: usuariosMap };
};

// Enviar comentario
export const enviarComentario = async (idPublicacion, descripcion) => {
  const auth = getAuth();
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debés iniciar sesión para comentar");
  }

  const token = await usuario.getIdToken();

  return manejarRequest(`${BASE_URL}/comentarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    data: {
      id_publicacion: Number(idPublicacion),
      descripcion,
    },
  });
};

// Descargar PDF
export const descargarPDF = async (idPublicacion, titulo) => {
  try {
    const respuesta = await axios.get(`${BASE_URL}/pdf/${idPublicacion}`, {
      responseType: "blob",
    });

    const blob = new Blob([respuesta.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `publicacion_${titulo || idPublicacion}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error descargando PDF:", error);
    throw new Error("Error al descargar el PDF");
  }
};

// Compartir publicación
export const compartirPublicacion = (idPublicacion, titulo) => {
  const url = `${window.location.origin}/publicacion/${idPublicacion}`;

  if (navigator.share) {
    navigator.share({
      title: titulo || "Publicación",
      text: `Mirá esta publicación: ${titulo || "Publicación"}`,
      url,
    }).catch((error) => {
      console.error("Error al compartir:", error);
      // Fallback a copiar al portapapeles
      navigator.clipboard.writeText(url).then(() => {
        alert("Enlace copiado al portapapeles");
      });
    });
  } else {
    // Fallback para navegadores que no soportan Web Share API
    navigator.clipboard.writeText(url).then(() => {
      alert("Enlace copiado al portapapeles");
    });
  }
};