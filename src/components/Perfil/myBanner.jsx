import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para ir a la configuración
import { 
  Paper, 
  Avatar, 
  Typography, 
  Stack, 
  Button, 
  Box,
  Chip
} from '@mui/material';

// Iconos
import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const MyBanner = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName') || '';
    const photo = localStorage.getItem('userPhoto') || '';
    setUserName(name);
    setUserPhoto(photo);
  }, []);

  return (
    <Paper 
      elevation={1}
      sx={{ 
        p: 3,
        mt: 2,
        mb: 4, 
        borderRadius: 4,
        // Un degradado suave o color sólido que combine con tu marca
        background: 'linear-gradient(135deg, #fffbf2 0%, #fef2dc 100%)',
        border: '1px solid #f0e6d2',
        maxWidth: '800px', // Limitamos el ancho para que no se estire demasiado
        mx: 'auto' // Centrado horizontalmente
      }}
    >
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} // Vertical en móvil, horizontal en PC
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
            src={userPhoto || "/default-profile.png"} 
            alt={userName || "Usuario"}
            sx={{ 
              width: 100, 
              height: 100, 
              border: '4px solid white', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
            }}
          />
          
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
              <Typography variant="h4" component="h1" fontWeight="800" color="text.primary">
                {userName || "Usuario"}
              </Typography>
   
            </Stack>
            
            <Chip 
              label="Mi Perfil" 
              size="small" 
              color="primary" 
              variant="outlined" 
              sx={{ mt: 1, fontWeight: 'bold' }} 
            />
          </Box>
        </Stack>

        {/* --- DERECHA: ACCIONES --- */}
        <Box>
          <Button 
            variant="contained" 
            color="primary" // O 'inherit' si quieres algo más sutil
            startIcon={<EditIcon />}
            onClick={() => navigate('/pconfig')} // Redirige a editar perfil
            sx={{ 
              borderRadius: 20, 
              textTransform: 'none', 
              fontWeight: 'bold',
              px: 3
            }}
          >
            Editar Perfil
          </Button>
        </Box>

      </Stack>
    </Paper>
  );
};

// Helper simple para Tooltip si no lo importaste arriba (o bórralo si usas import { Tooltip }...)
import Tooltip from '@mui/material/Tooltip';

export default MyBanner;