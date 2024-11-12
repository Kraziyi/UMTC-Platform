import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    FRONTEND_URL = os.getenv('FRONTEND_URL')
    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_PORT = os.getenv('MAIL_PORT')
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER')

    # Login Expiration Time: 30 days
    REMEMBER_COOKIE_DURATION = 60 * 60 * 24 * 30

    
    SESSION_PROTECTION = 'strong' 
    SESSION_COOKIE_NAME = 'umtc_session_cookie'
    PERMANENT_SESSION_LIFETIME = timedelta(days=30)  