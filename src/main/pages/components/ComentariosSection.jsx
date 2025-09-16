import React, { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import Comentario from "./Comentario";

const ComentariosSection = ({
  comentarios,
  usuariosComentarios,
  onEnviarComentario,
  publicandoComentario,
  errorComentario
}) => {
  const [nuevoComentario, setNuevoComentario] = useState("");

  const manejarEnviarComentario = () => {
    if (nuevoComentario.trim()) {
      onEnviarComentario(nuevoComentario);
      setNuevoComentario("");
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Comentarios
      </Typography>

      {/* Formulario para nuevo comentario */}
      <Box sx={{ mb: 2 }}>
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
          disabled={!nuevoComentario.trim() || publicandoComentario}
          onClick={manejarEnviarComentario}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          {publicandoComentario ? "Publicando..." : "Publicar comentario"}
        </Button>
      </Box>

      {/* Lista de comentarios */}
      {comentarios.length === 0 ? (
        <Typography>No hay comentarios aún.</Typography>
      ) : (
        comentarios.map((comentario) => (
          <Comentario
            key={comentario.id}
            comentario={comentario}
            usuario={usuariosComentarios[comentario.id_usuario]}
          />
        ))
      )}
    </Box>
  );
};

export default ComentariosSection;