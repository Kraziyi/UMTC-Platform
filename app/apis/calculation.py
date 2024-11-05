
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
import json
from app import db
from app.models import History
from app.utils import diffusion_solver


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