import { useState } from 'react';
import './cadopcion.css';

const publicaciones = [
  {
    nombre: 'Indio',
    raza: 'Golden Retriever',
    ciudad: 'Campana',
    hashtags: ['#Perro', '#Adopción', '#BuenosAires'],
    imagen: '/assets/perro1.png',
  },
  {
    nombre: 'Mittens',
    raza: 'Golden Retriever',
    ciudad: 'Campana',
    hashtags: ['#Gato', '#Adopción', '#BuenosAires'],
    imagen: '/assets/gato1.png',
  },
  {
    nombre: 'Max',
    raza: 'Golden Retriever',
    ciudad: 'Campana',
    hashtags: ['#Perro', '#Adopción', '#BuenosAires'],
    imagen: '/assets/perro2.png',
  },
];


function Fadopcion() {
 const [pagina, setPagina] = useState(1);

  return (
    <div className="contenedor-principal">
      <header className="header">
        <button className="menu-btn">☰</button>
        <h1>Publicaciones</h1>
        <div className="perfil"></div>
      </header>
      <div className="busqueda">
        <input type="text" placeholder="Buscar" />
        <div className="filtros">
          <button>Perros ▼</button>
          <button>Gatos ▼</button>
          <button>Otros ▼</button>
        </div>
        <button className="crear-btn">Crear publicación</button>
      </div>
      <div className="publicaciones">
        {publicaciones.map((pub, index) => (
          <div className="card" key={index}>
            <img src={pub.imagen} alt={pub.nombre} />
            <h2>{pub.nombre}</h2>
            <p>{pub.raza}</p>
            <p><span className="icon">📍</span> {pub.ciudad}</p>
            <p>{pub.hashtags.join(', ')}</p>
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
