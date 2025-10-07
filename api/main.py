# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json
import sys
import os

# Agregar el directorio actual al path de Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Ahora importar database
import database

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/usuarios/login")
async def login_usuario(data: dict):
    try:
        conn = database.get_usuario_connection()
        user = database.get_user(conn, data["username"])
        conn.close()
        
        if user and user[2] == data["password"]:
            mis_marcas = json.loads(user[3]) if user[3] else []
            return {"id": user[0], "username": user[1], "misMarcas": mis_marcas}
        else:
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/usuarios/register")
async def registrar_usuario(data: dict):
    try:
        conn = database.get_usuario_connection()
        
        # Verificar si el usuario ya existe
        existing_user = database.get_user(conn, data["username"])
        if existing_user:
            conn.close()
            raise HTTPException(status_code=400, detail="El usuario ya existe")
        
        mis_marcas_json = json.dumps(data.get("misMarcas", []))
        user_id = database.add_user(conn, data["username"], data["password"], mis_marcas_json)
        conn.close()
        
        return {"id": user_id, "username": data["username"], "misMarcas": data.get("misMarcas", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/marcas")
async def listar_marcas():
    try:
        conn = database.get_marca_connection()
        marcas = database.list_marcas(conn)
        conn.close()
        return marcas
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Para Vercel
from mangum import Mangum
handler = Mangum(app)
