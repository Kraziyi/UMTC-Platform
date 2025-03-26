from app import db
from datetime import datetime, timezone

class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    folder_id = db.Column(db.Integer, db.ForeignKey('folder.id', name="fk_history_folder"))
    name = db.Column(db.String(255), nullable=True)
    type = db.Column(db.String(255), nullable=True)
    input = db.Column(db.Text)
    output = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.now(timezone.utc))
    size = db.Column(db.Integer, default=0, nullable=True)

    def to_dict(self):
        print(f"calculation_type: {self.type}")
        return {
            'id': self.id,
            'folder_id': self.folder_id,
            'name': self.name,
            'calculation_type': self.type,
            'input': self.input,
            'output': self.output,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'size': self.size
        }