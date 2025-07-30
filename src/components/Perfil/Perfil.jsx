import React from 'react';
import SelfPublications from './selfPublications';
import Nombre from './nombre';  
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

const Perfil = () => {
  return (
    <>
      <CssBaseline />

      <main style={{ padding: '20px' }}>
        <Nombre/>
        
      <Container maxWidth="sm">
        <h4>Mis publicaciones</h4>
        <SelfPublications />
      </Container>
        
      </main>
    </>
  );
};

export default Perfil;