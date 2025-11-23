import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const API_URL = import.meta.env.VITE_API_URL;

// --- CONFIGURACIÓN MAESTRA POR ID ---
// Clave: ID de la categoría en tu Base de Datos.
// Valor: Configuración visual (Texto amigable y color del icono).
const CATEGORIAS_CONFIG = {
  0: { label: "¡Busco un hogar!", color: "blue" },    // Adopción
  1: { label: "¡Me encontraron!", color: "orange" },  // Encuentro
  2: { label: "¡Me perdí!",       color: "green" },   // Pérdida
  3: { label: "¡Ayuda urgente!",  color: "violet" }   // Estado Crítico
};

// Función auxiliar para generar iconos dinámicamente
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    iconRetinaUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// Generamos el objeto de iconos mapeados por ID
// Resultado: { 0: IconoAzul, 1: IconoNaranja, ... }
const ICONS_BY_ID = Object.keys(CATEGORIAS_CONFIG).reduce((acc, id) => {
  acc[id] = createIcon(CATEGORIAS_CONFIG[id].color);
  return acc;
}, {});

// Icono por defecto (por si viene un ID desconocido)
const defaultIcon = createIcon("blue");

// Icono para refugios
const shelterIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const MapaInteractivo = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [refugios, setRefugios] = useState([]);
  
  // El estado del filtro ahora guardará el ID (como string o número)
  const [filtroId, setFiltroId] = useState("");

  useEffect(() => {
    // 1. Traer publicaciones
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/publicaciones/mapa`); 
        const data = await res.json();
        setPublicaciones(data);
      } catch (error) {
        console.error("Error al traer publicaciones:", error);
      }
    };
    fetchData();

    // 2. Traer refugios
    const fetchRefugios = async () => {
      try {
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="animal_shelter"](-55,-73,-21,-53);
            way["amenity"="animal_shelter"](-55,-73,-21,-53);
            relation["amenity"="animal_shelter"](-55,-73,-21,-53);
          );
          out center;
        `;
        const res = await fetch(`${API_URL}/api/refugios`, {
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

  return (
    <div style={{ width: "100%", height: "600px" }}>
      
      {/* --- BARRA DE FILTROS --- */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 24 }}>
        <div>
          <label htmlFor="categoria-select" style={{ marginRight: 8 }}>Filtrar por categoría:</label>
          <select
            id="categoria-select"
            value={filtroId}
            onChange={e => setFiltroId(e.target.value)}
            style={{ padding: "4px 8px", fontSize: "16px" }}
          >
            <option value="">Todas</option>
            {/* Iteramos sobre la configuración para crear las opciones */}
            {Object.entries(CATEGORIAS_CONFIG).map(([id, config]) => (
              <option key={id} value={id}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" alt="Refugio" style={{ width: 20, height: 32, verticalAlign: "middle" }} />
          <span style={{ fontSize: "15px", color: "#b71c1c" }}>Marcadores rojos: Refugios de mascotas</span>
        </div>
      </div>
      
      {/* --- MAPA --- */}
      <MapContainer
        center={[-34.6037, -58.3816]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* MARCADORES DE PUBLICACIONES */}
        {publicaciones
          .map((pub, idx) => {
            // A. Validaciones de seguridad
            if (!Array.isArray(pub.coordenadas) || pub.coordenadas.length !== 2) return null;
            const lat = parseFloat(pub.coordenadas[0]);
            const lng = parseFloat(pub.coordenadas[1]);
            if (isNaN(lat) || isNaN(lng)) return null;

            // B. Obtener el ID de la categoría
            // Dependiendo de tu backend, puede venir en pub.categoria.id o pub.id_categoria
            // Asumimos pub.categoria.id porque 'categoria' es un objeto según vimos antes
            const catId = pub.categoria ? pub.categoria.id : null;

            // C. Aplicar Filtro
            // Si hay filtro activo Y el ID no coincide, no renderizamos
            if (filtroId !== "" && String(catId) !== String(filtroId)) {
                return null;
            }

            // D. Obtener Icono y Texto usando el ID
            const icon = ICONS_BY_ID[catId] || defaultIcon;
            const labelAmigable = CATEGORIAS_CONFIG[catId] ? CATEGORIAS_CONFIG[catId].label : "Sin categoría";
            const imagenUrl = pub.imagen_principal;

            return (
              <Marker key={"pub-"+idx} position={[lat, lng]} icon={icon}>
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
                  <br />
                  <span style={{ fontWeight: "bold", color: "#555" }}>
                    Categoría: {labelAmigable}
                  </span>
                </Popup>
              </Marker>
            );
          })}
          
        {/* MARCADORES DE REFUGIOS */}
        {refugios.map((ref, idx) => {
            const rLat = ref.lat || (ref.center ? ref.center.lat : null);
            const rLon = ref.lon || (ref.center ? ref.center.lon : null);
            if (!rLat || !rLon) return null;

            return (
              <Marker
                key={"ref-"+idx}
                position={[rLat, rLon]}
                icon={shelterIcon}
              >
                <Popup>
                  <strong>{ref.tags && ref.tags.name ? ref.tags.name : "Refugio de mascotas"}</strong><br />
                  {ref.tags && ref.tags.phone && (<span>Tel: {ref.tags.phone}<br /></span>)}
                  {ref.tags && ref.tags.website && (<a href={ref.tags.website} target="_blank" rel="noopener noreferrer">Sitio web</a>)}
                </Popup>
              </Marker>
            );
        })}
      </MapContainer>
    </div>
  );
};

export default MapaInteractivo;