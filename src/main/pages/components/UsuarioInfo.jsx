import React from "react";
import { Box, Typography } from "@mui/material";

const UsuarioInfo = ({ usuario, fechaCreacion, onNavigateToProfile }) => {
  return (
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
        onClick={onNavigateToProfile}
      />
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ cursor: "pointer" }}
          onClick={onNavigateToProfile}
        >
          Publicado por {usuario.nombre}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {new Date(fechaCreacion).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default UsuarioInfo;