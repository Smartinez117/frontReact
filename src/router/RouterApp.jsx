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
import MainLayout from '../layouts/MainLayout';




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

      {/* Rutas que usan MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/publicar" element={<Publicar />} />
      </Route>

    </Routes>
  );
}

export default RouterApp;