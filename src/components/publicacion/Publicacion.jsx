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
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";


// Evitar error de ícono por defecto en Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Modal styles
const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80vw",
  maxHeight: "80vh",
  bgcolor: "background.paper",
  borderRadius: 2,
  outline: "none",
  p: 2,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

// Slider resizing
const AdaptiveHeight = (slider) => {
  function updateHeight() {
    slider.container.style.height =
      slider.slides[slider.track.details.rel].offsetHeight + "px";
  }
  slider.on("created", updateHeight);
  slider.on("slideChanged", updateHeight);
};

// Slider arrows
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
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalSlide, setModalSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [verDescripcionCompleta, setVerDescripcionCompleta] = useState(false);

  // Obtener publicación
  useEffect(() => {
    axios
      .get(`http://127.0.0.1:5000/publicaciones/${id}`)
      .then((res) => {
        setPublicacion(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener la publicación:", err);
        setLoading(false);
      });
  }, [id]);

  // Obtener usuario
  useEffect(() => {
    if (publicacion?.id_usuario) {
      axios
        .get(`http://127.0.0.1:5000/usuario/${publicacion.id_usuario}`)
        .then((res) => setUsuario(res.data))
        .catch((err) => console.error("Error al obtener el usuario:", err));
    }
  }, [publicacion]);

  // Slider principal
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

  // Slider modal
  const [sliderModalRef, instanceModalRef] = useKeenSlider(
    open
      ? {
          initial: currentSlide,
          slideChanged(s) {
            setModalSlide(s.track.details.rel);
          },
          created() {
            setModalSlide(currentSlide);
          },
        }
      : null,
    [AdaptiveHeight]
  );

  const handleOpen = (idx) => {
    setCurrentSlide(idx);
    setModalSlide(idx);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (open && instanceModalRef?.current) {
      instanceModalRef.current.moveToIdx(modalSlide);
    }
  }, [open, modalSlide, instanceModalRef]);

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

  const descargarPDF = async (idPublicacion) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/pdf/${idPublicacion}`, {
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
    }
  };

  const compartirPublicacion = (idPublicacion) => {
    const url = `https://tusitio.com/publicacion/${idPublicacion}`;
    const title = publicacion?.titulo || "Publicación";

    if (navigator.share) {
      navigator
        .share({
          title,
          text: `Mirá esta publicación: ${title}`,
          url,
        })
        .catch((error) => console.error("Error al compartir:", error));
    } else {
      // Fallback: Copiar al portapapeles
      navigator.clipboard.writeText(url).then(() => {
        alert("Enlace copiado al portapapeles");
      });
    }
  };



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
            <Box
              ref={sliderRef}
              className="keen-slider"
              sx={{ overflow: "hidden", position: "relative" }}
            >
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
                    objectFit: "cover",
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
                    onClick={(e) => {
                      e.stopPropagation();
                      instanceRef.current?.prev();
                    }}
                    disabled={currentSlide === 0}
                  />
                  <Arrow
                    onClick={(e) => {
                      e.stopPropagation();
                      instanceRef.current?.next();
                    }}
                    disabled={
                      currentSlide ===
                      instanceRef.current.track.details.slides.length - 1
                    }
                  />
                </>
              )}
            </Box>
          )}

          {/* Usuario */}
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
                }}
              />
              <Typography variant="subtitle1">Publicado por {usuario.nombre}</Typography>
            </Box>
          )}

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {new Date(fecha_creacion).toLocaleString()}
          </Typography>

          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            {titulo}
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Categoría: {categoria}
          </Typography>

          {/* Etiquetas */}
          {etiquetas.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {etiquetas.map((tag, i) => (
                <Chip key={i} label={tag} color="primary" variant="outlined" sx={{ mr: 1, mb: 1 }} />
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
                  <Popup>Ubicación de la publicación</Popup>
                </Marker>
              </MapContainer>
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
                {open && (
                  <Box
                    ref={sliderModalRef}
                    className="keen-slider"
                    sx={{ overflow: "hidden", position: "relative" }}
                  >
                    {imagenes.map((src, i) => (
                      <Box
                        key={i}
                        className="keen-slider__slide"
                        component="img"
                        src={src}
                        alt={`Slide ${i + 1}`}
                        sx={{
                          width: "100%",
                          height: "60vh",
                          objectFit: "contain",
                          borderRadius: 2,
                          userSelect: "none",
                        }}
                      />
                    ))}

                    {loaded && instanceModalRef.current && (
                      <>
                        <Arrow
                          left
                          onClick={(e) => {
                            e.stopPropagation();
                            instanceModalRef.current?.prev();
                          }}
                          disabled={modalSlide === 0}
                        />
                        <Arrow
                          onClick={(e) => {
                            e.stopPropagation();
                            instanceModalRef.current?.next();
                          }}
                          disabled={
                            modalSlide ===
                            instanceModalRef.current.track.details.slides.length - 1
                          }
                        />
                      </>
                    )}
                  </Box>
                )}
              </Box>
            </Fade>
          </Modal>
        </Box>


        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              bgcolor: "#1976d2",
              color: "#fff",
              '&:hover': { bgcolor: "#1565c0" },
              textTransform: "none",
              px: 3,
              borderRadius: 2,
              fontWeight: "bold",
            }}
            onClick={() => descargarPDF(id)}
          >
            Descargar PDF
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


      </Container>
    </>
  );
}
