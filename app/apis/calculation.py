from flask import Blueprint, jsonify, request, Response
from flask_login import login_required, current_user
import json
import inspect
import io
import csv
import gzip
import numpy as np
from app import db
from app.models import History
from app.utils import diffusion_solver, dynamic_router, diffusion_2d_solver, calculate_temperature_influence, diffusion_2d_solver_alt
from app.utils.intepolation import intepolation_cubic, intepolation_linear, intepolation_nearest
from app.utils.decorators import admin_required
from app.utils.history import calculate_history_size
from app.utils.compiled import ecm_calculation
from app.utils.ecm import ecm_interp_solution

calculation = Blueprint('calculation', __name__)

@calculation.route('/diffusion', methods=['POST'])
@login_required
def diffusion():
    data = request.get_json()
    d = data.get('d')
    r = data.get('r')
    ns = data.get('ns')
    temp_influenced = data.get('temp_influenced')
    name = data.get('name')

    if d is None or r is None or ns is None:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        calculation_type = 'diffusion'
        if temp_influenced:
            d = calculate_temperature_influence(d)
            calculation_type = 'diffusion_temp_influenced'
        # Run the diffusion solver function
        rp_disc, cs_iter, loss_value = diffusion_solver(d, r, ns)

        # Convert NumPy arrays to lists for JSON serialization
        rp_disc = rp_disc.tolist()
        cs_iter = cs_iter.tolist()
        
        # Prepare input and output for storage
        input_data = {"d": d, "r": r, "ns": ns}
        output_data = {
            "rp_disc": rp_disc,
            "cs_iter": cs_iter,
            "loss_value": loss_value
        }

        # Calculate size of the history entry
        history_size = calculate_history_size(input_data, output_data)

        # Check if user has enough storage space
        if current_user.storage_used + history_size > current_user.storage_limit:
            return jsonify({"error": "Storage limit exceeded"}), 400

        # Store the input and output in History
        user_id = current_user.id
        default_folder_id = current_user.default_folder_id
        history_entry = History(
            user_id=user_id,
            folder_id=default_folder_id,
            type=calculation_type,
            input=json.dumps(input_data),
            output=json.dumps(output_data),
            name=name if name else None,
            size=history_size
        )
        db.session.add(history_entry)
        
        # Update user's storage usage
        current_user.storage_used += history_size
        db.session.commit()

        # Return the output to the user
        return jsonify({
            "rp_disc": rp_disc,
            "cs_iter": cs_iter,
            "loss_value": loss_value
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

@calculation.route("/<function_name>", methods=["POST"])
@login_required
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
@login_required
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
@admin_required
def list_functions():
    """
    API endpoint to list all uploaded functions.
    """
    try:
        registered_functions = [
            {"endpoint": name, "url": f"/api/calculation/{name}", "visible": visible}
            for name, visible in dynamic_router.function_visibility.items()
        ]
        return jsonify({"success": True, "routes": registered_functions})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@calculation.route('/uploaded/available', methods=['GET'])
@login_required
def list_visible_functions():
    """
    API endpoint to list visible functions for normal users.
    """
    try:
        visible_functions = dynamic_router.get_visible_functions()
        print(visible_functions)
        return jsonify({"success": True, "functions": visible_functions})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@calculation.route('/uploaded/visibility', methods=['PUT'])
@admin_required
def update_function_visibility():
    """
    API endpoint to update the visibility of a specific function.
    """
    try:
        data = request.json
        name = data.get("name")
        visible = data.get("visible")

        if name is None or visible is None:
            return jsonify({"success": False, "error": "Invalid parameters"}), 400

        dynamic_router.update_function_visibility(name, visible)
        return jsonify({"success": True, "message": "Visibility updated successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@calculation.route('/diffusion/batch', methods=['POST'])
@login_required
def batch_diffusion():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Only support csv"}), 400

    try:
        stream = io.StringIO(file.stream.read().decode('UTF-8'))
        reader = csv.DictReader(stream)
        
        required_columns = {'d', 'r', 'ns', 'temp_influenced'}
        if not required_columns.issubset(reader.fieldnames):
            missing = required_columns - set(reader.fieldnames)
            return jsonify({"error": f"missing: {', '.join(missing)}"}), 400

        results = []
        total_size = 0
        history_entries = []

        for row in reader:
            try:
                params = {
                    'd': float(row['d']),
                    'r': float(row['r']),
                    'ns': int(row['ns']),
                    'temp_influenced': row['temp_influenced'].lower() in ['true', '1', 'yes']
                }
            except ValueError as e:
                return jsonify({"error": f"error in line {reader.line_num}: {str(e)}"}), 400

            try:
                calculation_type = 'diffusion'
                if params['temp_influenced']:
                    params['d'] = calculate_temperature_influence(params['d'])
                    calculation_type = 'diffusion_temp_influenced'
                
                # Only use the first 3 parameters
                params = {k: v for k, v in params.items() if k in ['d', 'r', 'ns']}
                rp_disc, cs_iter, loss_value = diffusion_solver(**params)
                
                output_data = {
                    "rp_disc": rp_disc.tolist(),
                    "cs_iter": cs_iter.tolist(),
                    "loss_value": loss_value
                }

                # Calculate size for this entry
                entry_size = calculate_history_size(params, output_data)
                total_size += entry_size

                history_entry = History(
                    user_id=current_user.id,
                    folder_id=current_user.default_folder_id,
                    type=calculation_type,
                    input=json.dumps(params),
                    output=json.dumps(output_data),
                    size=entry_size
                )
                history_entries.append(history_entry)
                
                results.append(output_data)
            except Exception as e:
                db.session.rollback()
                return jsonify({"error": f"error in line {reader.line_num}: {str(e)}"}), 500

        # Check if user has enough storage space for all entries
        if current_user.storage_used + total_size > current_user.storage_limit:
            return jsonify({"error": "Storage limit exceeded"}), 400

        # Add all history entries and update user storage
        for entry in history_entries:
            db.session.add(entry)
        current_user.storage_used += total_size
        db.session.commit()

        return jsonify({"results": results}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error: {str(e)}"}), 500
    

@calculation.route('/diffusion_2d', methods=['POST'])
@login_required
def diffusion_2d():
    data = request.get_json()
    nx = data.get('nx')
    ny = data.get('ny')
    dt = data.get('dt')
    d = data.get('d')
    t_max = data.get('t_max')

    if None in {nx, ny, dt, d, t_max}:
        return jsonify({"error": "Missing required parameters"}), 400

    # try:
    frames, nt, nx, ny = diffusion_2d_solver_alt(nx, ny, dt, d, t_max)

    response_data = {
        "metadata": {"nx": nx, "ny": ny, "timesteps": nt},
        "frames": np.round(frames, decimals=4).tolist()
    }
    
    compressed = gzip.compress(
        json.dumps(response_data, separators=(',', ':')).encode(),
        compresslevel=9
    )
    print(f"size after compression in mb: {len(compressed) / 1024 / 1024}")
    return Response(
        compressed,
        headers={
            # 'Content-Encoding': 'gzip',
            'Content-Type': 'application/json',
            'Content-Length': len(compressed)
        },
        direct_passthrough=True
    ), 200

@calculation.route('/ecm', methods=['POST'])
@login_required
def ecm():
    data = request.get_json()
    t_tot = data.get('t_tot')
    dt = data.get('dt')
    Cn = data.get('Cn')
    SOC_0 = data.get('SOC_0')
    i_app = data.get('i_app')
    name = data.get('name')
    ocv_data = data.get('ocv_data', None)
    intepolation_choice = data.get('intepolation_choice', None)

    if None in {t_tot, dt, Cn, SOC_0, i_app}:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        # Process OCV data
        if ocv_data is not None:
            try:
                # Convert object array to numpy array
                if isinstance(ocv_data, list) and all(isinstance(item, dict) for item in ocv_data):
                    # Convert from [{'x': x1, 'y': y1}, ...] to [[x1, y1], ...]
                    ocv_data = np.array([[item['x'], item['y']] for item in ocv_data])
                else:
                    # Handle other formats
                    ocv_data = np.array(ocv_data)
                
                # Ensure it's a 2D array with 2 columns
                if ocv_data.ndim == 1:
                    ocv_data = ocv_data.reshape(-1, 1)
                elif ocv_data.ndim == 2 and ocv_data.shape[1] != 2:
                    return jsonify({"error": "OCV data must have exactly 2 columns (x and y values)"}), 400
                
                # Sort by x values
                ocv_data = ocv_data[ocv_data[:, 0].argsort()]
                
            except Exception as e:
                return jsonify({"error": f"Invalid OCV data format: {str(e)}"}), 400

        if intepolation_choice not in ['linear', 'cubic', 'nearest']:
            # Prepare input parameters for calculation
            calc_parameters = {
                't_tot': float(t_tot),
                'dt': float(dt),
                'OCV_import': ocv_data if ocv_data is not None else np.array([]),
                'Cn': float(Cn),
                'SOC_0': float(SOC_0),
                'i_app': float(i_app),
            }

            # Run the ECM calculation
            result = ecm_calculation(calc_parameters)
        else:
            result = ecm_interp_solution(
                t_tot=float(t_tot),
                dt=float(dt),
                Cn=float(Cn),
                SOC_0=float(SOC_0),
                i_app=float(i_app),
                intepolation_choice=intepolation_choice,
                OCV_import=ocv_data if ocv_data is not None else np.array([])
            )

        # Extract results
        t_table = result['t_table'].tolist()
        Vt = result['Vt'].tolist()
        SOC_store = result['SOC_store'].tolist()
        OCV_store = result['OCV_store'].tolist()

        # Prepare input and output for storage
        input_data = {
            't_tot': float(t_tot),
            'dt': float(dt),
            'OCV_import': ocv_data.tolist() if ocv_data is not None else [],
            'Cn': float(Cn),
            'SOC_0': float(SOC_0),
            'i_app': float(i_app),
            'intepolation_choice': intepolation_choice
        }
        output_data = {
            "t_table": t_table,
            "Vt": Vt,
            "SOC_store": SOC_store,
            "OCV_store": OCV_store
        }

        # Calculate size of the history entry
        history_size = calculate_history_size(input_data, output_data)

        # Check if user has enough storage space
        if current_user.storage_used + history_size > current_user.storage_limit:
            return jsonify({"error": "Storage limit exceeded"}), 400

        # Store the input and output in History
        user_id = current_user.id
        default_folder_id = current_user.default_folder_id
        history_entry = History(
            user_id=user_id,
            folder_id=default_folder_id,
            type='ecm',
            input=json.dumps(input_data),
            output=json.dumps(output_data),
            name=name if name else None,
            size=history_size
        )
        db.session.add(history_entry)
        
        # Update user's storage usage
        current_user.storage_used += history_size
        db.session.commit()

        # Return the output to the user
        return jsonify({
            "t_table": t_table,
            "Vt": Vt,
            "SOC_store": SOC_store,
            "OCV_store": OCV_store
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500