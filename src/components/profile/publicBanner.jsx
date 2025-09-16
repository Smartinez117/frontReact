// publicBanner.jsx es la portada que vemos de un perfil público
import React, { useEffect, useState } from "react"
import "./cbanner.css" // tu CSS para estilos
import { obtenerUsuarioPorId } from "../../services/perfilService"
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag"
import MailIcon from "@mui/icons-material/Mail"

const PublicBanner = ({ userId }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return

    const fetchUser = async () => {
      try {
        setLoading(true)
        const data = await obtenerUsuarioPorId(userId)
        setUser(data)
      } catch (err) {
        setError(err.message || "Error al cargar el usuario")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (loading) return <p>Cargando perfil...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>

  return (
    <div className="nombre-container">
      <img
        src={user?.foto_perfil_url || "/default-profile.png"}
        alt={user?.nombre || "Usuario"}
        className="nombre-foto"
      />
      <div className="nombre-info">
        <span className="nombre-text">{user?.nombre || "Usuario"}</span>
        <div className="nombre-icons">
          <MailIcon />
          <OutlinedFlagIcon />
        </div>
      </div>
    </div>
  )
}

export default PublicBanner