# main.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Limpiar cualquier importación previa
if 'database' in sys.modules:
    del sys.modules['database']

import database

app = Flask(__name__)
CORS(app)

# Inicializar tablas al inicio
try:
    database.init_tables()
    print("Tablas inicializadas correctamente")
except Exception as e:
    print(f"Error inicializando tablas: {e}")

@app.route('/api/usuarios/register', methods=['POST'])
def registrar_usuario():
    try:
        data = request.get_json()
        print(f"Datos recibidos para registro: {data}")
        print(f"Username a buscar: {data.get('username')}")
        
        # Verificar si el usuario ya existe
        existing_user = database.get_user(data["username"])
        print(f"Usuario existente encontrado: {existing_user}")
        
        if existing_user:
            return jsonify({"error": "El usuario ya existe"}), 400
        
        mis_marcas_json = json.dumps(data.get("misMarcas", []))
        user_id = database.add_user(data["username"], data["password"], mis_marcas_json)
        
        return jsonify({"id": user_id, "username": data["username"], "misMarcas": data.get("misMarcas", [])})
    except Exception as e:
        print(f"Error en register: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/usuarios/login', methods=['POST'])
def login_usuario():
    try:
        data = request.get_json()
        print(f"Intentando login para: {data.get('username')}")
        user = database.get_user(data["username"])
        
        if user and user[2] == data["password"]:
            mis_marcas = user[3] if user[3] else []
            return jsonify({"id": user[0], "username": user[1], "misMarcas": mis_marcas})
        else:
            return jsonify({"error": "Credenciales incorrectas"}), 401
    except Exception as e:
        print(f"Error en login: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/marcas', methods=['GET'])
def listar_marcas():
    try:
        marcas = database.list_marcas()
        return jsonify(marcas)
    except Exception as e:
        print(f"Error listando marcas: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/marcas', methods=['POST'])
def crear_marca():
    try:
        data = request.get_json()
        marca_id = database.create_marca(data["nombre"], data["expediente"])
        return jsonify({"id": marca_id, "message": "Marca creada exitosamente"})
    except Exception as e:
        print(f"Error creando marca: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Para Vercel con Flask
if __name__ == '__main__':
    app.run(debug=True)
