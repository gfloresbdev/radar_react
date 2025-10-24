import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, onSignOut, devLoggedIn, setDevLoggedIn }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    onSignOut();
    closeMobileMenu();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Botón hamburguesa - solo visible en móvil */}
        <button 
          className={`hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Enlaces de navegación - desktop */}
        <div className="navbar-links desktop-menu">
          <Link to="/" className="navbar-link">Home</Link>
          {isLoggedIn && (
            <>
              <Link to="/mis-marcas" className="navbar-link">Mis marcas</Link>
              <Link to="/similitudes" className="navbar-link">Similitudes</Link>
              <Link to="/buscador" className="navbar-link">Buscador</Link>
            </>
          )}
          {!isLoggedIn ? (
            <Link to="/login" className="navbar-link">Login</Link>
          ) : (
            <button className="navbar-link" onClick={onSignOut}>Sign Out</button>
          )}
        </div>

        {/* Menú móvil */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            <Link to="/" className="mobile-menu-link" onClick={closeMobileMenu}>Home</Link>
            {isLoggedIn && (
              <>
                <Link to="/mis-marcas" className="mobile-menu-link" onClick={closeMobileMenu}>Mis marcas</Link>
                <Link to="/similitudes" className="mobile-menu-link" onClick={closeMobileMenu}>Similitudes</Link>
                <Link to="/buscador" className="mobile-menu-link" onClick={closeMobileMenu}>Buscador</Link>
              </>
            )}
            {!isLoggedIn ? (
              <Link to="/login" className="mobile-menu-link" onClick={closeMobileMenu}>Login</Link>
            ) : (
              <button className="mobile-menu-link" onClick={handleSignOut}>Sign Out</button>
            )}
          </div>
        </div>

        {/* Overlay para cerrar el menú al hacer clic fuera */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


