import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Importaciones de Material UI para diseño profesional
import { 
  Box, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  Chip,
  Stack
} from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PetsIcon from '@mui/icons-material/Pets';

const API_URL = import.meta.env.VITE_API_URL;

// --- CONFIGURACIÓN MAESTRA POR ID ---
const CATEGORIAS_CONFIG = {
  0: { label: "¡Busco un hogar!", color: "blue" },    
  1: { label: "¡Me encontraron!", color: "orange" },  
  2: { label: "¡Me perdí!",       color: "green" },   
  3: { label: "¡Ayuda urgente!",  color: "violet" }   
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

const ICONS_BY_ID = Object.keys(CATEGORIAS_CONFIG).reduce((acc, id) => {
  acc[id] = createIcon(CATEGORIAS_CONFIG[id].color);
  return acc;
}, {});

const defaultIcon = createIcon("blue");

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
    <Box sx={{ width: "100%", height: "600px", position: "relative" }}>
      
      {/* --- BARRA SUPERIOR FLOTANTE (DISEÑO MEJORADO) --- */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 2, 
          background: 'rgba(255, 255, 255, 0.95)', // Ligeramente transparente
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        {/* Selector de Categoría */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="filtro-label">Filtrar por categoría</InputLabel>
          <Select
            labelId="filtro-label"
            value={filtroId}
            label="Filtrar por categoría"
            onChange={(e) => setFiltroId(e.target.value)}
          >
            <MenuItem value=""><em>Mostrar todas</em></MenuItem>
            {Object.entries(CATEGORIAS_CONFIG).map(([id, config]) => (
              <MenuItem key={id} value={id}>
                <Stack direction="row" alignItems="center" gap={1}>
                  {/* Círculo de color indicativo */}
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: config.color === 'violet' ? 'purple' : config.color }} />
                  {config.label}
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Leyenda de Refugios (Chip estético) */}
        <Chip 
          icon={<LocationOnIcon sx={{ color: '#d32f2f !important' }} />} 
          label="Refugios y Veterinarias" 
          variant="outlined"
          sx={{ 
            borderColor: '#ef9a9a', 
            bgcolor: '#ffebee',
            color: '#c62828',
            fontWeight: 'bold'
          }} 
        />
      </Paper>
      
      {/* --- MAPA --- */}
      <Paper elevation={2} sx={{ height: "100%", borderRadius: 2, overflow: 'hidden' }}>
        <MapContainer
          center={[-34.6037, -58.3816]}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* MARCADORES DE PUBLICACIONES */}
          {publicaciones.map((pub, idx) => {
              if (!Array.isArray(pub.coordenadas) || pub.coordenadas.length !== 2) return null;
              const lat = parseFloat(pub.coordenadas[0]);
              const lng = parseFloat(pub.coordenadas[1]);
              if (isNaN(lat) || isNaN(lng)) return null;

              const catId = pub.categoria ? pub.categoria.id : null;

              if (filtroId !== "" && String(catId) !== String(filtroId)) {
                  return null;
              }

              const icon = ICONS_BY_ID[catId] || defaultIcon;
              const labelAmigable = CATEGORIAS_CONFIG[catId] ? CATEGORIAS_CONFIG[catId].label : "Sin categoría";
              const imagenUrl = pub.imagen_principal;

              return (
                <Marker key={"pub-"+idx} position={[lat, lng]} icon={icon}>
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                        {imagenUrl && (
                            <img 
                                src={imagenUrl} 
                                alt={pub.titulo} 
                                style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} 
                            />
                        )}
                        <a
                        href={`/publicacion/${pub.id}`}
                        style={{ textDecoration: "none", color: "#1976d2", fontSize: '1.1em', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}
                        >
                        {pub.titulo}
                        </a>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {pub.descripcion ? pub.descripcion.substring(0, 60) + '...' : ''}
                        </Typography>
                        <Chip label={labelAmigable} size="small" color="primary" variant="outlined" />
                    </div>
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
                    <div style={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1, color: '#d32f2f' }}>
                            <PetsIcon fontSize="small" />
                            <strong>Refugio / Veterinaria</strong>
                        </Box>
                        <strong>{ref.tags && ref.tags.name ? ref.tags.name : "Sin nombre registrado"}</strong><br />
                        
                        {ref.tags && ref.tags.phone && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                📞 {ref.tags.phone}
                            </Typography>
                        )}
                        
                        {ref.tags && ref.tags.website && (
                            <a href={ref.tags.website} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '8px' }}>
                                Visitar Sitio Web
                            </a>
                        )}
                    </div>
                  </Popup>
                </Marker>
              );
          })}
        </MapContainer>
      </Paper>
    </Box>
  );
};

export default MapaInteractivo;