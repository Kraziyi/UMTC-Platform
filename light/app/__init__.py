from flask import Flask
from config import Config
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    # Load configurations
    app.config.from_object(Config)

    # Set session lifetime
    app.permanent_session_lifetime = Config.REMEMBER_COOKIE_DURATION

    # Register Blueprints
    from app.apis import calculation
    app.register_blueprint(calculation, url_prefix="/api/calculation")

    return app