# main.py
from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import sqlite3
import json
import sys
import os

# Agregar el directorio actual al path de Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Ahora importar database
import database

app = FastAPI(title="POC Marcas")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    expediente: str
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

# --- ENDPOINTS ---
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

# Resto de endpoints...
@app.get("/marcas")
def listar_marcas(conn: sqlite3.Connection = Depends(get_marca_conn)):
    return database.list_marcas(conn)

# Para Vercel - usar versiones compatibles
from mangum import Mangum
handler = Mangum(app)
