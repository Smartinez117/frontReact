import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import './GoogleLogin.css';
import '../../styles/global.css';

import iconoGOOGLE from '../../assets/iconoGOOGLE.svg';

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const customProvider = new GoogleAuthProvider();
      customProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, customProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      localStorage.setItem("userName", user.displayName);
      localStorage.setItem("userPhoto", user.photoURL);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("token", idToken);

      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("userIdLocal", data.idLocal); // guardar id de la BD
        navigate('/home');
      } else {
        alert("Error en autenticación con backend");
      }
    } catch (error) {
      console.error("Error en login con Google:", error);
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

