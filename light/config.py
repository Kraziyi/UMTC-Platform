import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')

    FRONTEND_URL = os.getenv('FRONTEND_URL')

    # Login Expiration Time: 30 days
    REMEMBER_COOKIE_DURATION = 60 * 60 * 24 * 30
    SESSION_PROTECTION = 'strong' 
    SESSION_COOKIE_NAME = 'umtc_session_cookie'
    PERMANENT_SESSION_LIFETIME = timedelta(days=30)  