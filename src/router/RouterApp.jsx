import { Routes, Route } from 'react-router-dom';
import App from '../App';
import Fadopcion from '../components/adopcion/Fadopcion';
import Fperdida from '../components/perdida/Fperdida';
import Fbusqueda from '../components/busqueda/Fbusqueda';
import Fveterinaria from '../components/veterinaria/Fveterinaria';
import Fcomunidad from '../components/comunidad/Fcomunidad';
import Login from "../components/login/GoogleLogin";
import Home from '../components/home/Home';
import Publicar from '../components/Publicar/Publicar';
import Publicacion from '../components/publicacion/Publicacion';
import MainLayout from '../layouts/MainLayout';
//importacion de las publicaciones del perfil de usuario.
import SelfPublications from '../components/Perfil/selfPublications';

function RouterApp() {
  return (
    <Routes>
      <Route path="/" element={<App/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/app" element={<App/>} />
      <Route path="/adopcion" element={<Fadopcion />} />
      <Route path="/perdida" element={<Fperdida />} />
      <Route path="/busqueda" element={<Fbusqueda />} />
      <Route path="/veterinaria" element={<Fveterinaria />} />
      <Route path="/comunidad" element={<Fcomunidad />} />
      <Route path="/perfil" element={<SelfPublications/>} />


      {/* Rutas que usan MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/publicar" element={<Publicar />} />
        <Route path="/publicacion/prueba" element={<Publicacion />} />
        <Route path="/publicacion/:id" element={<Publicacion />} />
      </Route>

    </Routes>
  );
}

export default RouterApp;