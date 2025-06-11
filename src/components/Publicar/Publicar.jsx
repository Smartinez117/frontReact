import React, { useState } from 'react';
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const nombresImagenes = imagenes.map((img) => img.name).join(', ') || 'Ninguna';
    alert(`Título: ${titulo}\nDescripción: ${descripcion}\nCategoría: ${categoria}\nImágenes: ${nombresImagenes}`);
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
