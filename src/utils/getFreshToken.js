import { auth } from "../firebase";

export async function getFreshToken() {
  const user = auth.currentUser;
  if (!user) return null;

  // fuerza refresco del token
  const token = await user.getIdToken(true);
  localStorage.setItem("token", token);

  return token;
}
