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
import Autocomplete from '@mui/joy/Autocomplete';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import SvgIcon from '@mui/joy/SvgIcon';
import Alert from '@mui/joy/Alert';
import Typography from '@mui/joy/Typography';
import { styled } from '@mui/joy';
import CircularProgress from '@mui/material/CircularProgress';


import { getAuth } from "firebase/auth";

import { useNavigate } from 'react-router-dom';

import { mostrarAlerta } from '../../utils/confirmservice.js'; 

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

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
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [seleccionado, setSeleccionado] = useState('');
  const [provincias, setProvincias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [provinciaId, setProvinciaId] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [localidadId, setLocalidadId] = useState('');
  const [coordenadas, setCoordenadas] = useState({ lat: -34.6, lng: -58.4 });
  const [etiquetas, setEtiquetas] = useState([]);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([]);
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
  const [errores, setErrores] = useState([]);
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  
  const validarCampos = () => {
    const nuevosErrores = [];
    if (!seleccionado) nuevosErrores.push("Categoría");
    if (!titulo.trim()) nuevosErrores.push("Título");
    if (!descripcion.trim()) nuevosErrores.push("Descripción");
    if (descripcion.length > 500) nuevosErrores.push("Descripción excede 500 caracteres");
    if (!provinciaId) nuevosErrores.push("Provincia");
    if (!departamentoId) nuevosErrores.push("Departamento");
    if (!localidadId) nuevosErrores.push("Localidad");
    if (etiquetasSeleccionadas.length === 0) nuevosErrores.push("Etiquetas");
    if (imagenesSeleccionadas.length === 0) nuevosErrores.push("Imágenes");
    return nuevosErrores;
  };

  const camposValidos = (campo) => !errores.includes(campo);

  useEffect(() => {
    fetch(`${API_URL}/api/ubicacion/provincias`)
      .then(res => res.json())
      .then(setProvincias)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (provinciaId) {
      fetch(`${API_URL}/api/ubicacion/departamentos?provincia_id=${provinciaId}`)
        .then(res => res.json())
        .then(setDepartamentos);
    } else {
      setDepartamentos([]);
      setDepartamentoId('');
    }
  }, [provinciaId]);

  useEffect(() => {
    if (departamentoId) {
      fetch(`${API_URL}/api/ubicacion/localidades?departamento_id=${departamentoId}`)
        .then(res => res.json())
        .then(setLocalidades);
    } else {
      setLocalidades([]);
      setLocalidadId('');
    }
  }, [departamentoId]);

  useEffect(() => {
    fetch(`${API_URL}/api/etiquetas`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(e => ({ label: e.nombre, id: e.id }));
        setEtiquetas(mapped);
        const iniciales = mapped.filter(et => ['Perro', 'Gato'].includes(et.label));
        setEtiquetasSeleccionadas(iniciales);
      });
  }, []);

  const handleLocalidadChange = (id) => {
    setLocalidadId(id);
    const loc = localidades.find(l => l.id.toString() === id);
    if (loc) {
      setCoordenadas({ lat: parseFloat(loc.latitud), lng: parseFloat(loc.longitud) });
    }
  };

  const handleImagenesChange = (event) => {
    const files = Array.from(event.target.files);
    setImagenesSeleccionadas(files);
  };

  const handlePublicar = async () => {
    const nuevosErrores = validarCampos();
    setErrores(nuevosErrores);
    if (nuevosErrores.length > 0) return;

    setCargando(true);

    try {
      const formData = new FormData();
      imagenesSeleccionadas.forEach((img) => {
        formData.append("imagenes", img);
      });

      const resImagenes = await fetch(`${API_URL}/subir-imagenes`, {
        method: "POST",
        body: formData,
      });

      if (!resImagenes.ok) throw new Error("Error al subir imágenes");

      const dataImagenes = await resImagenes.json();
      const urlsImagenes = dataImagenes.urls;

      const datos = {
        categoria: seleccionado,
        titulo,
        descripcion,
        id_locacion: localidadId,
        coordenadas,
        etiquetas: etiquetasSeleccionadas.map(e => e.id),
        imagenes: urlsImagenes
      };

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        mostrarAlerta({
          titulo: '⚠️ Sesión requerida',
          mensaje: 'Debés iniciar sesión para publicar',
          tipo: 'warning'
        });
        return;
      }
      const token = await user.getIdToken();

      const res = await fetch(`${API_URL}/publicaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datos),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Publicación creada:", data);
        mostrarAlerta({
          titulo: '✅ ¡Listo!',
          mensaje: 'Publicación enviada con éxito',
          tipo: 'success'
        });
        navigate(`/publicacion/${data.id_publicacion}`);
      } else {
        throw new Error(data.error || "Error en el envío");
      }
    } catch (error) {
      console.error("Error al publicar:", error);
      mostrarAlerta({
        titulo: 'Error',
        mensaje: 'Ocurrió un error al publicar',
        tipo: 'error'
      });
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md">
        <Typography level="h3" sx={{ mt: 2 }}>Crear publicación</Typography>

        <ToggleButtonGroup
          value={seleccionado}
          onChange={(event, newValue) => setSeleccionado(newValue)}
          sx={{ my: 2, gap: 1, flexWrap: 'wrap' }}
          type="single"
        >
          {["¡Busco un hogar!", "¡Me perdí!", "¡Me encontraron!", "¡Necesito ayuda urgente!"].map(opcion => (
            <Button
              key={opcion}
              value={opcion}
              color={seleccionado === opcion ? "success" : errores.includes("Categoría") ? "danger" : "neutral"}
            >
              {opcion}
            </Button>
          ))}
        </ToggleButtonGroup>

        <Input
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          color={titulo.trim() ? "success" : errores.includes("Título") ? "danger" : "neutral"}
          sx={{ my: 2 }}
        />

        <Textarea
          placeholder="Descripción del caso…"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          minRows={2}
          maxRows={5}
          color={descripcion && descripcion.length <= 500 ? "success" : errores.includes("Descripción") ? "danger" : "neutral"}
          sx={{ mb: 2 }}
        />

        <Select
          placeholder="Seleccioná una provincia"
          value={provinciaId || null}
          onChange={(e, val) => setProvinciaId(val)}
          indicator={<KeyboardArrowDown />}
          color={provinciaId ? "success" : errores.includes("Provincia") ? "danger" : "neutral"}
          sx={{ width: '100%', mb: 2 }}
        >
          {provincias.map((prov) => (
            <Option key={prov.id} value={prov.id.toString()}>{prov.nombre}</Option>
          ))}
        </Select>

        <Select
          placeholder="Seleccioná un partido/departamento/comuna"
          value={departamentoId || null}
          onChange={(e, val) => setDepartamentoId(val)}
          disabled={!provinciaId}
          indicator={<KeyboardArrowDown />}
          color={departamentoId ? "success" : errores.includes("Departamento") ? "danger" : "neutral"}
          sx={{ width: '100%', mb: 2 }}
        >
          {departamentos.map((d) => (
            <Option key={d.id} value={d.id.toString()}>{d.nombre}</Option>
          ))}
        </Select>

        <Select
          placeholder="Seleccioná una localidad/barrio"
          value={localidadId || null}
          onChange={(e, val) => handleLocalidadChange(val)}
          disabled={!departamentoId}
          indicator={<KeyboardArrowDown />}
          color={localidadId ? "success" : errores.includes("Localidad") ? "danger" : "neutral"}
          sx={{ width: '100%', mb: 3 }}
        >
          {localidades.map((l) => (
            <Option key={l.id} value={l.id.toString()}>{l.nombre}</Option>
          ))}
        </Select>

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

        <Typography level="body2" sx={{ mt: 1 }}>
          Latitud: {coordenadas.lat.toFixed(6)} | Longitud: {coordenadas.lng.toFixed(6)}
        </Typography>

        <FormControl sx={{ mt: 3 }}>
          <FormLabel>Etiquetas</FormLabel>
          <Autocomplete
            multiple
            placeholder="Seleccioná etiquetas"
            limitTags={3}
            options={etiquetas}
            value={etiquetasSeleccionadas}
            onChange={(event, value) => setEtiquetasSeleccionadas(value)}
            getOptionLabel={(option) => option.label}
            color={
              etiquetasSeleccionadas.length > 0
                ? "success"
                : errores.includes("Etiquetas")
                ? "danger"
                : "neutral"
            }
            sx={{ width: '100%' }}
          />
        </FormControl>

        <Button
          component="label"
          variant="outlined"
          color={
            imagenesSeleccionadas.length > 0
              ? "success"
              : errores.includes("Imágenes")
              ? "danger"
              : "neutral"
          }
          startDecorator={<SvgIcon>...</SvgIcon>}
        >
          Subir imágenes ({imagenesSeleccionadas.length})
          <VisuallyHiddenInput type="file" multiple accept="image/*" onChange={handleImagenesChange} />
        </Button>

        {imagenesSeleccionadas.length > 0 && (
          <Typography level="body2" sx={{ mt: 1, color: '#666' }}>
            {imagenesSeleccionadas.map(file => file.name).join(', ')}
          </Typography>
        )}

        {errores.length > 0 && (
          <Alert color="danger" variant="soft" sx={{ my: 2 }}>
            Faltan completar los siguientes campos: {errores.join(", ")}
          </Alert>
        )}

        <Button
          size="lg"
          variant="solid"
          disabled={cargando}
          sx={{
            width: '100%',
            mt: 4,
            backgroundColor: '#F1B400',
            color: '#0D171C',
            '&:hover': { backgroundColor: '#d9a900' },
            // un ligero estilo para cuando está deshabilitado
            '&.JoyButton-root[disabled]': {
              opacity: 0.7,
              pointerEvents: 'none'
            }
          }}
          onClick={handlePublicar}
        >
          {cargando ? (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={18} />
              <span>Publicando…</span>
            </Box>
          ) : (
            "Publicar"
          )}
        </Button>

      </Container>
    </React.Fragment>
  );
}
