import React from 'react';
import PerfilConfiguracion from './perfilConfigruaciones';
import Navbar from '../Navbar';

const ConfigPerfil = () => {
  return (
    <>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <PerfilConfiguracion/>
      </main>
    </>
  );
};

export default ConfigPerfil;