# database.py
from pathlib import Path
from datetime import datetime
import sqlite3
import psycopg2
import os
import json

def get_connection():
    # Usar variables con prefijo STORAGE_POSTGRES_
    host = os.environ.get('STORAGE_POSTGRES_HOST')
    database = os.environ.get('STORAGE_POSTGRES_DATABASE') 
    user = os.environ.get('STORAGE_POSTGRES_USER')
    password = os.environ.get('STORAGE_POSTGRES_PASSWORD')
    port = os.environ.get('STORAGE_POSTGRES_PORT', '5432')
    
    print(f"Conectando a: host={host}, db={database}, user={user}, port={port}")
    
    if not host or not database or not user or not password:
        raise Exception("Variables de entorno de PostgreSQL no configuradas")
    
    return psycopg2.connect(
        host=host,
        database=database,
        user=user,
        password=password,
        port=port,
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
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS similitudes_marcas (
            id SERIAL PRIMARY KEY,
            marca_seguida_id INTEGER NOT NULL,
            marca_similar_id INTEGER NOT NULL,
            porcentaje_similitud DECIMAL(5,2) NOT NULL,
            fecha_deteccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            activa BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (marca_seguida_id) REFERENCES marcas(id),
            FOREIGN KEY (marca_similar_id) REFERENCES marcas(id),
            UNIQUE(marca_seguida_id, marca_similar_id)
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

def create_marca(nombre, expediente, clase='', descripcion='', fecha_solicitud='', nombre_propietario='', estado=''):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO marcas (nombre, expediente, clase, descripcion, fecha_solicitud, nombre_propietario, estado) 
           VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
        (nombre, expediente, clase, descripcion, fecha_solicitud, nombre_propietario, estado)
    )
    marca_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()
    return marca_id

def agregar_marca_a_usuario(username, marca_id):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Obtener las marcas actuales del usuario
    cursor.execute("SELECT mis_marcas FROM usuarios WHERE username = %s", (username,))
    result = cursor.fetchone()
    
    if not result:
        conn.close()
        return None
    
    # Parsear las marcas actuales (puede ser None o una lista)
    marcas_actuales = result[0] if result[0] else []
    
    # Agregar la nueva marca si no está ya presente
    if marca_id not in marcas_actuales:
        marcas_actuales.append(marca_id)
        
        # Actualizar en la base de datos
        cursor.execute(
            "UPDATE usuarios SET mis_marcas = %s WHERE username = %s",
            (json.dumps(marcas_actuales), username)
        )
        conn.commit()
    
    # Obtener el usuario actualizado
    cursor.execute("SELECT * FROM usuarios WHERE username = %s", (username,))
    user = cursor.fetchone()
    conn.close()
    
    return user

def remover_marca_de_usuario(username, marca_id):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Obtener las marcas actuales del usuario
    cursor.execute("SELECT mis_marcas FROM usuarios WHERE username = %s", (username,))
    result = cursor.fetchone()
    
    if not result:
        conn.close()
        return None
    
    # Parsear las marcas actuales (puede ser None o una lista)
    marcas_actuales = result[0] if result[0] else []
    
    # Remover la marca si está presente
    if marca_id in marcas_actuales:
        marcas_actuales.remove(marca_id)
        
        # Actualizar en la base de datos
        cursor.execute(
            "UPDATE usuarios SET mis_marcas = %s WHERE username = %s",
            (json.dumps(marcas_actuales), username)
        )
        conn.commit()
    
    # Obtener el usuario actualizado
    cursor.execute("SELECT * FROM usuarios WHERE username = %s", (username,))
    user = cursor.fetchone()
    conn.close()
    
    return user

# ===============================
# FUNCIONES PARA SIMILITUDES
# ===============================

def crear_similitud(marca_seguida_id, marca_similar_id, porcentaje_similitud):
    """Crear o actualizar una similitud entre dos marcas"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO similitudes_marcas (marca_seguida_id, marca_similar_id, porcentaje_similitud)
            VALUES (%s, %s, %s)
            ON CONFLICT (marca_seguida_id, marca_similar_id)
            DO UPDATE SET 
                porcentaje_similitud = %s,
                fecha_deteccion = CURRENT_TIMESTAMP,
                activa = TRUE
            RETURNING id
        ''', (marca_seguida_id, marca_similar_id, porcentaje_similitud, porcentaje_similitud))
        
        similitud_id = cursor.fetchone()[0]
        conn.commit()
        return similitud_id
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def obtener_similitudes_usuario(username, porcentaje_minimo=0.0):
    """Obtener todas las similitudes de las marcas que sigue un usuario"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT 
                ms.id as similitud_id,
                ms.porcentaje_similitud,
                ms.fecha_deteccion,
                m1.id as marca_seguida_id,
                m1.nombre as marca_seguida_nombre,
                m1.expediente as marca_seguida_expediente,
                m1.clase as marca_seguida_clase,
                m2.id as marca_similar_id,
                m2.nombre as marca_similar_nombre,
                m2.expediente as marca_similar_expediente,
                m2.clase as marca_similar_clase,
                m2.nombre_propietario as marca_similar_propietario
            FROM similitudes_marcas ms
            INNER JOIN marcas m1 ON ms.marca_seguida_id = m1.id
            INNER JOIN marcas m2 ON ms.marca_similar_id = m2.id
            INNER JOIN usuarios u ON u.username = %s
            WHERE ms.activa = TRUE
                AND ms.porcentaje_similitud >= %s
                AND m1.id = ANY(
                    SELECT jsonb_array_elements_text(u.mis_marcas)::integer
                )
            ORDER BY m1.nombre, ms.porcentaje_similitud DESC
        ''', (username, porcentaje_minimo))
        
        rows = cursor.fetchall()
        
        # Agrupar resultados por marca seguida
        similitudes_agrupadas = {}
        
        for row in rows:
            marca_seguida_id = row[3]
            
            if marca_seguida_id not in similitudes_agrupadas:
                similitudes_agrupadas[marca_seguida_id] = {
                    "marca_seguida": {
                        "id": row[3],
                        "nombre": row[4],
                        "expediente": row[5],
                        "clase": row[6] or ""
                    },
                    "similitudes": []
                }
            
            similitudes_agrupadas[marca_seguida_id]["similitudes"].append({
                "id": row[0],
                "porcentaje": float(row[1]),
                "fecha_deteccion": str(row[2]),
                "marca_similar": {
                    "id": row[7],
                    "nombre": row[8],
                    "expediente": row[9],
                    "clase": row[10] or "",
                    "propietario": row[11] or ""
                }
            })
        
        return list(similitudes_agrupadas.values())
        
    except Exception as e:
        raise e
    finally:
        conn.close()

def desactivar_similitud(similitud_id):
    """Desactivar una similitud específica"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "UPDATE similitudes_marcas SET activa = FALSE WHERE id = %s",
            (similitud_id,)
        )
        conn.commit()
        return cursor.rowcount > 0
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def calcular_similitud_marcas(marca1_id, marca2_id):
    """Calcular similitud básica entre dos marcas basada en nombre y clase"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT nombre, clase, descripcion FROM marcas WHERE id IN (%s, %s)", (marca1_id, marca2_id))
        marcas = cursor.fetchall()
        
        if len(marcas) != 2:
            return 0.0
            
        marca1 = marcas[0]
        marca2 = marcas[1]
        
        # Algoritmo simple de similitud
        similitud_total = 0.0
        peso_nombre = 0.6
        peso_clase = 0.3
        peso_descripcion = 0.1
        
        # Similitud de nombres (usando longitud de subcadena común)
        nombre1 = marca1[0].lower() if marca1[0] else ""
        nombre2 = marca2[0].lower() if marca2[0] else ""
        
        if nombre1 and nombre2:
            similitud_nombre = len(set(nombre1.split()) & set(nombre2.split())) / max(len(nombre1.split()), len(nombre2.split()))
            similitud_total += similitud_nombre * peso_nombre
        
        # Similitud de clase (exacta)
        clase1 = marca1[1] if marca1[1] else ""
        clase2 = marca2[1] if marca2[1] else ""
        
        if clase1 == clase2 and clase1:
            similitud_total += peso_clase
        
        # Similitud de descripción (palabras en común)
        desc1 = marca1[2].lower() if marca1[2] else ""
        desc2 = marca2[2].lower() if marca2[2] else ""
        
        if desc1 and desc2:
            palabras1 = set(desc1.split())
            palabras2 = set(desc2.split())
            if palabras1 and palabras2:
                similitud_desc = len(palabras1 & palabras2) / len(palabras1 | palabras2)
                similitud_total += similitud_desc * peso_descripcion
        
        return round(similitud_total * 100, 2)
        
    except Exception as e:
        raise e
    finally:
        conn.close()
