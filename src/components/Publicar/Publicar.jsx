import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';


// Fix para que aparezcan los íconos de marcador en Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const marcadorIcono = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapaInteractivo({ lat, lng, setLatLng }) {
  const map = useMapEvents({
    click(e) {
      setLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng]);

  return <Marker position={[lat, lng]} icon={marcadorIcono} />;
}

export default function Publicar() {
  const [provincias, setProvincias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  const [provinciaId, setProvinciaId] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [localidadId, setLocalidadId] = useState('');
  const [coordenadas, setCoordenadas] = useState({ lat: -34.6, lng: -58.4 }); // Por defecto Buenos Aires

  // Fetch provincias al montar
useEffect(() => {
  fetch('http://localhost:5000/api/ubicacion/provincias')
    .then(res => res.json())
    .then(data => {
      setProvincias(data); // o como se llame tu setter
    })
    .catch(error => console.error('Error al obtener provincias:', error));
}, []);


  // Fetch departamentos
  useEffect(() => {
    if (provinciaId) {
      fetch(`http://localhost:5000/api/ubicacion/departamentos?provincia_id=${provinciaId}`)
        .then(res => res.json())
        .then(setDepartamentos);
    } else {
      setDepartamentos([]);
      setDepartamentoId('');
    }
  }, [provinciaId]);

  // Fetch localidades
  useEffect(() => {
    if (departamentoId) {
      fetch(`http://localhost:5000/api/ubicacion/localidades?departamento_id=${departamentoId}`)
        .then(res => res.json())
        .then(setLocalidades);
    } else {
      setLocalidades([]);
      setLocalidadId('');
    }
  }, [departamentoId]);

  // Al elegir localidad, actualizar coordenadas del mapa
  const handleLocalidadChange = (e) => {
    const id = e.target.value;
    setLocalidadId(id);
    const loc = localidades.find(l => l.id.toString() === id);
    if (loc) {
      setCoordenadas({ lat: parseFloat(loc.latitud), lng: parseFloat(loc.longitud) });
    }
  };

  return (
    <div>
      <h2>Publicar Mascota</h2>

      <label>Provincia:</label>
      <select value={provinciaId} onChange={e => setProvinciaId(e.target.value)}>
        <option value="">Seleccioná una provincia</option>
        {provincias.map(prov => (
          <option key={prov.id} value={prov.id}>{prov.nombre}</option>
        ))}
      </select>


      <label>Departamento / Municipio:</label>
      <select value={departamentoId} onChange={e => setDepartamentoId(e.target.value)} disabled={!provinciaId}>
        <option value="">Seleccionar...</option>
        {departamentos.map(d => (
          <option key={d.id} value={d.id}>{d.nombre}</option>
        ))}
      </select>

      <label>Localidad:</label>
      <select value={localidadId} onChange={handleLocalidadChange} disabled={!departamentoId}>
        <option value="">Seleccionar...</option>
        {localidades.map(l => (
          <option key={l.id} value={l.id}>{l.nombre}</option>
        ))}
      </select>

      <div style={{ height: '400px', marginTop: '1rem' }}>
        <MapContainer
          center={[coordenadas.lat, coordenadas.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapaInteractivo lat={coordenadas.lat} lng={coordenadas.lng} setLatLng={setCoordenadas} />
        </MapContainer>
      </div>

      <p>Latitud: {coordenadas.lat.toFixed(6)} | Longitud: {coordenadas.lng.toFixed(6)}</p>
    </div>
  );
}
