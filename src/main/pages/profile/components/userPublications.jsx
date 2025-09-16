import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPublicacionesPorUsuario } from "../../../../services/perfilService"; // 🔹 nuevo servicio
import "./cuserPublications.css";

const UserPublications = ({ userId }) => {
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    fetchPublicacionesPorUsuario(userId)
      .then(setPublicaciones)
      .catch((e) => setError(e.message || "Error al obtener publicaciones"))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="userPublications-container">
      {loading && <p>Cargando publicaciones...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && (
        <ul className="lista-publicaciones-vertical">
          {publicaciones.length === 0 && (
            <li>Este usuario todavía no tiene publicaciones.</li>
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
                    aria-label={`Detalle publicación ${pub.titulo}`}
                    onClick={() => navigate(`/publicacion/${pub.id}`)}
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

export default UserPublications;
