import * as React from 'react';
import Box from '@mui/joy/Box';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Tooltip from '@mui/joy/Tooltip';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';

// Iconos
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import { CssVarsProvider } from '@mui/joy/styles';
import JoyCssBaseline from '@mui/joy/CssBaseline';

const API_URL = import.meta.env.VITE_API_URL;

export default function UbicacionesAdmin() {
  // --- ESTADOS DE DATOS ---
  const [provincias, setProvincias] = React.useState([]);
  const [departamentos, setDepartamentos] = React.useState([]);
  const [localidades, setLocalidades] = React.useState([]);

  // --- ESTADOS DE FILTRO (Toolbar) ---
  const [selectedProvincia, setSelectedProvincia] = React.useState(null);
  const [selectedDepartamento, setSelectedDepartamento] = React.useState(null);

  // --- ESTADOS DEL MODAL (Crear/Editar) ---
  const [openModal, setOpenModal] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentLocalidadId, setCurrentLocalidadId] = React.useState(null);
  
  // Formulario
  const [formData, setFormData] = React.useState({
    nombre: '',
    latitud: '',
    longitud: '',
    id_provincia: '',     // Necesario para la lógica visual del select
    id_departamento: ''   // Necesario para la FK en la base de datos
  });
  
  // Departamentos específicos del modal (para cuando editamos y la localidad puede ser de otra provincia)
  const [modalDepartamentos, setModalDepartamentos] = React.useState([]);

  // ----------------------------------------------------------------
  // 1. CARGA INICIAL (Provincias)
  // ----------------------------------------------------------------
  React.useEffect(() => {
    fetchProvincias();
  }, []);

  const fetchProvincias = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ubicacion/provincias`);
      if (res.ok) setProvincias(await res.json());
    } catch (error) {
      console.error("Error cargando provincias:", error);
    }
  };

  // ----------------------------------------------------------------
  // 2. MANEJO DE FILTROS EN CASCADA (Toolbar Principal)
  // ----------------------------------------------------------------
  
  // Al cambiar Provincia -> Cargo departamentos
  const handleFilterProvinciaChange = async (event, newValue) => {
    setSelectedProvincia(newValue);
    setSelectedDepartamento(null); // Reset departamento
    setLocalidades([]); // Limpiar tabla
    setDepartamentos([]); // Limpiar select de deptos

    if (newValue) {
      try {
        const res = await fetch(`${API_URL}/api/ubicacion/departamentos?provincia_id=${newValue}`);
        if (res.ok) setDepartamentos(await res.json());
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Al cambiar Departamento -> Cargo Localidades
  const handleFilterDepartamentoChange = async (event, newValue) => {
    setSelectedDepartamento(newValue);
    if (newValue) {
      fetchLocalidades(newValue);
    } else {
      setLocalidades([]);
    }
  };

  const fetchLocalidades = async (deptId) => {
    try {
      const res = await fetch(`${API_URL}/api/ubicacion/localidades?departamento_id=${deptId}`);
      if (res.ok) setLocalidades(await res.json());
    } catch (error) {
      console.error("Error cargando localidades:", error);
    }
  };

  // ----------------------------------------------------------------
  // 3. LOGICA DEL MODAL (Crear / Editar)
  // ----------------------------------------------------------------

  // Abrir modal para CREAR
  const handleOpenCreate = () => {
    setIsEditing(false);
    
    // Pre-llenamos el formulario con lo que el usuario ya seleccionó en el filtro
    // para ahorrarle clics.
    const provId = selectedProvincia || '';
    const deptId = selectedDepartamento || '';

    setFormData({
      nombre: '',
      latitud: '',
      longitud: '',
      id_provincia: provId,
      id_departamento: deptId
    });

    // Si hay provincia seleccionada, usamos los departamentos que ya tenemos cargados
    if (provId) {
        setModalDepartamentos(departamentos);
    } else {
        setModalDepartamentos([]);
    }
    setOpenModal(true);
  };

  // Abrir modal para EDITAR
  const handleOpenEdit = async (localidad) => {
    setIsEditing(true);
    setCurrentLocalidadId(localidad.id);

    try {
        // 1. Obtenemos el detalle completo para saber el ID de Provincia y Departamento
        const res = await fetch(`${API_URL}/api/ubicacion/localidades/${localidad.id}`);
        const data = await res.json();

        if (res.ok) {
            // 2. Cargamos los departamentos de la provincia a la que pertenece esta localidad
            // (Puede ser distinta a la del filtro actual si los datos estuvieran mezclados)
            const resDept = await fetch(`${API_URL}/api/ubicacion/departamentos?provincia_id=${data.id_provincia}`);
            const depts = await resDept.json();
            setModalDepartamentos(depts);

            // 3. Llenamos el form
            setFormData({
                nombre: data.nombre,
                latitud: data.latitud || '',
                longitud: data.longitud || '',
                id_provincia: data.id_provincia,
                id_departamento: data.id_departamento
            });
            setOpenModal(true);
        }
    } catch (error) {
        console.error("Error obteniendo detalles:", error);
    }
  };

  // Cascada interna del Modal (Si cambia provincia en el modal, recargar deptos del modal)
  const handleModalProvinciaChange = async (e, newValue) => {
    setFormData(prev => ({ ...prev, id_provincia: newValue, id_departamento: '' }));
    if (newValue) {
        const res = await fetch(`${API_URL}/api/ubicacion/departamentos?provincia_id=${newValue}`);
        if (res.ok) setModalDepartamentos(await res.json());
    } else {
        setModalDepartamentos([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
        nombre: formData.nombre,
        latitud: formData.latitud,
        longitud: formData.longitud,
        id_departamento: formData.id_departamento // FK Obligatoria según tu modelo
    };

    try {
        let url = `${API_URL}/api/ubicacion/localidades`;
        let method = 'POST';

        if (isEditing) {
            url = `${url}/${currentLocalidadId}`;
            method = 'PATCH';
        }

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setOpenModal(false);
            // Si estamos visualizando el mismo departamento donde guardamos/editamos, refrescar tabla
            if (selectedDepartamento && Number(formData.id_departamento) === Number(selectedDepartamento)) {
                fetchLocalidades(selectedDepartamento);
            } else if (selectedDepartamento) {
                // Si movimos la localidad a otro departamento, avisar y refrescar (desaparecerá de la vista actual)
                alert("Guardado correctamente. La localidad se movió a otro partido/departamento.");
                fetchLocalidades(selectedDepartamento);
            }
        } else {
            const err = await res.json();
            alert(err.error || "Error al guardar");
        }
    } catch (error) {
        console.error(error);
    }
  };

  // ----------------------------------------------------------------
  // 4. BORRAR
  // ----------------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta localidad?")) return;
    try {
        const res = await fetch(`${API_URL}/api/ubicacion/localidades/${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            setLocalidades(prev => prev.filter(l => l.id !== id));
        } else {
            alert("Error al eliminar");
        }
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <CssVarsProvider>
      <JoyCssBaseline />
      
      {/* --- BARRA DE HERRAMIENTAS / FILTROS --- */}
      <Sheet
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: '1000px',
          mx: 'auto',
          borderRadius: 'sm',
          p: 2,
          mb: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          bgcolor: 'background.surface'
        }}
      >
        <FormControl size="sm" sx={{ minWidth: 200 }}>
            <FormLabel>1. Provincia</FormLabel>
            <Select 
                placeholder="Seleccionar..." 
                value={selectedProvincia} 
                onChange={handleFilterProvinciaChange}
            >
                {provincias.map(p => (
                    <Option key={p.id} value={p.id}>{p.nombre}</Option>
                ))}
            </Select>
        </FormControl>

        <FormControl size="sm" sx={{ minWidth: 200 }}>
            <FormLabel>2. Partido / Departamento</FormLabel>
            <Select 
                placeholder="Seleccionar..." 
                value={selectedDepartamento} 
                onChange={handleFilterDepartamentoChange}
                disabled={!selectedProvincia}
            >
                {departamentos.map(d => (
                    <Option key={d.id} value={d.id}>{d.nombre}</Option>
                ))}
            </Select>
        </FormControl>

        <Box sx={{ ml: 'auto' }}>
            <Button 
                startDecorator={<AddIcon />} 
                onClick={handleOpenCreate}
                disabled={!selectedDepartamento} // Obligamos a seleccionar contexto antes de crear
            >
                Nueva Localidad
            </Button>
        </Box>
      </Sheet>

      {/* --- TABLA DE DATOS --- */}
      <Sheet
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: '1000px',
          mx: 'auto',
          borderRadius: 'sm',
          boxShadow: 'sm',
          overflow: 'auto'
        }}
      >
        <Table hoverRow stickyHeader>
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th style={{ width: 'auto' }}>Localidad</th>
              <th style={{ width: '150px' }}>Latitud</th>
              <th style={{ width: '150px' }}>Longitud</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {localidades.length > 0 ? (
                localidades.map((row) => (
                <tr key={row.id}>
                    <td><Typography level="body-xs">{row.id}</Typography></td>
                    <td>
                        <Typography fontWeight="lg" startDecorator={<LocationOnIcon color="error" sx={{ fontSize: 18 }} />}>
                            {row.nombre}
                        </Typography>
                    </td>
                    <td>{row.latitud}</td>
                    <td>{row.longitud}</td>
                    <td style={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Editar">
                                <IconButton size="sm" variant="plain" color="neutral" onClick={() => handleOpenEdit(row)}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                                <IconButton size="sm" variant="plain" color="danger" onClick={() => handleDelete(row.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#777' }}>
                        {!selectedDepartamento 
                            ? "Por favor selecciona una Provincia y un Partido para gestionar las localidades."
                            : "No hay localidades cargadas en este partido."}
                    </td>
                </tr>
            )}
          </tbody>
        </Table>
      </Sheet>

      {/* --- MODAL FORMULARIO --- */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog sx={{ minWidth: 400 }}>
            <Typography level="h4" mb={2}>
                {isEditing ? 'Editar Localidad' : 'Nueva Localidad'}
            </Typography>
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    
                    {/* Select Provincia (Solo lectura visual o cambio de contexto) */}
                    <FormControl required>
                        <FormLabel>Provincia</FormLabel>
                        <Select 
                            value={formData.id_provincia} 
                            onChange={handleModalProvinciaChange}
                            placeholder="Seleccione provincia"
                        >
                            {provincias.map(p => (
                                <Option key={p.id} value={p.id}>{p.nombre}</Option>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Select Departamento (Define la FK id_departamento) */}
                    <FormControl required>
                        <FormLabel>Partido / Departamento</FormLabel>
                        <Select 
                            value={formData.id_departamento} 
                            onChange={(e, val) => setFormData({ ...formData, id_departamento: val })}
                            placeholder="Seleccione departamento"
                            disabled={!formData.id_provincia}
                        >
                            {modalDepartamentos.map(d => (
                                <Option key={d.id} value={d.id}>{d.nombre}</Option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl required>
                        <FormLabel>Nombre Localidad</FormLabel>
                        <Input 
                            value={formData.nombre} 
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
                        />
                    </FormControl>

                    {/* Inputs Lat/Long adaptados para Numeric(15,10) */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl sx={{ flex: 1 }}>
                            <FormLabel>Latitud</FormLabel>
                            <Input 
                                type="number" 
                                step="any" // Permite decimales de alta precisión
                                value={formData.latitud} 
                                onChange={(e) => setFormData({ ...formData, latitud: e.target.value })} 
                            />
                        </FormControl>
                        <FormControl sx={{ flex: 1 }}>
                            <FormLabel>Longitud</FormLabel>
                            <Input 
                                type="number" 
                                step="any" // Permite decimales de alta precisión
                                value={formData.longitud} 
                                onChange={(e) => setFormData({ ...formData, longitud: e.target.value })} 
                            />
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
                        <Button variant="plain" color="neutral" onClick={() => setOpenModal(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Guardar</Button>
                    </Box>
                </Box>
            </form>
        </ModalDialog>
      </Modal>

    </CssVarsProvider>
  );
}