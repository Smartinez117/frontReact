import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const API_URL = import.meta.env.VITE_API_URL;

// 1. Diccionario para traducir lo que viene de la BD a tus textos del frontend
const TITULOS_AMIGABLES = {
  "Adopción": "¡Busco un hogar!",
  "Adopcion": "¡Busco un hogar!",
  "Búsqueda": "¡Me perdí!",
  "Busqueda": "¡Me perdí!",
  "Perdido": "¡Me perdí!",
  "Encuentro": "¡Me encontraron!",
  "Encontrado": "¡Me encontraron!", 
  "Estado Crítico": "¡Necesito ayuda urgente!",
  "Estado Critico": "¡Necesito ayuda urgente!",
  "Crítico": "¡Necesito ayuda urgente!",
  "Urgente": "¡Necesito ayuda urgente!"
};

// Iconos por categoría (Las claves coinciden con los valores de TITULOS_AMIGABLES)
const markerIcons = {
  "¡Busco un hogar!": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
  "¡Me perdí!": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
  "¡Me encontraron!": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
  "¡Necesito ayuda urgente!": new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
};

// Icono para refugios
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
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  useEffect(() => {
    // Traer publicaciones
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

    // Traer refugios (Tu código que ya funciona)
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
        const res = await fetch(`${API_URL}/refugios`, {
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

  // Función auxiliar para obtener el nombre limpio
  const getCategoriaAmigable = (pub) => {
    // Si es objeto, saca .nombre, si es string, úsalo, sino vacío
    const nombreDB = (pub.categoria && pub.categoria.nombre) ? pub.categoria.nombre : (pub.categoria || "");
    // Traducir
    return TITULOS_AMIGABLES[nombreDB] || nombreDB || "Sin categoría";
  };

  // Obtener categorías únicas para el Select
  const categoriasUnicas = Array.from(new Set(
    publicaciones.map(p => getCategoriaAmigable(p))
  )).filter(Boolean);

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 24 }}>
        <div>
          <label htmlFor="categoria-select" style={{ marginRight: 8 }}>Filtrar por categoría:</label>
          <select
            id="categoria-select"
            value={categoriaSeleccionada}
            onChange={e => setCategoriaSeleccionada(e.target.value)}
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
          .map((pub, idx) => {
            // 1. Validar coordenadas
            if (!Array.isArray(pub.coordenadas) || pub.coordenadas.length !== 2) return null;
            const lat = parseFloat(pub.coordenadas[0]);
            const lng = parseFloat(pub.coordenadas[1]);
            if (isNaN(lat) || isNaN(lng)) return null;

            // 2. Obtener nombre amigable
            const nombreAmigable = getCategoriaAmigable(pub);

            // 3. Filtrar
            if (categoriaSeleccionada !== "" && nombreAmigable !== categoriaSeleccionada) {
                return null;
            }

            // 4. Asignar icono
            const iconCat = markerIcons[nombreAmigable] || markerIcons["¡Busco un hogar!"];
            const imagenUrl = pub.imagen_principal;

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
                  <br />
                  <span style={{ fontWeight: "bold", color: "#555" }}>Categoría: {nombreAmigable}</span>
                </Popup>
              </Marker>
            );
          })}
          
        {/* Marcadores de refugios */}
        {refugios.map((ref, idx) => {
            // Manejo de centro si es Way/Relation (usando 'center' que trae Overpass con 'out center')
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