import React, { useState, useEffect } from "react";
import config from "../config"; // NUEVO import

export default function Similitudes() {
  const [similitudes, setSimilitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilitudes = async () => {
      try {
        const response = await fetch(
          `${config.API_BASE_URL}/api/similitudes`
        ); // CAMBIO AQUÍ
        if (response.ok) {
          const data = await response.json();
          setSimilitudes(data);
        }
      } catch (error) {
        console.error("Error al obtener similitudes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilitudes();
  }, []);

  if (loading) {
    return <div>Cargando similitudes...</div>;
  }

  return (
    <div>
      <h2>Similitudes entre Marcas</h2>
      {similitudes.length === 0 ? (
        <p>No se encontraron similitudes.</p>
      ) : (
        <div>
          {similitudes.map((similitud, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                margin: "1rem 0",
              }}
            >
              <h3>Similitud encontrada</h3>
              <p>
                <strong>Marca 1:</strong> {similitud.marca1?.nombre} (Expediente:{" "}
                {similitud.marca1?.expediente})
              </p>
              <p>
                <strong>Marca 2:</strong> {similitud.marca2?.nombre} (Expediente:{" "}
                {similitud.marca2?.expediente})
              </p>
              <p>
                <strong>Porcentaje de similitud:</strong>{" "}
                {similitud.porcentaje || "N/A"}%
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}