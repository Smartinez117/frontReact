// Nombre.jsx
import React, { useEffect, useState } from 'react';
import './cnombre.css';  // tu CSS para estilos

const Nombre = () => {
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');

  useEffect(() => {
    // Aquí replicamos la lógica del Navbar para obtener datos de localStorage
    const name = localStorage.getItem('userName') || '';
    const photo = localStorage.getItem('userPhoto') || '';
    setUserName(name);
    setUserPhoto(photo);
  }, []);

  return (
    <div className="nombre-container">
      <img
        src={userPhoto || "/default-profile.png"}
        alt={userName || "Usuario"}
        className="nombre-foto"
      />
      <span className="nombre-text">{userName || "Usuario"}</span>
    </div>
  );
};

export default Nombre;
