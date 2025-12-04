import React, { useEffect, useState } from 'react';
import { actualizarUsuario, configUsuarioActual } from '../../services/perfilService';
import './cperfilConfiguraciones.css';

// --- IMPORTACIONES JOY UI ---
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  Divider, 
  Button, 
  Input, 
  Textarea, 
  Select, 
  Option, 
  Stack, 
  FormControl, 
  FormLabel, 
  CircularProgress,
  Avatar,
  IconButton
} from '@mui/joy';

// --- ICONOS ---
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

const API_URL = import.meta.env.VITE_API_URL;

export default function PerfilConfiguracion() {
  const [usuario, setUsuario] = useState(null);
  const [seccionEditando, setSeccionEditando] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingGuardar, setLoadingGuardar] = useState(false);
  const [errors, setErrors] = useState({ nombre: '', telefono_pais: '', telefono_numero_local: '' });

  // Estados para la cascada de ubicación
  const [provincias, setProvincias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  
  // IDs seleccionados
  const [provinciaId, setProvinciaId] = useState(null);
  const [departamentoId, setDepartamentoId] = useState(null);
  const [localidadId, setLocalidadId] = useState(null);

  useEffect(() => {
    cargarUsuario();
    fetchProvincias();
  }, []);

  async function cargarUsuario() {
    try {
      setLoading(true);
      const datos = await configUsuarioActual();
      
      // Hidratación de ubicación si falta el objeto pero está el ID
      if (datos.id_localidad && !datos.ubicacion) {
        try {
          const resLoc = await fetch(`${API_URL}/api/ubicacion/localidades/${datos.id_localidad}`);
          if (resLoc.ok) {
            const dataLoc = await resLoc.json();
            datos.ubicacion = {
              id: dataLoc.id,
              nombre: dataLoc.nombre,
              provincia_id: dataLoc.id_provincia,
              departamento_id: dataLoc.id_departamento
            };
          }
        } catch (errLoc) {
          console.error("Error cargando nombre de localidad:", errLoc);
        }
      }

      setUsuario(datos);
      setSeccionEditando(null);
      setFormData({});
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    } finally {
      setLoading(false);
    }
  }

  // --- API Calls ---
  const fetchProvincias = async () => {
    try {
        const res = await fetch(`${API_URL}/api/ubicacion/provincias`);
        if(res.ok) setProvincias(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchDepartamentos = async (idProv) => {
    try {
        const res = await fetch(`${API_URL}/api/ubicacion/departamentos?provincia_id=${idProv}`);
        if(res.ok) setDepartamentos(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchLocalidades = async (idDept) => {
    try {
        const res = await fetch(`${API_URL}/api/ubicacion/localidades?departamento_id=${idDept}`);
        if(res.ok) setLocalidades(await res.json());
    } catch (e) { console.error(e); }
  };

  const prellenarUbicacion = async (idLocalidadUsuario) => {
    if (!idLocalidadUsuario) {
        resetSelects();
        return;
    }
    try {
        const res = await fetch(`${API_URL}/api/ubicacion/localidades/${idLocalidadUsuario}`);
        const data = await res.json();
        if (res.ok) {
            setProvinciaId(data.id_provincia.toString());
            await fetchDepartamentos(data.id_provincia);
            setDepartamentoId(data.id_departamento.toString());
            await fetchLocalidades(data.id_departamento);
            setLocalidadId(data.id.toString());
        }
    } catch (error) {
        console.error("Error recuperando datos de ubicación", error);
    }
  };

  useEffect(() => {
    if (provinciaId && seccionEditando === 'ubicacion') {
        if (!usuario?.ubicacion || provinciaId != usuario.ubicacion.provincia_id) {
             setDepartamentoId(null);
             setLocalidadId(null);
        }
        fetchDepartamentos(provinciaId);
    }
  }, [provinciaId, seccionEditando, usuario?.ubicacion]);

  useEffect(() => {
    if (departamentoId && seccionEditando === 'ubicacion') {
         if (!usuario?.ubicacion || departamentoId != usuario.ubicacion.departamento_id) {
             setLocalidadId(null);
         }
        fetchLocalidades(departamentoId);
    }
  }, [departamentoId, seccionEditando, usuario?.ubicacion]);


  async function handleModificar(seccion) {
    setSeccionEditando(seccion);
    if (!usuario) return;

    if (seccion === 'personal') {
        setFormData({ nombre: usuario.nombre });
    } else if (seccion === 'contacto') {
        setFormData({
          telefono_pais: usuario.telefono_pais || '',
          telefono_numero_local: usuario.telefono_numero_local || '',
        });
    } else if (seccion === 'otros') {
        setFormData({ descripcion: usuario.descripcion || '' });
    } else if (seccion === 'ubicacion') {
        if (usuario.ubicacion && usuario.ubicacion.id) {
            await prellenarUbicacion(usuario.ubicacion.id);
        } else {
            resetSelects();
        }
    }
  }

  function resetSelects() {
    setProvinciaId(null);
    setDepartamentoId(null);
    setLocalidadId(null);
  }

  function handleCancelar() {
    setSeccionEditando(null);
    setFormData({});
    resetSelects();
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validación en tiempo real
    if (name === 'nombre') {
      const v = (value || '').trim();
      if (!v) setErrors(prev => ({ ...prev, nombre: 'El nombre no puede estar vacío.' }));
      else if (v.length > 40) setErrors(prev => ({ ...prev, nombre: 'El nombre no puede tener más de 40 caracteres.' }));
      else setErrors(prev => ({ ...prev, nombre: '' }));
    }

    if (name === 'telefono_numero_local') {
      const localDigits = (value || '').replace(/\D/g, '');
      if (!localDigits) {
        setErrors(prev => ({ ...prev, telefono_numero_local: '' }));
      } else if (!/^9\d{9,10}$/.test(localDigits)) {
        setErrors(prev => ({ ...prev, telefono_numero_local: 'Número local inválido. Debe comenzar con 9 y contener 10-11 dígitos.' }));
      } else {
        setErrors(prev => ({ ...prev, telefono_numero_local: '' }));
      }
    }

    if (name === 'telefono_pais') {
      const paisDigits = (value || '').replace(/[^0-9]/g, '');
      if (paisDigits && (paisDigits.length < 1 || paisDigits.length > 3)) {
        setErrors(prev => ({ ...prev, telefono_pais: 'Código de país inválido.' }));
      } else {
        setErrors(prev => ({ ...prev, telefono_pais: '' }));
      }
    }
  }

  async function handleGuardar() {
    try {
      if (!usuario) throw new Error('Usuario no cargado');
      let dataToSend = {};

      // Validaciones locales
      if (seccionEditando === 'personal') {
        const nombre = (formData.nombre || '').trim();
        if (!nombre) {
          alert('El nombre no puede estar vacío.');
          return;
        }
        if (nombre.length > 40) {
          alert('El nombre no puede tener más de 40 caracteres.');
          return;
        }
        dataToSend = { nombre };

      } else if (seccionEditando === 'contacto') {
        const paisRaw = (formData.telefono_pais || '').trim() || '+54';
        const paisDigits = paisRaw.replace(/[^0-9]/g, '');
        const telefonoPais = paisDigits ? `+${paisDigits}` : '+54';

        const localRaw = (formData.telefono_numero_local || '').trim();
        const localDigits = localRaw.replace(/\D/g, '');

        // Validación básica para formato argentino: debe comenzar con 9 y tener entre 10 y 11 dígitos en total (ej: 9XXXXXXXXXX)
        if (!/^9\d{9,10}$/.test(localDigits)) {
          alert('Número local inválido. Ejemplo válido: 9XXXXXXXXXX (ej: 91112345678). Usa el formato +54 9 XXX XXX XXXX.');
          return;
        }

        dataToSend = {
          telefono_pais: telefonoPais,
          telefono_numero_local: localDigits,
        };

      } else if (seccionEditando === 'otros') {
        dataToSend = { descripcion: formData.descripcion };

      } else if (seccionEditando === 'ubicacion') {
        if (!localidadId) {
          alert('Debes seleccionar una localidad');
          return;
        }
        dataToSend = { id_localidad: localidadId };
      }

      // Antes de enviar, comprobamos errores actuales
      const hasErrors = Object.values(errors).some(Boolean);
      if (hasErrors) {
        // No enviar si hay errores visibles
        alert('Corrige los errores del formulario antes de guardar.');
        return;
      }

      setLoadingGuardar(true);
      await actualizarUsuario(usuario.id, dataToSend);

      setUsuario(prev => {
        const nuevoEstado = { ...prev, ...dataToSend };
        if (seccionEditando === 'ubicacion') {
          const localidadObj = localidades.find(l => l.id.toString() === localidadId.toString());
          if (localidadObj) {
            nuevoEstado.ubicacion = {
              id: localidadObj.id,
              nombre: localidadObj.nombre,
              provincia_id: provinciaId,
              departamento_id: departamentoId
            };
          }
        }
        return nuevoEstado;
      });

      setSeccionEditando(null);
      setLoadingGuardar(false);

    } catch (error) {
      alert('Error al guardar: ' + (error?.message || error));
      setLoadingGuardar(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size="lg" />
      </Box>
    );
  }

  if (!usuario) return <Typography>Error cargando usuario.</Typography>;

  return (
    <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Stack spacing={4}>
          
          {/* ENCABEZADO */}
          <Box>
            <Typography level="h2" sx={{ mb: 1 }}>Configuración del Perfil</Typography>
            <Typography level="body-md" textColor="text.secondary">
              Administra tu información personal y preferencias.
            </Typography>
          </Box>

          {/* === SECCIÓN DATOS PERSONALES === */}
          <Card variant="outlined" sx={{ boxShadow: 'sm', borderRadius: 'lg' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar color="primary" variant="soft"><PersonIcon /></Avatar>
                <Typography level="h4">Datos Personales</Typography>
              </Stack>
              {seccionEditando !== 'personal' && (
                <Button variant="plain" color="neutral" startDecorator={<EditIcon />} onClick={() => handleModificar('personal')}>
                  Editar
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {seccionEditando === 'personal' ? (
              <form onSubmit={e => { e.preventDefault(); handleGuardar(); }}>
                <Stack spacing={2}>
                    <FormControl error={!!errors.nombre}>
                    <FormLabel>Nombre completo</FormLabel>
                    <Input
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      inputProps={{ maxLength: 40 }}
                      sx={errors.nombre ? { border: '1px solid #d32f2f', borderRadius: 1 } : undefined}
                      aria-invalid={!!errors.nombre}
                    />
                    {errors.nombre && (
                      <Typography level="body-xs" sx={{ mt: 0.5, color: 'danger.plainColor' }}>{errors.nombre}</Typography>
                    )}
                  </FormControl>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input value={usuario.email} disabled sx={{ bgcolor: '#f0f0f0' }} />
                  </FormControl>
                  <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                    <Button variant="outlined" color="neutral" onClick={handleCancelar} disabled={loadingGuardar}>Cancelar</Button>
                    <Button type="submit" startDecorator={loadingGuardar ? <span className="spinner-small"></span> : <SaveIcon />} disabled={loadingGuardar}>
                      {loadingGuardar ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </Stack>
                </Stack>
              </form>
            ) : (
              <Stack spacing={1}>
                <Typography level="body-sm" fontWeight="lg">Nombre</Typography>
                <Typography level="body-md">{usuario.nombre}</Typography>
                <Typography level="body-sm" fontWeight="lg" sx={{ mt: 1 }}>Email</Typography>
                <Typography level="body-md">{usuario.email}</Typography>
              </Stack>
            )}
          </Card>

          {/* === SECCIÓN UBICACIÓN === */}
          <Card variant="outlined" sx={{ boxShadow: 'sm', borderRadius: 'lg' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar color="success" variant="soft"><LocationOnIcon /></Avatar>
                <Typography level="h4">Ubicación</Typography>
              </Stack>
              {seccionEditando !== 'ubicacion' && (
                <Button variant="plain" color="neutral" startDecorator={<EditIcon />} onClick={() => handleModificar('ubicacion')}>
                  Modificar
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            {seccionEditando === 'ubicacion' ? (
              <Box>
                <Typography level="body-sm" mb={2}>Selecciona tu ubicación preferida para ver contenido relevante cerca de ti.</Typography>
                <Stack spacing={2}>
                  <Select
                    placeholder="Seleccioná una provincia"
                    value={provinciaId}
                    onChange={(e, val) => setProvinciaId(val)}
                    indicator={<KeyboardArrowDown />}
                  >
                    {provincias.map((prov) => (
                      <Option key={prov.id} value={prov.id.toString()}>{prov.nombre}</Option>
                    ))}
                  </Select>

                  <Select
                    placeholder="Seleccioná un departamento"
                    value={departamentoId}
                    onChange={(e, val) => setDepartamentoId(val)}
                    disabled={!provinciaId}
                    indicator={<KeyboardArrowDown />}
                  >
                    {departamentos.map((d) => (
                      <Option key={d.id} value={d.id.toString()}>{d.nombre}</Option>
                    ))}
                  </Select>

                  <Select
                    placeholder="Seleccioná una localidad"
                    value={localidadId}
                    onChange={(e, val) => setLocalidadId(val)}
                    disabled={!departamentoId}
                    indicator={<KeyboardArrowDown />}
                  >
                    {localidades.map((l) => (
                      <Option key={l.id} value={l.id.toString()}>{l.nombre}</Option>
                    ))}
                  </Select>

                  <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                    <Button variant="outlined" color="neutral" onClick={handleCancelar} disabled={loadingGuardar}>Cancelar</Button>
                    <Button onClick={handleGuardar} disabled={!localidadId || loadingGuardar} startDecorator={loadingGuardar ? <span className="spinner-small"></span> : <SaveIcon />}>
                      {loadingGuardar ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ) : (
              <Stack spacing={1}>
                <Typography level="body-sm" fontWeight="lg">Localidad actual</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <LocationOnIcon color="action" fontSize="small"/>
                    <Typography level="body-md">
                        {usuario.ubicacion ? usuario.ubicacion.nombre : 'No especificada'}
                    </Typography>
                </Stack>
              </Stack>
            )}
          </Card>

          {/* === SECCIÓN CONTACTO === */}
          <Card variant="outlined" sx={{ boxShadow: 'sm', borderRadius: 'lg' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar color="warning" variant="soft"><PhoneIcon /></Avatar>
                <Typography level="h4">Datos de Contacto</Typography>
              </Stack>
              {seccionEditando !== 'contacto' && (
                <Button variant="plain" color="neutral" startDecorator={<EditIcon />} onClick={() => handleModificar('contacto')}>
                  Editar
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            {seccionEditando === 'contacto' ? (
              <form onSubmit={e => { e.preventDefault(); handleGuardar(); }}>
                <Stack spacing={2} direction="row">
                  <FormControl sx={{ width: '120px' }} error={!!errors.telefono_pais}>
                    <FormLabel>Cód. País</FormLabel>
                    <Input name="telefono_pais" value={formData.telefono_pais} onChange={handleChange} placeholder="+54" inputProps={{ maxLength: 4 }} aria-invalid={!!errors.telefono_pais} sx={errors.telefono_pais ? { border: '1px solid #d32f2f', borderRadius: 1 } : undefined} />
                    {errors.telefono_pais && (
                      <Typography level="body-xs" sx={{ mt: 0.5, color: 'danger.plainColor' }}>{errors.telefono_pais}</Typography>
                    )}
                  </FormControl>
                  <FormControl sx={{ flex: 1 }} error={!!errors.telefono_numero_local}>
                    <FormLabel>Número local</FormLabel>
                    <Input name="telefono_numero_local" value={formData.telefono_numero_local} onChange={handleChange} placeholder="9 XXX XXX XXXX" inputProps={{ inputMode: 'numeric', maxLength: 12 }} aria-invalid={!!errors.telefono_numero_local} sx={errors.telefono_numero_local ? { border: '1px solid #d32f2f', borderRadius: 1 } : undefined} />
                    <Typography level="body-xs" sx={{ mt: 0.5, color: 'text.tertiary' }}>Formato ejemplo: +54 9 XXX XXX XXXX</Typography>
                    {errors.telefono_numero_local && (
                      <Typography level="body-xs" sx={{ mt: 0.5, color: 'danger.plainColor' }}>{errors.telefono_numero_local}</Typography>
                    )}
                  </FormControl>
                </Stack>
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                    <Button variant="outlined" color="neutral" onClick={handleCancelar} disabled={loadingGuardar}>Cancelar</Button>
                    <Button type="submit" startDecorator={loadingGuardar ? <span className="spinner-small"></span> : <SaveIcon />} disabled={loadingGuardar}>
                      {loadingGuardar ? 'Guardando...' : 'Guardar'}
                    </Button>
                </Stack>
              </form>
            ) : (
              <Stack spacing={1}>
                <Typography level="body-sm" fontWeight="lg">Teléfono</Typography>
                <Typography level="body-md">
                  {usuario.telefono_pais} {usuario.telefono_numero_local || '-'}
                </Typography>
              </Stack>
            )}
          </Card>

          {/* === SECCIÓN OTROS / BIO === */}
          <Card variant="outlined" sx={{ boxShadow: 'sm', borderRadius: 'lg' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar color="neutral" variant="soft"><InfoIcon /></Avatar>
                <Typography level="h4">Sobre mí</Typography>
              </Stack>
              {seccionEditando !== 'otros' && (
                <Button variant="plain" color="neutral" startDecorator={<EditIcon />} onClick={() => handleModificar('otros')}>
                  Editar
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            {seccionEditando === 'otros' ? (
              <form onSubmit={e => { e.preventDefault(); handleGuardar(); }}>
                <FormControl>
                  <FormLabel>Descripción</FormLabel>
                  <Textarea 
                    name="descripcion" 
                    value={formData.descripcion} 
                    onChange={handleChange} 
                    minRows={4} 
                    placeholder="Escribe algo sobre ti..." 
                  />
                </FormControl>
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                    <Button variant="outlined" color="neutral" onClick={handleCancelar} disabled={loadingGuardar}>Cancelar</Button>
                    <Button type="submit" startDecorator={loadingGuardar ? <span className="spinner-small"></span> : <SaveIcon />} disabled={loadingGuardar}>
                      {loadingGuardar ? 'Guardando...' : 'Guardar'}
                    </Button>
                </Stack>
              </form>
            ) : (
              <Box>
                <Typography level="body-md" sx={{ fontStyle: usuario.descripcion ? 'normal' : 'italic', color: usuario.descripcion ? 'text.primary' : 'text.tertiary' }}>
                  {usuario.descripcion || 'No has añadido una descripción.'}
                </Typography>
              </Box>
            )}
          </Card>

        </Stack>
      </Container>
    </Box>
  );
}