# database.py
from pathlib import Path
from datetime import datetime
import sqlite3

MARCA_DB_PATH = Path("marcas.db")
USUARIO_DB_PATH = Path("usuarios.db")

def init_db():
    # Inicializa ambas tablas en sus archivos correspondientes
    conn_marca = sqlite3.connect(MARCA_DB_PATH)
    conn_usuario = sqlite3.connect(USUARIO_DB_PATH)
    try:
        conn_marca.execute("""
            CREATE TABLE IF NOT EXISTS marcas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                expediente INTEGER NOT NULL,
                clase TEXT,
                descripcion TEXT,
                fechaSolicitud TEXT,
                nombrePropietario TEXT,
                estado TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
        """)
        conn_marca.commit()
        conn_usuario.execute("""
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
        """)
        conn_usuario.commit()
    finally:
        conn_marca.close()
        conn_usuario.close()

def get_marca_connection():
    conn = sqlite3.connect("marcas.db", check_same_thread=False)  # ← Importante
    conn.row_factory = sqlite3.Row
    return conn

def get_usuario_connection():
    conn = sqlite3.connect("usuarios.db", check_same_thread=False)  # ← Importante
    conn.row_factory = sqlite3.Row
    return conn

# --- MARCAS CRUD ---
def create_marca(conn, nombre: str, expediente: str):
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO marcas (nombre, expediente, created_at) VALUES (?, ?, ?)",
        (nombre, expediente, datetime.utcnow().isoformat())
    )
    conn.commit()
    return cursor.lastrowid

def list_marcas(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM marcas")
    return [dict(row) for row in cursor.fetchall()]

def get_marca(conn, marca_id: int):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM marcas WHERE id = ?", (marca_id,))
    row = cursor.fetchone()
    return dict(row) if row else None

def update_marca(conn, marca_id: int, nombre: str, expediente: str):
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE marcas SET nombre = ?, expediente = ? WHERE id = ?",
        (nombre, expediente, marca_id)
    )
    conn.commit()
    return cursor.rowcount > 0

def delete_marca(conn, marca_id: int):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM marcas WHERE id = ?", (marca_id,))
    conn.commit()
    return cursor.rowcount > 0

# --- USUARIOS CRUD ---
def add_user(conn, username, password, misMarcas="[]"):
    cursor = conn.cursor()
    cursor.execute('INSERT INTO usuarios (username, password, misMarcas) VALUES (?, ?, ?)', (username, password, misMarcas))
    conn.commit()
    return cursor.lastrowid

def get_user(conn, username):
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, password, misMarcas FROM usuarios WHERE username = ?", (username,))
    return cursor.fetchone()

def migrate_add_misMarcas():
    conn = sqlite3.connect(USUARIO_DB_PATH)
    cursor = conn.cursor()
    # Intenta agregar la columna si no existe
    try:
        cursor.execute("ALTER TABLE usuarios ADD COLUMN misMarcas TEXT DEFAULT '[]'")
        conn.commit()
    except sqlite3.OperationalError:
        pass  # Ya existe
    conn.close()
