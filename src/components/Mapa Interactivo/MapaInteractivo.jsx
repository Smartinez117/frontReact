
// src/components/MapaInteractivo.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Configurar icono personalizado (porque Leaflet a veces no carga el default en React)
const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapaInteractivo = () => {
  const [publicaciones, setPublicaciones] = useState([]);

  useEffect(() => {
    // Llamada al backend para traer publicaciones
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/publicaciones/mapa"); 
        const data = await res.json();
        setPublicaciones(data);
      } catch (error) {
        console.error("Error al traer publicaciones:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <MapContainer
        center={[-34.6037, -58.3816]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {publicaciones
          .filter(pub =>
            Array.isArray(pub.coordenadas) &&
            pub.coordenadas.length === 2 &&
            !isNaN(parseFloat(pub.coordenadas[0])) &&
            !isNaN(parseFloat(pub.coordenadas[1]))
          )
          .map((pub, idx) => {
            const lat = parseFloat(pub.coordenadas[0]);
            const lng = parseFloat(pub.coordenadas[1]);
            // Se asume que pub.imagenes es un array de URLs, se toma la primera imagen
            const imagenUrl = pub.imagen_principal;
            return (
              <Marker key={idx} position={[lat, lng]} icon={icon}>
                <Popup>
                  <strong>{pub.titulo}</strong><br />
                  {pub.descripcion}<br />
                  {imagenUrl && (
                    <img src={imagenUrl} alt={pub.titulo} style={{ width: "150px", maxHeight: "120px", objectFit: "cover", marginTop: "8px", borderRadius: "8px" }} />
                  )}
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default MapaInteractivo;
        

