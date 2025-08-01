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

import { getAuth } from "firebase/auth";

import { useNavigate, useParams} from 'react-router-dom';

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

export default function Editar() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [seleccionado, setSeleccionado] = useState('');
  const [provincias, setProvincias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [provinciaId, setProvinciaId] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [localidadId, setLocalidadId] = useState('');
  const [coordenadas, setCoordenadas] = useState({ lat: 0, lng: 0 });
  const [etiquetas, setEtiquetas] = useState([]);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([]);
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
  const [errores, setErrores] = useState([]);
  const { id_publicacion } = useParams();
  const [etiquetasDesdePublicacion, setEtiquetasDesdePublicacion] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);

  const navigate = useNavigate();

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
    
    return nuevosErrores;
  };

  const camposValidos = (campo) => !errores.includes(campo);

  useEffect(() => {
    fetch('http://localhost:5000/api/ubicacion/provincias')
      .then(res => res.json())
      .then(setProvincias)
      .catch(console.error);
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

  useEffect(() => {
    fetch('http://localhost:5000/api/etiquetas')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(e => ({ label: e.nombre, id: e.id }));
        setEtiquetas(mapped);
      });
  }, []);

  useEffect(() => {
    const fetchDatosPublicacion = async () => {
      try {
        const res = await fetch(`http://localhost:5000/publicaciones/${id_publicacion}`);
        if (!res.ok) throw new Error("No se pudo obtener la publicación");
        const data = await res.json();

        setTitulo(data.titulo || '');
        setDescripcion(data.descripcion || '');
        setSeleccionado(data.categoria || '');
        if (data.coordenadas && Array.isArray(data.coordenadas)) {
          setCoordenadas({ lat: parseFloat(data.coordenadas[0]), lng: parseFloat(data.coordenadas[1]) });
        }

        // Guardamos los nombres de las etiquetas
        if (Array.isArray(data.etiquetas)) {
          setEtiquetasDesdePublicacion(data.etiquetas);
        }

        if (Array.isArray(data.imagenes)) {
          setImagenesExistentes(data.imagenes);
        }

      } catch (err) {
        console.error("Error al cargar datos de la publicación:", err);
      }
    };

    if (id_publicacion) {
      fetchDatosPublicacion();
    }
  }, [id_publicacion]);

  useEffect(() => {
    if (etiquetas.length > 0 && etiquetasDesdePublicacion.length > 0) {
      const etiquetasSeleccionadasMapped = etiquetas.filter(et =>
        etiquetasDesdePublicacion.includes(et.label)
      );
      setEtiquetasSeleccionadas(etiquetasSeleccionadasMapped);
    }
  }, [etiquetas, etiquetasDesdePublicacion]);


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

    try {
      let urlsImagenes = [...imagenesExistentes]; // imágenes previas

      if (imagenesSeleccionadas.length > 0) {
        const formData = new FormData();
        imagenesSeleccionadas.forEach((img) => {
          formData.append("imagenes", img);
        });

        const resImagenes = await fetch("http://localhost:5000/subir-imagenes", {
          method: "POST",
          body: formData,
        });

        if (!resImagenes.ok) throw new Error("Error al subir imágenes");

        const dataImagenes = await resImagenes.json();
        urlsImagenes = [...urlsImagenes, ...dataImagenes.urls];
      }


      const datos = {
        categoria: seleccionado,
        titulo,
        descripcion,
        id_locacion: localidadId,
        coordenadas: [parseFloat(coordenadas.lat), parseFloat(coordenadas.lng)],
        etiquetas: etiquetasSeleccionadas.map(e => e.id),
        imagenes: urlsImagenes
      };


      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("Debés iniciar sesión para publicar");
        return;
      }
      const token = await user.getIdToken();

      const res = await fetch(`http://localhost:5000/publicaciones/${id_publicacion}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datos),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Publicación modificada:", data);
        alert("✅ ¡Publicación modificada con éxito!");
        navigate(`/publicacion/${id_publicacion}`);
      } else {
        throw new Error(data.error || "Error en el envío");
      }
    } catch (error) {
      console.error("Error al publicar:", error);
      alert("❌ Ocurrió un error al publicar");
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md">
        <Typography level="h3" sx={{ mt: 2 }}>Editar Publicación</Typography>

        <ToggleButtonGroup
          value={seleccionado}
          onChange={(event, newValue) => setSeleccionado(newValue)}
          sx={{ my: 2, gap: 1, flexWrap: 'wrap' }}
          exclusive
        >
          {["Adopción", "Búsqueda", "Encuentro", "Estado Crítico"].map(opcion => (
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
          Subir nuevas imágenes ({imagenesSeleccionadas.length})
          <VisuallyHiddenInput type="file" multiple accept="image/*" onChange={handleImagenesChange} />
        </Button>

        {imagenesSeleccionadas.length > 0 && (
          <Typography level="body2" sx={{ mt: 1, color: '#666' }}>
            {imagenesSeleccionadas.map(file => file.name).join(', ')}
          </Typography>
        )}

        {imagenesExistentes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography level="body2" sx={{ mb: 1 }}>Imágenes previas:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {imagenesExistentes.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`imagen-${i}`}
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 8 }}
                />
              ))}
            </Box>
          </Box>
        )}


        {errores.length > 0 && (
          <Alert color="danger" variant="soft" sx={{ my: 2 }}>
            Faltan completar los siguientes campos: {errores.join(", ")}
          </Alert>
        )}

        <Button
          size="lg"
          variant="solid"
          sx={{ width: '100%', mt: 4, backgroundColor: '#F1B400', color: '#0D171C', '&:hover': { backgroundColor: '#d9a900' } }}
          onClick={handlePublicar}
        >
          Guardar Cambios
        </Button>
      </Container>
    </React.Fragment>
  );
}
