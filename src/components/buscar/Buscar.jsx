import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Buscar.css';
import { FormControl, FormLabel, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { configUsuarioActual } from '../../services/perfilService';

const Buscar = () => {
  // --- 1. CORRECCIÓN DE URL (NORMALIZACIÓN) ---
  const RAW_URL = import.meta.env.VITE_API_URL;
  const API_URL = RAW_URL.endsWith('/') ? RAW_URL : `${RAW_URL}/`;

  const navigate = useNavigate();
  const location = useLocation();

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 12;

  const [listaCategorias, setListaCategorias] = useState([]); 
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

  // --- CARGA INICIAL ---
  useEffect(() => {
    // 1. Cargar Etiquetas (Ruta corregida sin barra inicial)
    fetch(`${API_URL}api/etiquetas`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(e => ({ label: e.nombre, id: e.id }));
        setEtiquetasDisponibles(mapped);
      })
      .catch(err => console.error("Error al obtener etiquetas:", err));

    // 2. Cargar Categorías (Ruta corregida)
    fetch(`${API_URL}api/categorias`) 
      .then(res => {
          if(!res.ok) throw new Error("Error fetching categorias");
          return res.json();
      })
      .then(data => {
        // Ordenamos por ID para consistencia visual
        setListaCategorias(data.sort((a,b) => a.id - b.id));
      })
      .catch(err => console.error("Error al obtener categorías", err));

    // 3. Obtener Ubicación
    const establecerUbicacion = async () => {
        let ubicacionEncontrada = false;
        try {
            const usuario = await configUsuarioActual();
            if (usuario && usuario.id_localidad) {
                // Ruta corregida
                const res = await fetch(`${API_URL}api/ubicacion/localidades/${usuario.id_localidad}`);
                if (res.ok) {
                    const locData = await res.json();
                    if (locData.latitud && locData.longitud) {
                        setLatitud(parseFloat(locData.latitud));
                        setLongitud(parseFloat(locData.longitud));
                        console.log(`📍 Ubicación establecida: ${locData.nombre}`);
                        ubicacionEncontrada = true;
                    }
                }
            }
        } catch (error) {
            console.log("Usuario sin localidad o no logueado.");
        }

        if (!ubicacionEncontrada && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitud(position.coords.latitude);
                    setLongitud(position.coords.longitude);
                },
                (err) => console.warn("GPS no disponible")
            );
        }
    };

    establecerUbicacion();
    cargarPublicacionesIniciales();
  }, [API_URL]); // Dependencia API_URL agregada

  // Función limpia para cargar estado inicial (Home)
  const cargarPublicacionesIniciales = async () => {
    try {
      setLoadingInitial(true);
      // Ruta corregida
      const res = await fetch(`${API_URL}publicaciones?page=0&limit=${LIMIT}`);
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

  const limpiarFiltros = () => {
    setCategoriasSeleccionadas([]);
    setFechaDesde('');
    setFechaHasta('');
    setRadioKm('');
    setEtiquetasSeleccionadas([]);
    setTagsSeleccionados([]);
    cargarPublicacionesIniciales(); // Reset
  };

  // =====================
  // CONSTRUCCIÓN DE FILTROS
  // =====================
  const construirFiltros = () => {
    const params = {};

    // Backend espera 'id_categoria'
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

  // =====================
  // APLICAR FILTROS (Directo con Fetch para asegurar URL correcta)
  // =====================
  const aplicarFiltros = async () => {
    setLoadingInitial(true);
    setError(null);

    const filtros = construirFiltros();
    // Agregamos paginación base
    const queryParams = new URLSearchParams({
        ...filtros,
        page: 0,
        limit: LIMIT
    });
    
    try {
      // Ruta corregida: 'publicaciones/filtrar' sin barra inicial
      const res = await fetch(`${API_URL}publicaciones/filtrar?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Error en la petición de filtrado");
      
      const publicacionesRaw = await res.json();

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

  const handleCategoriaChange = (idCategoria) => {
    if (categoriasSeleccionadas.includes(idCategoria)) {
      setCategoriasSeleccionadas(categoriasSeleccionadas.filter(id => id !== idCategoria));
    } else {
      setCategoriasSeleccionadas([idCategoria]);
    }
  };

  // Tags desde URL (Query Params externos)
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

  // Auto-aplicar filtros si cambian los tags
  useEffect(() => {
    if (tagsSeleccionados.length > 0) aplicarFiltros();
  }, [tagsSeleccionados]); // Dependencia simplificada

  // =====================
  // LOAD MORE (Scroll Infinito)
  // =====================
  const loadMore = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);

    try {
      const filtros = construirFiltros();
      const hayFiltrosActivos = Object.keys(filtros).length > 0;

      const nextPage = page + 1;
      const queryParams = new URLSearchParams({
          page: nextPage,
          limit: LIMIT,
          ...filtros 
      });

      let endpoint;
      if (hayFiltrosActivos) {
         endpoint = `publicaciones/filtrar?${queryParams.toString()}`;
      } else {
         endpoint = `publicaciones?${queryParams.toString()}`;
      }

      // Ruta corregida: API_URL + endpoint sin barra inicial
      const res = await fetch(`${API_URL}${endpoint}`);
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
              <label>Distancia (Según la ubicación definida en su perfil):</label>
              <select value={radioKm} onChange={e => setRadioKm(e.target.value)}>
                <option value="">Cualquier distancia</option>
                <option value="3">Cerca (3 km)</option>
                <option value="10">Media distancia (10 km)</option>
                <option value="20">Lejos (20 km)</option>
                <option value="50">Muy lejos (50 km)</option>
              </select>
            </div>

            <div className="filtro-grupo">
              <FormControl fullWidth sx={{ mt: 0}}>
                <label>Etiquetas:</label>
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

            <button 
              className="boton-aplicar-filtros" 
              onClick={aplicarFiltros}
              style={{
                backgroundColor: '#C4D6A6',
                color: 'black',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
                marginTop: '10px'
              }}
            >
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
                  
                  {/* Renderizado seguro del objeto categoría */}
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
          style={{ 
            margin: '20px auto', 
            display: 'block',
            backgroundColor: '#C4D6A6',
            color: 'black',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Cargar más
        </button>
      )}
      {loadingMore && <p>Cargando más publicaciones...</p>}
    </div>
  );
};

export default Buscar;