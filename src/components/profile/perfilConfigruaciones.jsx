import React, { useEffect, useState } from "react";
import {
  actualizarUsuario,
  configUsuarioActual,
} from "../../services/perfilService";
import "./cperfilconfiguraciones.css";

export default function PerfilConfiguracion() {
  const [usuario, setUsuario] = useState(null);
  const [seccionEditando, setSeccionEditando] = useState(null); // "personal", "contacto", "otros" o null
  const [formData, setFormData] = useState({});

  useEffect(() => {
    cargarUsuario();
  }, []);

  async function cargarUsuario() {
    try {
      const datos = await configUsuarioActual();
      setUsuario(datos);
      setSeccionEditando(null);
      setFormData({});
    } catch (error) {
      console.error("Error al cargar usuario:", error);
    }
  }

  function handleModificar(seccion) {
    setSeccionEditando(seccion);
    if (!usuario) return;

    switch (seccion) {
      case "personal":
        setFormData({ nombre: usuario.nombre, email: usuario.email });
        break;
      case "contacto":
        setFormData({
          telefono_pais: usuario.telefono_pais || "",
          telefono_numero_local: usuario.telefono_numero_local || "",
        });
        break;
      case "otros":
        setFormData({ descripcion: usuario.descripcion || "" });
        break;
      default:
        setFormData({});
    }
  }

  function handleCancelar() {
    setSeccionEditando(null);
    setFormData({});
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleGuardar() {
    try {
      if (!usuario) {
        throw new Error("Usuario no cargado");
      }

      let dataToSend = {};

      if (seccionEditando === "personal") {
        dataToSend = {
          nombre: formData.nombre,
        };
      } else if (seccionEditando === "contacto") {
        dataToSend = {
          telefono_pais: formData.telefono_pais,
          telefono_numero_local: formData.telefono_numero_local,
        };
      } else if (seccionEditando === "otros") {
        dataToSend = {
          descripcion: formData.descripcion,
        };
      }

      await actualizarUsuario(usuario.id, dataToSend);
      await cargarUsuario();
    } catch (error) {
      alert("Error al guardar los cambios: " + error.message);
    }
  }

  if (!usuario) {
    return <div>Cargando usuario...</div>;
  }

  return (
    <div className="perfil-configuracion">
      <h2>Configuración del perfil</h2>

      <section className="seccion usuario-personal">
        <h3>Datos personales</h3>
        {seccionEditando === "personal" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGuardar();
            }}
            className="formulario"
          >
            <label>
              Nombre:
              <input
                type="text"
                name="nombre"
                placeholder={usuario.nombre}
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled
              />
            </label>
            <label>
              Email:
              <input type="email" name="email" value={usuario.email} disabled />
            </label>
            <div className="botones">
              <button type="submit">Guardar</button>
              <button type="button" onClick={handleCancelar}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <>
            <p>
              <strong>Nombre:</strong> {usuario.nombre}
            </p>
            <p>
              <strong>Email:</strong> {usuario.email}
            </p>
            <button onClick={() => handleModificar("personal")}>
              Modificar
            </button>
          </>
        )}
      </section>

      <section className="seccion usuario-contacto">
        <h3>Datos de contacto</h3>
        {seccionEditando === "contacto" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGuardar();
            }}
            className="formulario"
          >
            <label>
              Teléfono país:
              <input
                type="text"
                name="telefono_pais"
                placeholder={usuario.telefono_pais || ""}
                value={formData.telefono_pais}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Teléfono número local:
              <input
                type="text"
                name="telefono_numero_local"
                placeholder={usuario.telefono_numero_local || ""}
                value={formData.telefono_numero_local}
                onChange={handleChange}
                required
              />
            </label>
            <div className="botones">
              <button type="submit">Guardar</button>
              <button type="button" onClick={handleCancelar}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <>
            <p>
              <strong>Teléfono país:</strong> {usuario.telefono_pais}
            </p>
            <p>
              <strong>Teléfono local:</strong> {usuario.telefono_numero_local}
            </p>
            <button onClick={() => handleModificar("contacto")}>
              Modificar
            </button>
          </>
        )}
      </section>

      <section className="seccion usuario-otros">
        <h3>Otros datos</h3>
        {seccionEditando === "otros" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGuardar();
            }}
            className="formulario"
          >
            <label>
              Descripción:
              <textarea
                name="descripcion"
                placeholder={usuario.descripcion || ""}
                value={formData.descripcion}
                onChange={handleChange}
              />
            </label>
            <div className="botones">
              <button type="submit">Guardar</button>
              <button type="button" onClick={handleCancelar}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <>
            <p>
              <strong>Descripción:</strong> {usuario.descripcion}
            </p>
            <button onClick={() => handleModificar("otros")}>Modificar</button>
          </>
        )}
      </section>
    </div>
  );
}
