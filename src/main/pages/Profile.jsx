import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import SelfPublications from "../../components/profile/selfPublications"
import UserPublications from "../../components/profile/userPublications"
import MyBanner from "../../components/profile/myBanner"
import PublicBanner from "../../components/profile/publicBanner"
import CssBaseline from "@mui/material/CssBaseline"
import Container from "@mui/material/Container"

const BASE_URL = import.meta.env.VITE_API_URL

const Profile = () => {
  const { slug } = useParams()
  const currentUserId = localStorage.getItem("userId")
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BASE_URL}/usuario/slug/${slug}`)
        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error("Error cargando usuario:", err)
      }
    }
    fetchUser()
  }, [slug])

  if (!user) {
    return <p>Cargando perfil...</p>
  }

  const isOwner = String(user.id) === String(currentUserId)

  return (
    <>
      <CssBaseline />
      <main style={{ padding: "20px" }}>
        {isOwner ? (
          <>
            <MyBanner userId={user.id} />
            <Container maxWidth="sm">
              <h4>Mis publicaciones</h4>
              <SelfPublications userId={user.id} isOwner={true} />
            </Container>
          </>
        ) : (
          <>
            <PublicBanner userId={user.id} />
            <Container maxWidth="sm">
              <h4>Publicaciones</h4>
              <UserPublications userId={user.id} />
            </Container>
          </>
        )}
      </main>
    </>
  )
}

export default Profile
