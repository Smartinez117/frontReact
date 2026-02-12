import React, { useState } from "react";
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio,
  IconButton,
  Alert,
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getAuth } from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL;

export default function ReporteForm({ idPublicacion, idComentario, idUsuario, onClose }) {
  const [tipo, setTipo] = useState("Spam"); 
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);
    setError(null);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError("Debes iniciar sesión para denunciar contenido.");
      setLoading(false);
      return;
    }

    try {
      const token = await user.getIdToken();

      const response = await fetch(`${API_URL}/reportes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_publicacion: idPublicacion || null,
          id_comentario: idComentario || null,
          id_usuario_reportado: idUsuario || null, 
          descripcion,
          tipo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar la denuncia");
      }

      setMensaje("Denuncia enviada con éxito. Gracias por tu colaboración.");
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        bgcolor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          maxWidth: 500,
          width: "90%",
          position: "relative",
          boxShadow: 24
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" gutterBottom>
          {idUsuario 
            ? "Denunciar Usuario" 
            : idComentario 
              ? "Denunciar Comentario" 
              : "Denunciar Publicación"}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Selecciona el motivo de la denuncia. Tu identidad se mantendrá anónima para el usuario denunciado.
        </Typography>

        <form onSubmit={handleSubmit}>
          <FormControl component="fieldset" sx={{ mt: 2, width: "100%" }}>
            <FormLabel component="legend">Motivo</FormLabel>
            <RadioGroup
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <FormControlLabel value="Spam" control={<Radio />} label="Es spam o publicidad" />
              <FormControlLabel value="Inapropiado" control={<Radio />} label="Contenido inapropiado / Sexual" />
              <FormControlLabel value="Acoso" control={<Radio />} label="Acoso, odio o bullying" />
              <FormControlLabel value="Fraude" control={<Radio />} label="Información falsa o estafa" />
              <FormControlLabel value="Otro" control={<Radio />} label="Otro" />
            </RadioGroup>
          </FormControl>

          {/* --- AQUÍ ESTÁN LOS CAMBIOS EN EL TEXTFIELD --- */}
          <TextField
            label="Descripción adicional (Opcional)"
            placeholder="Danos más detalles para ayudarnos a entender..."
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            // 1. Limite nativo del input
            inputProps={{ maxLength: 500 }} 
            // 2. Contador visual
            helperText={`${descripcion.length}/500`}
            // 3. Estilos para alinear el contador a la derecha
            sx={{ 
              mt: 2, 
              mb: 2,
              '& .MuiFormHelperText-root': {
                textAlign: 'right',
                color: descripcion.length === 500 ? 'error.main' : 'text.secondary'
              }
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {mensaje && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {mensaje}
            </Alert>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={onClose} color="inherit" disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="error" 
              disabled={loading || mensaje} 
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? "Enviando..." : "Denunciar"}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}