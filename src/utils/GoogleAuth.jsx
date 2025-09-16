import { auth, provider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { BASE_URL } from "./constants";

const handleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const idToken = await user.getIdToken(true);

    // Send token to backend
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: idToken }),
    });

    if (!response.ok) throw new Error("Backend authentication failed");
    const data = await response.json();

    localStorage.setItem("userName", user.displayName);
    localStorage.setItem("userPhoto", user.photoURL);
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("token", idToken);
    localStorage.setItem("userIdLocal", data.idLocal);
    localStorage.setItem("userSlug", data.userSlug);
  } catch (error) {
    console.error("Login error:", error);
    alert(error.message || "Login failed. Please try again.");
  }
};

const handleLogout = async () => {
  try {
    await signOut(auth);

    localStorage.removeItem("userName");
    localStorage.removeItem("userPhoto");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    localStorage.removeItem("userIdLocal");
    localStorage.removeItem("userSlug");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

const handleProfile = async () => {
  //const userSlug = localStorage.getItem("userSlug")
  //navigate(`/perfil/${userSlug}`)
};

const handleNotifications = async () => {
  //navigate("/notificaciones")
};

const handleSettings = async () => {
  //navigate("/pconfig")
};

export {
  handleLogin,
  handleLogout,
  handleProfile,
  handleNotifications,
  handleSettings,
};
