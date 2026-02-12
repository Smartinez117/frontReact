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
  const [loadingAccion, setLoadingAccion] = useState(null); // { idPublicacion, accion } | null

  // Eliminar con confirmación
  const handleEliminar = (publicacion) => { 
    confirmarAccion({
      tipo: 'publicacion',
      dato: publicacion.titulo,
      onConfirm: async () => {
        setLoadingAccion({ idPublicacion: publicacion.id, accion: 'eliminar' });
        try {
          await eliminarPublicacion(publicacion.id);
          setPublicaciones((prev) => prev.filter((pub) => pub.id !== publicacion.id));
        } finally {
          setLoadingAccion(null);
        }
      },
    });
  };

  const handleArchivar = (publicacion) => {
    confirmarAccion({
      tipo: 'archivar',
      dato: publicacion.titulo,
      onConfirm: async () => {
        setLoadingAccion({ idPublicacion: publicacion.id, accion: 'archivar' });
        try {
          await archivarPublicacion(publicacion.id);
          setPublicaciones(prev =>
            prev.map(pub =>
              pub.id === publicacion.id ? { ...pub, estado: 1 } : pub
            )
          );
        } finally {
          setLoadingAccion(null);
        }
      },
    });
  };

  const handleDesarchivar = (publicacion) => {
    confirmarAccion({
      tipo: 'desarchivar',
      dato: publicacion.titulo,
      onConfirm: async () => {
        setLoadingAccion({ idPublicacion: publicacion.id, accion: 'desarchivar' });
        try {
          await desarchivarPublicacion(publicacion.id);
          setPublicaciones(prev =>
            prev.map(pub =>
              pub.id === publicacion.id ? { ...pub, estado: 0 } : pub
            )
          );
        } finally {
          setLoadingAccion(null);
        }
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
                    disabled={loadingAccion !== null}
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
                        disabled={loadingAccion !== null}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="boton-eliminar"
                        onClick={() => handleEliminar(pub)}
                        disabled={loadingAccion !== null}
                      >
                        {loadingAccion?.idPublicacion === pub.id && loadingAccion?.accion === 'eliminar' ? (
                          <>
                            <span className="spinner-small"></span> Eliminando...
                          </>
                        ) : (
                          'Eliminar'
                        )}
                      </button>
                      {pub.estado !== 1 && (
                        <button
                          type="button"
                          className="boton-archivar"
                          onClick={() => handleArchivar(pub)}
                          disabled={loadingAccion !== null}
                        >
                          {loadingAccion?.idPublicacion === pub.id && loadingAccion?.accion === 'archivar' ? (
                            <>
                              <span className="spinner-small"></span> Archivando...
                            </>
                          ) : (
                            'Archivar'
                          )}
                        </button>
                      )}

                      {/* 🔹 Mostrar DESARCHIVAR solo si estado === archivado */}
                      {pub.estado === 1 && (
                        <button
                          type="button"
                          className="boton-desarchivar"
                          onClick={() => handleDesarchivar(pub)}
                          disabled={loadingAccion !== null}
                        >
                          {loadingAccion?.idPublicacion === pub.id && loadingAccion?.accion === 'desarchivar' ? (
                            <>
                              <span className="spinner-small"></span> Desarchivando...
                            </>
                          ) : (
                            'Desarchivar'
                          )}
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