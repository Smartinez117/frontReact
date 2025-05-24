import { signInWithPopup , GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

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
      localStorage.setItem("userToken", idToken);

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
    <div className="login-container">
      <h1>Bienvenido a REDEMA</h1>
      <button onClick={handleLogin}>Iniciar sesión con Google</button>
    </div>
  );
}

export default Login;
