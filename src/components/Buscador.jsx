import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import config from "../config"; // NUEVO import
import "./Buscador.css";

export default function Buscador({
  agregarMarca,
  marcasSeguidas,
  usuarioActual,
  setUsuarioActual,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [tipoBusqueda, setTipoBusqueda] = useState("nombre");
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(null);
  const [error, setError] = useState("");
  
  // Estado para ordenamiento
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const handleBuscar = async () => {
    if (!busqueda.trim()) return;

    setCargando(true);
    setError("");

    try {
      const response = await fetch(
        `${config.API_BASE_URL}/api/marcas/buscar?${tipoBusqueda}=${encodeURIComponent(
          busqueda
        )}`
      ); // CAMBIO AQUÍ

      if (response.ok) {
        const data = await response.json();
        setResultados(data);
      } else {
        setError("Error en la búsqueda");
        setResultados([]);
      }
    } catch (error) {
      setError("Error de conexión");
      setResultados([]);
    } finally {
      setCargando(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleBuscar();
    }
  };

  const handleVerDetalle = async (marca) => {
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/api/marcas/${marca.expediente}`
      ); // CAMBIO AQUÍ
      if (response.ok) {
        const marcaDetalle = await response.json();
        setDetalleAbierto(marcaDetalle);
      }
    } catch (error) {
      console.error("Error al obtener detalles de la marca:", error);
    }
  };

  const handleAgregarMarca = async (marca) => {
    if (!usuarioActual) {
      console.log("No hay usuario actual");
      return;
    }

    console.log("Agregando marca:", marca.id, "Usuario actual:", usuarioActual);
    console.log("Marcas actuales del usuario:", usuarioActual.misMarcas);

    try {
      const response = await fetch(
        `${config.API_BASE_URL}/api/usuarios/${usuarioActual.username}/marcas`,
        { // CAMBIO AQUÍ
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ marcaId: marca.id }),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        console.log("Usuario actualizado:", updatedUser);
        setUsuarioActual(updatedUser);
        agregarMarca(marca.expediente);
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
      }
    } catch (error) {
      console.error("Error al seguir marca:", error);
    }
  };

  const closeDetalle = () => {
    setDetalleAbierto(null);
  };

  // Función para manejar el ordenamiento
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Función para ordenar los resultados
  const getSortedResults = () => {
    if (!sortConfig.key) return resultados;

    return [...resultados].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Manejar valores null/undefined
      if (aValue === null || aValue === undefined) aValue = "";
      if (bValue === null || bValue === undefined) bValue = "";

      // Convertir a string para comparación
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  // Función para obtener el icono de ordenamiento
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return "↕️"; // Icono neutral
    }
    return sortConfig.direction === 'asc' ? "▲" : "▼";
  };

  return (
    <div className="buscador-container">
      <div className="buscador-header">
        <h2>Buscar Marcas</h2>
        <div className="buscador-controls">
          <select
            value={tipoBusqueda}
            onChange={(e) => setTipoBusqueda(e.target.value)}
            className="buscador-select"
          >
            <option value="nombre">Por Nombre</option>
            <option value="expediente">Por Expediente</option>
            <option value="titular">Por Titular</option>
          </select>
          <input
            type="text"
            placeholder={`Buscar ${tipoBusqueda}...`}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyPress={handleKeyPress}
            className="buscador-input"
          />
          <button
            onClick={handleBuscar}
            disabled={cargando}
            className="buscador-button"
          >
            {cargando ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </div>

      {error && <div className="buscador-error">{error}</div>}

      <div className="buscador-results">
        {resultados.length > 0 && (
          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('nombre')} className="sortable-header">
                    Nombre <span className="sort-icon">{getSortIcon('nombre')}</span>
                  </th>
                  <th onClick={() => handleSort('expediente')} className="sortable-header">
                    Expediente <span className="sort-icon">{getSortIcon('expediente')}</span>
                  </th>
                  <th onClick={() => handleSort('clase')} className="sortable-header">
                    Clase <span className="sort-icon">{getSortIcon('clase')}</span>
                  </th>
                  <th onClick={() => handleSort('nombrePropietario')} className="sortable-header">
                    Titular <span className="sort-icon">{getSortIcon('nombrePropietario')}</span>
                  </th>
                  <th className="action-header">Acción</th>
                </tr>
              </thead>
              <tbody>
                {getSortedResults().map((marca) => (
                  <tr key={marca.id} className="result-row">
                    <td 
                      onClick={() => handleVerDetalle(marca)}
                      className="nombre-cell clickable"
                    >
                      {marca.nombre}
                    </td>
                    <td className="expediente-cell">
                      {marca.expediente}
                    </td>
                    <td className="clase-cell">
                      {marca.clase || "N/A"}
                    </td>
                    <td className="titular-cell">
                      {marca.nombrePropietario || "N/A"}
                    </td>
                    <td className="action-cell">
                      <button
                        onClick={() => handleAgregarMarca(marca)}
                        disabled={usuarioActual?.misMarcas?.includes(marca.id)}
                        className={`seguir-button-table ${
                          usuarioActual?.misMarcas?.includes(marca.id) ? "seguido" : ""
                        }`}
                      >
                        {usuarioActual?.misMarcas?.includes(marca.id)
                          ? "Siguiendo"
                          : "Seguir"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detalleAbierto && (
        <div className="marca-detalle-overlay">
          <div className="marca-detalle">
            <button onClick={closeDetalle} className="cerrar-detalle">
              ×
            </button>
            <h3>{detalleAbierto.nombre}</h3>
            <div className="detalle-content">
              <p>
                <strong>Expediente:</strong> {detalleAbierto.expediente}
              </p>
              <p>
                <strong>Clase:</strong> {detalleAbierto.clase || "N/A"}
              </p>
              <p>
                <strong>Titular:</strong> {detalleAbierto.nombrePropietario || "N/A"}
              </p>
              <p>
                <strong>Estado:</strong> {detalleAbierto.estado || "N/A"}
              </p>
              <p>
                <strong>Fecha de Presentación:</strong>{" "}
                {detalleAbierto.fechaPresentacion || "N/A"}
              </p>
              <p>
                <strong>Fecha de Vencimiento:</strong>{" "}
                {detalleAbierto.fechaVencimiento || "N/A"}
              </p>
              {detalleAbierto.observaciones && (
                <p>
                  <strong>Observaciones:</strong> {detalleAbierto.observaciones}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}