import { Routes, Route } from 'react-router-dom';
import App from '../App';
import Login from "../components/login/GoogleLogin";
import Home from '../components/home/Home';
import Publicar from '../components/Publicar/Publicar';
import Buscar from '../components/buscar/Buscar';
import Publicacion from '../components/publicacion/Publicacion';
import MainLayout from '../layouts/MainLayout';
import Perfil from '../components/Perfil/Perfil';
import Editar from '../components/Editar/editar.jsx';
import ConfigPerfil from '../components/Perfil/configPerfil.jsx';
import Notificaciones from '../components/Notificaciones/Notificaciones.jsx';
import PanelAdmin from '../components/PanelAdmin/PanelAdmin.jsx';
import HomeAdmin from "../components/PanelAdmin/sections/HomeAdmin.jsx";
import UsuariosAdmin from "../components/PanelAdmin/sections/UsuariosAdmin.jsx";
import PublicacionesAdmin from "../components/PanelAdmin/sections/PublicacionesAdmin.jsx";
import ImagenesAdmin from "../components/PanelAdmin/sections/ImagenesAdmin.jsx";
import ComentariosAdmin from "../components/PanelAdmin/sections/ComentariosAdmin.jsx";
import UbicacionesAdmin from "../components/PanelAdmin/sections/UbicacionesAdmin.jsx";
import EtiquetasAdmin from "../components/PanelAdmin/sections/EtiquetasAdmin.jsx";
import ReportesAdmin from "../components/PanelAdmin/sections/ReportesAdmin.jsx";
import MapaInteractivo from '../components/Mapa Interactivo/MapaInteractivo.jsx';

import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";

function RouterApp() {
  return (
    <Routes>

      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<App />} />
      <Route path="/pconfig" element={<ConfigPerfil />} />

      {/* Rutas protegidas con layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/publicar" element={<Publicar />} />
        <Route path="/buscar" element={<Buscar />} />
        <Route path="/publicacion/prueba" element={<Publicacion />} />
        <Route path="/publicacion/:id" element={<Publicacion />} />
        <Route path="/perfil/:slug" element={<Perfil />} />
        <Route path="/editar/:id_publicacion" element={<Editar />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        <Route path="/mapa" element={<MapaInteractivo />} />
      </Route>

      {/* Rutas admin protegidas */}
      <Route
        path="/admin/panel"
        element={
          <ProtectedRoute>
            <PanelAdmin />
          </ProtectedRoute>
        }
      >
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
  );
}

export default RouterApp;
