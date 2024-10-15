from app import db
from datetime import datetime, timezone

class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    input = db.Column(db.Text)
    output = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.now(timezone.utc))
