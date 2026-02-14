import React, { useEffect, useState } from 'react';
import { obtenerUsuarioPorId } from '../../services/perfilService';

// --- MATERIAL UI ---
import { 
  Paper, 
  Avatar, 
  Typography, 
  Stack, 
  Box, 
  IconButton, 
  Tooltip, 
  CircularProgress,
  Chip
} from '@mui/material';

// --- ICONOS ---
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import MailIcon from '@mui/icons-material/Mail';
import PetsIcon from '@mui/icons-material/Pets'; // Icono decorativo

// Componente de Reporte
import ReporteForm from '../Reportes/Reportes.jsx';

const PublicBanner = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [mostrarModalReporte, setMostrarModalReporte] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await obtenerUsuarioPorId(userId);
        setUser(data);
      } catch (err) {
        setError(err.message || 'Error al cargar el usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // --- ESTADOS DE CARGA Y ERROR ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          mt: 2, 
          mb: 4, 
          borderRadius: 4,
          background: 'linear-gradient(135deg, #fffbf2 0%, #fef2dc 100%)',
          border: '1px solid #f0e6d2',
          maxWidth: '800px',
          mx: 'auto'
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={3} 
          alignItems="center" 
          justifyContent="space-between"
        >
          {/* --- IZQUIERDA: FOTO Y DATOS --- */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            alignItems="center"
            sx={{ textAlign: { xs: 'center', sm: 'left' } }}
          >
            <Avatar 
              src={user?.foto_perfil_url || "/default-profile.png"} 
              alt={user?.nombre || "Usuario"}
              sx={{ 
                width: 100, 
                height: 100, 
                border: '4px solid white', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }}
            />
            
            <Box>
              <Typography variant="h4" component="h1" fontWeight="800" color="text.primary">
                {user?.nombre || "Usuario"}
              </Typography>
              
              <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }} sx={{ mt: 1 }}>
                <Chip 
                  icon={<PetsIcon fontSize="small" />} 
                  label="Usuario de la comunidad" 
                  size="small" 
                  color="warning" 
                  variant="outlined" 
                />
                {/* Aquí podrías agregar otro chip si tiene rol de admin, etc. */}
              </Stack>
            </Box>
          </Stack>

          {/* --- DERECHA: ACCIONES (Mensaje / Reporte) --- */}
          <Stack direction="row" spacing={1}>
            {/* Botón Reportar */}
            <Tooltip title="Denunciar usuario">
              <IconButton 
                onClick={() => setMostrarModalReporte(true)}
                sx={{ 
                  bgcolor: 'white', 
                  boxShadow: 1,
                  color: 'text.secondary',
                  '&:hover': { bgcolor: '#fff3e0', color: 'warning.main' } 
                }} 
              >
                <OutlinedFlagIcon />
              </IconButton>
            </Tooltip>
          </Stack>

        </Stack>
      </Paper>

      {/* --- MODAL DE REPORTE --- */}
      {mostrarModalReporte && (
        <ReporteForm
            idUsuario={userId} // Usuario a reportar
            onClose={() => setMostrarModalReporte(false)}
        />
      )}
    </>
  );
};

export default PublicBanner;