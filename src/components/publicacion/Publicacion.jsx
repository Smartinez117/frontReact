import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

// Material UI Components
import { 
  CssBaseline, Box, Container, Modal, Backdrop, Fade, 
  Typography, Button, Chip, Divider, CircularProgress, 
  TextField, IconButton, Tooltip, Paper, Avatar, Stack,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio 
} from "@mui/material";

// Iconos
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete"; 
import FlagIcon from "@mui/icons-material/Flag"; 
import LocationOnIcon from "@mui/icons-material/LocationOn"; 
import SendIcon from "@mui/icons-material/Send"; 
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import CloseIcon from '@mui/icons-material/Close';
import WhatsAppIcon from '@mui/icons-material/WhatsApp'; 
import MailIcon from '@mui/icons-material/Mail';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

// Mapa
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { getAuth } from "firebase/auth";
import { confirmarAccion } from '../../utils/confirmservice';
import ReporteForm from "../Reportes/Reportes.jsx";

// Config Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Estilos Modal Imagen
const styleModalImage = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95vw",
  height: "95vh",
  bgcolor: "black", 
  borderRadius: 2,
  outline: "none",
  p: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  overflow: "hidden"
};

// Estilos Modal Contacto
const styleContactModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400, 
  bgcolor: "background.paper",
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
  outline: "none",
};

const AdaptiveHeight = (slider) => {
  function updateHeight() {
    slider.container.style.height = slider.slides[slider.track.details.rel].offsetHeight + "px";
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
        width: 48, 
        height: 48,
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [left ? "left" : "right"]: 15,
        fill: disabled ? "#ccc" : "rgba(255,255,255,0.9)",
        zIndex: 10,
        filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))"
      }}
    >
      {left ? <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" /> : <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />}
    </svg>
  );
}

export default function Publicacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const currentUserId = localStorage.getItem("userId");

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
  
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false); 
  const [comentarioAReportar, setComentarioAReportar] = useState(null);

  // --- ESTADOS PARA CONTACTO ---
  const [openContactModal, setOpenContactModal] = useState(false);
  const [mensajeContacto, setMensajeContacto] = useState("Hola, vi tu publicación y me interesa ponerme en contacto.");
  const [tipoContacto, setTipoContacto] = useState('whatsapp'); 
  const [sendingSolicitud, setSendingSolicitud] = useState(false);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    axios.get(`${API_URL}/publicaciones/${id}`)
      .then((res) => {
        setPublicacion(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id, API_URL]);

  useEffect(() => {
    if (publicacion?.id_locacion) {
      axios.get(`${API_URL}/api/ubicacion/localidades/${publicacion.id_locacion}`)
        .then(res => { if(res.data?.nombre) setNombreLocalidad(res.data.nombre); })
        .catch(console.error);
    }
    if (publicacion?.id_usuario) {
      axios.get(`${API_URL}/usuario/${publicacion.id_usuario}`)
        .then((res) => setUsuario(res.data))
        .catch(console.error);
    }
  }, [publicacion, API_URL]);

  useEffect(() => {
    if (!id) return;
    axios.get(`${API_URL}/comentarios/publicacion/${id}`)
      .then(async (res) => {
        const data = res.data;
        setComentarios(data);
        const ids = [...new Set(data.map(c => c.id_usuario))];
        const userMap = {};
        await Promise.all(ids.map(async (uid) => {
            try {
                const uRes = await axios.get(`${API_URL}/usuario/${uid}`);
                userMap[uid] = uRes.data;
            } catch(e) {}
        }));
        setUsuariosComentarios(userMap);
      })
      .catch(console.error);
  }, [id, API_URL]);

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(s) { setCurrentSlide(s.track.details.rel); },
    created() { setLoaded(true); },
  }, [AdaptiveHeight]);

  const handleOpen = (idx) => { setModalSlide(idx); setOpen(true); };
  const handleClose = () => setOpen(false);

  // --- ACCIONES ---
  const descargarPDF = async (pubId) => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      const response = await axios.get(`${API_URL}/pdf/${pubId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `publicacion_${pubId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Error al generar PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const compartirPublicacion = (pubId) => {
    const url = `${window.location.origin}/publicacion/${pubId}`;
    if (navigator.share) {
        navigator.share({ title: publicacion.titulo, text: "Mira esta publicación en REDEMA", url }).catch(() => {});
    } else {
        navigator.clipboard.writeText(url);
        alert("Enlace copiado al portapapeles");
    }
  };

  const handleEnviarSolicitud = async () => {
    if (!currentUser) return alert("Debes iniciar sesión para contactar");
    setSendingSolicitud(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_URL}/api/contactar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_publicacion: id,
          mensaje: mensajeContacto,
          tipo: tipoContacto 
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Solicitud enviada con éxito. Te avisaremos cuando el dueño acepte.");
        setOpenContactModal(false);
      } else {
        alert(data.error || "Error al enviar solicitud");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al enviar solicitud");
    } finally {
      setSendingSolicitud(false);
    }
  };

  const enviarComentario = async () => {
    if (!currentUser) return alert("Inicia sesión para comentar");
    setPublicandoComentario(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_URL}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ id_publicacion: Number(id), descripcion: nuevoComentario }),
      });
      const data = await res.json();
      if (res.ok) {
        setNuevoComentario("");
        const cRes = await fetch(`${API_URL}/comentarios/publicacion/${id}`);
        const cData = await cRes.json();
        setComentarios(cData);
        if (data.id_usuario && !usuariosComentarios[data.id_usuario]) {
             const uRes = await axios.get(`${API_URL}/usuario/${data.id_usuario}`);
             setUsuariosComentarios(prev => ({...prev, [data.id_usuario]: uRes.data}));
        }
      }
    } catch (e) { setErrorComentario("Error al enviar"); }
    finally { setPublicandoComentario(false); }
  };

  const borrarComentario = (cid) => {
    confirmarAccion({
      tipo: 'publicacion',
      onConfirm: async () => {
        if (!currentUser) return;
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch(`${API_URL}/comentarios/${cid}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) setComentarios(prev => prev.filter(c => c.id !== cid));
        } catch (e) { alert("Error al eliminar"); }
      }
    });
  };

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:10 }}><CircularProgress /></Box>;
  if (!publicacion) return <Typography sx={{ p: 4 }}>Publicación no encontrada</Typography>;

  const { titulo, descripcion, fecha_creacion, coordenadas = [], imagenes = [], etiquetas = [], categoria } = publicacion;
  
  const esMiPublicacion = currentUser && (String(publicacion?.id_usuario) === String(currentUserId));

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", py: 5 }}> 
      <CssBaseline />
      <Container maxWidth="md">
        
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: "hidden", bgcolor: "white", border: '1px solid #e0e0e0' }}>
          
          {/* --- CARRUSEL --- */}
          {imagenes.length > 0 ? (
            <Box ref={sliderRef} className="keen-slider" sx={{ height: { xs: 350, md: 500 }, bgcolor: "#000", position: "relative" }}>
              {imagenes.map((src, i) => (
                <Box key={i} className="keen-slider__slide" component="img" src={src} onClick={() => handleOpen(i)}
                  sx={{ width: "100%", height: "100%", objectFit: "contain", cursor: "pointer" }}
                />
              ))}
              {loaded && instanceRef.current && (
                <>
                  <Arrow left onClick={(e) => { e.stopPropagation(); instanceRef.current?.prev(); }} disabled={currentSlide === 0} />
                  <Arrow onClick={(e) => { e.stopPropagation(); instanceRef.current?.next(); }} disabled={currentSlide === instanceRef.current.track.details.slides.length - 1} />
                </>
              )}
            </Box>
          ) : (
             <Box sx={{ height: 200, bgcolor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                Sin imágenes
             </Box>
          )}

          {/* --- CONTENIDO --- */}
          <Box sx={{ p: { xs: 3, md: 5 } }}> 
            
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Chip 
                    label={categoria ? categoria.nombre : 'Sin categoría'} 
                    color="primary" 
                    variant="soft" 
                    sx={{ fontWeight: 'bold', fontSize: '0.95rem' }} 
                />
                
                <Button
                    startIcon={<ReportProblemOutlinedIcon />}
                    size="small"
                    color="error"
                    onClick={() => setMostrarModal(true)}
                    sx={{ textTransform: 'none', color: '#d32f2f', opacity: 0.7, '&:hover': { opacity: 1, bgcolor: '#ffebee' } }}
                >
                    Reportar publicación
                </Button>
            </Stack>

            <Typography variant="h3" component="h1" fontWeight="800" gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, lineHeight: 1.2 }}>
              {titulo}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3, mt: 1 }}>
               {usuario && (
                 <Stack direction="row" alignItems="center" spacing={1.5} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/perfil/${usuario.slug}`)}>
                    <Avatar src={usuario.foto_perfil_url} alt={usuario.nombre} sx={{ width: 56, height: 56, border: '2px solid #eee' }} />
                    <Box>
                        <Typography variant="h6" fontWeight="bold" lineHeight={1.1}>{usuario.nombre}</Typography>
                        <Typography variant="body2" color="text.secondary">Publicado el {new Date(fecha_creacion).toLocaleDateString()}</Typography>
                    </Box>
                 </Stack>
               )}
            </Stack>

            {nombreLocalidad && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3, color: 'text.secondary' }}>
                    <LocationOnIcon color="action" />
                    <Typography variant="h6" fontWeight="500">{nombreLocalidad}</Typography>
                </Stack>
            )}

            {etiquetas.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
                    {etiquetas.map((tag, i) => (
                        <Chip key={i} label={tag} onClick={() => navigate(`/buscar?etiqueta=${encodeURIComponent(tag)}`)} sx={{ cursor:'pointer', fontSize: '0.9rem' }} />
                    ))}
                </Stack>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2, lineHeight: 1.8, fontSize: '1.15rem', color: '#333' }}>
                {verDescripcionCompleta || descripcion.length <= 300 ? descripcion : `${descripcion.substring(0, 300)}...`}
            </Typography>
            {descripcion.length > 300 && (
                <Button onClick={() => setVerDescripcionCompleta(!verDescripcionCompleta)} size="large">
                    {verDescripcionCompleta ? "Leer menos" : "Leer más"}
                </Button>
            )}

            {coordenadas.length === 2 && (
                <Box sx={{ mt: 5, height: 350, borderRadius: 3, overflow: 'hidden', border: '1px solid #eee' }}>
                    <MapContainer center={coordenadas} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={coordenadas}><Popup>{nombreLocalidad}</Popup></Marker>
                    </MapContainer>
                </Box>
            )}

            {/* Botones Acción */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 5 }}>
                
                {/* Botón Contactar (Estilo Marca) */}
                {!esMiPublicacion && (
                  <Button 
                    variant="contained" 
                    size="large"
                    fullWidth
                    startIcon={<ChatBubbleOutlineIcon />} // Icono de burbuja de chat neutro
                    onClick={() => setOpenContactModal(true)}
                    sx={{ 
                        borderRadius: 3,
                        textTransform: 'none',
                        py: 1.5, 
                        fontSize: '1rem', 
                        // Estilos de tu marca (Mismo que botón Publicar)
                        backgroundColor: '#F1B400', 
                        color: '#0D171C',
                        boxShadow: '0 4px 14px rgba(241, 180, 0, 0.4)', // Sombra suave amarilla
                        '&:hover': { 
                            backgroundColor: '#d9a900',
                            boxShadow: '0 6px 20px rgba(241, 180, 0, 0.6)'
                        }
                    }}
                  >
                    Contactar
                  </Button>
                )}

                <Button 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    startIcon={downloadingPdf ? <CircularProgress size={24} color="inherit" /> : <DownloadIcon />}
                    disabled={downloadingPdf}
                    onClick={() => descargarPDF(id)}
                    sx={{ borderRadius: 3, py: 1.5, fontSize: '1rem', bgcolor: '#d8301aff', '&:hover':{ bgcolor:'#931010ff'} }}
                >
                    {downloadingPdf ? "Generando..." : "PDF"}
                </Button>

                <Button 
                  variant="outlined" 
                  fullWidth 
                  size="large" 
                  startIcon={<ShareIcon />} 
                  onClick={() => compartirPublicacion(id)} 
                  sx={{ 
                    borderRadius: 3,
                    textTransform: 'none',
                    py: 1.5, 
                    fontSize: '1rem',
                    // --- ESTILOS PARA EVITAR EL AMARILLO ---
                    color: 'text.primary',       // Texto negro/gris oscuro
                    borderColor: '#bdbdbd',      // Borde gris suave inicial
                    '&:hover': { 
                      borderColor: 'text.primary',       // Borde oscuro al pasar el mouse
                      backgroundColor: 'rgba(0,0,0,0.05)' // Fondo gris muy clarito (no amarillo)
                    }
                  }}
                >
                  Compartir
                </Button>
            </Stack>

          </Box>
        </Paper>

        {/* SECCIÓN COMENTARIOS RESTAURADA */}
        <Box sx={{ mt: 5 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>Comentarios</Typography>
            
            <Paper sx={{ p: 3, mb: 4, display: 'flex', gap: 2, borderRadius: 3 }} elevation={0} variant="outlined">
                <Avatar src={currentUser?.photoURL} sx={{ width: 48, height: 48 }} />
                <Box sx={{ flexGrow: 1 }}>
                    <TextField 
                        fullWidth 
                        placeholder="Escribe un comentario..." 
                        multiline 
                        variant="standard" 
                        InputProps={{ disableUnderline: true, style: { fontSize: '1.1rem' } }}
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                          variant="contained"
                          disabled={!nuevoComentario.trim() || publicandoComentario} 
                          onClick={enviarComentario} 
                          endIcon={publicandoComentario ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                          sx={{ borderRadius: 20, px: 3 }}
                        >
                          {publicandoComentario ? 'Publicando...' : 'Publicar'}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Stack spacing={3}>
                {comentarios.map((c) => {
                    const author = usuariosComentarios[c.id_usuario];
                    const isMine = currentUser?.email === author?.email;
                    return (
                        <Paper key={c.id} sx={{ p: 3, borderRadius: 3, bgcolor: 'white' }} elevation={0} variant="outlined">
                            <Stack direction="row" spacing={2}>
                                <Avatar src={author?.foto_perfil_url} sx={{ width: 48, height: 48 }} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="subtitle1" fontWeight="bold">{author?.nombre}</Typography>
                                        <Stack direction="row">
                                            {!isMine && currentUser && (
                                                <Tooltip title="Reportar"><IconButton size="small" onClick={() => setComentarioAReportar(c)}><FlagIcon fontSize="small" sx={{ color: '#bdbdbd' }} /></IconButton></Tooltip>
                                            )}
                                            {isMine && (
                                                <Tooltip title="Borrar"><IconButton size="small" color="error" onClick={() => borrarComentario(c.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                            )}
                                        </Stack>
                                    </Stack>
                                    <Typography variant="body1" sx={{ mt: 1, fontSize: '1.05rem', lineHeight: 1.6 }}>{c.descripcion}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{new Date(c.fecha_creacion).toLocaleDateString()}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    );
                })}
            </Stack>
        </Box>

        {/* MODALES */}
        
        {/* Modal Imagen */}
        <Modal open={open} onClose={handleClose} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500 } }}>
            <Fade in={open}>
                <Box sx={styleModalImage}>
                    <Box component="img" src={imagenes[modalSlide]} sx={{ width:'100%', height:'100%', objectFit:'contain' }} />
                    <IconButton onClick={handleClose} sx={{ position:'absolute', top: 15, right: 15, color:'white', bgcolor:'rgba(0,0,0,0.6)', '&:hover': { bgcolor:'rgba(0,0,0,0.8)' } }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Fade>
        </Modal>

        {/* Modal Contacto con Selector */}
        <Modal open={openContactModal} onClose={() => setOpenContactModal(false)}>
          <Box sx={styleContactModal}> 
            <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
              Enviar solicitud de contacto
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              El dueño recibirá tu mensaje y, si acepta, verás sus datos para contactarlo.
            </Typography>
            
            {/* SELECTOR DE TIPO */}
            <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
              <FormLabel component="legend" sx={{ fontSize: '0.9rem' }}>¿Cómo preferís contactar?</FormLabel>
              <RadioGroup
                row
                name="tipoContacto"
                value={tipoContacto}
                onChange={(e) => setTipoContacto(e.target.value)}
              >
                <FormControlLabel 
                    value="whatsapp" 
                    control={<Radio size="small" color="success" />} 
                    label={<Stack direction="row" alignItems="center" gap={0.5}><WhatsAppIcon fontSize="small" color="success" /><Typography fontSize="0.9rem">WhatsApp</Typography></Stack>} 
                />
                <FormControlLabel 
                    value="email" 
                    control={<Radio size="small" color="primary" />} 
                    label={<Stack direction="row" alignItems="center" gap={0.5}><MailIcon fontSize="small" color="primary" /><Typography fontSize="0.9rem">Email</Typography></Stack>} 
                />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Mensaje"
              placeholder="Ej: Hola, encontré a tu perrito..."
              value={mensajeContacto}
              onChange={(e) => setMensajeContacto(e.target.value)}
              variant="outlined"
            />
            
            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                <Button onClick={() => setOpenContactModal(false)} color="inherit" disabled={sendingSolicitud}>Cancelar</Button>
                <Button onClick={handleEnviarSolicitud} variant="contained" color="primary" disabled={sendingSolicitud} startIcon={sendingSolicitud ? <CircularProgress size={18} color="inherit" /> : null}>
                  {sendingSolicitud ? 'Enviando...' : 'Enviar Solicitud'}
                </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Modales Reporte */}
        {mostrarModal && <ReporteForm idPublicacion={id} idUsuario={publicacion.id_usuario} onClose={() => setMostrarModal(false)} />}
        {comentarioAReportar && <ReporteForm idComentario={comentarioAReportar.id} idUsuario={comentarioAReportar.id_usuario} idPublicacion={id} onClose={() => setComentarioAReportar(null)} />}

      </Container>
    </Box>
  );
}