import React, { useState } from "react";
import { getAuth } from "firebase/auth";

export default function ReporteForm({ idPublicacion, idUsuario, onClose }) {
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setMensaje("Debes iniciar sesión para reportar contenido.");
      return;
    }
    if (!tipo) {
      setMensaje("Selecciona un tipo de reporte.");
      return;
    }

    setLoading(true);
    setMensaje(null);

    try {
      const token = await user.getIdToken();

      const response = await fetch(`${API_URL}/reportes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_publicacion: idPublicacion,
          id_usuario: idUsuario,
          descripcion,
          tipo,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar reporte");
      }

      setMensaje("Reporte enviado con éxito.");
      setDescripcion("");
      setTipo("");
    } catch (err) {
      setMensaje("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✖</button>
        <h3>Denunciar</h3>
        <p>Selecciona el motivo del reporte:</p>

        <form onSubmit={handleSubmit}>
          <label>
            <input
              type="radio"
              name="tipo"
              value="Spam"
              checked={tipo === "Spam"}
              onChange={(e) => setTipo(e.target.value)}
            />
            Spam
          </label>

          <label>
            <input
              type="radio"
              name="tipo"
              value="Contenido inapropiado"
              checked={tipo === "Contenido inapropiado"}
              onChange={(e) => setTipo(e.target.value)}
            />
            Contenido inapropiado
          </label>

          <label>
            <input
              type="radio"
              name="tipo"
              value="Acoso"
              checked={tipo === "Acoso"}
              onChange={(e) => setTipo(e.target.value)}
            />
            Acoso o bullying
          </label>

          <label>
            <input
              type="radio"
              name="tipo"
              value="Otro"
              checked={tipo === "Otro"}
              onChange={(e) => setTipo(e.target.value)}
            />
            Otro
          </label>

          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Explica (opcional)"
          />

          <div className="acciones">
            <button className="boton-enviar" disabled={loading || !tipo}>
              {loading ? "Enviando..." : "Denunciar"}
            </button>

            <button
              type="button"
              className="boton-cancelar"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>

        </form>

        {mensaje && <p>{mensaje}</p>}
      </div>
    </div>
  );
}
