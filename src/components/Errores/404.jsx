import { Link } from "react-router-dom";

export default function Error404() {
  return (
    <div style={styles.container}>
      <img
        src="/404.png"  // <-- cambiá por la ruta real de tu imagen
        alt="Página no encontrada"
        style={styles.image}
      />

      <Link to="/" style={styles.button}>
        Volver al Home
      </Link>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    backgroundColor: "#ffffff",
    textAlign: "center",
  },
  image: {
    maxWidth: "90%",
    width: "400px",
    height: "auto",
    marginBottom: "25px",
  },
  button: {
    display: "inline-block",
    padding: "12px 22px",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "8px",
    fontSize: "16px",
    textDecoration: "none",
    fontWeight: "500",
    transition: "0.2s",
  },
};
