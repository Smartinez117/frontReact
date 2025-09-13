import React from "react"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase"
import "../global.css"

import logo from "/assets/icons/logo.svg?url"
import googleIcon from "/assets/icons/google.svg?url"

function Login() {
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const customProvider = new GoogleAuthProvider()
      customProvider.setCustomParameters({ prompt: "select_account" })
      const result = await signInWithPopup(auth, customProvider)
      const user = result.user
      const idToken = await user.getIdToken()

      localStorage.setItem("userName", user.displayName)
      localStorage.setItem("userPhoto", user.photoURL)
      localStorage.setItem("userEmail", user.email)
      localStorage.setItem("token", idToken)

      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("userIdLocal", data.idLocal) // guardar id de la BD
        navigate("/home")
      } else {
        alert("Error en autenticación con backend")
      }
    } catch (error) {
      console.error("Error en login con Google:", error)
    }
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="logo-text">
          <img src={logo} alt="Logo Redema" className="logo-login" />
          <h1 className="nombre-redema">Redema</h1>
        </div>
        <p className="bienvenida">Bienvenido a Redema</p>
        <button className="google-button" onClick={handleLogin}>
          <img src={googleIcon} alt="Google" className="google-icon" />
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  )
}

export default Login
