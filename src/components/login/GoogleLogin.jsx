import { signInWithPopup , GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import './GoogleLogin.css';
import '../../styles/global.css';

import { BiFontFamily } from "react-icons/bi";

import iconoGOOGLE from '../../assets/iconoGOOGLE.svg';


function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const customProvider = new GoogleAuthProvider(); //El custom provider es para que cada vez que ingreses a Redema Tengas que iniciarsesion y no se te inicie automaticamente
      customProvider.setCustomParameters({
      prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, customProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Guardamos nombre y foto en localStorage
      localStorage.setItem("userName", user.displayName);
      localStorage.setItem("userPhoto", user.photoURL);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("token", idToken); //  así lo esperás en el fetch más adelante


      // Enviamos token al backend
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: idToken }),
      });

      if (response.ok) {
        navigate('/app');
      } else {
        alert("Error en autenticación con backend");
      }
    } catch (error) {
      console.error("Error en login con Google:", error);
    }
  };

  return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundImage: "url('/ruta/al/fondo.jpg')", backgroundSize: 'cover' }}>
          <div className="p-4 rounded shadow" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', textAlign: 'center' }}>
            <h1 >Bienvenido a <span className="logo-redema">Redema</span></h1>
            <h2>¡La Red De Mascotas!</h2>
            <button className="btn btn-outline-success mt-3" onClick={handleLogin}>
              <img src={iconoGOOGLE} alt="Google logo" width="20" height="20" className="me-2" />
              Iniciar sesión con Google
            </button>
          </div>
        </div>

  );
}

export default Login;
