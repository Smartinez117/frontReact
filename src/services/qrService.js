// qr.js
export async function fetchQrData(idPublicacion) {
  try {
    const response = await fetch(`http://localhost:5000/qr/${idPublicacion}`);
    if (!response.ok) {
      throw new Error("Error en la llamada al endpoint QR");
    }
    const data = await response.json();
    return data; // { url_codificada, imagen_base64 }
  } catch (error) {
    console.error("fetchQrData error:", error);
    throw error;
  }
}
