import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import config from "../config";  // NUEVO import
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
    fetch(`${config.API_BASE_URL}/marcas`)  // CAMBIO AQUÍ
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
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 border-b">Nombre</th>
                <th className="text-left p-2 border-b">Expediente</th>
                <th className="text-left p-2 border-b">Clase</th>
                <th className="text-left p-2 border-b">Titula</th>
                <th className="text-left p-2 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {marcas.map(marca => (
                <tr key={marca.id} className="hover:bg-gray-50">
                  <td className="p-2 border-b">{marca.nombre}</td>
                  <td className="p-2 border-b">
                    <Link className="text-blue-600 hover:underline" to={`/marca/${marca.expediente}`}>
                      {marca.expediente}
                    </Link>
                  </td>
                  <td className="p-2 border-b">{marca.clase || "-"}</td>
                  <td className="p-2 border-b">{marca.nombrePropietario || "-"}</td>
                  <td className="p-2 border-b mis-marcas-actions-cell">
                    <div className="mis-marcas-actions-wrapper">
                      <button
                        type="button"
                        className="mis-marcas-actions-btn"
                        onClick={() => toggleMenu(marca.id)}
                      >
                        Acciones
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