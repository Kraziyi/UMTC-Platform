from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app import db
from app.models import History



history = Blueprint('history', __name__)


@history.route('/')
@login_required
def index():
    history = History.query.filter_by(user_id=current_user.id).order_by(History.timestamp.desc()).all()
    return jsonify([{
        'input': h.input,
        'output': h.output,
        'timestamp': h.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    } for h in history])

