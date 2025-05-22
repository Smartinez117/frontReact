import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const photo = localStorage.getItem("userPhoto");

    if (name && photo) {
      setUserName(name);
      setUserPhoto(photo);
    } else {
      // Si no hay sesión, redirigimos al login
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="main-container">
      <header className="header">
        <h1>REDEMA</h1>
        <div className="user-info">
          <img src={userPhoto} alt="Perfil" style={{ width: '40px', borderRadius: '50%', marginRight: '10px' }} />
          Hola, {userName}!
        </div>
      </header>
      <h2>Conectando corazones con patas</h2>
      <div className="menu">
        <button onClick={() => navigate('/adopcion')}>Adoptar Mascota</button>
        <button onClick={() => navigate('/perdida')}>Reportar Mascota Perdida</button>
        <button onClick={() => navigate('/busqueda')}>Encontré una Mascota</button>
        <button onClick={() => navigate('/veterinaria')}>Asistencia Veterinaria</button>
        <button onClick={() => navigate('/comunidad')}>Historias y Comunidad</button>
      </div>
    </div>
  );
}

export default Home;
