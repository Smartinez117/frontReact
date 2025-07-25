import React, { useState, useEffect } from 'react';
import { fetchPublicacionesFiltradas } from '../../services/adopcionService'; // Ajusta ruta si hace falta
import { useNavigate } from 'react-router-dom';

// Importamos iconos desde react-icons para compartir y QR
import { FaShareAlt, FaQrcode } from 'react-icons/fa';

import './cadopcion.css'; // Importamos estilos

const categoriasPosibles = [
  { label: "Adopción", value: "adopcion" },
  { label: "Búsqueda", value: "busqueda" },
  { label: "Estado crítico", value: "estado critico" }
];

const FAdopcion = () => {
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

  // Efecto para llamar al backend cada vez que cambian las categorías
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Armamos parámetros para la consulta GET
    const params = {};

    // Si hay categorías seleccionadas, enviamos concatenadas por coma
    if (categorias.length > 0) {
      params.categoria = categorias.join(',');
    }

    fetchPublicacionesFiltradas(params)
      .then(setPublicaciones)
      .catch((e) => setError(e.message || 'Error al obtener publicaciones'))
      .finally(() => setLoading(false));
    
  }, [categorias]);

  return (
    <div className="fadopcion-container">
      {/* Header con filtros y botón */}
      <div className="header-filtros">
        {/* Checkbox para categorías */}
        <div className="categorias-filtros">
          {categoriasPosibles.map(({ label, value }) => (
            <label key={value}>
              <input
                type="checkbox"
                value={value}
                checked={categorias.includes(value)}
                onChange={handleCategoriaChange}
              />
              {label}
            </label>
          ))}
        </div>

        {/* Botón superior derecho (navega a /perdida) */}
        <button className="boton-crear" type="button" onClick={() => navigate('/perdida')}>
          Nueva publicación
        </button>
      </div>

      {/* Estados de carga y error */}
      {loading && <p>Cargando publicaciones...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Lista de publicaciones */}
      {!loading && !error && (
        <ul className="lista-publicaciones">
          {publicaciones.length === 0 && (
            <li>No hay publicaciones que coincidan con los filtros.</li>
          )}
          {publicaciones.map(pub => {
            // Tomamos solo la primera imagen para mostrar
            const imagenPrincipal = pub.imagenes.length > 0 ? pub.imagenes[0] : null;

            return (
              <li key={pub.id} className="publicacion-card">
                {imagenPrincipal && (
                  <img
                    src={imagenPrincipal}
                    alt={`Imagen de ${pub.titulo}`}
                    className="publicacion-imagen"
                  />
                )}
                <div className="publicacion-contenido">
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

                  {/* Botones compartir y QR (sin función) */}
                  <div className="publicacion-acciones">
                    <button className="boton-icono" type="button" title="Compartir">
                      <FaShareAlt />
                    </button>
                    <button className="boton-icono" type="button" title="QR">
                      <FaQrcode />
                    </button>
                  </div>

                  {/* Botón adicional debajo (mismo estilo que boton-crear) con data-id */}
                  <button
                    type="button"
                    className="boton-crear boton-detalle"
                    data-id={pub.id}
                    aria-label={`Detalle publicación ${pub.titulo}`}
                  >
                    Ver detalle
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

export default FAdopcion;
