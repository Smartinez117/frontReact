// qr.jsx
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { fetchQrData } from "../../services/qrService.js";

// Modelo simple para tipar (opcional si usas TypeScript, solo ejemplo)
function QRModel({ url_codificada, imagen_base64 }) {
  this.urlCodificada = url_codificada;
  this.imagenBase64 = imagen_base64;
}

export default function QR({ idPublicacion }) {
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState(null);


  useEffect(() => {
    setError(null);
    setQrData(null);

    fetchQrData(idPublicacion)
      .then((data) => {
        console.log("Datos del QR recibidos:", data);
        // Crear instancia del modelo (opcional)
        setQrData(data);
      })
      .catch((err) => setError(err.message));
  }, [idPublicacion]);

  if (error) return <div>Error: {error}</div>;
  if (!qrData) return <div>Cargando código QR...</div>;


  return (
    <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
      <div>
        <img
          src={`data:image/png;base64,${qrData.imagen_base64}`}  
          alt="Código QR backend"
          width={200}
          height={200}
          style={{ border: "1px solid #ccc" }}
        />
      </div>
    </div>
  );
}
