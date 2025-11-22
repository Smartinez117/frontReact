import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import './GoogleLogin.css';
import '../../styles/global.css';
import Swal from 'sweetalert2';

import iconoGOOGLE from '../../assets/iconoGOOGLE.svg';

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const customProvider = new GoogleAuthProvider();
      customProvider.setCustomParameters({ prompt: 'select_account' });

      //  INTENTO DE LOGIN
      const result = await signInWithPopup(auth, customProvider);
      const user = result.user;

      // Si llega acá, el usuario NO está baneado en Firebase

      const idToken = await user.getIdToken();

      // Guardamos los datos en localStorage
      localStorage.setItem("userName", user.displayName);
      localStorage.setItem("userPhoto", user.photoURL);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("token", idToken);

      //  Backend login
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      //  Backend podría devolver estado de cuenta suspendida
      if (response.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Cuenta suspendida',
          text: 'Tu cuenta ha sido baneada por un administrador.',
        });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("userIdLocal", data.idLocal); 
        navigate('/home');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: 'No se pudo completar la autenticación con el servidor.',
        });
      }

    } catch (error) {

      console.error("Error en login con Google:", error);

      //  Usuario baneado en Firebase
      if (error.code === "auth/user-disabled") {
        Swal.fire({
          icon: 'error',
          title: 'Cuenta deshabilitada',
          text: 'Esta cuenta ha sido suspendida. Contactá al administrador.',
        });
        return;
      }

      // Otros errores
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo iniciar sesión. Intentalo nuevamente.",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="logo-text">
          <img src="/Logo.svg" alt="Logo Redema" className="logo" />
          <h1 className="nombre-redema">Redema</h1>
        </div>
        <p className="bienvenida">Bienvenido a Redema</p>
        <button className="google-button" onClick={handleLogin}>
          <img src={iconoGOOGLE} alt="Google" className="google-icon" />
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
}

export default Login;


