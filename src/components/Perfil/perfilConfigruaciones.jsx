import React, { useEffect, useState } from 'react';
import { actualizarUsuario, configUsuarioActual } from '../../services/perfilService';
import './cperfilConfiguraciones.css';

// Importaciones de Joy UI
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';

const API_URL = import.meta.env.VITE_API_URL;

export default function PerfilConfiguracion() {
  const [usuario, setUsuario] = useState(null);
  const [seccionEditando, setSeccionEditando] = useState(null);
  const [formData, setFormData] = useState({});

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
      // 1. Traemos el usuario crudo (con id_localidad)
      const datos = await configUsuarioActual();
      console.log("=== DEBUG CARGAR USUARIO ===");
      console.log("Datos recibidos del backend:", datos);
      console.log("ID Localidad:", datos.id_localidad);
      console.log("Objeto Ubicacion:", datos.ubicacion);
      
      // 2. Si tiene id_localidad pero no tiene el objeto 'ubicacion', lo construimos
      if (datos.id_localidad && !datos.ubicacion) {
        try {
          // Usamos el mismo endpoint que usas en prellenarUbicacion
          const resLoc = await fetch(`${API_URL}/api/ubicacion/localidades/${datos.id_localidad}`);
          if (resLoc.ok) {
            const dataLoc = await resLoc.json();
            // Inyectamos el objeto 'ubicacion' que tu render espera
            datos.ubicacion = {
              id: dataLoc.id,
              nombre: dataLoc.nombre,
              provincia_id: dataLoc.id_provincia,     // Opcional, útil para consistencia
              departamento_id: dataLoc.id_departamento // Opcional
            };
          }
        } catch (errLoc) {
          console.error("Error cargando nombre de localidad:", errLoc);
        }
      }

      // 3. Ahora sí seteamos el usuario con la estructura correcta
      setUsuario(datos);
      setSeccionEditando(null);
      setFormData({});
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  }

  // --- API Calls para Ubicación ---
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

  // --- Pre-llenar datos ---
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

  // --- Manejo de cambios en Selects ---
  useEffect(() => {
    if (provinciaId && seccionEditando === 'ubicacion') {
        // Solo limpiar si el usuario está cambiando manualmente la provincia
        // y no es la carga inicial automática
        if (!usuario.ubicacion || provinciaId != usuario.ubicacion.provincia_id) {
             setDepartamentoId(null);
             setLocalidadId(null);
        }
        fetchDepartamentos(provinciaId);
    }
  }, [provinciaId]);

  useEffect(() => {
    if (departamentoId && seccionEditando === 'ubicacion') {
         if (!usuario.ubicacion || departamentoId != usuario.ubicacion.departamento_id) {
             setLocalidadId(null);
         }
        fetchLocalidades(departamentoId);
    }
  }, [departamentoId]);


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
        // Si ya tiene ubicación, la cargamos. Si no, limpiamos.
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
  }

  async function handleGuardar() {
    try {
      if (!usuario) throw new Error('Usuario no cargado');
      let dataToSend = {};

      if (seccionEditando === 'personal') {
        dataToSend = { nombre: formData.nombre };
      } else if (seccionEditando === 'contacto') {
        dataToSend = {
          telefono_pais: formData.telefono_pais,
          telefono_numero_local: formData.telefono_numero_local,
        };
      } else if (seccionEditando === 'otros') {
        dataToSend = { descripcion: formData.descripcion };
      } else if (seccionEditando === 'ubicacion') {
        if (!localidadId) {
            alert("Debes seleccionar una localidad");
            return;
        }
        dataToSend = { id_localidad: localidadId };
      }

      // 1. Enviar al backend
      await actualizarUsuario(usuario.id, dataToSend);

      // 2. Actualizar el estado local MANUALMENTE (Esto evita que desaparezca el dato)
      setUsuario(prev => {
          // Copiamos el usuario anterior y sobrescribimos los campos editados
          const nuevoEstado = { ...prev, ...dataToSend };

          // Lógica especial para reconstruir el objeto visual 'ubicacion'
          if (seccionEditando === 'ubicacion') {
             const localidadObj = localidades.find(l => l.id.toString() === localidadId.toString());
             if (localidadObj) {
                 nuevoEstado.ubicacion = {
                     id: localidadObj.id,
                     nombre: localidadObj.nombre,
                     // Guardamos estos IDs auxiliares para que si vuelves a editar, el select sepa dónde estaba
                     provincia_id: provinciaId, 
                     departamento_id: departamentoId
                 };
             }
          }
          
          return nuevoEstado;
      });

      // 3. Cerrar edición (IMPORTANTE: QUITE LA LLAMADA A cargarUsuario())
      setSeccionEditando(null);

    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  }

  if (!usuario) return <div>Cargando usuario...</div>;

  return (
    <div className="perfil-configuracion">
      <h2>Configuración del perfil</h2>

      {/* SECCIÓN PERSONAL */}
      <section className="seccion usuario-personal">
        <h3>Datos personales</h3>
        {seccionEditando === 'personal' ? (
          <form onSubmit={e => { e.preventDefault(); handleGuardar(); }} className="formulario">
            <label>
              Nombre:
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </label>
            <label>
              Email:
              <input type="email" value={usuario.email} disabled />
            </label>
            <div className="botones">
              <button type="submit">Guardar</button>
              <button type="button" onClick={handleCancelar}>Cancelar</button>
            </div>
          </form>
        ) : (
          <>
            <p><strong>Nombre:</strong> {usuario.nombre}</p>
            <p><strong>Email:</strong> {usuario.email}</p>
            <button onClick={() => handleModificar('personal')}>Modificar</button>
          </>
        )}
      </section>

      {/* SECCIÓN UBICACIÓN (MODIFICADA) */}
      <section className="seccion usuario-ubicacion">
        <h3>Ubicación / Localidad</h3>
        {seccionEditando === 'ubicacion' ? (
          <div className="formulario" style={{display: 'block'}}>
            <p style={{marginBottom: '10px', fontSize: '0.9rem', color: '#666'}}>Selecciona tu ubicación preferida:</p>
            
            <Select
                placeholder="Seleccioná una provincia"
                value={provinciaId}
                onChange={(e, val) => setProvinciaId(val)}
                indicator={<KeyboardArrowDown />}
                sx={{ width: '100%', mb: 2 }}
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
                sx={{ width: '100%', mb: 2 }}
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
                sx={{ width: '100%', mb: 2 }}
            >
                {localidades.map((l) => (
                    <Option key={l.id} value={l.id.toString()}>{l.nombre}</Option>
                ))}
            </Select>

            <div className="botones" style={{marginTop: '20px'}}>
              {/* BOTÓN CON ESTILO DINÁMICO */}
              <button 
                type="button" 
                onClick={handleGuardar} 
                disabled={!localidadId}
                style={{
                    backgroundColor: localidadId ? '#1976d2' : '#e0e0e0', // Azul si listo, Gris si no
                    color: localidadId ? '#fff' : '#a0a0a0',
                    cursor: localidadId ? 'pointer' : 'not-allowed',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                }}
              >
                Guardar
              </button>
              <button type="button" onClick={handleCancelar}>Cancelar</button>
            </div>
          </div>
        ) : (
          <>
            <p>
              <strong>Localidad:</strong> {usuario.ubicacion ? usuario.ubicacion.nombre : 'No especificada'}
            </p>
            <button onClick={() => handleModificar('ubicacion')}>
                {usuario.ubicacion ? 'Cambiar ubicación' : 'Agregar ubicación'}
            </button>
          </>
        )}
      </section>

      {/* SECCIÓN CONTACTO */}
      <section className="seccion usuario-contacto">
        <h3>Datos de contacto</h3>
        {seccionEditando === 'contacto' ? (
          <form onSubmit={e => { e.preventDefault(); handleGuardar(); }} className="formulario">
            <label>
              Teléfono país:
              <input type="text" name="telefono_pais" value={formData.telefono_pais} onChange={handleChange} placeholder="+54" />
            </label>
            <label>
              Teléfono número local:
              <input type="text" name="telefono_numero_local" value={formData.telefono_numero_local} onChange={handleChange} />
            </label>
            <div className="botones">
              <button type="submit">Guardar</button>
              <button type="button" onClick={handleCancelar}>Cancelar</button>
            </div>
          </form>
        ) : (
          <>
            <p><strong>Teléfono país:</strong> {usuario.telefono_pais || '-'}</p>
            <p><strong>Teléfono local:</strong> {usuario.telefono_numero_local || '-'}</p>
            <button onClick={() => handleModificar('contacto')}>Modificar</button>
          </>
        )}
      </section>

      {/* SECCIÓN OTROS */}
      <section className="seccion usuario-otros">
        <h3>Otros datos</h3>
        {seccionEditando === 'otros' ? (
          <form onSubmit={e => { e.preventDefault(); handleGuardar(); }} className="formulario">
            <label>
              Descripción:
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={4} />
            </label>
            <div className="botones">
              <button type="submit">Guardar</button>
              <button type="button" onClick={handleCancelar}>Cancelar</button>
            </div>
          </form>
        ) : (
          <>
            <p><strong>Descripción:</strong> {usuario.descripcion || '-'}</p>
            <button onClick={() => handleModificar('otros')}>Modificar</button>
          </>
        )}
      </section>
    </div>
  );
}