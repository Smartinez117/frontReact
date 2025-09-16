import React from "react";
import { Box, Typography } from "@mui/material";

const Comentario = ({ comentario, usuario }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
      <Box
        component="img"
        src={usuario?.foto_perfil_url || "/default-profile.png"}
        alt={usuario?.nombre || "Usuario"}
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          objectFit: "cover",
          mr: 2,
        }}
      />
      <Box>
        <Typography variant="subtitle2">
          {usuario?.nombre || "Usuario desconocido"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(comentario.fecha_creacion).toLocaleString("es-AR", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </Typography>
        <Typography variant="body1">{comentario.descripcion}</Typography>
      </Box>
    </Box>
  );
};

export default Comentario;
