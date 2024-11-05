from email_validator import validate_email, EmailNotValidError
from password_validator import PasswordValidator
from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from app import db, login_manager
from app.models import User
from datetime import datetime, timedelta, timezone

user = Blueprint('user', __name__)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@user.route('/login', methods=['POST'])
def login():
    if current_user.is_authenticated:
        return jsonify({"message": "Already logged in"}), 200
    
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    remember_me = data.get('remember_me', False)

    user = User.query.filter_by(username=username).first()
    if user is None or not user.check_password(password):
        return jsonify({"error": "Invalid username or password"}), 401

    login_user(user, remember=remember_me)
    print(f"User {current_user.username} logged in")
    return jsonify({"message": "Logged in successfully"}), 200

@user.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@user.route('/register', methods=['POST'])
def register():
    if current_user.is_authenticated:
        return jsonify({"error": "Already logged in"}), 400

    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Validate email
    try:
        validate_email(email)
    except EmailNotValidError as e:
        return jsonify({"error": "Invalid email"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400
    
    # Validate password
    password_validator = PasswordValidator()
    password_validator\
        .min(6)\
        .max(20)\
        .has().letters()\
        .has().digits()\
        .has().no().spaces()
    if not password_validator.validate(password):
        return jsonify({"error": "Invalid password, at least 6 characters, both letters and digits, no spaces"}), 400
    
    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Registration successful"}), 201

@user.route('/subscription', methods=['POST'])
@login_required
def subscription():
    data = request.get_json()
    subscription_period = data.get('subscription_period')
    auto_renew = data.get('auto_renew', False)  # Handle auto-renew as needed

    if current_user.is_subscribed():
        current_subscription_end = current_user.subscription_end
        flash_message = f"You are already subscribed until {current_subscription_end.strftime('%Y-%m-%d')}. Subscription extended."
        subscription_start = current_subscription_end
    else:
        subscription_start = datetime.now(timezone.utc)
        flash_message = "Subscription started."

    # Set subscription period
    if subscription_period == '1month':
        subscription_extension = timedelta(days=30)
    elif subscription_period == '3months':
        subscription_extension = timedelta(days=90)
    elif subscription_period == '1year':
        subscription_extension = timedelta(days=365)
    else:
        return jsonify({"error": "Invalid subscription period"}), 400

    current_user.subscription_end = subscription_start + subscription_extension
    db.session.commit()

    return jsonify({"message": flash_message, "subscription_end": current_user.subscription_end.isoformat()}), 200


# @auth.route('/cancel_subscription', methods=['POST'])
# @login_required
# def cancel_subscription():
#     # TODO: Implement subscription cancellation logic here, disable auto-renewal
    
#     db.session.commit()
#     flash('Your subscription has been cancelled.', 'info')
#     return redirect(url_for('main.index'))

# @auth.route('/forgot_password', methods=['GET', 'POST'])
# def forgot_password():
#     form = ForgotPasswordForm()
#     if form.validate_on_submit():
#         user = User.query.filter_by(email=form.email.data).first()
#         if user:
#             # TODO: Implement email sending verification code logic here
#             flash('An email has been sent with instructions to reset your password.', 'info')

#             # TODO: If verification code is correct, redirect to reset_password page
#             return redirect(url_for('auth.reset_password'))
#         else:
#             flash('Email not found.', 'danger')
#     return render_template('forgot_password.html', form=form)


@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Unauthorized access"}), 401

@user.route('/info/current/username', methods=['GET'])
@login_required
def get_username():
    return jsonify({"username": current_user.username}), 200

@user.route('info/current', methods=['GET'])
@login_required
def get_user_info():
    return jsonify({
        "username": current_user.username,
        "email": current_user.email,
        "subscription_end": current_user.subscription_end.isoformat() if current_user.is_subscribed() else None
    })



