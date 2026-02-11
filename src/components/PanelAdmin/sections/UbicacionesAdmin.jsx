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

// --- IMPORTACIÓN DEL SERVICIO ---
import { confirmarAccion, mostrarAlerta } from "../../../utils/confirmservice";

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
    id_provincia: '',    
    id_departamento: ''  
  });
  
  const [modalDepartamentos, setModalDepartamentos] = React.useState([]);

  // 1. CARGA INICIAL
  React.useEffect(() => { fetchProvincias(); }, []);

  const fetchProvincias = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ubicacion/provincias`);
      if (res.ok) setProvincias(await res.json());
    } catch (error) {
      console.error("Error cargando provincias:", error);
    }
  };

  // 2. MANEJO DE FILTROS EN CASCADA
  const handleFilterProvinciaChange = async (event, newValue) => {
    setSelectedProvincia(newValue);
    setSelectedDepartamento(null);
    setLocalidades([]);
    setDepartamentos([]);

    if (newValue) {
      try {
        const res = await fetch(`${API_URL}/api/ubicacion/departamentos?provincia_id=${newValue}`);
        if (res.ok) setDepartamentos(await res.json());
      } catch (error) { console.error(error); }
    }
  };

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
    } catch (error) { console.error("Error cargando localidades:", error); }
  };

  // 3. LOGICA DEL MODAL
  const handleOpenCreate = () => {
    setIsEditing(false);
    const provId = selectedProvincia || '';
    const deptId = selectedDepartamento || '';

    setFormData({
      nombre: '',
      latitud: '',
      longitud: '',
      id_provincia: provId,
      id_departamento: deptId
    });

    if (provId) {
        setModalDepartamentos(departamentos);
    } else {
        setModalDepartamentos([]);
    }
    setOpenModal(true);
  };

  const handleOpenEdit = async (localidad) => {
    setIsEditing(true);
    setCurrentLocalidadId(localidad.id);
    try {
        const res = await fetch(`${API_URL}/api/ubicacion/localidades/${localidad.id}`);
        const data = await res.json();

        if (res.ok) {
            const resDept = await fetch(`${API_URL}/api/ubicacion/departamentos?provincia_id=${data.id_provincia}`);
            const depts = await resDept.json();
            setModalDepartamentos(depts);

            setFormData({
                nombre: data.nombre,
                latitud: data.latitud || '',
                longitud: data.longitud || '',
                id_provincia: data.id_provincia,
                id_departamento: data.id_departamento
            });
            setOpenModal(true);
        }
    } catch (error) { console.error("Error obteniendo detalles:", error); }
  };

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
        id_departamento: formData.id_departamento
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
            
            // Lógica de feedback visual
            const deptoSeleccionadoNum = Number(selectedDepartamento);
            const deptoGuardadoNum = Number(formData.id_departamento);

            if (selectedDepartamento && deptoGuardadoNum === deptoSeleccionadoNum) {
                // Caso normal: Actualizamos la tabla
                fetchLocalidades(selectedDepartamento);
                mostrarAlerta({ titulo: 'Éxito', mensaje: 'Localidad guardada correctamente', tipo: 'success' });
            } else if (selectedDepartamento) {
                // Caso especial: Se movió a otro departamento
                fetchLocalidades(selectedDepartamento); // Se va de la lista actual
                mostrarAlerta({ 
                    titulo: 'Atención', 
                    mensaje: 'Guardado correctamente. La localidad se movió a otro partido/departamento y ya no es visible en esta lista.', 
                    tipo: 'warning',
                    duracion: 4000
                });
            } else {
                // Caso: Creación sin filtro activo (raro por el disabled, pero posible)
                 mostrarAlerta({ titulo: 'Éxito', mensaje: 'Localidad guardada correctamente', tipo: 'success' });
            }

        } else {
            const err = await res.json();
            mostrarAlerta({ titulo: 'Error', mensaje: err.error || "Error al guardar", tipo: 'error' });
        }
    } catch (error) {
        console.error(error);
        mostrarAlerta({ titulo: 'Error', mensaje: 'Error de conexión', tipo: 'error' });
    }
  };

  // 4. BORRAR CON SWEETALERT
  const handleDelete = (id) => {
    confirmarAccion({
        tipo: 'localidad',
        onConfirm: async () => {
             const res = await fetch(`${API_URL}/api/ubicacion/localidades/${id}`, { method: 'DELETE' });
             if (!res.ok) {
                 throw new Error("No se pudo eliminar la localidad.");
             }
             setLocalidades(prev => prev.filter(l => l.id !== id));
        }
    });
  };

  return (
    <CssVarsProvider>
      <JoyCssBaseline />
      
      {/* --- BARRA DE HERRAMIENTAS / FILTROS --- */}
      <Sheet variant="outlined" sx={{ width: '100%', maxWidth: '1000px', mx: 'auto', borderRadius: 'sm', p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap', bgcolor: 'background.surface' }}>
        <FormControl size="sm" sx={{ minWidth: 200 }}>
            <FormLabel>1. Provincia</FormLabel>
            <Select placeholder="Seleccionar..." value={selectedProvincia} onChange={handleFilterProvinciaChange}>
                {provincias.map(p => ( <Option key={p.id} value={p.id}>{p.nombre}</Option> ))}
            </Select>
        </FormControl>

        <FormControl size="sm" sx={{ minWidth: 200 }}>
            <FormLabel>2. Partido / Departamento</FormLabel>
            <Select placeholder="Seleccionar..." value={selectedDepartamento} onChange={handleFilterDepartamentoChange} disabled={!selectedProvincia}>
                {departamentos.map(d => ( <Option key={d.id} value={d.id}>{d.nombre}</Option> ))}
            </Select>
        </FormControl>

        <Box sx={{ ml: 'auto' }}>
            <Button startDecorator={<AddIcon />} onClick={handleOpenCreate} disabled={!selectedDepartamento}>
                Nueva Localidad
            </Button>
        </Box>
      </Sheet>

      {/* --- TABLA DE DATOS --- */}
      <Sheet variant="outlined" sx={{ width: '100%', maxWidth: '1000px', mx: 'auto', borderRadius: 'sm', boxShadow: 'sm', overflow: 'auto' }}>
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
                    <td><Typography fontWeight="lg" startDecorator={<LocationOnIcon color="error" sx={{ fontSize: 18 }} />}>{row.nombre}</Typography></td>
                    <td>{row.latitud}</td>
                    <td>{row.longitud}</td>
                    <td style={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Editar">
                                <IconButton size="sm" variant="plain" color="neutral" onClick={() => handleOpenEdit(row)}><EditIcon /></IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                                <IconButton size="sm" variant="plain" color="danger" onClick={() => handleDelete(row.id)}><DeleteIcon /></IconButton>
                            </Tooltip>
                        </Box>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#777' }}>
                        {!selectedDepartamento ? "Por favor selecciona una Provincia y un Partido para gestionar las localidades." : "No hay localidades cargadas en este partido."}
                    </td>
                </tr>
            )}
          </tbody>
        </Table>
      </Sheet>

      {/* --- MODAL FORMULARIO --- */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog sx={{ minWidth: 400 }}>
            <Typography level="h4" mb={2}>{isEditing ? 'Editar Localidad' : 'Nueva Localidad'}</Typography>
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl required>
                        <FormLabel>Provincia</FormLabel>
                        <Select value={formData.id_provincia} onChange={handleModalProvinciaChange} placeholder="Seleccione provincia">
                            {provincias.map(p => ( <Option key={p.id} value={p.id}>{p.nombre}</Option> ))}
                        </Select>
                    </FormControl>

                    <FormControl required>
                        <FormLabel>Partido / Departamento</FormLabel>
                        <Select value={formData.id_departamento} onChange={(e, val) => setFormData({ ...formData, id_departamento: val })} placeholder="Seleccione departamento" disabled={!formData.id_provincia}>
                            {modalDepartamentos.map(d => ( <Option key={d.id} value={d.id}>{d.nombre}</Option> ))}
                        </Select>
                    </FormControl>

                    <FormControl required>
                        <FormLabel>Nombre Localidad</FormLabel>
                        <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl sx={{ flex: 1 }}>
                            <FormLabel>Latitud</FormLabel>
                            <Input type="number" step="any" value={formData.latitud} onChange={(e) => setFormData({ ...formData, latitud: e.target.value })} />
                        </FormControl>
                        <FormControl sx={{ flex: 1 }}>
                            <FormLabel>Longitud</FormLabel>
                            <Input type="number" step="any" value={formData.longitud} onChange={(e) => setFormData({ ...formData, longitud: e.target.value })} />
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
                        <Button variant="plain" color="neutral" onClick={() => setOpenModal(false)}>Cancelar</Button>
                        <Button type="submit">Guardar</Button>
                    </Box>
                </Box>
            </form>
        </ModalDialog>
      </Modal>

    </CssVarsProvider>
  );
}