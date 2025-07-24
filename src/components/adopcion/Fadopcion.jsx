import { useEffect, useState } from 'react';
import './cadopcion.css';
import { getPublicacionesFiltradas } from '../../services/adopcionService';

function Fadopcion() {
  const [pagina, setPagina] = useState(1);
  const [publicaciones, setPublicaciones] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    async function cargarPublicaciones() {
      try {
        const filtros = {
          categoria: categoria || undefined,
          etiquetas: busqueda || undefined,
          limit: 9
        };
        const resultado = await getPublicacionesFiltradas(filtros);
        setPublicaciones(resultado);
      } catch (error) {
        console.error('Error al obtener publicaciones:', error);
      }
    }
    cargarPublicaciones();
  }, [categoria, busqueda]);

  return (
    <div className="contenedor-principal">
      <header className="header">
        <button className="menu-btn">☰</button>
        <h1>Publicaciones</h1>
        <div className="perfil"></div>
      </header>
      <div className="busqueda">
        <input
          type="text"
          placeholder="Buscar por etiquetas..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <div className="filtros">
          <button onClick={() => setCategoria('Perro')}>Perros ▼</button>
          <button onClick={() => setCategoria('Gato')}>Gatos ▼</button>
          <button onClick={() => setCategoria('')}>Todos ▼</button>
        </div>
        <button className="crear-btn">Crear publicación</button>
      </div>
      <div className="publicaciones">
        {publicaciones.map((pub) => (
          <div className="card" key={pub.id}>
            <img src={pub.imagenes[0]} alt={pub.titulo} />
            <h2>{pub.titulo}</h2>
            <p>{pub.categoria}</p>
            <p><span className="icon">📍</span> {pub.coordenadas?.join(', ')}</p>
            <p>{pub.etiquetas.map(e => `#${e}`).join(', ')}</p>
            <div className="acciones">
              <button>↩ Compartir</button>
              <button>📷 Qr</button>
            </div>
          </div>
        ))}
      </div>
      <div className="paginacion">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            className={pagina === num ? 'activo' : ''}
            onClick={() => setPagina(num)}>
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Fadopcion;
