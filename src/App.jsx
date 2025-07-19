import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/global.css';

function App() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const photo = localStorage.getItem("userPhoto");

    if (name && photo) {
      setUserName(name);
      setUserPhoto(photo);
    }
  }, []);

  return (
    <div className="main-container">
      <header className="header">
        <h1 className="logo-redema">REDEMA</h1>
        <div className="user-info">
          <img src={userPhoto} alt="Perfil" />
          Hola, {userName}!
        </div>
      </header>
      <h2>Conectando corazones con patas</h2>
      <div className="container">
        <div className="menu-grid">
          <button className="menu-btn" onClick={() => navigate('/adopcion')}><span>🐶</span><span>Adoptar Mascota</span></button>
          <button className="menu-btn" onClick={() => navigate('/perdida')}><span>🆘</span><span>Reportar Mascota Perdida</span></button>
          <button className="menu-btn" onClick={() => navigate('/busqueda')}><span>📍</span><span>Encontré una Mascota</span></button>
          <button className="menu-btn" onClick={() => navigate('/veterinaria')}><span>💊</span><span>Asistencia Veterinaria</span></button>
          <button className="menu-btn" onClick={() => navigate('/comunidad')}><span>👥</span><span>Historias y Comunidad</span></button>
        </div>
      </div>
    </div>
  );
}

export default App;