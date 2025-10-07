# database.py
from pathlib import Path
from datetime import datetime
import sqlite3

MARCA_DB_PATH = Path("marcas.db")
USUARIO_DB_PATH = Path("usuarios.db")

# Usar conexiones en memoria
def get_marca_connection():
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS marcas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            expediente TEXT NOT NULL,
            clase TEXT DEFAULT '',
            descripcion TEXT DEFAULT '',
            fechaSolicitud TEXT DEFAULT '',
            nombrePropietario TEXT DEFAULT '',
            estado TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    return conn

def get_usuario_connection():
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            misMarcas TEXT DEFAULT '[]'
        )
    ''')
    conn.commit()
    return conn

# Resto de funciones permanecen igual...
def add_user(conn, username, password, mis_marcas_json):
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO usuarios (username, password, misMarcas) VALUES (?, ?, ?)",
        (username, password, mis_marcas_json)
    )
    conn.commit()
    return cursor.lastrowid

def get_user(conn, username):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE username = ?", (username,))
    return cursor.fetchone()

def list_marcas(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM marcas")
    return cursor.fetchall()
