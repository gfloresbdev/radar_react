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
        {/* Mostrar Navbar y Footer solo cuando el usuario esté logueado */}
        {effectiveLoggedIn && (
          <Navbar
            isLoggedIn={effectiveLoggedIn}
            onSignOut={() => {
              setIsLoggedIn(false);
              setUsuarioActual(null);
            }}
            devLoggedIn={devLoggedIn}
            setDevLoggedIn={setDevLoggedIn}
          />
        )}
        
        <DebugPanel 
          devLoggedIn={devLoggedIn} 
          setDevLoggedIn={setDevLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          setUsuarioActual={setUsuarioActual}
          isLoggedIn={effectiveLoggedIn}
          usuarioActual={usuarioActual}
        />
        
        <div className="flex-1">
          <Routes>
            {/* Página principal: LoginSignup si no está logueado, Homepage si está logueado */}
            <Route 
              path="/" 
              element={
                effectiveLoggedIn ? (
                  <Homepage />
                ) : (
                  <LoginSignup setIsLoggedIn={setIsLoggedIn} setUsuarioActual={setUsuarioActual} />
                )
              } 
            />
            
            {/* Rutas protegidas - solo accesibles cuando está logueado */}
            <Route path="/about" element={effectiveLoggedIn ? <AboutUs /> : <Navigate to="/" />} />
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
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/mis-marcas"
              element={
                effectiveLoggedIn ? (
                  <MisMarcas
                    usuarioActual={usuarioActual}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/similitudes"
              element={effectiveLoggedIn ? <Similitudes /> : <Navigate to="/" />}
            />
            <Route 
              path="/marca/:expediente" 
              element={effectiveLoggedIn ? <Marca /> : <Navigate to="/" />} 
            />
            
            {/* Ruta de login (redirige a home si ya está logueado) */}
            <Route
              path="/login"
              element={
                effectiveLoggedIn ? (
                  <Navigate to="/" />
                ) : (
                  <LoginSignup setIsLoggedIn={setIsLoggedIn} setUsuarioActual={setUsuarioActual} />
                )
              }
            />
          </Routes>
        </div>
        
        {/* Footer solo cuando está logueado */}
        {effectiveLoggedIn && (
          <footer className="bg-gray-100 text-center p-4">
            © {new Date().getFullYear()} Radar de Marcas
          </footer>
        )}
      </div>
    </Router>
  );
}
