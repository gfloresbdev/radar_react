# main.py
from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import sqlite3
import json
from pathlib import Path
from mangum import Mangum
import sys
import os

# Agregar el directorio actual al path de Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Ahora importar database
import database

# Rutas de las bases de datos
MARCA_DB_PATH = Path("marcas.db")
USUARIO_DB_PATH = Path("usuarios.db")

# Inicializa ambas tablas
# database.init_db()

app = FastAPI(title="POC Marcas")

# CORS para producción y desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, cambia por tu dominio de Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NO incluir app.mount("/static", ...) en Vercel
# Vercel maneja los archivos estáticos automáticamente


# Dependency: abrir/cerrar conexión por request
def get_marca_conn():
    conn = database.get_marca_connection()
    try:
        yield conn
    finally:
        conn.close()

def get_usuario_conn():
    conn = database.get_usuario_connection()
    try:
        yield conn
    finally:
        conn.close()

# Modelos Pydantic
class MarcaCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    expediente: str = Field(..., min_length=1, max_length=100)

class MarcaOut(BaseModel):
    id: int
    nombre: str
    expediente: int
    clase: str = ""
    descripcion: str = ""
    fechaSolicitud: str = ""
    nombrePropietario: str = ""
    estado: str = ""
    created_at: str = ""

class UsuarioCreate(BaseModel):
    username: str
    password: str
    misMarcas: Optional[List[int]] = []

class UsuarioOut(BaseModel):
    id: int
    username: str
    misMarcas: Optional[List[int]] = []

class UsuarioLogin(BaseModel):
    username: str
    password: str

# --- MARCAS ENDPOINTS ---
@app.post("/marcas", response_model=MarcaOut, status_code=201)
def crear_marca(data: MarcaCreate, conn: sqlite3.Connection = Depends(get_marca_conn)):
    nuevo_id = database.create_marca(conn, data.nombre.strip(), data.expediente.strip())
    marca = database.get_marca(conn, nuevo_id)
    return marca

@app.get("/marcas", response_model=List[MarcaOut])
def listar_marcas(conn: sqlite3.Connection = Depends(get_marca_conn)):
    return database.list_marcas(conn)

@app.get("/marcas/{marca_id}", response_model=MarcaOut)
def obtener_marca(marca_id: int, conn: sqlite3.Connection = Depends(get_marca_conn)):
    marca = database.get_marca(conn, marca_id)
    if not marca:
        raise HTTPException(status_code=404, detail="Marca no encontrada")
    return marca

@app.put("/marcas/{marca_id}", response_model=MarcaOut)
def actualizar_marca(marca_id: int, data: MarcaCreate, conn: sqlite3.Connection = Depends(get_marca_conn)):
    updated = database.update_marca(conn, marca_id, data.nombre.strip(), data.expediente.strip())
    if not updated:
        raise HTTPException(status_code=404, detail="Marca no encontrada")
    return database.get_marca(conn, marca_id)

@app.delete("/marcas/{marca_id}", status_code=204)
def eliminar_marca(marca_id: int, conn: sqlite3.Connection = Depends(get_marca_conn)):
    deleted = database.delete_marca(conn, marca_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Marca no encontrada")
    return

# --- USUARIOS ENDPOINTS ---
@app.post("/api/usuarios", response_model=UsuarioOut)
def crear_usuario(data: UsuarioCreate, conn: sqlite3.Connection = Depends(get_usuario_conn)):
    mis_marcas_json = json.dumps(data.misMarcas or [])
    user_id = database.add_user(conn, data.username, data.password, mis_marcas_json)
    return {"id": user_id, "username": data.username, "misMarcas": data.misMarcas or []}

@app.get("/api/usuarios/{username}", response_model=UsuarioOut)
def consultar_usuario(username: str, conn: sqlite3.Connection = Depends(get_usuario_conn)):
    user = database.get_user(conn, username)
    if user:
        mis_marcas = json.loads(user[3]) if user[3] else []
        return {"id": user[0], "username": user[1], "misMarcas": mis_marcas}
    else:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

@app.post("/api/usuarios/login")
def login_usuario(data: UsuarioLogin = Body(...), conn: sqlite3.Connection = Depends(get_usuario_conn)):
    try:
        print(f"Intentando login para usuario: {data.username}")
        user = database.get_user(conn, data.username)
        print(f"Usuario encontrado: {user is not None}")
        
        if user and user[2] == data.password:
            mis_marcas = json.loads(user[3]) if user[3] else []
            return {"id": user[0], "username": user[1], "misMarcas": mis_marcas}
        else:
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    except Exception as e:
        print(f"Error en login: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/usuarios/{username}/misMarcas")
def actualizar_mis_marcas(username: str, misMarcas: List[int], conn: sqlite3.Connection = Depends(get_usuario_conn)):
    mis_marcas_json = json.dumps(misMarcas)
    cursor = conn.cursor()
    cursor.execute("UPDATE usuarios SET misMarcas = ? WHERE username = ?", (mis_marcas_json, username))
    conn.commit()
    return {"success": True}

@app.post("/api/usuarios/register")
def registrar_usuario(data: UsuarioCreate, conn: sqlite3.Connection = Depends(get_usuario_conn)):
    try:
        # Verificar si el usuario ya existe
        existing_user = database.get_user(conn, data.username)
        if existing_user:
            raise HTTPException(status_code=400, detail="El usuario ya existe")
        
        mis_marcas_json = json.dumps(data.misMarcas or [])
        user_id = database.add_user(conn, data.username, data.password, mis_marcas_json)
        return {"id": user_id, "username": data.username, "misMarcas": data.misMarcas or []}
    except Exception as e:
        print(f"Error en register: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# IMPORTANTE: Agregar esta función al final
handler = Mangum(app)
