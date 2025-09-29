
// src/components/MapaInteractivo.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Iconos por categoría
const markerIcons = {
  "Adopción": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
  "Búsqueda": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
  "Encuentro": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
  "Estado Crítico": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
};

// Icono para refugios (color rojo)
const shelterIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapaInteractivo = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [refugios, setRefugios] = useState([]);
  const [categoria, setCategoria] = useState("");

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

    // Llamada al backend Flask para traer refugios
    const fetchRefugios = async () => {
      try {
        const query = '[out:json][timeout:25];node[amenity=animal_shelter](-55,-73,-21,-53);out body;';
        const res = await fetch("http://localhost:5000/api/refugios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
        const data = await res.json();
        if (data && data.elements) {
          setRefugios(data.elements);
        }
      } catch (error) {
        console.error("Error al traer refugios:", error);
      }
    };
    fetchRefugios();
  }, []);

  // Obtener categorías únicas de las publicaciones
  const categoriasUnicas = Array.from(new Set(publicaciones.map(p => p.categoria))).filter(Boolean);

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 24 }}>
        <div>
          <label htmlFor="categoria-select" style={{ marginRight: 8 }}>Filtrar por categoría:</label>
          <select
            id="categoria-select"
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            style={{ padding: "4px 8px", fontSize: "16px" }}
          >
            <option value="">Todas</option>
            {categoriasUnicas.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" alt="Refugio" style={{ width: 20, height: 32, verticalAlign: "middle" }} />
          <span style={{ fontSize: "15px", color: "#b71c1c" }}>Marcadores rojos: Refugios de mascotas</span>
        </div>
      </div>
      <MapContainer
        center={[-34.6037, -58.3816]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* Marcadores de publicaciones */}
        {publicaciones
          .filter(pub =>
            (categoria === "" || pub.categoria === categoria) &&
            Array.isArray(pub.coordenadas) &&
            pub.coordenadas.length === 2 &&
            !isNaN(parseFloat(pub.coordenadas[0])) &&
            !isNaN(parseFloat(pub.coordenadas[1]))
          )
          .map((pub, idx) => {
            const lat = parseFloat(pub.coordenadas[0]);
            const lng = parseFloat(pub.coordenadas[1]);
            const imagenUrl = pub.imagen_principal;
            const iconCat = markerIcons[pub.categoria] || markerIcons["Adopción"];
            return (
              <Marker key={"pub-"+idx} position={[lat, lng]} icon={iconCat}>
                <Popup>
                  <a
                    href={`/publicacion/${pub.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <strong style={{ color: "#1976d2", cursor: "pointer" }}>{pub.titulo}</strong>
                  </a><br />
                  {pub.descripcion}<br />
                  {imagenUrl && (
                    <a href={`/publicacion/${pub.id}`} style={{ display: "inline-block" }}>
                      <img src={imagenUrl} alt={pub.titulo} style={{ width: "150px", maxHeight: "120px", objectFit: "cover", marginTop: "8px", borderRadius: "8px", cursor: "pointer" }} />
                    </a>
                  )}
                  <br /><span style={{ fontWeight: "bold", color: "#555" }}>Categoría: {pub.categoria}</span>
                </Popup>
              </Marker>
            );
          })}
        {/* Marcadores de refugios */}
        {refugios.map((ref, idx) => (
          <Marker
            key={"ref-"+idx}
            position={[ref.lat, ref.lon]}
            icon={shelterIcon}
          >
            <Popup>
              <strong>{ref.tags && ref.tags.name ? ref.tags.name : "Refugio de mascotas"}</strong><br />
              {ref.tags && ref.tags.phone && (<span>Tel: {ref.tags.phone}<br /></span>)}
              {ref.tags && ref.tags.website && (<a href={ref.tags.website} target="_blank" rel="noopener noreferrer">Sitio web</a>)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapaInteractivo;
        

