import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import * as React from 'react';

import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Textarea from '@mui/joy/Textarea';
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup';
import Select, { selectClasses } from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';

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
  const [seleccionado, setSeleccionado] = useState('');
  const [provincias, setProvincias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  const [provinciaId, setProvinciaId] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [localidadId, setLocalidadId] = useState('');
  const [coordenadas, setCoordenadas] = useState({ lat: -34.6, lng: -58.4 });

  // Fetch provincias
  useEffect(() => {
    fetch('http://localhost:5000/api/ubicacion/provincias')
      .then(res => res.json())
      .then(setProvincias)
      .catch(error => console.error('Error al obtener provincias:', error));
  }, []);

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

  const handleLocalidadChange = (id) => {
    setLocalidadId(id);
    const loc = localidades.find(l => l.id.toString() === id);
    if (loc) {
      setCoordenadas({ lat: parseFloat(loc.latitud), lng: parseFloat(loc.longitud) });
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md" sx={{ position: 'relative' }}>
        <Box
          sx={{
            bgcolor: '#ffffff',
            height: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        />
        <div>
          <h2>Crear publicación</h2>

          <ToggleButtonGroup
            value={seleccionado}
            onChange={(event, newValue) => setSeleccionado(newValue)}
            sx={{ my: 2, gap: 1, flexWrap: 'wrap' }}
          >
            <Button value="Adopción">Adopción</Button>
            <Button value="Búsqueda">Búsqueda</Button>
            <Button value="Encuentro">Encuentro</Button>
            <Button value="Estado Crítico">Estado Crítico</Button>
          </ToggleButtonGroup>

          <Input placeholder="Título" sx={{ my: 2 }} />
          <Textarea placeholder="Descripción del caso…" minRows={2} sx={{ mb: 2 }} />

          {/* Select: Provincia */}
          <Select
            placeholder="Seleccioná una provincia"
            value={provinciaId || null}
            onChange={(e, val) => setProvinciaId(val)}
            indicator={<KeyboardArrowDown />}
            sx={{
              width: '100%',
              mb: 2,
              [`& .${selectClasses.indicator}`]: {
                transition: '0.2s',
                [`&.${selectClasses.expanded}`]: {
                  transform: 'rotate(-180deg)',
                },
              },
            }}
          >
            {provincias.map((prov) => (
              <Option key={prov.id} value={prov.id.toString()}>{prov.nombre}</Option>
            ))}
          </Select>

          {/* Select: Departamento */}
          <Select
            placeholder="Seleccioná un departamento"
            value={departamentoId || null}
            onChange={(e, val) => setDepartamentoId(val)}
            disabled={!provinciaId}
            indicator={<KeyboardArrowDown />}
            sx={{ width: '100%', mb: 2 }}
          >
            {departamentos.map((d) => (
              <Option key={d.id} value={d.id.toString()}>{d.nombre}</Option>
            ))}
          </Select>

          {/* Select: Localidad */}
          <Select
            placeholder="Seleccioná una localidad"
            value={localidadId || null}
            onChange={(e, val) => handleLocalidadChange(val)}
            disabled={!departamentoId}
            indicator={<KeyboardArrowDown />}
            sx={{ width: '100%', mb: 3 }}
          >
            {localidades.map((l) => (
              <Option key={l.id} value={l.id.toString()}>{l.nombre}</Option>
            ))}
          </Select>

          {/* Mapa */}
          <div style={{ height: '400px', marginTop: '1rem' }}>
            <MapContainer
              center={[coordenadas.lat, coordenadas.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapaInteractivo lat={coordenadas.lat} lng={coordenadas.lng} setLatLng={setCoordenadas} />
            </MapContainer>
          </div>

          <p>Latitud: {coordenadas.lat.toFixed(6)} | Longitud: {coordenadas.lng.toFixed(6)}</p>
        </div>
      </Container>
    </React.Fragment>
  );
}
