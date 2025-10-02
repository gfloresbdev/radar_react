// Homepage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config"; // NUEVO import

export default function LoginSignup({ setIsLoggedIn, setUsuarioActual }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        // LOGIN
        const response = await fetch(`${config.API_BASE_URL}/api/usuarios/login`, { // CAMBIO AQUÍ
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const userData = await response.json();
          setUsuarioActual(userData);
          setIsLoggedIn(true);
          navigate("/");
        } else {
          setError("Credenciales incorrectas");
        }
      } else {
        // REGISTRO
        const response = await fetch(`${config.API_BASE_URL}/api/usuarios/register`, { // CAMBIO AQUÍ
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password, email }),
        });

        if (response.ok) {
          const userData = await response.json();
          setUsuarioActual(userData);
          setIsLoggedIn(true);
          navigate("/");
        } else {
          const errorData = await response.json();
          setError(errorData.detail || "Error en el registro");
        }
      }
    } catch (error) {
      setError("Error de conexión");
    }
  };

  return (
    <div className="login-signup-container">
      <h2>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">
          {isLogin ? "Iniciar Sesión" : "Registrarse"}
        </button>
      </form>
      <p>
        {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
        <a href="#" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Regístrate" : "Inicia sesión"}
        </a>
      </p>
    </div>
  );
}
