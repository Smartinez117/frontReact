import React, { useState, useEffect } from 'react';
import { fetchPublicacionesFiltradas } from '../../services/busquedaService';
import { useNavigate, useLocation } from 'react-router-dom';
import './Buscar.css';
import { FormControl, FormLabel, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

const API_URL = import.meta.env.VITE_API_URL;

const Buscar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 12;

  // CAMBIO 1: Estado para guardar las categorías que vienen de la DB
  const [listaCategorias, setListaCategorias] = useState([]); 
  
  // CAMBIO 2: 'categorias' ahora guardará IDs (números), no strings
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]); 

  const [publicaciones, setPublicaciones] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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

  const limpiarFiltros = () => {
    setCategoriasSeleccionadas([]);
    setFechaDesde('');
    setFechaHasta('');
    setRadioKm('');
    setEtiquetasSeleccionadas([]);
    setTagsSeleccionados([]);
    // No llamamos aplicarFiltros() aquí directamente para evitar conflictos de estado,
    // mejor dejar que el useEffect o el usuario lo dispare, 
    // o llamar una funcion que resetee y cargue.
    cargarPublicaciones(); // Reseteamos a la carga inicial
  };

  // =====================
  // CARGA INICIAL (Etiquetas, Categorias y Ubicación)
  // =====================
  useEffect(() => {
    // 1. Cargar Etiquetas
    fetch(`${API_URL}/api/etiquetas`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(e => ({ label: e.nombre, id: e.id }));
        setEtiquetasDisponibles(mapped);
      })
      .catch(err => console.error("Error al obtener etiquetas:", err));

    // 2. CAMBIO: Cargar Categorías desde el Backend
    fetch(`${API_URL}/api/categorias`) 
      .then(res => {
          if(!res.ok) throw new Error("Error fetching categorias");
          return res.json();
      })
      .then(data => {
        // data debería ser array de objetos: [{id: 1, nombre: "Adopción", ...}]
        setListaCategorias(data);
      })
      .catch(err => console.error("Error al obtener categorías, usando fallback...", err));

    // 3. Geolocation
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

    cargarPublicaciones();
  }, []);

  const cargarPublicaciones = async () => {
    try {
      setLoadingInitial(true);
      // Asegúrate de que tu endpoint backend soporte page/limit
      const res = await fetch(`${API_URL}/publicaciones?page=0&limit=${LIMIT}`);
      const data = await res.json();
      setPublicaciones(data);
      setPage(0);
      setHasMore(data.length === LIMIT);
    } catch (error) {
      setError("Error cargando publicaciones");
      console.error(error);
    } finally {
      setLoadingInitial(false);
    }
  };

  // =====================
  // APLICAR FILTROS
  // =====================
  const construirFiltros = () => {
    const params = {};

    // CAMBIO 3: Enviamos el ID de la categoría (id_categoria)
    if (categoriasSeleccionadas.length > 0) {
        params.id_categoria = categoriasSeleccionadas[0]; 
    }

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

    return params;
  };

  const aplicarFiltros = async () => {
    setLoadingInitial(true);
    setError(null);

    const filtros = construirFiltros();
    
    try {
      const publicacionesRaw = await fetchPublicacionesFiltradas({
        ...filtros,
        page: 0,
        limit: LIMIT,
      });

      setPublicaciones(publicacionesRaw);
      setPage(0);
      setHasMore(publicacionesRaw.length === LIMIT);
    } catch (e) {
      setError("Error al obtener publicaciones filtradas");
      console.error(e);
    } finally {
      setLoadingInitial(false);
    }
  };

  // CAMBIO 4: Manejo de selección de ID
  const handleCategoriaChange = (idCategoria) => {
    if (categoriasSeleccionadas.includes(idCategoria)) {
      setCategoriasSeleccionadas(categoriasSeleccionadas.filter(id => id !== idCategoria));
    } else {
      // Si solo permites una categoría a la vez:
      setCategoriasSeleccionadas([idCategoria]);
    }
  };

  // =====================
  // TAGS INICIALES DESDE URL
  // =====================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const etiquetaInicial = params.get("etiqueta");

    if (etiquetaInicial && etiquetasDisponibles.length > 0) {
      const encontrada = etiquetasDisponibles.find(opt => opt.label === etiquetaInicial);

      if (encontrada) {
        setEtiquetasSeleccionadas([encontrada]);
        setTagsSeleccionados([etiquetaInicial]);
        setMostrarFiltros(true);
      }
    }
  }, [location.search, etiquetasDisponibles]);

  useEffect(() => {
    if (tagsSeleccionados.length > 0) aplicarFiltros();
  }, [tagsSeleccionados]);

  // =====================
  // INFINITE SCROLL
  // =====================
  const loadMore = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);

    try {
      const filtros = construirFiltros();
      const filtrosActivos = Object.keys(filtros).length > 0;

      let url;
      const nextPage = page + 1;

      // Convertimos los filtros a Query Params
      const queryParams = new URLSearchParams({
          page: nextPage,
          limit: LIMIT,
          ...filtros 
      });

      if (filtrosActivos) {
         // Asegúrate de que tu backend tenga esta ruta o usa la misma ruta con params
         url = `${API_URL}/publicaciones/filtrar?${queryParams.toString()}`;
      } else {
         url = `${API_URL}/publicaciones?${queryParams.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.length < LIMIT) setHasMore(false);

      setPublicaciones(prev => [...prev, ...data]);
      setPage(nextPage);

    } catch (e) {
      console.error("Error cargando más publicaciones", e);
    } finally {
      setLoadingMore(false);
    }
  };


  // =====================
  // RENDER
  // =====================
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
            <div className="filtro-grupo">
              <label>Categoría:</label>
              {/* CAMBIO 5: Mapeamos las categorías traídas del backend */}
              {listaCategorias.map((cat) => (
                <button
                  key={cat.id}
                  className={`filtro-boton ${categoriasSeleccionadas.includes(cat.id) ? 'activo' : ''}`}
                  onClick={() => handleCategoriaChange(cat.id)}
                  type="button"
                >
                  {cat.nombre}
                </button>
              ))}
              {categoriasSeleccionadas.length > 0 && (
                <button className="filtro-boton limpiar" onClick={() => setCategoriasSeleccionadas([])}>
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
              <label>Buscar cerca de tu ubicación:</label>
              <select value={radioKm} onChange={e => setRadioKm(e.target.value)}>
                <option value="">Cualquier distancia</option>
                <option value="3">Cerca (3 km)</option>
                <option value="10">Media distancia (10 km)</option>
                <option value="20">Lejos (20 km)</option>
                <option value="50">Muy lejos (50 km)</option>
              </select>
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

            <button className="boton-limpiar-filtros" onClick={limpiarFiltros}>
              Quitar filtros
            </button>
          </div>
        )}

        <button className="boton-crear" onClick={() => navigate('/publicar')}>
          Nueva publicación
        </button>
      </div>

      {loadingInitial && <p>Cargando publicaciones...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loadingInitial && !error && (
        <ul className="lista-publicaciones">
          {publicaciones.length === 0 && <li>No hay publicaciones disponibles.</li>}

          {publicaciones.map(pub => {
            let imagenPrincipal = null;

            if (Array.isArray(pub.imagenes) && pub.imagenes.length > 0) {
              imagenPrincipal = pub.imagenes[0];
            } else if (typeof pub.imagenes === "string") {
              imagenPrincipal = pub.imagenes;
            }

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
                  <p className="publicacion-fecha">
                    {pub.fecha_creacion ? new Date(pub.fecha_creacion).toLocaleDateString('es-AR') : '-'}
                  </p>
                  <p className="publicacion-localidad">📍 {pub.localidad || 'Sin ubicación'}</p>
                  
                  {/* CAMBIO 6 (CRÍTICO): Renderizado condicional del objeto categoría */}
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

                  <button
                    type="button"
                    className="boton-crear boton-detalle"
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

      {hasMore && !loadingMore && !loadingInitial && publicaciones.length > 0 && (
        <button
          className="boton-cargar-mas"
          onClick={loadMore}
          style={{ margin: '20px auto', display: 'block' }}
        >
          Cargar más
        </button>
      )}
      {loadingMore && <p>Cargando más publicaciones...</p>}
    </div>
  );
};

export default Buscar;