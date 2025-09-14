import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FormControl,
  FormLabel,
  TextField,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Avatar,
  AvatarGroup,
  styled,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import {
  fetchPublicacionesFiltradas,
  fetchTodasLasPublicaciones,
  fetchTodasLasEtiquetas,
  obtenerUbicacionUsuario,
} from "../../services/browseService";
import "../../global.css";

const CATEGORIAS_OPCIONES = [
  { label: "Adopción", value: "Adopción" },
  { label: "Búsqueda", value: "Búsqueda" },
  { label: "Encuentro", value: "Encuentro" },
  { label: "Estado crítico", value: "Estado Crítico" }
];

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  height: '100%',
  backgroundColor: (theme.vars || theme).palette.background.paper,
  '&:hover': {
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'hsla(210, 98%, 48%, 0.5)',
    outlineOffset: '2px',
  },
}));

const StyledCardContent = styled(CardContent)({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: 16,
  flexGrow: 1,
  '&:last-child': {
    paddingBottom: 16,
  },
});

const StyledTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const Browse = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [publicaciones, setPublicaciones] = useState([]);
  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([]);
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroRadioKm, setFiltroRadioKm] = useState("");
  const [ubicacion, setUbicacion] = useState({ latitud: null, longitud: null });
  const [focusedCardIndex, setFocusedCardIndex] = useState(null);
  const [estado, setEstado] = useState({
    cargando: true,
    error: null,
    mostrarFiltros: false
  });

  useEffect(() => {
    obtenerEtiquetas();
    obtenerUbicacion();
    cargarPublicaciones();
  }, []);

  useEffect(() => {
    const parametrosBusqueda = new URLSearchParams(location.search);
    const etiquetaInicial = parametrosBusqueda.get("etiqueta");

    if (etiquetaInicial) {
      const etiquetaEncontrada = etiquetasDisponibles.find(
        opcion => opcion.label === etiquetaInicial
      );

      if (etiquetaEncontrada) {
        setEtiquetasSeleccionadas([etiquetaEncontrada]);
        setEstado(prev => ({ ...prev, mostrarFiltros: true }));
      }
    }
  }, [location.search, etiquetasDisponibles]);

  const obtenerEtiquetas = async () => {
    try {
      const etiquetasMapeadas = await fetchTodasLasEtiquetas();
      setEtiquetasDisponibles(etiquetasMapeadas);
    } catch (error) {
      console.error("Error al obtener etiquetas:", error);
      setEstado(prev => ({ ...prev, error: error.message }));
    }
  };

  const obtenerUbicacion = async () => {
    try {
      const coords = await obtenerUbicacionUsuario();
      setUbicacion(coords);
    } catch (error) {
      console.warn("Ubicación no disponible:", error.message);
    }
  };

  const cargarPublicaciones = async () => {
    try {
      setEstado(prev => ({ ...prev, cargando: true }));
      const datos = await fetchTodasLasPublicaciones();
      setPublicaciones(datos);
    } catch (error) {
      console.error("Error cargando publicaciones:", error);
      setEstado(prev => ({ ...prev, error: error.message }));
    } finally {
      setEstado(prev => ({ ...prev, cargando: false }));
    }
  };

  const aplicarFiltros = async () => {
    setEstado(prev => ({ ...prev, cargando: true, error: null }));

    const parametros = {};
    if (categoriasSeleccionadas.length > 0) {
      parametros.categoria = categoriasSeleccionadas[0];
    }
    if (filtroFechaDesde) parametros.fecha_min = filtroFechaDesde;
    if (filtroFechaHasta) parametros.fecha_max = filtroFechaHasta;

    const radio = parseFloat(filtroRadioKm);
    if (!isNaN(radio)) parametros.radio = radio;

    if (etiquetasSeleccionadas.length > 0) {
      parametros.etiquetas = etiquetasSeleccionadas.map(etiqueta => etiqueta.label).join(",");
    }

    if (ubicacion.latitud && ubicacion.longitud) {
      parametros.lat = ubicacion.latitud;
      parametros.lon = ubicacion.longitud;
    }

    try {
      const publicacionesFiltradas = await fetchPublicacionesFiltradas(parametros);
      setPublicaciones(publicacionesFiltradas);
    } catch (error) {
      console.error("Error en fetch filtrado:", error);
      setEstado(prev => ({
        ...prev,
        error: error.message || "Error al obtener publicaciones"
      }));
    } finally {
      setEstado(prev => ({ ...prev, cargando: false }));
    }
  };

  const manejarCambioCategoria = valor => {
    if (categoriasSeleccionadas.includes(valor)) {
      setCategoriasSeleccionadas(
        categoriasSeleccionadas.filter(categoria => categoria !== valor)
      );
    } else {
      setCategoriasSeleccionadas([valor]);
    }
  };

  const toggleFiltros = () => {
    setEstado(prev => ({
      ...prev,
      mostrarFiltros: !prev.mostrarFiltros
    }));
  };

  const navegarADetalle = idPublicacion => {
    navigate(`/publicacion/${idPublicacion}`);
  };

  const obtenerImagenPrincipal = publicacion => {
    if (Array.isArray(publicacion.imagenes) && publicacion.imagenes.length > 0) {
      return publicacion.imagenes[0];
    }
    if (typeof publicacion.imagenes === "string") {
      return publicacion.imagenes;
    }
    return null;
  };

  const handleFocus = (index) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  const Search = () => (
    <FormControl sx={{ width: { xs: '100%', md: '25ch' } }} variant="outlined">
      <OutlinedInput
        size="small"
        id="search"
        placeholder="Buscar…"
        sx={{ flexGrow: 1 }}
        startAdornment={
          <InputAdornment position="start" sx={{ color: 'text.primary' }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        inputProps={{
          'aria-label': 'search',
        }}
      />
    </FormControl>
  );

  const renderChipsCategorias = () => (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        gap: 1,
        overflow: 'auto',
        pb: 1,
      }}
    >
      <Chip
        onClick={() => {
          setCategoriasSeleccionadas([]);
          aplicarFiltros();
        }}
        size="medium"
        label="Todas las categorías"
        variant={categoriasSeleccionadas.length === 0 ? "filled" : "outlined"}
      />
      {CATEGORIAS_OPCIONES.map(opcion => (
        <Chip
          key={opcion.value}
          onClick={() => {
            manejarCambioCategoria(opcion.value);
            aplicarFiltros();
          }}
          size="medium"
          label={opcion.label}
          variant={categoriasSeleccionadas.includes(opcion.value) ? "filled" : "outlined"}
        />
      ))}
    </Box>
  );

  const renderPublicaciones = () => {
    if (estado.cargando) {
      return <Typography>Cargando publicaciones...</Typography>;
    }

    if (estado.error) {
      return <Typography color="error">Error: {estado.error}</Typography>;
    }

    if (publicaciones.length === 0) {
      return <Typography>No hay publicaciones disponibles.</Typography>;
    }

    return (
      <Grid container spacing={2}>
        {publicaciones.map((publicacion, index) => {
          const imagenPrincipal = obtenerImagenPrincipal(publicacion);

          return (
            <Grid item xs={12} md={4} key={publicacion.id}>
              <StyledCard
                variant="outlined"
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                tabIndex={0}
                className={focusedCardIndex === index ? 'Mui-focused' : ''}
                sx={{ height: '100%' }}
                onClick={() => navegarADetalle(publicacion.id)}
              >
                {imagenPrincipal && (
                  <CardMedia
                    component="img"
                    image={imagenPrincipal}
                    sx={{
                      height: { sm: 'auto', md: 200 },
                      aspectRatio: '16/9',
                      objectFit: 'cover'
                    }}
                  />
                )}
                <StyledCardContent sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                }}>
                  <Typography gutterBottom variant="caption" component="div">
                    {publicacion.categoria}
                  </Typography>
                  <Typography gutterBottom variant="h6" component="div">
                    {publicacion.titulo}
                  </Typography>
                  <StyledTypography variant="body2" color="text.secondary" gutterBottom>
                    {publicacion.descripcion || "Sin descripción"}
                  </StyledTypography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      📍 {publicacion.localidad}
                    </Typography>
                  </Box>
                </StyledCardContent>
              </StyledCard>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
      {/* Barra de búsqueda móvil */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          flexDirection: 'row',
          gap: 1,
          width: '100%',
        }}
      >
        <Search />
        <IconButton size="small" aria-label="Filtros" onClick={toggleFiltros}>
          <FilterAltIcon />
        </IconButton>
      </Box>

      {/* Encabezado con categorías y búsqueda */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
        }}
      >
        {renderChipsCategorias()}

        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'row',
            gap: 1,
          }}
        >
          <Search />
          <IconButton size="small" aria-label="Filtros" onClick={toggleFiltros}>
            <FilterAltIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Filtros avanzados */}
      {estado.mostrarFiltros && (
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Filtros avanzados
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Fecha desde"
                type="date"
                value={filtroFechaDesde}
                onChange={e => setFiltroFechaDesde(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Fecha hasta"
                type="date"
                value={filtroFechaHasta}
                onChange={e => setFiltroFechaHasta(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Radio (km)"
                type="number"
                placeholder="Ej: 20"
                value={filtroRadioKm}
                onChange={e => setFiltroRadioKm(e.target.value)}
              />
            </Box>

            <FormControl fullWidth>
              <FormLabel>Etiquetas</FormLabel>
              <Autocomplete
                multiple
                options={etiquetasDisponibles}
                value={etiquetasSeleccionadas}
                onChange={(event, nuevasEtiquetas) => {
                  setEtiquetasSeleccionadas(nuevasEtiquetas);
                }}
                getOptionLabel={opcion => opcion.label}
                renderInput={parametros => (
                  <TextField
                    {...parametros}
                    placeholder="Seleccioná etiquetas"
                  />
                )}
              />
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={aplicarFiltros}
                variant="contained"
                color="primary"
              >
                Aplicar filtros
              </IconButton>
              <IconButton
                onClick={() => {
                  setFiltroFechaDesde("");
                  setFiltroFechaHasta("");
                  setFiltroRadioKm("");
                  setEtiquetasSeleccionadas([]);
                }}
                color="secondary"
              >
                Limpiar
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}

      {/* Publicaciones */}
      {renderPublicaciones()}
    </Box>
  );
};

export default Browse;