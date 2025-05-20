import { useNavigate } from 'react-router-dom';
import './styles/global.css';

function App() {
  const navigate = useNavigate();

  return (
    <div className="main-container">
      <header className="header">
        <h1>REDEMA</h1>
        <div className="user-info">Hola, Ana!</div>
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

export default App;
