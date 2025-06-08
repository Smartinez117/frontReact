import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';

const Publicar = () => {
  // Estado simple para algunos campos del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Acá podés manejar el envío (fetch, axios, etc.)
    alert(`Publicación: ${titulo}\nDescripción: ${descripcion}`);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Publicar
      </Typography>
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        noValidate 
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
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
        <Button type="submit" variant="contained" color="primary">
          Publicar
        </Button>
      </Box>
    </Container>
  );
};

export default Publicar;
