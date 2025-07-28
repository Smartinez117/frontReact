import React from 'react';
import SelfPublications from './SelfPublications';
import Navbar from '../Navbar';
import Nombre from './nombre';  

const Perfil = () => {
  return (
    <>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <Nombre/>
        <h4>mis publicaciones</h4>
        <SelfPublications />
      </main>
    </>
  );
};

export default Perfil;