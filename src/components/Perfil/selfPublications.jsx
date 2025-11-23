import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './cuserPublications.css';
import { fetchMisPublicaciones, fetchPublicacionesPorUsuario, eliminarPublicacion, archivarPublicacion, desarchivarPublicacion } from '../../services/perfilService';
import { confirmarAccion } from '../../utils/confirmservice';

const SelfPublications = ({ userId, isOwner }) => {
  const navigate = useNavigate();

  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  //Archivar publicación
  const handleArchivar = (id) => {
    confirmarAccion({
      tipo: 'archivar',
      onConfirm: async () => {
        await archivarPublicacion(id);
        setPublicaciones(prev =>
          prev.map(pub =>
            pub.id === id ? { ...pub, estado: 1 } : pub
          )
        );
      },
    });
  };

  const handleDesarchivar = (id) => {
    confirmarAccion({
      tipo: 'desarchivar',
      onConfirm: async () => {
        await desarchivarPublicacion(id);
        setPublicaciones(prev =>
          prev.map(pub =>
            pub.id === id ? { ...pub, estado: 0 } : pub
          )
        );
      },
    });
  };


  // Cargar publicaciones
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchFn = isOwner ? fetchMisPublicaciones : fetchPublicacionesPorUsuario;

    fetchFn(userId)
      .then(data => {
        // Validación extra por seguridad
        if (Array.isArray(data)) {
            setPublicaciones(data);
        } else {
            setPublicaciones([]);
        }
      })
      .catch((e) => setError(e.message || 'Error al obtener publicaciones'))
      .finally(() => setLoading(false));
  }, [userId, isOwner]);

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
            <li>No hay publicaciones todavía.</li>
          )}
          {publicaciones.map((pub) => {
            const imagenPrincipal =
              pub.imagenes && pub.imagenes.length > 0 ? pub.imagenes[0] : null;

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
                  
                  {/* 🔹 BADGES DE ESTADO */}
                  {pub.estado === 1 && (
                    <span className="badge-archivado">Archivado</span>
                  )}
                  {pub.estado === 2 && (
                    <span className="badge-bloqueado">Bloqueado</span>
                  )}
                  
                  {/* --- CORRECCIÓN AQUÍ --- */}
                  {/* Accedemos a .nombre y validamos que exista */}
                  <span className="publicacion-categoria">
                    {pub.categoria ? pub.categoria.nombre : 'Sin categoría'}
                  </span>

                  <div className="publicacion-etiquetas">
                    {pub.etiquetas && pub.etiquetas.map((etiqueta, idx) => (
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
                      {pub.estado !== 1 && (
                        <button
                          type="button"
                          className="boton-archivar"
                          onClick={() => handleArchivar(pub.id)}
                        >
                          Archivar
                        </button>
                      )}

                      {/* 🔹 Mostrar DESARCHIVAR solo si estado === archivado */}
                      {pub.estado === 1 && (
                        <button
                          type="button"
                          className="boton-desarchivar"
                          onClick={() => handleDesarchivar(pub.id)}
                        >
                          Desarchivar
                        </button>
                      )}
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