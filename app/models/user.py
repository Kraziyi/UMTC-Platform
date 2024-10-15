from app import db, login_manager
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta, timezone

class User(UserMixin, db.Model):

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    is_admin = db.Column(db.Boolean, default=False)
    subscription_end = db.Column(db.DateTime)
    histories = db.relationship('History', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_subscribed(self):
        return self.subscription_end and self.subscription_end > datetime.now(timezone.utc)

    def subscribe(self, days=30):
        self.subscription_end = datetime.now(timezone.utc) + timedelta(days=days)

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))