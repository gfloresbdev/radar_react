import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, onSignOut, devLoggedIn, setDevLoggedIn }) => {
  return (
    <nav className="navbar">
      <div className="navbar-links">
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
      
    </nav>
  );
};

export default Navbar;


