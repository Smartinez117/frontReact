import React from "react"
import ReactDOM from "react-dom/client"
import { Routes, Route } from "react-router-dom"
import Login from "./else/GoogleLogin.jsx"
import Home from "./main/pages/Home.jsx"
import Post from "./main/pages/Post.jsx"
import Browse from "./main/pages/Browse.jsx"
import View from "./main/pages/View.jsx"
import MainLayout from "./main/MainLayout.jsx"
import Perfil from "./main/pages/Profile.jsx"
import Editar from "./components/Edit.jsx"
import ConfigPerfil from "./components/profile/configPerfil.jsx"
import PanelAdmin from "./else/admin/PanelAdmin.jsx"
import HomeAdmin from "./else/admin/sections/HomeAdmin.jsx"
import UsuariosAdmin from "./else/admin/sections/UsuariosAdmin.jsx"
import PublicacionesAdmin from "./else/admin/sections/PublicacionesAdmin.jsx"
import ImagenesAdmin from "./else/admin/sections/ImagenesAdmin.jsx"
import ComentariosAdmin from "./else/admin/sections/ComentariosAdmin.jsx"
import UbicacionesAdmin from "./else/admin/sections/UbicacionesAdmin.jsx"
import EtiquetasAdmin from "./else/admin/sections/EtiquetasAdmin.jsx"
import ReportesAdmin from "./else/admin/sections/ReportesAdmin.jsx"
import { BrowserRouter } from "react-router-dom"

import "./global.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/pconfig" element={<ConfigPerfil />} />

      {/* Rutas que usan MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/publicar" element={<Post />} />
        <Route path="/buscar" element={<Browse />} />
        <Route path="/publicacion/prueba" element={<View />} />
        <Route path="/publicacion/:id" element={<View />} />
        <Route path="/perfil/:slug" element={<Perfil />} />
        <Route path="/editar/:id_publicacion" element={<Editar />} />
      </Route>

      {/* Rutas admin */}
      <Route path="/admin/panel" element={<PanelAdmin />}>
        <Route index element={<HomeAdmin />} />
        <Route path="usuarios" element={<UsuariosAdmin />} />
        <Route path="publicaciones" element={<PublicacionesAdmin />} />
        <Route path="imagenes" element={<ImagenesAdmin />} />
        <Route path="comentarios" element={<ComentariosAdmin />} />
        <Route path="ubicaciones" element={<UbicacionesAdmin />} />
        <Route path="etiquetas" element={<EtiquetasAdmin />} />
        <Route path="reportes" element={<ReportesAdmin />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
