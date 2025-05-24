import { Routes, Route } from 'react-router-dom';
import App from '../App';
import Fadopcion from '../components/adopcion/Fadopcion';
import Fperdida from '../components/perdida/Fperdida';
import Fbusqueda from '../components/busqueda/Fbusqueda';
import Fveterinaria from '../components/veterinaria/Fveterinaria';
import Fcomunidad from '../components/comunidad/Fcomunidad';
import Login from "../components/login/GoogleLogin";
import Home from "../components/home/Home"


function RouterApp() {
  return (
    <Routes>
      {/*<Route path="/" element={<Login/>} />  */}
       {/*<Route path="/home" element={<Home/>} />*/}
       <Route path="/" element={<App/>} /> {/*<-- modificacion para saltarse el home*/}
      <Route path="/adopcion" element={<Fadopcion />} />
      <Route path="/perdida" element={<Fperdida />} />
      <Route path="/busqueda" element={<Fbusqueda />} />
      <Route path="/veterinaria" element={<Fveterinaria />} />
      <Route path="/comunidad" element={<Fcomunidad />} />
    </Routes>
  );
}

export default RouterApp;
