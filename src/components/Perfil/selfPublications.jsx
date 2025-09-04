// SelfPublications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './cuserPublications.css';
import { fetchMisPublicaciones, fetchPublicacionesFiltradas, eliminarPublicacion } from '../../services/perfilService';
import { confirmarAccion } from '../../utils/confirmservice';

const SelfPublications = ({ userId, isOwner }) => {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Maneja filtros
  const handleCategoriaChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setCategorias((prev) => [...prev, value]);
    } else {
      setCategorias((prev) => prev.filter((cat) => cat !== value));
    }
  };

  // Eliminar con confirmación
  const handleEliminar = (id) => {
    confirmarAccion({
      tipo: 'publicacion',
      onConfirm: async () => {
        await eliminarPublicacion(id);
        setPublicaciones((prev) => prev.filter((pub) => pub.id !== id));
      },
    });
  };

  // Efecto: cargar publicaciones según dueño y filtros
  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = {};
    if (categorias.length > 0) params.categoria = categorias;

    const fetchFn = isOwner ? fetchMisPublicaciones : fetchPublicacionesFiltradas;

    fetchFn(userId, params)
      .then(setPublicaciones)
      .catch((e) => setError(e.message || 'Error al obtener publicaciones'))
      .finally(() => setLoading(false));
  }, [categorias, userId, isOwner]);

  return (
    <div className="selfPublications-container">
      {/* Header solo para el dueño */}
      {isOwner && (
        <div className="header-filtros">
          <button
            className="boton-crear"
            type="button"
            onClick={() => navigate('/publicar')}
          >
            Nueva publicación
          </button>
        </div>
      )}

      {/* Estados */}
      {loading && <p>Cargando publicaciones...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Lista */}
      {!loading && !error && (
        <ul className="lista-publicaciones-vertical">
          {publicaciones.length === 0 && (
            <li>No hay publicaciones que coincidan con los filtros.</li>
          )}
          {publicaciones.map((pub) => {
            const imagenPrincipal =
              pub.imagenes.length > 0 ? pub.imagenes[0] : null;

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
                    onClick={() => navigate(`/publicacion/${pub.id}`)}
                  >
                    Ver detalle
                  </button>

                  {/* Botones extra solo si es dueño */}
                  {isOwner && (
                    <>
                      <button
                        type="button"
                        className="boton-crear boton-editar"
                        onClick={() => navigate(`/editar/${pub.id}`)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="boton-eliminar"
                        onClick={() => handleEliminar(pub.id)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
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
