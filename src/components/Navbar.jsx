import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, onSignOut, devLoggedIn, setDevLoggedIn }) => {
  const [showMarcasMenu, setShowMarcasMenu] = useState(false);

  // Handler para click en Marcas
  const handleMarcasClick = () => setShowMarcasMenu((prev) => true);

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/about" className="navbar-link">AboutUs</Link>
        {isLoggedIn && (
          <>
            <div
              className="navbar-link navbar-dropdown"
              onMouseEnter={() => setShowMarcasMenu(true)}
              onMouseLeave={() => setShowMarcasMenu(false)}
              onClick={handleMarcasClick}
              style={{ userSelect: "none" }} // Elimina position: "relative" aquí, usa la clase CSS
            >
              <span style={{ cursor: "pointer" }}>Marcas ▼</span>
              {showMarcasMenu && (
                <div className="navbar-dropdown-menu">
                  <Link to="/mis-marcas" className="navbar-dropdown-item">Mis marcas</Link>
                  <Link to="/similitudes" className="navbar-dropdown-item">Similitudes</Link>
                  <Link to="/buscador" className="navbar-dropdown-item">Buscador</Link>
                </div>
              )}
            </div>
          </>
        )}
        {!isLoggedIn ? (
          <Link to="/login" className="navbar-link">Login</Link>
        ) : (
          <button className="navbar-link" onClick={onSignOut}>Sign Out</button>
        )}
      </div>
      
    </nav>
  );
};

export default Navbar;


