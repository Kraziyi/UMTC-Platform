import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from config import Config
from flask_cors import CORS
from flask_mail import Mail

db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = "user.login"
mail = Mail()

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    # Load configurations
    app.config.from_object(Config)
    app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, "uploaded_scripts")

    # Ensure upload folder exists
    if not os.path.exists(app.config["UPLOAD_FOLDER"]):
        os.makedirs(app.config["UPLOAD_FOLDER"])

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    Migrate(app, db)
    mail.init_app(app)

    # Set session lifetime
    app.permanent_session_lifetime = Config.REMEMBER_COOKIE_DURATION

    # Register Blueprints
    from app.apis import user, history, admin, calculation, upload
    app.register_blueprint(user, url_prefix="/api/user")
    app.register_blueprint(history, url_prefix="/api/history")
    app.register_blueprint(admin, url_prefix="/api/admin")
    app.register_blueprint(calculation, url_prefix="/api/calculation")
    app.register_blueprint(upload, url_prefix="/api/upload")

    return app