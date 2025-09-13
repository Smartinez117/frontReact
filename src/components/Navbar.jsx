import React from "react"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import Menu from "@mui/material/Menu"
import MenuIcon from "@mui/icons-material/Menu"
import Container from "@mui/material/Container"
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import Tooltip from "@mui/material/Tooltip"
import MenuItem from "@mui/material/MenuItem"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { socketconnection, socketnotificationlisten } from "../utils/socket"
import { Toaster } from "react-hot-toast"

const pages = ["Inicio", "Publicar", "Buscar", "Mapa"]
const settings = [
  "Notificaciones",
  "Mi perfil",
  "Configuración",
  "Cerrar sesión",
]

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = React.useState(null)
  const [anchorElUser, setAnchorElUser] = React.useState(null)
  const [userName, setUserName] = useState("")
  const [userPhoto, setUserPhoto] = useState("")
  const navigate = useNavigate()

  const handleOpenNavMenu = event => setAnchorElNav(event.currentTarget)
  const handleOpenUserMenu = event => setAnchorElUser(event.currentTarget)
  const handleCloseNavMenu = () => setAnchorElNav(null)
  const handleCloseUserMenu = () => setAnchorElUser(null)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        const name = localStorage.getItem("userName")
        const photo = localStorage.getItem("userPhoto")
        socketconnection()
        socketnotificationlisten(user.uid)
        if (name) setUserName(name)
        if (photo) setUserPhoto(photo)
      } else {
        setUserName("")
        setUserPhoto("")
        localStorage.removeItem("userName")
        localStorage.removeItem("userPhoto")
        navigate("/login")
      }
    })
    return () => unsubscribe()
  }, [navigate])

  const handleUserMenuClick = setting => {
    const auth = getAuth()
    switch (setting) {
      case "Cerrar sesión":
        signOut(auth)
          .then(() => {
            localStorage.removeItem("userName")
            localStorage.removeItem("userPhoto")
            console.log("🔒 Sesión cerrada")
            navigate("/login")
          })
          .catch(error => {
            console.error("Error al cerrar sesión:", error)
          })
        break
      case "Mi perfil": {
        const userSlug = localStorage.getItem("userSlug")
        navigate(`/perfil/${userSlug}`)
        break
      }
      case "Notificaciones":
        navigate("/notificaciones")
        break
      case "Configuración":
        navigate("/pconfig")
        break
      default:
        console.log(`Opción no reconocida: ${setting}`)
    }
    handleCloseUserMenu()
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <AppBar position="static" sx={{ backgroundColor: "#edece1ff" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box
              component="img"
              src="assets/icons/logo.svg"
              alt="Logo"
              sx={{
                width: 40,
                height: 40,
                mr: 1,
                display: { xs: "none", md: "block" },
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "black",
                textDecoration: "none",
              }}
            >
              REDEMA
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="open navigation menu"
                onClick={handleOpenNavMenu}
                color="black"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                sx={{ display: { xs: "block", md: "none" } }}
              >
                {pages.map(page => (
                  <MenuItem
                    key={page}
                    onClick={() => {
                      handleCloseNavMenu()
                      const ruta =
                        page.toLowerCase() === "inicio"
                          ? "/home"
                          : `/${page.toLowerCase()}`
                      navigate(ruta)
                    }}
                  >
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Box
              component="img"
              src="assets/icons/logo.svg"
              alt="Logo"
              sx={{
                width: 40,
                height: 40,
                mr: 1,
                display: { xs: "block", md: "none" },
              }}
            />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/home"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "black",
                textDecoration: "none",
              }}
            >
              REDEMA
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                gap: 1,
              }}
            >
              <Button
                onClick={() => navigate("/home")}
                sx={{ my: 2, color: "black" }}
              >
                Inicio
              </Button>
              <Button
                onClick={() => navigate("/publicar")}
                sx={{ my: 2, color: "black" }}
              >
                Publicar
              </Button>
              <Button
                onClick={() => navigate("/buscar")}
                sx={{ my: 2, color: "black" }}
              >
                Buscar
              </Button>
              <Button
                onClick={() => navigate("/mapa")}
                sx={{ my: 2, color: "black" }}
              >
                Mapa
              </Button>
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Abrir opciones">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  {userPhoto ? (
                    <Avatar alt="User" src={userPhoto} />
                  ) : (
                    <Avatar alt="User" src="assets/images/default-profile.png" />
                  )}
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {settings.map(setting => (
                  <MenuItem
                    key={setting}
                    onClick={() => handleUserMenuClick(setting)}
                  >
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  )
}

export default Navbar