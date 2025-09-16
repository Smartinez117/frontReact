import React from "react";
import { Box, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";

const AccionesPublicacion = ({ onDescargarPDF, onCompartir }) => {
  return (
    <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={onDescargarPDF}
        sx={{
          textTransform: "none",
          px: 3,
          borderRadius: 2,
          fontWeight: "bold",
        }}
      >
        Descargar PDF
      </Button>

      <Button
        variant="outlined"
        startIcon={<ShareIcon />}
        onClick={onCompartir}
        sx={{
          textTransform: "none",
          px: 3,
          borderRadius: 2,
          fontWeight: "bold",
        }}
      >
        Compartir
      </Button>
    </Box>
  );
};

export default AccionesPublicacion;