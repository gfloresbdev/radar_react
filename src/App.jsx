import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


// Importa tus componentes
import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import LoginSignup from "./components/LoginSignup";
import Buscador from "./components/Buscador";
import MisMarcas from "./components/MisMarcas";
import Similitudes from "./components/Similitudes";
import DebugPanel from "./components/DebugPanel";
import Marca from "./components/Marca";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [devLoggedIn, setDevLoggedIn] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // El estado de login será el real o el de desarrollo
  const effectiveLoggedIn = isLoggedIn || devLoggedIn;

  // Cargar estado de login desde localStorage al inicializar
  useEffect(() => {
    const savedLoginState = localStorage.getItem('radarApp_isLoggedIn');
    const savedUser = localStorage.getItem('radarApp_usuarioActual');
    
    if (savedLoginState === 'true' && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setIsLoggedIn(true);
        setUsuarioActual(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('radarApp_isLoggedIn');
        localStorage.removeItem('radarApp_usuarioActual');
      }
    }
    setIsLoading(false);
  }, []);

  // Función personalizada para setear el estado de login y persistirlo
  const handleSetIsLoggedIn = (loggedIn) => {
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      localStorage.setItem('radarApp_isLoggedIn', 'true');
    } else {
      localStorage.removeItem('radarApp_isLoggedIn');
      localStorage.removeItem('radarApp_usuarioActual');
      setUsuarioActual(null);
    }
  };

  // Función personalizada para setear el usuario actual y persistirlo
  const handleSetUsuarioActual = (user) => {
    setUsuarioActual(user);
    if (user) {
      localStorage.setItem('radarApp_usuarioActual', JSON.stringify(user));
    } else {
      localStorage.removeItem('radarApp_usuarioActual');
    }
  };

  // Agregar marca (por expediente) - usado en Buscador para agregar marcas al usuario
  const agregarMarca = (expediente) => {
    // Esta función se mantiene para compatibilidad con Buscador
    // Puede ser utilizada para lógica futura de marcas favoritas
    console.log('Marca agregada:', expediente);
  };

  // Mostrar loading mientras se carga el estado
  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Mostrar Navbar y Footer solo cuando el usuario esté logueado */}
        {effectiveLoggedIn && (
          <Navbar
            isLoggedIn={effectiveLoggedIn}
            onSignOut={() => {
              handleSetIsLoggedIn(false);
              handleSetUsuarioActual(null);
            }}
            devLoggedIn={devLoggedIn}
            setDevLoggedIn={setDevLoggedIn}
          />
        )}
        
        <DebugPanel 
          devLoggedIn={devLoggedIn} 
          setDevLoggedIn={setDevLoggedIn}
          setIsLoggedIn={handleSetIsLoggedIn}
          setUsuarioActual={handleSetUsuarioActual}
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
                  <LoginSignup setIsLoggedIn={handleSetIsLoggedIn} setUsuarioActual={handleSetUsuarioActual} />
                )
              } 
            />
            
            {/* Rutas protegidas - solo accesibles cuando está logueado */}
          
            <Route
              path="/buscador"
              element={
                effectiveLoggedIn ? (
                  <Buscador
                    agregarMarca={agregarMarca}
                    usuarioActual={usuarioActual}
                    setUsuarioActual={handleSetUsuarioActual}
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
                  <LoginSignup setIsLoggedIn={handleSetIsLoggedIn} setUsuarioActual={handleSetUsuarioActual} />
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
