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

// Estilo del modal
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

// Carrusel adaptativo en altura
const AdaptiveHeight = (slider) => {
  function updateHeight() {
    slider.container.style.height =
      slider.slides[slider.track.details.rel].offsetHeight + "px";
  }
  slider.on("created", updateHeight);
  slider.on("slideChanged", updateHeight);
};

// Flechas
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
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalSlide, setModalSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Traer datos desde el backend
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

  // Slider de portada
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

  // Slider del modal
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

  const { titulo, descripcion, fecha_creacion, imagenes = [] } = publicacion;

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md">
        <Box
          sx={{
            bgcolor: "#cfe8fc",
            minHeight: "100vh",
            p: 3,
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          {/* Carrusel en la página */}
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

          {/* Información textual */}
          <Typography color="primary" sx={{ mt: 3 }}>
            {new Date(fecha_creacion).toLocaleString()}
          </Typography>
          <Typography variant="h4" gutterBottom sx={{ mt: 1 }}>
            {titulo}
          </Typography>
          <Typography paragraph>{descripcion}</Typography>

          {/* Modal con carrusel */}
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
      </Container>
    </>
  );
}
