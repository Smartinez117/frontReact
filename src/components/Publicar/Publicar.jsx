import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Paper,
} from '@mui/material';

const Publicar = () => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagenes, setImagenes] = useState([]);

  const [provincias, setProvincias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState('');

  // Cargar provincias al montar el componente
  useEffect(() => {
    fetch('http://localhost:5000/api/ubicacion/provincias')
      .then(res => res.json())
      .then(data => setProvincias(data))
      .catch(err => console.error('Error al cargar provincias:', err));
  }, []);

  // Cargar departamentos cuando cambia provincia
  useEffect(() => {
    if (provinciaSeleccionada) {
      fetch(`http://localhost:5000/api/ubicacion/departamentos?provincia_id=${provinciaSeleccionada}`)
        .then(res => res.json())
        .then(data => setDepartamentos(data))
        .catch(err => console.error('Error al cargar departamentos:', err));
    } else {
      setDepartamentos([]);
      setDepartamentoSeleccionado('');
      setLocalidades([]);
      setLocalidadSeleccionada('');
    }
  }, [provinciaSeleccionada]);

  // Cargar localidades cuando cambia departamento
  useEffect(() => {
    if (departamentoSeleccionado) {
      fetch(`http://localhost:5000/api/ubicacion/localidades?departamento_id=${departamentoSeleccionado}`)
        .then(res => res.json())
        .then(data => setLocalidades(data))
        .catch(err => console.error('Error al cargar localidades:', err));
    } else {
      setLocalidades([]);
      setLocalidadSeleccionada('');
    }
  }, [departamentoSeleccionado]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const nombresImagenes = imagenes.map((img) => img.name).join(', ') || 'Ninguna';
    alert(
      `Título: ${titulo}
      Descripción: ${descripcion}
      Categoría: ${categoria}
      Provincia ID: ${provinciaSeleccionada}
      Departamento ID: ${departamentoSeleccionado}
      Localidad ID: ${localidadSeleccionada}
      Imágenes: ${nombresImagenes}`
    );
  };

  const handleFileChange = (e) => {
    setImagenes(Array.from(e.target.files));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Publicar
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <FormControl fullWidth required>
            <InputLabel id="categoria-label">Categoría</InputLabel>
            <Select
              labelId="categoria-label"
              id="categoria"
              value={categoria}
              label="Categoría"
              onChange={(e) => setCategoria(e.target.value)}
            >
              <MenuItem value="adopcion">Adopción</MenuItem>
              <MenuItem value="perdida">Mascota perdida</MenuItem>
              <MenuItem value="encontrada">Mascota encontrada</MenuItem>
              <MenuItem value="critico">Estado crítico</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Título"
            variant="outlined"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />

          <TextField
            label="Descripción"
            variant="outlined"
            multiline
            rows={4}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />

          {/* Select Provincia */}
          <FormControl fullWidth required>
            <InputLabel id="provincia-label">Provincia</InputLabel>
            <Select
              labelId="provincia-label"
              value={provinciaSeleccionada}
              onChange={(e) => setProvinciaSeleccionada(e.target.value)}
              label="Provincia"
            >
              {provincias.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Select Departamento */}
          <FormControl fullWidth required disabled={!provinciaSeleccionada}>
            <InputLabel id="departamento-label">Departamento/Municipio/Comuna</InputLabel>
            <Select
              labelId="departamento-label"
              value={departamentoSeleccionado}
              onChange={(e) => setDepartamentoSeleccionado(e.target.value)}
              label="Departamento"
            >
              {departamentos.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Select Localidad */}
          <FormControl fullWidth required disabled={!departamentoSeleccionado}>
            <InputLabel id="localidad-label">Localidad/Barrio</InputLabel>
            <Select
              labelId="localidad-label"
              value={localidadSeleccionada}
              onChange={(e) => setLocalidadSeleccionada(e.target.value)}
              label="Localidad"
            >
              {localidades.map((l) => (
                <MenuItem key={l.id} value={l.id}>{l.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Imágenes */}
          <Button variant="contained" component="label">
            Cargar imágenes
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileChange}
            />
          </Button>

          {imagenes.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Imágenes seleccionadas:
              </Typography>
              <ul>
                {imagenes.map((img, i) => (
                  <li key={i}>{img.name}</li>
                ))}
              </ul>
            </Box>
          )}

          <Button type="submit" variant="contained" color="primary">
            Publicar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Publicar;
