import React from 'react';
import { useParams } from 'react-router-dom';
import SelfPublications from './selfPublications';
import UserPublications from './userPublications'; // 🔹 Nuevo componente
import Nombre from './Nombre';  
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';

const Perfil = () => {
  const { id } = useParams(); // el ID de la URL
  const currentUserId = localStorage.getItem("userId"); // UID del autenticado

  const isOwner = id === currentUserId;

  return (
    <>
      <CssBaseline />
      <main style={{ padding: '20px' }}>
        <Nombre userId={id} />

        <Container maxWidth="sm">
          <h4>{isOwner ? "Mis publicaciones" : "Publicaciones"}</h4>
          {isOwner ? (
            <SelfPublications userId={id} editable={true} />
          ) : (
            <UserPublications userId={id} />
          )}
        </Container>
      </main>
    </>
  );
};

export default Perfil;
