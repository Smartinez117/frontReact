import { BASE_URL } from "../utils/constants";

// Función para obtener provincias
export const fetchProvinces = async () => {
  const response = await fetch(`${BASE_URL}/api/ubicacion/provincias`);
  return response.json();
};

// Función para obtener departamentos por provincia
export const fetchDepartments = async (provinceId) => {
  const response = await fetch(`${BASE_URL}/api/ubicacion/departamentos?provincia_id=${provinceId}`);
  return response.json();
};

// Función para obtener localidades por departamento
export const fetchLocalities = async (departmentId) => {
  const response = await fetch(`${BASE_URL}/api/ubicacion/localidades?departamento_id=${departmentId}`);
  return response.json();
};

// Función para obtener etiquetas
export const fetchTags = async () => {
  const response = await fetch(`${BASE_URL}/api/etiquetas`);
  return response.json();
};

// Función para subir imágenes
export const uploadImages = async (images) => {
  const formData = new FormData();
  images.forEach(img => formData.append("imagenes", img));

  const response = await fetch(`${BASE_URL}/subir-imagenes`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error al subir imágenes");
  }

  return response.json();
};

// Función para crear publicación
export const createPublication = async (publicationData, token) => {
  const response = await fetch(`${BASE_URL}/publicaciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(publicationData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error en el envío");
  }

  return response.json();
};