import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import * as React from "react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

import {
  CssBaseline,
  Container,
  Button,
  TextareaAutosize,
  Select,
  MenuItem,
  Autocomplete,
  FormControl,
  FormLabel,
  Alert,
  Typography,
  CircularProgress,
  Stack,
  Chip,
  TextField,
  Box,
} from "@mui/material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";

import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { mostrarAlerta } from "../../utils/confirmservice.js";

// Importar servicios
import {
  fetchProvinces,
  fetchDepartments,
  fetchLocalities,
  fetchTags,
  uploadImages,
  createPublication,
} from "../../services/postService";

// Configuración de iconos para Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const markerIconLocal = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

// Componente para el mapa interactivo
function InteractiveMap({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return (
    <Marker position={[position.lat, position.lng]} icon={markerIconLocal} />
  );
}

export default function PostCreation() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    provinceId: "",
    departmentId: "",
    locationId: "",
    coordinates: { lat: -34.6, lng: -58.4 },
    images: [],
  });

  const [options, setOptions] = useState({
    provinces: [],
    departments: [],
    locations: [],
    allTags: [],
  });

  const [uiState, setUiState] = useState({
    isLoading: false,
    errors: [],
    selectedTags: [],
  });

  const navigate = useNavigate();

  // Validación de campos
  const validateFields = () => {
    const newErrors = [];
    if (!formData.category) newErrors.push("Categoría");
    if (!formData.title.trim()) newErrors.push("Título");
    if (!formData.description.trim()) newErrors.push("Descripción");
    if (formData.description.length > 500)
      newErrors.push("Descripción excede 500 caracteres");
    if (!formData.provinceId) newErrors.push("Provincia");
    if (!formData.departmentId) newErrors.push("Departamento");
    if (!formData.locationId) newErrors.push("Localidad");
    if (uiState.selectedTags.length === 0) newErrors.push("Etiquetas");
    if (formData.images.length === 0) newErrors.push("Imágenes");

    setUiState((prev) => ({ ...prev, errors: newErrors }));
    return newErrors;
  };

  // Efectos para cargar datos usando los servicios
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const provinces = await fetchProvinces();
        setOptions((prev) => ({ ...prev, provinces }));
      } catch (error) {
        console.error("Error al cargar provincias:", error);
      }
    };
    loadProvinces();
  }, []);

  useEffect(() => {
    const loadDepartments = async () => {
      if (formData.provinceId) {
        try {
          const departments = await fetchDepartments(formData.provinceId);
          setOptions((prev) => ({ ...prev, departments }));
        } catch (error) {
          console.error("Error al cargar departamentos:", error);
        }
      } else {
        setOptions((prev) => ({ ...prev, departments: [] }));
        setFormData((prev) => ({ ...prev, departmentId: "", locationId: "" }));
      }
    };
    loadDepartments();
  }, [formData.provinceId]);

  useEffect(() => {
    const loadLocalities = async () => {
      if (formData.departmentId) {
        try {
          const locations = await fetchLocalities(formData.departmentId);
          setOptions((prev) => ({ ...prev, locations }));
        } catch (error) {
          console.error("Error al cargar localidades:", error);
        }
      } else {
        setOptions((prev) => ({ ...prev, locations: [] }));
        setFormData((prev) => ({ ...prev, locationId: "" }));
      }
    };
    loadLocalities();
  }, [formData.departmentId]);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await fetchTags();
        const formattedTags = tags.map((tag) => ({
          label: tag.nombre,
          id: tag.id,
        }));
        const defaultTags = formattedTags.filter((tag) =>
          ["Perro", "Gato"].includes(tag.label),
        );

        setOptions((prev) => ({ ...prev, allTags: formattedTags }));
        setUiState((prev) => ({ ...prev, selectedTags: defaultTags }));
      } catch (error) {
        console.error("Error al cargar etiquetas:", error);
      }
    };
    loadTags();
  }, []);

  // Manejadores de eventos
  const handleLocationChange = (event) => {
    const locationId = event.target.value;
    const location = options.locations.find(
      (loc) => loc.id.toString() === locationId,
    );
    if (location) {
      setFormData((prev) => ({
        ...prev,
        locationId,
        coordinates: {
          lat: parseFloat(location.latitud),
          lng: parseFloat(location.longitud),
        },
      }));
    }
  };

  const handleImagesChange = (event) => {
    const files = Array.from(event.target.files);
    setFormData((prev) => ({ ...prev, images: files }));
  };

  const handlePublish = async () => {
    const errors = validateFields();
    if (errors.length > 0) return;

    setUiState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Subir imágenes
      const imageData = await uploadImages(formData.images);

      // Preparar datos de la publicación
      const publicationData = {
        categoria: formData.category,
        titulo: formData.title,
        descripcion: formData.description,
        id_locacion: formData.locationId,
        coordenadas: formData.coordinates,
        etiquetas: uiState.selectedTags.map((tag) => tag.id),
        imagenes: imageData.urls,
      };

      // Obtener usuario autenticado
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        mostrarAlerta({
          titulo: "⚠️ Sesión requerida",
          mensaje: "Debés iniciar sesión para publicar",
          tipo: "warning",
        });
        return;
      }

      const token = await user.getIdToken();

      // Enviar publicación
      const responseData = await createPublication(publicationData, token);

      mostrarAlerta({
        titulo: "✅ ¡Listo!",
        mensaje: "Publicación enviada con éxito",
        tipo: "success",
      });
      navigate(`/publicacion/${responseData.id_publicacion}`);
    } catch (error) {
      console.error("Error al publicar:", error);
      mostrarAlerta({
        titulo: "Error",
        mensaje: error.message || "Ocurrió un error al publicar",
        tipo: "error",
      });
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="sm">
        <Typography
          variant="h4"
          component="h1"
          sx={{ mt: 2, mb: 3, textAlign: "center" }}
        >
          Crear publicación
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Sección de Categoría */}
          <Box>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              sx={{ my: 2 }}
            >
              {["Adopción", "Búsqueda", "Encuentro", "Estado Crítico"].map(
                (option) => (
                  <Chip
                    key={option}
                    label={option}
                    clickable
                    color={formData.category === option ? "primary" : "default"}
                    variant={
                      formData.category === option ? "filled" : "outlined"
                    }
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, category: option }))
                    }
                  />
                ),
              )}
            </Stack>
          </Box>

          {/* Sección de Título y Descripción */}
          <Box>
            <Typography variant="h6" component="h2">
              Título
            </Typography>
            <TextField
              fullWidth
              placeholder="Título"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              error={uiState.errors.includes("Título")}
            />
          </Box>

          <Box>
            <Typography variant="h6" component="h2">
              Descripción
            </Typography>
            <TextareaAutosize
              minRows={3}
              placeholder="Descripción del caso…"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              style={{ width: "100%", padding: "8px", fontFamily: "inherit" }}
            />
            <Typography variant="body2" sx={{ textAlign: "right", mt: 1 }}>
              {formData.description.length}/500 caracteres
            </Typography>
          </Box>

          {/* Selectores de Ubicación */}
          <Box>
            <Typography variant="h6" component="h2">
              Ubicación
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Select
                fullWidth
                value={formData.provinceId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    provinceId: e.target.value,
                  }))
                }
                displayEmpty
              >
                <MenuItem value="">Seleccionar provincia</MenuItem>
                {options.provinces.map((province) => (
                  <MenuItem key={province.id} value={province.id.toString()}>
                    {province.nombre}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Select
                fullWidth
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    departmentId: e.target.value,
                  }))
                }
                disabled={!formData.provinceId}
                displayEmpty
              >
                <MenuItem value="">Seleccionar departamento</MenuItem>
                {options.departments.map((department) => (
                  <MenuItem
                    key={department.id}
                    value={department.id.toString()}
                  >
                    {department.nombre}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Select
                fullWidth
                value={formData.locationId}
                onChange={handleLocationChange}
                disabled={!formData.departmentId}
                displayEmpty
              >
                <MenuItem value="">Seleccionar localidad</MenuItem>
                {options.locations.map((location) => (
                  <MenuItem key={location.id} value={location.id.toString()}>
                    {location.nombre}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>

          {/* Mapa Interactivo */}
          <Box>
            <Typography variant="h6" component="h2">
              Ubicación en el mapa
            </Typography>
            <div style={{ height: "400px", marginBottom: "1rem" }}>
              <MapContainer
                center={[formData.coordinates.lat, formData.coordinates.lng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <InteractiveMap
                  position={formData.coordinates}
                  onPositionChange={(newPosition) =>
                    setFormData((prev) => ({
                      ...prev,
                      coordinates: newPosition,
                    }))
                  }
                />
              </MapContainer>
            </div>
            <Typography variant="body2">
              Latitud: {formData.coordinates.lat.toFixed(6)} | Longitud:{" "}
              {formData.coordinates.lng.toFixed(6)}
            </Typography>
          </Box>

          {/* Selector de Etiquetas */}
          <Box>
            <FormControl fullWidth>
              <FormLabel>Etiquetas</FormLabel>
              <Autocomplete
                multiple
                options={options.allTags}
                value={uiState.selectedTags}
                onChange={(event, value) =>
                  setUiState((prev) => ({ ...prev, selectedTags: value }))
                }
                getOptionLabel={(option) => option.label}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Seleccioná etiquetas" />
                )}
              />
            </FormControl>
          </Box>

          {/* Selector de Imágenes */}
          <Box>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
            >
              Subir imágenes ({formData.images.length})
              <VisuallyHiddenInput
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagesChange}
              />
            </Button>
            {formData.images.length > 0 && (
              <Typography
                variant="body2"
                sx={{ mt: 1, color: "text.secondary" }}
              >
                {formData.images.map((file) => file.name).join(", ")}
              </Typography>
            )}
          </Box>

          {/* Mensajes de Error */}
          {uiState.errors.length > 0 && (
            <Alert severity="error" sx={{ my: 2 }}>
              Faltan completar los siguientes campos:{" "}
              {uiState.errors.join(", ")}
            </Alert>
          )}

          {/* Botón de Publicar */}
          <Button
            variant="contained"
            size="large"
            disabled={uiState.isLoading}
            onClick={handlePublish}
            sx={{
              backgroundColor: "#F1B400",
              color: "#0D171C",
              "&:hover": { backgroundColor: "#d9a900" },
            }}
          >
            {uiState.isLoading ? <CircularProgress size={24} /> : "Publicar"}
          </Button>
        </Box>
      </Container>
    </React.Fragment>
  );
}
