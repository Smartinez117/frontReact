import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CssBaseline,
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Divider,
  TextField,
  Backdrop,
  Fade,
} from "@mui/material";
import {
  fetchPublicacionPorId,
  fetchUsuario,
  fetchComentariosPublicacion,
  enviarComentario as enviarComentarioService,
  descargarPDF as descargarPDFService,
  compartirPublicacion as compartirPublicacionService,
} from "../../services/publicacionService";
import ImageSlider from "./components/ImageSlider";
import ImageModal from "./components/ImageModal";
import MapaUbicacion from "./components/MapaUbicacion";
import ComentariosSection from "./components/ComentariosSection";
import Report from "../../components/Report";
import UsuarioInfo from "./components/UsuarioInfo";
import AccionesPublicacion from "./components/AccionesPublicacion";
import "keen-slider/keen-slider.min.css";
import "leaflet/dist/leaflet.css";

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [publicacion, setPublicacion] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [usuariosComentarios, setUsuariosComentarios] = useState({});
  const [estado, setEstado] = useState({
    cargando: true,
    error: null,
    modalAbierto: false,
    slideModal: 0,
    verDescripcionCompleta: false,
    publicandoComentario: false,
    errorComentario: null,
    mostrarModalReporte: false,
  });

  // Cargar datos de la publicación
  useEffect(() => {
    const cargarDatosPublicacion = async () => {
      try {
        setEstado((prev) => ({ ...prev, cargando: true }));

        const publicacionData = await fetchPublicacionPorId(id);
        setPublicacion(publicacionData);

        if (publicacionData.id_usuario) {
          const usuarioData = await fetchUsuario(publicacionData.id_usuario);
          setUsuario(usuarioData);
        }

        const { comentarios: comentariosData, usuarios: usuariosData } =
          await fetchComentariosPublicacion(id);

        setComentarios(comentariosData);
        setUsuariosComentarios(usuariosData);
      } catch (error) {
        console.error("Error cargando publicación:", error);
        setEstado((prev) => ({ ...prev, error: error.message }));
      } finally {
        setEstado((prev) => ({ ...prev, cargando: false }));
      }
    };

    cargarDatosPublicacion();
  }, [id]);

  // Handlers para estado
  const actualizarEstado = (updates) => {
    setEstado((prev) => ({ ...prev, ...updates }));
  };

  const abrirModal = (slideIndex = 0) => {
    actualizarEstado({ modalAbierto: true, slideModal: slideIndex });
  };

  const cerrarModal = () => {
    actualizarEstado({ modalAbierto: false });
  };

  const toggleDescripcionCompleta = () => {
    actualizarEstado({
      verDescripcionCompleta: !estado.verDescripcionCompleta,
    });
  };

  const toggleModalReporte = () => {
    actualizarEstado({
      mostrarModalReporte: !estado.mostrarModalReporte,
    });
  };

  // Handlers para acciones
  const handleDescargarPDF = async () => {
    try {
      await descargarPDFService(id, publicacion.titulo);
    } catch (error) {
      console.error("Error descargando PDF:", error);
    }
  };

  const handleCompartir = () => {
    compartirPublicacionService(id, publicacion.titulo);
  };

  const handleEnviarComentario = async (textoComentario) => {
    try {
      actualizarEstado({ publicandoComentario: true, errorComentario: null });

      await enviarComentarioService(id, textoComentario);

      // Recargar comentarios
      const { comentarios: nuevosComentarios, usuarios: nuevosUsuarios } =
        await fetchComentariosPublicacion(id);

      setComentarios(nuevosComentarios);
      setUsuariosComentarios(nuevosUsuarios);
    } catch (error) {
      console.error("Error enviando comentario:", error);
      actualizarEstado({ errorComentario: error.message });
    } finally {
      actualizarEstado({ publicandoComentario: false });
    }
  };

  if (estado.cargando) {
    return (
      <Container maxWidth="md">
        <Typography sx={{ p: 4 }}>Cargando publicación...</Typography>
      </Container>
    );
  }

  if (!publicacion) {
    return (
      <Container maxWidth="md">
        <Typography sx={{ p: 4 }}>No se encontró la publicación</Typography>
      </Container>
    );
  }

  const {
    titulo,
    descripcion,
    fecha_creacion,
    coordenadas = [],
    imagenes = [],
    etiquetas = [],
    categoria,
  } = publicacion;

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md">
        <Box
          sx={{
            bgcolor: "#f8f9fa",
            minHeight: "100vh",
            p: 3,
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          {/* Carrusel de imágenes */}
          {imagenes.length > 0 && (
            <ImageSlider imagenes={imagenes} onImageClick={abrirModal} />
          )}

          {/* Modal de imágenes */}
          <ImageModal
            abierto={estado.modalAbierto}
            onCerrar={cerrarModal}
            imagenes={imagenes}
            slideInicial={estado.slideModal}
          />

          {/* Información del usuario */}
          {usuario && (
            <UsuarioInfo
              usuario={usuario}
              fechaCreacion={fecha_creacion}
              onNavigateToProfile={() => navigate(`/perfil/${usuario.slug}`)}
            />
          )}

          {/* Título y categoría */}
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            {titulo}
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Categoría: {categoria}
          </Typography>

          {/* Etiquetas */}
          {etiquetas.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {etiquetas.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1, cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/buscar?etiqueta=${encodeURIComponent(tag)}`)
                  }
                />
              ))}
            </Box>
          )}

          {/* Descripción */}
          <Typography paragraph>
            {estado.verDescripcionCompleta || descripcion.length <= 200
              ? descripcion
              : `${descripcion.substring(0, 200)}...`}
          </Typography>

          {descripcion.length > 200 && (
            <Button variant="text" onClick={toggleDescripcionCompleta}>
              {estado.verDescripcionCompleta ? "Mostrar menos" : "Mostrar más"}
            </Button>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Mapa de ubicación */}
          {coordenadas.length === 2 && (
            <MapaUbicacion coordenadas={coordenadas} />
          )}

          {/* Acciones: Descargar PDF y Compartir */}
          <AccionesPublicacion
            onDescargarPDF={handleDescargarPDF}
            onCompartir={handleCompartir}
          />

          {/* Reportar publicación */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={toggleModalReporte}
            >
              🚩 Reportar
            </Button>

            {estado.mostrarModalReporte && (
              <Report
                idPublicacion={id}
                idUsuario={publicacion.id_usuario}
                onClose={toggleModalReporte}
              />
            )}
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Sección de comentarios */}
          <ComentariosSection
            comentarios={comentarios}
            usuariosComentarios={usuariosComentarios}
            onEnviarComentario={handleEnviarComentario}
            publicandoComentario={estado.publicandoComentario}
            errorComentario={estado.errorComentario}
          />
        </Box>
      </Container>
    </>
  );
};

export default View;
