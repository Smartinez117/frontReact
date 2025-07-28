import React, { useState, useEffect } from 'react';
import { fetchPublicacionesFiltradas } from '../../services/perfilService';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Importo iconos para los botones editar y eliminar (opcional)
import './publicacion.css';
import { FormControl, FormLabel, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

const categoriasPosibles = [
  { label: "Adopción", value: "Adopción" },
  { label: "Búsqueda", value: "Búsqueda" },
  { label: "Encuentro", value: "Encuentro" },
  { label: "Estado crítico", value: "Estado Crítico" }
];

const SelfPublications = () => {
  const navigate = useNavigate();
  
  const [categorias, setCategorias] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [radioKm, setRadioKm] = useState('');
  const [tagsSeleccionados, setTagsSeleccionados] = useState([]);

  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState([]);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([]);

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    // Obtener etiquetas desde backend
    fetch('http://localhost:5000/api/etiquetas')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(e => ({ label: e.nombre, id: e.id }));
        setEtiquetasDisponibles(mapped);
      })
      .catch(err => console.error("Error al obtener etiquetas:", err));

    // Cargar publicaciones por defecto
    aplicarFiltros();
  }, []);

  const aplicarFiltros = () => {
    setLoading(true);
    setError(null);

    const params = {};

    if (categorias.length > 0) params.categoria = categorias[0];
    if (fechaDesde) params.fecha_min = fechaDesde;
    if (fechaHasta) params.fecha_max = fechaHasta;

    const radio = parseFloat(radioKm);
    if (!isNaN(radio)) params.radio = radio;

    if (tagsSeleccionados.length > 0)
      params.etiquetas = tagsSeleccionados.join(',');

    // Nota: Se ha quitado la parte de latitud y longitud para ubicación

    fetchPublicacionesFiltradas(params)
      .then(setPublicaciones)
      .catch((e) => {
        console.error("Error en fetch:", e);
        setError(e.message || 'Error al obtener publicaciones');
      })
      .finally(() => setLoading(false));
  };

  const handleCategoriaChange = (value) => {
    if (categorias.includes(value)) {
      setCategorias(categorias.filter(cat => cat !== value));
    } else {
      setCategorias([value]);
    }
  };

  // Estados para guardar ids seleccionados de editar y eliminar
  const [idEditar, setIdEditar] = useState(null);
  const [idEliminar, setIdEliminar] = useState(null);

  const handleEditar = (id) => {
    setIdEditar(id);
    // Aquí puedes agregar lógica extra para editar, p.ej. navegar o abrir modal
    console.log("Editar publicación con id:", id);
  };

  const handleEliminar = (id) => {
    setIdEliminar(id);
    // Aquí puedes agregar lógica para eliminar p.ej. llamar API y refrescar lista
    console.log("Eliminar publicación con id:", id);
  };

  return (
    <div className="SelfPublications-container">
      <div className="header-filtros">

        <button
          className="boton-toggle-filtros"
          onClick={() => setMostrarFiltros(prev => !prev)}
          style={{ marginBottom: '1rem' }}
        >
          {mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>

        {mostrarFiltros && (
          <div className="filtros-avanzados">
            <div className="filtro-grupo">
              <label>Categoría:</label>
              {categoriasPosibles.map(({ label, value }) => (
                <button
                  key={value}
                  className={`filtro-boton ${categorias.includes(value) ? 'activo' : ''}`}
                  onClick={() => handleCategoriaChange(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
              {categorias.length > 0 && (
                <button
                  className="filtro-boton limpiar"
                  onClick={() => setCategorias([])}
                  type="button"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="filtro-grupo">
              <label>Fecha desde:</label>
              <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
              <label>hasta:</label>
              <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
            </div>

            <div className="filtro-grupo">
              <label>Radio (km):</label>
              <input
                type="number"
                placeholder="Ej: 20"
                value={radioKm}
                onChange={e => setRadioKm(e.target.value)}
              />
            </div>

            <div className="filtro-grupo">
              <FormControl fullWidth sx={{ mt: 1 }}>
                <FormLabel>Etiquetas</FormLabel>
                <Autocomplete
                  multiple
                  options={etiquetasDisponibles}
                  value={etiquetasSeleccionadas}
                  onChange={(event, newValue) => {
                    setEtiquetasSeleccionadas(newValue);
                    setTagsSeleccionados(newValue.map(opt => opt.label));
                  }}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Seleccioná etiquetas" />
                  )}
                />
              </FormControl>
            </div>

            <button className="boton-aplicar-filtros" onClick={aplicarFiltros}>
              Aplicar filtros
            </button>
          </div>
        )}

        <button className="boton-crear" type="button" onClick={() => navigate('/publicar')}>
          Nueva publicación
        </button>
      </div>

      {loading && <p>Cargando publicaciones...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && (
        <ul className="lista-publicaciones">
          {publicaciones.length === 0 && (
            <li>No hay publicaciones que coincidan con los filtros.</li>
          )}
          {publicaciones.map(pub => {
            const imagenPrincipal = pub.imagenes.length > 0 ? pub.imagenes[0] : null;

            return (
              <li key={pub.id} className="publicacion-card">
                {imagenPrincipal && (
                  <div className="publicacion-imagen-container">
                    <img
                      src={imagenPrincipal}
                      alt={`Imagen de ${pub.titulo}`}
                      className="publicacion-imagen"
                    />
                  </div>
                )}

                <div className="publicacion-contenido">
                  <h3 className="publicacion-titulo">{pub.titulo}</h3>
                  <span className="publicacion-categoria">{pub.categoria}</span>

                  <div className="publicacion-etiquetas">
                    {pub.etiquetas.map((etiqueta, idx) => (
                      <span key={idx} className="etiqueta-chip">
                        {etiqueta}
                      </span>
                    ))}
                  </div>

                  <div className="publicacion-acciones">
                    <button
                      className="boton-crear boton-detalle"
                      data-id={pub.id}
                      onClick={() => navigate(`/publicacion/${pub.id}`)}
                    >
                      Ver detalle
                    </button>

                    <button
                      type="button"
                      className="boton-accion editar"
                      data-id={pub.id}
                      onClick={() => handleEditar(pub.id)}
                      title="Editar publicación"
                    >
                      {/* Opcional: icono para editar */}
                      {/* <FaEdit /> */} Editar
                    </button>

                    <button
                      type="button"
                      className="boton-accion eliminar"
                      data-id={pub.id}
                      onClick={() => handleEliminar(pub.id)}
                      title="Eliminar publicación"
                    >
                      {/* Opcional: icono para eliminar */}
                      {/* <FaTrash /> */} Eliminar
                    </button>
                  </div>
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
