from app import db, login_manager
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta, timezone
from app.models.folder import Folder

class User(UserMixin, db.Model):

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(512))
    is_admin = db.Column(db.Boolean, default=False)
    subscription_end = db.Column(db.DateTime(timezone=True), nullable=True)
    histories = db.relationship('History', backref='user', lazy='dynamic')
    folders = db.relationship('Folder', backref='user', lazy='dynamic', foreign_keys=[Folder.user_id])
    storage_used = db.Column(db.Integer, default=0)
    storage_limit = db.Column(db.Integer, default=1000000000) # 1 GB
    default_folder_id = db.Column(db.Integer, db.ForeignKey('folder.id'))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, salt_length=16)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_subscribed(self):
        if self.is_admin:
            return True
        # Set subscription_end to utc timezone
        if self.subscription_end is not None and self.subscription_end.tzinfo is None:
            self.subscription_end = self.subscription_end.replace(tzinfo=timezone.utc)
        return self.subscription_end is not None and self.subscription_end > datetime.now(timezone.utc)

    def subscribe(self, days=30):
        if self.subscription_end is None or self.subscription_end < datetime.now(timezone.utc):
            self.subscription_end = datetime.now(timezone.utc) + timedelta(days=days)
        else:
            self.subscription_end += timedelta(days=days)

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))