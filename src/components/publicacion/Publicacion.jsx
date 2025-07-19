import React, { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";

const portada =
  "https://www.infobae.com/resizer/v2/ZLTNTSTDZ5GU5OG2KLHAFBEWSQ.jpg?auth=a1016acf99183762b70de5d2b3776de88cfd4e162aca2fa51251f2e4570b28f2&smart=true&width=1200&height=630&quality=85";

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
  const imagenes = [
    portada,
    "https://placekitten.com/800/400",
    "https://placebear.com/800/400",
  ];

  const [open, setOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0); // para carrusel en la página
  const [loaded, setLoaded] = useState(false);

  // Slider en la página
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

  // Para el modal: trackea slide actual dentro del modal también
  const [modalSlide, setModalSlide] = useState(0);

  // Creamos el slider del modal sólo si el modal está abierto
  const [sliderModalRef, instanceModalRef] = useKeenSlider(
    open
      ? {
          initial: currentSlide, // arranca en la slide clickeada
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

  // Abrir modal y setear slide inicial para modal igual al clickeado
  const handleOpen = (idx) => {
    setCurrentSlide(idx); // actualiza slide en página
    setModalSlide(idx); // inicializa modal en esta slide
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Cuando el modal abre, sincronizamos el slider del modal para que esté en la slide correcta
  useEffect(() => {
    if (open && instanceModalRef?.current) {
      instanceModalRef.current.moveToIdx(modalSlide);
    }
  }, [open, modalSlide, instanceModalRef]);

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
          {/* Carrusel visible en la página */}
          <Box
            ref={sliderRef}
            className="keen-slider"
            sx={{ overflow: "hidden", position: "relative" }}
          >
            {imagenes.map((src, i) => (
              <Box
                key={i}
                className={`keen-slider__slide number-slide${i + 1}`}
                component="img"
                src={src}
                alt={`Slide ${i + 1}`}
                onClick={() => handleOpen(i)} // Abrir modal en la slide que tocaste
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

          {/* Texto de la publicación */}
        <Typography variant="solid" color="primary" noWrap>
            Fecha
        </Typography>
          <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
            National Parks
          </Typography>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Yosemite National Park
          </Typography>
          <Typography paragraph>
            Yosemite National Park is a national park spanning 747,956 acres (1,169.4
            sq mi; 3,025.2 km2) in the western Sierra Nevada of Central California.
          </Typography>

          {/* Modal con carrusel ampliado */}
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
                        className={`keen-slider__slide number-slide${i + 1}`}
                        component="img"
                        src={src}
                        alt={`Slide ${i + 1}`}
                        sx={{
                          width: "100%",
                          height: "60vh",
                          objectFit: "contain",
                          borderRadius: 2,
                          userSelect: "none",
                          cursor: "default",
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
