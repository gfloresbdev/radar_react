import React, { useState } from "react";
import "./DebugPanel.css";
import config from '../config';

const DebugPanel = ({ devLoggedIn, setDevLoggedIn }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    expediente: '',
    clase: '',
    descripcion: '',
    fechaSolicitud: '',
    nombrePropietario: '',
    estado: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setFormData({
      nombre: '',
      expediente: '',
      clase: '',
      descripcion: '',
      fechaSolicitud: '',
      nombrePropietario: '',
      estado: ''
    });
    setShowForm(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/marcas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Marca creada exitosamente');
        handleCancel(); // Limpiar formulario y cerrar
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'No se pudo crear la marca'}`);
      }
    } catch (error) {
      console.error('Error creando marca:', error);
      alert('Error de conexión al crear la marca');
    }
  };

  return (
    <div className="debug-panel">
      <div className="debug-panel-title">debug variables</div>
      <div className="debug-panel-item">
        <input
          type="checkbox"
          id="devLoggedIn"
          checked={devLoggedIn}
          onChange={e => setDevLoggedIn(e.target.checked)}
        />
        <label htmlFor="devLoggedIn">Set Log In</label>
      </div>
      
      <div className="debug-panel-item">
        <button 
          className="debug-create-button"
          onClick={() => setShowForm(!showForm)}
        >
          Crear Nueva Marca
        </button>
      </div>

      {showForm && (
        <div className="debug-form-container">
          <div className="debug-form">
            <h3>Nueva Marca</h3>
            
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Expediente *</label>
              <input
                type="text"
                name="expediente"
                value={formData.expediente}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Clase</label>
              <input
                type="text"
                name="clase"
                value={formData.clase}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Fecha de Solicitud</label>
              <input
                type="date"
                name="fechaSolicitud"
                value={formData.fechaSolicitud}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Nombre del Propietario</label>
              <input
                type="text"
                name="nombrePropietario"
                value={formData.nombrePropietario}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
              >
                <option value="">Seleccionar estado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobada">Aprobada</option>
                <option value="Rechazada">Rechazada</option>
                <option value="En Proceso">En Proceso</option>
              </select>
            </div>

            <div className="form-buttons">
              <button 
                className="cancel-button"
                onClick={handleCancel}
              >
                Cancelar
              </button>
              <button 
                className="save-button"
                onClick={handleSave}
                disabled={!formData.nombre || !formData.expediente}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;