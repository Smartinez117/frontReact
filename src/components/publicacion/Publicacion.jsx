import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress"; // 🔹 IMPORTANTE: Agregado para el spinner
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete"; 
import FlagIcon from "@mui/icons-material/Flag"; 
import IconButton from "@mui/material/IconButton"; 
import Tooltip from "@mui/material/Tooltip"; 
import LocationOnIcon from "@mui/icons-material/LocationOn";

import TextField from "@mui/material/TextField";
import { getAuth } from "firebase/auth";
import ReporteForm from "../Reportes/Reportes.jsx";

import { useNavigate } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  height: "90vh",
  bgcolor: "background.paper",
  borderRadius: 2,
  outline: "none",
  p: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const AdaptiveHeight = (slider) => {
  function updateHeight() {
    slider.container.style.height =
      slider.slides[slider.track.details.rel].offsetHeight + "px";
  }
  slider.on("created", updateHeight);
  slider.on("slideChanged", updateHeight);
};

function Arrow({ left, onClick, disabled }) {
  return (
    <svg
      onClick={onClick}
      className={`arrow ${left ? "arrow--left" : "arrow--right"}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      style={{
        cursor: disabled ? "default" : "pointer",
        width: 40,
        height: 40,
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [left ? "left" : "right"]: 10,
        fill: disabled ? "#ccc" : "rgba(0,0,0,0.6)",
        zIndex: 10,
        userSelect: "none",
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.7)",
        boxShadow: "0 0 5px rgba(0,0,0,0.3)",
      }}
    >
      {left ? (
        <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
      ) : (
        <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
      )}
    </svg>
  );
}

export default function Publicacion() {
  const { id } = useParams();
  const [publicacion, setPublicacion] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [nombreLocalidad, setNombreLocalidad] = useState("");

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalSlide, setModalSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [verDescripcionCompleta, setVerDescripcionCompleta] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [usuariosComentarios, setUsuariosComentarios] = useState({});
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [publicandoComentario, setPublicandoComentario] = useState(false);
  const [errorComentario, setErrorComentario] = useState(null);
  
  // Nuevo estado para bloqueo de descarga
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [mostrarModal, setMostrarModal] = useState(false); 
  const [comentarioAReportar, setComentarioAReportar] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${API_URL}/publicaciones/${id}`)
      .then((res) => {
        setPublicacion(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener la publicación:", err);
        setLoading(false);
      });
  }, [id, API_URL]);

  useEffect(() => {
    if (publicacion && publicacion.id_locacion) {
      axios.get(`${API_URL}/api/ubicacion/localidades/${publicacion.id_locacion}`)
        .then(res => {
            if(res.data && res.data.nombre) {
                setNombreLocalidad(res.data.nombre);
            }
        })
        .catch(err => console.error("Error cargando localidad", err));
    }
  }, [publicacion, API_URL]);

  useEffect(() => {
    if (publicacion?.id_usuario) {
      axios
        .get(`${API_URL}/usuario/${publicacion.id_usuario}`)
        .then((res) => setUsuario(res.data))
        .catch((err) => console.error("Error al obtener el usuario:", err));
    }
  }, [publicacion, API_URL]);

  useEffect(() => {
    if (!id) return;

    axios
      .get(`${API_URL}/comentarios/publicacion/${id}`)
      .then(async (res) => {
        const comentariosData = res.data;
        setComentarios(comentariosData);

        const idsUnicos = [...new Set(comentariosData.map(c => c.id_usuario))];
        const usuariosMap = {};
        
        await Promise.all(
          idsUnicos.map(async (idUsuario) => {
            try {
              const res = await axios.get(`${API_URL}/usuario/${idUsuario}`);
              usuariosMap[idUsuario] = res.data;
            } catch (err) {
              console.error(`Error al obtener usuario ${idUsuario}`, err);
            }
          })
        );
        setUsuariosComentarios(usuariosMap);
      })
      .catch((err) => {
        console.error("Error al obtener comentarios:", err);
      });
  }, [id, API_URL]);

  const [sliderRef, instanceRef] = useKeenSlider(
    {
      initial: 0,
      slideChanged(s) {
        setCurrentSlide(s.track.details.rel);
      },
      created() {
        setLoaded(true);
      },
    },
    [AdaptiveHeight]
  );

  const handleOpen = (idx) => {
    setModalSlide(idx);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowLeft') setModalSlide((s) => Math.max(0, s - 1));
      const total = publicacion?.imagenes?.length || 0;
      if (e.key === 'ArrowRight') setModalSlide((s) => Math.min(total - 1, s + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, publicacion?.imagenes?.length, publicacion]);

  if (loading) return <Typography sx={{ p: 4 }}>Cargando publicación...</Typography>;
  if (!publicacion) return <Typography sx={{ p: 4 }}>No se encontró la publicación</Typography>;

  const {
    titulo,
    descripcion,
    fecha_creacion,
    coordenadas = [],
    imagenes = [],
    etiquetas = [],
    categoria,
  } = publicacion;

  // --- LÓGICA MODIFICADA PARA DESCARGA ---
  const descargarPDF = async (idPublicacion) => {
    if (downloadingPdf) return; // Evitar doble clic
    setDownloadingPdf(true);

    try {
      const response = await axios.get(`${API_URL}/pdf/${idPublicacion}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `publicacion_${idPublicacion}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error al descargar el PDF:", err);
      alert("Ocurrió un error al generar el PDF");
    } finally {
      setDownloadingPdf(false); // Desbloquear siempre
    }
  };

  const compartirPublicacion = (idPublicacion) => {
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const url = `${baseUrl.replace(/\/$/, '')}/publicacion/${encodeURIComponent(idPublicacion)}`;
    const title = publicacion?.titulo || "Publicación";

    const text = publicacion?.descripcion
      ? `${publicacion.titulo} — ${publicacion.descripcion.substring(0, 120)}...`
      : `Mirá esta publicación: ${title}`;

    if (navigator.share) {
      navigator.share({ title, text, url })
        .catch((error) => {
          console.error("Error al compartir mediante Web Share:", error);
          fallbackCopyUrl(url);
        });
      return;
    }
    fallbackCopyUrl(url);
  };

  const fallbackCopyUrl = async (url) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const tmp = document.createElement('input');
        document.body.appendChild(tmp);
        tmp.value = url;
        tmp.select();
        document.execCommand('copy');
        tmp.remove();
      }
      alert('Enlace copiado al portapapeles. Podés compartirlo en tu red social preferida.');
    } catch (err) {
      console.error('No se pudo copiar el enlace:', err);
      alert('No se pudo copiar el enlace automáticamente. Podés copiarlo manualmente: ' + url);
    }
  };

  const enviarComentario = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Debés iniciar sesión para comentar");
      return;
    }

    setPublicandoComentario(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/comentarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          id_publicacion: Number(id),
          descripcion: nuevoComentario
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setNuevoComentario("");
        const comentariosRes = await fetch(`${API_URL}/comentarios/publicacion/${id}`);
        const comentariosData = await comentariosRes.json();
        setComentarios(comentariosData);
        
        const idUsuarioActual = data.id_usuario;
        if(idUsuarioActual && !usuariosComentarios[idUsuarioActual]){
             const userRes = await axios.get(`${API_URL}/usuario/${idUsuarioActual}`);
             setUsuariosComentarios(prev => ({...prev, [idUsuarioActual]: userRes.data}));
        }

      } else {
        throw new Error(data.error || "Error al enviar comentario");
      }
    } catch (error) {
      console.error("Error al comentar:", error);
      setErrorComentario("No se pudo enviar el comentario.");
    } finally {
        setPublicandoComentario(false);
    }
  };

  const borrarComentario = async (idComentario) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;
    if (!window.confirm("¿Estás seguro de querer borrar este comentario?")) return;

    try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_URL}/comentarios/${idComentario}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            setComentarios(prev => prev.filter(c => c.id !== idComentario));
        } else {
            const data = await res.json();
            alert(data.error || "No se pudo eliminar el comentario");
        }
    } catch (error) {
        console.error("Error eliminando comentario:", error);
        alert("Error de conexión al eliminar");
    }
  };

  const auth = getAuth();
  const currentUser = auth.currentUser;

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
            <Box ref={sliderRef} className="keen-slider" sx={{ overflow: "hidden", position: "relative" }}>
              {imagenes.map((src, i) => (
                <Box
                  key={i}
                  className="keen-slider__slide"
                  component="img"
                  src={src}
                  alt={`Slide ${i + 1}`}
                  onClick={() => handleOpen(i)}
                  sx={{
                    width: "100%",
                    height: 300,
                    objectFit: "contain",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 2,
                    userSelect: "none",
                    cursor: "pointer",
                  }}
                />
              ))}
              {loaded && instanceRef.current && (
                <>
                  <Arrow
                    left
                    onClick={(e) => { e.stopPropagation(); instanceRef.current?.prev(); }}
                    disabled={currentSlide === 0}
                  />
                  <Arrow
                    onClick={(e) => { e.stopPropagation(); instanceRef.current?.next(); }}
                    disabled={currentSlide === instanceRef.current.track.details.slides.length - 1}
                  />
                </>
              )}
            </Box>
          )}
          
          {/* Modal de imágenes */}
          <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{ backdrop: { timeout: 500 } }}
          >
            <Fade in={open}>
              <Box sx={styleModal}>
                <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
                  <Box sx={{ position: 'absolute', left: 8, zIndex: 30 }}>
                    <Arrow
                      left
                      onClick={(e) => { e.stopPropagation(); setModalSlide((s) => Math.max(0, s - 1)); }}
                      disabled={modalSlide === 0}
                    />
                  </Box>
                  <Box
                    component="img"
                    src={imagenes[modalSlide]}
                    alt={`Imagen ${modalSlide + 1}`}
                    sx={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 2, userSelect: 'none', boxShadow: 3 }}
                  />
                  <Box sx={{ position: 'absolute', right: 8, zIndex: 30 }}>
                    <Arrow
                      onClick={(e) => { e.stopPropagation(); setModalSlide((s) => Math.min(imagenes.length - 1, s + 1)); }}
                      disabled={modalSlide === imagenes.length - 1}
                    />
                  </Box>
                  <Box sx={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', zIndex: 30, color: 'text.primary' }}>
                    <Typography variant="body2">{modalSlide + 1} / {imagenes.length}</Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
          </Modal>

          {/* Usuario y Publicación */}
          {usuario && (
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Box
                component="img"
                src={usuario.foto_perfil_url || "/default-profile.png"}
                alt={usuario.nombre}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  objectFit: "cover",
                  mr: 2,
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/perfil/${usuario.id}`)}
              />
              <Typography
                variant="subtitle1"
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/perfil/${usuario.slug}`)}
              >
                Publicado por {usuario.nombre}
              </Typography>
            </Box>
          )}

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {new Date(fecha_creacion).toLocaleString()}
          </Typography>

          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            {titulo}
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Categoría: {categoria ? categoria.nombre : 'Sin categoría'}
          </Typography>
          
          {nombreLocalidad && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                <LocationOnIcon fontSize="large" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                    {nombreLocalidad}
                </Typography>
            </Box>
          )}

          {/* Etiquetas */}
          {etiquetas.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {etiquetas.map((tag, i) => (
                <Chip
                  key={i}
                  label={tag}
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1, cursor: "pointer" }}
                  onClick={() => navigate(`/buscar?etiqueta=${encodeURIComponent(tag)}`)}
                />
              ))}
            </Box>
          )}

          {/* Descripción */}
          <Typography paragraph>
            {verDescripcionCompleta || descripcion.length <= 200
              ? descripcion
              : `${descripcion.substring(0, 200)}...`}
          </Typography>
          {descripcion.length > 200 && (
            <Button
              variant="text"
              onClick={() => setVerDescripcionCompleta(!verDescripcionCompleta)}
            >
              {verDescripcionCompleta ? "Mostrar menos" : "Mostrar más"}
            </Button>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Mapa */}
          {coordenadas.length === 2 && (
            <Box sx={{ height: 300 }}>
              <MapContainer
                center={[coordenadas[0], coordenadas[1]]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", borderRadius: 8 }}
              >
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[coordenadas[0], coordenadas[1]]}>
                  <Popup>{nombreLocalidad || "Ubicación de la publicación"}</Popup>
                </Marker>
              </MapContainer>
            </Box>
          )}

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            {/* --- BOTÓN DESCARGAR PDF MODIFICADO --- */}
            <Button
              variant="contained"
              disabled={downloadingPdf} // Se inhabilita si está descargando
              startIcon={downloadingPdf ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              sx={{
                bgcolor: "#1976d2",
                color: "#fff",
                '&:hover': { bgcolor: "#1565c0" },
                textTransform: "none",
                px: 3,
                borderRadius: 2,
                fontWeight: "bold",
                // Estilo extra para cuando está disabled
                '&.Mui-disabled': {
                    bgcolor: '#90caf9',
                    color: '#fff'
                }
              }}
              onClick={() => descargarPDF(id)}
            >
              {downloadingPdf ? "Generando..." : "Descargar PDF"}
            </Button>

            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              sx={{
                color: "#1976d2",
                borderColor: "#1976d2",
                '&:hover': { borderColor: "#1565c0", bgcolor: "#e3f2fd" },
                textTransform: "none",
                px: 3,
                borderRadius: 2,
                fontWeight: "bold",
              }}
              onClick={() => compartirPublicacion(id)}
            >
              Compartir
            </Button>
          </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Reportar Publicación */}
          <div className="reportar-container">
            <button 
              className="reportar-btn" 
              onClick={() => setMostrarModal(true)}
            >
              🚩 Reportar Publicación
            </button>

            {mostrarModal && (
              <ReporteForm
                idPublicacion={id}
                idUsuario={publicacion.id_usuario} // Denunciado (Dueño del post)
                onClose={() => setMostrarModal(false)}
              />
            )}
          </div>

          <Divider sx={{ my: 4 }} />
          
          {/* Comentarios */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Agregar comentario
            </Typography>

            <TextField
              multiline
              minRows={1}
              fullWidth
              variant="outlined"
              placeholder="Escribí tu comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              sx={{ mb: 1 }}
            />

            {errorComentario && (
              <Typography color="error" sx={{ mb: 1 }}>
                {errorComentario}
              </Typography>
            )}

            <Button
              variant="contained"
              disabled={nuevoComentario.trim().length === 0}
              onClick={enviarComentario}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                bgcolor: "#1976d2",
                '&:hover': { bgcolor: "#1565c0" },
              }}
            >
              {publicandoComentario ? "Publicando..." : "Publicar comentario"}
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Comentarios</Typography>
            {comentarios.length === 0 ? (
              <Typography>No hay comentarios aún.</Typography>
            ) : (
              comentarios.map((comentario) => {
                const autorComentario = usuariosComentarios[comentario.id_usuario];
                const esMiComentario = currentUser && autorComentario && (currentUser.email === autorComentario.email);

                return (
                  <Box key={comentario.id} sx={{ display: "flex", alignItems: "flex-start", mb: 2, width: '100%' }}>
                    <Box
                      component="img"
                      src={autorComentario?.foto_perfil_url || "/default-profile.png"}
                      alt={autorComentario?.nombre || "Usuario"}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                        mr: 2,
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">
                            {autorComentario?.nombre || "Usuario desconocido"}
                          </Typography>
                          
                          <Box>
                            {!esMiComentario && currentUser && (
                                <Tooltip title="Reportar comentario">
                                    <IconButton
                                        size="small"
                                        onClick={() => setComentarioAReportar(comentario)}
                                        aria-label="reportar comentario"
                                        sx={{ color: 'text.secondary', '&:hover': { color: 'warning.main' } }}
                                    >
                                        <FlagIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}

                            {esMiComentario && (
                                <Tooltip title="Eliminar comentario">
                                    <IconButton 
                                        size="small" 
                                        onClick={() => borrarComentario(comentario.id)}
                                        aria-label="eliminar comentario"
                                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                          </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        {new Date(comentario.fecha_creacion).toLocaleString("es-AR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>{comentario.descripcion}</Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>

          {comentarioAReportar && (
              <ReporteForm
                idComentario={comentarioAReportar.id}
                idUsuario={comentarioAReportar.id_usuario}
                idPublicacion={id}
                onClose={() => setComentarioAReportar(null)}
              />
          )}

        </Box>
      </Container>
    </>
  );
}