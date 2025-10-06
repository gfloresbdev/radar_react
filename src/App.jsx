/*
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Importa tus componentes
import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import AboutUs from "./components/AboutUs";
import LoginSignup from "./components/LoginSignup";
import Buscador from "./components/Buscador";
import MisMarcas from "./components/MisMarcas";
import Similitudes from "./components/Similitudes";
import DebugPanel from "./components/DebugPanel";
import Marca from "./components/Marca";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [devLoggedIn, setDevLoggedIn] = useState(false);

  // El estado de login será el real o el de desarrollo
  const effectiveLoggedIn = isLoggedIn || devLoggedIn;

  // Usuario de prueba con lista de expedientes de marcas seguidas
  const [marcasSeguidas, setMarcasSeguidas] = useState([]);

  // Agregar marca (por expediente)
  const agregarMarca = (expediente) => {
    if (!marcasSeguidas.includes(expediente)) {
      setMarcasSeguidas([...marcasSeguidas, expediente]);
    }
  };

  // Remover marca (por expediente)
  const removerMarca = (expediente) => {
    setMarcasSeguidas(marcasSeguidas.filter((exp) => exp !== expediente));
  };

  // Estado del usuario actual (para pasar a Buscador)
  const [usuarioActual, setUsuarioActual] = useState(null);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar
          isLoggedIn={effectiveLoggedIn}
          onSignOut={() => setIsLoggedIn(false)}
          devLoggedIn={devLoggedIn}
          setDevLoggedIn={setDevLoggedIn}
        />
        <DebugPanel devLoggedIn={devLoggedIn} setDevLoggedIn={setDevLoggedIn} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route
              path="/buscador"
              element={
                effectiveLoggedIn ? (
                  <Buscador
                    agregarMarca={agregarMarca}
                    marcasSeguidas={marcasSeguidas}
                    usuarioActual={usuarioActual}
                    setUsuarioActual={setUsuarioActual}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/login"
              element={<LoginSignup setIsLoggedIn={setIsLoggedIn} setUsuarioActual={setUsuarioActual} />}
            />
            <Route
              path="/mis-marcas"
              element={
                effectiveLoggedIn ? (
                  <MisMarcas
                    usuarioActual={usuarioActual}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/similitudes"
              element={effectiveLoggedIn ? <Similitudes /> : <Navigate to="/login" />}
            />
            <Route path="/marca/:expediente" element={<Marca />} />
          </Routes>
        </div>
        <footer className="bg-gray-100 text-center p-4">
          © {new Date().getFullYear()} Radar de Marcas Perras
        </footer>
      </div>
    </Router>
  );
}
*/

export default function App() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Hello World!</h1>
    </div>
  );
}