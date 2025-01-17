import os
from flask import Blueprint, request, jsonify
from app.utils import save_uploaded_file, validate_python_file, dynamic_router
from app.utils.decorators import admin_required

upload = Blueprint("upload", __name__)

@upload.route("/", methods=["POST"])
@admin_required
def upload_file():
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"success": False, "message": "No selected file"}), 400

    try:
        filepath = save_uploaded_file(file)
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to save file: {str(e)}"}), 500

    valid, functions = validate_python_file(filepath)
    if not valid:
        os.remove(filepath)
        return jsonify({"success": False, "message": "Invalid file or no valid functions"}), 400

    registered_routes = []
    try:
        for func_name, func in functions.items():
            # Dynamically register the function
            dynamic_router.register_function(func_name, func)
            registered_routes.append(f"/api/calculation/{func_name}")
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 500

    return jsonify({"success": True, "routes": registered_routes}), 201


