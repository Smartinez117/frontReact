import React, { useEffect } from "react";
import { Modal, Box, Typography } from "@mui/material";
import Arrow from "./Arrow";

const ImageModal = ({ abierto, onCerrar, imagenes, slideInicial }) => {
  const [slideActual, setSlideActual] = React.useState(slideInicial);

  useEffect(() => {
    setSlideActual(slideInicial);
  }, [slideInicial]);

  // Navegación con teclado
  useEffect(() => {
    const manejarTeclado = (e) => {
      if (!abierto) return;
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowLeft") setSlideActual((s) => Math.max(0, s - 1));
      if (e.key === "ArrowRight")
        setSlideActual((s) => Math.min(imagenes.length - 1, s + 1));
    };

    window.addEventListener("keydown", manejarTeclado);
    return () => window.removeEventListener("keydown", manejarTeclado);
  }, [abierto, imagenes.length, onCerrar]);

  return (
    <Modal
      open={abierto}
      onClose={onCerrar}
      closeAfterTransition
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        outline: "none",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "90vw",
          height: "90vh",
          bgcolor: "background.paper",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          outline: "none",
        }}
      >
        <Box sx={{ position: "absolute", left: 8, zIndex: 30 }}>
          <Arrow
            left
            onClick={(e) => {
              e.stopPropagation();
              setSlideActual((s) => Math.max(0, s - 1));
            }}
            disabled={slideActual === 0}
          />
        </Box>

        <Box
          component="img"
          src={imagenes[slideActual]}
          alt={`Imagen ${slideActual + 1}`}
          sx={{
            maxWidth: "90%",
            maxHeight: "85%",
            objectFit: "contain",
            borderRadius: 2,
            userSelect: "none",
          }}
        />

        <Box sx={{ position: "absolute", right: 8, zIndex: 30 }}>
          <Arrow
            onClick={(e) => {
              e.stopPropagation();
              setSlideActual((s) => Math.min(imagenes.length - 1, s + 1));
            }}
            disabled={slideActual === imagenes.length - 1}
          />
        </Box>

        <Box
          sx={{
            position: "absolute",
            bottom: 12,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 30,
            color: "text.primary",
          }}
        >
          <Typography variant="body2">
            {slideActual + 1} / {imagenes.length}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImageModal;
