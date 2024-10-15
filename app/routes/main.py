from flask import Blueprint, render_template, flash, redirect, url_for
from flask_login import login_required, current_user
from app.models import User, History


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

@main.route('/admin')
@login_required
def admin():
    if not current_user.is_admin:
        flash('You do not have permission to access the admin page.')
        return redirect(url_for('main.index'))
    users = User.query.all()
    return render_template('admin.html', users=users)