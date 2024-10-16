from flask import Blueprint, render_template, flash, redirect, url_for
from flask_login import login_required, current_user
from datetime import datetime, timezone
from app import db
from app.models import History
from app.forms import CalculationForm


main = Blueprint('main', __name__)

@main.route('/')
@main.route('/index')
def index():
    return render_template('index.html')

@main.route('/dashboard')
@login_required
def dashboard():
    histories = current_user.histories.order_by(History.timestamp.desc()).all()
    return render_template('dashboard.html', histories=histories)

@main.route('/history')
@login_required
def history():
    histories = History.query.order_by(History.timestamp.desc()).all()
    return render_template('history.html', histories=histories)

@main.route('/calculation', methods=['GET', 'POST'])
@login_required
def calculation():
    form = CalculationForm()
    result = None

    # TODO: Implement the real calculation logic here
    if form.validate_on_submit():
        x = form.x.data
        y = form.y.data
        z = form.z.data
        
        result = x * y * z

        history_entry = History(
            user_id=current_user.id,
            input=f'x={x}, y={y}, z={z}',
            output=f'Result={result}',
            timestamp=datetime.now(timezone.utc)
        )
        db.session.add(history_entry)
        db.session.commit()

        flash(f'Calculation completed: {result}')

    return render_template('calculation.html', form=form, result=result)
