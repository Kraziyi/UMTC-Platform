from functools import wraps
from flask import abort
from flask_login import current_user

def admin_required(f):
    """
    Decorator that checks if the current user is an admin.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            abort(401) # Unauthorized if not logged in
        if not current_user.is_admin:
            abort(403)  # Forbidden if not admin
        return f(*args, **kwargs)
    return decorated_function
