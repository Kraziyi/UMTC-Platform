from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from config import Config
from flask_cors import CORS

db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'user.login'

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)
    Migrate(app, db)

    app.permanent_session_lifetime = Config.REMEMBER_COOKIE_DURATION

    from app.apis import user, history, admin, calculation
    app.register_blueprint(user, url_prefix='/api/user')
    app.register_blueprint(history, url_prefix='/api/history')
    app.register_blueprint(admin, url_prefix='/api/admin')
    app.register_blueprint(calculation, url_prefix='/api/calculation')

    return app