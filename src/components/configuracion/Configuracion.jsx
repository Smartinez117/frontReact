import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  MenuItem,
  Avatar,
  Grid
} from '@mui/material';

export default function Configuracion({ usuarioActual, onGuardar }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    descripcion: '',
    rol: '',
    foto_perfil_url: ''
  });

  useEffect(() => {
    if (usuarioActual) {
      setFormData({
        nombre: usuarioActual.nombre || '',
        email: usuarioActual.email || '',
        telefono: usuarioActual.telefono || '',
        descripcion: usuarioActual.descripcion || '',
        rol: usuarioActual.rol || '',
        foto_perfil_url: usuarioActual.foto_perfil_url || ''
      });
    }
  }, [usuarioActual]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Acá podrías hacer fetch al backend para guardar cambios
    try {
      if (onGuardar) await onGuardar(formData);
      alert('✅ Configuración guardada');
    } catch (error) {
      console.error('Error al guardar configuración', error);
      alert('❌ Hubo un error al guardar');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Configuración de Usuario
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>

            <Grid item xs={12} display="flex" justifyContent="center">
              <Avatar
                src={formData.foto_perfil_url}
                alt="Avatar"
                sx={{ width: 80, height: 80 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Nombre"
                fullWidth
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Teléfono"
                fullWidth
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: +54 9 11 1234 5678"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                label="Rol"
                fullWidth
                name="rol"
                value={formData.rol}
                onChange={handleChange}
              >
                <MenuItem value="usuario">Usuario</MenuItem>
                <MenuItem value="administrador">Administrador</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="URL de Foto de Perfil"
                fullWidth
                name="foto_perfil_url"
                value={formData.foto_perfil_url}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" color="primary">
                Guardar Cambios
              </Button>
            </Grid>

          </Grid>
        </form>
      </Box>
    </Container>
  );
}
