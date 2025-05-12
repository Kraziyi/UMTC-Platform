from flask import Blueprint, jsonify, request, Response
import json
import io
import csv
import gzip
import numpy as np
from app.utils import diffusion_solver, diffusion_2d_solver, calculate_temperature_influence, diffusion_2d_solver_alt
from app.utils.ecm import ecm_interp_solution

calculation = Blueprint('calculation', __name__)

@calculation.route('/diffusion', methods=['POST'])
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
        if temp_influenced:
            d = calculate_temperature_influence(d)
        # Run the diffusion solver function
        rp_disc, cs_iter, loss_value = diffusion_solver(d, r, ns)

        # Convert NumPy arrays to lists for JSON serialization
        rp_disc = rp_disc.tolist()
        cs_iter = cs_iter.tolist()
        
        # Return the output to the user
        return jsonify({
            "rp_disc": rp_disc,
            "cs_iter": cs_iter,
            "loss_value": loss_value
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@calculation.route('/diffusion/batch', methods=['POST'])
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
                if params['temp_influenced']:
                    params['d'] = calculate_temperature_influence(params['d'])
                
                # Only use the first 3 parameters
                params = {k: v for k, v in params.items() if k in ['d', 'r', 'ns']}
                rp_disc, cs_iter, loss_value = diffusion_solver(**params)
                
                output_data = {
                    "rp_disc": rp_disc.tolist(),
                    "cs_iter": cs_iter.tolist(),
                    "loss_value": loss_value
                }
                
                results.append(output_data)
            except Exception as e:
                return jsonify({"error": f"error in line {reader.line_num}: {str(e)}"}), 500

        return jsonify({"results": results}), 200

    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500
    

@calculation.route('/diffusion_2d', methods=['POST'])
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

        # Return the output to the user
        return jsonify({
            "t_table": t_table,
            "Vt": Vt,
            "SOC_store": SOC_store,
            "OCV_store": OCV_store
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500