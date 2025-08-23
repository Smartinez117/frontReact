import { io } from "socket.io-client";
const socket = io("http://localhost:5000"); // aca escucha ese puerto que es el mismo donde se corre el back
export default socket;
