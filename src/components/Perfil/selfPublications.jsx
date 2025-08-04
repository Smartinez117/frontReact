// SelfPublications.jsx
import React, { useState, useEffect } from 'react';
import { fetchPublicacionesFiltradas } from '../../services/perfilService'; // Ajusta ruta si hace falta
import { useNavigate } from 'react-router-dom';
// Importo íconos solo si hace falta, por ahora quitados
import './cselfPublications.css';
import { fetchMisPublicaciones, eliminarPublicacion } from '../../services/perfilService';


const categoriasPosibles = [
  { label: "Adopción", value: "adopcion" },
  { label: "Búsqueda", value: "busqueda" },
  { label: "Estado crítico", value: "estado critico" }
];

const SelfPublications = () => {
  const navigate = useNavigate();

  // Estado para categorías seleccionadas en filtros (checkboxes)
  const [categorias, setCategorias] = useState([]);

  // Lista de publicaciones obtenidas
  const [publicaciones, setPublicaciones] = useState([]);

  // Estado carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Controla cambio en selección de checkbox de categorías
  const handleCategoriaChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setCategorias(prev => [...prev, value]);
    } else {
      setCategorias(prev => prev.filter(cat => cat !== value));
    }
  };
  //handler para eliminar una publicacion
  const handleEliminar = async (id) => {
  try {
    await eliminarPublicacion(id);
    // Actualizas el estado para sacar la publicación eliminada
    setPublicaciones(prev => prev.filter(pub => pub.id !== id));
  } catch (error) {
    alert(error.message);
  }
};



  // Efecto para llamar al backend cada vez que cambian las categorías
  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = {};
    if (categorias) params.categoria = categorias;

    fetchMisPublicaciones(params)
      .then(setPublicaciones)
      .catch((e) => setError(e.message || 'Error al obtener publicaciones'))
      .finally(() => setLoading(false));
  }, [categorias]);


  return (
    <div className="selfPublications-container">
      {/* Header con filtros y botón */}
      <div className="header-filtros">
        {/* Checkbox para categorías */}
        {/* 
        <div className="categorias-filtros">
          {categoriasPosibles.map(({ label, value }) => (
            <label key={value}>
              <input
                type="radio"
                name="categoria" // todos los radio deben tener el mismo `name`
                value={value}
                checked={categorias === value}
                onChange={(e) => setCategorias(e.target.value)}
              />
              {label}
            </label>
          ))}

          <button onClick={() => setCategorias("")}>Quitar filtro</button>  
        </div>   
        */}
        {/* Botón superior derecho (navega a /publicar) */}
        <button className="boton-crear" type="button" onClick={() => navigate('/publicar')}>
          Nueva publicación
        </button>
      </div>

      {/* Estados de carga y error */}
      {loading && <p>Cargando publicaciones...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Lista de publicaciones */}
      {!loading && !error && (
        <ul className="lista-publicaciones-vertical">
          {publicaciones.length === 0 && (
            <li>No hay publicaciones que coincidan con los filtros.</li>
          )}
          {publicaciones.map(pub => {
            // Tomamos solo la primera imagen para mostrar
            const imagenPrincipal = pub.imagenes.length > 0 ? pub.imagenes[0] : null;
            return (
              <li key={pub.id} className="publicacion-card-vertical">
                {imagenPrincipal && (
                  <img
                    src={imagenPrincipal}
                    alt={`Imagen de ${pub.titulo}`}
                    className="publicacion-imagen"
                  />
                )}

                <div className="publicacion-contenido-vertical">
                  <h3 className="publicacion-titulo">{pub.titulo}</h3>
                  <span className="publicacion-categoria">{pub.categoria}</span>
                  {/* Etiquetas como chips */}
                  <div className="publicacion-etiquetas">
                    {pub.etiquetas.map((etiqueta, idx) => (
                      <span key={idx} className="etiqueta-chip">
                        {etiqueta}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="publicacion-botones-lateral">
                  <button
                    type="button"
                    className="boton-crear boton-detalle"
                    data-id={pub.id}
                    aria-label={`Detalle publicación ${pub.titulo}`}
                    onClick={() => navigate(`/publicacion/${pub.id}`)}
                  >
                    Ver detalle
                  </button>
                  <button
                    type="button"
                    className="boton-crear boton-editar"
                    data-id={pub.id}
                    aria-label={`Editar publicación ${pub.titulo}`}
                    // Sin funcionalidad por ahora
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="boton-eliminar"
                    data-id={pub.id}
                    aria-label={`Eliminar publicación ${pub.titulo}`}
                    onClick={() => handleEliminar(pub.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SelfPublications;
