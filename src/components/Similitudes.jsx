import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import config from "../config";
import "./Similitudes.css";

export default function Similitudes() {
  const [similitudesAgrupadas, setSimilitudesAgrupadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detectandoSimilitudes, setDetectandoSimilitudes] = useState(false);
  const [porcentajeMinimo, setPorcentajeMinimo] = useState(20);
  const [marcasExpandidas, setMarcasExpandidas] = useState(new Set());

  const usuarioActual = JSON.parse(localStorage.getItem('radarApp_usuarioActual') || '{}');

  useEffect(() => {
    if (usuarioActual.username) {
      fetchSimilitudes();
    } else {
      setLoading(false);
    }
  }, [porcentajeMinimo]);

  const fetchSimilitudes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.API_BASE_URL}/api/similitudes?username=${usuarioActual.username}&porcentaje_minimo=${porcentajeMinimo}`
      );
      if (response.ok) {
        const data = await response.json();
        setSimilitudesAgrupadas(data);
      }
    } catch (error) {
      console.error("Error al obtener similitudes:", error);
    } finally {
      setLoading(false);
    }
  };

  const detectarSimilitudes = async () => {
    try {
      setDetectandoSimilitudes(true);
      const response = await fetch(`${config.API_BASE_URL}/api/similitudes/detectar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: usuarioActual.username }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        // Recargar similitudes después de la detección
        await fetchSimilitudes();
      }
    } catch (error) {
      console.error("Error detectando similitudes:", error);
      alert("Error al detectar similitudes");
    } finally {
      setDetectandoSimilitudes(false);
    }
  };

  const eliminarSimilitud = async (similitudId) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/similitudes/${similitudId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recargar similitudes después de eliminar
        await fetchSimilitudes();
      }
    } catch (error) {
      console.error("Error eliminando similitud:", error);
    }
  };

  const toggleMarcaExpanded = (marcaId) => {
    const newExpanded = new Set(marcasExpandidas);
    if (newExpanded.has(marcaId)) {
      newExpanded.delete(marcaId);
    } else {
      newExpanded.add(marcaId);
    }
    setMarcasExpandidas(newExpanded);
  };

  const getSimilitudColor = (porcentaje) => {
    if (porcentaje >= 80) return 'similitud-alta';
    if (porcentaje >= 60) return 'similitud-media-alta';
    if (porcentaje >= 40) return 'similitud-media';
    return 'similitud-baja';
  };

  if (!usuarioActual.username) {
    return (
      <div className="similitudes-container">
        <h2>Similitudes entre Marcas</h2>
        <p>Debes iniciar sesión para ver las similitudes de tus marcas seguidas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="similitudes-container">
        <h2>Similitudes entre Marcas</h2>
        <div className="loading">Cargando similitudes...</div>
      </div>
    );
  }

  return (
    <div className="similitudes-container">
      <div className="similitudes-header">
        <h2>Similitudes de Tus Marcas</h2>
        
        <div className="similitudes-controls">
          <div className="filtro-porcentaje">
            <label htmlFor="porcentaje-minimo">Porcentaje mínimo:</label>
            <select 
              id="porcentaje-minimo"
              value={porcentajeMinimo} 
              onChange={(e) => setPorcentajeMinimo(Number(e.target.value))}
            >
              <option value={0}>0%</option>
              <option value={20}>20%</option>
              <option value={40}>40%</option>
              <option value={60}>60%</option>
              <option value={80}>80%</option>
            </select>
          </div>
          
          <button 
            className="btn-detectar"
            onClick={detectarSimilitudes}
            disabled={detectandoSimilitudes}
          >
            {detectandoSimilitudes ? 'Detectando...' : 'Detectar Nuevas Similitudes'}
          </button>
        </div>
      </div>

      {similitudesAgrupadas.length === 0 ? (
        <div className="no-similitudes">
          <p>No se encontraron similitudes con el porcentaje mínimo seleccionado.</p>
          <p>Intenta con un porcentaje menor o detecta nuevas similitudes.</p>
        </div>
      ) : (
        <div className="marcas-seguidas-container">
          <table className="marcas-seguidas-table">
            <thead>
              <tr>
                <th>Marca Seguida</th>
                <th>Expediente</th>
                <th>Clase</th>
                <th>Similitudes</th>
                <th>Expandir</th>
              </tr>
            </thead>
            <tbody>
              {similitudesAgrupadas.map((grupo) => (
                <React.Fragment key={grupo.marca_seguida.id}>
                  <tr className="marca-seguida-row">
                    <td>
                      <Link to={`/marca/${grupo.marca_seguida.expediente}`} className="marca-link">
                        {grupo.marca_seguida.nombre}
                      </Link>
                    </td>
                    <td>{grupo.marca_seguida.expediente}</td>
                    <td>{grupo.marca_seguida.clase || '-'}</td>
                    <td>
                      <span className="count-similitudes">
                        {grupo.similitudes.length} similitudes
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`btn-expandir ${marcasExpandidas.has(grupo.marca_seguida.id) ? 'expanded' : ''}`}
                        onClick={() => toggleMarcaExpanded(grupo.marca_seguida.id)}
                        title={marcasExpandidas.has(grupo.marca_seguida.id) ? 'Colapsar' : 'Expandir'}
                      >
                        {marcasExpandidas.has(grupo.marca_seguida.id) ? '▼' : '▶'}
                      </button>
                    </td>
                  </tr>
                  
                  {marcasExpandidas.has(grupo.marca_seguida.id) && (
                    <tr className="similitudes-expanded-row">
                      <td colSpan="5">
                        <div className="similitudes-details">
                          <table className="similitudes-table">
                            <thead>
                              <tr>
                                <th>Marca Similar</th>
                                <th>Expediente</th>
                                <th>Clase</th>
                                <th>Propietario</th>
                                <th>% Similitud</th>
                                <th>Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {grupo.similitudes.map((similitud) => (
                                <tr key={similitud.id} className="similitud-row">
                                  <td>
                                    <Link 
                                      to={`/marca/${similitud.marca_similar.expediente}`} 
                                      className="marca-similar-link"
                                    >
                                      {similitud.marca_similar.nombre}
                                    </Link>
                                  </td>
                                  <td>{similitud.marca_similar.expediente}</td>
                                  <td>{similitud.marca_similar.clase || '-'}</td>
                                  <td>{similitud.marca_similar.propietario || '-'}</td>
                                  <td>
                                    <span className={`porcentaje-badge ${getSimilitudColor(similitud.porcentaje)}`}>
                                      {similitud.porcentaje}%
                                    </span>
                                  </td>
                                  <td>
                                    <button 
                                      className="btn-eliminar"
                                      onClick={() => eliminarSimilitud(similitud.id)}
                                      title="Ocultar esta similitud"
                                    >
                                      ✕
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}