from dotenv import load_dotenv
import os
from flask import Blueprint, render_template, flash, redirect, url_for
from flask_login import login_required, current_user
from app import db
from app.models import History, User
from app.forms import AdminRegistrationForm


admin = Blueprint('admin', __name__)

@admin.route('/')
@admin.route('/index')
@login_required
def index():
    if not current_user.is_admin:
        flash('You are not an admin', 'danger')
        return redirect(url_for('main.index'))
    return render_template('admin/index.html')

@admin.route('/users')
@login_required
def users():
    if not current_user.is_admin:
        flash('You are not an admin', 'danger')
        return redirect(url_for('main.index'))
    users = User.query.all()
    return render_template('admin/users.html', users=users)

@admin.route('/user/<int:user_id>')
@login_required
def user(user_id):
    if not current_user.is_admin:
        flash('You are not an admin', 'danger')
        return redirect(url_for('main.index'))
    user = User.query.get_or_404(user_id)
    history = History.query.filter_by(user_id=user_id).order_by(History.timestamp.desc()).all()
    return render_template('admin/user.html', user=user, history=history)


@admin.route('/register', methods=['GET', 'POST'])
@login_required
def register():
    if current_user.is_admin:
        flash('You are already an admin', 'info')
        return redirect(url_for('admin.index'))

    form = AdminRegistrationForm()

    if form.validate_on_submit():
        load_dotenv()
        ADMIN_VERIFICATION_CODE = os.getenv('ADMIN_VERIFICATION_CODE')

        if form.verification_code.data == ADMIN_VERIFICATION_CODE:
            current_user.is_admin = True
            db.session.commit()
            flash('Congratulations, you are now an admin!', 'success')
            return redirect(url_for('admin'))
        else:
            flash('Invalid verification code.', 'danger')

    return render_template('admin/register.html', form=form)
