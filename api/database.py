# database.py
from pathlib import Path
from datetime import datetime
import sqlite3
import psycopg2
import os
import json

def get_connection():
    return psycopg2.connect(
        host=os.environ.get('POSTGRES_HOST'),
        database=os.environ.get('POSTGRES_DATABASE'),
        user=os.environ.get('POSTGRES_USER'),
        password=os.environ.get('POSTGRES_PASSWORD'),
        port=os.environ.get('POSTGRES_PORT', '5432'),
        sslmode='require'
    )

def init_tables():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            mis_marcas JSONB DEFAULT '[]'
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS marcas (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            expediente VARCHAR(100) NOT NULL,
            clase VARCHAR(100) DEFAULT '',
            descripcion TEXT DEFAULT '',
            fecha_solicitud VARCHAR(100) DEFAULT '',
            nombre_propietario VARCHAR(200) DEFAULT '',
            estado VARCHAR(100) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_user(username):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE username = %s", (username,))
    user = cursor.fetchone()
    conn.close()
    return user

def add_user(username, password, mis_marcas_json):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO usuarios (username, password, mis_marcas) VALUES (%s, %s, %s) RETURNING id",
        (username, password, mis_marcas_json)
    )
    user_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()
    return user_id

def list_marcas():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM marcas ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": row[0],
            "nombre": row[1],
            "expediente": row[2],
            "clase": row[3] or "",
            "descripcion": row[4] or "",
            "fechaSolicitud": row[5] or "",
            "nombrePropietario": row[6] or "",
            "estado": row[7] or "",
            "created_at": str(row[8]) if row[8] else ""
        }
        for row in rows
    ]

def create_marca(nombre, expediente):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO marcas (nombre, expediente) VALUES (%s, %s) RETURNING id",
        (nombre, expediente)
    )
    marca_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()
    return marca_id
