import React from 'react';
import { useParams } from 'react-router-dom';
import SelfPublications from './selfPublications';
import UserPublications from './userPublications'; // 🔹 Nuevo componente
import MyBanner from './myBanner';
import PublicBanner from './publicBanner'; 
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
          {isOwner ? (
            <> {/* Fragmento para agrupar */}
              <MyBanner userId={id} />
              <Container maxWidth="sm">
                <h4>Mis publicaciones</h4>
                <SelfPublications userId={id} isOwner={true} />
              </Container>
            </>
          ) : (
            <> {/* Fragmento para agrupar */}
              <PublicBanner userId={id} />
              <Container maxWidth="sm">
                <h4>Publicaciones</h4>
                <UserPublications userId={id} />
              </Container>
            </>
          )}
        </main>
    </>
  );
};

export default Perfil;
