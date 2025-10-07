# main.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import sys
import os

# Agregar el directorio actual al path de Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Ahora importar database
import database

app = Flask(__name__)
CORS(app)

@app.route('/api/usuarios/login', methods=['POST'])
def login_usuario():
    try:
        data = request.get_json()
        conn = database.get_usuario_connection()
        user = database.get_user(conn, data["username"])
        conn.close()
        
        if user and user[2] == data["password"]:
            mis_marcas = json.loads(user[3]) if user[3] else []
            return jsonify({"id": user[0], "username": user[1], "misMarcas": mis_marcas})
        else:
            return jsonify({"error": "Credenciales incorrectas"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/usuarios/register', methods=['POST'])
def registrar_usuario():
    try:
        data = request.get_json()
        conn = database.get_usuario_connection()
        
        # Verificar si el usuario ya existe
        existing_user = database.get_user(conn, data["username"])
        if existing_user:
            conn.close()
            return jsonify({"error": "El usuario ya existe"}), 400
        
        mis_marcas_json = json.dumps(data.get("misMarcas", []))
        user_id = database.add_user(conn, data["username"], data["password"], mis_marcas_json)
        conn.close()
        
        return jsonify({"id": user_id, "username": data["username"], "misMarcas": data.get("misMarcas", [])})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/marcas', methods=['GET'])
def listar_marcas():
    try:
        conn = database.get_marca_connection()
        marcas = database.list_marcas(conn)
        conn.close()
        return jsonify(marcas)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Para Vercel con Flask
if __name__ == '__main__':
    app.run(debug=True)
