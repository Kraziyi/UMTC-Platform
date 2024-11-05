from dotenv import load_dotenv
import os
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app import db
from app.models import History, User

admin = Blueprint('admin', __name__)

@admin.route('/')
@login_required
def index():
    if not current_user.is_admin:
        return jsonify({"error": "You are not an admin"}), 403
    return jsonify({"message": "Welcome to the admin panel"}), 200

@admin.route('/users')
@login_required
def users():
    if not current_user.is_admin:
        return jsonify({"error": "You are not an admin"}), 403
    
    users = User.query.all()
    user_data = [{"id": user.id, "username": user.username, "email": user.email} for user in users]
    return jsonify({"users": user_data}), 200

@admin.route('/user/<int:user_id>')
@login_required
def user(user_id):
    if not current_user.is_admin:
        return jsonify({"error": "You are not an admin"}), 403

    user = User.query.get_or_404(user_id)
    history = History.query.filter_by(user_id=user_id).order_by(History.timestamp.desc()).all()
    history_data = [{
        'input': h.input,
        'output': h.output,
        'timestamp': h.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    } for h in history]
    user_data = {"id": user.id, "username": user.username, "email": user.email}

    return jsonify({"user": user_data, "history": history_data}), 200

@admin.route('/register', methods=['POST'])
@login_required
def register():
    if current_user.is_admin:
        return jsonify({"message": "You are already an admin"}), 200

    load_dotenv()
    ADMIN_VERIFICATION_CODE = os.getenv('ADMIN_VERIFICATION_CODE')
    
    data = request.get_json()
    verification_code = data.get('verification_code')

    if verification_code == ADMIN_VERIFICATION_CODE:
        current_user.is_admin = True
        db.session.commit()
        return jsonify({"message": "Congratulations, you are now an admin!"}), 200
    else:
        return jsonify({"error": "Invalid verification code"}), 400
