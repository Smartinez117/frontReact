import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Componentes propios
import SelfPublications from './selfPublications';
import UserPublications from './userPublications';
import MyBanner from './myBanner';
import PublicBanner from './publicBanner'; 

// Material UI
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Divider 
} from '@mui/material';

const BASE_URL = import.meta.env.VITE_API_URL;

const Perfil = () => {
  const { slug } = useParams(); 
  const currentUserId = localStorage.getItem("userId"); 
  const [user, setUser] = useState(null); 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BASE_URL}/usuario/slug/${slug}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error cargando usuario:", err);
      }
    };
    fetchUser();
  }, [slug]);

  // 1. Loading State mejorado
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const isOwner = String(user.id) === String(currentUserId);

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', pb: 4 }}>
      
      {/* 2. Sección del Banner (Full Width o Contenido según tu componente Banner) */}
      <Box sx={{ mb: 4 }}>
        {isOwner ? (
          <MyBanner userId={user.id} />
        ) : (
          <PublicBanner userId={user.id} />
        )}
      </Box>

      {/* 3. Sección de Publicaciones */}
      <Container maxWidth="md"> 
        
        {/* Título de sección con estilo */}
        <Typography 
          variant="h5" 
          component="h2" 
          fontWeight="bold" 
          color="text.primary"
          gutterBottom
          sx={{ borderLeft: '4px solid #1976d2', pl: 2 }} // Pequeño detalle estético
        >
          {isOwner ? "Mis publicaciones" : "Publicaciones"}
        </Typography>
        
        <Divider sx={{ mb: 3 }} />

        {/* Lista de Publicaciones */}
        {isOwner ? (
          <SelfPublications userId={user.id} isOwner={true} />
        ) : (
          <UserPublications userId={user.id} />
        )}

      </Container>
    </Box>
  );
};

export default Perfil;