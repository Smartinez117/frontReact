import React from "react";
import { Box } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Configurar íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const MapaUbicacion = ({ coordenadas }) => {
  return (
    <Box sx={{ height: 300 }}>
      <MapContainer
        center={[coordenadas[0], coordenadas[1]]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", borderRadius: 8 }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordenadas[0], coordenadas[1]]}>
          <Popup>Ubicación de la publicación</Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
};

export default MapaUbicacion;
