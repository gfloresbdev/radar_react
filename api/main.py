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
            # Asegurar que mis_marcas sea una lista de enteros
            mis_marcas = user[3] if user[3] else []
            print(f"Usuario logueado: {user[1]}, marcas: {mis_marcas}, tipo: {type(mis_marcas)}")
            
            return jsonify({
                "id": user[0], 
                "username": user[1], 
                "misMarcas": mis_marcas
            })
        else:
            return jsonify({"error": "Credenciales incorrectas"}), 401
    except Exception as e:
        print(f"Error en login: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/marcas', methods=['GET'])
def listar_marcas():
    try:
        marcas = database.list_marcas()
        return jsonify(marcas)
    except Exception as e:
        print(f"Error listando marcas: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/marcas', methods=['POST'])
def crear_marca():
    try:
        data = request.get_json()
        marca_id = database.create_marca(
            nombre=data["nombre"],
            expediente=data["expediente"],
            clase=data.get("clase", ""),
            descripcion=data.get("descripcion", ""),
            fecha_solicitud=data.get("fechaSolicitud", ""),
            nombre_propietario=data.get("nombrePropietario", ""),
            estado=data.get("estado", "")
        )
        return jsonify({"id": marca_id, "message": "Marca creada exitosamente"})
    except Exception as e:
        print(f"Error creando marca: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/marcas/buscar', methods=['GET'])
def buscar_marcas():
    try:
        nombre = request.args.get('nombre', '')
        expediente = request.args.get('expediente', '')
        titular = request.args.get('titular', '')
        
        marcas = database.list_marcas()
        
        # Filtrar según el parámetro de búsqueda
        resultados = []
        for marca in marcas:
            if nombre and nombre.lower() in marca['nombre'].lower():
                resultados.append(marca)
            elif expediente and expediente in marca['expediente']:
                resultados.append(marca)
            elif titular and titular.lower() in marca['nombrePropietario'].lower():
                resultados.append(marca)
                
        return jsonify(resultados)
    except Exception as e:
        print(f"Error buscando marcas: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/marcas/<expediente>', methods=['GET'])
def obtener_marca_por_expediente(expediente):
    try:
        marcas = database.list_marcas()
        marca = next((m for m in marcas if m['expediente'] == expediente), None)
        
        if marca:
            return jsonify(marca)
        else:
            return jsonify({"error": "Marca no encontrada"}), 404
    except Exception as e:
        print(f"Error obteniendo marca: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/usuarios/<username>', methods=['GET'])
def obtener_usuario(username):
    try:
        user = database.get_user(username)
        if user:
            mis_marcas = user[3] if user[3] else []
            print(f"Obteniendo usuario: {username}, marcas: {mis_marcas}")
            
            return jsonify({
                "id": user[0], 
                "username": user[1], 
                "misMarcas": mis_marcas
            })
        else:
            return jsonify({"error": "Usuario no encontrado"}), 404
    except Exception as e:
        print(f"Error obteniendo usuario: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/usuarios/<username>/marcas', methods=['POST'])
def agregar_marca_usuario(username):
    try:
        data = request.get_json()
        marca_id = data.get('marcaId')
        
        print(f"Agregando marca {marca_id} al usuario {username}")
        
        if not marca_id:
            return jsonify({"error": "marcaId es requerido"}), 400
        
        # Agregar la marca al usuario
        user = database.agregar_marca_a_usuario(username, marca_id)
        
        if user:
            mis_marcas = user[3] if user[3] else []
            print(f"Usuario actualizado - marcas: {mis_marcas}")
            
            return jsonify({
                "id": user[0], 
                "username": user[1], 
                "misMarcas": mis_marcas
            })
        else:
            return jsonify({"error": "Usuario no encontrado"}), 404
    except Exception as e:
        print(f"Error agregando marca a usuario: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/usuarios/<username>/marcas', methods=['DELETE'])
def remover_marca_usuario(username):
    try:
        data = request.get_json()
        marca_id = data.get('marcaId')
        
        print(f"Removiendo marca {marca_id} del usuario {username}")
        
        if not marca_id:
            return jsonify({"error": "marcaId es requerido"}), 400
        
        # Remover la marca del usuario
        user = database.remover_marca_de_usuario(username, marca_id)
        
        if user:
            mis_marcas = user[3] if user[3] else []
            print(f"Usuario actualizado - marcas restantes: {mis_marcas}")
            
            return jsonify({
                "id": user[0], 
                "username": user[1], 
                "misMarcas": mis_marcas
            })
        else:
            return jsonify({"error": "Usuario no encontrado"}), 404
    except Exception as e:
        print(f"Error removiendo marca de usuario: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/similitudes', methods=['GET'])
def obtener_similitudes():
    try:
        # Obtener parámetros opcionales
        username = request.args.get('username')
        porcentaje_minimo = float(request.args.get('porcentaje_minimo', 0.0))
        
        if not username:
            return jsonify({"error": "Username es requerido"}), 400
        
        # Obtener similitudes del usuario
        similitudes = database.obtener_similitudes_usuario(username, porcentaje_minimo)
        return jsonify(similitudes)
        
    except Exception as e:
        print(f"Error obteniendo similitudes: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/similitudes/detectar', methods=['POST'])
def detectar_similitudes():
    """Detectar y guardar similitudes para las marcas seguidas por un usuario"""
    try:
        data = request.get_json()
        username = data.get('username')
        
        if not username:
            return jsonify({"error": "Username es requerido"}), 400
        
        # Obtener usuario y sus marcas seguidas
        user = database.get_user(username)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        marcas_seguidas = user[3] if user[3] else []  # mis_marcas está en la posición 3
        
        if not marcas_seguidas:
            return jsonify({"message": "Usuario no tiene marcas seguidas"}), 200
        
        # Obtener todas las marcas para comparar
        todas_las_marcas = database.list_marcas()
        
        similitudes_detectadas = 0
        
        for marca_seguida_id in marcas_seguidas:
            for marca in todas_las_marcas:
                # No comparar una marca consigo misma
                if marca['id'] == marca_seguida_id:
                    continue
                
                # Calcular similitud
                porcentaje = database.calcular_similitud_marcas(marca_seguida_id, marca['id'])
                
                # Solo guardar si la similitud es significativa (>= 20%)
                if porcentaje >= 20.0:
                    database.crear_similitud(marca_seguida_id, marca['id'], porcentaje)
                    similitudes_detectadas += 1
        
        return jsonify({
            "message": f"Detección completada. {similitudes_detectadas} similitudes encontradas.",
            "similitudes_detectadas": similitudes_detectadas
        })
        
    except Exception as e:
        print(f"Error detectando similitudes: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/similitudes/<int:similitud_id>', methods=['DELETE'])
def eliminar_similitud(similitud_id):
    """Desactivar una similitud específica"""
    try:
        success = database.desactivar_similitud(similitud_id)
        
        if success:
            return jsonify({"message": "Similitud desactivada correctamente"})
        else:
            return jsonify({"error": "Similitud no encontrada"}), 404
            
    except Exception as e:
        print(f"Error eliminando similitud: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Para Vercel con Flask
if __name__ == '__main__':
    app.run(debug=True)
