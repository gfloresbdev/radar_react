import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import config from "../config"; // NUEVO import
import "./Marca.css";

export default function Marca() {
  const { expediente } = useParams();
  const [marca, setMarca] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMarca = async () => {
      try {
        const response = await fetch(
          `${config.API_BASE_URL}/api/marcas/${expediente}` // CAMBIO AQUÍ
        );

        if (response.ok) {
          const data = await response.json();
          setMarca(data);
        } else {
          setError("Marca no encontrada");
        }
      } catch (error) {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    if (expediente) {
      fetchMarca();
    }
  }, [expediente]);

  if (loading) {
    return <div className="marca-loading">Cargando marca...</div>;
  }

  if (error) {
    return <div className="marca-error">{error}</div>;
  }

  if (!marca) {
    return <div className="marca-error">Marca no encontrada</div>;
  }

  if(true) console.log(marca);

  return (
    <div className="marca-container">
      <div className="marca-header">
        <h1>{marca.nombre}</h1>
        <span className="marca-expediente">
          Expediente: {marca.expediente}
        </span>
      </div>

      <div className="marca-details">
        <div className="marca-section">
          <h3>Información General</h3>
          <div className="marca-info-grid">
            <div className="marca-info-item">
              <strong>Clase:</strong>
              <span>{marca.clase || "N/A"}</span>
            </div>
            <div className="marca-info-item">
              <strong>Estado:</strong>
              <span>{marca.estado || "N/A"}</span>
            </div>
            <div className="marca-info-item">
              <strong>Titular:</strong>
              <span>{marca.nombrePropietario || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="marca-section">
          <h3>Fechas</h3>
          <div className="marca-info-grid">
            <div className="marca-info-item">
              <strong>Fecha de Presentación:</strong>
              <span>{marca.fechaPresentacion || "N/A"}</span>
            </div>
            <div className="marca-info-item">
              <strong>Fecha de Vencimiento:</strong>
              <span>{marca.fechaVencimiento || "N/A"}</span>
            </div>
          </div>
        </div>

        {marca.observaciones && (
          <div className="marca-section">
            <h3>Observaciones</h3>
            <p>{marca.observaciones}</p>
          </div>
        )}
      </div>
    </div>
  );
}