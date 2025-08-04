import React, { useState, useEffect } from 'react';
import { fetchPublicacionesFiltradas } from '../../services/adopcionService';
import { useNavigate } from 'react-router-dom';
import QR from "../qr/fqr.jsx";
import { FaShareAlt, FaQrcode } from 'react-icons/fa';
import './Buscar.css';
import { FormControl, FormLabel, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

const categoriasPosibles = [
  { label: "Adopción", value: "Adopción" },
  { label: "Búsqueda", value: "Búsqueda" },
  { label: "Encuentro", value: "Encuentro" },
  { label: "Estado crítico", value: "Estado Crítico" }
];

// Función auxiliar para obtener el nombre de la localidad
const fetchNombreLocalidad = async (idLocacion) => {
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/ubicacion/localidades/${idLocacion}`);
    if (!res.ok) throw new Error("Error al obtener localidad");
    const data = await res.json();
    return data.nombre;
  } catch (error) {
    console.error(`Error obteniendo localidad para ID ${idLocacion}:`, error);
    return "Localidad desconocida";
  }
};

const Buscar = () => {
  const navigate = useNavigate();
  const [idPublicacion, setIdPublicacion] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [radioKm, setRadioKm] = useState('');
  const [tagsSeleccionados, setTagsSeleccionados] = useState([]);

  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);
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

    // Obtener ubicación del navegador
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitud(position.coords.latitude);
          setLongitud(position.coords.longitude);
        },
        (err) => {
          console.warn("Ubicación no disponible:", err.message);
        }
      );
    }

    // Cargar publicaciones por defecto
    aplicarFiltros();
  }, []);

  const aplicarFiltros = async () => {
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

    if (latitud && longitud) {
      params.lat = latitud;
      params.lon = longitud;
    }

    try {
      const publicacionesRaw = await fetchPublicacionesFiltradas(params);

      const publicacionesConLocalidad = await Promise.all(
        publicacionesRaw.map(async (pub) => {
          const localidadNombre = await fetchNombreLocalidad(pub.id_locacion);
          return { ...pub, localidadNombre };
        })
      );

      setPublicaciones(publicacionesConLocalidad);
    } catch (e) {
      console.error("Error en fetch:", e);
      setError(e.message || 'Error al obtener publicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriaChange = (value) => {
    if (categorias.includes(value)) {
      setCategorias(categorias.filter(cat => cat !== value));
    } else {
      setCategorias([value]);
    }
  };

  const handleClickQR = (e) => {
    const id = Number(e.currentTarget.getAttribute("data-id"));
    setIdPublicacion(id);
  };

  return (
    <div className="buscar-container">
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
                <label>Radio desde tu ubicación (km):</label>
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
                  <p className="publicacion-localidad">📍 {pub.localidadNombre}</p>
                  <span className="publicacion-categoria">{pub.categoria}</span>

                  <div className="publicacion-etiquetas">
                    {pub.etiquetas.map((etiqueta, idx) => (
                      <span key={idx} className="etiqueta-chip">
                        {etiqueta}
                      </span>
                    ))}
                  </div>

                  {/*<div className="publicacion-acciones">
                    <button className="boton-icono" type="button" title="Compartir" data-id={pub.id}>
                      <FaShareAlt />
                    </button>
                    <button className="boton-icono" type="button" title="QR" data-id={pub.id} onClick={handleClickQR}>
                      <FaQrcode />
                    </button>
                  </div>*/}

                  <button
                    type="button"
                    className="boton-crear boton-detalle"
                    data-id={pub.id}
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

      {idPublicacion && (
        <div className="qr-container" style={{ marginTop: '30px' }}>
          <QR idPublicacion={idPublicacion} />
        </div>
      )}
    </div>
  );
};

export default Buscar;
