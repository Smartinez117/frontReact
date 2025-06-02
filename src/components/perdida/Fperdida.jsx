import React, { useState } from 'react';
import './cperdida.css';

function CrearPublicacion() {
  const [tipoPublicacion, setTipoPublicacion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [etiquetas, setEtiquetas] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [enlazarAnterior, setEnlazarAnterior] = useState(false);
  const [imagenes, setImagenes] = useState([]);

  const handleImagenes = (event) => {
    const files = Array.from(event.target.files);
    setImagenes(files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para enviar el formulario
    console.log({
      tipoPublicacion,
      descripcion,
      etiquetas,
      ubicacion,
      enlazarAnterior,
      imagenes
    });
  };

  return (
    <form className="form-publicacion" onSubmit={handleSubmit}>
      <h2>Crear publicación</h2>

      {/* Tipos de publicación */}
      <div className="tipo-publicacion">
        {['busqueda'].map(tipo => (
          <button
            key={tipo}
            type="button"
            className={tipoPublicacion === tipo ? 'activo' : ''}
            onClick={() => setTipoPublicacion(tipo)}
          >
            {tipo}
          </button>
        ))}
      </div>

      {/* Descripción */}
      <textarea
        placeholder="Descripción del caso..."
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      {/* Subir fotos */}
      <div className="zona-fotos">
        <label htmlFor="input-fotos" className="zona-drop">
          Subir fotos<br />
          <small>Arrastrá y soltá o hacé click para subir</small>
        </label>
        <input
          id="input-fotos"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImagenes}
          style={{ display: 'none' }}
        />
      </div>

      {/* Etiquetas */}
      <input
        type="text"
        placeholder="Añadir etiquetas (e.g., #Perro, #Gato)"
        value={etiquetas}
        onChange={(e) => setEtiquetas(e.target.value)}
      />

      {/* Opciones extra */}
      <div className="extras">
        <label>
          <input
            type="text"
            placeholder="Añadir ubicación"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
          />
        </label>

        <label>
          <input
            type="checkbox"
            checked={enlazarAnterior}
            onChange={(e) => setEnlazarAnterior(e.target.checked)}
          />
          Enlazar a publicación anterior
        </label>
      </div>

      <button type="submit" className="btn-publicar">Publicar</button>
    </form>
  );
}

export default CrearPublicacion;
