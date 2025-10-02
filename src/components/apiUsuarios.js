import config from "../config";  // NUEVO import

const STORAGE_KEY = "usuariosDB";
const API_URL = "http://localhost:5000/api/usuarios"; // Cambia el puerto si usas otro

// Carga usuarios desde localStorage o usa los iniciales
function loadUsuarios() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);
  return [
    { id: 1, username: "admin", email: "admin@mail.com", password: "admin" },
    { id: 2, username: "user1", email: "user1@mail.com", password: "pass1" },
    { id: 3, username: "user2", email: "user2@mail.com", password: "pass2" },
  ];
}

// Guarda usuarios en localStorage
function saveUsuarios(usuarios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

// Simula delay de red
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// CRUD API
export async function getUsuarios() {
  await delay(300);
  return [...loadUsuarios()];
}

export async function getUsuarioByUsername(username) {
  await delay(200);
  const usuarios = loadUsuarios();
  return usuarios.find(u => u.username === username) || null;
}

// Función para obtener un usuario por username
export const obtenerUsuario = async (username) => {
  try {
    const response = await fetch(`${config.API_BASE_URL}/api/usuarios/${username}`);  // CAMBIO AQUÍ
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Usuario no encontrado');
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

// Función para crear un nuevo usuario
export const crearUsuario = async (userData) => {
  try {
    const response = await fetch(`${config.API_BASE_URL}/api/usuarios/register`, {  // CAMBIO AQUÍ
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Error al crear usuario');
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

// Función para login
export const loginUsuario = async (username, password) => {
  try {
    const response = await fetch(`${config.API_BASE_URL}/api/usuarios/login`, {  // CAMBIO AQUÍ
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Credenciales incorrectas');
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

// Función para agregar marca a usuario
export const agregarMarcaAUsuario = async (username, marcaId) => {
  try {
    const response = await fetch(`${config.API_BASE_URL}/api/usuarios/${username}/marcas`, {  // CAMBIO AQUÍ
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ marcaId }),
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Error al agregar marca');
  } catch (error) {
    console.error('Error al agregar marca:', error);
    throw error;
  }
};