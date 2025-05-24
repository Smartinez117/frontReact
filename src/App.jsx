
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
    });

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
      {/*cambio del menu para que los botones sean cuadrados y sean mas interactivos*/}
     <div className="container my-4">
  <div className="row justify-content-center">
    <div className="col-6 col-md-4 mb-4 d-flex justify-content-center">
      <button className="btn btn-success menu-btn" onClick={() => navigate('/adopcion')}>
       🐶 Adoptar Mascota
      </button>
    </div>
    <div className="col-6 col-md-4 mb-4 d-flex justify-content-center">
      <button className="btn btn-success menu-btn" onClick={() => navigate('/perdida')}>
       🆘 Reportar Mascota Perdida
      </button>
    </div>
    <div className="col-6 col-md-4 mb-4 d-flex justify-content-center">
      <button className="btn btn-success menu-btn" onClick={() => navigate('/busqueda')}>
       📍 Encontré una Mascota
      </button>
    </div>
    <div className="col-6 col-md-4 mb-4 d-flex justify-content-center">
      <button className="btn btn-success menu-btn" onClick={() => navigate('/veterinaria')}>
        💊 Asistencia Veterinaria
      </button>
    </div>
    <div className="col-6 col-md-4 mb-4 d-flex justify-content-center">
      <button className="btn btn-success menu-btn" onClick={() => navigate('/comunidad')}>
       👥 Historias y Comunidad
      </button>
    </div>
  </div>
</div>

      {/*
      <div className="menu">
        <button onClick={() => navigate('/adopcion')}>Adoptar Mascota</button>
        <button onClick={() => navigate('/perdida')}>Reportar Mascota Perdida</button>
        <button onClick={() => navigate('/busqueda')}>Encontré una Mascota</button>
        <button onClick={() => navigate('/veterinaria')}>Asistencia Veterinaria</button>
        <button onClick={() => navigate('/comunidad')}>Historias y Comunidad</button>
      </div>
      */}


    </div>
  );
}

export default App;



