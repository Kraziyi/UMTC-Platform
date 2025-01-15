
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
import json
import inspect
from app import db
from app.models import History
from app.utils import diffusion_solver, dynamic_router

calculation = Blueprint('calculation', __name__)

@calculation.route('/diffusion', methods=['POST'])
@login_required
def diffusion():
    data = request.get_json()
    d = data.get('d')
    r = data.get('r')
    ns = data.get('ns')

    if d is None or r is None or ns is None:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        # Run the diffusion solver function
        rp_disc, cs_iter, loss_value = diffusion_solver(d, r, ns)

        # Convert NumPy arrays to lists for JSON serialization
        rp_disc = rp_disc.tolist()
        cs_iter = cs_iter.tolist()

        
        # Prepare input and output for storage
        input_data = json.dumps({"d": d, "r": r, "ns": ns})
        output_data = json.dumps({
            "rp_disc": rp_disc,
            "cs_iter": cs_iter,
            "loss_value": loss_value
        })

        # Store the input and output in History
        user_id = current_user.id
        history_entry = History(
            user_id=user_id,
            input=input_data,
            output=output_data
        )
        db.session.add(history_entry)
        db.session.commit()

        # Return the output to the user
        return jsonify({
            "rp_disc": rp_disc,
            "cs_iter": cs_iter,
            "loss_value": loss_value
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@calculation.route("/<function_name>", methods=["POST"])
def call_dynamic_function(function_name):
    """
    Call a dynamically registered function by name.
    """
    data = request.json or {}
    try:
        converted_data = {k: float(v) for k, v in data.items()}
    except ValueError as e:
        return jsonify({"success": False, "error": "Invalid input. Parameters must be numeric."}), 400
    try:
        result = dynamic_router.call_function(function_name, **converted_data)
        return jsonify({"success": True, "result": result})
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 404
    except Exception as e:
        return jsonify({"success": False, "error": f"Function error: {str(e)}"}), 500


@calculation.route("/describe/<function_name>", methods=["GET"])
def describe_function(function_name):
    """
    Get the parameter details of a registered function.
    """
    try:
        if function_name not in dynamic_router.registered_functions:
            return jsonify({"success": False, "error": f"Function {function_name} is not registered."}), 404

        func = dynamic_router.registered_functions[function_name]
        
        sig = inspect.signature(func)
        params = [
            {"name": param_name, "default": param.default if param.default != inspect.Parameter.empty else None}
            for param_name, param in sig.parameters.items()
        ]
        
        return jsonify({"success": True, "parameters": params})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@calculation.route('/uploaded', methods=['GET'])
def list_functions():
    """
    API endpoint to list all uploaded functions.
    """
    try:
        registered_functions = [
            {"endpoint": name, "url": f"/api/calculation/{name}"}
            for name in dynamic_router.registered_functions.keys()
        ]
        return jsonify({"success": True, "routes": registered_functions})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500