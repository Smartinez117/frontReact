import { Routes, Route } from 'react-router-dom';
import App from '../App';
import Login from "../components/login/GoogleLogin";
import Home from '../components/home/Home';
import Publicar from '../components/Publicar/Publicar';
import Buscar from '../components/buscar/Buscar';
import Publicacion from '../components/publicacion/Publicacion';
import MainLayout from '../layouts/MainLayout';
//importacion de las publicaciones del perfil de usuario.
import Perfil from '../components/Perfil/Perfil';
import Editar from '../components/Editar/editar.jsx';
import ConfigPerfil from '../components/Perfil/configPerfil.jsx';
import Notificaciones from '../components/Notificaciones/notificaciones.jsx';
import PanelAdmin from '../components/PanelAdmin/PanelAdmin.jsx';
import HomeAdmin from "../components/PanelAdmin/sections/HomeAdmin.jsx";
import UsuariosAdmin from "../components/PanelAdmin/sections/UsuariosAdmin.jsx";
import PublicacionesAdmin from "../components/PanelAdmin/sections/PublicacionesAdmin.jsx";

function RouterApp() {
  return (
    <Routes>
      
      <Route path="/login" element={<Login/>} />
      <Route path="/app" element={<App/>} />
      <Route path="/pconfig" element={<ConfigPerfil />} />
      
      <Route path="/admin/panel" element={<PanelAdmin />} />


      {/* Rutas que usan MainLayout */}
      <Route element={<MainLayout />}>
        {/*<Route path="/" element={<App/>} />*/}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/publicar" element={<Publicar />} />
        <Route path="/buscar" element={<Buscar />} />
        <Route path="/publicacion/prueba" element={<Publicacion />} />
        <Route path="/publicacion/:id" element={<Publicacion />} />
        <Route path="/perfil" element={<Perfil/>} />
        <Route path="/editar/:id_publicacion" element={<Editar />} />
        <Route path="/notificaciones" element ={<Notificaciones />} />
      </Route>

    {/*Rutas admin */}
      <Route path="/admin/panel" element={<PanelAdmin />}>
        <Route index element={<HomeAdmin />} />  {/* default /admin/panel */}
        <Route path="usuarios" element={<UsuariosAdmin />} />
        <Route path="publicaciones" element={<PublicacionesAdmin />} />
        {/* más secciones */}
      </Route>


    </Routes>
  );
}

export default RouterApp;