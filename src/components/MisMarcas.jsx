import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import config from "../config";
import "./MisMarcas.css";

export default function MisMarcas({ usuarioActual }) {
  const [marcas, setMarcas] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    // DEBUG: Imprime la info del usuario loggeado desde la base de datos
    if (usuarioActual && usuarioActual.username) {
      fetch(`${config.API_BASE_URL}/api/usuarios/${usuarioActual.username}`)  // CAMBIO AQUÍ
        .then(res => res.json())
        .then(data => {
          console.log("Usuario loggeado desde la base de datos:", data);
        })
        .catch(() => {
          console.log("No se pudo obtener el usuario desde la base de datos");
        });
    }
    else {
      console.log("No hay usuario loggeado");
    }

    if (!usuarioActual || !usuarioActual.misMarcas || usuarioActual.misMarcas.length === 0) {
      setMarcas([]);
      return;
    }

    // Cambiar URL para marcas
    fetch(`${config.API_BASE_URL}/api/marcas`)  // CAMBIO AQUÍ
      .then(res => res.json())
      .then(data => {
        // Filtra solo las marcas cuyos IDs están en misMarcas
        const marcasUsuario = data.filter(marca =>
          usuarioActual.misMarcas.includes(marca.id)
        );
        setMarcas(marcasUsuario);
      })
      .catch(() => setMarcas([]));
  }, [usuarioActual]);

  const toggleMenu = (id) => {
    setOpenMenuId(prev => (prev === id ? null : id));
  };

  return (
    <div className="mis-marcas-container">
      <h2>Mis Marcas</h2>
      {marcas.length === 0 ? (
        <p>No tienes marcas agregadas.</p>
      ) : (
        <div className="mis-marcas-table-container">
          <table className="mis-marcas-table">
            <thead className="mis-marcas-table-header">
              <tr>
                <th className="mis-marcas-table-th">
                  <span className="mis-marcas-header-text">
                    <strong>Nombre</strong> / <em>Expediente</em>
                  </span>
                </th>
                <th className="mis-marcas-table-th">Clase</th>
                <th className="mis-marcas-table-th">Titular</th>
                <th className="mis-marcas-table-th">⋮</th>
              </tr>
            </thead>
            <tbody>
              {marcas.map(marca => (
                <tr key={marca.id} className="mis-marcas-table-row">
                  <td className="mis-marcas-table-td">
                    <div className="mis-marcas-name-expediente">
                      <strong>{marca.nombre}</strong> / 
                      <Link className="mis-marcas-table-link" to={`/marca/${marca.expediente}`}>
                        <em>{marca.expediente}</em>
                      </Link>
                    </div>
                  </td>
                  <td className="mis-marcas-table-td">{marca.clase || "-"}</td>
                  <td className="mis-marcas-table-td">{marca.nombrePropietario || "-"}</td>
                  <td className="mis-marcas-table-td mis-marcas-actions-cell">
                    <div className="mis-marcas-actions-wrapper">
                      <button
                        type="button"
                        className="mis-marcas-actions-btn"
                        onClick={() => toggleMenu(marca.id)}
                      >
                        ⋮
                      </button>
                      {openMenuId === marca.id && (
                        <div className="mis-marcas-actions-menu">
                          <button className="mis-marcas-actions-item" type="button">
                            Accion 1
                          </button>
                          <button className="mis-marcas-actions-item" type="button">
                            Accion 2
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}